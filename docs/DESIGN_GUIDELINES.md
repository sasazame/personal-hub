# Personal Hub Design Guidelines

## Design Philosophy

Inspired by Apple's human interface guidelines, our design system prioritizes clarity, deference, and depth while maintaining accessibility and modern aesthetics.

### Core Principles

1. **Clarity** - Content is paramount, UI elements support without overwhelming
2. **Deference** - Interface defers to content through subtle design
3. **Depth** - Layered visuals provide hierarchy and guide interaction
4. **Consistency** - Unified experience across all features
5. **Accessibility** - Inclusive design for all users

## Visual Language

### Color System

#### Primary Palette
```css
/* Blue gradient system - premium feel */
--color-primary-50: #eff6ff;
--color-primary-100: #dbeafe;
--color-primary-200: #bfdbfe;
--color-primary-300: #93c5fd;
--color-primary-400: #60a5fa;
--color-primary-500: #3b82f6;
--color-primary-600: #2563eb;
--color-primary-700: #1d4ed8;
--color-primary-800: #1e40af;
--color-primary-900: #1e3a8a;
--color-primary-950: #172554;

/* Accent - Vibrant indigo for special actions */
--color-accent-50: #eef2ff;
--color-accent-100: #e0e7ff;
--color-accent-200: #c7d2fe;
--color-accent-300: #a5b4fc;
--color-accent-400: #818cf8;
--color-accent-500: #6366f1;
--color-accent-600: #4f46e5;
--color-accent-700: #4338ca;
--color-accent-800: #3730a3;
--color-accent-900: #312e81;
```

