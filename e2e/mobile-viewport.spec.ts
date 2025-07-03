import { test, expect, devices } from '@playwright/test';
import { login, TEST_USER, ensureLoggedOut } from './helpers/auth';

// Test on iPhone 12
test.describe('Mobile Tests - iPhone 12', () => {
  test.use({ ...devices['iPhone 12'] });

  test.beforeEach(async ({ page }) => {
    // Set English locale
    await page.context().addCookies([{ name: 'locale', value: 'en', domain: 'localhost', path: '/' }]);
    
    // Ensure clean state
    await ensureLoggedOut(page);
  });

  test('should show mobile menu and navigate', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await login(page, TEST_USER.email, TEST_USER.password);
    
    // Should be on dashboard
    await expect(page).toHaveURL('/dashboard');
    
    // Mobile menu should be hidden initially
    await expect(page.locator('.sidebar, aside')).not.toBeVisible();
    
    // Click hamburger menu
    const hamburgerButton = page.locator('button[aria-label*="menu"], button').filter({ has: page.locator('svg.lucide-menu') });
    await hamburgerButton.click();
    
    // Sidebar should be visible
    await expect(page.locator('.sidebar, aside').first()).toBeVisible();
    
    // Navigate to TODOs
    await page.getByRole('link', { name: 'TODOs' }).click();
    await expect(page).toHaveURL('/todos');
    
    // Sidebar should auto-close on mobile after navigation
    await expect(page.locator('.sidebar, aside')).not.toBeVisible();
  });

  test('should handle responsive login form', async ({ page }) => {
    await page.goto('/login');
    
    // Check responsive elements
    await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
    
    // Form should be full width on mobile
    const form = page.locator('form').first();
    const formBox = await form.boundingBox();
    const viewport = page.viewportSize();
    
    if (formBox && viewport) {
      // Form should take most of the width with some padding
      expect(formBox.width).toBeGreaterThan(viewport.width * 0.8);
    }
    
    // All form elements should be visible
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
  });

  test('should handle responsive TODO list', async ({ page }) => {
    // Login and navigate to TODOs
    await page.goto('/login');
    await login(page, TEST_USER.email, TEST_USER.password);
    await page.goto('/todos');
    
    // Create a TODO
    await page.getByRole('button', { name: 'Add TODO' }).click();
    const todoTitle = `Mobile Test ${Date.now()}`;
    await page.fill('input[name="title"]', todoTitle);
    await page.fill('textarea[name="description"]', 'Testing on mobile viewport');
    await page.getByRole('button', { name: 'Create' }).click();
    
    // TODO cards should be full width on mobile
    const todoCard = page.locator('.bg-card').filter({ hasText: todoTitle });
    await expect(todoCard).toBeVisible();
    
    const cardBox = await todoCard.boundingBox();
    const viewport = page.viewportSize();
    
    if (cardBox && viewport) {
      // Card should take most of the width
      expect(cardBox.width).toBeGreaterThan(viewport.width * 0.85);
    }
  });

  test('should handle modal responsiveness', async ({ page }) => {
    // Login and navigate to notes
    await page.goto('/login');
    await login(page, TEST_USER.email, TEST_USER.password);
    await page.goto('/notes');
    
    // Open create note modal
    await page.getByRole('button', { name: 'New Note' }).click();
    
    // Modal should be visible and responsive
    const modal = page.locator('[role="dialog"]').first();
    await expect(modal).toBeVisible();
    
    const modalBox = await modal.boundingBox();
    const viewport = page.viewportSize();
    
    if (modalBox && viewport) {
      // Modal should not exceed viewport width
      expect(modalBox.width).toBeLessThanOrEqual(viewport.width);
      
      // Modal should have some padding from edges on mobile
      expect(modalBox.x).toBeGreaterThan(0);
    }
    
    // Form elements should be accessible
    await expect(page.locator('input[name="title"]')).toBeVisible();
    await expect(page.locator('textarea[name="content"]')).toBeVisible();
    
    // Close modal
    await page.keyboard.press('Escape');
  });
});

// Test on Pixel 5
test.describe('Mobile Tests - Pixel 5', () => {
  test.use({ ...devices['Pixel 5'] });

  test.beforeEach(async ({ page }) => {
    await page.context().addCookies([{ name: 'locale', value: 'en', domain: 'localhost', path: '/' }]);
    await ensureLoggedOut(page);
  });

  test('should handle responsive calendar on Android', async ({ page }) => {
    // Login and navigate to calendar
    await page.goto('/login');
    await login(page, TEST_USER.email, TEST_USER.password);
    await page.goto('/calendar');
    
    // Calendar should be visible
    await expect(page.getByRole('heading', { name: 'Calendar' })).toBeVisible();
    
    // New Event button should be accessible
    await expect(page.getByRole('button', { name: 'New Event' })).toBeVisible();
    
    // Calendar grid should be responsive
    const calendarGrid = page.locator('.grid.grid-cols-7').first();
    const gridBox = await calendarGrid.boundingBox();
    const viewport = page.viewportSize();
    
    if (gridBox && viewport) {
      // Calendar should fit within viewport
      expect(gridBox.width).toBeLessThanOrEqual(viewport.width);
    }
  });
});

