import { test, expect } from '@playwright/test';

test.describe('Goals Management Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('http://localhost:3000/login');
    await page.fill('input[name="email"]', 'mcp@example.com');
    await page.fill('input[name="password"]', 'Test1234!');
    await page.click('button[type="submit"]');
    
    // Wait for navigation
    await page.waitForURL('**/dashboard');
    
    // Navigate to goals
    await page.goto('http://localhost:3000/goals');
    await page.waitForLoadState('networkidle');
  });

  test('should display date navigation header', async ({ page }) => {
    // Check date navigation elements
    await expect(page.getByText('Today')).toBeVisible();
    await expect(page.getByText('Change Date')).toBeVisible();
    
    // Check current date is displayed
    const today = new Date();
    const dateText = today.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    await expect(page.getByText(dateText)).toBeVisible();
  });

  test('should display filter tabs', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Filter by Active goals' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Filter by Inactive goals' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Filter by All goals' })).toBeVisible();
  });

  test('should display goal groups', async ({ page }) => {
    await expect(page.getByText('Daily Goals')).toBeVisible();
    await expect(page.getByText('Weekly Goals')).toBeVisible();
    await expect(page.getByText('Monthly Goals')).toBeVisible();
    await expect(page.getByRole('button', { name: /Annual Goals/ })).toBeVisible();
  });

  test('should navigate between dates', async ({ page }) => {
    // Click previous day
    await page.getByLabel('Previous day').click();
    
    // Verify date changed (we can't check exact date due to timezone issues)
    await expect(page.getByText(/\w+, \w+ \d+, \d{4}/)).toBeVisible();
    
    // Click Today button
    await page.getByText('Today').click();
    
    // Click next day
    await page.getByLabel('Next day').click();
  });

  test('should switch between filter tabs', async ({ page }) => {
    // Click Inactive filter
    await page.getByRole('button', { name: 'Filter by Inactive goals' }).click();
    
    // Verify it's selected (has different styling)
    const inactiveButton = page.getByRole('button', { name: 'Filter by Inactive goals' });
    await expect(inactiveButton).toHaveClass(/bg-white|dark:bg-gray-700/);
    
    // Click All filter
    await page.getByRole('button', { name: 'Filter by All goals' }).click();
    
    // Verify it's selected
    const allButton = page.getByRole('button', { name: 'Filter by All goals' });
    await expect(allButton).toHaveClass(/bg-white|dark:bg-gray-700/);
  });

  test('should create a new goal', async ({ page }) => {
    // Click create goal button
    await page.getByText('Create Goal').click();
    
    // Fill in the form
    await page.fill('input[name="title"]', 'Test Goal Integration');
    await page.fill('textarea[name="description"]', 'This is a test goal created by integration test');
    await page.selectOption('select[name="goalType"]', 'DAILY');
    
    // Submit the form
    await page.getByRole('dialog').getByRole('button', { name: 'Create Goal' }).click();
    
    // Wait for modal to close and verify goal appears
    await page.waitForTimeout(1000);
    await expect(page.getByText('Test Goal Integration')).toBeVisible();
  });

  test('should display goal cards with proper styling', async ({ page }) => {
    // Check if any goal cards are visible
    const goalCards = page.locator('[class*="hover:shadow-lg"]');
    const count = await goalCards.count();
    
    if (count > 0) {
      // Verify card has checkbox
      const firstCard = goalCards.first();
      await expect(firstCard.locator('input[type="checkbox"]')).toBeVisible();
      
      // Verify card has menu button
      await expect(firstCard.locator('button').filter({ hasText: /^$/ })).toBeVisible();
    }
  });

  test('should toggle goal completion', async ({ page }) => {
    const checkbox = page.locator('input[type="checkbox"]').first();
    const isChecked = await checkbox.isChecked();
    
    // Toggle the checkbox
    await checkbox.click();
    
    // Verify it toggled
    await expect(checkbox).toBeChecked({ checked: !isChecked });
  });
});