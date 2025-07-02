import { render, screen, fireEvent, waitFor } from '@/test/test-utils';
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

// Mock toast notifications
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

const mockTodo: Todo = {
  id: 1,
  title: 'Parent Todo',
  description: 'Parent description',
  status: 'TODO',
  priority: 'MEDIUM',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockChildTodos: Todo[] = [
  {
    id: 2,
    title: 'Child Todo 1',
    status: 'TODO',
    priority: 'LOW',
    parentId: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 3,
    title: 'Child Todo 2',
    status: 'DONE',
    priority: 'HIGH',
    parentId: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

describe('TodoItem - Subtasks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show subtask toggle button when todo has children', async () => {
    // Mock API to return children
    (todoApi.getChildren as jest.Mock).mockResolvedValue(mockChildTodos);

    render(
      <TodoItem
        todo={mockTodo}
        onUpdate={jest.fn()}
        onDelete={jest.fn()}
        onAddChild={jest.fn()}
      />
    );

    // Toggle button should be visible when children exist
    await waitFor(() => {
      const toggleButton = screen.getByLabelText('Show subtasks');
      expect(toggleButton).toBeInTheDocument();
    });
  });

  it('should not show subtask toggle for subtasks themselves', () => {
    render(
      <TodoItem
        todo={mockChildTodos[0]}
        onUpdate={jest.fn()}
        onDelete={jest.fn()}
        onAddChild={jest.fn()}
        level={1}
      />
    );

    // Toggle button should not exist for subtasks
    const toggleButton = screen.queryByLabelText('Show subtasks');
    expect(toggleButton).not.toBeInTheDocument();
  });

  it('should load and display subtasks when toggle is clicked', async () => {
    (todoApi.getChildren as jest.Mock).mockResolvedValue(mockChildTodos);

    render(
      <TodoItem
        todo={mockTodo}
        onUpdate={jest.fn()}
        onDelete={jest.fn()}
        onAddChild={jest.fn()}
      />
    );

    // Wait for initial render
    await waitFor(() => {
      expect(screen.getByText('Parent Todo')).toBeInTheDocument();
    });

    // Click toggle to show subtasks
    const toggleButton = screen.getByLabelText('Show subtasks');
    fireEvent.click(toggleButton);

    // Should show loading state
    expect(screen.getByText('Loading subtasks...')).toBeInTheDocument();

    // Wait for subtasks to load and display
    await waitFor(() => {
      expect(screen.getByText('Child Todo 1')).toBeInTheDocument();
      expect(screen.getByText('Child Todo 2')).toBeInTheDocument();
    });

    // Verify API was called
    expect(todoApi.getChildren).toHaveBeenCalledWith(1);
  });

  it('should toggle subtasks visibility', async () => {
    (todoApi.getChildren as jest.Mock).mockResolvedValue(mockChildTodos);

    render(
      <TodoItem
        todo={mockTodo}
        onUpdate={jest.fn()}
        onDelete={jest.fn()}
        onAddChild={jest.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Parent Todo')).toBeInTheDocument();
    });

    // Show subtasks
    const toggleButton = screen.getByLabelText('Show subtasks');
    fireEvent.click(toggleButton);

    await waitFor(() => {
      expect(screen.getByText('Child Todo 1')).toBeInTheDocument();
    });

    // Hide subtasks
    const hideButton = screen.getByLabelText('Hide subtasks');
    fireEvent.click(hideButton);

    await waitFor(() => {
      expect(screen.queryByText('Child Todo 1')).not.toBeInTheDocument();
    });
  });

  it('should render subtasks with proper indentation', async () => {
    (todoApi.getChildren as jest.Mock).mockResolvedValue(mockChildTodos);

    const { container } = render(
      <TodoItem
        todo={mockTodo}
        onUpdate={jest.fn()}
        onDelete={jest.fn()}
        onAddChild={jest.fn()}
      />
    );

    // Wait for the toggle button to appear
    await waitFor(() => {
      expect(screen.getByLabelText('Show subtasks')).toBeInTheDocument();
    });

    // Show subtasks
    const toggleButton = screen.getByLabelText('Show subtasks');
    fireEvent.click(toggleButton);

    await waitFor(() => {
      expect(screen.getByText('Child Todo 1')).toBeInTheDocument();
    });

    // Check that subtasks have proper indentation styling
    const subtaskElements = container.querySelectorAll('.ml-8');
    expect(subtaskElements.length).toBeGreaterThan(0);
  });

  it('should show add subtask button only for parent todos', () => {
    render(
      <TodoItem
        todo={mockTodo}
        onUpdate={jest.fn()}
        onDelete={jest.fn()}
        onAddChild={jest.fn()}
        level={0}
      />
    );

    // Parent should have add subtask button
    expect(screen.getByText('Add Subtask')).toBeInTheDocument();
  });

  it('should not show add subtask button for subtasks', () => {
    render(
      <TodoItem
        todo={mockChildTodos[0]}
        onUpdate={jest.fn()}
        onDelete={jest.fn()}
        onAddChild={jest.fn()}
        level={1}
      />
    );

    // Subtask should not have add subtask button
    expect(screen.queryByText('Add Subtask')).not.toBeInTheDocument();
  });

  it('should handle empty subtasks gracefully', async () => {
    (todoApi.getChildren as jest.Mock).mockResolvedValue([]);

    render(
      <TodoItem
        todo={mockTodo}
        onUpdate={jest.fn()}
        onDelete={jest.fn()}
        onAddChild={jest.fn()}
      />
    );

    // With no children, toggle button should not be visible
    await waitFor(() => {
      const toggleButton = screen.queryByLabelText('Show subtasks');
      expect(toggleButton).not.toBeInTheDocument();
    });
  });

  it('should propagate callbacks to subtasks', async () => {
    (todoApi.getChildren as jest.Mock).mockResolvedValue(mockChildTodos);
    
    const onUpdate = jest.fn();
    const onDelete = jest.fn();
    const onAddChild = jest.fn();

    render(
      <TodoItem
        todo={mockTodo}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onAddChild={onAddChild}
      />
    );

    // Wait for the toggle button to appear
    await waitFor(() => {
      expect(screen.getByLabelText('Show subtasks')).toBeInTheDocument();
    });

    // Show subtasks
    const toggleButton = screen.getByLabelText('Show subtasks');
    fireEvent.click(toggleButton);

    await waitFor(() => {
      expect(screen.getByText('Child Todo 1')).toBeInTheDocument();
    });

    // Click edit on a subtask
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[1]); // Click edit on first subtask

    expect(onUpdate).toHaveBeenCalledWith(2, mockChildTodos[0]);
  });
});