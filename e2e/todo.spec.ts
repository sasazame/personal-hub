import { test, expect } from '@playwright/test';
import { login, TEST_USER, ensureLoggedOut } from './helpers/auth';

test.describe('Todo App E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Ensure clean state
    await ensureLoggedOut(page);
    
    // Login first
    await page.goto('/login');
    await login(page, TEST_USER.email, TEST_USER.password);
    
    // Should be redirected to main app
    await page.waitForLoadState('networkidle');
    // Wait for React to hydrate and API calls to complete
    await page.waitForTimeout(2000);
    
    // Wait for loading to finish
    await page.waitForSelector('text=Loading', { state: 'detached', timeout: 10000 });
    
    // Close any open modals first
    try {
      // Try to close create form if open
      const cancelButton = page.locator('button:has-text("Cancel")');
      if (await cancelButton.first().isVisible({ timeout: 500 })) {
        await cancelButton.first().click();
        await page.waitForTimeout(500);
      }
    } catch {
      // Ignore if no modal is open
    }

    // Clean up any existing todos to start fresh
    const deleteButtons = await page.locator('button:has-text("Delete")').all();
    for (const button of deleteButtons) {
      try {
        await button.click({ timeout: 1000 });
        // Click Delete in modal if it appears
        const modalDeleteButton = page.locator('button.bg-red-600:has-text("Delete")');
        if (await modalDeleteButton.isVisible({ timeout: 1000 })) {
          await modalDeleteButton.click();
          await page.waitForTimeout(500);
        }
      } catch {
        // Ignore errors during cleanup
      }
    }

    // Ensure no modal is open after cleanup
    try {
      const modalOverlay = page.locator('div.fixed.inset-0.bg-gray-600');
      if (await modalOverlay.isVisible({ timeout: 500 })) {
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
      }
    } catch {
      // Ignore if no modal overlay
    }
  });

  test('should display the todo app heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'TODO App' })).toBeVisible();
  });

  test('should show "Add New Todo" button', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Add New Todo' })).toBeVisible();
  });

  test('should open todo form when clicking "Add New Todo"', async ({ page }) => {
    // Ensure no modal is open first
    await expect(page.locator('div.fixed.inset-0.bg-gray-600')).not.toBeVisible();
    
    await page.getByRole('button', { name: 'Add New Todo' }).click();
    await expect(page.getByRole('heading', { name: 'Create New Todo' })).toBeVisible();
    await expect(page.locator('input[id="title"]')).toBeVisible();
    await expect(page.locator('textarea[id="description"]')).toBeVisible();
    await expect(page.locator('select[id="priority"]')).toBeVisible();
  });

  test('should create a new todo', async ({ page }) => {
    
    const todoTitle = 'Test Todo ' + Date.now();
    const todoDescription = 'Test description ' + Date.now();

    // Ensure no modal is open first
    await expect(page.locator('div.fixed.inset-0.bg-gray-600')).not.toBeVisible();

    // Click "Add New Todo" button
    await page.getByRole('button', { name: 'Add New Todo' }).click();

    // Wait for the form to appear
    await expect(page.getByRole('heading', { name: 'Create New Todo' })).toBeVisible();

    // Fill in the form
    await page.fill('input[id="title"]', todoTitle);
    await page.fill('textarea[id="description"]', todoDescription);
    await page.selectOption('select[id="priority"]', 'MEDIUM');

    // Submit the form
    await page.click('button:has-text("Create Todo")');

    // Wait for the modal to close
    await expect(page.getByRole('heading', { name: 'Create New Todo' })).not.toBeVisible();

    // Wait for the todo to appear
    await page.waitForSelector(`text=${todoTitle}`, { timeout: 10000 });

    // Verify the todo is displayed (look specifically in the todo list, not in toasts)
    await expect(page.locator('.space-y-4').getByText(todoTitle)).toBeVisible();
    await expect(page.locator('.space-y-4').getByText(todoDescription)).toBeVisible();
  });

  test('should delete a todo', async ({ page }) => {
    // Create a todo first
    const todoTitle = 'Delete Todo ' + Date.now();
    
    // Ensure no modal is open first
    await expect(page.locator('div.fixed.inset-0.bg-gray-600')).not.toBeVisible();
    
    await page.getByRole('button', { name: 'Add New Todo' }).click();
    await page.fill('input[id="title"]', todoTitle);
    await page.fill('textarea[id="description"]', 'Delete description');
    await page.click('button:has-text("Create Todo")');
    
    // Wait for modal to close
    await expect(page.getByRole('heading', { name: 'Create New Todo' })).not.toBeVisible();
    await page.waitForSelector(`text=${todoTitle}`, { timeout: 10000 });

    // Delete the todo - use more specific selectors
    await page.locator('button:has-text("Delete")').first().click();

    // Confirm deletion in the modal
    await expect(page.getByRole('heading', { name: 'Delete Todo', exact: true })).toBeVisible();
    await expect(page.getByText(`Are you sure you want to delete "${todoTitle}"`)).toBeVisible();
    
    // Click the Delete button in the modal (it has different styling)
    await page.locator('button.bg-red-600:has-text("Delete")').click();

    // Wait for modal to close
    await expect(page.getByRole('heading', { name: 'Delete Todo', exact: true })).not.toBeVisible();

    // Verify the todo is removed from the list (ignore toast messages)
    await expect(page.locator('.space-y-4').getByText(todoTitle)).not.toBeVisible();
  });

  test('should cancel todo creation', async ({ page }) => {
    // Ensure no modal is open first
    await expect(page.locator('div.fixed.inset-0.bg-gray-600')).not.toBeVisible();
    
    await page.getByRole('button', { name: 'Add New Todo' }).click();
    await expect(page.getByRole('heading', { name: 'Create New Todo' })).toBeVisible();
    
    // Fill some data
    await page.fill('input[id="title"]', 'Test Todo');
    
    // Cancel
    await page.click('button:has-text("Cancel")');
    
    // Form should be closed
    await expect(page.getByRole('heading', { name: 'Create New Todo' })).not.toBeVisible();
  });

  test('should cancel todo deletion', async ({ page }) => {
    // Create a todo first
    const todoTitle = 'Cancel Delete Todo ' + Date.now();
    
    // Ensure no modal is open first
    await expect(page.locator('div.fixed.inset-0.bg-gray-600')).not.toBeVisible();
    
    await page.getByRole('button', { name: 'Add New Todo' }).click();
    await page.fill('input[id="title"]', todoTitle);
    await page.fill('textarea[id="description"]', 'Cancel delete description');
    await page.click('button:has-text("Create Todo")');
    
    // Wait for modal to close
    await expect(page.getByRole('heading', { name: 'Create New Todo' })).not.toBeVisible();
    await page.waitForSelector(`text=${todoTitle}`, { timeout: 10000 });

    // Click delete
    await page.locator('button:has-text("Delete")').first().click();

    // Verify delete modal appears
    await expect(page.getByRole('heading', { name: 'Delete Todo', exact: true })).toBeVisible();
    
    // Cancel deletion
    await page.getByRole('button', { name: 'Cancel' }).click();
    
    // Verify modal is closed and todo still exists in the list
    await expect(page.getByRole('heading', { name: 'Delete Todo', exact: true })).not.toBeVisible();
    await expect(page.locator('.space-y-4').getByText(todoTitle)).toBeVisible();
  });
});