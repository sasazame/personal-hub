import { render, screen } from '@testing-library/react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from '../Card';

describe('Card Components', () => {
  describe('Card', () => {
    it('renders with default props', () => {
      render(<Card data-testid="card">Card content</Card>);
      
      const card = screen.getByTestId('card');
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass('bg-card', 'text-card-foreground', 'border', 'border-border', 'transition-all', 'duration-200');
      expect(card).toHaveClass('shadow-sm'); // default variant
      expect(card).toHaveClass('p-4'); // default padding
      expect(card).toHaveClass('rounded-lg'); // default rounded
    });

    it('renders different variants correctly', () => {
      const { rerender } = render(<Card variant="elevated" data-testid="card">Content</Card>);
      expect(screen.getByTestId('card')).toHaveClass('shadow-md');

      rerender(<Card variant="glass" data-testid="card">Content</Card>);
      expect(screen.getByTestId('card')).toHaveClass('backdrop-blur-md', 'bg-card/80');

      rerender(<Card variant="outline" data-testid="card">Content</Card>);
      expect(screen.getByTestId('card')).toHaveClass('border-2', 'shadow-none');
    });

    it('renders different padding sizes correctly', () => {
      const { rerender } = render(<Card padding="none" data-testid="card">Content</Card>);
      expect(screen.getByTestId('card')).toHaveClass('p-0');

      rerender(<Card padding="sm" data-testid="card">Content</Card>);
      expect(screen.getByTestId('card')).toHaveClass('p-3');

      rerender(<Card padding="lg" data-testid="card">Content</Card>);
      expect(screen.getByTestId('card')).toHaveClass('p-6');

      rerender(<Card padding="xl" data-testid="card">Content</Card>);
      expect(screen.getByTestId('card')).toHaveClass('p-8');
    });

    it('renders different rounded sizes correctly', () => {
      const { rerender } = render(<Card rounded="none" data-testid="card">Content</Card>);
      expect(screen.getByTestId('card')).toHaveClass('rounded-none');

      rerender(<Card rounded="sm" data-testid="card">Content</Card>);
      expect(screen.getByTestId('card')).toHaveClass('rounded-sm');

      rerender(<Card rounded="xl" data-testid="card">Content</Card>);
      expect(screen.getByTestId('card')).toHaveClass('rounded-xl');
    });

    it('applies custom className', () => {
      render(<Card className="custom-class" data-testid="card">Content</Card>);
      
      const card = screen.getByTestId('card');
      expect(card).toHaveClass('custom-class');
      expect(card).toHaveClass('bg-card'); // Should still have base classes
    });

    it('forwards ref correctly', () => {
      const ref = jest.fn();
      render(<Card ref={ref}>Content</Card>);
      
      expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
    });
  });

  describe('CardHeader', () => {
    it('renders correctly', () => {
      render(<CardHeader data-testid="header">Header content</CardHeader>);
      
      const header = screen.getByTestId('header');
      expect(header).toBeInTheDocument();
      expect(header).toHaveClass('flex', 'flex-col', 'space-y-1.5');
      expect(header).toHaveTextContent('Header content');
    });

    it('applies custom className', () => {
      render(<CardHeader className="custom-header" data-testid="header">Content</CardHeader>);
      
      expect(screen.getByTestId('header')).toHaveClass('custom-header', 'flex');
    });
  });

  describe('CardTitle', () => {
    it('renders with default heading level', () => {
      render(<CardTitle>Card Title</CardTitle>);
      
      const title = screen.getByRole('heading', { level: 3 });
      expect(title).toBeInTheDocument();
      expect(title).toHaveTextContent('Card Title');
      expect(title).toHaveClass('text-lg', 'font-semibold');
    });

    it('renders with custom heading level', () => {
      render(<CardTitle as="h1">Card Title</CardTitle>);
      
      const title = screen.getByRole('heading', { level: 1 });
      expect(title).toBeInTheDocument();
      expect(title).toHaveTextContent('Card Title');
    });

    it('applies custom className', () => {
      render(<CardTitle className="custom-title">Title</CardTitle>);
      
      const title = screen.getByRole('heading');
      expect(title).toHaveClass('custom-title', 'text-lg');
    });
  });

  describe('CardDescription', () => {
    it('renders correctly', () => {
      render(<CardDescription>Card description</CardDescription>);
      
      const description = screen.getByText('Card description');
      expect(description).toBeInTheDocument();
      expect(description).toHaveClass('text-sm', 'text-muted-foreground');
    });

    it('applies custom className', () => {
      render(<CardDescription className="custom-desc">Description</CardDescription>);
      
      const description = screen.getByText('Description');
      expect(description).toHaveClass('custom-desc', 'text-sm');
    });
  });

  describe('CardContent', () => {
    it('renders correctly', () => {
      render(<CardContent data-testid="content">Card content</CardContent>);
      
      const content = screen.getByTestId('content');
      expect(content).toBeInTheDocument();
      expect(content).toHaveClass('pt-0');
      expect(content).toHaveTextContent('Card content');
    });

    it('applies custom className', () => {
      render(<CardContent className="custom-content" data-testid="content">Content</CardContent>);
      
      expect(screen.getByTestId('content')).toHaveClass('custom-content', 'pt-0');
    });
  });

  describe('CardFooter', () => {
    it('renders correctly', () => {
      render(<CardFooter data-testid="footer">Footer content</CardFooter>);
      
      const footer = screen.getByTestId('footer');
      expect(footer).toBeInTheDocument();
      expect(footer).toHaveClass('flex', 'items-center', 'pt-4');
      expect(footer).toHaveTextContent('Footer content');
    });

    it('applies custom className', () => {
      render(<CardFooter className="custom-footer" data-testid="footer">Content</CardFooter>);
      
      expect(screen.getByTestId('footer')).toHaveClass('custom-footer', 'flex');
    });
  });

  describe('Complete Card Example', () => {
    it('renders full card structure', () => {
      render(
        <Card data-testid="full-card">
          <CardHeader>
            <CardTitle>Test Title</CardTitle>
            <CardDescription>Test Description</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Test content</p>
          </CardContent>
          <CardFooter>
            <button>Action</button>
          </CardFooter>
        </Card>
      );

      expect(screen.getByTestId('full-card')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Test Title' })).toBeInTheDocument();
      expect(screen.getByText('Test Description')).toBeInTheDocument();
      expect(screen.getByText('Test content')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
    });
  });
});