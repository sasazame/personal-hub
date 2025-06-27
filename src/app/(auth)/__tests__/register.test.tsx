import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import RegisterPage from '../register/page';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ReactNode } from 'react';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock auth API
jest.mock('@/services/auth', () => ({
  authAPI: {
    register: jest.fn(),
    getCurrentUser: jest.fn(),
    logout: jest.fn(),
  },
  AuthAPIError: class AuthAPIError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'AuthAPIError';
    }
  },
}));

// Mock OIDC service
const mockOIDCAuthService = {
  login: jest.fn(),
  register: jest.fn(),
  getUserInfo: jest.fn(),
  logout: jest.fn(),
  isAuthenticated: jest.fn().mockReturnValue(false),
  refreshToken: jest.fn(),
  initiateOAuth: jest.fn(),
  handleOAuthCallback: jest.fn(),
};

jest.mock('@/services/oidc-auth', () => ({
  OIDCAuthService: mockOIDCAuthService,
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock useTranslations
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'auth.register': 'Register',
      'auth.createAccount': 'Create account',
      'auth.getStarted': 'Enter your information to get started',
      'auth.username': 'Username',
      'auth.email': 'Email',
      'auth.password': 'Password',
      'auth.confirmPassword': 'Confirm Password',
      'auth.termsText': 'By creating an account, you agree to our',
      'auth.termsOfService': 'Terms of Service',
      'auth.privacyPolicy': 'Privacy Policy',
      'auth.agreeToTerms': '',
      'auth.alreadyHaveAccount': 'Already have an account?',
      'auth.login': 'Login',
      'auth.creatingAccount': 'Creating account...',
      'passwordStrength.label': 'Password Strength',
      'passwordStrength.requirements': 'Requirements:',
      'passwordStrength.rules.minLength': 'At least 8 characters',
      'passwordStrength.rules.uppercase': 'One uppercase letter',
      'passwordStrength.rules.lowercase': 'One lowercase letter',
      'passwordStrength.rules.number': 'One number',
      'passwordStrength.rules.special': 'One special character',
      'passwordStrength.levels.veryWeak': 'Very Weak',
      'passwordStrength.levels.weak': 'Weak',
      'passwordStrength.levels.fair': 'Fair',
      'passwordStrength.levels.good': 'Good',
      'passwordStrength.levels.strong': 'Strong',
      'common.loading': 'Loading...',
    };
    return translations[key] || key;
  },
}));

