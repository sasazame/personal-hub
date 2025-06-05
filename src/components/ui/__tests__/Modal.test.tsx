import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { 
  Modal, 
  ModalHeader, 
  ModalTitle, 
  ModalDescription, 
  ModalContent, 
  ModalFooter 
} from '../Modal';

// Mock createPortal to render in the same container
jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (node: React.ReactNode) => node,
}));

describe('Modal Components', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
    // Reset body overflow style
    document.body.style.overflow = 'unset';
  });

  describe('Modal', () => {
    it('does not render when closed', () => {
      render(
        <Modal open={false} onClose={mockOnClose}>
          <div>Modal content</div>
        </Modal>
      );

      expect(screen.queryByText('Modal content')).not.toBeInTheDocument();
    });

    it('renders when open', () => {
      render(
        <Modal open={true} onClose={mockOnClose}>
          <div>Modal content</div>
        </Modal>
      );

      expect(screen.getByText('Modal content')).toBeInTheDocument();
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('renders different sizes correctly', () => {
      const { rerender } = render(
        <Modal open={true} onClose={mockOnClose} size="sm">
          <div>Small modal</div>
        </Modal>
      );

      let dialog = screen.getByRole('dialog');
      expect(dialog).toHaveClass('max-w-sm');

      rerender(
        <Modal open={true} onClose={mockOnClose} size="lg">
          <div>Large modal</div>
        </Modal>
      );

      dialog = screen.getByRole('dialog');
      expect(dialog).toHaveClass('max-w-2xl');

      rerender(
        <Modal open={true} onClose={mockOnClose} size="full">
          <div>Full modal</div>
        </Modal>
      );

      dialog = screen.getByRole('dialog');
      expect(dialog).toHaveClass('max-w-[calc(100vw-2rem)]');
    });

    it('calls onClose when escape key is pressed', () => {
      render(
        <Modal open={true} onClose={mockOnClose}>
          <div>Modal content</div>
        </Modal>
      );

      fireEvent.keyDown(document, { key: 'Escape' });
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('does not call onClose when escape key is pressed if closeOnEscape is false', () => {
      render(
        <Modal open={true} onClose={mockOnClose} closeOnEscape={false}>
          <div>Modal content</div>
        </Modal>
      );

      fireEvent.keyDown(document, { key: 'Escape' });
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('calls onClose when backdrop is clicked', async () => {
      const user = userEvent.setup();
      render(
        <Modal open={true} onClose={mockOnClose}>
          <div>Modal content</div>
        </Modal>
      );

      // Click on the backdrop (parent container)
      const backdrop = screen.getByRole('dialog').parentElement;
      if (backdrop) {
        await user.click(backdrop);
        expect(mockOnClose).toHaveBeenCalledTimes(1);
      }
    });

    it('does not call onClose when backdrop is clicked if closeOnBackdrop is false', async () => {
      const user = userEvent.setup();
      render(
        <Modal open={true} onClose={mockOnClose} closeOnBackdrop={false}>
          <div>Modal content</div>
        </Modal>
      );

      const backdrop = screen.getByRole('dialog').parentElement;
      if (backdrop) {
        await user.click(backdrop);
        expect(mockOnClose).not.toHaveBeenCalled();
      }
    });

    it('prevents body scroll when open', () => {
      const { rerender } = render(
        <Modal open={true} onClose={mockOnClose}>
          <div>Modal content</div>
        </Modal>
      );

      expect(document.body.style.overflow).toBe('hidden');

      rerender(
        <Modal open={false} onClose={mockOnClose}>
          <div>Modal content</div>
        </Modal>
      );

      expect(document.body.style.overflow).toBe('unset');
    });

    it('applies custom className', () => {
      render(
        <Modal open={true} onClose={mockOnClose} className="custom-modal">
          <div>Modal content</div>
        </Modal>
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveClass('custom-modal');
    });

    it('has proper accessibility attributes', () => {
      render(
        <Modal open={true} onClose={mockOnClose}>
          <div>Modal content</div>
        </Modal>
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });
  });

  describe('ModalHeader', () => {
    it('renders correctly', () => {
      render(
        <Modal open={true} onClose={mockOnClose}>
          <ModalHeader data-testid="header">
            <ModalTitle>Test Title</ModalTitle>
          </ModalHeader>
        </Modal>
      );

      const header = screen.getByTestId('header');
      expect(header).toBeInTheDocument();
      expect(header).toHaveClass('flex', 'items-center', 'justify-between', 'p-6', 'border-b');
      expect(screen.getByText('Test Title')).toBeInTheDocument();
    });

    it('renders close button by default', () => {
      render(
        <Modal open={true} onClose={mockOnClose}>
          <ModalHeader onClose={mockOnClose}>
            <ModalTitle>Test Title</ModalTitle>
          </ModalHeader>
        </Modal>
      );

      const closeButton = screen.getByLabelText('Close modal');
      expect(closeButton).toBeInTheDocument();
    });

    it('does not render close button when showCloseButton is false', () => {
      render(
        <Modal open={true} onClose={mockOnClose}>
          <ModalHeader onClose={mockOnClose} showCloseButton={false}>
            <ModalTitle>Test Title</ModalTitle>
          </ModalHeader>
        </Modal>
      );

      expect(screen.queryByLabelText('Close modal')).not.toBeInTheDocument();
    });

    it('calls onClose when close button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <Modal open={true} onClose={mockOnClose}>
          <ModalHeader onClose={mockOnClose}>
            <ModalTitle>Test Title</ModalTitle>
          </ModalHeader>
        </Modal>
      );

      const closeButton = screen.getByLabelText('Close modal');
      await user.click(closeButton);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('ModalTitle', () => {
    it('renders with default heading level', () => {
      render(
        <Modal open={true} onClose={mockOnClose}>
          <ModalTitle>Modal Title</ModalTitle>
        </Modal>
      );

      const title = screen.getByRole('heading', { level: 2 });
      expect(title).toBeInTheDocument();
      expect(title).toHaveTextContent('Modal Title');
      expect(title).toHaveClass('text-lg', 'font-semibold');
    });

    it('renders with custom heading level', () => {
      render(
        <Modal open={true} onClose={mockOnClose}>
          <ModalTitle as="h1">Modal Title</ModalTitle>
        </Modal>
      );

      const title = screen.getByRole('heading', { level: 1 });
      expect(title).toBeInTheDocument();
    });
  });

  describe('ModalDescription', () => {
    it('renders correctly', () => {
      render(
        <Modal open={true} onClose={mockOnClose}>
          <ModalDescription>Modal description</ModalDescription>
        </Modal>
      );

      const description = screen.getByText('Modal description');
      expect(description).toBeInTheDocument();
      expect(description).toHaveClass('text-sm', 'text-muted-foreground');
    });
  });

  describe('ModalContent', () => {
    it('renders correctly', () => {
      render(
        <Modal open={true} onClose={mockOnClose}>
          <ModalContent data-testid="content">
            <p>Modal content</p>
          </ModalContent>
        </Modal>
      );

      const content = screen.getByTestId('content');
      expect(content).toBeInTheDocument();
      expect(content).toHaveClass('p-6');
      expect(screen.getByText('Modal content')).toBeInTheDocument();
    });
  });

  describe('ModalFooter', () => {
    it('renders correctly', () => {
      render(
        <Modal open={true} onClose={mockOnClose}>
          <ModalFooter data-testid="footer">
            <button>Cancel</button>
            <button>Confirm</button>
          </ModalFooter>
        </Modal>
      );

      const footer = screen.getByTestId('footer');
      expect(footer).toBeInTheDocument();
      expect(footer).toHaveClass('flex', 'p-6', 'border-t');
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
    });
  });

  describe('Complete Modal Example', () => {
    it('renders full modal structure', () => {
      render(
        <Modal open={true} onClose={mockOnClose}>
          <ModalHeader onClose={mockOnClose}>
            <ModalTitle>Confirm Action</ModalTitle>
            <ModalDescription>Are you sure you want to proceed?</ModalDescription>
          </ModalHeader>
          <ModalContent>
            <p>This action cannot be undone.</p>
          </ModalContent>
          <ModalFooter>
            <button>Cancel</button>
            <button>Confirm</button>
          </ModalFooter>
        </Modal>
      );

      expect(screen.getByRole('heading', { name: 'Confirm Action' })).toBeInTheDocument();
      expect(screen.getByText('Are you sure you want to proceed?')).toBeInTheDocument();
      expect(screen.getByText('This action cannot be undone.')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
      expect(screen.getByLabelText('Close modal')).toBeInTheDocument();
    });
  });
});