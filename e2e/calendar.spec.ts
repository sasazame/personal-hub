import { test, expect } from '@playwright/test';
import { login, TEST_USER, ensureLoggedOut } from './helpers/auth';

test.describe('Calendar Feature E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set English locale
    await page.context().addCookies([{ name: 'locale', value: 'en', domain: 'localhost', path: '/' }]);
    
    // Ensure clean state and login
    await ensureLoggedOut(page);
    await page.goto('/login');
    await login(page, TEST_USER.email, TEST_USER.password);
    
    // Navigate to calendar
    await page.goto('/calendar');
    await expect(page.getByRole('heading', { name: 'Calendar' })).toBeVisible();
  });

  test('should display calendar with current month', async ({ page }) => {
    // Check calendar structure
    const currentMonth = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });
    await expect(page.locator('text=' + currentMonth)).toBeVisible();
    
    // Check weekday headers
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (const day of weekdays) {
      await expect(page.locator(`text="${day}"`).first()).toBeVisible();
    }
    
    // Check today is highlighted
    const today = new Date().getDate().toString();
    const todayCell = page.locator('.bg-gradient-to-br.from-blue-500.to-indigo-600').filter({ hasText: today });
    await expect(todayCell).toBeVisible();
  });

  test('should navigate between months', async ({ page }) => {
    const currentDate = new Date();
    const currentMonth = currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });
    
    // Navigate to previous month
    await page.locator('.flex.items-center.gap-4 button').filter({ has: page.locator('svg.lucide-chevron-left') }).click();
    const prevDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1);
    const prevMonth = prevDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });
    await expect(page.locator('text=' + prevMonth)).toBeVisible();
    
    // Navigate to next month (should be current month)
    await page.locator('.flex.items-center.gap-4 button').filter({ has: page.locator('svg.lucide-chevron-right') }).click();
    await expect(page.locator('text=' + currentMonth)).toBeVisible();
    
    // Use Today button
    await page.locator('.flex.items-center.gap-4 button').filter({ has: page.locator('svg.lucide-chevron-left') }).click(); // Go to prev month first
    await page.getByRole('button', { name: 'Today' }).click();
    await expect(page.locator('text=' + currentMonth)).toBeVisible();
  });

  test('should create event by clicking date', async ({ page }) => {
    // Click on a date (15th of current month)
    const dateCell = page.locator('.backdrop-blur-xl.min-h-\\[120px\\]').filter({ hasText: '15' }).first();
    await dateCell.click();
    
    // Check event form appears
    await expect(page.getByRole('heading', { name: 'New Event' })).toBeVisible();
    
    // Fill event details
    const eventTitle = `Test Event ${Date.now()}`;
    await page.fill('input[name="title"]', eventTitle);
    await page.fill('textarea[name="description"]', 'Test event description');
    await page.fill('input[name="location"]', 'Test Location');
    
    // Select color (click blue)
    await page.locator('.w-8.h-8.rounded-full').first().click();
    
    // Submit form
    await page.getByRole('button', { name: 'Create' }).click();
    
    // Verify event appears on calendar
    await expect(page.locator('.text-xs.p-1.rounded').filter({ hasText: eventTitle })).toBeVisible();
  });

  test('should create all-day event', async ({ page }) => {
    // Click New Event button
    await page.getByRole('button', { name: 'New Event' }).click();
    
    // Check event form appears
    await expect(page.getByRole('heading', { name: 'New Event' })).toBeVisible();
    
    // Fill event details
    const eventTitle = `All Day Event ${Date.now()}`;
    await page.fill('input[name="title"]', eventTitle);
    
    // Check all-day checkbox
    await page.locator('input[name="allDay"]').check();
    
    // Verify time inputs are hidden
    await expect(page.locator('input[type="time"]')).not.toBeVisible();
    
    // Submit form
    await page.getByRole('button', { name: 'Create' }).click();
    
    // Verify event appears without time
    const event = page.locator('.text-xs.p-1.rounded').filter({ hasText: eventTitle });
    await expect(event).toBeVisible();
    await expect(event).not.toContainText(':'); // No time shown for all-day events
  });

  test('should edit existing event', async ({ page }) => {
    // First create an event
    await page.getByRole('button', { name: 'New Event' }).click();
    const eventTitle = `Edit Test ${Date.now()}`;
    await page.fill('input[name="title"]', eventTitle);
    await page.getByRole('button', { name: 'Create' }).click();
    
    // Wait for event to appear
    await expect(page.locator('.text-xs.p-1.rounded').filter({ hasText: eventTitle })).toBeVisible();
    
    // Click on the event to edit
    await page.locator('.text-xs.p-1.rounded').filter({ hasText: eventTitle }).click();
    
    // Check edit form appears
    await expect(page.getByRole('heading', { name: 'Edit Event' })).toBeVisible();
    
    // Modify title
    const newTitle = eventTitle + ' - Edited';
    await page.fill('input[name="title"]', newTitle);
    
    // Change color to green
    await page.locator('.w-8.h-8.rounded-full').nth(1).click();
    
    // Save changes
    await page.getByRole('button', { name: 'Update' }).click();
    
    // Verify changes
    await expect(page.locator('.text-xs.p-1.rounded').filter({ hasText: newTitle })).toBeVisible();
  });

  test('should delete event', async ({ page }) => {
    // First create an event
    await page.getByRole('button', { name: 'New Event' }).click();
    const eventTitle = `Delete Test ${Date.now()}`;
    await page.fill('input[name="title"]', eventTitle);
    await page.getByRole('button', { name: 'Create' }).click();
    
    // Wait for event to appear
    await expect(page.locator('.text-xs.p-1.rounded').filter({ hasText: eventTitle })).toBeVisible();
    
    // Click on the event to open edit form
    await page.locator('.text-xs.p-1.rounded').filter({ hasText: eventTitle }).click();
    
    // Click delete button
    await page.getByRole('button', { name: 'Delete' }).click();
    
    // Confirm deletion - the text includes the event title
    await expect(page.getByText(new RegExp(`Are you sure you want to delete.*${eventTitle}`, 'i'))).toBeVisible();
    await page.getByRole('button', { name: 'Delete' }).nth(1).click();
    
    // Verify event is removed
    await expect(page.locator('.text-xs.p-1.rounded').filter({ hasText: eventTitle })).not.toBeVisible();
  });

  test('should drag and drop event to different date', async ({ page }) => {
    // Create an event on the 10th
    const dateCell10 = page.locator('.backdrop-blur-xl.min-h-\\[120px\\]').filter({ hasText: '10' }).first();
    await dateCell10.click();
    
    const eventTitle = `Drag Test ${Date.now()}`;
    await page.fill('input[name="title"]', eventTitle);
    await page.getByRole('button', { name: 'Create' }).click();
    
    // Wait for event to appear
    const event = page.locator('.text-xs.p-1.rounded').filter({ hasText: eventTitle });
    await expect(event).toBeVisible();
    
    // Drag event to the 20th
    const dateCell20 = page.locator('.backdrop-blur-xl.min-h-\\[120px\\]').filter({ hasText: '20' }).first();
    
    // Perform drag and drop
    await event.hover();
    await page.mouse.down();
    await dateCell20.hover();
    await page.mouse.up();
    
    // Wait for drag-drop to process
    await page.waitForTimeout(1000);
    
    // Verify event moved to new date
    await expect(dateCell20.locator('.text-xs.p-1.rounded').filter({ hasText: eventTitle })).toBeVisible();
    await expect(dateCell10.locator('.text-xs.p-1.rounded').filter({ hasText: eventTitle })).not.toBeVisible();
  });

  test('should show multiple events on same date', async ({ page }) => {
    // Create multiple events on the same date (15th)
    const dateCell = page.locator('.backdrop-blur-xl.min-h-\\[120px\\]').filter({ hasText: '15' }).first();
    
    // Create 5 events
    for (let i = 1; i <= 5; i++) {
      await dateCell.click();
      await page.fill('input[name="title"]', `Event ${i}`);
      await page.getByRole('button', { name: 'Create' }).click();
      await page.waitForTimeout(500); // Brief wait between events
    }
    
    // Check for "more" indicator
    await expect(page.locator('text=/\\+\\d+ more/')).toBeVisible();
    
    // Click to expand
    await page.locator('text=/\\+\\d+ more/').click();
    
    // Verify all events are visible
    for (let i = 1; i <= 5; i++) {
      await expect(page.locator('.text-xs.p-1.rounded').filter({ hasText: `Event ${i}` })).toBeVisible();
    }
  });

  test('should handle timed events correctly', async ({ page }) => {
    // Create a timed event
    await page.getByRole('button', { name: 'New Event' }).click();
    
    const eventTitle = `Timed Event ${Date.now()}`;
    await page.fill('input[name="title"]', eventTitle);
    
    // Ensure all-day is unchecked
    await page.locator('input[name="allDay"]').uncheck();
    
    // Set specific times
    const startTime = '14:30';
    const endTime = '16:00';
    
    // Find and fill time inputs
    const timeInputs = page.locator('input[type="time"]');
    await timeInputs.first().fill(startTime);
    await timeInputs.last().fill(endTime);
    
    await page.getByRole('button', { name: 'Create' }).click();
    
    // Verify event shows with time
    const event = page.locator('.text-xs.p-1.rounded').filter({ hasText: eventTitle });
    await expect(event).toBeVisible();
    // The time is displayed in the user's timezone - just verify it has a time format
    await expect(event).toContainText(/\d{1,2}:\d{2}/); // Matches any time format like "14:30" or "05:30"
  });

  test('should open Google Calendar settings', async ({ page }) => {
    // Click settings button
    await page.locator('button').filter({ has: page.locator('svg.lucide-settings') }).click();
    
    // Check settings section appears (it's not a modal, it's a section that expands)
    await expect(page.getByRole('heading', { name: 'Google Calendar Integration' })).toBeVisible();
    
    // Check for connect button (if not connected)
    const connectButton = page.getByRole('button', { name: 'Connect Google Calendar' });
    if (await connectButton.isVisible()) {
      // Verify OAuth flow would start
      await expect(connectButton).toBeEnabled();
    } else {
      // If connected, check for sync options
      await expect(page.locator('text=Sync Direction')).toBeVisible();
      await expect(page.locator('text=Auto-sync Interval')).toBeVisible();
    }
    
    // Close modal
    await page.keyboard.press('Escape');
    await expect(page.getByRole('heading', { name: 'Google Calendar Settings' })).not.toBeVisible();
  });
});