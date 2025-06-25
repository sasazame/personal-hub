import { render, screen, fireEvent } from '@testing-library/react';
import TodoStatusFilter from '../TodoStatusFilter';

// Mock useTranslations to return actual strings
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'todo.filter.all': 'すべて',
      'todo.statusOptions.TODO': '未着手',
      'todo.statusOptions.IN_PROGRESS': '進行中',
      'todo.statusOptions.DONE': '完了',
    };
    return translations[key] || key;
  },
}));

describe('TodoStatusFilter', () => {
  const mockOnStatusChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all status options', () => {
    render(
      <TodoStatusFilter selectedStatus="ALL" onStatusChange={mockOnStatusChange} />
    );

    expect(screen.getByText('すべて')).toBeInTheDocument();
    expect(screen.getByText('未着手')).toBeInTheDocument();
    expect(screen.getByText('進行中')).toBeInTheDocument();
    expect(screen.getByText('完了')).toBeInTheDocument();
  });

  it('highlights the selected status', () => {
    render(
      <TodoStatusFilter selectedStatus="TODO" onStatusChange={mockOnStatusChange} />
    );

    const todoButton = screen.getByText('未着手');
    const allButton = screen.getByText('すべて');
    
    expect(todoButton.closest('button')).toHaveClass('bg-gradient-to-b', 'from-primary-600', 'to-primary-700');
    expect(allButton.closest('button')).toHaveClass('bg-white');
  });

  it('calls onStatusChange when a status is clicked', () => {
    render(
      <TodoStatusFilter selectedStatus="ALL" onStatusChange={mockOnStatusChange} />
    );

    const inProgressButton = screen.getByText('進行中');
    fireEvent.click(inProgressButton);

    expect(mockOnStatusChange).toHaveBeenCalledTimes(1);
    expect(mockOnStatusChange).toHaveBeenCalledWith('IN_PROGRESS');
  });

  it('calls onStatusChange with ALL when すべて is clicked', () => {
    render(
      <TodoStatusFilter selectedStatus="TODO" onStatusChange={mockOnStatusChange} />
    );

    const allButton = screen.getByText('すべて');
    fireEvent.click(allButton);

    expect(mockOnStatusChange).toHaveBeenCalledTimes(1);
    expect(mockOnStatusChange).toHaveBeenCalledWith('ALL');
  });

  it('updates button styles when selectedStatus changes', () => {
    const { rerender } = render(
      <TodoStatusFilter selectedStatus="ALL" onStatusChange={mockOnStatusChange} />
    );

    let allButton = screen.getByText('すべて');
    expect(allButton.closest('button')).toHaveClass('bg-gradient-to-b', 'from-primary-600', 'to-primary-700');

    rerender(
      <TodoStatusFilter selectedStatus="DONE" onStatusChange={mockOnStatusChange} />
    );

    const doneButton = screen.getByText('完了');
    allButton = screen.getByText('すべて');
    
    expect(doneButton.closest('button')).toHaveClass('bg-blue-600');
    expect(allButton.closest('button')).toHaveClass('bg-gray-600');
  });
});