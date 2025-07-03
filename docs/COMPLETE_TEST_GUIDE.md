# Complete Test Guide for Personal Hub

## Overview
This guide covers all testing aspects of Personal Hub, including unit tests, integration tests, e2e tests, and quality checks.

## Test Types and Commands

### 1. Code Quality Checks

#### Type Checking
```bash
npm run type-check
```
- Validates TypeScript types across the entire codebase
- Ensures type safety and catches compile-time errors
- Required to pass before any deployment

#### Linting
```bash
npm run lint
```
- Runs ESLint to check code style and quality
- Enforces consistent coding standards
- Catches potential bugs and anti-patterns

#### Linting with Auto-fix
```bash
npm run lint:fix
```
- Automatically fixes linting issues where possible
- Use before committing code changes

### 2. Unit and Integration Tests

#### Run All Unit Tests
```bash
npm test
# or
npm run test
```
- Executes Jest test suite
- Covers components, hooks, utilities, and services
- Generates coverage reports

#### Run Tests in Watch Mode
```bash
npm run test:watch
```
- Continuously runs tests as files change
- Useful during development

#### Run Tests with Coverage
```bash
npm run test:coverage
```
- Generates detailed coverage reports
- Shows which code paths are tested
- Reports available in `coverage/` directory

### 3. E2E Tests - Basic Commands

#### Run All E2E Tests
```bash
npm run test:e2e
```
- Runs complete e2e test suite
- Uses Playwright with Chromium browser
- Takes 4-5 minutes to complete

#### Run E2E Tests with UI
```bash
npm run test:e2e:ui
```
- Opens Playwright UI for interactive testing
- Allows debugging and step-by-step execution
- Great for test development

#### Run E2E Tests in Headed Mode
```bash
npm run test:e2e:headed
```
- Runs tests with visible browser windows
- Useful for debugging test failures

### 4. E2E Tests - Specific Test Suites

#### Smoke Tests (Quick Health Check)
```bash
npm run test:e2e:smoke
```
- Runs basic functionality tests only
- Takes ~1 minute to complete
- Good for quick validation

#### Authentication Tests
```bash
npm run test:e2e:auth
```
- Tests login, logout, registration flows
- Password reset functionality
- Session management

#### Feature-Specific Tests
```bash
# Calendar feature tests
npm run test:e2e:calendar

# Notes feature tests  
npm run test:e2e:notes

# User profile tests
npm run test:e2e:profile

# App-wide integration tests
npm run test:e2e:app
```

### 5. E2E Tests - Browser-Specific

#### Single Browser Testing
```bash
# Test only in Chromium
npm run test:e2e:chromium

# Test only in Firefox
npm run test:e2e:firefox

# Test only in WebKit (Safari)
npm run test:e2e:webkit
```

#### Mobile Testing
```bash
npm run test:e2e:mobile
```
- Tests on Mobile Chrome and Mobile Safari viewports
- Validates responsive design
- Tests touch interactions

#### Cross-Browser Testing
```bash
npm run test:e2e:cross-browser
```
- Runs browser compatibility tests
- Tests Chrome, Firefox, and Safari
- Validates JavaScript API compatibility

### 6. E2E Tests - Specialized

#### Visual Regression Testing
```bash
npm run test:e2e:visual
```
- Takes screenshots and compares with baselines
- Catches unintended UI changes
- Tests both light and dark modes

#### CI Environment Testing
```bash
npm run test:e2e:ci
```
- Runs tests with CI configuration
- Uses sequential execution
- Enables MSW mocking

#### Mock Environment Testing
```bash
npm run test:e2e:mock
```
- Runs tests with mocked backend
- Uses Mock Service Worker (MSW)
- Good for isolated frontend testing

### 7. Complete Test Pipeline

#### Pre-commit Checks
```bash
npm run type-check && npm run lint && npm test
```
- Validates code quality before commits
- Ensures all unit tests pass
- Required before pushing code

#### Pre-deployment Checks
```bash
npm run type-check && npm run lint && npm test && npm run test:e2e:smoke
```
- Complete validation pipeline
- Includes basic e2e validation
- Recommended before releases

#### Full Test Suite
```bash
npm run type-check && npm run lint && npm test && npm run test:e2e
```
- Complete test coverage
- Takes 10-15 minutes to complete
- Run before major releases

## Test Development Guidelines

### Writing Unit Tests

#### Component Testing Example
```typescript
import { render, screen } from '@testing-library/react';
import { TodoItem } from '@/components/todo/TodoItem';

describe('TodoItem', () => {
  test('should render todo title', () => {
    const todo = { id: '1', title: 'Test Todo', status: 'PENDING' };
    render(<TodoItem todo={todo} />);
    expect(screen.getByText('Test Todo')).toBeInTheDocument();
  });
});
```

