import { test, expect } from '@playwright/test';
import { login, TEST_USER } from './helpers/auth';
import { waitForApp } from './helpers/setup';

test.describe('Todo Basic Operations', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test (user should already exist)
    await page.goto('/login');
    await waitForApp(page);
    await login(page, TEST_USER.email, TEST_USER.password);
    
    // Wait for app to be ready
    await expect(page.locator('h1:has-text("TODO App")')).toBeVisible();
    
    // Clear any existing todos (best effort)
    try {
      const deleteButtons = await page.locator('button:has-text("Delete")').all();
      for (const button of deleteButtons.slice(0, 5)) { // Limit to prevent infinite loops
        await button.click();
        const confirmButton = page.locator('.fixed button:has-text("Delete")').last();
        if (await confirmButton.isVisible({ timeout: 1000 })) {
          await confirmButton.click();
          await page.waitForTimeout(500);
        }
      }
    } catch {
      // Ignore errors during cleanup
    }
  });

  test('should display empty state initially', async ({ page }) => {
    // Check for empty state message
    const emptyMessage = page.locator('text=No todos yet');
    const hasTodos = await page.locator('[data-testid="todo-item"]').count() > 0;
    
    if (!hasTodos) {
      await expect(emptyMessage).toBeVisible();
    }
  });

  test('should create a new todo', async ({ page }) => {
    // Click add todo button
    await page.click('button:has-text("Add New Todo")');
    
    // Wait for form modal
    await expect(page.locator('h2:has-text("Create New Todo")')).toBeVisible();
    
    // Fill form
    const title = `Test Todo ${Date.now()}`;
    await page.fill('input[name="title"]', title);
    await page.fill('textarea[name="description"]', 'Test description');
    await page.selectOption('select[name="priority"]', 'MEDIUM');
    
    // Submit
    await page.click('button:has-text("Create Todo")');
    
    // Wait for todo to appear in the list
    await expect(page.locator('h3').filter({ hasText: title })).toBeVisible({ timeout: 10000 });
  });

  test('should delete a todo', async ({ page }) => {
    // First create a todo
    await page.click('button:has-text("Add New Todo")');
    await expect(page.locator('h2:has-text("Create New Todo")')).toBeVisible();
    
    const title = `Delete Test ${Date.now()}`;
    await page.fill('input[name="title"]', title);
    await page.click('button:has-text("Create Todo")');
    
    // Wait for todo to appear
    await expect(page.locator('h3').filter({ hasText: title })).toBeVisible();
    
    // Find and click delete button for this todo
    const todoItem = page.locator('h3').filter({ hasText: title }).locator('..').locator('..');
    await todoItem.locator('button:has-text("Delete")').click();
    
    // Confirm deletion
    await expect(page.locator('text=Delete Todo')).toBeVisible();
    await page.locator('.fixed button:has-text("Delete")').last().click();
    
    // Wait for todo to disappear
    await expect(page.locator('h3').filter({ hasText: title })).not.toBeVisible({ timeout: 10000 });
  });

  test('should update todo status', async ({ page }) => {
    // First create a todo
    await page.click('button:has-text("Add New Todo")');
    await expect(page.locator('h2:has-text("Create New Todo")')).toBeVisible();
    
    const title = `Status Test ${Date.now()}`;
    await page.fill('input[name="title"]', title);
    await page.click('button:has-text("Create Todo")');
    
    // Wait for todo to appear
    await expect(page.locator('h3').filter({ hasText: title })).toBeVisible();
    
    // Click edit button
    const todoItem = page.locator('h3').filter({ hasText: title }).locator('..').locator('..');
    await todoItem.locator('button:has-text("Edit")').click();
    
    // Wait for edit form
    await expect(page.locator('h2:has-text("Edit Todo")')).toBeVisible();
    
    // Change status
    await page.selectOption('select[name="status"]', 'DONE');
    
    // Save
    await page.click('button:has-text("Update Todo")');
    
    // Verify status changed (look for visual indicator)
    await expect(todoItem.locator('text=DONE')).toBeVisible({ timeout: 10000 });
  });
});