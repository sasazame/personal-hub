# Development Guide

This guide covers development practices, architecture decisions, and guidelines for contributing to Personal Hub.

## 🏗️ Architecture Overview

Personal Hub follows a modern React architecture with Next.js App Router:

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Browser   │────▶│   Next.js   │────▶│   Backend   │
│             │     │  App Router │     │     API     │
└─────────────┘     └─────────────┘     └─────────────┘
       │                    │                    │
       │                    │                    │
       ▼                    ▼                    ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    React    │     │  TanStack   │     │  Database   │
│ Components  │     │    Query    │     │ PostgreSQL  │
└─────────────┘     └─────────────┘     └─────────────┘
```

## 🛠️ Technology Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **TypeScript 5** - Type safety
- **Tailwind CSS 4** - Utility-first CSS
- **TanStack Query** - Server state management
- **React Hook Form** - Form handling
- **Zod** - Schema validation

### Testing
- **Jest** - Unit testing
- **React Testing Library** - Component testing
- **Playwright** - E2E testing
- **MSW** - API mocking

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Turbopack** - Fast bundler
- **GitHub Actions** - CI/CD

## 📁 Code Organization

### Directory Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── (auth)/         # Authentication pages
│   ├── dashboard/      # Dashboard feature
│   ├── todos/          # TODO feature
│   ├── calendar/       # Calendar feature
│   └── notes/          # Notes feature
│
├── components/         # React components
│   ├── ui/            # Base UI components
│   ├── features/      # Feature-specific components
│   └── layout/        # Layout components
│
├── hooks/             # Custom React hooks
│   ├── api/          # API-related hooks
│   └── ui/           # UI-related hooks
│
├── services/          # API service layer
│   ├── auth.ts       # Authentication
│   └── [feature].ts  # Feature services
│
├── lib/              # Third-party integrations
├── types/            # TypeScript definitions
└── utils/            # Utility functions
```

### File Naming Conventions

- Components: `PascalCase.tsx` (e.g., `TodoItem.tsx`)
- Hooks: `camelCase.ts` with `use` prefix (e.g., `useTodos.ts`)
- Utils: `camelCase.ts` (e.g., `dateHelpers.ts`)
- Types: `camelCase.ts` (e.g., `todo.ts`)
- Tests: `[name].test.tsx` or `[name].spec.ts`

## 🎯 Development Workflow

### 1. Creating a New Feature

```bash
# Create feature branch
git checkout -b feat/new-feature

# Create feature structure
mkdir -p src/app/new-feature
mkdir -p src/components/new-feature
mkdir -p src/hooks
mkdir -p src/services
```

### 2. Component Development

Follow this pattern for new components:

```typescript
// src/components/todos/TodoItem.tsx
interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  return (
    <div className="p-4 border rounded-lg">
      {/* Component implementation */}
    </div>
  );
}
```

### 3. State Management

Use TanStack Query for server state:

```typescript
// src/hooks/useTodos.ts
export function useTodos(filters?: TodoFilters) {
  return useQuery({
    queryKey: ['todos', filters],
    queryFn: () => todoService.getList(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateTodo() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: todoService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
}
```

### 4. API Integration

Create service functions:

```typescript
// src/services/todos.ts
export const todoService = {
  async getList(filters?: TodoFilters): Promise<Todo[]> {
    const { data } = await apiClient.get('/todos', { params: filters });
    return data;
  },

  async create(todo: CreateTodoDto): Promise<Todo> {
    const { data } = await apiClient.post('/todos', todo);
    return data;
  },
};
```

## 🧪 Testing Strategy

### Unit Tests

Test individual components and functions:

```typescript
// src/components/todos/__tests__/TodoItem.test.tsx
describe('TodoItem', () => {
  it('should render todo information', () => {
    const todo = { id: '1', title: 'Test Todo', completed: false };
    render(<TodoItem todo={todo} onToggle={jest.fn()} onDelete={jest.fn()} />);
    
    expect(screen.getByText('Test Todo')).toBeInTheDocument();
  });

  it('should call onToggle when checkbox is clicked', async () => {
    const onToggle = jest.fn();
    const todo = { id: '1', title: 'Test Todo', completed: false };
    render(<TodoItem todo={todo} onToggle={onToggle} onDelete={jest.fn()} />);
    
    await userEvent.click(screen.getByRole('checkbox'));
    expect(onToggle).toHaveBeenCalledWith('1');
  });
});
```

