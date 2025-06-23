import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import ProfilePage from '../page';
import { userApi } from '@/services/user';
import { useAuth } from '@/hooks/useAuth';
import { showSuccess, showError } from '@/components/ui/toast';

jest.mock('@/services/user');
jest.mock('@/components/ui/toast');
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock AuthGuard to render children directly
jest.mock('@/components/auth', () => ({
  AuthGuard: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock Header component
jest.mock('@/components/layout', () => ({
  Header: () => <div>Mock Header</div>,
}));

// Mock useAuth hooks
jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn(),
  useLogout: jest.fn(() => ({
    logout: jest.fn(),
    isLoading: false,
  })),
}));

// Mock useTranslations to return actual strings
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'profile.title': 'プロフィール',
      'profile.personalInfo': '個人情報',
      'profile.accountSettings': 'アカウント設定',
      'profile.changePassword': 'パスワードを変更',
      'profile.currentPassword': '現在のパスワード',
      'profile.newPassword': '新しいパスワード',
      'profile.confirmNewPassword': '新しいパスワード（確認）',
      'profile.updateProfile': 'プロフィール更新',
      'profile.profileUpdated': 'Profile updated successfully!',
      'profile.passwordChanged': 'Password changed successfully!',
      'profile.deleteAccount': 'アカウントを削除',
      'profile.confirmAccountDelete': '本当にアカウントを削除しますか？この操作は取り消せません。',
      'profile.editProfile': 'プロフィールを編集',
      'profile.dangerZone': '危険な操作',
      'profile.accountDeleted': 'Account deleted successfully',
      'auth.username': 'ユーザー名',
      'auth.email': 'メールアドレス',
      'todo.createdAt': '作成日',
      'common.edit': '編集',
      'common.cancel': 'キャンセル',
      'common.save': '変更',
      'common.back': '戻る',
      'errors.general': 'An error occurred',
    };
    return translations[key] || key;
  },
}));

