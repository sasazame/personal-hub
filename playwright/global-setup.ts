import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  // Set up MSW for CI environment
  if (process.env.CI) {
    console.log('CI environment detected - MSW will be used for API mocking');
  }
  
  // Optionally, start a browser to ensure everything is working
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(2000);
    console.log('Application is accessible');
  } catch (error) {
    console.error('Failed to access application:', error);
  } finally {
    await browser.close();
  }
}

export default globalSetup;