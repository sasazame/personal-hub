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
    await page.goto('/register');
    await page.waitForSelector('input[name="username"]', { timeout: 5000 });
    
    await page.fill('input[name="username"]', uniqueUser.username);
    await page.fill('input[type="email"]', uniqueUser.email);
    await page.fill('input[name="password"]', uniqueUser.password);
    await page.fill('input[name="confirmPassword"]', uniqueUser.password);
    
    await page.click('button[type="submit"]');
    
    // Wait for registration to complete
    await page.waitForURL('/', { timeout: 10000 });
    
    // Logout to prepare for the actual test
    await page.getByRole('button', { name: 'Logout' }).first().click();
    await page.waitForURL(/.*\/login/, { timeout: 5000 });
    
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
  // In CI environment, we'll use a mock API
  // In local environment, we need to ensure user exists
  
  if (process.env.CI) {
    // CI: Mock API will handle auth
    return;
  }
  
  // Check if user already exists by trying to login
  try {
    await page.context().addCookies([{ name: 'locale', value: 'en', domain: 'localhost', path: '/' }]);
    await page.goto('/login');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    
    // If login succeeds, user exists
    await page.waitForURL('/', { timeout: 5000 });
    await page.getByRole('button', { name: 'Logout' }).first().click();
    await page.waitForURL(/.*\/login/, { timeout: 5000 });
    console.log('TEST_USER exists and is ready');
    return;
  } catch {
    // User doesn't exist, try to create
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
    
    // Wait for registration to complete
    await page.waitForURL('/', { timeout: 10000 });
    
    // Logout to prepare for the actual test
    await page.getByRole('button', { name: 'Logout' }).first().click();
    await page.waitForURL(/.*\/login/, { timeout: 5000 });
    
    console.log('TEST_USER created successfully');
  } catch (error) {
    // User might already exist, that's okay
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
  const hasLogoutButton = await page.locator('button:has-text("Logout")').isVisible({ timeout: 3000 }).catch(() => false);
  
  // If we're not on auth page and don't have logout button, we might need redirect
  if (!isAuthPage && !hasLogoutButton) {
    // Wait a bit more for potential redirect
    await page.waitForTimeout(2000);
    
    // Check again after waiting
    const currentUrl = page.url();
    const stillHasLogoutButton = await page.locator('button:has-text("Logout")').isVisible({ timeout: 1000 }).catch(() => false);
    
    if (!currentUrl.includes('/login') && !currentUrl.includes('/register') && !stillHasLogoutButton) {
      // Only wait for redirect if we're clearly in an inconsistent state
      console.log('Waiting for authentication redirect from:', currentUrl);
      await page.waitForURL(/.*\/(login|register)/, { timeout: 5000 });
    }
  }
}