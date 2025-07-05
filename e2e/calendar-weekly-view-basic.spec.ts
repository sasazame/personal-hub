import { test, expect } from '@playwright/test';
import { login, TEST_USER, ensureLoggedOut } from './helpers/auth';

test.describe('Calendar Weekly View - Basic Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Set English locale
    await page.context().addCookies([{ name: 'locale', value: 'en', domain: 'localhost', path: '/' }]);
    
    // Ensure clean state
    await ensureLoggedOut(page);
    
    // Navigate to login page
    await page.goto('/login');
    
    // Login
    await login(page, TEST_USER.email, TEST_USER.password);
    
    // Navigate to calendar page
    await page.goto('/calendar');
    await expect(page.getByRole('heading', { name: 'Calendar' })).toBeVisible();
  });

  test('should toggle between monthly and weekly views', async ({ page }) => {
    // Initially should be in monthly view
    await expect(page.getByTestId('calendar-grid')).toBeVisible();

    // Find and click the weekly view button
    const weeklyViewButton = page.locator('button[title="Weekly View"]');
    await weeklyViewButton.click();

    // Should switch to weekly view
    await expect(page.getByTestId('weekly-calendar')).toBeVisible();
    await expect(page.getByTestId('calendar-grid')).not.toBeVisible();

    // Check that weekly view shows time slots
    await expect(page.getByText('00:00')).toBeVisible();
    await expect(page.getByText('12:00')).toBeVisible();

    // Switch back to monthly view
    const monthlyViewButton = page.locator('button[title="Monthly View"]');
    await monthlyViewButton.click();

    // Should be back in monthly view
    await expect(page.getByTestId('calendar-grid')).toBeVisible();
    await expect(page.getByTestId('weekly-calendar')).not.toBeVisible();
  });

  test('should show weekly view structure', async ({ page }) => {
    // Switch to weekly view
    await page.locator('button[title="Weekly View"]').click();
    await expect(page.getByTestId('weekly-calendar')).toBeVisible();

    // Check for day headers
    const dayHeaders = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    for (const day of dayHeaders) {
      await expect(page.getByText(day, { exact: true })).toBeVisible();
    }

    // Check for time labels (sampling)
    await expect(page.getByText('00:00')).toBeVisible();
    await expect(page.getByText('06:00')).toBeVisible();
    await expect(page.getByText('12:00')).toBeVisible();
    await expect(page.getByText('18:00')).toBeVisible();

    // Check for All Day section
    await expect(page.getByText('All Day')).toBeVisible();
  });

  test('should navigate between weeks', async ({ page }) => {
    // Switch to weekly view
    await page.locator('button[title="Weekly View"]').click();
    await expect(page.getByTestId('weekly-calendar')).toBeVisible();

    // Get the week display header
    const weekHeader = page.locator('h2').filter({ hasText: / - / });
    const initialWeek = await weekHeader.textContent();

    // Navigate to next week using Today button first, then navigation
    await page.getByRole('button', { name: 'Today' }).click();
    
    // Find navigation buttons in the header area
    const headerArea = page.locator('div').filter({ has: weekHeader });
    const navigationButtons = headerArea.getByRole('button');
    
    // Click next (should be the second button after the week text)
    await navigationButtons.nth(1).click();
    
    // Check that week changed
    const nextWeek = await weekHeader.textContent();
    expect(nextWeek).not.toBe(initialWeek);

    // Navigate back
    await navigationButtons.first().click();
    
    // Should be back to a different week
    const prevWeek = await weekHeader.textContent();
    expect(prevWeek).not.toBe(nextWeek);
  });

  test('should display events in weekly view', async ({ page }) => {
    // First create an event in monthly view
    const newEventButton = page.getByRole('button', { name: /New Event/i });
    await newEventButton.click();
    
    // Wait for event form
    await expect(page.getByRole('heading', { name: /New Event/i })).toBeVisible();
    
    // Fill in basic event details
    await page.fill('input[name="title"]', 'Test Event');
    
    // Submit
    await page.getByRole('button', { name: 'Create' }).click();
    
    // Wait for success
    await expect(page.getByText('Event created successfully')).toBeVisible({ timeout: 10000 });
    
    // Switch to weekly view
    await page.locator('button[title="Weekly View"]').click();
    await expect(page.getByTestId('weekly-calendar')).toBeVisible();
    
    // Event should be visible
    await expect(page.getByText('Test Event')).toBeVisible();
  });

  test('should maintain view state when using Today button', async ({ page }) => {
    // Switch to weekly view
    await page.locator('button[title="Weekly View"]').click();
    await expect(page.getByTestId('weekly-calendar')).toBeVisible();

    // Navigate away from current week
    const headerArea = page.locator('h2').filter({ hasText: / - / }).locator('..');
    const nextButton = headerArea.getByRole('button').nth(1);
    await nextButton.click();
    await nextButton.click(); // Go 2 weeks ahead

    // Click Today button
    await page.getByRole('button', { name: 'Today' }).click();

    // Should still be in weekly view
    await expect(page.getByTestId('weekly-calendar')).toBeVisible();
    
    // Should show current week (today's date should be visible)
    const today = new Date();
    const todayDate = today.getDate().toString();
    await expect(page.getByText(todayDate, { exact: true })).toBeVisible();
  });
});