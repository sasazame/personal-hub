import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test('should load the application successfully', async ({ page }) => {
    await page.goto('/');
    
    // Wait for DOM to be ready (networkidle is discouraged)
    await page.waitForLoadState('domcontentloaded');
    
    // Check basic page properties
    await expect(page).toHaveTitle(/TODO App/);
    
    // Log current page content for debugging
    console.log('Page URL:', page.url());
    console.log('Page title:', await page.title());
    
    // Wait for React hydration
    await page.waitForTimeout(5000);
    
    // Check that the page doesn't show critical errors
    await expect(page.locator('body')).not.toContainText('Application error');
    await expect(page.locator('body')).not.toContainText('500');
    await expect(page.locator('body')).not.toContainText('This page could not be found');
    
    // Basic success: page loads and has content
    const hasContent = await page.locator('body').textContent();
    expect(hasContent).toBeTruthy();
    expect(hasContent!.length).toBeGreaterThan(10); // Page has some content
  });
});