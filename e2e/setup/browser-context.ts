import { test as base } from '@playwright/test';

export const test = base.extend({
  page: async ({ page }, use) => {
    // Initialize MSW in the browser context if in CI
    if (process.env.CI) {
      await page.addInitScript(() => {
        // This script runs in the browser context
        if (typeof window !== 'undefined' && 'mockServiceWorker' in window) {
          console.log('MSW is available in browser context');
        }
      });
    }
    
    // Use the page
    await use(page);
  },
});