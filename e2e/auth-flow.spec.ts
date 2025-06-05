import { test, expect } from '@playwright/test';
import { login, logout, ensureLoggedOut, TEST_USER } from './helpers/auth';
import { setupTestUser, waitForApp } from './helpers/setup';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await setupTestUser(page);
    await ensureLoggedOut(page);
  });

  test('should redirect unauthenticated users to login', async ({ page }) => {
    // Try to access protected route
    await page.goto('/');
    await waitForApp(page);
    
    // Should be redirected to login
    await expect(page).toHaveURL(/.*\/login/);
    await expect(page.locator('h1, h2, h3').first()).toContainText(/Welcome|Sign in|Login/i);
  });

  test('should login successfully', async ({ page }) => {
    await page.goto('/login');
    await waitForApp(page);
    
    // Perform login
    await login(page, TEST_USER.email, TEST_USER.password);
    
    // Should be redirected to main app
    await expect(page).toHaveURL(/\/$|\/todos/);
    
    // Should see app header with user info
    await expect(page.locator('h1:has-text("TODO App")')).toBeVisible();
    await expect(page.locator('button:has-text("Logout")')).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    // First login
    await page.goto('/login');
    await waitForApp(page);
    await login(page, TEST_USER.email, TEST_USER.password);
    
    // Wait for app to load
    await expect(page.locator('h1:has-text("TODO App")')).toBeVisible();
    
    // Logout
    await logout(page);
    
    // Should be redirected to login
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('should persist authentication across page reloads', async ({ page }) => {
    // Login
    await page.goto('/login');
    await waitForApp(page);
    await login(page, TEST_USER.email, TEST_USER.password);
    
    // Verify logged in
    await expect(page.locator('h1:has-text("TODO App")')).toBeVisible();
    
    // Reload page
    await page.reload();
    await waitForApp(page);
    
    // Should still be logged in
    await expect(page.locator('h1:has-text("TODO App")')).toBeVisible();
    await expect(page.locator('button:has-text("Logout")')).toBeVisible();
  });
});