### Integration Tests

Test feature workflows:

```typescript
// src/app/todos/__tests__/todos.integration.test.tsx
describe('TODOs Integration', () => {
  it('should create and display a new todo', async () => {
    render(<TodosPage />);
    
    // Create todo
    await userEvent.click(screen.getByRole('button', { name: /new task/i }));
    await userEvent.type(screen.getByLabelText(/title/i), 'New Todo');
    await userEvent.click(screen.getByRole('button', { name: /create/i }));
    
    // Verify display
    await waitFor(() => {
      expect(screen.getByText('New Todo')).toBeInTheDocument();
    });
  });
});
```

### E2E Tests

Test complete user flows:

```typescript
// e2e/todos.spec.ts
test('complete todo workflow', async ({ page }) => {
  await page.goto('/todos');
  
  // Create todo
  await page.getByRole('button', { name: /new task/i }).click();
  await page.getByLabel(/title/i).fill('E2E Test Todo');
  await page.getByRole('button', { name: /create/i }).click();
  
  // Verify creation
  await expect(page.getByText('E2E Test Todo')).toBeVisible();
  
  // Complete todo
  await page.getByRole('checkbox').click();
  await expect(page.getByText('E2E Test Todo')).toHaveClass(/line-through/);
});
```

## 🎨 Styling Guidelines

### Tailwind CSS Best Practices

1. **Mobile-first approach**
   ```html
   <div className="p-4 md:p-6 lg:p-8">
   ```

2. **Dark mode support**
   ```html
   <div className="bg-white dark:bg-gray-800">
   ```

3. **Component variants with cn()**
   ```typescript
   <button className={cn(
     "px-4 py-2 rounded",
     variant === 'primary' && "bg-blue-500 text-white",
     variant === 'secondary' && "bg-gray-200 text-gray-800",
     disabled && "opacity-50 cursor-not-allowed"
   )}>
   ```

### Design Tokens

Use consistent spacing, colors, and typography:

```typescript
// Spacing: 4, 8, 12, 16, 20, 24, 32, 40, 48, 56, 64
// Colors: Use Tailwind's color palette
// Typography: Use Tailwind's text utilities
```

## 🔐 Security Best Practices

1. **Never expose sensitive data**
   - Use environment variables
   - Validate all inputs
   - Sanitize user content

2. **Authentication**
   - Use secure token storage
   - Implement proper CORS
   - Validate tokens on each request

3. **Data validation**
   ```typescript
   const schema = z.object({
     email: z.string().email(),
     password: z.string().min(8),
   });
   ```

## 🚀 Performance Optimization

1. **Code splitting**
   - Use dynamic imports for large components
   - Lazy load routes

2. **Image optimization**
   - Use Next.js Image component
   - Provide appropriate sizes

3. **Data fetching**
   - Use React Server Components
   - Implement proper caching
   - Use optimistic updates

## 📝 Documentation

### Component Documentation

```typescript
/**
 * TodoItem displays a single todo with actions
 * 
 * @example
 * <TodoItem
 *   todo={todo}
 *   onToggle={handleToggle}
 *   onDelete={handleDelete}
 * />
 */
```

### API Documentation

Document all endpoints in the services:

```typescript
/**
 * Get list of todos with optional filters
 * 
 * @param filters - Optional filters for status, priority, etc.
 * @returns Promise<Todo[]>
 */
```

## 🐛 Debugging Tips

1. **Use React DevTools**
   - Inspect component props and state
   - Profile performance

2. **Network debugging**
   - Check API requests in Network tab
   - Use MSW for consistent testing

3. **Console debugging**
   - Remove all console.logs before committing
   - Use breakpoints instead

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TanStack Query Documentation](https://tanstack.com/query)