import { test, expect } from '@playwright/test';
import { setupTestUser, createUniqueTestUser } from './helpers/setup';
import { ensureLoggedOut, login, TEST_USER } from './helpers/auth';

test.describe('Auth E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set English locale and ensure clean state
    await page.context().addCookies([{ name: 'locale', value: 'en', domain: 'localhost', path: '/' }]);
    await ensureLoggedOut(page);
  });

  test('should redirect to login when not authenticated', async ({ page }) => {
    await page.goto('/');
    
    // Wait for redirect to complete
    await page.waitForURL('**/login**', { timeout: 10000 });
    
    // Should be on login page
    await expect(page).toHaveURL(/.*\/login/);
    
    // Should see login form
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('button:has-text("Login")')).toBeVisible();
  });

  test('should show login form', async ({ page }) => {
    await page.goto('/login');
    
    // Check form elements are visible
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
  });

  test('should handle login attempt with existing user', async ({ page }) => {
    // Ensure TEST_USER exists
    await setupTestUser(page);
    
    // Now test login
    await page.goto('/login');
    
    try {
      await login(page, TEST_USER.email, TEST_USER.password);
      
      // Should be redirected to home page
      await expect(page).toHaveURL('/');
      
      // Wait for header to appear
      await page.waitForSelector('header', { timeout: 10000 });
      await expect(page.locator('header').filter({ hasText: 'TODO App' })).toBeVisible();
      
      console.log('Login test passed successfully');
    } catch (error) {
      console.log('Login test failed:', error);
      throw error;
    }
  });
  
  test('should handle login with new unique user', async ({ page }) => {
    // Create a unique user for this test
    const uniqueUser = await createUniqueTestUser(page);
    
    // Now test login with the unique user
    await page.goto('/login');
    
    try {
      await login(page, uniqueUser.email, uniqueUser.password);
      
      // Should be redirected to home page
      await expect(page).toHaveURL('/');
      
      // Wait for header to appear
      await page.waitForSelector('header', { timeout: 10000 });
      await expect(page.locator('header').filter({ hasText: 'TODO App' })).toBeVisible();
      
      console.log('Login with unique user test passed successfully');
    } catch (error) {
      console.log('Login with unique user test failed:', error);
      throw error;
    }
  });

  test('should navigate between login and register', async ({ page }) => {
    await page.goto('/login');
    
    // Wait for page to load
    await page.waitForSelector('h1:has-text("Login")', { timeout: 10000 });
    
    // Click register link - try different selectors
    try {
      // Try link with text "Register"
      await page.getByRole('link', { name: 'Register' }).click();
    } catch {
      // Fallback: try href attribute
      await page.click('a[href="/register"]');
    }
    
    await expect(page).toHaveURL(/\/register/);
    
    // Go back to login
    try {
      await page.getByRole('link', { name: 'Login' }).click();
    } catch {
      // Fallback: try href attribute
      await page.click('a[href="/login"]');
    }
    
    await expect(page).toHaveURL(/\/login/);
  });
});