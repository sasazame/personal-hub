import { test, expect } from '@playwright/test';
import { login, TEST_USER, ensureLoggedOut } from './helpers/auth';

test.describe('User Profile Management E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set English locale
    await page.context().addCookies([{ name: 'locale', value: 'en', domain: 'localhost', path: '/' }]);
    
    // Ensure clean state and login
    await ensureLoggedOut(page);
    await page.goto('/login');
    await login(page, TEST_USER.email, TEST_USER.password);
  });

  test('should navigate to profile page', async ({ page }) => {
    // Click on user menu (usually in header)
    await page.locator('button').filter({ hasText: TEST_USER.email.split('@')[0] }).click();
    
    // Click profile link
    await page.getByRole('link', { name: 'Profile' }).click();
    
    // Should be on profile page
    await expect(page).toHaveURL('/profile');
    await expect(page.getByRole('heading', { name: 'Profile' })).toBeVisible();
  });

  test('should display user information correctly', async ({ page }) => {
    await page.goto('/profile');
    
    // Check personal information section
    await expect(page.getByRole('heading', { name: 'Personal Information' })).toBeVisible();
    
    // Check user details are displayed
    await expect(page.getByText(TEST_USER.email)).toBeVisible();
    
    // Check created at date is displayed
    await expect(page.locator('text=Created')).toBeVisible();
    
    // Edit button should be visible
    await expect(page.getByRole('button', { name: 'Edit' })).toBeVisible();
  });

  test('should open edit profile modal', async ({ page }) => {
    await page.goto('/profile');
    
    // Click edit button
    await page.getByRole('button', { name: 'Edit' }).click();
    
    // Modal should open
    await expect(page.getByRole('heading', { name: 'Edit Profile' })).toBeVisible();
    
    // Form fields should be visible with current values
    const usernameInput = page.locator('input[name="username"]');
    const emailInput = page.locator('input[name="email"]');
    
    await expect(usernameInput).toBeVisible();
    await expect(emailInput).toBeVisible();
    
    // Fields should be pre-filled with current data
    await expect(emailInput).toHaveValue(TEST_USER.email);
    
    // Cancel and Update buttons should be visible
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Update Profile' })).toBeVisible();
  });

  test('should update username successfully', async ({ page }) => {
    await page.goto('/profile');
    
    // Click edit button
    await page.getByRole('button', { name: 'Edit' }).click();
    
    // Update username
    const newUsername = `updated_user_${Date.now()}`;
    await page.fill('input[name="username"]', newUsername);
    
    // Submit form
    await page.getByRole('button', { name: 'Update Profile' }).click();
    
    // Wait for API response
    await page.waitForLoadState('networkidle');
    
    // Should show success message
    await expect(page.getByText('Profile updated successfully')).toBeVisible();
    
    // Modal should close
    await expect(page.getByRole('heading', { name: 'Edit Profile' })).not.toBeVisible();
    
    // Updated username should be displayed
    await expect(page.getByText(newUsername)).toBeVisible();
  });

  test('should validate email format', async ({ page }) => {
    await page.goto('/profile');
    
    // Click edit button
    await page.getByRole('button', { name: 'Edit' }).click();
    
    // Enter invalid email
    await page.fill('input[name="email"]', 'invalid-email');
    
    // Try to submit
    await page.getByRole('button', { name: 'Update Profile' }).click();
    
    // Should show validation error - the actual message might be different
    await expect(page.getByText(/email|invalid/i)).toBeVisible();
    
    // Modal should remain open
    await expect(page.getByRole('heading', { name: 'Edit Profile' })).toBeVisible();
  });

  test('should validate username length', async ({ page }) => {
    await page.goto('/profile');
    
    // Click edit button
    await page.getByRole('button', { name: 'Edit' }).click();
    
    // Enter short username
    await page.fill('input[name="username"]', 'ab');
    
    // Try to submit
    await page.getByRole('button', { name: 'Update Profile' }).click();
    
    // Should show validation error
    await expect(page.getByText('Username must be at least 3 characters')).toBeVisible();
  });

  test('should cancel profile editing', async ({ page }) => {
    await page.goto('/profile');
    
    // Click edit button
    await page.getByRole('button', { name: 'Edit' }).click();
    
    // Make some changes
    await page.fill('input[name="username"]', 'temporary_change');
    
    // Click cancel
    await page.getByRole('button', { name: 'Cancel' }).click();
    
    // Modal should close
    await expect(page.getByRole('heading', { name: 'Edit Profile' })).not.toBeVisible();
    
    // Changes should not be saved
    await expect(page.getByText('temporary_change')).not.toBeVisible();
  });

  test('should open change password modal', async ({ page }) => {
    await page.goto('/profile');
    
    // Check account settings section
    await expect(page.getByRole('heading', { name: 'Account Settings' })).toBeVisible();
    
    // Click change password button
    await page.getByRole('button', { name: 'Change Password' }).click();
    
    // Modal should open
    await expect(page.getByRole('heading', { name: 'Change Password' })).toBeVisible();
    
    // Password fields should be visible
    await expect(page.locator('input[name="currentPassword"]')).toBeVisible();
    await expect(page.locator('input[name="newPassword"]')).toBeVisible();
    await expect(page.locator('input[name="confirmPassword"]')).toBeVisible();
    
    // Buttons should be visible
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Change Password' })).toBeVisible();
  });

  test('should validate password requirements', async ({ page }) => {
    await page.goto('/profile');
    
    // Open change password modal
    await page.getByRole('button', { name: 'Change Password' }).click();
    
    // Fill current password
    await page.fill('input[name="currentPassword"]', TEST_USER.password);
    
    // Try weak password
    await page.fill('input[name="newPassword"]', 'weak');
    await page.fill('input[name="confirmPassword"]', 'weak');
    
    // Try to submit
    await page.getByRole('button', { name: 'Change Password' }).click();
    
    // Should show validation errors
    await expect(page.getByText('Password must be at least 8 characters')).toBeVisible();
    await expect(page.getByText('Password must contain at least one uppercase letter')).toBeVisible();
    await expect(page.getByText('Password must contain at least one number')).toBeVisible();
    await expect(page.getByText('Password must contain at least one special character')).toBeVisible();
  });

  test('should validate password confirmation match', async ({ page }) => {
    await page.goto('/profile');
    
    // Open change password modal
    await page.getByRole('button', { name: 'Change Password' }).click();
    
    // Fill passwords that don't match
    await page.fill('input[name="currentPassword"]', TEST_USER.password);
    await page.fill('input[name="newPassword"]', 'NewPassword123!');
    await page.fill('input[name="confirmPassword"]', 'DifferentPassword123!');
    
    // Try to submit
    await page.getByRole('button', { name: 'Change Password' }).click();
    
    // Should show validation error
    await expect(page.getByText('Passwords don\'t match')).toBeVisible();
  });

  test('should change password successfully with valid data', async ({ page }) => {
    await page.goto('/profile');
    
    // Open change password modal
    await page.getByRole('button', { name: 'Change Password' }).click();
    
    // Fill valid password data
    const newPassword = 'NewValidPass123!';
    await page.fill('input[name="currentPassword"]', TEST_USER.password);
    await page.fill('input[name="newPassword"]', newPassword);
    await page.fill('input[name="confirmPassword"]', newPassword);
    
    // Submit form
    await page.getByRole('button', { name: 'Change Password' }).click();
    
    // Should show success message
    await expect(page.getByText('Password changed successfully')).toBeVisible();
    
    // Modal should close
    await expect(page.getByRole('heading', { name: 'Change Password' })).not.toBeVisible();
    
    // Test the new password by logging out and back in
    await page.locator('button').filter({ hasText: TEST_USER.email.split('@')[0] }).click();
    await page.getByRole('button', { name: 'Logout' }).click();
    
    // Login with new password
    await page.goto('/login');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', newPassword);
    await page.getByRole('button', { name: 'Login' }).click();
    
    // Should be logged in successfully
    await expect(page).toHaveURL('/dashboard');
    
    // Reset password back for other tests
    await page.goto('/profile');
    await page.getByRole('button', { name: 'Change Password' }).click();
    await page.fill('input[name="currentPassword"]', newPassword);
    await page.fill('input[name="newPassword"]', TEST_USER.password);
    await page.fill('input[name="confirmPassword"]', TEST_USER.password);
    await page.getByRole('button', { name: 'Change Password' }).click();
  });

  test('should display danger zone section', async ({ page }) => {
    await page.goto('/profile');
    
    // Check danger zone section
    await expect(page.getByRole('heading', { name: 'Danger Zone' })).toBeVisible();
    
    // Delete account button should be visible
    await expect(page.getByRole('button', { name: 'Delete Account' })).toBeVisible();
    
    // Warning text should be present
    await expect(page.getByText('Are you sure you want to delete your account')).toBeVisible();
  });

  test('should open delete account confirmation modal', async ({ page }) => {
    await page.goto('/profile');
    
    // Click delete account button
    await page.getByRole('button', { name: 'Delete Account' }).click();
    
    // Confirmation modal should appear - use dialog role to avoid strict mode
    await expect(page.getByRole('dialog').getByText(/Are you sure you want to delete your account/)).toBeVisible();
    await expect(page.getByRole('dialog').getByText('This action cannot be undone')).toBeVisible();
    
    // Confirmation buttons should be visible
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Delete Account' })).toBeVisible();
  });

  test('should cancel account deletion', async ({ page }) => {
    await page.goto('/profile');
    
    // Click delete account button
    await page.getByRole('button', { name: 'Delete Account' }).click();
    
    // Click cancel
    await page.getByRole('button', { name: 'Cancel' }).click();
    
    // Should remain on profile page
    await expect(page).toHaveURL('/profile');
    await expect(page.getByRole('heading', { name: 'Profile' })).toBeVisible();
  });

  test('should handle navigation back to dashboard', async ({ page }) => {
    await page.goto('/profile');
    
    // Click back button
    await page.getByRole('button', { name: 'Back' }).click();
    
    // Should navigate to dashboard (might redirect to /dashboard)
    await expect(page).toHaveURL(/\/(dashboard)?$/);
  });

  test('should show loading states during updates', async ({ page }) => {
    await page.goto('/profile');
    
    // Mock slow API response
    await page.route('**/api/v1/users/*', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.continue();
    });
    
    // Open edit modal and submit
    await page.getByRole('button', { name: 'Edit' }).click();
    await page.fill('input[name="username"]', 'loading_test');
    await page.getByRole('button', { name: 'Update Profile' }).click();
    
    // Should show loading state - the button text might be different
    const submitButton = page.getByRole('button', { name: /Update|Updating/i });
    await expect(submitButton).toBeDisabled();
  });

  test('should handle API errors gracefully', async ({ page }) => {
    await page.goto('/profile');
    
    // Mock API error
    await page.route('**/api/v1/users/*', async route => {
      await route.fulfill({
        status: 500,
        json: { error: 'Server error' }
      });
    });
    
    // Try to update profile
    await page.getByRole('button', { name: 'Edit' }).click();
    await page.fill('input[name="username"]', 'error_test');
    await page.getByRole('button', { name: 'Update Profile' }).click();
    
    // Should show error message - might be a toast or in the form
    await expect(page.getByText(/error|failed/i)).toBeVisible();
    
    // Modal should remain open
    await expect(page.getByRole('heading', { name: 'Edit Profile' })).toBeVisible();
  });

  test('should validate current password for password change', async ({ page }) => {
    await page.goto('/profile');
    
    // Mock invalid current password response
    await page.route('**/api/v1/users/*/change-password', async route => {
      await route.fulfill({
        status: 400,
        json: { error: 'Current password is incorrect' }
      });
    });
    
    // Open change password modal
    await page.getByRole('button', { name: 'Change Password' }).click();
    
    // Fill with wrong current password
    await page.fill('input[name="currentPassword"]', 'wrong_password');
    await page.fill('input[name="newPassword"]', 'NewValidPass123!');
    await page.fill('input[name="confirmPassword"]', 'NewValidPass123!');
    
    // Submit form
    await page.getByRole('button', { name: 'Change Password' }).click();
    
    // Should show error message
    await expect(page.getByText('Current password is incorrect')).toBeVisible();
  });

  test('should be accessible via keyboard navigation', async ({ page }) => {
    await page.goto('/profile');
    
    // Focus on the edit button directly and activate it
    await page.getByRole('button', { name: 'Edit' }).focus();
    await page.keyboard.press('Enter');
    
    // Modal should open
    await expect(page.getByRole('heading', { name: 'Edit Profile' })).toBeVisible();
    
    // Close with Escape
    await page.keyboard.press('Escape');
    
    // Modal should close
    await expect(page.getByRole('heading', { name: 'Edit Profile' })).not.toBeVisible();
  });
});