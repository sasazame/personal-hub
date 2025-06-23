import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Dashboard from '../page';
import * as AuthContextModule from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string, params?: Record<string, string>) => {
    const translations: Record<string, string> = {
      'dashboard.welcome': 'こんにちは',
      'dashboard.welcomeMessage': '今日も頑張りましょう！',
      'dashboard.taskManagement': 'タスクの管理と進捗確認',
      'dashboard.scheduleManagement': 'スケジュールとイベント管理',
      'dashboard.noteDocumentCreation': 'メモとドキュメント作成',
      'dashboard.productivityAnalysis': '生産性の分析と改善',
      'dashboard.quickActions': 'クイックアクション',
      'dashboard.newTodo': '新しいTODO',
      'dashboard.newEvent': '新しいイベント',
      'dashboard.newNote': '新しいメモ',
      'nav.todos': 'TODO',
      'nav.calendar': 'カレンダー',
      'nav.notes': 'メモ',
      'nav.analytics': '分析',
      'app.description': 'Personal Hub',
      'dashboard.todayEvents': '今日のイベント',
      'dashboard.recentNotes': '最近のノート',
      'dashboard.todoProgressSummary': 'TODOの進捗',
      'dashboard.totalTasks': '総タスク数',
      'dashboard.incomplete': '未完了',
      'dashboard.completionRate': '完了率',
      'dashboard.viewAll': 'すべて表示',
      'dashboard.viewAllArrow': '→',
      'dashboard.noEvents': 'イベントはありません',
      'dashboard.noNotes': 'ノートはありません',
      'dashboard.allDay': '終日',
    };

    let result = translations[key] || key;
    
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        result = result.replace(`{${param}}`, String(value));
      });
    }

    return result;
  },
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => <div {...props}>{children}</div>,
    section: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => <section {...props}>{children}</section>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

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
    ],
    isLoading: false,
  }),
}));

jest.mock('@/hooks/useNotes', () => ({
  useRecentNotes: () => ({
    data: [
      {
        id: 1,
        title: 'プロジェクトメモ',
        content: 'テストメモ',
        isPinned: false,
        tags: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    isLoading: false,
  }),
}));

// Mock API
jest.mock('@/lib/api', () => ({
  todoApi: {
    getAll: jest.fn().mockResolvedValue({
      content: [
        { id: 1, title: 'Test Todo 1', status: 'TODO', priority: 'HIGH', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
        { id: 2, title: 'Test Todo 2', status: 'IN_PROGRESS', priority: 'MEDIUM', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
        { id: 3, title: 'Test Todo 3', status: 'DONE', priority: 'LOW', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
      ],
      totalElements: 3,
      totalPages: 1,
    }),
  },
}));

// Mock useTranslations
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

// Mock LocaleContext
jest.mock('@/contexts/LocaleContext', () => ({
  useLocale: () => ({
    locale: 'ja',
    setLocale: jest.fn(),
  }),
}));

const mockAuthContext = {
  user: {
    id: '1',
    username: 'testuser', 
    email: 'test@example.com',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  login: jest.fn(),
  loginWithOIDC: jest.fn(),
  register: jest.fn(),
  logout: jest.fn(),
  clearError: jest.fn(),
  checkAuth: jest.fn(),
  handleOAuthCallback: jest.fn(),
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
    
    // Check for the translated welcome message
    expect(screen.getByText('dashboard.welcome')).toBeInTheDocument();
  });

  it('displays feature cards', () => {
    renderWithProviders(<Dashboard />);
    
    // Check that feature cards are rendered
    expect(screen.getByText('TODOs')).toBeInTheDocument();
    expect(screen.getByText('Calendar')).toBeInTheDocument();
    expect(screen.getByText('Notes')).toBeInTheDocument();
    expect(screen.getByText('Analytics')).toBeInTheDocument();
  });

  it.skip('renders quick action button', () => {
    renderWithProviders(<Dashboard />);
    
    const quickActionButton = screen.getByText('新しいTODO');
    expect(quickActionButton).toBeInTheDocument();
  });

  it.skip('displays feature descriptions', () => {
    renderWithProviders(<Dashboard />);
    
    expect(screen.getByText('タスクの管理と進捗確認')).toBeInTheDocument();
    expect(screen.getByText('スケジュールとイベント管理')).toBeInTheDocument();
    expect(screen.getByText('メモとドキュメント作成')).toBeInTheDocument();
    expect(screen.getByText('生産性の分析と改善')).toBeInTheDocument();
  });
});