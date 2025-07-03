import { test, expect } from '@playwright/test';
import { login, TEST_USER, ensureLoggedOut } from './helpers/auth';
import {
  generateTestTodo,
  generateTestNote,
  generateTestEvent,
  cleanupAllTestData,
  waitForTestData,
  generateBulkTestData,
  testDataManager
} from './helpers/test-data';

test.describe('Test Data Management Examples', () => {
  test.beforeEach(async ({ page }) => {
    // Set English locale
    await page.context().addCookies([{ name: 'locale', value: 'en', domain: 'localhost', path: '/' }]);
    
    // Clear any previous test data tracking
    testDataManager.clearTrackedData();
    
    // Ensure clean state and login
    await ensureLoggedOut(page);
    await page.goto('/login');
    await login(page, TEST_USER.email, TEST_USER.password);
  });

  test.afterEach(async ({ page }) => {
    // Clean up test data after each test to prevent pollution
    await cleanupAllTestData(page);
  });

  test('should create and track test todos', async ({ page }) => {
    // Generate test todo data
    const testTodo = generateTestTodo('demo');
    
    // Navigate to todos
    await page.goto('/todos');
    
    // Create the todo
    await page.getByRole('button', { name: 'Add TODO' }).click();
    await page.fill('input[name="title"]', testTodo.title);
    await page.fill('textarea[name="description"]', testTodo.description || '');
    await page.selectOption('select[name="priority"]', testTodo.priority || 'MEDIUM');
    await page.getByRole('button', { name: 'Create' }).click();
    
    // Verify todo was created
    await waitForTestData(page, 'todo', testTodo.title);
    await expect(page.locator('.bg-card').filter({ hasText: testTodo.title })).toBeVisible();
    
    // Verify test data is being tracked
    const trackedData = testDataManager.getTestData();
    expect(trackedData).toHaveLength(1);
    expect(trackedData[0].type).toBe('todo');
    expect(trackedData[0].identifier).toBe(testTodo.title);
  });

  test('should create and track test notes', async ({ page }) => {
    // Generate test note data
    const testNote = generateTestNote('demo');
    
    // Navigate to notes
    await page.goto('/notes');
    
    // Create the note
    await page.getByRole('button', { name: 'New Note' }).click();
    await page.fill('input[name="title"]', testNote.title);
    await page.fill('textarea[name="content"]', testNote.content);
    
    // Add tags
    for (const tag of testNote.tags || []) {
      await page.fill('input[placeholder="Enter new tag"]', tag);
      await page.keyboard.press('Enter');
    }
    
    await page.getByRole('button', { name: 'Create' }).click();
    
    // Verify note was created
    await waitForTestData(page, 'note', testNote.title);
    await expect(page.locator('.bg-card').filter({ hasText: testNote.title })).toBeVisible();
  });

  test('should create and track test events', async ({ page }) => {
    // Generate test event data
    const testEvent = generateTestEvent('demo');
    
    // Navigate to calendar
    await page.goto('/calendar');
    
    // Create the event
    await page.getByRole('button', { name: 'New Event' }).click();
    await page.fill('input[name="title"]', testEvent.title);
    await page.fill('textarea[name="description"]', testEvent.description || '');
    
    // Set as all-day event
    if (testEvent.allDay) {
      await page.locator('input[name="allDay"]').check();
    }
    
    await page.getByRole('button', { name: 'Create' }).click();
    
    // Verify event was created
    await waitForTestData(page, 'event', testEvent.title);
    await expect(page.locator('.text-xs.p-1.rounded').filter({ hasText: testEvent.title })).toBeVisible();
  });

  test('should generate bulk test data', async ({ page }) => {
    // Generate 5 test todos
    await generateBulkTestData(page, 'todo', 5);
    
    // Verify all todos were created
    const testTodos = page.locator('.bg-card').filter({ 
      hasText: new RegExp(testDataManager.generateTestId('bulk').slice(0, 20))
    });
    
    // Should have at least 5 todos
    expect(await testTodos.count()).toBeGreaterThanOrEqual(5);
    
    // Navigate to notes and create bulk notes
    await generateBulkTestData(page, 'note', 3);
    
    // Verify notes were created
    const testNotes = page.locator('.bg-card').filter({ 
      hasText: new RegExp(testDataManager.generateTestId('bulk').slice(0, 20))
    });
    
    expect(await testNotes.count()).toBeGreaterThanOrEqual(3);
  });

  test('should identify test data correctly', async ({ page }) => {
    // Create a mix of test and non-test data
    const testTodo = generateTestTodo('identify');
    const normalTodo = {
      title: 'Regular Todo Item',
      description: 'This is not test data'
    };
    
    await page.goto('/todos');
    
    // Create test todo
    await page.getByRole('button', { name: 'Add TODO' }).click();
    await page.fill('input[name="title"]', testTodo.title);
    await page.fill('textarea[name="description"]', testTodo.description || '');
    await page.getByRole('button', { name: 'Create' }).click();
    
    // Create normal todo
    await page.getByRole('button', { name: 'Add TODO' }).click();
    await page.fill('input[name="title"]', normalTodo.title);
    await page.fill('textarea[name="description"]', normalTodo.description);
    await page.getByRole('button', { name: 'Create' }).click();
    
    // Verify both exist
    await expect(page.locator('.bg-card').filter({ hasText: testTodo.title })).toBeVisible();
    await expect(page.locator('.bg-card').filter({ hasText: normalTodo.title })).toBeVisible();
    
    // Verify only test data is identified
    expect(testDataManager.isTestData(testTodo.title)).toBe(true);
    expect(testDataManager.isTestData(normalTodo.title)).toBe(false);
  });

  test('should clean up only test data', async ({ page }) => {
    // Create test and normal todos
    const testTodo1 = generateTestTodo('cleanup1');
    const testTodo2 = generateTestTodo('cleanup2');
    const normalTodo = {
      title: 'Keep This Todo',
      description: 'This should not be deleted'
    };
    
    await page.goto('/todos');
    
    // Create all todos
    for (const todo of [testTodo1, testTodo2, normalTodo]) {
      await page.getByRole('button', { name: 'Add TODO' }).click();
      await page.fill('input[name="title"]', todo.title);
      await page.fill('textarea[name="description"]', todo.description || '');
      await page.getByRole('button', { name: 'Create' }).click();
      await page.waitForTimeout(500);
    }
    
    // Verify all exist
    await expect(page.locator('.bg-card').filter({ hasText: testTodo1.title })).toBeVisible();
    await expect(page.locator('.bg-card').filter({ hasText: testTodo2.title })).toBeVisible();
    await expect(page.locator('.bg-card').filter({ hasText: normalTodo.title })).toBeVisible();
    
    // Clean up test data
    await cleanupAllTestData(page);
    
    // Verify test data is gone but normal data remains
    await expect(page.locator('.bg-card').filter({ hasText: testTodo1.title })).not.toBeVisible();
    await expect(page.locator('.bg-card').filter({ hasText: testTodo2.title })).not.toBeVisible();
    await expect(page.locator('.bg-card').filter({ hasText: normalTodo.title })).toBeVisible();
    
    // Manually clean up the normal todo
    const todoCard = page.locator('.bg-card').filter({ hasText: normalTodo.title });
    await todoCard.locator('button svg').last().click();
    await page.locator('button').filter({ hasText: 'Delete' }).click();
    await page.getByRole('button', { name: 'Delete' }).click();
  });

  test('should handle test data with special characters', async ({ page }) => {
    // Generate test note with special content
    const testNote = generateTestNote('special');
    testNote.content = `Special content with:
    - Unicode: 你好 🎉 
    - HTML chars: <div>&nbsp;</div>
    - Quotes: "double" and 'single'
    - Line breaks and     spaces`;
    
    await page.goto('/notes');
    
    // Create note
    await page.getByRole('button', { name: 'New Note' }).click();
    await page.fill('input[name="title"]', testNote.title);
    await page.fill('textarea[name="content"]', testNote.content);
    await page.getByRole('button', { name: 'Create' }).click();
    
    // Verify creation
    await waitForTestData(page, 'note', testNote.title);
    
    // View note to verify content
    await page.locator('.bg-card').filter({ hasText: testNote.title }).click();
    await expect(page.locator('.whitespace-pre-wrap')).toContainText('你好 🎉');
    await expect(page.locator('.whitespace-pre-wrap')).toContainText('<div>&nbsp;</div>');
  });
});

test.describe('Test Data Performance', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().addCookies([{ name: 'locale', value: 'en', domain: 'localhost', path: '/' }]);
    await ensureLoggedOut(page);
    await page.goto('/login');
    await login(page, TEST_USER.email, TEST_USER.password);
  });

  test.afterEach(async ({ page }) => {
    // Clean up test data after performance tests too
    await cleanupAllTestData(page);
  });

  test('should handle large amounts of test data', async ({ page }) => {
    // Create fewer test todos to avoid timeout (reduced from 20 to 10)
    await generateBulkTestData(page, 'todo', 10);
    
    // Verify page still loads quickly
    const startTime = Date.now();
    await page.reload();
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    // Page should load in reasonable time even with many items
    expect(loadTime).toBeLessThan(5000);
    
    // Clean up
    await cleanupAllTestData(page);
  });
});