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

describe('TodoItem - Overdue Styling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (todoApi.getChildren as jest.Mock).mockResolvedValue([]);
  });

  it('should not have overdue styling for todos without due date', () => {
    const todo: Todo = {
      id: 1,
      title: 'Test Todo',
      status: 'TODO',
      priority: 'MEDIUM',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const { container } = render(
      <TodoItem
        todo={todo}
        onUpdate={jest.fn()}
        onDelete={jest.fn()}
        onAddChild={jest.fn()}
      />
    );

    // Check that the container doesn't have overdue border
    const todoCard = container.querySelector('.bg-card');
    expect(todoCard).not.toHaveClass('border-red-500');
  });

  it('should not have overdue styling for completed todos', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const todo: Todo = {
      id: 1,
      title: 'Test Todo',
      status: 'DONE',
      priority: 'MEDIUM',
      dueDate: yesterday.toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const { container } = render(
      <TodoItem
        todo={todo}
        onUpdate={jest.fn()}
        onDelete={jest.fn()}
        onAddChild={jest.fn()}
      />
    );

    // Check that the container doesn't have overdue border
    const todoCard = container.querySelector('.bg-card');
    expect(todoCard).not.toHaveClass('border-red-500');
  });

  it('should have red border for overdue todos', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const todo: Todo = {
      id: 1,
      title: 'Test Todo',
      status: 'TODO',
      priority: 'MEDIUM',
      dueDate: yesterday.toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const { container } = render(
      <TodoItem
        todo={todo}
        onUpdate={jest.fn()}
        onDelete={jest.fn()}
        onAddChild={jest.fn()}
      />
    );

    // Check that the container has red border
    const todoCard = container.querySelector('.bg-card');
    expect(todoCard).toHaveClass('border-red-500');
  });

  it('should have red text color for overdue due date', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const todo: Todo = {
      id: 1,
      title: 'Test Todo',
      status: 'TODO',
      priority: 'MEDIUM',
      dueDate: yesterday.toISOString(),
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

    // Check that the due date text has red color
    const dueDateElement = screen.getByText(/Due:/);
    expect(dueDateElement).toHaveClass('text-red-600');
  });

  it('should not have overdue styling for todos due today', () => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    const todo: Todo = {
      id: 1,
      title: 'Test Todo',
      status: 'TODO',
      priority: 'MEDIUM',
      dueDate: today.toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const { container } = render(
      <TodoItem
        todo={todo}
        onUpdate={jest.fn()}
        onDelete={jest.fn()}
        onAddChild={jest.fn()}
      />
    );

    // Check that the container doesn't have overdue border
    const todoCard = container.querySelector('.bg-card');
    expect(todoCard).not.toHaveClass('border-red-500');
  });
});