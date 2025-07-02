import { test, expect } from '@playwright/test';
import { login, TEST_USER } from './helpers/auth';

test.describe('TODO Subtasks', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_USER.email, TEST_USER.password);
    await page.goto('/todos');
    await page.waitForSelector('h1:has-text("TODOs")');
  });

  test('should create a subtask from parent TODO', async ({ page }) => {
    // Create a parent TODO first
    await page.click('button:has-text("Add TODO")');
    await page.fill('input[name="title"]', 'Parent Task');
    await page.fill('textarea[name="description"]', 'This is a parent task');
    await page.click('button:has-text("Save")');

    // Wait for the parent task to appear
    await page.waitForSelector('text=Parent Task');

    // Click "Add Subtask" button on the parent task
    await page.click('button:has-text("Add Subtask")');

    // Fill in subtask details
    await page.fill('input[name="title"]', 'Subtask 1');
    await page.fill('textarea[name="description"]', 'This is a subtask');
    await page.click('button:has-text("Save")');

    // Wait for success message
    await page.waitForSelector('text=TODO added successfully');

    // Verify subtask appears under parent
    const subtaskToggle = page.locator('button[aria-label="Show subtasks"]');
    await expect(subtaskToggle).toBeVisible();

    // Click to show subtasks
    await subtaskToggle.click();

    // Verify subtask is displayed with indentation
    const subtask = page.locator('text=Subtask 1');
    await expect(subtask).toBeVisible();

    // Verify the subtask has proper indentation (ml-8 class)
    const subtaskContainer = subtask.locator('xpath=ancestor::div[contains(@class, "ml-8")]');
    await expect(subtaskContainer).toBeVisible();
  });

  test('should toggle subtasks visibility', async ({ page }) => {
    // Create parent and subtask
    await page.click('button:has-text("Add TODO")');
    await page.fill('input[name="title"]', 'Parent with Subtasks');
    await page.click('button:has-text("Save")');
    await page.waitForSelector('text=Parent with Subtasks');

    await page.click('button:has-text("Add Subtask")');
    await page.fill('input[name="title"]', 'Hidden Subtask');
    await page.click('button:has-text("Save")');

    // Show subtasks
    await page.click('button[aria-label="Show subtasks"]');
    await expect(page.locator('text=Hidden Subtask')).toBeVisible();

    // Hide subtasks
    await page.click('button[aria-label="Hide subtasks"]');
    await expect(page.locator('text=Hidden Subtask')).not.toBeVisible();
  });

  test('should complete parent and subtasks independently', async ({ page }) => {
    // Create parent with subtask
    await page.click('button:has-text("Add TODO")');
    await page.fill('input[name="title"]', 'Parent Task Complete Test');
    await page.click('button:has-text("Save")');
    await page.waitForSelector('text=Parent Task Complete Test');

    await page.click('button:has-text("Add Subtask")');
    await page.fill('input[name="title"]', 'Subtask Complete Test');
    await page.click('button:has-text("Save")');

    // Show subtasks
    await page.click('button[aria-label="Show subtasks"]');
    await page.waitForSelector('text=Subtask Complete Test');

    // Complete the subtask
    const subtaskCheckbox = page.locator('text=Subtask Complete Test').locator('xpath=ancestor::div[contains(@class, "flex")]//button[contains(@class, "rounded")]');
    await subtaskCheckbox.click();

    // Verify subtask is marked as complete
    await expect(page.locator('text=Subtask Complete Test').locator('xpath=..')).toHaveClass(/line-through/);

    // Verify parent is still not complete
    const parentText = page.locator('text=Parent Task Complete Test').first();
    await expect(parentText).not.toHaveClass(/line-through/);
  });

  test('should not allow subtasks for subtasks', async ({ page }) => {
    // Create parent with subtask
    await page.click('button:has-text("Add TODO")');
    await page.fill('input[name="title"]', 'Parent for Nesting Test');
    await page.click('button:has-text("Save")');
    await page.waitForSelector('text=Parent for Nesting Test');

    await page.click('button:has-text("Add Subtask")');
    await page.fill('input[name="title"]', 'Subtask No Nesting');
    await page.click('button:has-text("Save")');

    // Show subtasks
    await page.click('button[aria-label="Show subtasks"]');
    await page.waitForSelector('text=Subtask No Nesting');

    // Verify subtask doesn't have "Add Subtask" button
    const subtaskElement = page.locator('text=Subtask No Nesting').locator('xpath=ancestor::div[contains(@class, "bg-card")]');
    await expect(subtaskElement.locator('button:has-text("Add Subtask")')).not.toBeVisible();
  });

  test('should display multiple subtasks correctly', async ({ page }) => {
    // Create parent
    await page.click('button:has-text("Add TODO")');
    await page.fill('input[name="title"]', 'Parent with Multiple Subtasks');
    await page.click('button:has-text("Save")');
    await page.waitForSelector('text=Parent with Multiple Subtasks');

    // Create multiple subtasks
    const subtasks = ['First Subtask', 'Second Subtask', 'Third Subtask'];
    
    for (const subtaskTitle of subtasks) {
      await page.click('button:has-text("Add Subtask")');
      await page.fill('input[name="title"]', subtaskTitle);
      await page.click('button:has-text("Save")');
      await page.waitForSelector('text=TODO added successfully');
    }

    // Show subtasks
    await page.click('button[aria-label="Show subtasks"]');

    // Verify all subtasks are visible
    for (const subtaskTitle of subtasks) {
      await expect(page.locator(`text=${subtaskTitle}`)).toBeVisible();
    }

    // Verify they all have proper indentation
    const indentedSubtasks = page.locator('.ml-8 >> text=/First Subtask|Second Subtask|Third Subtask/');
    await expect(indentedSubtasks).toHaveCount(3);
  });
});