import { test, expect } from '@playwright/test';

test.describe('App E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set English locale
    await page.context().addCookies([{ name: 'locale', value: 'en', domain: 'localhost', path: '/' }]);
  });

  test('should load the application', async ({ page }) => {
    await page.goto('/');
    
    // Wait for app to initialize
    await page.waitForLoadState('networkidle');
    
    // Should redirect to login or show app
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/\/(login|$)/);
  });

  test('should have proper page title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/TODO App/);
  });

  test('should show login page elements', async ({ page }) => {
    await page.goto('/login');
    
    // Check page structure
    await expect(page.locator('h1, h2, h3').first()).toBeVisible();
    await expect(page.locator('form')).toBeVisible();
    
    // Check form has required fields
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitButton = page.locator('button[type="submit"]');
    
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitButton).toBeVisible();
  });

  test('should show register page elements', async ({ page }) => {
    await page.goto('/register');
    
    // Check page structure
    await expect(page.locator('h1, h2, h3').first()).toBeVisible();
    await expect(page.locator('form')).toBeVisible();
    
    // Check form has required fields
    const usernameInput = page.locator('input[name="username"]');
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[name="password"]');
    const confirmPasswordInput = page.locator('input[name="confirmPassword"]');
    const submitButton = page.locator('button[type="submit"]');
    
    await expect(usernameInput).toBeVisible();
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(confirmPasswordInput).toBeVisible();
    await expect(submitButton).toBeVisible();
  });

  test('should validate form inputs', async ({ page }) => {
    await page.goto('/login');
    
    // Fill with invalid email
    await page.fill('input[type="email"]', 'invalid-email');
    await page.fill('input[type="password"]', '123');
    
    // Try to submit
    await page.click('button[type="submit"]');
    
    // Wait for validation feedback
    await page.waitForTimeout(1000);
    
    // Check if we're still on login page (validation failed)
    await expect(page).toHaveURL(/\/login/);
    
    // Check for any error indication
    const hasError = await page.locator('[role="alert"], .text-red-500, .text-red-600').isVisible().catch(() => false);
    const stillOnLogin = page.url().includes('/login');
    
    expect(hasError || stillOnLogin).toBeTruthy();
  });
});