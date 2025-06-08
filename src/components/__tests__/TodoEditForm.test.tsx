import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TodoEditForm from '../TodoEditForm';
import { Todo } from '@/types/todo';

// Mock useTranslations
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'todo.editTodo': 'Edit TODO',
      'todo.todoTitle': 'Title',
      'todo.titleRequired': 'Title is required',
      'todo.todoDescription': 'Description',
      'todo.todoStatus': 'Status',
      'todo.todoPriority': 'Priority',
      'todo.dueDate': 'Due Date',
      'todo.statusOptions.TODO': 'TODO',
      'todo.statusOptions.IN_PROGRESS': 'In Progress',
      'todo.statusOptions.DONE': 'Done',
      'todo.priorityOptions.LOW': 'Low',
      'todo.priorityOptions.MEDIUM': 'Medium',
      'todo.priorityOptions.HIGH': 'High',
      'todo.updateTodo': 'Update TODO',
      'todo.deleteTodo': 'Delete TODO',
      'todo.updating': 'Updating...',
      'todo.deleting': 'Deleting...',
      'common.cancel': 'Cancel',
      'common.loading': 'Loading...',
      'common.delete': 'Delete',
    };
    return translations[key] || key;
  },
}));

describe('TodoEditForm', () => {
  const mockTodo: Todo = {
    id: 1,
    title: 'Existing Todo',
    description: 'Existing description',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    dueDate: '2024-12-31T00:00:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders form with existing todo data', () => {
    render(
      <TodoEditForm
        todo={mockTodo}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByDisplayValue('Existing Todo')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Existing description')).toBeInTheDocument();
    
    const statusSelect = screen.getByLabelText('Status') as HTMLSelectElement;
    expect(statusSelect.value).toBe('IN_PROGRESS');
    
    const prioritySelect = screen.getByLabelText('Priority') as HTMLSelectElement;
    expect(prioritySelect.value).toBe('HIGH');
    
    expect(screen.getByDisplayValue('2024-12-31')).toBeInTheDocument();
  });

  it('shows validation error when title is cleared', async () => {
    const user = userEvent.setup();
    
    render(
      <TodoEditForm
        todo={mockTodo}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        onDelete={mockOnDelete}
      />
    );

    const titleInput = screen.getByLabelText('Title *');
    await user.clear(titleInput);

    const submitButton = screen.getByText('Update TODO');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('submits form with updated data', async () => {
    const user = userEvent.setup();
    
    render(
      <TodoEditForm
        todo={mockTodo}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        onDelete={mockOnDelete}
      />
    );

    const titleInput = screen.getByLabelText('Title *');
    await user.clear(titleInput);
    await user.type(titleInput, 'Updated Todo');

    await user.selectOptions(screen.getByLabelText('Status'), 'DONE');

    const submitButton = screen.getByText('Update TODO');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      const callArgs = mockOnSubmit.mock.calls[0][0];
      expect(callArgs).toEqual({
        title: 'Updated Todo',
        description: 'Existing description',
        status: 'DONE',
        priority: 'HIGH',
        dueDate: '2024-12-31',
        isRepeatable: false,
        repeatConfig: null,
      });
    });
  });

  it('calls onCancel when Cancel button is clicked', () => {
    render(
      <TodoEditForm
        todo={mockTodo}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        onDelete={mockOnDelete}
      />
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('disables buttons when submitting', () => {
    render(
      <TodoEditForm
        todo={mockTodo}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        onDelete={mockOnDelete}
        isSubmitting={true}
      />
    );

    expect(screen.getByText('Updating...')).toBeDisabled();
    expect(screen.getByText('Cancel')).toBeDisabled();
    expect(screen.getByText('Delete')).toBeDisabled();
  });

  it('handles todo without due date', () => {
    const todoWithoutDueDate = { ...mockTodo, dueDate: undefined };
    
    render(
      <TodoEditForm
        todo={todoWithoutDueDate}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        onDelete={mockOnDelete}
      />
    );

    const dueDateInput = screen.getByLabelText('Due Date') as HTMLInputElement;
    expect(dueDateInput.value).toBe('');
  });

  it('has visible text in input fields', () => {
    render(
      <TodoEditForm
        todo={mockTodo}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        onDelete={mockOnDelete}
      />
    );

    const titleInput = screen.getByLabelText('Title *');
    const descriptionTextarea = screen.getByLabelText('Description');
    const statusSelect = screen.getByLabelText('Status');
    const prioritySelect = screen.getByLabelText('Priority');
    const dueDateInput = screen.getByLabelText('Due Date');

    expect(titleInput).toHaveClass('text-foreground');
    expect(descriptionTextarea).toHaveClass('text-foreground');
    expect(statusSelect).toHaveClass('text-foreground');
    expect(prioritySelect).toHaveClass('text-foreground');
    expect(dueDateInput).toHaveClass('text-foreground');
  });

  it('calls onDelete when Delete button is clicked', () => {
    render(
      <TodoEditForm
        todo={mockTodo}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        onDelete={mockOnDelete}
      />
    );

    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalled();
  });

  it('disables buttons when deleting', () => {
    render(
      <TodoEditForm
        todo={mockTodo}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        onDelete={mockOnDelete}
        isDeleting={true}
      />
    );

    expect(screen.getByText('Loading...')).toBeDisabled();
    expect(screen.getByText('Update TODO')).toBeDisabled();
    expect(screen.getByText('Cancel')).toBeDisabled();
  });
});