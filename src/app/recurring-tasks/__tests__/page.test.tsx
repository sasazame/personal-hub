import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import RecurringTasksPage from '../page';
import { todoApi } from '@/lib/api';
import { Todo } from '@/types/todo';

// Mock the API
jest.mock('@/lib/api', () => ({
  todoApi: {
    getRepeatable: jest.fn(),
    getInstances: jest.fn(),
    generateInstances: jest.fn(),
  },
}));

// Mock AppLayout
jest.mock('@/components/layout', () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => <div data-testid="app-layout">{children}</div>,
}));

const mockRecurringTasks: Todo[] = [
  {
    id: 1,
    title: 'Daily Exercise',
    description: '30 minutes of walking',
    status: 'TODO',
    priority: 'HIGH',
    dueDate: '2025-01-01',
    isRepeatable: true,
    repeatConfig: {
      repeatType: 'DAILY',
      interval: 1,
    },
    createdAt: '2024-01-01T09:00:00Z',
    updatedAt: '2024-01-01T09:00:00Z',
  },
  {
    id: 2,
    title: 'Weekly Meeting',
    description: 'Team standup',
    status: 'TODO',
    priority: 'MEDIUM',
    dueDate: '2025-01-06',
    isRepeatable: true,
    repeatConfig: {
      repeatType: 'WEEKLY',
      interval: 1,
      daysOfWeek: [1, 3, 5],
    },
    createdAt: '2024-01-01T09:00:00Z',
    updatedAt: '2024-01-01T09:00:00Z',
  },
];

const mockInstances: Todo[] = [
  {
    id: 3,
    title: 'Daily Exercise',
    description: '30 minutes of walking',
    status: 'DONE',
    priority: 'HIGH',
    dueDate: '2025-01-02',
    isRepeatable: false,
    originalTodoId: 1,
    createdAt: '2025-01-02T00:00:00Z',
    updatedAt: '2025-01-02T08:30:00Z',
  },
  {
    id: 4,
    title: 'Daily Exercise',
    description: '30 minutes of walking',
    status: 'TODO',
    priority: 'HIGH',
    dueDate: '2025-01-03',
    isRepeatable: false,
    originalTodoId: 1,
    createdAt: '2025-01-03T00:00:00Z',
    updatedAt: '2025-01-03T00:00:00Z',
  },
];

const createQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 0,
    },
  },
});

