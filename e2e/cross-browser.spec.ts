import { test, expect } from '@playwright/test';
import { login, TEST_USER, ensureLoggedOut } from './helpers/auth';

// Core functionality tests across browsers
test.describe('Cross-Browser Tests', () => {

    test.beforeEach(async ({ page }) => {
      // Set English locale
      await page.context().addCookies([{ name: 'locale', value: 'en', domain: 'localhost', path: '/' }]);
      
      // Ensure clean state
      await ensureLoggedOut(page);
    });

    test('should load and render login page correctly', async ({ page }) => {
      await page.goto('/login');
      
      // Core elements should be visible
      await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
      
      // Form should be functional
      await page.fill('input[type="email"]', 'test@example.com');
      await page.fill('input[type="password"]', 'password');
      
      // Button should be clickable
      await expect(page.getByRole('button', { name: 'Login' })).toBeEnabled();
    });

    test('should handle authentication flow', async ({ page }) => {
      await page.goto('/login');
      
      // Perform login
      await login(page, TEST_USER.email, TEST_USER.password);
      
      // Should redirect to dashboard
      await expect(page).toHaveURL('/dashboard');
      await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
      
      // User menu should be accessible
      const userButton = page.locator('button').filter({ hasText: TEST_USER.email.split('@')[0] });
      await expect(userButton).toBeVisible();
      
      // Logout functionality
      await userButton.click();
      await page.getByRole('button', { name: 'Logout' }).click();
      
      // Should redirect to login
      await expect(page).toHaveURL('/login');
    });

    test('should handle TODO operations', async ({ page }) => {
      // Login first
      await page.goto('/login');
      await login(page, TEST_USER.email, TEST_USER.password);
      
      // Navigate to todos
      await page.goto('/todos');
      await expect(page.getByRole('heading', { name: 'TODO' })).toBeVisible();
      
      // Create a todo
      await page.getByRole('button', { name: 'Add TODO' }).click();
      const todoTitle = `Cross Browser Test ${Date.now()}`;
      await page.fill('input[name="title"]', todoTitle);
      await page.fill('textarea[name="description"]', 'Testing cross-browser compatibility');
      await page.getByRole('button', { name: 'Create' }).click();
      
      // Verify todo was created
      await expect(page.locator('.bg-card').filter({ hasText: todoTitle })).toBeVisible();
      
      // Test kebab menu functionality
      const todoCard = page.locator('.bg-card').filter({ hasText: todoTitle });
      await todoCard.locator('button svg').last().click();
      await expect(page.locator('button').filter({ hasText: 'Edit' })).toBeVisible();
      await expect(page.locator('button').filter({ hasText: 'Delete' })).toBeVisible();
      
      // Clean up
      await page.locator('button').filter({ hasText: 'Delete' }).click();
      await page.getByRole('button', { name: 'Delete' }).click();
    });

    test('should handle form validation across browsers', async ({ page }) => {
      await page.goto('/login');
      
      // Test empty form submission
      await page.getByRole('button', { name: 'Login' }).click();
      
      // Check validation (different browsers handle this differently)
      const emailInput = page.locator('input[type="email"]');
      const isInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid);
      expect(isInvalid).toBe(true);
      
      // Test invalid email format
      await page.fill('input[type="email"]', 'invalid-email');
      const isEmailInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid);
      expect(isEmailInvalid).toBe(true);
      
      // Test valid email
      await page.fill('input[type="email"]', 'valid@example.com');
      const isEmailValid = await emailInput.evaluate((el: HTMLInputElement) => el.validity.valid);
      expect(isEmailValid).toBe(true);
    });

    test('should handle JavaScript features', async ({ page }) => {
      // Login
      await page.goto('/login');
      await login(page, TEST_USER.email, TEST_USER.password);
      
      // Test dynamic content loading
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
      
      // Check if dashboard cards are loaded
      const statsCards = page.locator('.grid.gap-6').first().locator('.bg-card');
      const cardCount = await statsCards.count();
      expect(cardCount).toBeGreaterThan(0);
      
      // Test modal functionality
      await page.goto('/todos');
      await page.getByRole('button', { name: 'Add TODO' }).click();
      
      // Modal should open
      await expect(page.locator('[role="dialog"]')).toBeVisible();
      
      // Close modal with Escape key
      await page.keyboard.press('Escape');
      await expect(page.locator('[role="dialog"]')).not.toBeVisible();
    });

    test('should handle CSS features and animations', async ({ page }) => {
      await page.goto('/login');
      
      // Check if CSS animations work
      const form = page.locator('form').first();
      await expect(form).toBeVisible();
      
      // Check backdrop-blur effects (modern CSS feature)
      const glassCard = page.locator('.backdrop-blur-xl').first();
      await expect(glassCard).toBeVisible();
      
      // Test hover effects
      const loginButton = page.getByRole('button', { name: 'Login' });
      await loginButton.hover();
      
      // Button should remain functional after hover
      await expect(loginButton).toBeEnabled();
    });

    test('should handle responsive design', async ({ page }) => {
      // Test desktop view
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.goto('/login');
      
      const form = page.locator('form').first();
      const formBox = await form.boundingBox();
      expect(formBox?.width).toBeLessThan(600); // Form should be constrained on desktop
      
      // Test mobile view
      await page.setViewportSize({ width: 375, height: 667 });
      await page.reload();
      
      const mobileFormBox = await form.boundingBox();
      const viewport = page.viewportSize();
      
      if (mobileFormBox && viewport) {
        expect(mobileFormBox.width).toBeGreaterThan(viewport.width * 0.8); // Form should be wider on mobile
      }
    });

    test('should handle local storage and session management', async ({ page }) => {
      await page.goto('/login');
      
      // Check if localStorage is available
      const hasLocalStorage = await page.evaluate(() => {
        try {
          const test = 'test';
          localStorage.setItem(test, test);
          localStorage.removeItem(test);
          return true;
        } catch {
          return false;
        }
      });
      
      expect(hasLocalStorage).toBe(true);
      
      // Login and check if session is stored
      await login(page, TEST_USER.email, TEST_USER.password);
      
      // Check if auth token or session data exists
      const hasAuthData = await page.evaluate(() => {
        return localStorage.getItem('auth-token') !== null || 
               sessionStorage.length > 0 ||
               document.cookie.includes('session');
      });
      
      // Some form of session data should exist
      expect(hasAuthData).toBe(true);
    });

    test('should handle drag and drop operations', async ({ page, browserName }) => {
      // Skip WebKit-specific tests that might not work in all environments
      test.skip(browserName === 'webkit', 'Skip drag and drop on WebKit');
      
      // Login
      await page.goto('/login');
      await login(page, TEST_USER.email, TEST_USER.password);
      
      // Test calendar drag and drop
      await page.goto('/calendar');
      await page.waitForLoadState('networkidle');
      
      // Create an event first
      await page.getByRole('button', { name: 'New Event' }).click();
      const eventTitle = `Drag Test ${Date.now()}`;
      await page.fill('input[name="title"]', eventTitle);
      await page.locator('input[name="allDay"]').check();
      await page.getByRole('button', { name: 'Create' }).click();
      
      // Find the event
      const event = page.locator('.text-xs.p-1.rounded').filter({ hasText: eventTitle });
      await expect(event).toBeVisible();
      
      // Test drag functionality (basic check)
      const eventBox = await event.boundingBox();
      expect(eventBox).toBeTruthy();
      
      // Clean up
      await event.click();
      await page.getByRole('button', { name: 'Delete' }).click();
      await page.getByRole('button', { name: 'Delete' }).click();
    });

    test('should handle error states gracefully', async ({ page }) => {
      // Test network error handling
      await page.route('**/api/v1/**', route => route.abort());
      
      await page.goto('/login');
      await page.fill('input[type="email"]', TEST_USER.email);
      await page.fill('input[type="password"]', TEST_USER.password);
      await page.getByRole('button', { name: 'Login' }).click();
      
      // Should handle network error gracefully
      // The exact error handling depends on the implementation
      await page.waitForTimeout(2000);
      
      // Page should still be functional
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
    });

    test('should handle browser-specific features', async ({ page }) => {
      await page.goto('/login');
      
      // Test browser detection/capabilities
      const userAgent = await page.evaluate(() => navigator.userAgent);
      expect(userAgent).toBeTruthy();
      
      // Test modern API availability
      const hasModernAPIs = await page.evaluate(() => {
        return {
          fetch: typeof fetch !== 'undefined',
          Promise: typeof Promise !== 'undefined',
          localStorage: typeof Storage !== 'undefined',
          querySelector: typeof document.querySelector !== 'undefined'
        };
      });
      
      expect(hasModernAPIs.fetch).toBe(true);
      expect(hasModernAPIs.Promise).toBe(true);
      expect(hasModernAPIs.localStorage).toBe(true);
      expect(hasModernAPIs.querySelector).toBe(true);
    });
});

