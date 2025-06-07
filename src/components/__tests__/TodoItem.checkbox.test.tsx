import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TodoItem from '../TodoItem';
import { Todo } from '@/types/todo';
import { todoApi } from '@/lib/api';

// Mock the API
jest.mock('@/lib/api', () => ({
  todoApi: {
    toggleStatus: jest.fn(),
    getChildren: jest.fn(),
  },
}));

// Mock toast
jest.mock('@/components/ui/toast', () => ({
  showSuccess: jest.fn(),
}));

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'todo.markComplete': 'Mark as complete',
      'todo.markIncomplete': 'Mark as incomplete',
      'todo.todoCompleted': 'Todo completed',
      'todo.todoUpdated': 'Todo updated',
      'todo.statusOptions.TODO': 'Todo',
      'todo.statusOptions.IN_PROGRESS': 'In Progress',
      'todo.statusOptions.DONE': 'Done',
      'todo.priorityOptions.HIGH': 'High',
      'todo.priorityOptions.MEDIUM': 'Medium',
      'todo.priorityOptions.LOW': 'Low',
      'todo.dueDateLabel': 'Due:',
      'todo.addSubtask': 'Add Subtask',
      'common.edit': 'Edit',
    };
    return translations[key] || key;
  },
}));

const mockTodo: Todo = {
  id: 1,
  title: 'Test Todo',
  description: 'Test description',
  status: 'TODO',
  priority: 'HIGH',
  dueDate: '2024-12-31',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const mockCompletedTodo: Todo = {
  ...mockTodo,
  id: 2,
  title: 'Completed Todo',
  status: 'DONE',
};

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

describe('TodoItem Checkbox Functionality', () => {
  const mockOnUpdate = jest.fn();
  const mockOnDelete = jest.fn();
  const mockOnAddChild = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (todoApi.getChildren as jest.Mock).mockResolvedValue([]);
  });

  it('renders checkbox for incomplete todo', () => {
    renderWithQueryClient(
      <TodoItem
        todo={mockTodo}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        onAddChild={mockOnAddChild}
      />
    );

    const checkbox = screen.getByRole('button', { name: /mark as complete/i });
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toHaveClass('bg-primary');
  });

  it('renders completed checkbox for completed todo', () => {
    renderWithQueryClient(
      <TodoItem
        todo={mockCompletedTodo}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        onAddChild={mockOnAddChild}
      />
    );

    const checkbox = screen.getByRole('button', { name: /mark as incomplete/i });
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).toHaveClass('bg-primary');
  });

  it('calls API to toggle todo status when checkbox is clicked', async () => {
    const mockUpdatedTodo = { ...mockTodo, status: 'DONE' as const };
    (todoApi.toggleStatus as jest.Mock).mockResolvedValue(mockUpdatedTodo);

    renderWithQueryClient(
      <TodoItem
        todo={mockTodo}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        onAddChild={mockOnAddChild}
      />
    );

    const checkbox = screen.getByRole('button', { name: /mark as complete/i });
    fireEvent.click(checkbox);

    await waitFor(() => {
      expect(todoApi.toggleStatus).toHaveBeenCalledWith(1);
    });
  });

  it('calls API to toggle completed todo when completed checkbox is clicked', async () => {
    const mockUpdatedTodo = { ...mockCompletedTodo, status: 'TODO' as const };
    (todoApi.toggleStatus as jest.Mock).mockResolvedValue(mockUpdatedTodo);

    renderWithQueryClient(
      <TodoItem
        todo={mockCompletedTodo}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        onAddChild={mockOnAddChild}
      />
    );

    const checkbox = screen.getByRole('button', { name: /mark as incomplete/i });
    fireEvent.click(checkbox);

    await waitFor(() => {
      expect(todoApi.toggleStatus).toHaveBeenCalledWith(2);
    });
  });

  it('disables checkbox while mutation is pending', async () => {
    (todoApi.toggleStatus as jest.Mock).mockImplementation(() => new Promise(() => {})); // Never resolves

    renderWithQueryClient(
      <TodoItem
        todo={mockTodo}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        onAddChild={mockOnAddChild}
      />
    );

    const checkbox = screen.getByRole('button', { name: /mark as complete/i });
    fireEvent.click(checkbox);

    await waitFor(() => {
      expect(checkbox).toBeDisabled();
    });
  });

  it('handles recurring task completion', async () => {
    const recurringTodo: Todo = {
      ...mockTodo,
      originalTodoId: 100,
    };
    
    const mockUpdatedTodo = { ...recurringTodo, status: 'DONE' as const };
    (todoApi.toggleStatus as jest.Mock).mockResolvedValue(mockUpdatedTodo);

    renderWithQueryClient(
      <TodoItem
        todo={recurringTodo}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        onAddChild={mockOnAddChild}
      />
    );

    const checkbox = screen.getByRole('button', { name: /mark as complete/i });
    fireEvent.click(checkbox);

    await waitFor(() => {
      expect(todoApi.toggleStatus).toHaveBeenCalledWith(1);
    });
  });

  it('shows hover state when hovering over checkbox', async () => {
    renderWithQueryClient(
      <TodoItem
        todo={mockTodo}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        onAddChild={mockOnAddChild}
      />
    );

    const checkbox = screen.getByRole('button', { name: /mark as complete/i });
    
    // Initially no check mark
    expect(checkbox.querySelector('svg')).not.toBeInTheDocument();
    
    // Hover should show check mark
    fireEvent.mouseEnter(checkbox);
    await waitFor(() => {
      expect(checkbox.querySelector('svg')).toBeInTheDocument();
    });
    
    // Mouse leave should hide check mark
    fireEvent.mouseLeave(checkbox);
    await waitFor(() => {
      expect(checkbox.querySelector('svg')).not.toBeInTheDocument();
    });
  });
});