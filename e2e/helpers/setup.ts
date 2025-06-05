import { Page } from '@playwright/test';
import { TEST_USER } from './auth';

export async function setupTestUser(page: Page) {
  // In CI environment, we'll use a mock API
  // In local environment, we need to ensure user exists
  
  if (process.env.CI) {
    // CI: Mock API will handle auth
    return;
  }
  
  // Local: Try to register user first (might already exist)
  try {
    await page.goto('/register');
    await page.waitForSelector('input[name="username"]', { timeout: 5000 });
    
    await page.fill('input[name="username"]', TEST_USER.username);
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[name="password"]', TEST_USER.password);
    await page.fill('input[name="confirmPassword"]', TEST_USER.password);
    
    await page.click('button[type="submit"]');
    
    // Wait for either success or error
    await page.waitForTimeout(2000);
  } catch (error) {
    // User might already exist, that's okay
    console.log('User registration skipped (might already exist)');
  }
}

export async function waitForApp(page: Page) {
  // Wait for the app to be ready
  await page.waitForLoadState('networkidle');
  
  // Additional wait for React hydration
  await page.waitForTimeout(1000);
  
  // Check if we're authenticated or on auth page
  const isAuthPage = page.url().includes('/login') || page.url().includes('/register');
  const hasLogoutButton = await page.locator('button:has-text("Logout")').isVisible({ timeout: 2000 }).catch(() => false);
  
  if (!isAuthPage && !hasLogoutButton) {
    // We should be redirected to login
    await page.waitForURL(/.*\/(login|register)/, { timeout: 5000 });
  }
}