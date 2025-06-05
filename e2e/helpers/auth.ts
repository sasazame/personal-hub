import { Page } from '@playwright/test';

export async function login(page: Page, email: string, password: string) {
  // Navigate to login page if not already there
  const currentUrl = page.url();
  if (!currentUrl.includes('/login')) {
    await page.goto('/login');
  }
  
  // Wait for login form to be visible
  await page.waitForSelector('input[type="email"]', { timeout: 10000 });
  
  // Fill in login form
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  
  // Submit form
  await page.click('button[type="submit"]');
  
  // Wait a bit for the request to process
  await page.waitForTimeout(1000);
  
  // Check for error toast or alert messages specifically
  const errorToast = page.locator('[data-sonner-toast][data-type="error"]');
  const hasErrorToast = await errorToast.isVisible({ timeout: 2000 }).catch(() => false);
  
  if (hasErrorToast) {
    const errorText = await errorToast.textContent();
    console.log('Login error toast:', errorText);
    throw new Error(`Login failed: ${errorText}`);
  }
  
  // Check for form validation errors
  const formErrors = page.locator('.text-red-500, .text-red-600, .text-red-700').filter({ hasText: /error|invalid|failed|wrong/i });
  const hasFormError = await formErrors.first().isVisible({ timeout: 1000 }).catch(() => false);
  
  if (hasFormError) {
    const errorText = await formErrors.first().textContent();
    console.log('Login form error:', errorText);
    throw new Error(`Login failed: ${errorText}`);
  }
  
  // Wait for redirect after successful login (longer timeout)
  try {
    await page.waitForURL((url) => !url.href.includes('/login'), { timeout: 15000 });
  } catch (error) {
    console.log('Current URL after login attempt:', page.url());
    // Take a screenshot for debugging
    await page.screenshot({ path: 'login-debug.png' });
    throw new Error('Login did not redirect from login page');
  }
}

export async function logout(page: Page) {
  // Click logout button if visible
  const logoutButton = page.locator('button:has-text("Logout")');
  if (await logoutButton.isVisible()) {
    await logoutButton.click();
    await page.waitForURL(/.*\/login/, { timeout: 5000 });
  }
}

export async function ensureLoggedOut(page: Page) {
  // Check if we're on a protected page
  const currentUrl = page.url();
  if (!currentUrl.includes('/login') && !currentUrl.includes('/register')) {
    // Try to access protected route
    await page.goto('/');
    
    // If we have a logout button, click it
    const logoutButton = page.locator('button:has-text("Logout")');
    if (await logoutButton.isVisible({ timeout: 2000 })) {
      await logoutButton.click();
    }
  }
  
  // Clear local storage to ensure clean state
  await page.evaluate(() => {
    localStorage.clear();
  });
}

// Test user credentials
export const TEST_USER = {
  email: 'test@example.com',
  password: 'password123',  // Simplified to avoid backend special character issues
  username: 'testuser'
};

// Helper to setup MSW if in CI environment
export async function setupMockIfNeeded(page: Page) {
  // In CI environment, ensure MSW is ready
  if (process.env.CI) {
    await page.waitForTimeout(2000); // Give MSW time to initialize
  }
}

// Alternative test user for multi-user scenarios
export const TEST_USER_2 = {
  email: 'test2@example.com',
  password: 'password123',  // Simplified to avoid backend special character issues
  username: 'testuser2'
};