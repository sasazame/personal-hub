# E2E Test Guide

This guide provides comprehensive documentation for writing and maintaining end-to-end (E2E) tests in the Personal Hub application.

## Table of Contents
- [Overview](#overview)
- [Test Infrastructure](#test-infrastructure)
- [Writing E2E Tests](#writing-e2e-tests)
- [Best Practices](#best-practices)
- [Running Tests](#running-tests)
- [CI/CD Integration](#cicd-integration)
- [Troubleshooting](#troubleshooting)

## Overview

Our E2E tests use [Playwright](https://playwright.dev/) to ensure the application works correctly from a user's perspective. These tests cover critical user journeys and feature interactions.

### Current Test Coverage

- **Authentication**: Login, logout, registration, password reset
- **Todo Management**: CRUD operations, subtasks, drag-and-drop
- **Calendar**: Event management, navigation, drag-and-drop
- **Goals**: Goal tracking and management
- **General**: Smoke tests, navigation, responsive design

## Test Infrastructure

### Directory Structure
```
e2e/
├── helpers/
│   ├── auth.ts          # Authentication helpers
│   ├── setup.ts         # Test setup utilities
│   └── msw-setup.ts     # Mock Service Worker config
├── auth-e2e.spec.ts     # Authentication tests
├── todo.spec.ts         # Todo feature tests
├── calendar.spec.ts     # Calendar feature tests
├── password-reset.spec.ts # Password reset flow
└── smoke.spec.ts        # Quick smoke tests
```

### Configuration Files
- `playwright.config.ts` - Local development configuration
- `playwright.config.ci.ts` - CI-specific configuration

## Writing E2E Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';
import { login, ensureLoggedOut } from './helpers/auth';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Set locale
    await page.context().addCookies([
      { name: 'locale', value: 'en', domain: 'localhost', path: '/' }
    ]);
    
    // Ensure clean state
    await ensureLoggedOut(page);
    
    // Login if needed
    await page.goto('/login');
    await login(page, TEST_USER.email, TEST_USER.password);
  });

  test('should perform action', async ({ page }) => {
    // Test implementation
  });
});
```

### Common Patterns

#### 1. Waiting for Elements
```typescript
// Wait for element to be visible
await expect(page.getByRole('button', { name: 'Submit' })).toBeVisible();

// Wait for URL change
await page.waitForURL(/\/dashboard/, { timeout: 5000 });

// Wait for network idle
await page.waitForLoadState('networkidle');
```

#### 2. Form Interactions
```typescript
// Fill input fields
await page.fill('input[name="email"]', 'test@example.com');

// Select dropdown option
await page.selectOption('select[name="priority"]', 'HIGH');

// Check/uncheck checkbox
await page.locator('input[type="checkbox"]').check();

// Click button
await page.getByRole('button', { name: 'Submit' }).click();
```

#### 3. Handling Modals
```typescript
// Wait for modal to appear
await expect(page.getByRole('dialog')).toBeVisible();

// Close modal with Escape
await page.keyboard.press('Escape');

// Click backdrop to close
await page.locator('.modal-backdrop').click();
```

#### 4. Drag and Drop
```typescript
const source = page.locator('.draggable-item');
const target = page.locator('.drop-zone');

await source.hover();
await page.mouse.down();
await target.hover();
await page.mouse.up();
```

#### 5. API Mocking
```typescript
// Mock successful API response
await page.route('**/api/v1/todos', async route => {
  await route.fulfill({
    status: 200,
    json: { data: [] }
  });
});

// Mock API error
await page.route('**/api/v1/auth/login', async route => {
  await route.fulfill({
    status: 401,
    json: { error: 'Invalid credentials' }
  });
});
```

### Selectors Best Practices

1. **Prefer semantic selectors**:
   ```typescript
   // Good
   await page.getByRole('button', { name: 'Submit' });
   await page.getByLabel('Email');
   
   // Avoid
   await page.locator('.btn-primary');
   await page.locator('#submit-btn');
   ```

2. **Use data-testid for complex cases**:
   ```typescript
   await page.locator('[data-testid="todo-item-123"]');
   ```

3. **Chain selectors for specificity**:
   ```typescript
   const todoItem = page.locator('.todo-item').filter({ hasText: 'My Task' });
   await todoItem.getByRole('button', { name: 'Delete' }).click();
   ```

## Best Practices

### 1. Test Isolation
- Each test should be independent
- Use `beforeEach` to set up clean state
- Don't rely on test execution order

### 2. Reliable Assertions
```typescript
// Wait for animations to complete
await page.waitForTimeout(300);

// Use specific timeouts when needed
await expect(element).toBeVisible({ timeout: 10000 });

// Check multiple conditions
await expect(page.locator('.success-message')).toBeVisible();
await expect(page).toHaveURL('/dashboard');
```

### 3. Helper Functions
Create reusable helpers for common actions:

```typescript
// Helper to create a todo
async function createTodo(page, title: string, description?: string) {
  await page.getByRole('button', { name: 'Add TODO' }).click();
  await page.fill('input[name="title"]', title);
  if (description) {
    await page.fill('textarea[name="description"]', description);
  }
  await page.getByRole('button', { name: 'Create' }).click();
  await expect(page.locator('.todo-item').filter({ hasText: title })).toBeVisible();
}
```

### 4. Error Handling
```typescript
try {
  await page.getByRole('button', { name: 'Submit' }).click();
} catch (error) {
  // Take screenshot for debugging
  await page.screenshot({ path: 'error-screenshot.png' });
  throw error;
}
```

### 5. Performance Considerations
- Use `page.waitForLoadState('domcontentloaded')` instead of `networkidle` when possible
- Minimize unnecessary waits
- Run tests in parallel when they don't conflict

## Running Tests

### Local Development

```bash
# Run all E2E tests
npm run test:e2e

# Run specific test file
npm run test:e2e calendar.spec.ts

# Run tests in UI mode
npm run test:e2e:ui

# Run tests in headed mode (see browser)
npm run test:e2e:headed

# Run only smoke tests
npm run test:e2e:smoke

# Run with specific pattern
npm run test:e2e -- --grep "should create"
```

### Debug Mode

```bash
# Debug specific test
npx playwright test calendar.spec.ts --debug

# Generate trace for debugging
npx playwright test --trace on
```

## CI/CD Integration

### GitHub Actions Configuration

E2E tests run automatically in CI on:
- Push to main/develop branches
- Pull requests

The CI workflow:
1. Builds the application
2. Installs Playwright browsers
3. Runs smoke tests
4. Uploads test reports as artifacts

### Environment Variables

CI tests use specific environment variables:
- `CI=true` - Enables CI mode
- `NEXT_PUBLIC_CI=true` - Enables MSW mocking
- `NEXT_PUBLIC_API_URL` - API endpoint for tests

## Troubleshooting

### Common Issues

1. **Tests timeout in CI but pass locally**
   - Increase timeouts in `playwright.config.ci.ts`
   - Check for environment-specific issues
   - Ensure proper wait conditions

2. **Flaky tests**
   - Add explicit waits for dynamic content
   - Use `waitForLoadState` appropriately
   - Check for race conditions

3. **Element not found**
   - Verify selectors are correct
   - Check if element is in viewport
   - Ensure proper page navigation

4. **API mocking issues**
   - Verify route patterns match exactly
   - Check request method (GET/POST/etc)
   - Ensure mock is set up before action

### Debugging Tips

1. **Use Playwright Inspector**:
   ```bash
   PWDEBUG=1 npm run test:e2e calendar.spec.ts
   ```

2. **Take screenshots**:
   ```typescript
   await page.screenshot({ path: 'debug.png', fullPage: true });
   ```

3. **View test traces**:
   ```bash
   npx playwright show-trace trace.zip
   ```

4. **Check console logs**:
   ```typescript
   page.on('console', msg => console.log(msg.text()));
   ```

### Best Practices Summary

1. ✅ Write independent, isolated tests
2. ✅ Use semantic selectors when possible
3. ✅ Handle loading states and animations
4. ✅ Create reusable helper functions
5. ✅ Mock external dependencies in CI
6. ✅ Add meaningful test descriptions
7. ✅ Keep tests focused and concise
8. ❌ Avoid hard-coded timeouts
9. ❌ Don't test implementation details
10. ❌ Never use arbitrary delays

## Contributing

When adding new E2E tests:

1. Follow the existing patterns and structure
2. Ensure tests pass locally before committing
3. Update this documentation if adding new patterns
4. Consider adding to smoke tests for critical paths
5. Review test execution time and optimize if needed

For questions or improvements, please open an issue or submit a PR.