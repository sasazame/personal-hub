import { Page } from '@playwright/test';

/**
 * Login helper with better error detection and handling
 */
export async function login(page: Page, email: string, password: string) {
  // Set English locale and navigate to login page if not already there
  await page.context().addCookies([{ name: 'locale', value: 'en', domain: 'localhost', path: '/' }]);
  
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
  
  // Wait for either redirect or error message
  await Promise.race([
    // Wait for successful redirect
    page.waitForURL((url) => !url.href.includes('/login'), { timeout: 10000 }),
    // Or wait for error message
    page.waitForSelector('[data-sonner-toast][data-type="error"], .text-red-500, .text-red-600', { timeout: 10000 }).then(() => {
      throw new Error('Login error detected');
    })
  ]).catch(async (error) => {
    // Handle errors
    const errorToast = page.locator('[data-sonner-toast][data-type="error"]');
    const hasErrorToast = await errorToast.isVisible({ timeout: 1000 }).catch(() => false);
    
    if (hasErrorToast) {
      const errorText = await errorToast.textContent();
      console.log('Login error toast:', errorText);
      throw new Error(`Login failed: ${errorText}`);
    }
    
    // Check for form validation errors
    const formErrors = page.locator('.text-red-500, .text-red-600, .text-red-700');
    const errorCount = await formErrors.count();
    
    if (errorCount > 0) {
      const errorTexts = [];
      for (let i = 0; i < Math.min(errorCount, 3); i++) {
        const errorText = await formErrors.nth(i).textContent();
        if (errorText?.trim()) {
          errorTexts.push(errorText.trim());
        }
      }
      
      if (errorTexts.length > 0) {
        console.log('Login form errors:', errorTexts);
        throw new Error(`Login failed: ${errorTexts.join(', ')}`);
      }
    }
    
    // If still on login page, something went wrong
    if (page.url().includes('/login')) {
      console.log('Still on login page after attempt. URL:', page.url());
      
      // Check if backend is responding
      try {
        const response = await page.evaluate(async () => {
          const response = await fetch('http://localhost:8080/api/v1/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: arguments[0], password: arguments[1] })
          });
          return { status: response.status, ok: response.ok };
        }, email, password);
        
        if (!response.ok) {
          throw new Error(`Backend authentication failed with status ${response.status}`);
        }
      } catch (backendError) {
        console.log('Backend direct check failed:', backendError);
        throw new Error('Make sure the backend is running at localhost:8080');
      }
      
      throw new Error('Login did not redirect from login page');
    }
  });
}

export async function logout(page: Page) {
  // Click logout button if visible (prefer header logout button)
  const headerLogoutButton = page.getByRole('button', { name: 'Logout' }).first();
  if (await headerLogoutButton.isVisible()) {
    await headerLogoutButton.click();
    await page.waitForURL(/.*\/login/, { timeout: 5000 });
  }
}

/**
 * Ensures user is logged out and clears all authentication state
 */
export async function ensureLoggedOut(page: Page) {
  // Set English locale
  await page.context().addCookies([{ name: 'locale', value: 'en', domain: 'localhost', path: '/' }]);
  
  // Navigate to a safe page first to ensure localStorage is accessible
  await page.goto('/');
  
  // Clear authentication state with error handling
  try {
    await page.evaluate(() => {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      }
    });
  } catch (error) {
    console.log('localStorage clear error (non-critical):', error);
  }
  
  // Check if we're on a protected page and have logout button
  const logoutButton = page.getByRole('button', { name: 'Logout' }).first();
  if (await logoutButton.isVisible({ timeout: 2000 })) {
    await logoutButton.click();
    await page.waitForURL(/.*\/login/, { timeout: 5000 });
  }
  
  // Final clear of all storage with error handling
  try {
    await page.evaluate(() => {
      if (typeof localStorage !== 'undefined') {
        localStorage.clear();
      }
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.clear();
      }
    });
  } catch (error) {
    console.log('Storage clear error (non-critical):', error);
  }
  
  // Ensure we're on login page
  if (!page.url().includes('/login')) {
    await page.goto('/login');
  }
}

// Test user credentials
export const TEST_USER = {
  email: 'test@example.com',
  password: 'Password123!',  // Updated to match backend requirements: 8+ chars, uppercase, lowercase, digit, special char
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
  password: 'Password123!',  // Updated to match backend requirements: 8+ chars, uppercase, lowercase, digit, special char
  username: 'testuser2'
};