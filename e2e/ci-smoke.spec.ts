import { test, expect } from '@playwright/test';

test.describe('CI Smoke Tests', () => {
  test('should load the application', async ({ page }) => {
    await page.goto('/');
    
    // Should redirect to login when not authenticated
    await expect(page).toHaveURL(/.*\/login/);
    await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
  });

  test('should show login form elements', async ({ page }) => {
    await page.goto('/login');
    
    await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.getByRole('button', { name: /Sign in/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Sign up/i })).toBeVisible();
  });

  test('should show register form elements', async ({ page }) => {
    await page.goto('/register');
    
    await expect(page.getByRole('heading', { name: 'Create an account' })).toBeVisible();
    await expect(page.locator('input[name="username"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('input[name="confirmPassword"]')).toBeVisible();
    await expect(page.getByRole('button', { name: /Create account/i })).toBeVisible();
  });

  test('should navigate between login and register', async ({ page }) => {
    await page.goto('/login');
    
    // Click sign up link
    await page.getByRole('link', { name: /Sign up/i }).click();
    await expect(page).toHaveURL(/.*\/register/);
    
    // Click sign in link
    await page.getByRole('link', { name: /Sign in/i }).click();
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('should validate login form', async ({ page }) => {
    await page.goto('/login');
    
    // Try to submit empty form
    await page.getByRole('button', { name: /Sign in/i }).click();
    
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

  if (process.env.CI) {
    test('should handle mock login', async ({ page }) => {
      await page.goto('/login');
      
      // Use mock credentials
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="password"]', 'Test123');
      await page.click('button[type="submit"]');
      
      // Should redirect to home
      await expect(page).toHaveURL('/');
      await expect(page.getByRole('heading', { name: 'TODO App' })).toBeVisible();
    });
  }
});