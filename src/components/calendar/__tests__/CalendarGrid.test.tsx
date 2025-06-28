import { render, screen, fireEvent } from '@/test/test-utils';
import { CalendarGrid } from '../CalendarGrid';
import { CalendarEvent } from '@/types/calendar';

// Mock date-fns to control the current date for testing
jest.mock('date-fns', () => ({
  ...jest.requireActual('date-fns'),
  isToday: (date: Date) => {
    const today = new Date(2025, 5, 15); // June 15, 2025
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  },
}));

const mockEvents: CalendarEvent[] = [
  {
    id: 1,
    title: 'Test Event',
    startDateTime: new Date(2025, 5, 15, 9, 0).toISOString(),
    endDateTime: new Date(2025, 5, 15, 10, 0).toISOString(),
    allDay: false,
    color: 'blue',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    title: 'All Day Event',
    startDateTime: new Date(2025, 5, 20).toISOString(),
    endDateTime: new Date(2025, 5, 20).toISOString(),
    allDay: true,
    color: 'green',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const defaultProps = {
  currentDate: new Date(2025, 5, 15), // June 15, 2025
  events: mockEvents,
  onDateClick: jest.fn(),
  onEventClick: jest.fn(),
};

describe('CalendarGrid', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders calendar grid with weekday headers', () => {
    render(<CalendarGrid {...defaultProps} />);
    
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    weekdays.forEach(day => {
      expect(screen.getByText(day)).toBeInTheDocument();
    });
  });

  it('renders all days of the month', () => {
    render(<CalendarGrid {...defaultProps} />);
    
    // Should render days 1-30 for June 2025
    for (let day = 1; day <= 30; day++) {
      const dayElements = screen.getAllByText(day.toString());
      expect(dayElements.length).toBeGreaterThan(0);
    }
  });

  it('highlights today', () => {
    render(<CalendarGrid {...defaultProps} />);
    
    // Today is June 15, 2025 in our mock
    const todayElements = screen.getAllByText('15');
    // Should have at least one element with special styling for today
    expect(todayElements.length).toBeGreaterThan(0);
  });

  it('displays events on correct dates with proper formatting', () => {
    render(<CalendarGrid {...defaultProps} />);
    
    // Timed event should show with time prefix
    expect(screen.getByText('09:00 Test Event')).toBeInTheDocument();
    // All day event should show without time
    expect(screen.getByText('All Day Event')).toBeInTheDocument();
  });

  it('calls onDateClick when date is clicked', () => {
    render(<CalendarGrid {...defaultProps} />);
    
    const dateElement = screen.getByText('20');
    fireEvent.click(dateElement.closest('div')!);
    
    expect(defaultProps.onDateClick).toHaveBeenCalled();
  });

  it('calls onEventClick when event is clicked', () => {
    render(<CalendarGrid {...defaultProps} />);
    
    const eventElement = screen.getByText('09:00 Test Event');
    fireEvent.click(eventElement);
    
    expect(defaultProps.onEventClick).toHaveBeenCalledWith(mockEvents[0]);
  });

  it('shows clickable "more" indicator when there are many events', () => {
    // Create 4 events on the same day
    const manyEvents: CalendarEvent[] = [
      {
        id: 1,
        title: 'Event 1',
        startDateTime: new Date(2025, 5, 15, 9, 0).toISOString(),
        endDateTime: new Date(2025, 5, 15, 10, 0).toISOString(),
        allDay: false,
        color: 'blue',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 2,
        title: 'Event 2',
        startDateTime: new Date(2025, 5, 15, 10, 0).toISOString(),
        endDateTime: new Date(2025, 5, 15, 11, 0).toISOString(),
        allDay: false,
        color: 'green',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 3,
        title: 'Event 3',
        startDateTime: new Date(2025, 5, 15, 11, 0).toISOString(),
        endDateTime: new Date(2025, 5, 15, 12, 0).toISOString(),
        allDay: false,
        color: 'red',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 4,
        title: 'Event 4',
        startDateTime: new Date(2025, 5, 15, 13, 0).toISOString(),
        endDateTime: new Date(2025, 5, 15, 14, 0).toISOString(),
        allDay: false,
        color: 'purple',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    render(<CalendarGrid {...defaultProps} events={manyEvents} />);
    
    // Should have 4 events total on June 15, so it should show +1 more (since only 3 are shown)
    const moreIndicator = screen.getByText('+1 more');
    expect(moreIndicator).toBeInTheDocument();
    expect(moreIndicator).toHaveClass('cursor-pointer');
    
    // Click to expand
    fireEvent.click(moreIndicator);
    
    // All 4 events should now be visible
    expect(screen.getByText('09:00 Event 1')).toBeInTheDocument();
    expect(screen.getByText('10:00 Event 2')).toBeInTheDocument();
    expect(screen.getByText('11:00 Event 3')).toBeInTheDocument();
    expect(screen.getByText('13:00 Event 4')).toBeInTheDocument();
    
    // Should show "Show less" option
    expect(screen.getByText('Show less')).toBeInTheDocument();
    
    // Click to collapse
    fireEvent.click(screen.getByText('Show less'));
    
    // Back to showing only 3 events
    expect(screen.getByText('+1 more')).toBeInTheDocument();
  });

  it('applies correct color classes for events', () => {
    render(<CalendarGrid {...defaultProps} />);
    
    const blueEvent = screen.getByText('09:00 Test Event');
    expect(blueEvent).toHaveClass('bg-blue-500/20');

    expect(blueEvent).toHaveClass('text-blue-700');
    expect(blueEvent).toHaveClass('border-blue-500/30');
    
    const greenEvent = screen.getByText('All Day Event');
    expect(greenEvent).toHaveClass('bg-green-500/20');
    expect(greenEvent).toHaveClass('text-green-700');
    expect(greenEvent).toHaveClass('border-green-500/30');
  });

  it('prevents event propagation when event is clicked', () => {
    render(<CalendarGrid {...defaultProps} />);
    
    const eventElement = screen.getByText('09:00 Test Event');
    fireEvent.click(eventElement);
    
    // onDateClick should not be called when event is clicked
    expect(defaultProps.onDateClick).not.toHaveBeenCalled();
    expect(defaultProps.onEventClick).toHaveBeenCalled();
  });

  it('sorts events by start time then end time', () => {
    const unsortedEvents: CalendarEvent[] = [
      {
        id: 3,
        title: 'Late Event',
        startDateTime: new Date(2025, 5, 15, 14, 0).toISOString(),
        endDateTime: new Date(2025, 5, 15, 15, 0).toISOString(),
        allDay: false,
        color: 'red',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 1,
        title: 'Early Event',
        startDateTime: new Date(2025, 5, 15, 9, 0).toISOString(),
        endDateTime: new Date(2025, 5, 15, 10, 0).toISOString(),
        allDay: false,
        color: 'blue',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 2,
        title: 'Mid Event',
        startDateTime: new Date(2025, 5, 15, 11, 0).toISOString(),
        endDateTime: new Date(2025, 5, 15, 12, 0).toISOString(),
        allDay: false,
        color: 'green',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 4,
        title: 'Same Start Longer',
        startDateTime: new Date(2025, 5, 15, 11, 0).toISOString(),
        endDateTime: new Date(2025, 5, 15, 13, 0).toISOString(),
        allDay: false,
        color: 'purple',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    render(<CalendarGrid {...defaultProps} events={unsortedEvents} />);
    
    // Expand to see all events
    const moreButton = screen.getByText('+1 more');
    fireEvent.click(moreButton);
    
    // Get all event elements for June 15
    const eventElements = screen.getAllByText(/^\d{2}:\d{2} /);
    
    // Check that events are in correct order
    expect(eventElements[0]).toHaveTextContent('09:00 Early Event');
    expect(eventElements[1]).toHaveTextContent('11:00 Mid Event');
    expect(eventElements[2]).toHaveTextContent('11:00 Same Start Longer');
    expect(eventElements[3]).toHaveTextContent('14:00 Late Event');
  });

  describe('Drag and Drop', () => {
    const propsWithDragDrop = {
      ...defaultProps,
      onEventDateChange: jest.fn(),
    };

    it('makes events draggable when onEventDateChange is provided', () => {
      render(<CalendarGrid {...propsWithDragDrop} />);
      
      const eventElement = screen.getByText('09:00 Test Event');
      expect(eventElement).toHaveAttribute('draggable', 'true');
      expect(eventElement).toHaveClass('cursor-move');
    });

    it('does not make events draggable when onEventDateChange is not provided', () => {
      render(<CalendarGrid {...defaultProps} />);
      
      const eventElement = screen.getByText('09:00 Test Event');
      expect(eventElement).toHaveAttribute('draggable', 'false');
      expect(eventElement).not.toHaveClass('cursor-move');
    });

    it('handles drag start event', () => {
      render(<CalendarGrid {...propsWithDragDrop} />);
      
      const eventElement = screen.getByText('09:00 Test Event');
      const mockDataTransfer = {
        effectAllowed: '',
        dropEffect: '',
        setData: jest.fn(),
        getData: jest.fn(),
        clearData: jest.fn(),
        setDragImage: jest.fn(),
        types: [],
        files: {} as FileList,
        items: {} as DataTransferItemList,
      };
      
      fireEvent.dragStart(eventElement, { dataTransfer: mockDataTransfer });
      
      expect(mockDataTransfer.effectAllowed).toBe('move');
      expect(eventElement).toHaveStyle('opacity: 0.5');
    });

    it('handles drag end event', () => {
      render(<CalendarGrid {...propsWithDragDrop} />);
      
      const eventElement = screen.getByText('09:00 Test Event');
      const mockDataTransfer = {
        effectAllowed: '',
        dropEffect: '',
        setData: jest.fn(),
        getData: jest.fn(),
        clearData: jest.fn(),
        setDragImage: jest.fn(),
        types: [],
        files: {} as FileList,
        items: {} as DataTransferItemList,
      };
      
      // First trigger drag start to set opacity
      fireEvent.dragStart(eventElement, { dataTransfer: mockDataTransfer });
      
      // Then trigger drag end
      fireEvent.dragEnd(eventElement);
      
      expect(eventElement).toHaveStyle('opacity: 1');
    });

    it('handles drop event and calls onEventDateChange', () => {
      render(<CalendarGrid {...propsWithDragDrop} />);
      
      const eventElement = screen.getByText('09:00 Test Event');
      const targetDateCell = screen.getAllByText('20')[0].closest('div')!.parentElement!;
      const mockDataTransfer = {
        effectAllowed: '',
        dropEffect: '',
        setData: jest.fn(),
        getData: jest.fn(),
        clearData: jest.fn(),
        setDragImage: jest.fn(),
        types: [],
        files: {} as FileList,
        items: {} as DataTransferItemList,
      };
      
      // Simulate drag and drop
      fireEvent.dragStart(eventElement, { dataTransfer: mockDataTransfer });
      fireEvent.dragOver(targetDateCell, { dataTransfer: mockDataTransfer });
      fireEvent.drop(targetDateCell, { dataTransfer: mockDataTransfer });
      
      expect(propsWithDragDrop.onEventDateChange).toHaveBeenCalledWith(
        1, // event id
        expect.any(Date)
      );
    });

    it('maintains time for non-all-day events when dropped', () => {
      render(<CalendarGrid {...propsWithDragDrop} />);
      
      const eventElement = screen.getByText('09:00 Test Event');
      const targetDateCell = screen.getAllByText('20')[0].closest('div')!.parentElement!;
      const mockDataTransfer = {
        effectAllowed: '',
        dropEffect: '',
        setData: jest.fn(),
        getData: jest.fn(),
        clearData: jest.fn(),
        setDragImage: jest.fn(),
        types: [],
        files: {} as FileList,
        items: {} as DataTransferItemList,
      };
      
      // Simulate drag and drop
      fireEvent.dragStart(eventElement, { dataTransfer: mockDataTransfer });
      fireEvent.drop(targetDateCell, { dataTransfer: mockDataTransfer });
      
      const [[eventId, newDate]] = propsWithDragDrop.onEventDateChange.mock.calls;
      
      expect(eventId).toBe(1);
      expect(newDate.getHours()).toBe(9); // Original hour is maintained
      expect(newDate.getMinutes()).toBe(0); // Original minute is maintained
      expect(newDate.getDate()).toBe(20); // New date
    });

    it('sets time to midnight for all-day events when dropped', () => {
      render(<CalendarGrid {...propsWithDragDrop} />);
      
      const allDayEventElement = screen.getByText('All Day Event');
      const targetDateCell = screen.getAllByText('25')[0].closest('div')!.parentElement!;
      const mockDataTransfer = {
        effectAllowed: '',
        dropEffect: '',
        setData: jest.fn(),
        getData: jest.fn(),
        clearData: jest.fn(),
        setDragImage: jest.fn(),
        types: [],
        files: {} as FileList,
        items: {} as DataTransferItemList,
      };
      
      // Simulate drag and drop
      fireEvent.dragStart(allDayEventElement, { dataTransfer: mockDataTransfer });
      fireEvent.drop(targetDateCell, { dataTransfer: mockDataTransfer });
      
      const [[eventId, newDate]] = propsWithDragDrop.onEventDateChange.mock.calls;
      
      expect(eventId).toBe(2);
      expect(newDate.getHours()).toBe(0);
      expect(newDate.getMinutes()).toBe(0);
      expect(newDate.getDate()).toBe(25);
    });

    it('shows visual feedback when dragging over a date', () => {
      render(<CalendarGrid {...propsWithDragDrop} />);
      
      const eventElement = screen.getByText('09:00 Test Event');
      // Find a calendar cell for a different date (e.g., date "22")
      const dateElements = screen.getAllByText('22');
      const targetDateCell = dateElements.find(el => 
        el.parentElement?.parentElement?.classList.contains('backdrop-blur-xl')
      )?.parentElement?.parentElement;
      
      expect(targetDateCell).toBeDefined();
      
      const mockDataTransfer = {
        effectAllowed: '',
        dropEffect: '',
        setData: jest.fn(),
        getData: jest.fn(),
        clearData: jest.fn(),
        setDragImage: jest.fn(),
        types: [],
        files: {} as FileList,
        items: {} as DataTransferItemList,
      };
      
      fireEvent.dragStart(eventElement, { dataTransfer: mockDataTransfer });
      fireEvent.dragOver(targetDateCell!, { dataTransfer: mockDataTransfer });
      
      // Check if the target cell has the highlight class
      expect(targetDateCell).toHaveClass('bg-blue-100/40');
    });

    it('removes visual feedback when drag leaves', () => {
      render(<CalendarGrid {...propsWithDragDrop} />);
      
      const eventElement = screen.getByText('09:00 Test Event');
      // Find a calendar cell for a different date (e.g., date "22")
      const dateElements = screen.getAllByText('22');
      const targetDateCell = dateElements.find(el => 
        el.parentElement?.parentElement?.classList.contains('backdrop-blur-xl')
      )?.parentElement?.parentElement;
      
      expect(targetDateCell).toBeDefined();
      
      const mockDataTransfer = {
        effectAllowed: '',
        dropEffect: '',
        setData: jest.fn(),
        getData: jest.fn(),
        clearData: jest.fn(),
        setDragImage: jest.fn(),
        types: [],
        files: {} as FileList,
        items: {} as DataTransferItemList,
      };
      
      fireEvent.dragStart(eventElement, { dataTransfer: mockDataTransfer });
      fireEvent.dragOver(targetDateCell!, { dataTransfer: mockDataTransfer });
      fireEvent.dragLeave(targetDateCell!);
      
      // Check if the highlight class is removed
      expect(targetDateCell).not.toHaveClass('bg-blue-100/40');
    });

    it('maintains consistent time when dragging multiple times', () => {
      const { rerender } = render(<CalendarGrid {...propsWithDragDrop} />);
      
      const mockDataTransfer = {
        effectAllowed: '',
        dropEffect: '',
        setData: jest.fn(),
        getData: jest.fn(),
        clearData: jest.fn(),
        setDragImage: jest.fn(),
        types: [],
        files: {} as FileList,
        items: {} as DataTransferItemList,
      };
      
      // First drag: from 15th to 20th
      const eventElement = screen.getByText('09:00 Test Event');
      const targetDate20 = screen.getAllByText('20')[0].closest('div')!.parentElement!;
      
      fireEvent.dragStart(eventElement, { dataTransfer: mockDataTransfer });
      fireEvent.drop(targetDate20, { dataTransfer: mockDataTransfer });
      
      expect(propsWithDragDrop.onEventDateChange).toHaveBeenCalledTimes(1);
      const [[, firstNewDate]] = propsWithDragDrop.onEventDateChange.mock.calls;
      expect(firstNewDate.getHours()).toBe(9);
      expect(firstNewDate.getMinutes()).toBe(0);
      expect(firstNewDate.getDate()).toBe(20);
      
      // Clear previous calls
      propsWithDragDrop.onEventDateChange.mockClear();
      
      // Second drag: from 20th to 25th (simulating the event has moved)
      const updatedEvent = {
        ...mockEvents[0],
        startDateTime: new Date(2025, 5, 20, 9, 0).toISOString(),
        endDateTime: new Date(2025, 5, 20, 10, 0).toISOString(),
      };
      
      // Re-render with updated event position
      rerender(
        <CalendarGrid {...propsWithDragDrop} events={[updatedEvent, mockEvents[1]]} />
      );
      
      const movedEventElement = screen.getByText('09:00 Test Event');
      const targetDate25 = screen.getAllByText('25')[0].closest('div')!.parentElement!;
      
      fireEvent.dragStart(movedEventElement, { dataTransfer: mockDataTransfer });
      fireEvent.drop(targetDate25, { dataTransfer: mockDataTransfer });
      
      expect(propsWithDragDrop.onEventDateChange).toHaveBeenCalledTimes(1);
      const [[, secondNewDate]] = propsWithDragDrop.onEventDateChange.mock.calls;
      
      // Time should still be 09:00, not shifted
      expect(secondNewDate.getHours()).toBe(9);
      expect(secondNewDate.getMinutes()).toBe(0);
      expect(secondNewDate.getDate()).toBe(25);
    });

    it('preserves exact time when dragging events with different times', () => {
      const eventsWithDifferentTimes: CalendarEvent[] = [
        {
          id: 1,
          title: 'Morning Event',
          startDateTime: new Date(2025, 5, 15, 7, 30).toISOString(),
          endDateTime: new Date(2025, 5, 15, 8, 30).toISOString(),
          allDay: false,
          color: 'blue',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 2,
          title: 'Afternoon Event',
          startDateTime: new Date(2025, 5, 15, 15, 45).toISOString(),
          endDateTime: new Date(2025, 5, 15, 16, 45).toISOString(),
          allDay: false,
          color: 'green',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 3,
          title: 'Late Event',
          startDateTime: new Date(2025, 5, 15, 23, 15).toISOString(),
          endDateTime: new Date(2025, 5, 15, 23, 59).toISOString(),
          allDay: false,
          color: 'red',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      render(<CalendarGrid {...propsWithDragDrop} events={eventsWithDifferentTimes} />);
      
      const mockDataTransfer = {
        effectAllowed: '',
        dropEffect: '',
        setData: jest.fn(),
        getData: jest.fn(),
        clearData: jest.fn(),
        setDragImage: jest.fn(),
        types: [],
        files: {} as FileList,
        items: {} as DataTransferItemList,
      };
      
      // Test morning event (07:30)
      const morningEvent = screen.getByText('07:30 Morning Event');
      const targetDate20 = screen.getAllByText('20')[0].closest('div')!.parentElement!;
      
      fireEvent.dragStart(morningEvent, { dataTransfer: mockDataTransfer });
      fireEvent.drop(targetDate20, { dataTransfer: mockDataTransfer });
      
      const [[, morningNewDate]] = propsWithDragDrop.onEventDateChange.mock.calls;
      expect(morningNewDate.getHours()).toBe(7);
      expect(morningNewDate.getMinutes()).toBe(30);
      expect(morningNewDate.getDate()).toBe(20);
      
      // Clear and test afternoon event (15:45)
      propsWithDragDrop.onEventDateChange.mockClear();
      
      const afternoonEvent = screen.getByText('15:45 Afternoon Event');
      fireEvent.dragStart(afternoonEvent, { dataTransfer: mockDataTransfer });
      fireEvent.drop(targetDate20, { dataTransfer: mockDataTransfer });
      
      const [[, afternoonNewDate]] = propsWithDragDrop.onEventDateChange.mock.calls;
      expect(afternoonNewDate.getHours()).toBe(15);
      expect(afternoonNewDate.getMinutes()).toBe(45);
      expect(afternoonNewDate.getDate()).toBe(20);
      
      // Clear and test late event (23:15)
      propsWithDragDrop.onEventDateChange.mockClear();
      
      const lateEvent = screen.getByText('23:15 Late Event');
      fireEvent.dragStart(lateEvent, { dataTransfer: mockDataTransfer });
      fireEvent.drop(targetDate20, { dataTransfer: mockDataTransfer });
      
      const [[, lateNewDate]] = propsWithDragDrop.onEventDateChange.mock.calls;
      expect(lateNewDate.getHours()).toBe(23);
      expect(lateNewDate.getMinutes()).toBe(15);
      expect(lateNewDate.getDate()).toBe(20);
    });

    it('handles dragging to previous dates without time shifts', () => {
      // Test with a specific timezone scenario
      const eventWithTimezone: CalendarEvent = {
        id: 1,
        title: 'Meeting',
        // This ISO string represents 09:00 in the local timezone
        startDateTime: '2025-06-15T09:00:00.000Z',
        endDateTime: '2025-06-15T10:00:00.000Z',
        allDay: false,
        color: 'blue',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      render(<CalendarGrid {...propsWithDragDrop} events={[eventWithTimezone]} />);
      
      const mockDataTransfer = {
        effectAllowed: '',
        dropEffect: '',
        setData: jest.fn(),
        getData: jest.fn(),
        clearData: jest.fn(),
        setDragImage: jest.fn(),
        types: [],
        files: {} as FileList,
        items: {} as DataTransferItemList,
      };
      
      // The displayed time might be different due to timezone
      const eventElements = screen.getAllByText(/\d{2}:\d{2} Meeting/);
      const eventElement = eventElements[0];
      
      // First drag: from 15th to 14th (previous day)
      const targetDate14 = screen.getAllByText('14')[0].closest('div')!.parentElement!;
      
      fireEvent.dragStart(eventElement, { dataTransfer: mockDataTransfer });
      fireEvent.drop(targetDate14, { dataTransfer: mockDataTransfer });
      
      expect(propsWithDragDrop.onEventDateChange).toHaveBeenCalledTimes(1);
      const [[, firstNewDate]] = propsWithDragDrop.onEventDateChange.mock.calls;
      
      // The date should be 14th, and time should be preserved
      expect(firstNewDate.getDate()).toBe(14);
      
      // Clear for next test
      propsWithDragDrop.onEventDateChange.mockClear();
    });

    it('correctly handles events near midnight when dragging across dates', () => {
      const lateNightEvent: CalendarEvent = {
        id: 1,
        title: 'Late Night Event',
        startDateTime: new Date(2025, 5, 15, 23, 30).toISOString(),
        endDateTime: new Date(2025, 5, 16, 0, 30).toISOString(), // Crosses midnight
        allDay: false,
        color: 'blue',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      render(<CalendarGrid {...propsWithDragDrop} events={[lateNightEvent]} />);
      
      const mockDataTransfer = {
        effectAllowed: '',
        dropEffect: '',
        setData: jest.fn(),
        getData: jest.fn(),
        clearData: jest.fn(),
        setDragImage: jest.fn(),
        types: [],
        files: {} as FileList,
        items: {} as DataTransferItemList,
      };
      
      const eventElement = screen.getByText('23:30 Late Night Event');
      
      // Drag from 15th to 14th
      const targetDate14 = screen.getAllByText('14')[0].closest('div')!.parentElement!;
      
      fireEvent.dragStart(eventElement, { dataTransfer: mockDataTransfer });
      fireEvent.drop(targetDate14, { dataTransfer: mockDataTransfer });
      
      const [[, newDate]] = propsWithDragDrop.onEventDateChange.mock.calls;
      
      // Should be 14th at 23:30
      expect(newDate.getDate()).toBe(14);
      expect(newDate.getHours()).toBe(23);
      expect(newDate.getMinutes()).toBe(30);
    });
  });
});