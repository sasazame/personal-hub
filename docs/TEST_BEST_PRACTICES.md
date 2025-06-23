# Testing Best Practices

## Overview
This document summarizes testing best practices for the Personal Hub project. It serves as a guideline for maintaining clean and maintainable test code.

## 1. Clean Test Output

### Why It's Important
- **CI/CD Readability**: Low-noise logs enable quick identification of actual problems
- **Debugging Efficiency**: Focus on real issues without getting buried in irrelevant output
- **Professionalism**: Clean test output demonstrates attention to quality
- **Team Development**: Other developers can easily understand test results

### Implementation Guidelines

#### 1.1 console.log in Production Code
```javascript
// ❌ Bad example
const handleClick = () => {
  console.log('Button clicked', data); // Don't leave debug logs
  // processing
};

// ✅ Good example
const handleClick = () => {
  // processing only
};
```

#### 1.2 Mock Return Values in Tests
```javascript
// ❌ Bad example
mockResolvedValue(undefined); // TanStack Query will emit warnings

// ✅ Good example
mockResolvedValue({}); // Return empty object
mockResolvedValue(null); // Or explicitly return null
mockResolvedValue({ success: true }); // Or return appropriate value
```

#### 1.3 Suppress Expected Warnings
In `jest.setup.js`, suppress warnings expected during tests:

```javascript
// jest.setup.js
const originalConsoleError = console.error;

console.error = (...args) => {
  // Suppress React act() warnings
  if (
    typeof args[0] === 'string' && 
    args[0].includes('was not wrapped in act(...)')
  ) {
    return;
  }
  originalConsoleError.apply(console, args);
};
```

## 2. How to Write Tests

### 2.1 AAA Pattern
```javascript
it('should update todo status', async () => {
  // Arrange (Setup)
  const todo = { id: 1, status: 'TODO' };
  mockApi.updateTodo.mockResolvedValue({ ...todo, status: 'DONE' });
  
  // Act (Execute)
  const result = await updateTodoStatus(todo.id, 'DONE');
  
  // Assert (Verify)
  expect(result.status).toBe('DONE');
});
```

### 2.2 User-Centric Testing
```javascript
// ❌ Test implementation details
expect(component.state.isLoading).toBe(true);

// ✅ Test what users see
expect(screen.getByText('Loading...')).toBeInTheDocument();
```

### 2.3 Selector Priority
1. **Role and Accessibility**: `getByRole`, `getByLabelText`
2. **Text Content**: `getByText`, `getByPlaceholderText`
3. **Test ID**: `getByTestId` (last resort)

```javascript
// ✅ Recommended
screen.getByRole('button', { name: 'Save' });
screen.getByLabelText('Title *');

// ⚠️ Avoid
screen.getByTestId('save-button');
```

## 3. Testing Async Operations

### 3.1 Using waitFor
```javascript
// ✅ Good example
await waitFor(() => {
  expect(screen.getByText('Saved')).toBeInTheDocument();
});

// ❌ Bad example
setTimeout(() => {
  expect(screen.getByText('Saved')).toBeInTheDocument();
}, 1000);
```

### 3.2 Handling act() Warnings
```javascript
// ✅ Good example
await act(async () => {
  await userEvent.click(button);
});

// Wait for async updates in component
await waitFor(() => {
  expect(mockFn).toHaveBeenCalled();
});
```

## 4. Mock Management

### 4.1 Mock Placement
```javascript
// Global mocks: jest.setup.js
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() })
}));

// File-specific mocks: top of each test file
jest.mock('@/lib/api', () => ({
  todoApi: { getAll: jest.fn() }
}));
```

### 4.2 Mock Reset
```javascript
beforeEach(() => {
  jest.clearAllMocks(); // Clear call history
});

afterEach(() => {
  jest.restoreAllMocks(); // Restore spies
});
```

## 5. i18n (Internationalization) Testing

### 5.1 Inline Mock
```javascript
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string, params?: Record<string, string>) => {
    const translations: Record<string, string> = {
      'button.save': 'Save',
      'message.welcome': 'Welcome, {name}'
    };
    
    let result = translations[key] || key;
    
    // Parameter substitution
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        result = result.replace(`{${param}}`, value);
      });
    }
    
    return result;
  }
}));
```

## 6. Performance Considerations

### 6.1 Avoid Unnecessary Re-renders
```javascript
// Custom renderer with only necessary providers
const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  );
};
```

### 6.2 Share Heavy Setup
```javascript
// Execute only once
beforeAll(async () => {
  // Heavy initialization
});

// Reuse in each test
describe('TodoList', () => {
  // Test cases
});
```

## 7. CI/CD Considerations

### 7.1 Parallel Execution
```json
// package.json
{
  "scripts": {
    "test:ci": "jest --maxWorkers=50%"
  }
}
```

### 7.2 Coverage Reports
```javascript
// jest.config.js
module.exports = {
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.spec.{ts,tsx}',
    '!src/**/*.test.{ts,tsx}'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

## 8. Troubleshooting

### 8.1 Common Issues and Solutions

#### "Query data cannot be undefined" Warning
```javascript
// Problem
mockResolvedValue(undefined);

// Solution
mockResolvedValue({});
mockResolvedValue([]);
```

#### React act() Warning
```javascript
// Problem
fireEvent.click(button);
expect(something).toBe(true);

// Solution
await act(async () => {
  fireEvent.click(button);
});
await waitFor(() => {
  expect(something).toBe(true);
});
```

#### Selector Matches Multiple Elements
```javascript
// Problem
screen.getByText(/title/i); // Multiple matches

// Solution
screen.getByLabelText('Title *'); // More specific
screen.getByRole('heading', { name: 'Title' });
```

## Summary
By following these best practices:
- Test output becomes clean
- Problem identification in CI/CD becomes easier
- Test maintainability improves
- Overall team productivity increases

Always focus on testing "what users experience" and concentrate on behavior rather than implementation details.