import { test, expect } from '@playwright/test';
import { ensureLoggedOut } from './helpers/auth';

test.describe('Password Reset Flow E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set English locale
    await page.context().addCookies([{ name: 'locale', value: 'en', domain: 'localhost', path: '/' }]);
    
    // Ensure clean state
    await ensureLoggedOut(page);
  });

  test('should navigate to forgot password page from login', async ({ page }) => {
    await page.goto('/login');
    
    // Click "Forgot Password?" link
    await page.getByRole('link', { name: 'Forgot Password?' }).click();
    
    // Verify we're on forgot password page
    await expect(page).toHaveURL(/\/forgot-password/);
    await expect(page.getByRole('heading', { name: 'Reset Password' })).toBeVisible();
    await expect(page.getByText('Enter your email address and we\'ll send you a link to reset your password')).toBeVisible();
  });

  test('should validate email format on forgot password form', async ({ page }) => {
    await page.goto('/forgot-password');
    
    // Try submitting with invalid email
    await page.fill('input[type="email"]', 'invalid-email');
    await page.getByRole('button', { name: 'Send Reset Link' }).click();
    
    // Check for validation error
    await expect(page.locator('text=Invalid email')).toBeVisible();
    
    // Try with empty email
    await page.fill('input[type="email"]', '');
    await page.getByRole('button', { name: 'Send Reset Link' }).click();
    
    // Should show required field error
    await expect(page.locator('text=Email is required')).toBeVisible();
  });

  test('should show success message after requesting password reset', async ({ page }) => {
    await page.goto('/forgot-password');
    
    // Fill valid email
    const testEmail = `test-${Date.now()}@example.com`;
    await page.fill('input[type="email"]', testEmail);
    
    // Mock the API response for success
    await page.route('**/api/v1/auth/forgot-password', async route => {
      await route.fulfill({
        status: 200,
        json: { success: true, message: 'Password reset link sent' }
      });
    });
    
    // Submit form
    await page.getByRole('button', { name: 'Send Reset Link' }).click();
    
    // Check success message
    await expect(page.getByText('Password reset link sent')).toBeVisible();
    await expect(page.getByText('Check your email')).toBeVisible();
    
    // Should redirect to login after delay
    await page.waitForURL(/\/login/, { timeout: 6000 });
  });

  test('should handle API errors on forgot password', async ({ page }) => {
    await page.goto('/forgot-password');
    
    // Mock API error
    await page.route('**/api/v1/auth/forgot-password', async route => {
      await route.fulfill({
        status: 500,
        json: { error: 'Server error' }
      });
    });
    
    // Fill and submit
    await page.fill('input[type="email"]', 'test@example.com');
    await page.getByRole('button', { name: 'Send Reset Link' }).click();
    
    // Check error message
    await expect(page.locator('text=Failed to send reset link')).toBeVisible();
  });

  test('should validate reset token on reset password page', async ({ page }) => {
    // Navigate with invalid token
    await page.goto('/reset-password?token=invalid-token');
    
    // Mock token validation failure
    await page.route('**/api/v1/auth/validate-reset-token*', async route => {
      await route.fulfill({
        status: 400,
        json: { error: 'Invalid token' }
      });
    });
    
    // Should show error state
    await expect(page.getByRole('heading', { name: 'Invalid reset link' })).toBeVisible();
    await expect(page.getByText('expired or invalid')).toBeVisible();
    
    // Check for "Request new link" button
    await expect(page.getByRole('link', { name: 'Request new link' }).first()).toBeVisible();
  });

  test('should show reset password form with valid token', async ({ page }) => {
    const validToken = 'valid-test-token-123';
    
    // Mock successful token validation
    await page.route('**/api/v1/auth/validate-reset-token*', async route => {
      await route.fulfill({
        status: 200,
        json: { valid: true }
      });
    });
    
    await page.goto(`/reset-password?token=${validToken}`);
    
    // Should show reset form
    await expect(page.getByRole('heading', { name: 'Reset Password' })).toBeVisible();
    await expect(page.getByLabel('New Password')).toBeVisible();
    await expect(page.getByLabel('Confirm Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Reset Password' })).toBeVisible();
  });

  test('should validate password requirements', async ({ page }) => {
    const validToken = 'valid-test-token-123';
    
    // Mock successful token validation
    await page.route('**/api/v1/auth/validate-reset-token*', async route => {
      await route.fulfill({
        status: 200,
        json: { valid: true }
      });
    });
    
    await page.goto(`/reset-password?token=${validToken}`);
    
    // Try weak password
    await page.fill('input[placeholder="Enter new password"]', 'weak');
    await page.fill('input[placeholder="Confirm new password"]', 'weak');
    
    // Check password strength indicator
    await expect(page.locator('text=At least 8 characters')).toBeVisible();
    await expect(page.locator('text=One uppercase letter')).toBeVisible();
    await expect(page.locator('text=One lowercase letter')).toBeVisible();
    await expect(page.locator('text=One digit')).toBeVisible();
    
    // Try mismatched passwords
    await page.fill('input[placeholder="Enter new password"]', 'StrongPass123');
    await page.fill('input[placeholder="Confirm new password"]', 'DifferentPass123');
    await page.getByRole('button', { name: 'Reset Password' }).click();
    
    // Should show mismatch error
    await expect(page.locator('text=Passwords do not match')).toBeVisible();
  });

  test('should complete password reset successfully', async ({ page }) => {
    const validToken = 'valid-test-token-123';
    
    // Mock successful token validation
    await page.route('**/api/v1/auth/validate-reset-token*', async route => {
      await route.fulfill({
        status: 200,
        json: { valid: true }
      });
    });
    
    // Mock successful password reset
    await page.route('**/api/v1/auth/reset-password', async route => {
      await route.fulfill({
        status: 200,
        json: { success: true, message: 'Password reset successful' }
      });
    });
    
    await page.goto(`/reset-password?token=${validToken}`);
    
    // Fill valid passwords
    const newPassword = 'NewStrongPass123';
    await page.fill('input[placeholder="Enter new password"]', newPassword);
    await page.fill('input[placeholder="Confirm new password"]', newPassword);
    
    // All password requirements should be met
    await expect(page.locator('.text-green-600')).toHaveCount(4);
    
    // Submit form
    await page.getByRole('button', { name: 'Reset Password' }).click();
    
    // Check success state
    await expect(page.getByRole('heading', { name: 'Password Reset Successful' })).toBeVisible();
    await expect(page.getByText('Your password has been reset')).toBeVisible();
    
    // Should redirect to login
    await page.waitForURL(/\/login/, { timeout: 4000 });
  });

  test('should toggle password visibility', async ({ page }) => {
    const validToken = 'valid-test-token-123';
    
    // Mock successful token validation
    await page.route('**/api/v1/auth/validate-reset-token*', async route => {
      await route.fulfill({
        status: 200,
        json: { valid: true }
      });
    });
    
    await page.goto(`/reset-password?token=${validToken}`);
    
    // Password should be hidden by default
    const passwordInput = page.locator('input[placeholder="Enter new password"]');
    await expect(passwordInput).toHaveAttribute('type', 'password');
    
    // Click toggle button (eye icon)
    await page.locator('button[aria-label*="password"]').first().click();
    
    // Password should now be visible
    await expect(passwordInput).toHaveAttribute('type', 'text');
    
    // Toggle back
    await page.locator('button[aria-label*="password"]').first().click();
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('should navigate back to login from forgot password', async ({ page }) => {
    await page.goto('/forgot-password');
    
    // Click "Back to Login" link
    await page.getByRole('link', { name: 'Back to Login' }).click();
    
    // Should be on login page
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
  });

  test('should handle loading states', async ({ page }) => {
    await page.goto('/forgot-password');
    
    // Delay API response to see loading state
    await page.route('**/api/v1/auth/forgot-password', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.fulfill({
        status: 200,
        json: { success: true }
      });
    });
    
    await page.fill('input[type="email"]', 'test@example.com');
    await page.getByRole('button', { name: 'Send Reset Link' }).click();
    
    // Should show loading state
    await expect(page.getByRole('button', { name: 'Sending...' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sending...' })).toBeDisabled();
    
    // Wait for completion
    await expect(page.getByText('Password reset link sent')).toBeVisible();
  });
});