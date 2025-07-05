import { Page } from '@playwright/test';

/**
 * Ensure MSW is initialized and ready
 */
export async function ensureMSW(page: Page) {
  // First, set the environment variable to enable MSW
  await page.addInitScript(() => {
    // Force MSW to be enabled
    (window as Window & { __NEXT_PUBLIC_USE_MSW?: string }).__NEXT_PUBLIC_USE_MSW = 'true';
  });

  // Navigate to the app to trigger MSW initialization
  await page.goto('/');
  
  // Wait for MSW to be ready
  await page.waitForFunction(() => {
    return new Promise((resolve) => {
      // Check if service worker is registered
      if (navigator.serviceWorker?.controller?.scriptURL?.includes('mockServiceWorker.js')) {
        resolve(true);
        return;
      }
      
      // If not, wait for it to be registered
      navigator.serviceWorker?.ready.then(() => {
        resolve(true);
      });
      
      // Timeout after 5 seconds
      setTimeout(() => resolve(false), 5000);
    });
  }, { timeout: 10000 });
  
  console.log('MSW initialized successfully');
}