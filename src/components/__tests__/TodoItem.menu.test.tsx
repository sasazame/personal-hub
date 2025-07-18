import { render, screen, fireEvent, waitFor } from '@/test/test-utils';
import TodoItem from '../TodoItem';
import { Todo } from '@/types/todo';
import { todoApi } from '@/lib/api';

// Mock the API
jest.mock('@/lib/api', () => ({
  todoApi: {
    getChildren: jest.fn(),
    toggleStatus: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  }
}));

// Mock toast
jest.mock('@/components/ui/toast', () => ({
  showSuccess: jest.fn(),
  showError: jest.fn(),
}));

// Mock useTheme hook
jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({ theme: 'light' }),
}));

// Mock DropdownMenu to simplify testing
jest.mock('@/components/ui/DropdownMenu', () => ({
  DropdownMenu: ({ items }: { items: Array<{ label: string; onClick: () => void }> }) => (
    <div data-testid="dropdown-menu">
      {items.map((item, index) => (
        <button key={index} onClick={item.onClick}>
          {item.label}
        </button>
      ))}
    </div>
  ),
}));

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'common.edit': 'Edit',
      'common.delete': 'Delete',
      'todo.duplicate': 'Duplicate',
      'todo.createSubtask': 'Create Subtask',
      'todo.addSubtask': 'Add Subtask',
      'todo.todoCompleted': 'Todo completed',
      'todo.todoUpdated': 'Todo updated',
      'todo.todoDuplicated': 'Todo duplicated',
      'todo.todoDeleted': 'Todo deleted',
      'todo.markComplete': 'Mark as complete',
      'todo.markIncomplete': 'Mark as incomplete',
      'todo.dueDateLabel': 'Due:',
      'todo.statusOptions.TODO': 'To Do',
      'todo.statusOptions.IN_PROGRESS': 'In Progress',
      'todo.statusOptions.DONE': 'Done',
      'todo.priorityOptions.LOW': 'Low',
      'todo.priorityOptions.MEDIUM': 'Medium',
      'todo.priorityOptions.HIGH': 'High',
      'errors.general': 'An error occurred',
    };
    return translations[key] || key;
  },
}));

const mockTodo: Todo = {
  id: 1,
  title: 'Test Todo',
  description: 'Test description',
  status: 'TODO',
  priority: 'MEDIUM',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('TodoItem - Kebab Menu', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (todoApi.getChildren as jest.Mock).mockResolvedValue([]);
  });

  it('should render kebab menu instead of edit button', () => {
    render(
      <TodoItem
        todo={mockTodo}
        onUpdate={jest.fn()}
        onDelete={jest.fn()}
        onAddChild={jest.fn()}
      />
    );

    // Should have the dropdown menu
    expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument();
  });

  it('should show menu items', () => {
    render(
      <TodoItem
        todo={mockTodo}
        onUpdate={jest.fn()}
        onDelete={jest.fn()}
        onAddChild={jest.fn()}
      />
    );

    // Check menu items are rendered
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Create Subtask')).toBeInTheDocument();
    expect(screen.getByText('Duplicate')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('should call onUpdate when Edit is clicked', () => {
    const mockOnUpdate = jest.fn();
    
    render(
      <TodoItem
        todo={mockTodo}
        onUpdate={mockOnUpdate}
        onDelete={jest.fn()}
        onAddChild={jest.fn()}
      />
    );

    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);

    expect(mockOnUpdate).toHaveBeenCalledWith(mockTodo.id, mockTodo);
  });

  it('should call onAddChild when Create Subtask is clicked', () => {
    const mockOnAddChild = jest.fn();
    
    render(
      <TodoItem
        todo={mockTodo}
        onUpdate={jest.fn()}
        onDelete={jest.fn()}
        onAddChild={mockOnAddChild}
      />
    );

    const createSubtaskButton = screen.getByText('Create Subtask');
    fireEvent.click(createSubtaskButton);

    expect(mockOnAddChild).toHaveBeenCalledWith(mockTodo.id);
  });

  it('should duplicate todo when Duplicate is clicked', async () => {
    const mockOnUpdate = jest.fn();
    (todoApi.create as jest.Mock).mockResolvedValue({
      ...mockTodo,
      id: 2,
      title: 'Test Todo (copy)',
    });
    
    render(
      <TodoItem
        todo={mockTodo}
        onUpdate={mockOnUpdate}
        onDelete={jest.fn()}
        onAddChild={jest.fn()}
      />
    );

    const duplicateButton = screen.getByText('Duplicate');
    fireEvent.click(duplicateButton);

    await waitFor(() => {
      expect(todoApi.create).toHaveBeenCalledWith({
        title: 'Test Todo (copy)',
        description: mockTodo.description,
        status: mockTodo.status,
        priority: mockTodo.priority,
        dueDate: mockTodo.dueDate,
      });
    });
  });

  it('should call onDelete when Delete is clicked', () => {
    const mockOnDelete = jest.fn();
    
    render(
      <TodoItem
        todo={mockTodo}
        onUpdate={jest.fn()}
        onDelete={mockOnDelete}
        onAddChild={jest.fn()}
      />
    );

    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledWith(mockTodo.id, mockTodo);
  });

  it('should not show Create Subtask option for subtasks', () => {
    render(
      <TodoItem
        todo={mockTodo}
        onUpdate={jest.fn()}
        onDelete={jest.fn()}
        onAddChild={jest.fn()}
        level={1} // This is a subtask
      />
    );

    // Check that Create Subtask is not in the menu
    expect(screen.queryByText('Create Subtask')).not.toBeInTheDocument();
    
    // But other options should still be there
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Duplicate')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  // Skip this test as it relies on Headless UI behavior
  it.skip('should close menu when clicking outside', () => {
    // This test is skipped because our mock doesn't simulate the closing behavior
  });
});