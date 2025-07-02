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
      'todo.addSubtask': 'Add Subtask',
      'common.edit': 'Edit',
      'common.delete': 'Delete',
      'todo.duplicate': 'Duplicate',
      'todo.createSubtask': 'Create Subtask',
    };
    return translations[key] || key;
  },
}));

describe('TodoItem - Status Display', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (todoApi.getChildren as jest.Mock).mockResolvedValue([]);
  });

  it('should display "Not Started" for TODO status', () => {
    const todo: Todo = {
      id: 1,
      title: 'Test Todo',
      status: 'TODO',
      priority: 'MEDIUM',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    render(
      <TodoItem
        todo={todo}
        onUpdate={jest.fn()}
        onDelete={jest.fn()}
        onAddChild={jest.fn()}
      />
    );

    expect(screen.getByText('Not Started')).toBeInTheDocument();
  });

  it('should display "In Progress" for IN_PROGRESS status', () => {
    const todo: Todo = {
      id: 1,
      title: 'Test Todo',
      status: 'IN_PROGRESS',
      priority: 'MEDIUM',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    render(
      <TodoItem
        todo={todo}
        onUpdate={jest.fn()}
        onDelete={jest.fn()}
        onAddChild={jest.fn()}
      />
    );

    expect(screen.getByText('In Progress')).toBeInTheDocument();
  });

  it('should display "Completed" for DONE status', () => {
    const todo: Todo = {
      id: 1,
      title: 'Test Todo',
      status: 'DONE',
      priority: 'MEDIUM',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    render(
      <TodoItem
        todo={todo}
        onUpdate={jest.fn()}
        onDelete={jest.fn()}
        onAddChild={jest.fn()}
      />
    );

    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('should use correct color for TODO status', () => {
    const todo: Todo = {
      id: 1,
      title: 'Test Todo',
      status: 'TODO',
      priority: 'MEDIUM',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    render(
      <TodoItem
        todo={todo}
        onUpdate={jest.fn()}
        onDelete={jest.fn()}
        onAddChild={jest.fn()}
      />
    );

    const statusBadge = screen.getByText('Not Started');
    expect(statusBadge).toHaveClass('bg-status-pending-bg', 'text-status-pending-text');
  });

  it('should use correct color for DONE status', () => {
    const todo: Todo = {
      id: 1,
      title: 'Test Todo',
      status: 'DONE',
      priority: 'MEDIUM',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    render(
      <TodoItem
        todo={todo}
        onUpdate={jest.fn()}
        onDelete={jest.fn()}
        onAddChild={jest.fn()}
      />
    );

    const statusBadge = screen.getByText('Completed');
    expect(statusBadge).toHaveClass('bg-status-completed-bg', 'text-status-completed-text');
  });
});