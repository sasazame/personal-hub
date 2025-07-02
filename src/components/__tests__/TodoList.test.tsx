import { render, screen, fireEvent } from '@/test/test-utils';
import TodoList from '../TodoList';
import { Todo } from '@/types/todo';
import { todoApi } from '@/lib/api';

// Mock the API
jest.mock('@/lib/api', () => ({
  todoApi: {
    getChildren: jest.fn(),
    toggleStatus: jest.fn(),
  }
}));

// Mock toast
jest.mock('@/components/ui/toast', () => ({
  showSuccess: jest.fn(),
  showError: jest.fn(),
}));

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'todo.showSubtasks': 'Show subtasks',
      'todo.hideSubtasks': 'Hide subtasks',
      'todo.loadingSubtasks': 'Loading subtasks...',
      'todo.addSubtask': 'Add Subtask',
      'todo.todoCompleted': 'Todo completed',
      'todo.todoUpdated': 'Todo updated',
      'todo.markComplete': 'Mark as complete',
      'todo.markIncomplete': 'Mark as incomplete',
      'todo.dueDateLabel': 'Due:',
      'todo.statusOptions.TODO': 'To Do',
      'todo.statusOptions.IN_PROGRESS': 'In Progress',
      'todo.statusOptions.DONE': 'Done',
      'todo.priorityOptions.LOW': 'Low',
      'todo.priorityOptions.MEDIUM': 'Medium',
      'todo.priorityOptions.HIGH': 'High',
      'common.edit': 'Edit',
      'errors.general': 'An error occurred',
    };
    return translations[key] || key;
  },
}));

describe('TodoList', () => {
  const mockTodos: Todo[] = [
    {
      id: 1,
      title: 'Test Todo 1',
      description: 'Test description 1',
      status: 'TODO',
      priority: 'HIGH',
      dueDate: '2024-12-31T00:00:00Z',
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

  const mockOnUpdate = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock getChildren to return empty array by default
    (todoApi.getChildren as jest.Mock).mockResolvedValue([]);
  });

  it('renders todo items correctly', () => {
    render(
      <TodoList
        todos={mockTodos}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('Test Todo 1')).toBeInTheDocument();
    expect(screen.getByText('Test description 1')).toBeInTheDocument();
    expect(screen.getByText('Test Todo 2')).toBeInTheDocument();
  });

  it('displays correct status badges', () => {
    render(
      <TodoList
        todos={mockTodos}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('To Do')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
  });

  it('displays correct priority indicators', () => {
    render(
      <TodoList
        todos={mockTodos}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('High')).toBeInTheDocument();
    expect(screen.getByText('Medium')).toBeInTheDocument();
  });

  it('displays due date when available', () => {
    render(
      <TodoList
        todos={mockTodos}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText(/Due:.*12\/31\/2024/)).toBeInTheDocument();
  });

  it('calls onUpdate when Edit button is clicked', () => {
    render(
      <TodoList
        todos={mockTodos}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);

    expect(mockOnUpdate).toHaveBeenCalledWith(1, mockTodos[0]);
  });

  it('does not display Delete button in TodoList', () => {
    render(
      <TodoList
        todos={mockTodos}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    // TodoItem doesn't have a visible delete button, it's handled through edit form
    const deleteButtons = screen.queryAllByText('Delete');
    expect(deleteButtons.length).toBe(0);
  });

  it('renders empty list when no todos provided', () => {
    const { container } = render(
      <TodoList
        todos={[]}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    const todoList = container.querySelector('.space-y-4');
    expect(todoList?.children.length).toBe(0);
  });
});