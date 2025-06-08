import { test, expect } from '@playwright/test';
import { setupTestUser, createUniqueTestUser } from './helpers/setup';
import { login } from './helpers/auth';

test.describe('Todo Basic Operations', () => {
  test.beforeEach(async ({ page }) => {
    // Set English locale
    await page.context().addCookies([{ name: 'locale', value: 'en', domain: 'localhost', path: '/' }]);
  });

  test('should display empty state for new user', async ({ page }) => {
    // Create a unique user for this test
    const uniqueUser = await createUniqueTestUser(page);
    
    // Login with the unique user
    await page.goto('/login');
    await login(page, uniqueUser.email, uniqueUser.password);
    
    // Navigate to todos page
    await page.goto('/todos');
    await expect(page.getByRole('heading', { name: 'TODO', exact: true })).toBeVisible();
    
    // Check for empty state message - updated to match current translation
    await expect(page.locator('text=No TODOs found')).toBeVisible();
  });

  test('should create a new todo', async ({ page }) => {
    // Create a unique user for this test
    const uniqueUser = await createUniqueTestUser(page);
    
    // Login with the unique user
    await page.goto('/login');
    await login(page, uniqueUser.email, uniqueUser.password);
    
    // Navigate to todos page
    await page.goto('/todos');
    await expect(page.getByRole('heading', { name: 'TODO', exact: true })).toBeVisible();
    
    // Click add todo button - updated to match current button text
    await page.click('button:has-text("Add TODO")');
    
    // Wait for form to appear
    await expect(page.locator('h2:has-text("Create New TODO")')).toBeVisible();
    
    // Fill form
    const title = `Test Todo ${Date.now()}`;
    await page.fill('input[name="title"]', title);
    await page.fill('textarea[name="description"]', 'Test description');
    await page.selectOption('select[name="priority"]', 'MEDIUM');
    
    // Submit - updated to match current button text
    await page.click('button:has-text("Create TODO")');
    
    // Wait for todo to appear in the list
    await expect(page.locator('h3').filter({ hasText: title })).toBeVisible({ timeout: 10000 });
  });

  test('should delete a todo', async ({ page }) => {
    // Create a unique user for this test
    const uniqueUser = await createUniqueTestUser(page);
    
    // Login with the unique user
    await page.goto('/login');
    await login(page, uniqueUser.email, uniqueUser.password);
    
    // Navigate to todos page
    await page.goto('/todos');
    await expect(page.getByRole('heading', { name: 'TODO', exact: true })).toBeVisible();
    
    // First create a todo
    await page.click('button:has-text("Add TODO")');
    await expect(page.locator('h2:has-text("Create New TODO")')).toBeVisible();
    
    const title = `Delete Test ${Date.now()}`;
    await page.fill('input[name="title"]', title);
    await page.click('button:has-text("Create TODO")');
    
    // Wait for todo to appear
    await expect(page.locator('h3').filter({ hasText: title })).toBeVisible();
    
    // Click edit button first (delete is available from edit form)
    // Find the todo item container and click its edit button
    const todoContainer = page.locator('.bg-card').filter({ hasText: title });
    await todoContainer.getByRole('button', { name: 'Edit' }).click();
    
    // Wait for edit form
    await expect(page.locator('h2:has-text("Edit TODO")')).toBeVisible();
    
    // Click delete button in edit form
    await page.getByRole('button', { name: 'Delete' }).click();
    
    // Confirm deletion - updated to match current modal
    await expect(page.locator('h2:has-text("Delete TODO")')).toBeVisible();
    await page.getByRole('button', { name: 'Delete' }).click();
    
    // Wait for todo to disappear
    await expect(page.locator('h3').filter({ hasText: title })).not.toBeVisible({ timeout: 10000 });
  });

  test('should update todo status', async ({ page }) => {
    // Create a unique user for this test
    const uniqueUser = await createUniqueTestUser(page);
    
    // Login with the unique user
    await page.goto('/login');
    await login(page, uniqueUser.email, uniqueUser.password);
    
    // Navigate to todos page
    await page.goto('/todos');
    await expect(page.getByRole('heading', { name: 'TODO', exact: true })).toBeVisible();
    
    // First create a todo
    await page.click('button:has-text("Add TODO")');
    await expect(page.locator('h2:has-text("Create New TODO")')).toBeVisible();
    
    const title = `Status Test ${Date.now()}`;
    await page.fill('input[name="title"]', title);
    await page.click('button:has-text("Create TODO")');
    
    // Wait for todo to appear
    await expect(page.locator('h3').filter({ hasText: title })).toBeVisible();
    
    // Click edit button
    // Find the todo item container and click its edit button
    const todoContainer = page.locator('.bg-card').filter({ hasText: title });
    await todoContainer.getByRole('button', { name: 'Edit' }).click();
    
    // Wait for edit form - updated to match current modal
    await expect(page.locator('h2:has-text("Edit TODO")')).toBeVisible();
    
    // Change status
    await page.selectOption('select[name="status"]', 'DONE');
    
    // Save - updated to match current button text
    await page.click('button:has-text("Update TODO")');
    
    // Verify status changed - look for 'Done' status badge
    await expect(page.locator('span:has-text("Done")').first()).toBeVisible({ timeout: 10000 });
  });
});