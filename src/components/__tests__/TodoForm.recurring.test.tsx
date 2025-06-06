import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useTranslations } from 'next-intl';
import TodoForm from '../TodoForm';

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: jest.fn(),
}));

const mockT = (key: string) => {
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
};

describe('TodoForm - Recurring Tasks', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useTranslations as jest.Mock).mockReturnValue(mockT);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('shows recurring task settings when checkbox is checked', async () => {
    render(
      <TodoForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isSubmitting={false}
      />
    );

    // Initially, recurring task settings should not be visible
    expect(screen.queryByText('繰り返しパターン')).not.toBeInTheDocument();

    // Check the recurring task checkbox
    const recurringCheckbox = screen.getByLabelText('繰り返しタスク');
    fireEvent.click(recurringCheckbox);

    // Now recurring task settings should be visible
    await waitFor(() => {
      expect(screen.getByText('繰り返しパターン')).toBeInTheDocument();
      expect(screen.getByText('間隔')).toBeInTheDocument();
      expect(screen.getByText('終了日 (任意)')).toBeInTheDocument();
    });
  });

  it('hides recurring task settings when checkbox is unchecked', async () => {
    render(
      <TodoForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isSubmitting={false}
      />
    );

    const recurringCheckbox = screen.getByLabelText('繰り返しタスク');
    
    // Check first
    fireEvent.click(recurringCheckbox);
    await waitFor(() => {
      expect(screen.getByText('繰り返しパターン')).toBeInTheDocument();
    });

    // Then uncheck
    fireEvent.click(recurringCheckbox);
    await waitFor(() => {
      expect(screen.queryByText('繰り返しパターン')).not.toBeInTheDocument();
    });
  });

  it('shows weekly options when WEEKLY is selected', async () => {
    render(
      <TodoForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isSubmitting={false}
      />
    );

    // Enable recurring task
    const recurringCheckbox = screen.getByLabelText('繰り返しタスク');
    fireEvent.click(recurringCheckbox);

    // Select WEEKLY
    const repeatTypeSelect = screen.getByDisplayValue('毎日');
    fireEvent.change(repeatTypeSelect, { target: { value: 'WEEKLY' } });

    await waitFor(() => {
      expect(screen.getByText('曜日選択')).toBeInTheDocument();
      expect(screen.getByText('日')).toBeInTheDocument();
      expect(screen.getByText('月')).toBeInTheDocument();
      expect(screen.getByText('火')).toBeInTheDocument();
    });
  });

  it('shows monthly options when MONTHLY is selected', async () => {
    render(
      <TodoForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isSubmitting={false}
      />
    );

    // Enable recurring task
    const recurringCheckbox = screen.getByLabelText('繰り返しタスク');
    fireEvent.click(recurringCheckbox);

    // Select MONTHLY
    const repeatTypeSelect = screen.getByDisplayValue('毎日');
    fireEvent.change(repeatTypeSelect, { target: { value: 'MONTHLY' } });

    await waitFor(() => {
      expect(screen.getByText('月の何日')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('例: 31 (月末)')).toBeInTheDocument();
    });
  });

  it('allows selecting multiple days for weekly recurring tasks', async () => {
    render(
      <TodoForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isSubmitting={false}
      />
    );

    // Enable recurring task and select WEEKLY
    const recurringCheckbox = screen.getByLabelText('繰り返しタスク');
    fireEvent.click(recurringCheckbox);

    const repeatTypeSelect = screen.getByDisplayValue('毎日');
    fireEvent.change(repeatTypeSelect, { target: { value: 'WEEKLY' } });

    await waitFor(() => {
      const mondayButton = screen.getByText('月');
      const wednesdayButton = screen.getByText('水');
      const fridayButton = screen.getByText('金');

      // Click multiple days
      fireEvent.click(mondayButton);
      fireEvent.click(wednesdayButton);
      fireEvent.click(fridayButton);

      // Buttons should be selected (have different styling)
      expect(mondayButton).toHaveClass('bg-blue-600');
      expect(wednesdayButton).toHaveClass('bg-blue-600');
      expect(fridayButton).toHaveClass('bg-blue-600');
    });
  });

  it('submits form with recurring task data when enabled', async () => {
    render(
      <TodoForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isSubmitting={false}
      />
    );

    // Fill basic fields
    const titleInput = screen.getByRole('textbox', { name: /title/i });
    fireEvent.change(titleInput, { target: { value: 'Test Recurring Task' } });

    // Enable recurring task
    const recurringCheckbox = screen.getByLabelText('繰り返しタスク');
    fireEvent.click(recurringCheckbox);

    // Set interval
    await waitFor(() => {
      const intervalInput = screen.getByDisplayValue('1');
      fireEvent.change(intervalInput, { target: { value: '2' } });
    });

    // Submit form
    const submitButton = screen.getByText('繰り返しタスクを作成');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test Recurring Task',
          isRepeatable: true,
          repeatConfig: expect.objectContaining({
            repeatType: 'DAILY',
            interval: 2,
          }),
        })
      );
    });
  });

  it('submits form without recurring data when disabled', async () => {
    render(
      <TodoForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isSubmitting={false}
      />
    );

    // Fill basic fields
    const titleInput = screen.getByRole('textbox', { name: /title/i });
    fireEvent.change(titleInput, { target: { value: 'Regular Task' } });

    // Submit form without enabling recurring task
    const submitButton = screen.getByText('Create Todo');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Regular Task',
          isRepeatable: false,
        })
      );
    });
  });

  it('updates button text when recurring task is enabled', async () => {
    render(
      <TodoForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isSubmitting={false}
      />
    );

    // Initially shows regular create button
    expect(screen.getByText('Create Todo')).toBeInTheDocument();

    // Enable recurring task
    const recurringCheckbox = screen.getByLabelText('繰り返しタスク');
    fireEvent.click(recurringCheckbox);

    // Button text should change
    await waitFor(() => {
      expect(screen.getByText('繰り返しタスクを作成')).toBeInTheDocument();
      expect(screen.queryByText('Create Todo')).not.toBeInTheDocument();
    });
  });
});