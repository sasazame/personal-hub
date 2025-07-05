import { test, expect } from '@playwright/test';
import { navigateToProtectedRoute } from './helpers/wait-helpers';

test.describe('CI Smoke Tests', () => {
  test.beforeEach(async ({ page, context }) => {
    // Clear all cookies and localStorage to ensure clean state
    await context.clearCookies();
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    
    // Set English locale
    await page.context().addCookies([{ name: 'locale', value: 'en', domain: 'localhost', path: '/' }]);
  });

  test('should load the application', async ({ page }) => {
    await navigateToProtectedRoute(page, '/');
    
    // Should redirect to login when not authenticated
    await expect(page).toHaveURL(/.*\/login/);
    await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
  });

  test('should show login form elements', async ({ page }) => {
    await page.goto('/login');
    
    await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.getByRole('button', { name: /Login/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Register/i })).toBeVisible();
  });

  test('should show register form elements', async ({ page }) => {
    await page.goto('/register');
    
    await expect(page.getByRole('heading', { name: 'Create account' })).toBeVisible();
    await expect(page.locator('input[name="username"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('input[name="confirmPassword"]')).toBeVisible();
    await expect(page.getByRole('button', { name: /Create account/i })).toBeVisible();
  });

  test('should navigate between login and register', async ({ page }) => {
    await page.goto('/login');
    
    // Click register link and wait for navigation
    await Promise.all([
      page.waitForURL(/.*\/register/),
      page.getByRole('link', { name: /Register/i }).click()
    ]);
    
    await expect(page).toHaveURL(/.*\/register/);
    
    // Click login link and wait for navigation
    await Promise.all([
      page.waitForURL(/.*\/login/),
      page.getByRole('link', { name: /Login/i }).click()
    ]);
    
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('should validate login form', async ({ page }) => {
    await page.goto('/login');
    
    // Try to submit empty form
    await page.getByRole('button', { name: /Login/i }).click();
    
    // Should show validation errors
    await expect(page.getByText(/Email is required/i)).toBeVisible();
    await expect(page.getByText(/Password is required/i)).toBeVisible();
  });

  test('should validate register form', async ({ page }) => {
    await page.goto('/register');
    
    // Try to submit empty form
    await page.getByRole('button', { name: /Create account/i }).click();
    
    // Should show validation errors
    await expect(page.getByText(/Username must be at least 3 characters/i)).toBeVisible();
  });

  test('should handle mock login @ci', async ({ page }) => {
    // Skip this test if not in CI mode
    test.skip(!process.env.CI, 'This test only runs in CI mode');
    
    await page.goto('/login');
    
    // Wait for login form to be ready
    await page.waitForSelector('input[name="email"]', { state: 'visible' });
    
    // Use mock credentials
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'Test123');
    
    // Click login button
    const loginButton = page.getByRole('button', { name: /login/i });
    await loginButton.click();
    
    // Wait for either navigation or error message
    await Promise.race([
      page.waitForURL('/', { timeout: 15000 }),
      page.waitForSelector('.text-red-500', { timeout: 15000 }) // Error message selector
    ]);
    
    // If we successfully navigated, verify we're on the dashboard
    if (page.url().endsWith('/')) {
      // Check for dashboard content
      await expect(page.getByText('Welcome to Personal Hub')).toBeVisible({ timeout: 10000 });
    } else {
      // If login failed, log the error for debugging
      const errorElement = await page.$('.text-red-500');
      if (errorElement) {
        const errorText = await errorElement.textContent();
        console.error('Login failed with error:', errorText);
      }
      throw new Error('Mock login failed - check MSW handlers and credentials');
    }
  });
});