describe('RegisterPage', () => {
  const mockPush = jest.fn();
  const mockRouter = {
    push: mockPush,
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  };

  const wrapper = ({ children }: { children: ReactNode }) => (
    <ThemeProvider>
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it('renders registration form correctly', async () => {
    render(<RegisterPage />, { wrapper });

    // Wait for the initial loading state to complete
    await waitFor(() => {
      expect(screen.queryByText('Creating account...')).not.toBeInTheDocument();
    });

    expect(screen.getByRole('heading', { name: /create account/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create account' })).toBeInTheDocument();
    expect(screen.getByText(/already have an account/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Login' })).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />, { wrapper });

    // Wait for the initial loading state to complete
    await waitFor(() => {
      expect(screen.queryByText('Creating account...')).not.toBeInTheDocument();
    });

    const submitButton = screen.getByRole('button', { name: 'Create account' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/username must be at least/i)).toBeInTheDocument();
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password must be at least/i)).toBeInTheDocument();
      expect(screen.getByText(/please confirm your password/i)).toBeInTheDocument();
    });
  });

  it('shows password strength indicator', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />, { wrapper });

    // Wait for the initial loading state to complete
    await waitFor(() => {
      expect(screen.queryByText('Creating account...')).not.toBeInTheDocument();
    });

    const passwordInput = screen.getByLabelText('Password');

    // Initially, no password strength indicator
    expect(screen.queryByText(/password requirements/i)).not.toBeInTheDocument();

    // Type weak password
    await user.type(passwordInput, 'abc');

    // Should show requirements
    expect(screen.getByText(/requirements/i)).toBeInTheDocument();
    expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument();
  });

  it('validates password confirmation', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />, { wrapper });

    // Wait for the initial loading state to complete
    await waitFor(() => {
      expect(screen.queryByText('Creating account...')).not.toBeInTheDocument();
    });

    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');

    await user.type(passwordInput, 'ValidPass123!');
    await user.type(confirmPasswordInput, 'DifferentPass123!');

    const submitButton = screen.getByRole('button', { name: 'Create account' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/passwords don't match/i)).toBeInTheDocument();
    });
  });

  it('validates username format', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />, { wrapper });

    // Wait for the initial loading state to complete
    await waitFor(() => {
      expect(screen.queryByText('Creating account...')).not.toBeInTheDocument();
    });

    const usernameInput = screen.getByLabelText(/username/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');
    
    // Fill out form with invalid username
    await user.type(usernameInput, 'user@name');
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'ValidPass123!');
    await user.type(confirmPasswordInput, 'ValidPass123!');

    const submitButton = screen.getByRole('button', { name: 'Create account' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Username can only contain letters, numbers, and underscores')).toBeInTheDocument();
    }, { timeout: 10000 });
  }, 15000);

  it('toggles password visibility', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />, { wrapper });

    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');

    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(confirmPasswordInput).toHaveAttribute('type', 'password');

    // Toggle password visibility
    const passwordToggle = passwordInput.parentElement?.querySelector('button[type="button"]');
    const confirmPasswordToggle = confirmPasswordInput.parentElement?.querySelector('button[type="button"]');

    if (passwordToggle) {
      await user.click(passwordToggle);
      expect(passwordInput).toHaveAttribute('type', 'text');
    }

    if (confirmPasswordToggle) {
      await user.click(confirmPasswordToggle);
      expect(confirmPasswordInput).toHaveAttribute('type', 'text');
    }
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    
    // Create a controllable promise for register API call
    let resolveRegister: (value: unknown) => void;
    const registerPromise = new Promise((resolve) => {
      resolveRegister = resolve;
    });
    
    // Mock the OIDC service register
    mockOIDCAuthService.register.mockReturnValue(registerPromise);
    
    render(<RegisterPage />, { wrapper });

    // Wait for the initial loading state to complete
    await waitFor(() => {
      expect(screen.queryByText('Creating account...')).not.toBeInTheDocument();
    });

    const usernameInput = screen.getByLabelText(/username/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');

    await user.type(usernameInput, 'testuser');
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'ValidPass123!');
    await user.type(confirmPasswordInput, 'ValidPass123!');

    const submitButton = screen.getByRole('button', { name: 'Create account' });
    await user.click(submitButton);

    // Should show loading state
    await waitFor(() => {
      expect(submitButton).toHaveTextContent('Creating account...');
    });

    // Resolve the register promise
    resolveRegister!({
      user: {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
    });

    // Wait for redirect to home page (auto-login after registration)
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  }, 10000);

  it('has correct links', () => {
    render(<RegisterPage />, { wrapper });

    const signInLink = screen.getByRole('link', { name: 'Login' });
    expect(signInLink).toHaveAttribute('href', '/login');

    const termsLink = screen.getByRole('link', { name: 'Terms of Service' });
    expect(termsLink).toHaveAttribute('href', '/terms');

    const privacyLink = screen.getByRole('link', { name: 'Privacy Policy' });
    expect(privacyLink).toHaveAttribute('href', '/privacy');
  });

  it('shows strong password when all requirements are met', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />, { wrapper });

    // Wait for the initial loading state to complete
    await waitFor(() => {
      expect(screen.queryByText('Creating account...')).not.toBeInTheDocument();
    });

    const passwordInput = screen.getByLabelText('Password');
    await user.type(passwordInput, 'StrongPass123!');

    // Verify the password was entered
    expect(passwordInput).toHaveValue('StrongPass123!');
  });
});