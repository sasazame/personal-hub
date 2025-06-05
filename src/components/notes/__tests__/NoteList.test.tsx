import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NoteList } from '../NoteList';
import { Note } from '@/types/note';

const mockNotes: Note[] = [
  {
    id: 1,
    title: 'Pinned Note',
    content: 'This is a pinned note with some content that should be truncated if it is too long.',
    category: 'Work',
    tags: ['important', 'project'],
    isPinned: true,
    createdAt: new Date(2025, 5, 10).toISOString(),
    updatedAt: new Date(2025, 5, 15).toISOString(),
  },
  {
    id: 2,
    title: 'Regular Note',
    content: 'This is a regular note.',
    category: 'Personal',
    tags: ['idea'],
    isPinned: false,
    createdAt: new Date(2025, 5, 12).toISOString(),
    updatedAt: new Date(2025, 5, 12).toISOString(),
  },
  {
    id: 3,
    title: 'Note with Many Tags',
    content: 'Short content.',
    tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5'],
    isPinned: false,
    createdAt: new Date(2025, 5, 8).toISOString(),
    updatedAt: new Date(2025, 5, 8).toISOString(),
  },
];

const defaultProps = {
  notes: mockNotes,
  onNoteClick: jest.fn(),
  onEditNote: jest.fn(),
  onDeleteNote: jest.fn(),
  onTogglePin: jest.fn(),
};

// Mock date-fns format function
jest.mock('date-fns', () => ({
  format: jest.fn((date, formatStr) => {
    if (formatStr === 'yyyy/MM/dd') return '2025/06/15';
    if (formatStr === 'yyyy/MM/dd HH:mm') return '2025/06/15 10:30';
    return '2025/06/15';
  }),
}));

describe('NoteList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders empty state when no notes', () => {
    render(<NoteList {...defaultProps} notes={[]} />);
    
    expect(screen.getByText('ノートがありません')).toBeInTheDocument();
    expect(screen.getByText('新しいノートを作成して始めましょう')).toBeInTheDocument();
  });

  it('renders all notes', () => {
    render(<NoteList {...defaultProps} />);
    
    expect(screen.getByText('Pinned Note')).toBeInTheDocument();
    expect(screen.getByText('Regular Note')).toBeInTheDocument();
    expect(screen.getByText('Note with Many Tags')).toBeInTheDocument();
  });

  it('shows pinned notes first', () => {
    render(<NoteList {...defaultProps} />);
    
    const noteElements = screen.getAllByRole('generic').filter(el => 
      el.className.includes('cursor-pointer')
    );
    
    // First note card should be the pinned one
    expect(noteElements[0]).toHaveTextContent('Pinned Note');
  });

  it('displays pin indicator for pinned notes', () => {
    render(<NoteList {...defaultProps} />);
    
    const pinnedNote = screen.getByText('Pinned Note').closest('[data-testid], div');
    expect(pinnedNote?.querySelector('svg')).toBeInTheDocument(); // Pin icon
  });

  it('shows category when available', () => {
    render(<NoteList {...defaultProps} />);
    
    expect(screen.getByText('Work')).toBeInTheDocument();
    expect(screen.getByText('Personal')).toBeInTheDocument();
  });

  it('displays tags with limit', () => {
    render(<NoteList {...defaultProps} />);
    
    expect(screen.getByText('important')).toBeInTheDocument();
    expect(screen.getByText('project')).toBeInTheDocument();
    expect(screen.getByText('idea')).toBeInTheDocument();
    
    // Should show +2 more for the note with many tags (shows first 3 tags)
    expect(screen.getByText('+2')).toBeInTheDocument();
  });

  it('truncates long content', () => {
    render(<NoteList {...defaultProps} />);
    
    const truncatedContent = screen.getByText(/This is a pinned note with some content/);
    expect(truncatedContent.textContent).toMatch(/\.\.\.$/);
  });

  it('calls onNoteClick when note is clicked', async () => {
    const user = userEvent.setup();
    render(<NoteList {...defaultProps} />);
    
    const noteCard = screen.getByText('Regular Note').closest('div')!;
    await user.click(noteCard);
    
    expect(defaultProps.onNoteClick).toHaveBeenCalledWith(mockNotes[1]);
  });

  it('shows action buttons on hover', async () => {
    const user = userEvent.setup();
    render(<NoteList {...defaultProps} />);
    
    const noteCard = screen.getByText('Regular Note').closest('div')!;
    await user.hover(noteCard);
    
    // Actions should be visible (they have opacity-0 by default, opacity-100 on hover)
    const editButton = screen.getByTitle('編集');
    const deleteButton = screen.getByTitle('削除');
    const pinButton = screen.getByTitle('ピン留め');
    
    expect(editButton).toBeInTheDocument();
    expect(deleteButton).toBeInTheDocument();
    expect(pinButton).toBeInTheDocument();
  });

  it('calls onTogglePin when pin button is clicked', async () => {
    const user = userEvent.setup();
    render(<NoteList {...defaultProps} />);
    
    const pinButton = screen.getByTitle('ピン留め');
    await user.click(pinButton);
    
    expect(defaultProps.onTogglePin).toHaveBeenCalledWith(mockNotes[1]);
  });

  it('calls onEditNote when edit button is clicked', async () => {
    const user = userEvent.setup();
    render(<NoteList {...defaultProps} />);
    
    const editButton = screen.getByTitle('編集');
    await user.click(editButton);
    
    expect(defaultProps.onEditNote).toHaveBeenCalledWith(mockNotes[0]);
  });

  it('calls onDeleteNote when delete button is clicked', async () => {
    const user = userEvent.setup();
    render(<NoteList {...defaultProps} />);
    
    const deleteButton = screen.getByTitle('削除');
    await user.click(deleteButton);
    
    expect(defaultProps.onDeleteNote).toHaveBeenCalledWith(mockNotes[0]);
  });

  it('prevents note click when action button is clicked', async () => {
    const user = userEvent.setup();
    render(<NoteList {...defaultProps} />);
    
    const editButton = screen.getByTitle('編集');
    await user.click(editButton);
    
    expect(defaultProps.onNoteClick).not.toHaveBeenCalled();
    expect(defaultProps.onEditNote).toHaveBeenCalled();
  });

  it('shows different pin button text for pinned notes', () => {
    render(<NoteList {...defaultProps} />);
    
    const unpinButton = screen.getByTitle('ピンを外す');
    const pinButton = screen.getByTitle('ピン留め');
    
    expect(unpinButton).toBeInTheDocument();
    expect(pinButton).toBeInTheDocument();
  });

  it('displays creation and update dates', () => {
    render(<NoteList {...defaultProps} />);
    
    expect(screen.getAllByText('作成: 2025/06/15')).toHaveLength(3);
    expect(screen.getByText('更新: 2025/06/15 10:30')).toBeInTheDocument();
  });
});