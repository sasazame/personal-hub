import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test.beforeEach(async ({ page, context }) => {
    // Clear all cookies and localStorage to ensure clean state
    await context.clearCookies();
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    
    // Set English locale for consistent test assertions
    await context.addCookies([{ name: 'locale', value: 'en', domain: 'localhost', path: '/' }]);
  });

  test('should load the application successfully', async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
    
    // Wait for any "Loading..." text to disappear (AuthGuard loading state)
    await page.waitForFunction(() => {
      const loadingElements = document.body.innerText.includes('Loading...');
      return !loadingElements;
    }, { timeout: 10000 });
    
    // Check basic page properties
    await expect(page).toHaveTitle(/Personal Hub/);
    
    // Since we're not authenticated, we should be redirected to login
    // Wait for the URL to change to login page
    await page.waitForURL(/\/login/, { timeout: 15000 });
    
    // Verify we're on the login page
    await expect(page).toHaveURL(/\/login/);
    
    // Check that login page loads properly - look for the login heading
    await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
    
    // Also verify the login form elements are present
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.getByRole('button', { name: /login/i })).toBeVisible();
    
    // Check that the page doesn't show critical errors
    await expect(page.locator('body')).not.toContainText('Application error');
    await expect(page.locator('body')).not.toContainText('500');
    await expect(page.locator('body')).not.toContainText('This page could not be found');
    
    // Basic success: page loads and has content
    const hasContent = await page.locator('body').textContent();
    expect(hasContent).toBeTruthy();
    expect(hasContent!.length).toBeGreaterThan(10);
  });
});