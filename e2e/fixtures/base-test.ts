import { test as base, Page, BrowserContext } from '@playwright/test';
import { ensureMSW } from '../helpers/ensure-msw';

// Define custom fixtures type
type CustomFixtures = {
  autoSetup: void;
};

// Extend the base test with custom fixtures
export const test = base.extend<CustomFixtures>({
  // Auto-fixture that runs before each test
  autoSetup: [async ({ page, context }: { page: Page; context: BrowserContext }, use: () => Promise<void>) => {
    // Force MSW to be enabled via environment
    await context.addInitScript(() => {
      (window as Window & { process?: { env: Record<string, string> } }).process = {
        env: {
          NEXT_PUBLIC_USE_MSW: 'true',
          NEXT_PUBLIC_CI: 'true'
        }
      };
    });
    
    // Ensure MSW is initialized
    await ensureMSW(page);
    
    // Clear all storage to ensure test isolation
    await page.evaluate(() => {
      if (typeof localStorage !== 'undefined') {
        localStorage.clear();
      }
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.clear();
      }
    });
    
    // Clear cookies
    await context.clearCookies();
    
    // Set default locale
    await context.addCookies([{ 
      name: 'locale', 
      value: 'en', 
      domain: 'localhost', 
      path: '/' 
    }]);
    
    // Use the fixture
    await use();
  }, { auto: true }]
});

export { expect } from '@playwright/test';