const renderWithQueryClient = (component: React.ReactElement) => {
  const queryClient = createQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe('RecurringTasksPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    (todoApi.getRepeatable as jest.Mock).mockReturnValue(new Promise(() => {}));

    renderWithQueryClient(<RecurringTasksPage />);

    expect(screen.getByTestId('app-layout')).toBeInTheDocument();
    expect(screen.getByTestId('app-layout')).toHaveTextContent('');
  });

  it('renders empty state when no recurring tasks exist', async () => {
    (todoApi.getRepeatable as jest.Mock).mockResolvedValue([]);

    renderWithQueryClient(<RecurringTasksPage />);

    await waitFor(() => {
      expect(screen.getByText('繰り返しタスクがありません')).toBeInTheDocument();
      expect(screen.getByText('TODOページで繰り返し設定を有効にしてタスクを作成してください')).toBeInTheDocument();
    });
  });

  it('renders recurring tasks list', async () => {
    (todoApi.getRepeatable as jest.Mock).mockResolvedValue(mockRecurringTasks);

    renderWithQueryClient(<RecurringTasksPage />);

    await waitFor(() => {
      expect(screen.getByText('Daily Exercise')).toBeInTheDocument();
      expect(screen.getByText('Weekly Meeting')).toBeInTheDocument();
      expect(screen.getByText('30 minutes of walking')).toBeInTheDocument();
      expect(screen.getByText('Team standup')).toBeInTheDocument();
    });
  });

  it('displays repeat configuration correctly', async () => {
    (todoApi.getRepeatable as jest.Mock).mockResolvedValue(mockRecurringTasks);

    renderWithQueryClient(<RecurringTasksPage />);

    await waitFor(() => {
      expect(screen.getByText('毎日')).toBeInTheDocument();
      expect(screen.getByText('毎週 (月・水・金)')).toBeInTheDocument();
    });
  });

  it('shows priority and status badges', async () => {
    (todoApi.getRepeatable as jest.Mock).mockResolvedValue(mockRecurringTasks);

    renderWithQueryClient(<RecurringTasksPage />);

    await waitFor(() => {
      expect(screen.getByText('HIGH')).toBeInTheDocument();
      expect(screen.getByText('MEDIUM')).toBeInTheDocument();
      expect(screen.getAllByText('TODO')).toHaveLength(2);
    });
  });

  it('loads and displays instances when button is clicked', async () => {
    (todoApi.getRepeatable as jest.Mock).mockResolvedValue(mockRecurringTasks);
    (todoApi.getInstances as jest.Mock).mockResolvedValue(mockInstances);

    renderWithQueryClient(<RecurringTasksPage />);

    await waitFor(() => {
      const viewInstancesButtons = screen.getAllByText('インスタンスを表示');
      expect(viewInstancesButtons).toHaveLength(2);
    });

    // Click the first "View Instances" button
    const firstViewButton = screen.getAllByText('インスタンスを表示')[0];
    fireEvent.click(firstViewButton);

    await waitFor(() => {
      expect(todoApi.getInstances).toHaveBeenCalledWith(1);
      expect(screen.getByText('生成済みインスタンス (2件)')).toBeInTheDocument();
      expect(screen.getByText('DONE')).toBeInTheDocument();
      expect(screen.getByText('ID: 3')).toBeInTheDocument();
      expect(screen.getByText('ID: 4')).toBeInTheDocument();
    });
  });

  it('hides instances when hide button is clicked', async () => {
    (todoApi.getRepeatable as jest.Mock).mockResolvedValue(mockRecurringTasks);
    (todoApi.getInstances as jest.Mock).mockResolvedValue(mockInstances);

    renderWithQueryClient(<RecurringTasksPage />);

    await waitFor(() => {
      const viewInstancesButton = screen.getAllByText('インスタンスを表示')[0];
      fireEvent.click(viewInstancesButton);
    });

    await waitFor(() => {
      expect(screen.getByText('インスタンスを隠す')).toBeInTheDocument();
    });

    // Click hide button
    const hideButton = screen.getByText('インスタンスを隠す');
    fireEvent.click(hideButton);

    await waitFor(() => {
      expect(screen.queryByText('生成済みインスタンス')).not.toBeInTheDocument();
      expect(screen.getByText('インスタンスを表示')).toBeInTheDocument();
    });
  });

  it('calls generate instances API when generate button is clicked', async () => {
    (todoApi.getRepeatable as jest.Mock).mockResolvedValue(mockRecurringTasks);
    (todoApi.generateInstances as jest.Mock).mockResolvedValue([]);

    renderWithQueryClient(<RecurringTasksPage />);

    await waitFor(() => {
      const generateButton = screen.getByText('インスタンス生成');
      fireEvent.click(generateButton);
    });

    expect(todoApi.generateInstances).toHaveBeenCalled();
  });

  it('shows loading state for generate button when mutation is pending', async () => {
    (todoApi.getRepeatable as jest.Mock).mockResolvedValue(mockRecurringTasks);
    (todoApi.generateInstances as jest.Mock).mockReturnValue(new Promise(() => {}));

    renderWithQueryClient(<RecurringTasksPage />);

    await waitFor(() => {
      const generateButton = screen.getByText('インスタンス生成');
      fireEvent.click(generateButton);
    });

    await waitFor(() => {
      expect(screen.getByText('生成中...')).toBeInTheDocument();
    });
  });

  it('displays error state when API fails', async () => {
    (todoApi.getRepeatable as jest.Mock).mockRejectedValue(new Error('API Error'));

    renderWithQueryClient(<RecurringTasksPage />);

    await waitFor(() => {
      expect(screen.getByText('繰り返しタスクの読み込みに失敗しました')).toBeInTheDocument();
    });
  });

  it('shows no instances message when task has no instances', async () => {
    (todoApi.getRepeatable as jest.Mock).mockResolvedValue(mockRecurringTasks);
    (todoApi.getInstances as jest.Mock).mockResolvedValue([]);

    renderWithQueryClient(<RecurringTasksPage />);

    await waitFor(() => {
      const viewInstancesButton = screen.getAllByText('インスタンスを表示')[0];
      fireEvent.click(viewInstancesButton);
    });

    await waitFor(() => {
      expect(screen.getByText('まだインスタンスが生成されていません')).toBeInTheDocument();
    });
  });
});