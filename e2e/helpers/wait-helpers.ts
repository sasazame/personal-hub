import { Page } from '@playwright/test';

/**
 * Wait for authentication state to be resolved
 * This ensures AuthGuard has checked auth status and performed any redirects
 */
export async function waitForAuthState(page: Page) {
  // Wait for the auth context to check authentication
  await page.waitForTimeout(500);
  
  // Wait for any navigation to complete
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {
    // Ignore timeout - networkidle might not happen, especially on mobile
  });
  
  // Additional wait to ensure React has re-rendered
  // Mobile browsers might need more time
  const isMobile = await page.evaluate(() => {
    return window.innerWidth < 768;
  });
  await page.waitForTimeout(isMobile ? 500 : 200);
}

/**
 * Navigate to a protected route and wait for auth redirect if needed
 */
export async function navigateToProtectedRoute(page: Page, url: string) {
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await waitForAuthState(page);
}

/**
 * Navigate to auth page (login/register) and wait for any redirects
 */
export async function navigateToAuthPage(page: Page, url: string) {
  await page.goto(url);
  await waitForAuthState(page);
}