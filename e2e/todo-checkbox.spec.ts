import { test, expect } from '@playwright/test';
import { login, TEST_USER } from './helpers/auth';
import { waitForApp } from './helpers/setup';

test.describe('Todo Checkbox Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await waitForApp(page);
    await login(page, TEST_USER.email, TEST_USER.password);
    
    // Navigate to todos page
    await page.goto('/todos');
    await expect(page.locator('h1:has-text("TODO管理")')).toBeVisible();
  });

  test('should complete todo by clicking checkbox', async ({ page }) => {
    // Create a new todo
    await page.click('button:has-text("Add New Todo")');
    await expect(page.locator('h2:has-text("Create New Todo")')).toBeVisible();
    
    const title = `Checkbox Test ${Date.now()}`;
    await page.fill('input[name="title"]', title);
    await page.fill('textarea[name="description"]', 'Test checkbox functionality');
    await page.click('button:has-text("Create Todo")');
    
    // Wait for todo to appear
    await expect(page.locator('h3').filter({ hasText: title })).toBeVisible();
    
    // Find the checkbox for this todo
    const todoItem = page.locator('h3').filter({ hasText: title }).locator('../../../..');
    const checkbox = todoItem.locator('button[aria-label="Mark as complete"]').first();
    
    // Debug: Check if checkbox is visible and clickable
    await expect(checkbox).toBeVisible();
    await expect(checkbox).toBeEnabled();
    
    // Click the checkbox
    await checkbox.click();
    
    // Wait for the status to change
    await expect(todoItem.locator('text=DONE')).toBeVisible({ timeout: 10000 });
    
    // Verify the checkbox now shows as completed
    const completedCheckbox = todoItem.locator('button[aria-label="Mark as incomplete"]').first();
    await expect(completedCheckbox).toBeVisible();
    await expect(completedCheckbox).toHaveClass(/bg-primary/);
  });

  test('should uncomplete todo by clicking completed checkbox', async ({ page }) => {
    // Create a completed todo via edit form
    await page.click('button:has-text("Add New Todo")');
    const title = `Uncomplete Test ${Date.now()}`;
    await page.fill('input[name="title"]', title);
    await page.selectOption('select[name="status"]', 'DONE');
    await page.click('button:has-text("Create Todo")');
    
    // Wait for todo to appear
    await expect(page.locator('h3').filter({ hasText: title })).toBeVisible();
    
    // Find the checkbox for this completed todo
    const todoItem = page.locator('h3').filter({ hasText: title }).locator('../../../..');
    const checkbox = todoItem.locator('button[aria-label="Mark as incomplete"]').first();
    
    // Click to uncomplete
    await checkbox.click();
    
    // Wait for the status to change
    await expect(todoItem.locator('text=TODO')).toBeVisible({ timeout: 10000 });
    
    // Verify checkbox is now unchecked
    const uncheckedCheckbox = todoItem.locator('button[aria-label="Mark as complete"]').first();
    await expect(uncheckedCheckbox).toBeVisible();
    await expect(uncheckedCheckbox).not.toHaveClass(/bg-primary/);
  });

  test('should show loading state while updating', async ({ page }) => {
    // Create a todo
    await page.click('button:has-text("Add New Todo")');
    const title = `Loading Test ${Date.now()}`;
    await page.fill('input[name="title"]', title);
    await page.click('button:has-text("Create Todo")');
    
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
    const todoItem = page.locator('h3').filter({ hasText: title }).locator('../../../..');
    const checkbox = todoItem.locator('button[aria-label="Mark as complete"]').first();
    
    await checkbox.click();
    
    // Check that checkbox is disabled during loading
    await expect(checkbox).toBeDisabled();
    await expect(checkbox).toHaveClass(/animate-pulse/);
    
    // Wait for completion
    await expect(todoItem.locator('text=DONE')).toBeVisible({ timeout: 10000 });
    await expect(checkbox).toBeEnabled();
  });
});