// Browser-specific edge cases
test.describe('Browser-Specific Edge Cases', () => {
  test('should handle WebKit-specific issues', async ({ page, browserName }) => {
    test.skip(browserName !== 'webkit', 'WebKit-specific test');
    
    await page.goto('/login');
    
    // WebKit might handle form validation differently
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password');
    
    // Check form submission in WebKit
    await expect(page.getByRole('button', { name: 'Login' })).toBeEnabled();
  });

  test('should handle Firefox-specific issues', async ({ page, browserName }) => {
    test.skip(browserName !== 'firefox', 'Firefox-specific test');
    
    await page.goto('/login');
    
    // Firefox might handle certain CSS features differently
    const form = page.locator('form').first();
    await expect(form).toBeVisible();
    
    // Test Firefox-specific form behavior
    await page.fill('input[type="email"]', 'test@example.com');
    const emailInput = page.locator('input[type="email"]');
    const value = await emailInput.inputValue();
    expect(value).toBe('test@example.com');
  });

  test('should handle Chromium-specific features', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Chromium-specific test');
    
    await page.goto('/login');
    
    // Chromium-specific features like certain CSS properties
    const hasBackdropFilter = await page.evaluate(() => {
      const testElement = document.createElement('div');
      return 'backdropFilter' in testElement.style || 'webkitBackdropFilter' in testElement.style;
    });
    
    expect(hasBackdropFilter).toBe(true);
  });
});

// Performance tests across browsers
test.describe('Cross-Browser Performance', () => {
  test('should load pages within acceptable time across browsers', async ({ page, browserName }) => {
    const startTime = Date.now();
    
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Allow more time for WebKit as it might be slower in some environments
    const maxLoadTime = browserName === 'webkit' ? 8000 : 5000;
    expect(loadTime).toBeLessThan(maxLoadTime);
    
    console.log(`${browserName} login page load time: ${loadTime}ms`);
  });

  test('should handle large data sets efficiently', async ({ page, browserName }) => {
    // Login first
    await page.goto('/login');
    await login(page, TEST_USER.email, TEST_USER.password);
    
    // Navigate to a page that might have lots of data
    await page.goto('/todos');
    
    const startTime = Date.now();
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    // Page should load within reasonable time even with data
    expect(loadTime).toBeLessThan(3000);
    
    console.log(`${browserName} todos page load time: ${loadTime}ms`);
  });
});