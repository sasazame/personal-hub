import { render, screen, fireEvent } from '@testing-library/react';
import { FilterTabs } from '../FilterTabs';

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string, params?: Record<string, string | number>) => {
    const translations: Record<string, string> = {
      'goal.filterActive': 'Active',
      'goal.filterInactive': 'Inactive',
      'goal.filterAll': 'All',
      'goal.filterBy': params ? `Filter by ${params.filter} goals` : 'Filter by',
    };
    return translations[key] || key;
  },
}));

describe('FilterTabs', () => {
  const mockOnFilterChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all filter options', () => {
    render(<FilterTabs activeFilter="active" onFilterChange={mockOnFilterChange} />);
    
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Inactive')).toBeInTheDocument();
    expect(screen.getByText('All')).toBeInTheDocument();
  });

  it('highlights the active filter', () => {
    render(<FilterTabs activeFilter="active" onFilterChange={mockOnFilterChange} />);
    
    const activeButton = screen.getByText('Active');
    expect(activeButton).toHaveClass('bg-blue-600');
    
    const inactiveButton = screen.getByText('Inactive');
    expect(inactiveButton).toHaveClass('bg-gray-600');
  });

  it('calls onFilterChange when a filter is clicked', () => {
    render(<FilterTabs activeFilter="active" onFilterChange={mockOnFilterChange} />);
    
    fireEvent.click(screen.getByText('Inactive'));
    expect(mockOnFilterChange).toHaveBeenCalledWith('inactive');
    
    fireEvent.click(screen.getByText('All'));
    expect(mockOnFilterChange).toHaveBeenCalledWith('all');
  });

  it('updates button styles based on active filter', () => {
    const { rerender } = render(<FilterTabs activeFilter="active" onFilterChange={mockOnFilterChange} />);
    
    expect(screen.getByText('Active')).toHaveClass('bg-blue-600');
    expect(screen.getByText('Inactive')).toHaveClass('bg-gray-600');
    
    rerender(<FilterTabs activeFilter="inactive" onFilterChange={mockOnFilterChange} />);
    
    expect(screen.getByText('Active')).toHaveClass('bg-gray-600');
    expect(screen.getByText('Inactive')).toHaveClass('bg-blue-600');
  });
});