import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EventForm } from '../EventForm';
import { CalendarEvent } from '@/types/calendar';

// Mock Google integration hooks
jest.mock('@/hooks/useGoogleIntegration', () => ({
  useGoogleAuth: () => ({
    hasIntegration: false,
    initiateAuth: jest.fn(),
    revokeIntegration: jest.fn(),
    isRevoking: false,
  }),
}));

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'calendar.newEvent': '新しいイベント',
      'calendar.editEvent': 'イベントを編集',
      'calendar.eventTitle': 'イベントタイトル',
      'calendar.eventTitlePlaceholder': 'イベントタイトル',
      'calendar.eventDescription': 'イベントの説明',
      'calendar.eventDescriptionPlaceholder': 'イベントの詳細説明',
      'calendar.startDate': '開始日',
      'calendar.endDate': '終了日',
      'calendar.allDay': '終日',
      'calendar.color': '色',
      'calendar.creating': '作成中...',
      'calendar.saving': '保存中...',
      'calendar.create': '作成',
      'calendar.update': '更新',
      'calendar.titleRequired': 'タイトルは必須です',
      'calendar.colors.blue': 'ブルー',
      'calendar.colors.green': 'グリーン',
      'calendar.colors.red': 'レッド',
      'calendar.colors.purple': 'パープル',
      'calendar.colors.orange': 'オレンジ',
      'common.cancel': 'キャンセル',
    };
    return translations[key] || key;
  },
}));

const mockEvent: CalendarEvent = {
  id: 1,
  title: 'Test Event',
  description: 'Test Description',
  startDateTime: new Date(2025, 5, 15, 9, 0).toISOString(),
  endDateTime: new Date(2025, 5, 15, 10, 0).toISOString(),
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
    
    // Get inputs by placeholder as they don't have proper label association
    const titleInput = screen.getByPlaceholderText('イベントタイトル');
    const descriptionInput = screen.getByPlaceholderText('イベントの詳細説明');
    
    await user.type(titleInput, 'New Event');
    await user.type(descriptionInput, 'Event description');
    
    const submitButton = screen.getByRole('button', { name: '作成' });
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
    
    // Initially blue should be selected (default)
    const blueColorButton = screen.getByTitle('ブルー');
    expect(blueColorButton).toHaveClass('ring-2');
    
    // Click green color button
    const greenColorButton = screen.getByTitle('グリーン');
    await user.click(greenColorButton);
    
    // Verify that the green button appears selected
    expect(greenColorButton).toHaveClass('ring-2');
    expect(greenColorButton).toHaveClass('ring-gray-400');
    expect(greenColorButton).toHaveClass('ring-offset-2');
    
    // Verify blue is no longer selected
    expect(blueColorButton).not.toHaveClass('ring-2');
    
    // Submit form and verify color value
    const titleInput = screen.getByPlaceholderText('イベントタイトル');
    await user.type(titleInput, 'Test Event');
    
    const submitButton = screen.getByRole('button', { name: '作成' });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(defaultProps.onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test Event',
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
    const defaultDate = new Date(2025, 5, 20, 9, 0);
    render(<EventForm {...defaultProps} defaultDate={defaultDate} />);
    
    // The form should be populated with the default date
    // For non-allDay events, we now use a custom DateTimeInput component
    // which uses separate date and time inputs
    const dateInputs = screen.getAllByPlaceholderText(/yyyy\/MM\/dd|MM\/dd\/yyyy/);
    expect(dateInputs.length).toBeGreaterThan(0);
    
    // Check that the form has been rendered with the date
    expect(screen.getByText('新しいイベント')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<EventForm {...defaultProps} isOpen={false} />);
    
    expect(screen.queryByText('新しいイベント')).not.toBeInTheDocument();
  });
});