#### Hook Testing Example
```typescript
import { renderHook } from '@testing-library/react';
import { useTodos } from '@/hooks/useTodos';

describe('useTodos', () => {
  test('should fetch todos', async () => {
    const { result } = renderHook(() => useTodos());
    expect(result.current.isLoading).toBe(true);
  });
});
```

### Writing E2E Tests

#### Basic E2E Test Structure
```typescript
import { test, expect } from '@playwright/test';
import { login, TEST_USER } from './helpers/auth';

test.describe('Feature Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().addCookies([
      { name: 'locale', value: 'en', domain: 'localhost', path: '/' }
    ]);
    await page.goto('/login');
    await login(page, TEST_USER.email, TEST_USER.password);
  });

  test('should perform action', async ({ page }) => {
    await page.goto('/feature');
    await expect(page.getByRole('heading')).toBeVisible();
  });
});
```

#### Using Test Data Helpers
```typescript
import { generateTestTodo, cleanupAllTestData } from './helpers/test-data';

test('should create todo', async ({ page }) => {
  const testTodo = generateTestTodo('demo');
  // Use testTodo.title, testTodo.description, etc.
  
  // Test data is automatically cleaned up
});
```

## CI/CD Integration

### GitHub Actions
E2E tests run automatically on:
- Pull requests to main/develop branches
- Direct pushes to main/develop branches

### CI Test Configuration
```yaml
# .github/workflows/ci.yml includes:
- Unit tests with coverage
- Type checking and linting
- E2E smoke tests
- Build verification
```

## Troubleshooting

### Common Issues

#### Tests Failing Locally
1. **Build the application first**:
   ```bash
   npm run build
   ```

2. **Check if application is running**:
   ```bash
   npm run start
   ```

3. **Clear test data**:
   ```bash
   # E2E tests clean up automatically, but you can manually reset
   rm -rf test-results/
   ```

#### E2E Tests Timing Out
1. **Increase timeout in playwright.config.ts**:
   ```typescript
   timeout: 120000, // 2 minutes
   ```

2. **Check application performance**:
   ```bash
   npm run test:e2e:headed  # Watch tests run
   ```

#### Browser Installation Issues
```bash
npx playwright install --with-deps
```

#### Visual Test Failures
```bash
# Update visual baselines if changes are intentional
npx playwright test --update-snapshots visual-regression.spec.ts
```

### Getting Help

#### View Test Reports
```bash
# View last HTML report
npx playwright show-report

# View Jest coverage report
open coverage/lcov-report/index.html
```

#### Debug E2E Tests
```bash
# Debug specific test
npx playwright test calendar.spec.ts --debug

# Generate trace for debugging
npx playwright test --trace on
npx playwright show-trace trace.zip
```

#### Check Test Status
```bash
# See which tests are available
npm run test:e2e -- --list

# Run specific test pattern
npm run test:e2e -- --grep "should create"
```

## Performance Guidelines

### Test Execution Times
- **Unit Tests**: < 30 seconds
- **Type Check**: < 10 seconds  
- **Lint**: < 5 seconds
- **E2E Smoke**: ~1 minute
- **Full E2E Suite**: 4-5 minutes
- **Cross-browser**: 8-10 minutes
- **Visual Tests**: 2-3 minutes

### Optimization Tips
1. **Run smoke tests frequently** for quick feedback
2. **Use headed mode only for debugging** to save time
3. **Run visual tests weekly** unless UI changes are made
4. **Use specific test commands** instead of full suite during development
5. **Parallelize tests locally** but use sequential in CI for stability

## Quality Standards

### Required Passing Tests
Before merging code, ensure:
- ✅ All unit tests pass (`npm test`)
- ✅ Type checking passes (`npm run type-check`)
- ✅ Linting passes (`npm run lint`)
- ✅ Smoke tests pass (`npm run test:e2e:smoke`)

### Recommended Testing
Before releases, run:
- ✅ Full e2e suite (`npm run test:e2e`)
- ✅ Cross-browser tests (`npm run test:e2e:cross-browser`)
- ✅ Visual regression tests (`npm run test:e2e:visual`)

### Test Coverage Goals
- **Unit Test Coverage**: > 80%
- **E2E Critical Path Coverage**: 100%
- **Cross-browser Compatibility**: Chrome, Firefox, Safari
- **Mobile Compatibility**: iOS Safari, Android Chrome

## Continuous Improvement

### Adding New Tests
1. **For new features**: Add both unit and e2e tests
2. **For bug fixes**: Add regression tests
3. **For UI changes**: Update visual baselines
4. **For new browsers**: Add to cross-browser suite

### Maintenance Tasks
- **Weekly**: Review failing tests and flaky test reports
- **Monthly**: Update test dependencies and browser versions
- **Quarterly**: Review test coverage and add missing scenarios
- **Per release**: Validate all tests pass and update documentation

This comprehensive test guide ensures Personal Hub maintains high quality through automated testing at every level.