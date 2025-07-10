import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MomentForm } from '../MomentForm';
import { Moment } from '@/types/moment';

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'moments.momentContent': 'モーメントの内容',
      'moments.momentContentPlaceholder': '今、どんなことを考えていますか？',
      'moments.tags': 'タグ',
      'moments.tagsLabel': 'タグ',
      'moments.addMoment': '新しいモーメント',
      'moments.editMoment': 'モーメントを編集',
      'moments.creating': '記録中...',
      'moments.updating': '更新中...',
      'moments.create': '記録',
      'moments.update': '更新',
      'moments.contentRequired': '内容は必須です',
      'moments.addCustomTag': 'カスタムタグを追加',
      'moments.customTagPlaceholder': '#タグ名を入力',
      'moments.tags.ideas': 'アイデア',
      'moments.tags.discoveries': '発見',
      'moments.tags.emotions': '感情',
      'moments.tags.log': '記録',
      'moments.tags.other': 'その他',
      'common.cancel': 'キャンセル',
    };
    return translations[key] || key;
  },
}));

const mockMoment: Moment = {
  id: 1,
  content: 'Test moment content',
  tags: ['Ideas', 'work'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const defaultProps = {
  isOpen: true,
  onClose: jest.fn(),
  onSubmit: jest.fn(),
  isSubmitting: false,
};

describe('MomentForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders form fields when open', () => {
    render(<MomentForm {...defaultProps} />);
    
    expect(screen.getByPlaceholderText('今、どんなことを考えていますか？')).toBeInTheDocument();
    expect(screen.getByText('タグ')).toBeInTheDocument();
  });

  it('shows create mode when no moment provided', () => {
    render(<MomentForm {...defaultProps} />);
    
    expect(screen.getByText('新しいモーメント')).toBeInTheDocument();
    // Find the submit button specifically by looking for submit type buttons
    const submitButtons = screen.getAllByRole('button').filter(button => 
      button.getAttribute('type') === 'submit'
    );
    expect(submitButtons).toHaveLength(1);
    expect(submitButtons[0]).toHaveTextContent('記録');
  });

  it('shows edit mode when moment provided', () => {
    render(<MomentForm {...defaultProps} moment={mockMoment} />);
    
    expect(screen.getByText('モーメントを編集')).toBeInTheDocument();
    expect(screen.getByText('更新')).toBeInTheDocument();
  });

  it('populates form with moment data in edit mode', () => {
    render(<MomentForm {...defaultProps} moment={mockMoment} />);
    
    expect(screen.getByDisplayValue('Test moment content')).toBeInTheDocument();
  });

  it('displays default tag buttons', () => {
    render(<MomentForm {...defaultProps} />);
    
    // Find tag buttons by their container and icon
    const tagButtons = screen.getAllByRole('button').filter(button => 
      button.querySelector('.lucide-tag') && button.getAttribute('type') === 'button'
    );
    
    // Should have 5 default tag buttons
    expect(tagButtons).toHaveLength(5);
    
    // Check that all default tag translations are present
    expect(screen.getByText('アイデア')).toBeInTheDocument();
    expect(screen.getByText('発見')).toBeInTheDocument();
    expect(screen.getByText('感情')).toBeInTheDocument();
    expect(screen.getAllByText('記録')).toHaveLength(2); // One in tag button, one in submit button
    expect(screen.getByText('その他')).toBeInTheDocument();
  });

  it('highlights selected tags in edit mode', () => {
    render(<MomentForm {...defaultProps} moment={mockMoment} />);
    
    // Ideas tag should be highlighted - find the button containing the text
    const ideasButton = screen.getAllByRole('button').find(button => 
      button.textContent === 'アイデア' && button.getAttribute('type') === 'button'
    );
    
    expect(ideasButton).toBeDefined();
    expect(ideasButton).toHaveClass('ring-2');
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();
    render(<MomentForm {...defaultProps} />);
    
    // Find submit button by type attribute
    const submitButton = screen.getAllByRole('button').find(button => 
      button.getAttribute('type') === 'submit'
    );
    
    expect(submitButton).toBeDefined();
    await user.click(submitButton!);
    
    await waitFor(() => {
      expect(screen.getByText('内容は必須です')).toBeInTheDocument();
    });
  });

  it('submits form with correct data', async () => {
    const user = userEvent.setup();
    render(<MomentForm {...defaultProps} />);
    
    await user.type(screen.getByPlaceholderText('今、どんなことを考えていますか？'), 'New moment content');
    
    // Select a default tag - find the Ideas tag button
    const ideasButton = screen.getAllByRole('button').find(button => 
      button.textContent === 'アイデア' && button.getAttribute('type') === 'button'
    );
    await user.click(ideasButton!);
    
    // Find submit button by type attribute
    const submitButton = screen.getAllByRole('button').find(button => 
      button.getAttribute('type') === 'submit'
    );
    
    expect(submitButton).toBeDefined();
    await user.click(submitButton!);
    
    await waitFor(() => {
      expect(defaultProps.onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          content: 'New moment content',
          tags: ['Ideas'],
        })
      );
    });
  });

  it('allows toggling default tags', async () => {
    const user = userEvent.setup();
    render(<MomentForm {...defaultProps} />);
    
    // Find the Ideas tag button
    const ideasButton = screen.getAllByRole('button').find(button => 
      button.textContent === 'アイデア' && button.getAttribute('type') === 'button'
    );
    
    expect(ideasButton).toBeDefined();
    
    // Click to select
    await user.click(ideasButton!);
    expect(ideasButton).toHaveClass('ring-2');
    
    // Click again to deselect
    await user.click(ideasButton!);
    expect(ideasButton).not.toHaveClass('ring-2');
  });

  it('shows custom tag input when button is clicked', async () => {
    const user = userEvent.setup();
    render(<MomentForm {...defaultProps} />);
    
    const addCustomButton = screen.getByText('カスタムタグを追加');
    await user.click(addCustomButton);
    
    expect(screen.getByPlaceholderText('#タグ名を入力')).toBeInTheDocument();
  });

  it('allows adding custom tags', async () => {
    const user = userEvent.setup();
    render(<MomentForm {...defaultProps} />);
    
    const addCustomButton = screen.getByText('カスタムタグを追加');
    await user.click(addCustomButton);
    
    const tagInput = screen.getByPlaceholderText('#タグ名を入力');
    await user.type(tagInput, 'customtag{enter}');
    
    expect(screen.getByText('#customtag')).toBeInTheDocument();
  });

  it('automatically adds # to custom tags if missing', async () => {
    const user = userEvent.setup();
    render(<MomentForm {...defaultProps} />);
    
    const addCustomButton = screen.getByText('カスタムタグを追加');
    await user.click(addCustomButton);
    
    const tagInput = screen.getByPlaceholderText('#タグ名を入力');
    await user.type(tagInput, 'notag{enter}');
    
    expect(screen.getByText('#notag')).toBeInTheDocument();
  });

  it('allows removing custom tags', async () => {
    const user = userEvent.setup();
    render(<MomentForm {...defaultProps} moment={{...mockMoment, tags: ['Ideas', '#custom']}} />);
    
    // Find the remove button for the custom tag
    const customTag = screen.getByText('#custom');
    const removeButton = customTag.parentElement?.querySelector('button[type="button"]');
    
    if (removeButton) {
      await user.click(removeButton);
    }
    
    await waitFor(() => {
      expect(screen.queryByText('#custom')).not.toBeInTheDocument();
    });
  });

  it('displays custom tags separately from default tags', () => {
    render(<MomentForm {...defaultProps} moment={{...mockMoment, tags: ['Ideas', 'work']}} />);
    
    // Custom tag 'work' should be displayed in a separate section
    const workTag = screen.getByText('work');
    expect(workTag).toBeInTheDocument();
    
    // It should have a remove button
    expect(workTag.parentElement?.querySelector('button')).toBeInTheDocument();
  });

  it('calls onClose when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<MomentForm {...defaultProps} />);
    
    const cancelButton = screen.getByText('キャンセル');
    await user.click(cancelButton);
    
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('disables form when submitting', () => {
    render(<MomentForm {...defaultProps} isSubmitting={true} />);
    
    expect(screen.getByText('記録中...')).toBeInTheDocument();
    expect(screen.getByText('キャンセル')).toBeDisabled();
  });

  it('does not render when closed', () => {
    render(<MomentForm {...defaultProps} isOpen={false} />);
    
    expect(screen.queryByText('新しいモーメント')).not.toBeInTheDocument();
  });

  it('focuses content field on mount', () => {
    render(<MomentForm {...defaultProps} />);
    
    const contentField = screen.getByPlaceholderText('今、どんなことを考えていますか？');
    expect(contentField).toHaveFocus();
  });

  it('closes custom tag input when X button is clicked', async () => {
    const user = userEvent.setup();
    render(<MomentForm {...defaultProps} />);
    
    // Open custom tag input
    const addCustomButton = screen.getByText('カスタムタグを追加');
    await user.click(addCustomButton);
    
    // Find and click the X button
    const closeButtons = screen.getAllByRole('button').filter(btn => 
      btn.querySelector('svg')?.getAttribute('class')?.includes('w-4')
    );
    const closeButton = closeButtons[closeButtons.length - 1]; // Last one should be the X button
    
    await user.click(closeButton);
    
    expect(screen.queryByPlaceholderText('#タグ名を入力')).not.toBeInTheDocument();
  });
});