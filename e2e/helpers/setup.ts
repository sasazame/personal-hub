import { Page } from '@playwright/test';
import { TEST_USER } from './auth';

/**
 * Creates a unique test user for the current test
 * This prevents conflicts between tests
 */
export async function createUniqueTestUser(page: Page) {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  const shortId = `${timestamp}${random}`.slice(-8);
  
  const uniqueUser = {
    username: `test${shortId}`,
    email: `test${shortId}@example.com`,
    password: 'Password123!'
  };
  
  // Set English locale
  await page.context().addCookies([{ name: 'locale', value: 'en', domain: 'localhost', path: '/' }]);
  
  try {
    // Ensure MSW is ready
    await page.waitForTimeout(2000);
    
    await page.goto('/register');
    await page.waitForSelector('input[name="username"]', { timeout: 10000 });
    
    await page.fill('input[name="username"]', uniqueUser.username);
    await page.fill('input[type="email"]', uniqueUser.email);
    await page.fill('input[name="password"]', uniqueUser.password);
    await page.fill('input[name="confirmPassword"]', uniqueUser.password);
    
    await page.click('button[type="submit"]');
    
    // Wait for registration to complete - be more flexible with URL
    await page.waitForFunction(() => !window.location.pathname.includes('/register'), { timeout: 15000 });
    
    // Wait a bit for the page to stabilize
    await page.waitForTimeout(2000);
    
    // Try to find and click logout button - be more flexible
    const logoutButton = page.locator('button:has-text("Logout")').first();
    const logoutVisible = await logoutButton.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (logoutVisible) {
      await logoutButton.click();
      await page.waitForFunction(() => window.location.pathname.includes('/login'), { timeout: 10000 });
    }
    
    return uniqueUser;
  } catch (error) {
    console.log('Failed to create unique test user:', error);
    throw error;
  }
}

/**
 * Ensures the default TEST_USER exists in the backend
 * Only use this for tests that specifically need the TEST_USER
 */
export async function setupTestUser(page: Page) {
  // Always use MSW in test environment
  await page.waitForTimeout(2000); // Ensure MSW is ready
  
  // Set English locale
  await page.context().addCookies([{ name: 'locale', value: 'en', domain: 'localhost', path: '/' }]);
  
  // Check if user already exists by trying to login
  try {
    await page.goto('/login');
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    
    // Wait for login to complete
    await page.waitForFunction(() => !window.location.pathname.includes('/login'), { timeout: 10000 });
    
    // Wait for page to stabilize
    await page.waitForTimeout(1000);
    
    // Find and click logout button
    const logoutButton = page.locator('button:has-text("Logout")').first();
    const logoutVisible = await logoutButton.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (logoutVisible) {
      await logoutButton.click();
      await page.waitForFunction(() => window.location.pathname.includes('/login'), { timeout: 10000 });
      console.log('TEST_USER exists and is ready');
      return;
    }
  } catch (error) {
    console.log('Login attempt failed, will try registration:', error);
  }
  
  // Try to register user
  try {
    await page.goto('/register');
    await page.waitForSelector('input[name="username"]', { timeout: 10000 });
    
    await page.fill('input[name="username"]', TEST_USER.username);
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[name="password"]', TEST_USER.password);
    await page.fill('input[name="confirmPassword"]', TEST_USER.password);
    
    await page.click('button[type="submit"]');
    
    // Wait for registration to complete
    await page.waitForFunction(() => !window.location.pathname.includes('/register'), { timeout: 15000 });
    
    // Wait for page to stabilize
    await page.waitForTimeout(1000);
    
    // Find and click logout button
    const logoutButton = page.locator('button:has-text("Logout")').first();
    const logoutVisible = await logoutButton.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (logoutVisible) {
      await logoutButton.click();
      await page.waitForFunction(() => window.location.pathname.includes('/login'), { timeout: 10000 });
    }
    
    console.log('TEST_USER created successfully');
  } catch (error) {
    console.log('User registration result:', error);
  }
}

export async function waitForApp(page: Page) {
  // Wait for DOM to be ready (recommended instead of networkidle)
  await page.waitForLoadState('domcontentloaded');
  
  // Use web assertions to check app readiness
  await page.waitForSelector('[id="__next"], #__next, body > div', { timeout: 30000 });
  
  // Additional wait for React hydration
  await page.waitForTimeout(2000);
  
  // Check if we're authenticated or on auth page
  const isAuthPage = page.url().includes('/login') || page.url().includes('/register');
  
  // Wait for form elements on auth pages
  if (isAuthPage) {
    await page.waitForSelector('form', { timeout: 10000 });
  }
}