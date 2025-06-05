import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EventForm } from '../EventForm';
import { CalendarEvent } from '@/types/calendar';

const mockEvent: CalendarEvent = {
  id: 1,
  title: 'Test Event',
  description: 'Test Description',
  startDate: new Date(2025, 5, 15, 9, 0).toISOString(),
  endDate: new Date(2025, 5, 15, 10, 0).toISOString(),
  allDay: false,
  color: 'blue',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const defaultProps = {
  isOpen: true,
  onClose: jest.fn(),
  onSubmit: jest.fn(),
  isSubmitting: false,
};

describe('EventForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders form fields when open', () => {
    render(<EventForm {...defaultProps} />);
    
    expect(screen.getByPlaceholderText('イベントタイトル')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('イベントの詳細説明')).toBeInTheDocument();
    expect(screen.getByText('終日')).toBeInTheDocument();
    expect(screen.getByText('色 *')).toBeInTheDocument();
  });

  it('shows create mode when no event provided', () => {
    render(<EventForm {...defaultProps} />);
    
    expect(screen.getByText('新しいイベント')).toBeInTheDocument();
    expect(screen.getByText('作成')).toBeInTheDocument();
  });

  it('shows edit mode when event provided', () => {
    render(<EventForm {...defaultProps} event={mockEvent} />);
    
    expect(screen.getByText('イベントを編集')).toBeInTheDocument();
    expect(screen.getByText('更新')).toBeInTheDocument();
  });

  it('populates form with event data in edit mode', () => {
    render(<EventForm {...defaultProps} event={mockEvent} />);
    
    expect(screen.getByDisplayValue('Test Event')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();
    render(<EventForm {...defaultProps} />);
    
    const submitButton = screen.getByText('作成');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('タイトルは必須です')).toBeInTheDocument();
    });
  });

  it('submits form with correct data', async () => {
    const user = userEvent.setup();
    render(<EventForm {...defaultProps} />);
    
    await user.type(screen.getByPlaceholderText('イベントタイトル'), 'New Event');
    await user.type(screen.getByPlaceholderText('イベントの詳細説明'), 'Event description');
    
    const submitButton = screen.getByText('作成');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(defaultProps.onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'New Event',
          description: 'Event description',
          color: 'blue',
          allDay: false,
        })
      );
    });
  });

  it('toggles all-day mode correctly', async () => {
    const user = userEvent.setup();
    render(<EventForm {...defaultProps} />);
    
    const allDayCheckbox = screen.getByRole('checkbox');
    await user.click(allDayCheckbox);
    
    // Should show date inputs instead of datetime-local
    expect(screen.getByText('開始日 *')).toBeInTheDocument();
    expect(screen.getByText('終了日 *')).toBeInTheDocument();
  });

  it('allows color selection', async () => {
    const user = userEvent.setup();
    render(<EventForm {...defaultProps} />);
    
    const greenColorButton = screen.getByTitle('グリーン');
    await user.click(greenColorButton);
    
    await user.type(screen.getByPlaceholderText('イベントタイトル'), 'Test');
    
    const submitButton = screen.getByText('作成');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(defaultProps.onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          color: 'green',
        })
      );
    });
  });

  it('calls onClose when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<EventForm {...defaultProps} />);
    
    const cancelButton = screen.getByText('キャンセル');
    await user.click(cancelButton);
    
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('disables form when submitting', () => {
    render(<EventForm {...defaultProps} isSubmitting={true} />);
    
    expect(screen.getByText('保存中...')).toBeInTheDocument();
    expect(screen.getByText('キャンセル')).toBeDisabled();
  });

  it('sets default date when defaultDate provided', () => {
    const defaultDate = new Date(2025, 5, 20);
    render(<EventForm {...defaultProps} defaultDate={defaultDate} />);
    
    // Should have the default date set in the form
    const startDateInput = screen.getByLabelText(/開始日時/);
    expect(startDateInput).toHaveValue('2025-06-20T09:00');
  });

  it('does not render when closed', () => {
    render(<EventForm {...defaultProps} isOpen={false} />);
    
    expect(screen.queryByText('新しいイベント')).not.toBeInTheDocument();
  });
});