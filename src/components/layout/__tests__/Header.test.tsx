import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Header } from '../Header';
import { useAuth, useLogout } from '@/hooks/useAuth';
import { ThemeProvider } from '@/contexts/ThemeContext';

jest.mock('@/hooks/useAuth');

// Mock useTranslations
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'app.title': 'TODO App',
      'header.profile': 'Profile',
      'header.logout': 'Logout',
      'header.loggingOut': 'Logging out...',
      'common.language': 'Language',
      'language': 'Language',
      'nav.home': 'Home',
      'nav.todos': 'TODOs',
      'nav.calendar': 'Calendar',
      'nav.tags': 'Tags',
      'nav.starred': 'Starred',
      'nav.archive': 'Archive',
      'nav.settings': 'Settings',
      'nav.profile': 'Profile',
    };
    return translations[key] || key;
  },
}));

// Mock LocaleContext
jest.mock('@/contexts/LocaleContext', () => ({
  useLocale: () => ({
    locale: 'ja',
    setLocale: jest.fn(),
  }),
}));

const mockUser = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

describe('Header', () => {
  const mockLogout = jest.fn();

  const renderWithTheme = (ui: React.ReactElement) => {
    return render(
      <ThemeProvider>
        {ui}
      </ThemeProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useLogout as jest.Mock).mockReturnValue({
      logout: mockLogout,
      isLoading: false,
    });
  });

  it('renders nothing when not authenticated', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      isAuthenticated: false,
    });

    const { container } = renderWithTheme(<Header />);
    expect(container.firstChild).toBeNull();
  });

  it('renders header with user info when authenticated', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
    });

    renderWithTheme(<Header />);

    expect(screen.getByText('TODO App')).toBeInTheDocument();
    // Username appears in both desktop and mobile views
    const usernameElements = screen.getAllByText(mockUser.username);
    expect(usernameElements.length).toBeGreaterThanOrEqual(1);
    // Email is no longer displayed as per requirements
    expect(screen.queryByText(`(${mockUser.email})`)).not.toBeInTheDocument();
  });

  it('renders profile link', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
    });

    renderWithTheme(<Header />);

    // Profile button might not have a proper name due to icon, so we use the parent link
    const profileLinks = screen.getAllByRole('link');
    const profileLink = profileLinks.find(link => link.getAttribute('href') === '/profile');
    expect(profileLink).toBeInTheDocument();
  });

  it('renders language switcher', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
    });

    renderWithTheme(<Header />);

    // Check for language switcher button (now a globe icon)
    // There are two language switchers (desktop and mobile)
    const languageButtons = screen.getAllByRole('button', { name: 'Language' });
    expect(languageButtons.length).toBeGreaterThanOrEqual(1);
  });

  it('calls logout when logout button is clicked', async () => {
    const user = userEvent.setup();
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
    });

    renderWithTheme(<Header />);

    // There are multiple logout buttons (desktop and mobile)
    const logoutButtons = screen.getAllByRole('button', { name: 'Logout' });
    // Click the first (desktop) logout button
    await user.click(logoutButtons[0]);

    expect(mockLogout).toHaveBeenCalled();
  });

  it('shows loading state on logout button when logging out', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
    });
    (useLogout as jest.Mock).mockReturnValue({
      logout: mockLogout,
      isLoading: true,
    });

    renderWithTheme(<Header />);

    // When loading, the button shows "Logging out..." instead of "Logout"
    const logoutButton = screen.getByRole('button', { name: 'Logging out...' });
    expect(logoutButton).toBeDisabled();
  });
});