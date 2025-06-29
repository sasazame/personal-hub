import { render, screen, fireEvent } from '@testing-library/react';
import { DateNavigationHeader } from '../DateNavigationHeader';
import { format, addDays, subDays } from 'date-fns';
import { ThemeProvider } from '@/contexts/ThemeContext';

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'goal.previousDay': 'Previous day',
      'goal.nextDay': 'Next day',
      'goal.today': 'Today',
      'goal.changeDate': 'Change date',
      'goal.shortcuts': 'Shortcuts',
    };
    return translations[key] || key;
  },
  useLocale: () => 'en',
}));

describe('DateNavigationHeader', () => {
  const mockOnDateChange = jest.fn();
  const testDate = new Date('2025-01-28');

  const renderWithTheme = (ui: React.ReactElement) => {
    return render(
      <ThemeProvider>
        {ui}
      </ThemeProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with the selected date', () => {
    renderWithTheme(<DateNavigationHeader selectedDate={testDate} onDateChange={mockOnDateChange} />);
    
    expect(screen.getByText(format(testDate, 'EEEE, MMMM d, yyyy'))).toBeInTheDocument();
  });

  it('navigates to previous day when previous button clicked', () => {
    renderWithTheme(<DateNavigationHeader selectedDate={testDate} onDateChange={mockOnDateChange} />);
    
    const prevButton = screen.getByLabelText('Previous day');
    fireEvent.click(prevButton);
    
    expect(mockOnDateChange).toHaveBeenCalledWith(subDays(testDate, 1));
  });

  it('navigates to next day when next button clicked', () => {
    renderWithTheme(<DateNavigationHeader selectedDate={testDate} onDateChange={mockOnDateChange} />);
    
    const nextButton = screen.getByLabelText('Next day');
    fireEvent.click(nextButton);
    
    expect(mockOnDateChange).toHaveBeenCalledWith(addDays(testDate, 1));
  });

  it('navigates to today when today button clicked', () => {
    renderWithTheme(<DateNavigationHeader selectedDate={testDate} onDateChange={mockOnDateChange} />);
    
    const todayButton = screen.getByText('Today');
    fireEvent.click(todayButton);
    
    expect(mockOnDateChange).toHaveBeenCalledWith(expect.any(Date));
    const calledDate = mockOnDateChange.mock.calls[0][0];
    expect(format(calledDate, 'yyyy-MM-dd')).toBe(format(new Date(), 'yyyy-MM-dd'));
  });

  it('displays keyboard shortcuts', () => {
    renderWithTheme(<DateNavigationHeader selectedDate={testDate} onDateChange={mockOnDateChange} />);
    
    expect(screen.getByText('←')).toBeInTheDocument();
    expect(screen.getByText('→')).toBeInTheDocument();
    expect(screen.getByText('T')).toBeInTheDocument();
  });

  it('responds to keyboard shortcuts', () => {
    renderWithTheme(<DateNavigationHeader selectedDate={testDate} onDateChange={mockOnDateChange} />);
    
    // Test left arrow
    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    expect(mockOnDateChange).toHaveBeenCalledWith(subDays(testDate, 1));
    
    // Test right arrow
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(mockOnDateChange).toHaveBeenCalledWith(addDays(testDate, 1));
    
    // Test 't' key
    fireEvent.keyDown(window, { key: 't' });
    expect(mockOnDateChange).toHaveBeenCalledTimes(3);
  });

  it('ignores keyboard shortcuts when input is focused', () => {
    renderWithTheme(
      <div>
        <DateNavigationHeader selectedDate={testDate} onDateChange={mockOnDateChange} />
        <input data-testid="test-input" />
      </div>
    );
    
    const input = screen.getByTestId('test-input');
    input.focus();
    
    fireEvent.keyDown(input, { key: 'ArrowLeft' });
    expect(mockOnDateChange).not.toHaveBeenCalled();
  });
});