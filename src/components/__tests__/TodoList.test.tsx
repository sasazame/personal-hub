import { render, screen, fireEvent } from '@testing-library/react';
import TodoList from '../TodoList';
import { Todo } from '@/types/todo';

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

    expect(screen.getByText('TODO')).toBeInTheDocument();
    expect(screen.getByText('IN PROGRESS')).toBeInTheDocument();
  });

  it('displays correct priority indicators', () => {
    render(
      <TodoList
        todos={mockTodos}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('HIGH')).toBeInTheDocument();
    expect(screen.getByText('MEDIUM')).toBeInTheDocument();
  });

  it('displays due date when available', () => {
    render(
      <TodoList
        todos={mockTodos}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText(/Due: 12\/31\/2024/)).toBeInTheDocument();
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

  it('calls onDelete when Delete button is clicked', () => {
    render(
      <TodoList
        todos={mockTodos}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    expect(mockOnDelete).toHaveBeenCalledWith(1, mockTodos[0]);
  });

  it('renders empty list when no todos provided', () => {
    const { container } = render(
      <TodoList
        todos={[]}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    expect(container.firstChild?.childNodes.length).toBe(0);
  });
});