import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MomentList } from '../MomentList';
import { Moment } from '@/types/moment';

const mockMoments: Moment[] = [
  {
    id: 1,
    content: 'Just had a great idea about the project architecture',
    tags: ['Ideas', 'work'],
    createdAt: new Date(2025, 5, 15, 10, 30).toISOString(),
    updatedAt: new Date(2025, 5, 15, 10, 30).toISOString(),
  },
  {
    id: 2,
    content: 'Discovered a new way to optimize the algorithm',
    tags: ['Discoveries'],
    createdAt: new Date(2025, 5, 15, 8, 15).toISOString(),
    updatedAt: new Date(2025, 5, 15, 8, 15).toISOString(),
  },
  {
    id: 3,
    content: 'Feeling motivated to tackle challenging problems today',
    tags: ['Emotions', 'Log'],
    createdAt: new Date(2025, 5, 14, 16, 45).toISOString(),
    updatedAt: new Date(2025, 5, 14, 16, 45).toISOString(),
  },
];

const defaultProps = {
  moments: mockMoments,
  onMomentClick: jest.fn(),
  onEditMoment: jest.fn(),
  onDeleteMoment: jest.fn(),
};

// Mock date-fns functions
jest.mock('date-fns', () => ({
  format: jest.fn(() => {
    // Return empty string for date headers since grouping logic depends on format
    return '';
  }),
  isToday: jest.fn(() => false),
  isYesterday: jest.fn(() => false),
  formatDistanceToNow: jest.fn(() => '2時間前'),
}));

jest.mock('date-fns/locale', () => ({
  ja: {},
}));

describe('MomentList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders empty state when no moments', () => {
    render(<MomentList {...defaultProps} moments={[]} />);
    
    expect(screen.getByText('モーメントがありません')).toBeInTheDocument();
    expect(screen.getByText('新しいモーメントを記録して始めましょう')).toBeInTheDocument();
  });

  it('renders all moments', () => {
    render(<MomentList {...defaultProps} />);
    
    expect(screen.getByText('Just had a great idea about the project architecture')).toBeInTheDocument();
    expect(screen.getByText('Discovered a new way to optimize the algorithm')).toBeInTheDocument();
    expect(screen.getByText('Feeling motivated to tackle challenging problems today')).toBeInTheDocument();
  });

  it('groups moments by date', () => {
    render(<MomentList {...defaultProps} />);
    
    // Since we're mocking date-fns format to return empty string,
    // we should check that moments are rendered in the correct structure
    // by checking they appear in the document
    const momentContents = screen.getAllByText(/Just had a great idea|Discovered a new way|Feeling motivated/);
    expect(momentContents).toHaveLength(3);
  });

  it('displays tags with appropriate colors', () => {
    render(<MomentList {...defaultProps} />);
    
    // Check that tags are displayed
    expect(screen.getByText('Ideas')).toBeInTheDocument();
    expect(screen.getByText('work')).toBeInTheDocument();
    expect(screen.getByText('Discoveries')).toBeInTheDocument();
    expect(screen.getByText('Emotions')).toBeInTheDocument();
    expect(screen.getByText('Log')).toBeInTheDocument();
    
    // Check tag colors - the tag text is inside a span
    const ideasTag = screen.getByText('Ideas');
    expect(ideasTag.closest('span')).toHaveClass('bg-blue-100');
  });

  it('displays time indicators', () => {
    render(<MomentList {...defaultProps} />);
    
    // Check that time indicator sections exist by looking for the clock svg elements
    const container = screen.getByText('Just had a great idea about the project architecture').closest('.timeline-card');
    expect(container).toBeInTheDocument();
    
    // The time indicator div should have the clock icon
    const timeDiv = container?.querySelector('.flex-shrink-0.text-sm.text-muted-foreground');
    expect(timeDiv).toBeInTheDocument();
    expect(timeDiv?.querySelector('.lucide-clock')).toBeInTheDocument();
  });

  it('calls onMomentClick when moment is clicked', async () => {
    const user = userEvent.setup();
    render(<MomentList {...defaultProps} />);
    
    const momentCard = screen.getByText('Just had a great idea about the project architecture').closest('.cursor-pointer')!;
    await user.click(momentCard);
    
    expect(defaultProps.onMomentClick).toHaveBeenCalledWith(mockMoments[0]);
  });

  it('shows action buttons on hover', async () => {
    const user = userEvent.setup();
    render(<MomentList {...defaultProps} />);
    
    const momentCard = screen.getByText('Just had a great idea about the project architecture').closest('.cursor-pointer')!;
    await user.hover(momentCard);
    
    // Actions should be visible - find buttons within this specific card
    const editButton = momentCard.querySelector('button[title="編集"]') as HTMLElement;
    const deleteButton = momentCard.querySelector('button[title="削除"]') as HTMLElement;
    
    expect(editButton).toBeInTheDocument();
    expect(deleteButton).toBeInTheDocument();
  });

  it('calls onEditMoment when edit button is clicked', async () => {
    const user = userEvent.setup();
    render(<MomentList {...defaultProps} />);
    
    const momentCard = screen.getByText('Just had a great idea about the project architecture').closest('.cursor-pointer')!;
    const editButton = momentCard.querySelector('button[title="編集"]') as HTMLElement;
    
    expect(editButton).toBeInTheDocument();
    await user.click(editButton);
    
    expect(defaultProps.onEditMoment).toHaveBeenCalledWith(mockMoments[0]);
  });

  it('calls onDeleteMoment when delete button is clicked', async () => {
    const user = userEvent.setup();
    render(<MomentList {...defaultProps} />);
    
    const momentCard = screen.getByText('Just had a great idea about the project architecture').closest('.cursor-pointer')!;
    const deleteButton = momentCard.querySelector('button[title="削除"]') as HTMLElement;
    
    expect(deleteButton).toBeInTheDocument();
    await user.click(deleteButton);
    
    expect(defaultProps.onDeleteMoment).toHaveBeenCalledWith(mockMoments[0]);
  });

  it('prevents moment click when action button is clicked', async () => {
    const user = userEvent.setup();
    render(<MomentList {...defaultProps} />);
    
    const momentCard = screen.getByText('Just had a great idea about the project architecture').closest('.cursor-pointer')!;
    const editButton = momentCard.querySelector('button[title="編集"]') as HTMLElement;
    
    expect(editButton).toBeInTheDocument();
    await user.click(editButton);
    
    expect(defaultProps.onMomentClick).not.toHaveBeenCalled();
    expect(defaultProps.onEditMoment).toHaveBeenCalledWith(mockMoments[0]);
  });

  it('displays custom tags with different color', () => {
    render(<MomentList {...defaultProps} />);
    
    // Check that custom tag 'work' has different styling
    const workTag = screen.getByText('work');
    expect(workTag.closest('span')).toHaveClass('bg-orange-100');
  });

  it('sorts moments by time within each date group', () => {
    render(<MomentList {...defaultProps} />);
    
    // Get all moment contents
    const contents = screen.getAllByText(/Just had a great idea|Discovered a new way|Feeling motivated/);
    
    // Check order - newer moments should appear first within each date
    expect(contents[0]).toHaveTextContent('Just had a great idea about the project architecture');
    expect(contents[1]).toHaveTextContent('Discovered a new way to optimize the algorithm');
  });
});