const mockUser = {
  id: '1',
  username: 'testuser',
  email: 'test@example.com',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

function renderWithQuery(component: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
}

describe('ProfilePage', () => {
  const mockPush = jest.fn();
  const mockLogout = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      logout: mockLogout,
    });
    (userApi.getById as jest.Mock).mockResolvedValue(mockUser);
  });

  it('displays user information', async () => {
    renderWithQuery(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText('プロフィール')).toBeInTheDocument();
      expect(screen.getByText(mockUser.username)).toBeInTheDocument();
      expect(screen.getByText(mockUser.email)).toBeInTheDocument();
    });
  });

  it('opens edit profile modal when edit button is clicked', async () => {
    const user = userEvent.setup();
    renderWithQuery(<ProfilePage />);

    const editButton = await screen.findByText('編集');
    await user.click(editButton);

    expect(screen.getByText('プロフィールを編集')).toBeInTheDocument();
    expect(screen.getByLabelText('ユーザー名')).toHaveValue(mockUser.username);
    expect(screen.getByLabelText('メールアドレス')).toHaveValue(mockUser.email);
  });

  it('updates profile successfully', async () => {
    const user = userEvent.setup();
    const updatedUser = { ...mockUser, username: 'newusername' };
    (userApi.update as jest.Mock).mockResolvedValue(updatedUser);

    renderWithQuery(<ProfilePage />);

    const editButton = await screen.findByText('編集');
    await user.click(editButton);

    const usernameInput = screen.getByLabelText('ユーザー名');
    await user.clear(usernameInput);
    await user.type(usernameInput, 'newusername');

    const updateButton = screen.getByText('プロフィール更新');
    await user.click(updateButton);

    await waitFor(() => {
      expect(userApi.update).toHaveBeenCalledWith(mockUser.id, {
        username: 'newusername',
      });
      expect(showSuccess).toHaveBeenCalledWith('Profile updated successfully!');
    });
  });

  it('opens change password modal when button is clicked', async () => {
    const user = userEvent.setup();
    renderWithQuery(<ProfilePage />);

    const changePasswordButton = await screen.findByRole('button', { name: 'パスワードを変更' });
    await user.click(changePasswordButton);

    expect(screen.getByRole('heading', { name: 'パスワードを変更' })).toBeInTheDocument();
    expect(screen.getByLabelText('現在のパスワード')).toBeInTheDocument();
    expect(screen.getByLabelText('新しいパスワード')).toBeInTheDocument();
    expect(screen.getByLabelText('新しいパスワード（確認）')).toBeInTheDocument();
  });

  it('changes password successfully', async () => {
    const user = userEvent.setup();
    (userApi.changePassword as jest.Mock).mockResolvedValue({});

    renderWithQuery(<ProfilePage />);

    const changePasswordButton = await screen.findByText('パスワードを変更');
    await user.click(changePasswordButton);

    await user.type(screen.getByLabelText('現在のパスワード'), 'currentPass123!');
    await user.type(screen.getByLabelText('新しいパスワード'), 'NewPass123!');
    await user.type(screen.getByLabelText('新しいパスワード（確認）'), 'NewPass123!');

    const changeButton = screen.getByText('変更');
    await user.click(changeButton);

    await waitFor(() => {
      expect(userApi.changePassword).toHaveBeenCalledWith(mockUser.id, {
        currentPassword: 'currentPass123!',
        newPassword: 'NewPass123!',
      });
      expect(showSuccess).toHaveBeenCalledWith('Password changed successfully!');
    });
  });

  it('validates password requirements', async () => {
    const user = userEvent.setup();
    renderWithQuery(<ProfilePage />);

    const changePasswordButton = await screen.findByText('パスワードを変更');
    await user.click(changePasswordButton);

    await user.type(screen.getByLabelText('現在のパスワード'), 'current');
    await user.type(screen.getByLabelText('新しいパスワード'), 'weak');
    await user.type(screen.getByLabelText('新しいパスワード（確認）'), 'weak');

    const changeButton = screen.getByText('変更');
    await user.click(changeButton);

    await waitFor(() => {
      expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument();
    });
  });

  it('opens delete account modal when button is clicked', async () => {
    const user = userEvent.setup();
    renderWithQuery(<ProfilePage />);

    // Get the delete button in the danger zone (not in the modal)
    const deleteButtons = await screen.findAllByText('アカウントを削除');
    await user.click(deleteButtons[0]); // First button (main page)

    expect(screen.getAllByText(/本当にアカウントを削除しますか/).length).toBeGreaterThan(0);
  });

  it('deletes account successfully', async () => {
    const user = userEvent.setup();
    (userApi.delete as jest.Mock).mockResolvedValue({});

    renderWithQuery(<ProfilePage />);

    // Click the first delete button to open modal
    const deleteButtons = await screen.findAllByText('アカウントを削除');
    await user.click(deleteButtons[0]);

    // Click the confirm delete button in the modal (should be the last one)
    const allDeleteButtons = screen.getAllByText('アカウントを削除');
    const confirmDeleteButton = allDeleteButtons[allDeleteButtons.length - 1];
    await user.click(confirmDeleteButton);

    await waitFor(() => {
      expect(userApi.delete).toHaveBeenCalledWith(mockUser.id);
      expect(showSuccess).toHaveBeenCalledWith('Account deleted successfully');
      expect(mockLogout).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith('/register');
    });
  });

  it('cancels profile edit', async () => {
    const user = userEvent.setup();
    renderWithQuery(<ProfilePage />);

    const editButton = await screen.findByText('編集');
    await user.click(editButton);

    const cancelButton = screen.getByText('キャンセル');
    await user.click(cancelButton);

    expect(screen.queryByText('プロフィールを編集')).not.toBeInTheDocument();
  });

  it('shows error when profile update fails', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Update failed';
    (userApi.update as jest.Mock).mockRejectedValue(new Error(errorMessage));

    renderWithQuery(<ProfilePage />);

    const editButton = await screen.findByText('編集');
    await user.click(editButton);

    const usernameInput = screen.getByLabelText('ユーザー名');
    await user.clear(usernameInput);
    await user.type(usernameInput, 'newusername');

    const updateButton = screen.getByText('プロフィール更新');
    await user.click(updateButton);

    await waitFor(() => {
      expect(showError).toHaveBeenCalledWith(errorMessage);
    });
  });
});