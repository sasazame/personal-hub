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
  ]).catch(async () => {
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
      
      // In test environment with MSW, don't check backend directly
      if (process.env.CI || process.env.NEXT_PUBLIC_CI || process.env.NEXT_PUBLIC_USE_MSW) {
        throw new Error('Login failed - check test user credentials and MSW handlers');
      }
      
      // Only check backend in non-CI environments
      try {
        const response = await page.evaluate(async ([email, password]) => {
          const response = await fetch('http://localhost:8080/api/v1/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
          });
          return { status: response.status, ok: response.ok };
        }, [email, password]);
        
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
  
  // Clear authentication state first before navigation
  try {
    await page.evaluate(() => {
      if (typeof localStorage !== 'undefined') {
        localStorage.clear();
      }
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.clear();
      }
    });
  } catch {
    // If we can't clear storage, navigate to login first
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      if (typeof localStorage !== 'undefined') {
        localStorage.clear();
      }
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.clear();
      }
    });
  }
  
  // Navigate to login page if not already there
  if (!page.url().includes('/login')) {
    try {
      await page.goto('/login', { waitUntil: 'domcontentloaded' });
    } catch (error) {
      // If navigation fails due to redirect, wait for it to complete
      if (error instanceof Error && error.message.includes('interrupted')) {
        await page.waitForURL(/.*\/login/, { timeout: 5000 });
      } else {
        throw error;
      }
    }
  }
  
  // Wait for login form to be ready
  await page.waitForSelector('input[type="email"]', { timeout: 5000 });
}

// Test user credentials
export const TEST_USER = {
  email: 'test@example.com',
  password: 'Password123!',  // Updated to match backend requirements: 8+ chars, uppercase, lowercase, digit, special char
  username: 'testuser'
};

// Helper to setup MSW if in CI environment
export async function setupMockIfNeeded(page: Page) {
  // Ensure MSW is ready
  await page.waitForTimeout(2000); // Give MSW time to initialize
  
  // Wait for MSW to be active
  try {
    await page.waitForFunction(() => {
      // Check if MSW is active by looking for the service worker
      return navigator.serviceWorker?.controller?.scriptURL?.includes('mockServiceWorker.js');
    }, { timeout: 5000 });
  } catch {
    console.log('MSW service worker not detected, continuing anyway');
  }
}

// Alternative test user for multi-user scenarios
export const TEST_USER_2 = {
  email: 'test2@example.com',
  password: 'Password123!',  // Updated to match backend requirements: 8+ chars, uppercase, lowercase, digit, special char
  username: 'testuser2'
};