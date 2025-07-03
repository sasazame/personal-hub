import { test, expect } from '@playwright/test';
import { login, logout, ensureLoggedOut, TEST_USER } from './helpers/auth';
import { setupTestUser, waitForApp, createUniqueTestUser } from './helpers/setup';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Set English locale and ensure clean state
    await page.context().addCookies([{ name: 'locale', value: 'en', domain: 'localhost', path: '/' }]);
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

  test('should login successfully with existing user', async ({ page }) => {
    // Ensure TEST_USER exists
    await setupTestUser(page);
    
    await page.goto('/login');
    await waitForApp(page);
    
    console.log('Before login - URL:', page.url());
    
    // Perform login
    await login(page, TEST_USER.email, TEST_USER.password);
    console.log('Login completed successfully');
    
    console.log('After login - URL:', page.url());
    
    // Should be redirected to main app (dashboard)
    await expect(page).toHaveURL('/');
    
    // Wait for dashboard to load
    await page.waitForLoadState('domcontentloaded');
    
    // Wait for the app to fully load and check for the header
    await page.waitForSelector('header', { timeout: 10000 });
    
    // Should see app header with Personal Hub text - using flexible selector
    await expect(page.locator('header').filter({ hasText: 'Personal Hub' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Logout' }).first()).toBeVisible();
  });
  
  test('should login successfully with unique user', async ({ page }) => {
    // Create a unique user for this test
    const uniqueUser = await createUniqueTestUser(page);
    
    await page.goto('/login');
    await waitForApp(page);
    
    console.log('Before login with unique user - URL:', page.url());
    
    // Perform login
    await login(page, uniqueUser.email, uniqueUser.password);
    console.log('Login with unique user completed successfully');
    
    console.log('After login - URL:', page.url());
    
    // Should be redirected to main app (dashboard)
    await expect(page).toHaveURL('/');
    
    // Wait for dashboard to load
    await page.waitForLoadState('domcontentloaded');
    
    // Wait for the app to fully load and check for the header
    await page.waitForSelector('header', { timeout: 10000 });
    
    // Should see app header with Personal Hub text - using flexible selector
    await expect(page.locator('header').filter({ hasText: 'Personal Hub' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Logout' }).first()).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    // Create a unique user for this test
    const uniqueUser = await createUniqueTestUser(page);
    
    // First login
    await page.goto('/login');
    await waitForApp(page);
    await login(page, uniqueUser.email, uniqueUser.password);
    
    // Wait for app to load
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('header', { timeout: 10000 });
    await expect(page.locator('header').filter({ hasText: 'Personal Hub' })).toBeVisible();
    
    // Logout
    await logout(page);
    
    // Should be redirected to login
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('should persist authentication across page reloads', async ({ page }) => {
    // Create a unique user for this test
    const uniqueUser = await createUniqueTestUser(page);
    
    // Login
    await page.goto('/login');
    await waitForApp(page);
    await login(page, uniqueUser.email, uniqueUser.password);
    
    // Verify logged in
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('header', { timeout: 10000 });
    await expect(page.locator('header').filter({ hasText: 'Personal Hub' })).toBeVisible();
    
    // Reload page
    await page.reload();
    
    // Wait for reload to complete - don't use waitForApp as it expects unauthenticated state
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000); // Wait for React hydration
    
    // Should still be logged in
    await page.waitForSelector('header', { timeout: 10000 });
    await expect(page.locator('header').filter({ hasText: 'Personal Hub' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Logout' }).first()).toBeVisible();
  });
});