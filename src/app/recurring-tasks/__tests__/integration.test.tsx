import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import userEvent from '@testing-library/user-event';
import RecurringTasksPage from '../page';
import TodoForm from '@/components/TodoForm';
import { todoApi } from '@/lib/api';
import { Todo } from '@/types/todo';

// Mock the API
jest.mock('@/lib/api', () => ({
  todoApi: {
    getRepeatable: jest.fn(),
    getInstances: jest.fn(),
    generateInstances: jest.fn(),
    create: jest.fn(),
  },
}));

// Mock AppLayout
jest.mock('@/components/layout', () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => <div data-testid="app-layout">{children}</div>,
}));

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'todo.createNewTodo': 'Create New Todo',
      'todo.titleRequired': 'Title is required',
      'todo.todoTitle': 'Title',
      'todo.todoDescription': 'Description',
      'todo.todoStatus': 'Status',
      'todo.todoPriority': 'Priority',
      'todo.dueDate': 'Due Date',
      'todo.statusOptions.TODO': 'Todo',
      'todo.statusOptions.IN_PROGRESS': 'In Progress',
      'todo.statusOptions.DONE': 'Done',
      'todo.priorityOptions.LOW': 'Low',
      'todo.priorityOptions.MEDIUM': 'Medium',
      'todo.priorityOptions.HIGH': 'High',
      'common.cancel': 'Cancel',
      'todo.creating': 'Creating...',
      'todo.createTodo': 'Create Todo',
    };
    return translations[key] || key;
  },
}));

const createQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 0,
    },
    mutations: {
      retry: false,
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

describe('Recurring Tasks Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Full workflow from creation to management', () => {
    it('should allow creating a recurring task and viewing it in management page', async () => {
      const user = userEvent.setup();
      
      // Mock API responses
      const mockCreatedTask: Todo = {
        id: 1,
        title: 'Daily Exercise',
        description: '30 minutes workout',
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
      };

      (todoApi.create as jest.Mock).mockResolvedValue(mockCreatedTask);
      (todoApi.getRepeatable as jest.Mock).mockResolvedValue([mockCreatedTask]);

      const mockOnSubmit = jest.fn();
      const mockOnCancel = jest.fn();

      // Test TodoForm submission
      renderWithQueryClient(
        <TodoForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isSubmitting={false}
        />
      );

      // Fill out the form
      const titleInput = screen.getByRole('textbox', { name: /title/i });
      await user.type(titleInput, 'Daily Exercise');

      const descriptionInput = screen.getByRole('textbox', { name: /description/i });
      await user.type(descriptionInput, '30 minutes workout');

      // Enable recurring task
      const recurringCheckbox = screen.getByLabelText('繰り返しタスク');
      await user.click(recurringCheckbox);

      // Submit the form
      const submitButton = screen.getByText('繰り返しタスクを作成');
      await user.click(submitButton);

      // Verify form submission
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Daily Exercise',
            description: '30 minutes workout',
            isRepeatable: true,
            repeatConfig: expect.objectContaining({
              repeatType: 'DAILY',
              interval: 1,
            }),
          })
        );
      });

      // Now test the management page
      renderWithQueryClient(<RecurringTasksPage />);

      await waitFor(() => {
        expect(screen.getByText('Daily Exercise')).toBeInTheDocument();
        expect(screen.getByText('30 minutes workout')).toBeInTheDocument();
        expect(screen.getByText('毎日')).toBeInTheDocument();
      });
    });

    it('should handle weekly recurring task creation and display', async () => {
      const user = userEvent.setup();
      
      const mockWeeklyTask: Todo = {
        id: 2,
        title: 'Team Meeting',
        description: 'Weekly standup',
        status: 'TODO',
        priority: 'MEDIUM',
        dueDate: '2025-01-06',
        isRepeatable: true,
        repeatConfig: {
          repeatType: 'WEEKLY',
          interval: 1,
          daysOfWeek: [1, 3, 5], // Mon, Wed, Fri
        },
        createdAt: '2024-01-01T09:00:00Z',
        updatedAt: '2024-01-01T09:00:00Z',
      };

      (todoApi.create as jest.Mock).mockResolvedValue(mockWeeklyTask);
      (todoApi.getRepeatable as jest.Mock).mockResolvedValue([mockWeeklyTask]);

      const mockOnSubmit = jest.fn();
      const mockOnCancel = jest.fn();

      // Test TodoForm submission with weekly configuration
      renderWithQueryClient(
        <TodoForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isSubmitting={false}
        />
      );

      // Fill basic info
      const titleInput = screen.getByRole('textbox', { name: /title/i });
      await user.type(titleInput, 'Team Meeting');

      // Enable recurring task
      const recurringCheckbox = screen.getByLabelText('繰り返しタスク');
      await user.click(recurringCheckbox);

      // Select weekly
      await waitFor(() => {
        const repeatTypeSelect = screen.getByDisplayValue('毎日');
        fireEvent.change(repeatTypeSelect, { target: { value: 'WEEKLY' } });
      });

      // Select days
      await waitFor(() => {
        const mondayButton = screen.getByText('月');
        const wednesdayButton = screen.getByText('水');
        const fridayButton = screen.getByText('金');

        fireEvent.click(mondayButton);
        fireEvent.click(wednesdayButton);
        fireEvent.click(fridayButton);
      });

      // Submit
      const submitButton = screen.getByText('繰り返しタスクを作成');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Team Meeting',
            isRepeatable: true,
            repeatConfig: expect.objectContaining({
              repeatType: 'WEEKLY',
              daysOfWeek: expect.arrayContaining([1, 3, 5]),
            }),
          })
        );
      });

      // Test management page display
      renderWithQueryClient(<RecurringTasksPage />);

      await waitFor(() => {
        expect(screen.getByText('Team Meeting')).toBeInTheDocument();
        expect(screen.getByText('毎週 (月・水・金)')).toBeInTheDocument();
      });
    });

    it('should handle instance generation and display workflow', async () => {
      const user = userEvent.setup();
      
      const mockTask: Todo = {
        id: 1,
        title: 'Daily Exercise',
        description: '30 minutes workout',
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
      };

      const mockInstances: Todo[] = [
        {
          id: 2,
          title: 'Daily Exercise',
          description: '30 minutes workout',
          status: 'DONE',
          priority: 'HIGH',
          dueDate: '2025-01-02',
          isRepeatable: false,
          originalTodoId: 1,
          createdAt: '2025-01-02T00:00:00Z',
          updatedAt: '2025-01-02T08:30:00Z',
        },
      ];

      const mockNewInstances: Todo[] = [
        {
          id: 3,
          title: 'Daily Exercise',
          description: '30 minutes workout',
          status: 'TODO',
          priority: 'HIGH',
          dueDate: '2025-01-03',
          isRepeatable: false,
          originalTodoId: 1,
          createdAt: '2025-01-03T00:00:00Z',
          updatedAt: '2025-01-03T00:00:00Z',
        },
      ];

      (todoApi.getRepeatable as jest.Mock).mockResolvedValue([mockTask]);
      (todoApi.getInstances as jest.Mock).mockResolvedValue(mockInstances);
      (todoApi.generateInstances as jest.Mock).mockResolvedValue(mockNewInstances);

      renderWithQueryClient(<RecurringTasksPage />);

      // Wait for page to load
      await waitFor(() => {
        expect(screen.getByText('Daily Exercise')).toBeInTheDocument();
      });

      // Generate new instances
      const generateButton = screen.getByText('インスタンス生成');
      await user.click(generateButton);

      await waitFor(() => {
        expect(todoApi.generateInstances).toHaveBeenCalled();
      });

      // View instances
      const viewInstancesButton = screen.getByText('インスタンスを表示');
      await user.click(viewInstancesButton);

      await waitFor(() => {
        expect(todoApi.getInstances).toHaveBeenCalledWith(1);
        expect(screen.getByText('生成済みインスタンス (1件)')).toBeInTheDocument();
        expect(screen.getByText('ID: 2')).toBeInTheDocument();
      });

      // Hide instances
      const hideButton = screen.getByText('インスタンスを隠す');
      await user.click(hideButton);

      await waitFor(() => {
        expect(screen.queryByText('生成済みインスタンス')).not.toBeInTheDocument();
      });
    });
  });

  describe('Error handling integration', () => {
    it('should handle API errors gracefully in the full workflow', async () => {
      // Mock API failure
      (todoApi.getRepeatable as jest.Mock).mockRejectedValue(new Error('API Error'));

      renderWithQueryClient(<RecurringTasksPage />);

      await waitFor(() => {
        expect(screen.getByText('繰り返しタスクの読み込みに失敗しました')).toBeInTheDocument();
      });
    });

    it('should handle instance loading errors', async () => {
      const user = userEvent.setup();
      
      const mockTask: Todo = {
        id: 1,
        title: 'Daily Exercise',
        description: '30 minutes workout',
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
      };

      (todoApi.getRepeatable as jest.Mock).mockResolvedValue([mockTask]);
      (todoApi.getInstances as jest.Mock).mockRejectedValue(new Error('Failed to load instances'));

      // Mock console.error to avoid noise in test output
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      renderWithQueryClient(<RecurringTasksPage />);

      await waitFor(() => {
        expect(screen.getByText('Daily Exercise')).toBeInTheDocument();
      });

      const viewInstancesButton = screen.getByText('インスタンスを表示');
      await user.click(viewInstancesButton);

      // Should not crash and error should be logged
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Failed to load instances:', expect.any(Error));
      });

      consoleSpy.mockRestore();
    });
  });
});