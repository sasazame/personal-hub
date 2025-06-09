import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TodoForm from '../TodoForm';

// Mock useTranslations
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'todo.createNewTodo': 'Create New TODO',
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
      'todo.createTodo': 'Create TODO',
      'todo.updateTodo': 'Update TODO',
      'todo.creating': 'Creating...',
      'todo.updating': 'Updating...',
      'common.cancel': 'Cancel',
      'common.loading': 'Loading...',
    };
    return translations[key] || key;
  },
}));

describe('TodoForm', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders form fields correctly', () => {
    render(
      <TodoForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByLabelText('Title *')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByLabelText('Status')).toBeInTheDocument();
    expect(screen.getByLabelText('Priority')).toBeInTheDocument();
    expect(screen.getByLabelText('Due Date')).toBeInTheDocument();
  });

  it('shows validation error when title is empty', async () => {
    render(
      <TodoForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const submitButton = screen.getByText('Create TODO');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('submits form with correct data', async () => {
    const user = userEvent.setup();
    
    render(
      <TodoForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    await user.type(screen.getByLabelText('Title *'), 'New Todo');
    await user.type(screen.getByLabelText('Description'), 'Todo description');
    await user.selectOptions(screen.getByLabelText('Status'), 'IN_PROGRESS');
    await user.selectOptions(screen.getByLabelText('Priority'), 'HIGH');

    const submitButton = screen.getByText('Create TODO');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      const callArgs = mockOnSubmit.mock.calls[0][0];
      expect(callArgs).toMatchObject({
        title: 'New Todo',
        description: 'Todo description',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
      });
    });
  });

  it('calls onCancel when Cancel button is clicked', () => {
    render(
      <TodoForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('disables buttons when submitting', () => {
    render(
      <TodoForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isSubmitting={true}
      />
    );

    expect(screen.getByText('Creating...')).toBeDisabled();
    expect(screen.getByText('Cancel')).toBeDisabled();
  });

  it('has correct default values', () => {
    render(
      <TodoForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByLabelText('Status')).toHaveValue('TODO');
    expect(screen.getByLabelText('Priority')).toHaveValue('MEDIUM');
  });

  it('has visible text in input fields', () => {
    render(
      <TodoForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
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
});