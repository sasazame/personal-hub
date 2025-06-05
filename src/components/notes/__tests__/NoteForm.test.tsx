import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NoteForm } from '../NoteForm';
import { Note } from '@/types/note';

const mockNote: Note = {
  id: 1,
  title: 'Test Note',
  content: 'Test content',
  category: '仕事',
  tags: ['test', 'example'],
  isPinned: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const defaultProps = {
  isOpen: true,
  onClose: jest.fn(),
  onSubmit: jest.fn(),
  isSubmitting: false,
};

describe('NoteForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders form fields when open', () => {
    render(<NoteForm {...defaultProps} />);
    
    expect(screen.getByPlaceholderText('ノートのタイトル')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('ノートの内容を入力してください...')).toBeInTheDocument();
    expect(screen.getByText('カテゴリ')).toBeInTheDocument();
    expect(screen.getByText('タグ')).toBeInTheDocument();
  });

  it('shows create mode when no note provided', () => {
    render(<NoteForm {...defaultProps} />);
    
    expect(screen.getByText('新しいノート')).toBeInTheDocument();
    expect(screen.getByText('作成')).toBeInTheDocument();
  });

  it('shows edit mode when note provided', () => {
    render(<NoteForm {...defaultProps} note={mockNote} />);
    
    expect(screen.getByText('ノートを編集')).toBeInTheDocument();
    expect(screen.getByText('更新')).toBeInTheDocument();
  });

  it('populates form with note data in edit mode', () => {
    render(<NoteForm {...defaultProps} note={mockNote} />);
    
    expect(screen.getByDisplayValue('Test Note')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test content')).toBeInTheDocument();
    expect(screen.getByDisplayValue('仕事')).toBeInTheDocument();
  });

  it('displays existing tags in edit mode', () => {
    render(<NoteForm {...defaultProps} note={mockNote} />);
    
    expect(screen.getByText('test')).toBeInTheDocument();
    expect(screen.getByText('example')).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();
    render(<NoteForm {...defaultProps} />);
    
    const submitButton = screen.getByText('作成');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('タイトルは必須です')).toBeInTheDocument();
    });
  });

  it('submits form with correct data', async () => {
    const user = userEvent.setup();
    render(<NoteForm {...defaultProps} />);
    
    await user.type(screen.getByPlaceholderText('ノートのタイトル'), 'New Note');
    await user.type(screen.getByPlaceholderText('ノートの内容を入力してください...'), 'Note content');
    
    const submitButton = screen.getByText('作成');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(defaultProps.onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'New Note',
          content: 'Note content',
          tags: [],
          isPinned: false,
        })
      );
    });
  });

  it('allows adding tags', async () => {
    const user = userEvent.setup();
    render(<NoteForm {...defaultProps} />);
    
    const tagInput = screen.getByPlaceholderText('新しいタグを入力');
    await user.type(tagInput, 'newtag{enter}');
    
    expect(screen.getByText('newtag')).toBeInTheDocument();
  });

  it('allows adding tags with Enter key', async () => {
    const user = userEvent.setup();
    render(<NoteForm {...defaultProps} />);
    
    const tagInput = screen.getByPlaceholderText('新しいタグを入力');
    await user.type(tagInput, 'entertag{enter}');
    
    expect(screen.getByText('entertag')).toBeInTheDocument();
  });

  it('allows removing tags', async () => {
    const user = userEvent.setup();
    render(<NoteForm {...defaultProps} note={mockNote} />);
    
    const removeButton = screen.getAllByRole('button').find(btn => 
      btn.querySelector('svg')?.getAttribute('class')?.includes('w-3')
    );
    
    if (removeButton) {
      await user.click(removeButton);
    }
    
    await waitFor(() => {
      expect(screen.queryByText('test')).not.toBeInTheDocument();
    });
  });

  it('shows pin button', () => {
    render(<NoteForm {...defaultProps} />);
    
    expect(screen.getByTitle('ピン留め')).toBeInTheDocument();
  });

  it('displays category dropdown', () => {
    render(<NoteForm {...defaultProps} />);
    
    expect(screen.getByText('カテゴリ')).toBeInTheDocument();
    expect(screen.getByText('カテゴリなし')).toBeInTheDocument();
  });

  it('calls onClose when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<NoteForm {...defaultProps} />);
    
    const cancelButton = screen.getByText('キャンセル');
    await user.click(cancelButton);
    
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('disables form when submitting', () => {
    render(<NoteForm {...defaultProps} isSubmitting={true} />);
    
    expect(screen.getByText('保存中...')).toBeInTheDocument();
    expect(screen.getByText('キャンセル')).toBeDisabled();
  });

  it('does not render when closed', () => {
    render(<NoteForm {...defaultProps} isOpen={false} />);
    
    expect(screen.queryByText('新しいノート')).not.toBeInTheDocument();
  });

  it('displays existing tags in edit mode', () => {
    render(<NoteForm {...defaultProps} note={mockNote} />);
    
    // Should show existing tags
    expect(screen.getByText('test')).toBeInTheDocument();
    expect(screen.getByText('example')).toBeInTheDocument();
  });
});