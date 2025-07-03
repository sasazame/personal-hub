import { test, expect } from '@playwright/test';
import { login, TEST_USER, ensureLoggedOut } from './helpers/auth';
import { generateTestTodo, generateTestNote, generateTestEvent } from './helpers/test-data';

test.describe('Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set English locale and viewport for consistent screenshots
    await page.context().addCookies([{ name: 'locale', value: 'en', domain: 'localhost', path: '/' }]);
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // Ensure clean state
    await ensureLoggedOut(page);
  });

  test('should match login page layout', async ({ page }) => {
    await page.goto('/login');
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500); // Allow animations to complete
    
    // Take full page screenshot
    await expect(page).toHaveScreenshot('login-page.png', {
      fullPage: true,
      animations: 'disabled'
    });
    
    // Test specific elements
    await expect(page.locator('.bg-white\\/10.backdrop-blur-xl')).toHaveScreenshot('login-form.png');
  });

  test('should match register page layout', async ({ page }) => {
    await page.goto('/register');
    
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    
    await expect(page).toHaveScreenshot('register-page.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('should match forgot password page layout', async ({ page }) => {
    await page.goto('/forgot-password');
    
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    
    await expect(page).toHaveScreenshot('forgot-password-page.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('should match dashboard layout when authenticated', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await login(page, TEST_USER.email, TEST_USER.password);
    
    // Navigate to dashboard
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000); // Allow dashboard to load
    
    // Hide dynamic content that changes frequently
    await page.addStyleTag({
      content: `
        .relative time,
        [data-testid="current-time"],
        .text-muted-foreground:has-text("ago"),
        .text-muted-foreground:has-text("minutes"),
        .text-muted-foreground:has-text("hours")
        { visibility: hidden !important; }
      `
    });
    
    await expect(page).toHaveScreenshot('dashboard-page.png', {
      fullPage: true,
      animations: 'disabled'
    });
    
    // Test individual dashboard cards
    await expect(page.locator('.grid.gap-6').first()).toHaveScreenshot('dashboard-stats-cards.png');
  });

  test('should match todos page layout', async ({ page }) => {
    // Login and navigate to todos
    await page.goto('/login');
    await login(page, TEST_USER.email, TEST_USER.password);
    await page.goto('/todos');
    
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    
    // Create a sample todo for consistent layout
    const testTodo = generateTestTodo('visual');
    await page.getByRole('button', { name: 'Add TODO' }).click();
    await page.fill('input[name="title"]', testTodo.title);
    await page.fill('textarea[name="description"]', testTodo.description || '');
    await page.selectOption('select[name="priority"]', 'HIGH');
    await page.getByRole('button', { name: 'Create' }).click();
    
    // Wait for todo to appear
    await page.waitForSelector(`text=${testTodo.title}`);
    
    // Hide timestamps and dynamic content
    await page.addStyleTag({
      content: `
        .text-muted-foreground:has-text("ago"),
        .text-muted-foreground:has-text("Created"),
        time { visibility: hidden !important; }
      `
    });
    
    await expect(page).toHaveScreenshot('todos-page.png', {
      fullPage: true,
      animations: 'disabled'
    });
    
    // Test todo card layout
    const todoCard = page.locator('.bg-card').filter({ hasText: testTodo.title });
    await expect(todoCard).toHaveScreenshot('todo-card.png');
    
    // Clean up
    await todoCard.locator('button svg').last().click();
    await page.locator('button').filter({ hasText: 'Delete' }).click();
    await page.getByRole('button', { name: 'Delete' }).click();
  });

  test('should match todo creation modal', async ({ page }) => {
    // Login and navigate to todos
    await page.goto('/login');
    await login(page, TEST_USER.email, TEST_USER.password);
    await page.goto('/todos');
    
    // Open create modal
    await page.getByRole('button', { name: 'Add TODO' }).click();
    
    await page.waitForTimeout(300); // Allow modal animation
    
    // Test modal layout
    await expect(page.locator('[role="dialog"]')).toHaveScreenshot('todo-create-modal.png');
  });

  test('should match calendar page layout', async ({ page }) => {
    // Login and navigate to calendar
    await page.goto('/login');
    await login(page, TEST_USER.email, TEST_USER.password);
    await page.goto('/calendar');
    
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    
    // Create a test event for consistent layout
    const testEvent = generateTestEvent('visual');
    await page.getByRole('button', { name: 'New Event' }).click();
    await page.fill('input[name="title"]', testEvent.title);
    await page.locator('input[name="allDay"]').check();
    await page.getByRole('button', { name: 'Create' }).click();
    
    // Wait for event to appear
    await page.waitForSelector(`text=${testEvent.title}`);
    
    await expect(page).toHaveScreenshot('calendar-page.png', {
      fullPage: true,
      animations: 'disabled'
    });
    
    // Test calendar grid
    await expect(page.locator('.grid.grid-cols-7').first()).toHaveScreenshot('calendar-grid.png');
    
    // Clean up event
    await page.locator('.text-xs.p-1.rounded').filter({ hasText: testEvent.title }).click();
    await page.getByRole('button', { name: 'Delete' }).click();
    await page.getByRole('button', { name: 'Delete' }).click();
  });

  test('should match notes page layout', async ({ page }) => {
    // Login and navigate to notes
    await page.goto('/login');
    await login(page, TEST_USER.email, TEST_USER.password);
    await page.goto('/notes');
    
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    
    // Create a sample note for consistent layout
    const testNote = generateTestNote('visual');
    await page.getByRole('button', { name: 'New Note' }).click();
    await page.fill('input[name="title"]', testNote.title);
    await page.fill('textarea[name="content"]', testNote.content);
    for (const tag of testNote.tags || []) {
      await page.fill('input[placeholder="Enter new tag"]', tag);
      await page.keyboard.press('Enter');
    }
    await page.getByRole('button', { name: 'Create' }).click();
    
    // Wait for note to appear
    await page.waitForSelector(`text=${testNote.title}`);
    
    // Hide timestamps
    await page.addStyleTag({
      content: `
        .text-muted-foreground:has-text("ago"),
        time { visibility: hidden !important; }
      `
    });
    
    await expect(page).toHaveScreenshot('notes-page.png', {
      fullPage: true,
      animations: 'disabled'
    });
    
    // Test note card
    const noteCard = page.locator('.bg-card').filter({ hasText: testNote.title });
    await expect(noteCard).toHaveScreenshot('note-card.png');
    
    // Clean up
    await noteCard.locator('button svg.lucide-trash-2').click();
    await page.getByRole('button', { name: 'Delete' }).click();
  });

  test('should match goals page layout', async ({ page }) => {
    // Login and navigate to goals
    await page.goto('/login');
    await login(page, TEST_USER.email, TEST_USER.password);
    await page.goto('/goals');
    
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    
    await expect(page).toHaveScreenshot('goals-page.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('should match profile page layout', async ({ page }) => {
    // Login and navigate to profile
    await page.goto('/login');
    await login(page, TEST_USER.email, TEST_USER.password);
    await page.goto('/profile');
    
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    
    // Hide dynamic timestamp content
    await page.addStyleTag({
      content: `
        .text-lg:has-text("/"),
        p:has-text("/") { 
          color: transparent !important; 
        }
        p:has-text("/")::after {
          content: "01/01/2024";
          color: inherit;
        }
      `
    });
    
    await expect(page).toHaveScreenshot('profile-page.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('should match dark mode layouts', async ({ page }) => {
    // Enable dark mode
    await page.emulateMedia({ colorScheme: 'dark' });
    
    // Login
    await page.goto('/login');
    await login(page, TEST_USER.email, TEST_USER.password);
    
    // Test dashboard in dark mode
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Hide dynamic content
    await page.addStyleTag({
      content: `
        .relative time,
        .text-muted-foreground:has-text("ago") { visibility: hidden !important; }
      `
    });
    
    await expect(page).toHaveScreenshot('dashboard-dark-mode.png', {
      fullPage: true,
      animations: 'disabled'
    });
    
    // Test todos in dark mode
    await page.goto('/todos');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('todos-dark-mode.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('should match error states', async ({ page }) => {
    // Test 404 page
    await page.goto('/non-existent-page');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('404-page.png', {
      fullPage: true,
      animations: 'disabled'
    });
    
    // Test login error state
    await page.goto('/login');
    await page.fill('input[type="email"]', 'invalid@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.getByRole('button', { name: 'Login' }).click();
    
    // Wait for error message
    await page.waitForSelector('.text-red-500, [role="alert"]', { timeout: 5000 });
    
    await expect(page).toHaveScreenshot('login-error.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('should match modal layouts', async ({ page }) => {
    // Login
    await page.goto('/login');
    await login(page, TEST_USER.email, TEST_USER.password);
    
    // Test various modals
    const modals = [
      {
        page: '/todos',
        trigger: () => page.getByRole('button', { name: 'Add TODO' }).click(),
        name: 'todo-modal'
      },
      {
        page: '/notes',
        trigger: () => page.getByRole('button', { name: 'New Note' }).click(),
        name: 'note-modal'
      },
      {
        page: '/calendar',
        trigger: () => page.getByRole('button', { name: 'New Event' }).click(),
        name: 'event-modal'
      }
    ];
    
    for (const modal of modals) {
      await page.goto(modal.page);
      await page.waitForLoadState('networkidle');
      await modal.trigger();
      await page.waitForTimeout(300); // Modal animation
      
      await expect(page.locator('[role="dialog"]')).toHaveScreenshot(`${modal.name}.png`);
      
      // Close modal
      await page.keyboard.press('Escape');
    }
  });

  test('should match responsive layouts on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Login
    await page.goto('/login');
    await login(page, TEST_USER.email, TEST_USER.password);
    
    // Test mobile dashboard
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Hide dynamic content
    await page.addStyleTag({
      content: `
        .relative time,
        .text-muted-foreground:has-text("ago") { visibility: hidden !important; }
      `
    });
    
    await expect(page).toHaveScreenshot('dashboard-mobile.png', {
      fullPage: true,
      animations: 'disabled'
    });
    
    // Test mobile navigation
    await page.locator('button[aria-label*="menu"], button').filter({ 
      has: page.locator('svg.lucide-menu') 
    }).click();
    
    await page.waitForTimeout(300);
    
    await expect(page).toHaveScreenshot('mobile-navigation.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('should match component states', async ({ page }) => {
    // Login
    await page.goto('/login');
    await login(page, TEST_USER.email, TEST_USER.password);
    
    // Test loading states by mocking slow API
    await page.route('**/api/v1/**', async route => {
      await new Promise(resolve => setTimeout(resolve, 500));
      await route.continue();
    });
    
    await page.goto('/todos');
    
    // Take screenshot of loading state
    await expect(page.locator('.animate-spin, .loading')).toHaveScreenshot('loading-state.png');
    
    // Test empty states
    await page.goto('/todos');
    await page.waitForLoadState('networkidle');
    
    // If no todos exist, test empty state
    const emptyState = page.locator('text=No TODOs found');
    if (await emptyState.isVisible()) {
      await expect(page.locator('.text-center')).toHaveScreenshot('empty-todos.png');
    }
  });
});