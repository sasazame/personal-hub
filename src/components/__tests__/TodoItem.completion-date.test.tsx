import { render, screen } from '@/test/test-utils';
import TodoItem from '../TodoItem';
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
      'todo.statusOptions.NOT_STARTED': 'Not Started',
      'todo.statusOptions.IN_PROGRESS': 'In Progress',
      'todo.statusOptions.COMPLETED': 'Completed',
      'todo.priorityOptions.LOW': 'Low',
      'todo.priorityOptions.MEDIUM': 'Medium',
      'todo.priorityOptions.HIGH': 'High',
      'todo.markComplete': 'Mark as complete',
      'todo.markIncomplete': 'Mark as incomplete',
      'todo.dueDateLabel': 'Due:',
      'todo.completedDateLabel': 'Completed:',
      'todo.addSubtask': 'Add Subtask',
      'common.edit': 'Edit',
      'common.delete': 'Delete',
      'todo.duplicate': 'Duplicate',
      'todo.createSubtask': 'Create Subtask',
    };
    return translations[key] || key;
  },
}));

describe('TodoItem - Completion Date Display', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (todoApi.getChildren as jest.Mock).mockResolvedValue([]);
  });

  it('should not display completion date for incomplete todos', () => {
    const todo: Todo = {
      id: 1,
      title: 'Test Todo',
      status: 'TODO',
      priority: 'MEDIUM',
      createdAt: '2024-01-01T10:00:00Z',
      updatedAt: '2024-01-01T10:00:00Z',
    };

    render(
      <TodoItem
        todo={todo}
        onUpdate={jest.fn()}
        onDelete={jest.fn()}
        onAddChild={jest.fn()}
      />
    );

    expect(screen.queryByText(/Completed:/)).not.toBeInTheDocument();
  });

  it('should display completion date for completed todos', () => {
    const completionDate = '2024-01-15T15:30:00Z';
    const todo: Todo = {
      id: 1,
      title: 'Test Todo',
      status: 'DONE',
      priority: 'MEDIUM',
      createdAt: '2024-01-01T10:00:00Z',
      updatedAt: completionDate,
    };

    render(
      <TodoItem
        todo={todo}
        onUpdate={jest.fn()}
        onDelete={jest.fn()}
        onAddChild={jest.fn()}
      />
    );

    // Check if completion date is displayed
    expect(screen.getByText(/Completed:/)).toBeInTheDocument();
    // Check if the date is formatted correctly (this will depend on locale)
    const formattedDate = new Date(completionDate).toLocaleDateString();
    expect(screen.getByText(new RegExp(formattedDate))).toBeInTheDocument();
  });

  it('should display both due date and completion date for completed todos with due date', () => {
    const dueDate = '2024-01-10T00:00:00Z';
    const completionDate = '2024-01-08T15:30:00Z';
    const todo: Todo = {
      id: 1,
      title: 'Test Todo',
      status: 'DONE',
      priority: 'MEDIUM',
      dueDate: dueDate,
      createdAt: '2024-01-01T10:00:00Z',
      updatedAt: completionDate,
    };

    render(
      <TodoItem
        todo={todo}
        onUpdate={jest.fn()}
        onDelete={jest.fn()}
        onAddChild={jest.fn()}
      />
    );

    // Check if both dates are displayed
    expect(screen.getByText(/Due:/)).toBeInTheDocument();
    expect(screen.getByText(/Completed:/)).toBeInTheDocument();
  });
});