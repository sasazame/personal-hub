import { cn, cva } from '../cn';

describe('cn utility', () => {
  it('merges string classes', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2');
  });

  it('handles conditional classes with objects', () => {
    expect(cn('base', { 'conditional': true, 'disabled': false }))
      .toBe('base conditional');
  });

  it('handles array inputs', () => {
    expect(cn(['class1', 'class2'], 'class3'))
      .toBe('class1 class2 class3');
  });

  it('filters out falsy values', () => {
    expect(cn('class1', null, undefined, false, '', 'class2'))
      .toBe('class1 class2');
  });

  it('handles nested arrays', () => {
    expect(cn(['class1', ['class2', 'class3']], 'class4'))
      .toBe('class1 class2 class3 class4');
  });

  it('handles complex mixed inputs', () => {
    expect(cn(
      'base',
      ['array-class'],
      { 'conditional-true': true, 'conditional-false': false },
      undefined,
      'final'
    )).toBe('base array-class conditional-true final');
  });
});

describe('cva utility', () => {
  const buttonVariants = cva('btn base-class', {
    variants: {
      variant: {
        primary: 'btn-primary',
        secondary: 'btn-secondary',
        destructive: 'btn-destructive',
      },
      size: {
        sm: 'btn-sm',
        md: 'btn-md',
        lg: 'btn-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  });

  it('applies base classes', () => {
    expect(buttonVariants()).toBe('btn base-class btn-primary btn-md');
  });

  it('applies specified variants', () => {
    expect(buttonVariants({ variant: 'secondary', size: 'lg' }))
      .toBe('btn base-class btn-secondary btn-lg');
  });

  it('applies default variants when not specified', () => {
    expect(buttonVariants({ size: 'sm' }))
      .toBe('btn base-class btn-primary btn-sm');
  });

  it('merges additional className', () => {
    expect(buttonVariants({ 
      variant: 'destructive', 
      className: 'custom-class' 
    })).toBe('btn base-class btn-md btn-destructive custom-class');
  });

  it('handles empty props object', () => {
    expect(buttonVariants({}))
      .toBe('btn base-class btn-primary btn-md');
  });

  it('handles invalid variant values gracefully', () => {
    expect(buttonVariants({ 
      // @ts-expect-error - Testing runtime behavior with invalid variant
      variant: 'invalid',
      size: 'sm'
    })).toBe('btn base-class btn-sm');
  });
});

describe('Design System Integration', () => {
  const cardVariants = cva('card rounded border', {
    variants: {
      variant: {
        default: 'bg-card text-card-foreground',
        outline: 'border-2 bg-transparent',
        filled: 'bg-muted border-0',
      },
      padding: {
        none: 'p-0',
        sm: 'p-3',
        md: 'p-4',
        lg: 'p-6',
      },
      shadow: {
        none: 'shadow-none',
        sm: 'shadow-sm',
        md: 'shadow-md',
        lg: 'shadow-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
      shadow: 'sm',
    },
  });

  it('creates card with design system classes', () => {
    expect(cardVariants())
      .toBe('card rounded border bg-card text-card-foreground p-4 shadow-sm');
  });

  it('allows full customization', () => {
    expect(cardVariants({
      variant: 'outline',
      padding: 'lg',
      shadow: 'lg',
      className: 'custom-card'
    })).toBe('card rounded border border-2 bg-transparent p-6 shadow-lg custom-card');
  });

  it('handles partial customization', () => {
    expect(cardVariants({ shadow: 'none' }))
      .toBe('card rounded border bg-card text-card-foreground p-4 shadow-none');
  });
});