// Test on iPad Mini (Tablet)
test.describe('Tablet Tests - iPad Mini', () => {
  test.use({ ...devices['iPad Mini'] });

  test.beforeEach(async ({ page }) => {
    await page.context().addCookies([{ name: 'locale', value: 'en', domain: 'localhost', path: '/' }]);
    await ensureLoggedOut(page);
  });

  test('should show optimized layout for tablets', async ({ page }) => {
    // Login
    await page.goto('/login');
    await login(page, TEST_USER.email, TEST_USER.password);
    
    // Check if sidebar is visible (tablets might show it by default)
    const sidebar = page.locator('.sidebar, aside').first();
    const sidebarVisible = await sidebar.isVisible();
    
    // Navigate to different pages
    await page.goto('/todos');
    await expect(page.getByRole('heading', { name: 'TODO' })).toBeVisible();
    
    // Content area should have more space on tablets
    const mainContent = page.locator('main').first();
    const contentBox = await mainContent.boundingBox();
    const viewport = page.viewportSize();
    
    if (contentBox && viewport && sidebarVisible) {
      // Content should take remaining space after sidebar
      expect(contentBox.width).toBeLessThan(viewport.width * 0.8);
    }
  });
});

// Test on very small device (iPhone SE)
test.describe('Small Device Tests - iPhone SE', () => {
  test.use({ ...devices['iPhone SE'] });

  test.beforeEach(async ({ page }) => {
    await page.context().addCookies([{ name: 'locale', value: 'en', domain: 'localhost', path: '/' }]);
    await ensureLoggedOut(page);
  });

  test('should handle very small viewports', async ({ page }) => {
    await page.goto('/login');
    
    // All critical elements should still be visible
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
    
    // Text should not overflow
    const loginButton = page.getByRole('button', { name: 'Login' });
    const buttonBox = await loginButton.boundingBox();
    const viewport = page.viewportSize();
    
    if (buttonBox && viewport) {
      // Button should fit within viewport
      expect(buttonBox.x + buttonBox.width).toBeLessThanOrEqual(viewport.width);
    }
  });

  test('should handle text truncation on small screens', async ({ page }) => {
    // Login and navigate to todos
    await page.goto('/login');
    await login(page, TEST_USER.email, TEST_USER.password);
    await page.goto('/todos');
    
    // Create a TODO with long title
    await page.getByRole('button', { name: 'Add TODO' }).click();
    const longTitle = 'This is a very long todo title that should be truncated on small screens to prevent overflow';
    await page.fill('input[name="title"]', longTitle);
    await page.fill('textarea[name="description"]', 'Description');
    await page.getByRole('button', { name: 'Create' }).click();
    
    // Check that the title is displayed but truncated
    const todoCard = page.locator('.bg-card').filter({ hasText: longTitle.substring(0, 20) });
    await expect(todoCard).toBeVisible();
    
    // Title should have ellipsis or be truncated
    const titleElement = todoCard.locator('h3').first();
    const titleBox = await titleElement.boundingBox();
    const cardBox = await todoCard.boundingBox();
    
    if (titleBox && cardBox) {
      // Title should not exceed card width
      expect(titleBox.width).toBeLessThanOrEqual(cardBox.width);
    }
  });
});

// Test orientation changes
test.describe('Orientation Tests', () => {
  test('should handle orientation change on iPhone', async ({ browser }) => {
    // Create context with iPhone 12 in portrait
    const context = await browser.newContext({
      ...devices['iPhone 12'],
      viewport: { width: 390, height: 844 }
    });
    
    const page = await context.newPage();
    await page.context().addCookies([{ name: 'locale', value: 'en', domain: 'localhost', path: '/' }]);
    
    // Navigate and login
    await page.goto('/login');
    
    // Check portrait layout
    let viewport = page.viewportSize();
    expect(viewport?.height).toBeGreaterThan(viewport?.width || 0);
    
    // Change to landscape
    await page.setViewportSize({ width: 844, height: 390 });
    
    // Layout should adapt
    await page.waitForTimeout(500);
    viewport = page.viewportSize();
    expect(viewport?.width).toBeGreaterThan(viewport?.height || 0);
    
    // Form should still be functional
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    
    await context.close();
  });
});

// Test touch interactions
test.describe('Touch Interaction Tests', () => {
  test.use({ ...devices['iPhone 12'] });

  test('should handle touch scrolling and taps', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.context().addCookies([{ name: 'locale', value: 'en', domain: 'localhost', path: '/' }]);
    await login(page, TEST_USER.email, TEST_USER.password);
    
    // Go to dashboard
    await page.goto('/dashboard');
    
    // Simulate touch scroll
    await page.evaluate(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    });
    await page.waitForTimeout(1000);
    
    // Scroll back to top
    await page.evaluate(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    await page.waitForTimeout(1000);
    
    // Tap on a card (simulate touch)
    const firstCard = page.locator('.bg-card').first();
    if (await firstCard.isVisible()) {
      await firstCard.tap();
      // Should navigate or open modal
      await page.waitForTimeout(500);
    }
  });
});