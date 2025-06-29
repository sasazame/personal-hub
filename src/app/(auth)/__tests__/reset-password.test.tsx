import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import ResetPasswordPage from '@/app/reset-password/page';
import { authAPI } from '@/services/auth';

jest.mock('@/services/auth');
jest.mock('@/hooks/useToast');

const mockRouter = {
  push: jest.fn(),
};

const mockSearchParams = {
  get: jest.fn(),
};

const mockToast = {
  showSuccess: jest.fn(),
  showError: jest.fn(),
};

jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  useSearchParams: () => mockSearchParams,
}));

jest.mock('@/hooks/useToast', () => ({
  useToast: () => mockToast,
}));

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock('@/components/ui/LanguageSwitcher', () => ({
  LanguageSwitcher: () => <div data-testid="language-switcher">Language Switcher</div>,
}));

describe('ResetPasswordPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading state while validating token', () => {
    mockSearchParams.get.mockReturnValue('valid-token');
    (authAPI.validateResetToken as jest.Mock).mockReturnValue(new Promise(() => {}));

    render(<ResetPasswordPage />);

    expect(screen.getByText('auth.validatingToken')).toBeInTheDocument();
  });

  it('shows error when no token is provided', async () => {
    mockSearchParams.get.mockReturnValue(null);

    render(<ResetPasswordPage />);

    await waitFor(() => {
      const elements = screen.getAllByText('auth.invalidResetLink');
      expect(elements.length).toBeGreaterThan(0);
    });
  });

  it('shows error when token validation fails', async () => {
    mockSearchParams.get.mockReturnValue('invalid-token');
    (authAPI.validateResetToken as jest.Mock).mockRejectedValue(
      new Error('Invalid or expired token')
    );

    render(<ResetPasswordPage />);

    await waitFor(() => {
      const elements = screen.getAllByText('auth.invalidResetLink');
      expect(elements.length).toBeGreaterThan(0);
      expect(screen.getByText('Invalid or expired token')).toBeInTheDocument();
    });
  });

  it('shows reset password form when token is valid', async () => {
    mockSearchParams.get.mockReturnValue('valid-token');
    (authAPI.validateResetToken as jest.Mock).mockResolvedValue({
      success: true,
      message: 'Token is valid',
    });

    render(<ResetPasswordPage />);

    await waitFor(() => {
      expect(screen.getByText('auth.setNewPassword')).toBeInTheDocument();
      expect(screen.getByText('auth.setNewPasswordDescription')).toBeInTheDocument();
    });
  });

  it('submits password reset successfully', async () => {
    mockSearchParams.get.mockReturnValue('valid-token');
    (authAPI.validateResetToken as jest.Mock).mockResolvedValue({
      success: true,
      message: 'Token is valid',
    });
    (authAPI.resetPassword as jest.Mock).mockResolvedValue({
      success: true,
      message: 'Password has been successfully reset',
    });

    render(<ResetPasswordPage />);

    await waitFor(() => {
      expect(screen.getByText('auth.setNewPassword')).toBeInTheDocument();
    });

    const newPasswordInput = screen.getByLabelText('auth.newPassword');
    const confirmPasswordInput = screen.getByLabelText('auth.confirmPassword');
    const submitButton = screen.getByRole('button', { name: /auth.resetPassword/i });

    fireEvent.change(newPasswordInput, { target: { value: 'NewPassword123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'NewPassword123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(authAPI.resetPassword).toHaveBeenCalledWith('valid-token', 'NewPassword123');
      expect(mockToast.showSuccess).toHaveBeenCalledWith('auth.passwordResetSuccess');
      expect(screen.getByText('auth.passwordResetSuccess')).toBeInTheDocument();
    });

    // Check if redirect is scheduled
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/login');
    }, { timeout: 3500 });
  });

  it('shows error when password reset fails', async () => {
    mockSearchParams.get.mockReturnValue('valid-token');
    (authAPI.validateResetToken as jest.Mock).mockResolvedValue({
      success: true,
      message: 'Token is valid',
    });
    (authAPI.resetPassword as jest.Mock).mockRejectedValue(
      new Error('Failed to reset password')
    );

    render(<ResetPasswordPage />);

    await waitFor(() => {
      expect(screen.getByText('auth.setNewPassword')).toBeInTheDocument();
    });

    const newPasswordInput = screen.getByLabelText('auth.newPassword');
    const confirmPasswordInput = screen.getByLabelText('auth.confirmPassword');
    const submitButton = screen.getByRole('button', { name: /auth.resetPassword/i });

    fireEvent.change(newPasswordInput, { target: { value: 'NewPassword123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'NewPassword123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockToast.showError).toHaveBeenCalledWith('Failed to reset password');
    });
  });
});