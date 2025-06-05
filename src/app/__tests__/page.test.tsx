import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import userEvent from '@testing-library/user-event';
import Home from '../page';
import { todoApi } from '@/lib/api';
import { Todo } from '@/types/todo';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

jest.mock('@/lib/api');

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
  usePathname: () => '/',
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock auth API
jest.mock('@/services/auth', () => ({
  authAPI: {
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

// Mock useTranslations
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'todo.addTodo': 'TODOを追加',
      'todo.noTodos': 'TODOがありません',
      'todo.createNewTodo': '新しいTODOを作成',
      'todo.createTodo': 'TODOを作成',
      'todo.editTodo': 'TODOを編集',
      'todo.deleteTodo': 'TODOを削除', 
      'todo.confirm削除': 'このTODOを削除してもよろしいですか？',
      'common.edit': '編集',
      'common.delete': '削除',
      'common.cancel': 'キャンセル',
      'common.confirm': '確認',
      'common.loading': 'Loading...',
      'errors.general': 'エラーが発生しました',
      'app.title': 'TODO App',
      'app.subtitle': 'タスクを効率的に整理する',
      'header.profile': 'Profile',
      'header.logout': 'Logout',
      'header.loggingOut': 'Logging out...',
      'common.language': 'Language',
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

const mockTodos: Todo[] = [
  {
    id: 1,
    title: 'Test Todo 1',
    description: 'Test description',
    status: 'TODO',
    priority: 'HIGH',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    title: 'Test Todo 2',
    status: 'IN_PROGRESS',
    priority: 'MEDIUM',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

function renderWithQuery(component: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          {component}
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

describe('Home Page', () => {
  const mockPush = jest.fn();
  const mockRouter = {
    push: mockPush,
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue('fake-token');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mockAuthAPI = require('@/services/auth').authAPI;
    mockAuthAPI.getCurrentUser.mockResolvedValue({
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    });
    
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { useRouter } = require('next/navigation');
    useRouter.mockReturnValue(mockRouter);
  });

  it('shows loading state initially', () => {
    (todoApi.getAll as jest.Mock).mockImplementation(() => new Promise(() => {}));
    
    renderWithQuery(<Home />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('displays todos when loaded', async () => {
    (todoApi.getAll as jest.Mock).mockResolvedValue({
      content: mockTodos,
      pageable: {
        pageNumber: 0,
        pageSize: 20,
        sort: { sorted: true, orderBy: 'createdAt', direction: 'DESC' }
      },
      totalElements: 2,
      totalPages: 1,
      first: true,
      last: true
    });
    
    renderWithQuery(<Home />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Todo 1')).toBeInTheDocument();
      expect(screen.getByText('Test Todo 2')).toBeInTheDocument();
    });
  });

  it('shows empty state when no todos', async () => {
    (todoApi.getAll as jest.Mock).mockResolvedValue({
      content: [],
      pageable: {
        pageNumber: 0,
        pageSize: 20,
        sort: { sorted: true, orderBy: 'createdAt', direction: 'DESC' }
      },
      totalElements: 0,
      totalPages: 0,
      first: true,
      last: true
    });
    
    renderWithQuery(<Home />);
    
    await waitFor(() => {
      expect(screen.getByText('TODOがありません')).toBeInTheDocument();
    });
  });

  it('shows error state when loading fails', async () => {
    (todoApi.getAll as jest.Mock).mockRejectedValue(new Error('Failed to load'));
    
    renderWithQuery(<Home />);
    
    await waitFor(() => {
      expect(screen.getByText('エラーが発生しました')).toBeInTheDocument();
    });
  });

  it('opens add todo form when button clicked', async () => {
    const user = userEvent.setup();
    (todoApi.getAll as jest.Mock).mockResolvedValue({
      content: mockTodos,
      pageable: {
        pageNumber: 0,
        pageSize: 20,
        sort: { sorted: true, orderBy: 'createdAt', direction: 'DESC' }
      },
      totalElements: 2,
      totalPages: 1,
      first: true,
      last: true
    });
    
    renderWithQuery(<Home />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Todo 1')).toBeInTheDocument();
    });

    const addButton = screen.getByText('TODOを追加');
    await user.click(addButton);

    expect(screen.getByText('新しいTODOを作成')).toBeInTheDocument();
  });

  it('creates a new todo', async () => {
    const user = userEvent.setup();
    const newTodo = { ...mockTodos[0], id: 3, title: 'New Todo' };
    
    (todoApi.getAll as jest.Mock).mockResolvedValue({
      content: mockTodos,
      pageable: {
        pageNumber: 0,
        pageSize: 20,
        sort: { sorted: true, orderBy: 'createdAt', direction: 'DESC' }
      },
      totalElements: 2,
      totalPages: 1,
      first: true,
      last: true
    });
    (todoApi.create as jest.Mock).mockResolvedValue(newTodo);
    
    renderWithQuery(<Home />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Todo 1')).toBeInTheDocument();
    });

    const addButton = screen.getByText('TODOを追加');
    await user.click(addButton);

    const titleInput = screen.getByLabelText(/title/i);
    await user.type(titleInput, 'New Todo');

    const submitButton = screen.getByText('TODOを作成');
    await user.click(submitButton);

    await waitFor(() => {
      expect(todoApi.create).toHaveBeenCalled();
    });
  });

  it('deletes a todo with confirmation', async () => {
    (todoApi.getAll as jest.Mock).mockResolvedValue({
      content: mockTodos,
      pageable: {
        pageNumber: 0,
        pageSize: 20,
        sort: { sorted: true, orderBy: 'createdAt', direction: 'DESC' }
      },
      totalElements: 2,
      totalPages: 1,
      first: true,
      last: true
    });
    (todoApi.delete as jest.Mock).mockResolvedValue(undefined);
    
    renderWithQuery(<Home />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Todo 1')).toBeInTheDocument();
    });

    // First open the edit form
    const editButtons = screen.getAllByText('編集');
    fireEvent.click(editButtons[0]);

    // Wait for edit form to appear
    await waitFor(() => {
      expect(screen.getByText('TODOを編集')).toBeInTheDocument();
    });

    // Click delete button in edit form
    const deleteButton = screen.getByText('削除');
    fireEvent.click(deleteButton);

    // Check that delete confirmation modal appears
    await waitFor(() => {
      expect(screen.getByText('TODOを削除')).toBeInTheDocument();
      // Note: Specific delete confirmation message may vary
    });

    // Click the confirm delete button in the modal
    const confirmButtons = screen.getAllByText('削除');
    fireEvent.click(confirmButtons[confirmButtons.length - 1]);

    await waitFor(() => {
      expect(todoApi.delete).toHaveBeenCalledWith(1);
    });
  });

  it('cancels delete when not confirmed', async () => {
    (todoApi.getAll as jest.Mock).mockResolvedValue({
      content: mockTodos,
      pageable: {
        pageNumber: 0,
        pageSize: 20,
        sort: { sorted: true, orderBy: 'createdAt', direction: 'DESC' }
      },
      totalElements: 2,
      totalPages: 1,
      first: true,
      last: true
    });
    
    renderWithQuery(<Home />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Todo 1')).toBeInTheDocument();
    });

    // First open the edit form
    const editButtons = screen.getAllByText('編集');
    fireEvent.click(editButtons[0]);

    // Wait for edit form to appear
    await waitFor(() => {
      expect(screen.getByText('TODOを編集')).toBeInTheDocument();
    });

    // Click delete button in edit form
    const deleteButton = screen.getByText('削除');
    fireEvent.click(deleteButton);

    // Check that delete confirmation modal appears
    await waitFor(() => {
      expect(screen.getByText('TODOを削除')).toBeInTheDocument();
    });

    // Click the cancel button
    const cancelButton = screen.getByText('キャンセル');
    fireEvent.click(cancelButton);

    // Modal should disappear and delete should not be called
    await waitFor(() => {
      expect(screen.queryByText('TODOを削除')).not.toBeInTheDocument();
    });
    expect(todoApi.delete).not.toHaveBeenCalled();
  });

  it('opens edit form when 編集 button clicked', async () => {
    (todoApi.getAll as jest.Mock).mockResolvedValue({
      content: mockTodos,
      pageable: {
        pageNumber: 0,
        pageSize: 20,
        sort: { sorted: true, orderBy: 'createdAt', direction: 'DESC' }
      },
      totalElements: 2,
      totalPages: 1,
      first: true,
      last: true
    });
    
    renderWithQuery(<Home />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Todo 1')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByText('編集');
    fireEvent.click(editButtons[0]);

    expect(screen.getByText('TODOを編集')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Todo 1')).toBeInTheDocument();
  });
});