#### Semantic Colors
- **Success**: Green (#10b981) - Positive actions/states
- **Warning**: Amber (#f59e0b) - Caution/attention needed
- **Error**: Red (#ef4444) - Errors/destructive actions
- **Info**: Sky (#0ea5e9) - Informational content

#### Background Layers (Light Mode)
```css
--bg-primary: #ffffff;      /* Main background */
--bg-secondary: #fafbfc;    /* Subtle sections */
--bg-tertiary: #f5f7fa;     /* Recessed areas */
--bg-elevated: #ffffff;     /* Cards/modals */
--bg-overlay: rgba(0,0,0,0.4); /* Modal backdrop */
```

#### Background Layers (Dark Mode)
```css
--bg-primary: #0a0f1e;      /* Main background */
--bg-secondary: #101827;    /* Subtle sections */
--bg-tertiary: #1e293b;     /* Recessed areas */
--bg-elevated: #1a2234;     /* Cards/modals */
--bg-overlay: rgba(0,0,0,0.7); /* Modal backdrop */
```

### Typography

#### Font Stack
```css
--font-display: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif;
--font-body: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, sans-serif;
--font-mono: "SF Mono", Monaco, "Cascadia Code", Consolas, monospace;
```

#### Type Scale
```css
--text-xs: 0.75rem;     /* 12px - Captions */
--text-sm: 0.875rem;    /* 14px - Secondary text */
--text-base: 1rem;      /* 16px - Body text */
--text-lg: 1.125rem;    /* 18px - Emphasized body */
--text-xl: 1.25rem;     /* 20px - Section headers */
--text-2xl: 1.5rem;     /* 24px - Page headers */
--text-3xl: 1.875rem;   /* 30px - Major headers */
--text-4xl: 2.25rem;    /* 36px - Hero text */
```

#### Font Weights
- Light: 300 (Display headers only)
- Regular: 400 (Body text)
- Medium: 500 (UI labels)
- Semibold: 600 (Emphasis)
- Bold: 700 (Strong emphasis)

### Spacing System

Based on 4px grid for precise alignment:
```css
--space-0: 0;
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-5: 1.25rem;  /* 20px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
--space-10: 2.5rem;  /* 40px */
--space-12: 3rem;    /* 48px */
--space-16: 4rem;    /* 64px */
```

### Elevation & Shadows

Subtle shadows for depth without harshness:
```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-base: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
```

### Border Radius

Smooth, modern corners:
```css
--radius-sm: 0.375rem;   /* 6px - Small elements */
--radius-md: 0.5rem;     /* 8px - Buttons */
--radius-lg: 0.75rem;    /* 12px - Cards */
--radius-xl: 1rem;       /* 16px - Modals */
--radius-2xl: 1.5rem;    /* 24px - Large cards */
--radius-full: 9999px;   /* Pills/avatars */
```

## Component Design Patterns

### Cards
- **Background**: Pure white (light) or elevated surface (dark)
- **Border**: 1px subtle border (rgba(0,0,0,0.05))
- **Shadow**: shadow-base by default, shadow-md on hover
- **Radius**: radius-lg (12px)
- **Padding**: space-5 (20px) standard
- **Transition**: All properties 200ms ease

### Buttons

#### Primary Button
- **Background**: Blue gradient (primary-600 to primary-700)
- **Text**: White, medium weight
- **Border**: None (clean gradient look)
- **Padding**: Varies by size (sm: h-8 px-3, md: h-10 px-5, lg: h-12 px-6)
- **Radius**: Rounded corners (sm: radius-md, md/lg: radius-lg)
- **Shadow**: shadow-sm default, shadow-md hover
- **Transform**: translateY(-1px) on hover, translateY(0) on press
- **Transition**: All properties 200ms ease

#### Secondary Button
- **Background**: White (light) or card bg (dark)
- **Border**: 1px border-color
- **Text**: Foreground color, medium weight
- **Shadow**: shadow-sm default, shadow-md hover
- **Hover**: Transform translateY(-1px)

#### Ghost Button
- **Background**: Transparent
- **Text**: Inherit color
- **Hover**: Background with 10% opacity

### Form Elements

#### Input Fields
- **Height**: 44px (touch-friendly)
- **Background**: White with subtle border
- **Border**: 1.5px transparent, primary on focus
- **Radius**: radius-md (8px)
- **Padding**: space-3 horizontal
- **Focus**: Primary border + subtle shadow
- **Transition**: Border/shadow 200ms ease

#### Floating Labels
- **Animation**: Smooth scale and translate
- **Color**: Muted default, primary on focus
- **Background**: Match input background for overlap

### Navigation

#### Sidebar
- **Width**: 256px desktop, full mobile
- **Background**: 90% opacity white (light) or 80% opacity dark bg
- **Items**: 44px height, radius-xl (12px)
- **Active**: Gradient from primary-100 to accent-100 (light mode)
- **Icons**: 20px, scale 1.1 when active
- **Hover**: Neutral-100 background (light) or neutral-800 (dark)

#### Header
- **Height**: 64px
- **Background**: 90% opacity white (light) or 80% opacity dark bg with blur
- **Shadow**: Subtle bottom shadow
- **Z-index**: 1030 (fixed)
- **Logo**: Gradient icon with rounded corners

### Modals & Overlays
- **Backdrop**: Dark overlay with blur
- **Content**: White/elevated background
- **Radius**: radius-xl (16px)
- **Shadow**: shadow-xl
- **Animation**: Fade + scale from 0.95

### Animations

#### Micro-interactions
```css
/* Hover lift */
@keyframes lift {
  to { transform: translateY(-2px); }
}

/* Gentle pulse */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

/* Smooth appear */
@keyframes appear {
  from { 
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
```

#### Timing Functions
- **Swift**: cubic-bezier(0.4, 0, 0.2, 1) - Most interactions
- **Smooth**: cubic-bezier(0.4, 0, 0.6, 1) - Larger movements
- **Spring**: cubic-bezier(0.68, -0.6, 0.32, 1.6) - Playful elements

### Loading States
- **Skeleton**: Animated gradient shimmer
- **Spinners**: Thin, elegant with primary color
- **Progress**: Smooth, rounded bars

## Responsive Design

### Breakpoints
```css
--screen-sm: 640px;   /* Mobile landscape */
--screen-md: 768px;   /* Tablet portrait */
--screen-lg: 1024px;  /* Tablet landscape */
--screen-xl: 1280px;  /* Desktop */
--screen-2xl: 1536px; /* Large desktop */
```

### Mobile Considerations
- Touch targets: Minimum 44x44px
- Spacing: Increase by 1.25x on mobile
- Typography: Minimum 16px for body
- Navigation: Bottom sheet pattern
- Gestures: Swipe support where logical

## Accessibility

### Color Contrast
- Normal text: 4.5:1 minimum
- Large text: 3:1 minimum
- Interactive elements: 3:1 minimum
- Focus indicators: 3:1 minimum

### Keyboard Navigation
- Visible focus rings (2px primary)
- Logical tab order
- Skip links for main content
- Escape key closes modals

### Screen Readers
- Semantic HTML structure
- ARIA labels for icons
- Live regions for updates
- Descriptive button text

### Motion Preferences
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Dark Mode

### Principles
- Preserve depth hierarchy
- Reduce pure black (use dark blue-grays)
- Adjust shadows (less prominent)
- Maintain color semantics
- Increase contrast slightly

### Surface Elevation
1. Background: Darkest
2. Surface: +5% lightness
3. Elevated: +10% lightness
4. Overlay: +15% lightness

## Implementation Notes

### CSS Architecture
1. Use CSS custom properties for all values
2. Implement utility classes via Tailwind
3. Component-specific styles in modules
4. Global styles minimal and intentional

### Performance
1. Prefer transform/opacity for animations
2. Use will-change sparingly
3. Implement virtual scrolling for lists
4. Lazy load heavy components
5. Optimize images with next/image

### Testing
1. Cross-browser compatibility
2. Device testing (real devices)
3. Accessibility audits (axe-core)
4. Performance metrics (Core Web Vitals)
5. Visual regression testing

## Component Library Updates

### Priority Components for Redesign
1. **Navigation** - Header, Sidebar, Breadcrumbs
2. **Forms** - Input, Select, Checkbox, Radio
3. **Feedback** - Toast, Modal, Loading states
4. **Content** - Cards, Lists, Tables
5. **Actions** - Buttons, Dropdowns, Menus

### Migration Strategy
1. Update design tokens first
2. Create new component variants
3. Deprecate old styles gradually
4. Update documentation
5. Provide migration guide

## Examples

### Premium Card Design
```tsx
<Card className="
  bg-white dark:bg-gray-900
  border border-gray-200/50 dark:border-gray-700/50
  shadow-sm hover:shadow-md
  transition-all duration-200
  backdrop-blur-sm
">
  <CardHeader className="space-y-1">
    <CardTitle className="text-xl font-semibold">
      Premium Feature
    </CardTitle>
    <CardDescription className="text-gray-600 dark:text-gray-400">
      Experience the best of our platform
    </CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

### Elegant Button
```tsx
<Button className="
  bg-gradient-to-r from-blue-600 to-blue-700
  hover:from-blue-700 hover:to-blue-800
  text-white font-medium
  px-6 py-2.5
  rounded-lg
  shadow-sm hover:shadow-md
  transform transition-all duration-200
  hover:scale-[1.02] active:scale-[0.98]
">
  Get Started
</Button>
```

This design system creates a premium, modern experience while maintaining usability and accessibility standards inspired by Apple's design excellence.