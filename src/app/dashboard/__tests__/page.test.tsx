import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Dashboard from '../page';
import * as AuthContextModule from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
// import { mockUser } from '@/lib/__mocks__/api';

// Mock the hooks
jest.mock('@/hooks/useCalendar', () => ({
  useTodaysEvents: () => ({
    data: [
      {
        id: 1,
        title: 'チームミーティング',
        startDate: new Date().toISOString(),
        endDate: new Date().toISOString(),
        allDay: false,
        color: 'blue',
      },
      {
        id: 2,
        title: '終日イベント',
        startDate: new Date().toISOString(),
        endDate: new Date().toISOString(),
        allDay: true,
        color: 'green',
      },
    ],
  }),
}));

jest.mock('@/hooks/useNotes', () => ({
  useRecentNotes: () => ({
    data: [
      {
        id: 1,
        title: 'プロジェクトメモ',
        content: 'Important project notes',
        updatedAt: new Date().toISOString(),
        tags: ['work'],
        isPinned: false,
      },
      {
        id: 2,
        title: 'アイデア',
        content: 'New feature idea',
        updatedAt: new Date().toISOString(),
        tags: ['idea'],
        isPinned: true,
      },
    ],
  }),
}));

// Mock API
jest.mock('@/lib/api', () => ({
  todoApi: {
    getAll: jest.fn(() => Promise.resolve({
      content: [
        {
          id: 1,
          title: 'Test TODO 1',
          status: 'TODO',
          priority: 'HIGH',
        },
        {
          id: 2,
          title: 'Test TODO 2',
          status: 'DONE',
          priority: 'MEDIUM',
        },
        {
          id: 3,
          title: 'Test TODO 3',
          status: 'IN_PROGRESS',
          priority: 'LOW',
        },
      ],
      totalElements: 3,
    })),
  },
}));

// Mock date-fns
jest.mock('date-fns', () => ({
  format: jest.fn((date, formatStr) => {
    if (formatStr === 'HH:mm') return '09:00';
    if (formatStr === 'M/d HH:mm') return '6/15 10:30';
    return '2025-06-15';
  }),
}));

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

const mockAuthContext = {
  user: { 
    id: 1, 
    username: 'testuser', 
    email: 'test@example.com',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  login: jest.fn(),
  register: jest.fn(),
  logout: jest.fn(),
  clearError: jest.fn(),
  checkAuth: jest.fn(),
  isAuthenticated: true,
  isLoading: false,
  error: null,
};

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthContextModule.AuthContext.Provider value={mockAuthContext}>
          {component}
        </AuthContextModule.AuthContext.Provider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

describe('Dashboard Page', () => {
  it('renders welcome message', () => {
    renderWithProviders(<Dashboard />);
    
    expect(screen.getByText('Welcome to Personal Hub')).toBeInTheDocument();
  });

  it('displays feature cards with real data', () => {
    renderWithProviders(<Dashboard />);
    
    // TODO card should show 2 incomplete todos (out of 3 total, 1 is DONE)
    expect(screen.getByText('2件の未完了タスク')).toBeInTheDocument();
    
    // Calendar card should show 2 events for today
    expect(screen.getByText('今日のイベント: 2件')).toBeInTheDocument();
    
    // Notes card should show recent notes
    expect(screen.getByText('2件の最近のメモ')).toBeInTheDocument();
    
    // Analytics card should show completion rate (1 DONE out of 3 = 33%)
    expect(screen.getByText('完了率: 33%')).toBeInTheDocument();
  });

  it('displays today\'s events section', () => {
    renderWithProviders(<Dashboard />);
    
    expect(screen.getByText('今日のイベント')).toBeInTheDocument();
    expect(screen.getByText('チームミーティング')).toBeInTheDocument();
    expect(screen.getByText('終日イベント')).toBeInTheDocument();
  });

  it('displays recent notes section', () => {
    renderWithProviders(<Dashboard />);
    
    expect(screen.getByText('最近のノート')).toBeInTheDocument();
    expect(screen.getByText('プロジェクトメモ')).toBeInTheDocument();
    expect(screen.getByText('アイデア')).toBeInTheDocument();
  });

  it('displays TODO progress summary', () => {
    renderWithProviders(<Dashboard />);
    
    expect(screen.getByText('TODO進捗サマリー')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument(); // Total todos
    expect(screen.getByText('2')).toBeInTheDocument(); // Incomplete todos
    expect(screen.getByText('33%')).toBeInTheDocument(); // Completion rate
  });

  it('shows time for timed events', () => {
    renderWithProviders(<Dashboard />);
    
    // Timed event should show time
    expect(screen.getByText('09:00')).toBeInTheDocument();
    
    // All-day event should show "終日"
    expect(screen.getByText('終日')).toBeInTheDocument();
  });

  it('renders navigation links to other pages', () => {
    renderWithProviders(<Dashboard />);
    
    const todoLink = screen.getByRole('link', { name: /全て見る/ }).closest('a');
    expect(todoLink?.getAttribute('href')).toBe('/todos');
  });

  it('handles empty states', () => {
    // Mock empty data
    jest.doMock('@/hooks/useCalendar', () => ({
      useTodaysEvents: () => ({ data: [] }),
    }));
    
    jest.doMock('@/hooks/useNotes', () => ({
      useRecentNotes: () => ({ data: [] }),
    }));

    renderWithProviders(<Dashboard />);
    
    expect(screen.getByText('今日のイベントはありません')).toBeInTheDocument();
    expect(screen.getByText('ノートがありません')).toBeInTheDocument();
  });

  it('renders quick action button', () => {
    renderWithProviders(<Dashboard />);
    
    const quickActionButton = screen.getByRole('link', { name: /新しいTODO/ });
    expect(quickActionButton).toBeInTheDocument();
    expect(quickActionButton.getAttribute('href')).toBe('/todos');
  });

  it('displays correct feature descriptions', () => {
    renderWithProviders(<Dashboard />);
    
    expect(screen.getByText('タスクの管理と進捗確認')).toBeInTheDocument();
    expect(screen.getByText('スケジュールとイベント管理')).toBeInTheDocument();
    expect(screen.getByText('メモとドキュメント作成')).toBeInTheDocument();
    expect(screen.getByText('生産性の分析と改善')).toBeInTheDocument();
  });

  it('applies correct styling for feature cards', () => {
    renderWithProviders(<Dashboard />);
    
    const todoCard = screen.getByText('TODOs').closest('a');
    expect(todoCard).toHaveClass('cursor-pointer');
    
    // Should have hover effects
    const card = todoCard?.querySelector('[class*="hover:shadow-lg"]');
    expect(card).toBeInTheDocument();
  });
});