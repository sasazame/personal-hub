import { test, expect, Page } from '@playwright/test';
import { login, TEST_USER, ensureLoggedOut } from './helpers/auth';

// Helper function to click kebab menu and select an option
async function clickTodoMenuOption(page: Page, todoTitle: string, optionName: string) {
  const todoContainer = page.locator('.bg-card').filter({ hasText: todoTitle });
  // Click the kebab menu (ellipsis icon)
  await todoContainer.locator('button svg').last().click();
  // Click the menu option
  await page.locator('button').filter({ hasText: optionName }).click();
}

test.describe('Personal Hub E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set English locale
    await page.context().addCookies([{ name: 'locale', value: 'en', domain: 'localhost', path: '/' }]);
    
    // Ensure clean state
    await ensureLoggedOut(page);
    
    // Login first
    await page.goto('/login');
    await login(page, TEST_USER.email, TEST_USER.password);
    
    // Navigate to todos page explicitly
    await page.goto('/todos');
    await page.waitForLoadState('domcontentloaded');
    
    // Wait for TODO app to be ready by checking for key elements
    await page.waitForSelector('h1:has-text("TODO")', { timeout: 10000 });
  });

  test('should display the todo app heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'TODO', exact: true })).toBeVisible();
  });

  test('should show "Add TODO" button', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Add TODO' })).toBeVisible();
  });

  test('should open todo form when clicking "Add TODO"', async ({ page }) => {
    // Ensure no modal is open first
    await expect(page.locator('div.fixed.inset-0.bg-gray-600')).not.toBeVisible();
    
    await page.getByRole('button', { name: 'Add TODO' }).click();
    await expect(page.getByRole('heading', { name: 'Create New TODO' })).toBeVisible();
    await expect(page.locator('input[id="title"]')).toBeVisible();
    await expect(page.locator('textarea[id="description"]')).toBeVisible();
    await expect(page.locator('select[id="priority"]')).toBeVisible();
  });

  test('should create a new todo', async ({ page }) => {
    
    const todoTitle = 'Test Todo ' + Date.now();
    const todoDescription = 'Test description ' + Date.now();

    // Ensure no modal is open first
    await expect(page.locator('div.fixed.inset-0.bg-gray-600')).not.toBeVisible();

    // Click "Add TODO" button
    await page.getByRole('button', { name: 'Add TODO' }).click();

    // Wait for the form to appear
    await expect(page.getByRole('heading', { name: 'Create New TODO' })).toBeVisible();

    // Fill in the form
    await page.fill('input[id="title"]', todoTitle);
    await page.fill('textarea[id="description"]', todoDescription);
    await page.selectOption('select[id="priority"]', 'MEDIUM');

    // Submit the form
    await page.click('button:has-text("Create TODO")');

    // Wait for the modal to close
    await expect(page.getByRole('heading', { name: 'Create New TODO' })).not.toBeVisible();

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
    
    await page.getByRole('button', { name: 'Add TODO' }).click();
    await page.fill('input[id="title"]', todoTitle);
    await page.fill('textarea[id="description"]', 'Delete description');
    await page.click('button:has-text("Create TODO")');
    
    // Wait for modal to close
    await expect(page.getByRole('heading', { name: 'Create New TODO' })).not.toBeVisible();
    await page.waitForSelector(`text=${todoTitle}`, { timeout: 10000 });

    // Delete the todo using kebab menu
    await clickTodoMenuOption(page, todoTitle, 'Delete');

    // Confirm deletion in the modal
    await expect(page.locator('h2:has-text("Delete TODO")')).toBeVisible();
    
    // Confirm deletion
    await page.getByRole('button', { name: 'Delete' }).click();

    // Wait for todo to disappear
    await expect(page.locator('h3').filter({ hasText: todoTitle })).not.toBeVisible({ timeout: 10000 });

    // Verify the todo is removed from the list (ignore toast messages)
    await expect(page.locator('.space-y-4').getByText(todoTitle)).not.toBeVisible();
  });

  test('should cancel todo creation', async ({ page }) => {
    // Ensure no modal is open first
    await expect(page.locator('div.fixed.inset-0.bg-gray-600')).not.toBeVisible();
    
    await page.getByRole('button', { name: 'Add TODO' }).click();
    await expect(page.getByRole('heading', { name: 'Create New TODO' })).toBeVisible();
    
    // Fill some data
    await page.fill('input[id="title"]', 'Test Todo');
    
    // Cancel
    await page.click('button:has-text("Cancel")');
    
    // Form should be closed
    await expect(page.getByRole('heading', { name: 'Create New TODO' })).not.toBeVisible();
  });

  test('should cancel todo deletion', async ({ page }) => {
    // Create a todo first
    const todoTitle = 'Cancel Delete Todo ' + Date.now();
    
    // Ensure no modal is open first
    await expect(page.locator('div.fixed.inset-0.bg-gray-600')).not.toBeVisible();
    
    await page.getByRole('button', { name: 'Add TODO' }).click();
    await page.fill('input[id="title"]', todoTitle);
    await page.fill('textarea[id="description"]', 'Cancel delete description');
    await page.click('button:has-text("Create TODO")');
    
    // Wait for modal to close
    await expect(page.getByRole('heading', { name: 'Create New TODO' })).not.toBeVisible();
    await page.waitForSelector(`text=${todoTitle}`, { timeout: 10000 });

    // Click delete using kebab menu
    await clickTodoMenuOption(page, todoTitle, 'Delete');

    // Verify delete modal appears
    await expect(page.locator('h2:has-text("Delete TODO")')).toBeVisible();
    
    // Cancel deletion
    await page.getByRole('button', { name: 'Cancel' }).click();
    
    // Verify modal is closed and todo still exists in the list
    await expect(page.locator('h2:has-text("Delete TODO")')).not.toBeVisible();
    await expect(page.locator('.space-y-4').getByText(todoTitle)).toBeVisible();
  });
});