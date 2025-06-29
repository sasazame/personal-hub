import { render, screen, fireEvent } from '@testing-library/react';
import { GoalCard } from '../GoalCard';
import { GoalType, MetricType, GoalStatus, type GoalWithStatus } from '@/types/goal';
import { ThemeProvider } from '@/contexts/ThemeContext';

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string, params?: Record<string, string | number>) => {
    const translations: Record<string, string> = {
      'goal.noStreak': 'No streak',
      'goal.streakDays': params?.count === 1 ? '1 day' : `${params?.count} days`,
      'goal.streakWeeks': params?.count === 1 ? '1 week' : `${params?.count} weeks`,
      'goal.streakMonths': params?.count === 1 ? '1 month' : `${params?.count} months`,
      'goal.streakYears': params?.count === 1 ? '1 year' : `${params?.count} years`,
      'goal.streakContinuous': `${params?.count} ${params?.unit}`,
      'goal.units.days': 'days',
      'goal.units.weeks': 'weeks',
      'goal.units.months': 'months',
      'goal.units.years': 'years',
      'goal.periods': 'periods',
      'goal.types.daily': 'Daily',
      'goal.types.weekly': 'Weekly',
      'goal.types.monthly': 'Monthly',
      'goal.types.annual': 'Annual',
      'goal.active': 'Active',
      'goal.inactive': 'Inactive',
      'goal.toggleCompletion': params?.title ? `Mark ${params.title} as complete` : 'Toggle completion',
      'goal.toggleActive': params?.title ? `Toggle active status for ${params.title}` : 'Toggle active',
      'common.edit': 'Edit',
      'common.delete': 'Delete',
    };
    return translations[key] || key;
  },
}));

describe('GoalCard', () => {
  const mockOnToggleCompletion = jest.fn();
  const mockOnToggleActive = jest.fn();
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  const renderWithTheme = (ui: React.ReactElement) => {
    return render(<ThemeProvider>{ui}</ThemeProvider>);
  };

  const testGoal: GoalWithStatus = {
    id: 1,
    title: 'Test Goal',
    description: 'Test description',
    goalType: GoalType.DAILY,
    metricType: MetricType.COUNT,
    targetValue: 1,
    currentValue: 0,
    progressPercentage: 0,
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    status: GoalStatus.ACTIVE,
    isActive: true,
    completed: false,
    currentStreak: 5,
    longestStreak: 10,
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01',
  };

  const selectedDate = new Date('2025-01-28');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders goal title and description', () => {
    renderWithTheme(
      <GoalCard
        goal={testGoal}
        selectedDate={selectedDate}
        onToggleCompletion={mockOnToggleCompletion}
        onToggleActive={mockOnToggleActive}
      />
    );
    
    expect(screen.getByText('Test Goal')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('displays streak badge when streak is greater than 0', () => {
    renderWithTheme(
      <GoalCard
        goal={testGoal}
        selectedDate={selectedDate}
        onToggleCompletion={mockOnToggleCompletion}
        onToggleActive={mockOnToggleActive}
      />
    );
    
    expect(screen.getByText('5 days')).toBeInTheDocument();
  });

  it('does not display streak badge when streak is less than 2', () => {
    const goalWithNoStreak = { ...testGoal, currentStreak: 1 };
    renderWithTheme(
      <GoalCard
        goal={goalWithNoStreak}
        selectedDate={selectedDate}
        onToggleCompletion={mockOnToggleCompletion}
        onToggleActive={mockOnToggleActive}
      />
    );
    
    expect(screen.queryByText(/days/)).not.toBeInTheDocument();
  });

  it('shows correct streak format for different goal types', () => {
    const weeklyGoal = { ...testGoal, goalType: GoalType.WEEKLY, currentStreak: 3 };
    renderWithTheme(
      <GoalCard
        goal={weeklyGoal}
        selectedDate={selectedDate}
        onToggleCompletion={mockOnToggleCompletion}
        onToggleActive={mockOnToggleActive}
      />
    );
    expect(screen.getByText('3 weeks')).toBeInTheDocument();
  });

  it('shows correct streak format for monthly goals', () => {
    const monthlyGoal = { ...testGoal, goalType: GoalType.MONTHLY, currentStreak: 2 };
    renderWithTheme(
      <GoalCard
        goal={monthlyGoal}
        selectedDate={selectedDate}
        onToggleCompletion={mockOnToggleCompletion}
        onToggleActive={mockOnToggleActive}
      />
    );
    expect(screen.getByText('2 months')).toBeInTheDocument();
  });

  it('toggles completion when checkbox is clicked', () => {
    renderWithTheme(
      <GoalCard
        goal={testGoal}
        selectedDate={selectedDate}
        onToggleCompletion={mockOnToggleCompletion}
        onToggleActive={mockOnToggleActive}
      />
    );
    
    const checkbox = screen.getByRole('checkbox', { name: /Mark Test Goal as/i });
    fireEvent.click(checkbox);
    
    expect(mockOnToggleCompletion).toHaveBeenCalledWith('1');
  });

  it('shows completed state correctly', () => {
    const completedGoal = { ...testGoal, completed: true };
    renderWithTheme(
      <GoalCard
        goal={completedGoal}
        selectedDate={selectedDate}
        onToggleCompletion={mockOnToggleCompletion}
        onToggleActive={mockOnToggleActive}
      />
    );
    
    const checkbox = screen.getByRole('checkbox', { name: /Mark Test Goal as/i });
    expect(checkbox).toBeChecked();
    expect(screen.getByText('Test Goal')).toHaveClass('line-through');
  });

  it('disables checkbox when goal is inactive', () => {
    const inactiveGoal = { ...testGoal, isActive: false };
    renderWithTheme(
      <GoalCard
        goal={inactiveGoal}
        selectedDate={selectedDate}
        onToggleCompletion={mockOnToggleCompletion}
        onToggleActive={mockOnToggleActive}
      />
    );
    
    const checkbox = screen.getByRole('checkbox', { name: /Mark Test Goal as/i });
    expect(checkbox).toBeDisabled();
  });

  it.skip('calls onEdit when edit menu item is clicked', () => {
    renderWithTheme(
      <GoalCard
        goal={testGoal}
        selectedDate={selectedDate}
        onToggleCompletion={mockOnToggleCompletion}
        onToggleActive={mockOnToggleActive}
        onEdit={mockOnEdit}
      />
    );
    
    const menuButton = screen.getAllByRole('button')[0]; // Get the ellipsis menu button
    fireEvent.click(menuButton);
    
    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);
    
    expect(mockOnEdit).toHaveBeenCalledWith(testGoal);
  });

  it.skip('calls onDelete when delete menu item is clicked', () => {
    renderWithTheme(
      <GoalCard
        goal={testGoal}
        selectedDate={selectedDate}
        onToggleCompletion={mockOnToggleCompletion}
        onToggleActive={mockOnToggleActive}
        onDelete={mockOnDelete}
      />
    );
    
    const menuButton = screen.getAllByRole('button')[0]; // Get the ellipsis menu button
    fireEvent.click(menuButton);
    
    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);
    
    expect(mockOnDelete).toHaveBeenCalledWith(testGoal);
  });
});