import { test, expect } from '@playwright/test';
import { login, TEST_USER, ensureLoggedOut } from './helpers/auth';

test.describe('Calendar Weekly View', () => {
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
    // Initially should be in monthly view (7-column grid)
    await expect(page.locator('.grid.grid-cols-7')).toBeVisible();

    // Find and click the weekly view button
    const weeklyViewButton = page.locator('button[title="Weekly View"]');
    await weeklyViewButton.click();

    // Should switch to weekly view
    await expect(page.getByTestId('weekly-calendar')).toBeVisible();
    await expect(page.getByTestId('calendar-grid')).not.toBeVisible();

    // Check that weekly view shows time slots (00:00, 01:00, etc.)
    await expect(page.getByText('00:00')).toBeVisible();
    await expect(page.getByText('12:00')).toBeVisible();

    // Switch back to monthly view
    const monthlyViewButton = page.locator('button[title="Monthly View"]');
    await monthlyViewButton.click();

    // Should be back in monthly view
    await expect(page.locator('.grid.grid-cols-7')).toBeVisible();
    await expect(page.locator('.weeklyCalendar')).not.toBeVisible();
  });

  test('should display week navigation correctly', async ({ page }) => {
    // Switch to weekly view
    await page.locator('button[title="Weekly View"]').click();
    await expect(page.getByTestId('weekly-calendar')).toBeVisible();

    // Get current week display
    const weekDisplay = page.locator('h2').filter({ hasText: / - / });
    const initialWeek = await weekDisplay.textContent();

    // Navigate to next week (find the navigation button specifically)
    const navContainer = page.locator('div').filter({ hasText: /^[A-Za-z]+ \d+ - [A-Za-z]+ \d+, \d{4}$/ });
    await navContainer.getByRole('button').nth(1).click(); // Right chevron
    
    // Week display should change
    const nextWeek = await weekDisplay.textContent();
    expect(nextWeek).not.toBe(initialWeek);

    // Navigate to previous week twice
    const leftChevron = navContainer.getByRole('button').first();
    await leftChevron.click();
    await leftChevron.click();
    
    // Should show a different week
    const prevWeek = await weekDisplay.textContent();
    expect(prevWeek).not.toBe(initialWeek);
  });

  test('should create event via drag and drop in weekly view', async ({ page }) => {
    // Switch to weekly view
    await page.locator('button[title="Weekly View"]').click();
    await expect(page.getByTestId('weekly-calendar')).toBeVisible();

    // Wait for time slots to be visible
    await expect(page.getByText('10:00')).toBeVisible();
    
    // Find the weekly calendar container and perform drag within it
    const weeklyCalendar = page.getByTestId('weekly-calendar');
    const calendarBounds = await weeklyCalendar.boundingBox();
    if (!calendarBounds) throw new Error('Calendar not found');
    
    // Calculate positions for 10:00 AM slot (roughly)
    const startY = calendarBounds.y + (calendarBounds.height * 0.45); // ~10:00 AM
    const endY = calendarBounds.y + (calendarBounds.height * 0.5); // ~11:00 AM
    const mondayX = calendarBounds.x + (calendarBounds.width * 0.15); // Monday column

    // Perform drag from 10:00 to 11:00
    await page.mouse.move(mondayX, startY);
    await page.mouse.down();
    await page.mouse.move(mondayX, endY);
    await page.mouse.up();

    // Event form should open
    await expect(page.getByRole('heading', { name: /New Event/i })).toBeVisible({ timeout: 10000 });

    // Fill in event details
    await page.fill('input[name="title"]', 'Team Meeting');
    await page.fill('textarea[name="description"]', 'Weekly team sync');

    // Submit the form
    await page.getByRole('button', { name: 'Create' }).click();

    // Wait for success message
    await expect(page.getByText('Event created successfully')).toBeVisible({ timeout: 10000 });

    // Event should appear in the weekly view
    await expect(page.getByText('Team Meeting')).toBeVisible();
  });

  test('should display all-day events in separate section', async ({ page }) => {
    // Create an all-day event first
    const newEventButton = page.getByRole('button', { name: /New Event/i });
    await newEventButton.click();
    
    // Wait for modal to open
    await expect(page.getByRole('heading', { name: /New Event/i })).toBeVisible();

    await page.fill('input[name="title"]', 'Company Holiday');
    
    // Find and click the All Day switch
    const allDaySwitch = page.getByRole('switch', { name: /All Day/i });
    await allDaySwitch.click();
    
    // Submit the form
    await page.getByRole('button', { name: 'Create' }).click();

    // Wait for success message
    await expect(page.getByText('Event created successfully')).toBeVisible({ timeout: 10000 });

    // Switch to weekly view
    await page.locator('button[title="Weekly View"]').click();
    await expect(page.getByTestId('weekly-calendar')).toBeVisible();

    // All-day event should appear in the all-day section
    await expect(page.getByText('All Day')).toBeVisible();
    await expect(page.getByText('Company Holiday')).toBeVisible();
  });

  test('should handle event click in weekly view', async ({ page }) => {
    // Create a timed event first
    const newEventButton = page.getByRole('button', { name: /New Event/i });
    await newEventButton.click();
    
    await expect(page.getByRole('heading', { name: /New Event/i })).toBeVisible();
    await page.fill('input[name="title"]', 'Client Call');
    await page.getByRole('button', { name: 'Create' }).click();
    
    await expect(page.getByText('Event created successfully')).toBeVisible({ timeout: 10000 });

    // Switch to weekly view
    await page.locator('button[title="Weekly View"]').click();
    await expect(page.getByTestId('weekly-calendar')).toBeVisible();

    // Click on the event
    await page.getByText('Client Call').click();

    // Event form should open in edit mode
    await expect(page.getByRole('heading', { name: /Edit Event/i })).toBeVisible();
    await expect(page.getByRole('textbox', { name: /title/i })).toHaveValue('Client Call');
  });

  test('should show correct time slots and labels', async ({ page }) => {
    // Switch to weekly view
    await page.locator('button[title="Weekly View"]').click();
    await expect(page.getByTestId('weekly-calendar')).toBeVisible();

    // Check time labels
    await expect(page.getByText('00:00')).toBeVisible();
    await expect(page.getByText('06:00')).toBeVisible();
    await expect(page.getByText('12:00')).toBeVisible();
    await expect(page.getByText('18:00')).toBeVisible();
    await expect(page.getByText('23:00')).toBeVisible();

    // Check day headers
    const dayHeaders = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    for (const day of dayHeaders) {
      await expect(page.getByText(day, { exact: true })).toBeVisible();
    }
  });

  test('should highlight today in weekly view', async ({ page }) => {
    // Switch to weekly view
    await page.locator('button[title="Weekly View"]').click();
    await expect(page.getByTestId('weekly-calendar')).toBeVisible();

    // Click "Today" button to ensure current week is shown
    await page.click('button:has-text("Today")');

    // Today should be visible in the week view
    // Check that we're viewing the current week by looking for today's date
    const today = new Date();
    const todayDate = today.getDate().toString();
    await expect(page.getByText(todayDate, { exact: true })).toBeVisible();
  });

  test('should persist view mode when navigating', async ({ page }) => {
    // Switch to weekly view
    await page.locator('button[title="Weekly View"]').click();
    await expect(page.getByTestId('weekly-calendar')).toBeVisible();

    // Navigate to next week
    await page.locator('button').filter({ has: page.locator('.lucide-chevron-right') }).click();

    // Should still be in weekly view
    await expect(page.getByTestId('weekly-calendar')).toBeVisible();

    // Navigate to today
    await page.click('button:has-text("Today")');

    // Should still be in weekly view
    await expect(page.getByTestId('weekly-calendar')).toBeVisible();
  });
});