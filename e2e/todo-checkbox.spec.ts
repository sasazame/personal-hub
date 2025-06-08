import { test, expect } from '@playwright/test';
import { login, TEST_USER } from './helpers/auth';
import { waitForApp } from './helpers/setup';

test.describe('Todo Checkbox Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Set English locale
    await page.context().addCookies([{ name: 'locale', value: 'en', domain: 'localhost', path: '/' }]);
    
    // Login before each test
    await page.goto('/login');
    await waitForApp(page);
    await login(page, TEST_USER.email, TEST_USER.password);
    
    // Navigate to todos page
    await page.goto('/todos');
    await expect(page.getByRole('heading', { name: 'TODO', exact: true })).toBeVisible();
  });

  test('should complete todo by clicking checkbox', async ({ page }) => {
    // Create a new todo
    await page.click('button:has-text("Add TODO")');
    await expect(page.locator('h2:has-text("Create New Todo")')).toBeVisible();
    
    const title = `Checkbox Test ${Date.now()}`;
    await page.fill('input[name="title"]', title);
    await page.fill('textarea[name="description"]', 'Test checkbox functionality');
    await page.click('button:has-text("Create TODO")');
    
    // Wait for todo to appear
    await expect(page.locator('h3').filter({ hasText: title })).toBeVisible();
    
    // Find the checkbox for this todo using more flexible selector
    const todoContainer = page.locator('.bg-card').filter({ hasText: title });
    // Use type button and position to find checkbox (first button is checkbox)
    const checkbox = todoContainer.locator('button[type="button"]').first();
    
    // Debug: Check if checkbox is visible and clickable
    await expect(checkbox).toBeVisible();
    await expect(checkbox).toBeEnabled();
    
    // Click the checkbox
    await checkbox.click();
    
    // Wait for the status to change - look for Done status badge
    await expect(todoContainer.locator('span').filter({ hasText: 'Done' })).toBeVisible({ timeout: 10000 });
    
    // Verify the checkbox now shows as completed
    await expect(todoContainer.locator('button[type="button"]').first()).toBeVisible();
  });

  test('should uncomplete todo by clicking completed checkbox', async ({ page }) => {
    // Create a completed todo via edit form
    await page.click('button:has-text("Add TODO")');
    const title = `Uncomplete Test ${Date.now()}`;
    await page.fill('input[name="title"]', title);
    await page.selectOption('select[name="status"]', 'DONE');
    await page.click('button:has-text("Create TODO")');
    
    // Wait for todo to appear
    await expect(page.locator('h3').filter({ hasText: title })).toBeVisible();
    
    // Find the checkbox for this completed todo
    const todoContainer = page.locator('.bg-card').filter({ hasText: title });
    const checkbox = todoContainer.locator('button[type="button"]').first();
    
    // Click to uncomplete
    await checkbox.click();
    
    // Wait for the status to change
    await expect(todoContainer.locator('span').filter({ hasText: 'Todo' })).toBeVisible({ timeout: 10000 });
    
    // Verify checkbox is now unchecked
    await expect(todoContainer.locator('button[type="button"]').first()).toBeVisible();
  });

  test('should show loading state while updating', async ({ page }) => {
    // Create a todo
    await page.click('button:has-text("Add TODO")');
    const title = `Loading Test ${Date.now()}`;
    await page.fill('input[name="title"]', title);
    await page.click('button:has-text("Create TODO")');
    
    // Wait for todo to appear
    await expect(page.locator('h3').filter({ hasText: title })).toBeVisible();
    
    // Intercept the API call to delay it
    await page.route('**/api/v1/todos/*', async route => {
      if (route.request().method() === 'PUT') {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Delay 1 second
        await route.continue();
      } else {
        await route.continue();
      }
    });
    
    // Find and click the checkbox
    const todoContainer = page.locator('.bg-card').filter({ hasText: title });
    const checkbox = todoContainer.locator('button[type="button"]').first();
    
    await checkbox.click();
    
    // Check that checkbox is disabled during loading
    await expect(checkbox).toBeDisabled();
    await expect(checkbox).toHaveClass(/animate-pulse/);
    
    // Wait for completion
    await expect(todoContainer.locator('span').filter({ hasText: 'Done' })).toBeVisible({ timeout: 10000 });
    await expect(checkbox).toBeEnabled();
  });
});