import { Page } from '@playwright/test';

/**
 * Test data management utilities for e2e tests
 */

// Test data prefixes to identify test-created data
const TEST_PREFIX = 'e2e_test_';
const TEST_EMAIL_DOMAIN = '@e2e-test.example';

// Store created test data for cleanup
interface TestDataItem {
  type: 'todo' | 'note' | 'event' | 'goal' | 'user';
  id?: string;
  identifier: string; // title, email, etc.
  createdAt: Date;
}

class TestDataManager {
  private testData: TestDataItem[] = [];
  private testId: string;

  constructor() {
    this.testId = Math.random().toString(36).substring(2, 10);
  }

  /**
   * Generate a unique test identifier
   */
  generateTestId(prefix: string = ''): string {
    return `${TEST_PREFIX}${prefix}_${this.testId}_${Date.now()}`;
  }

  /**
   * Generate a unique test email
   */
  generateTestEmail(prefix: string = 'user'): string {
    return `${TEST_PREFIX}${prefix}_${this.testId}_${Date.now()}${TEST_EMAIL_DOMAIN}`;
  }

  /**
   * Track created test data for cleanup
   */
  trackTestData(item: TestDataItem): void {
    this.testData.push(item);
  }

  /**
   * Get all tracked test data
   */
  getTestData(): TestDataItem[] {
    return this.testData;
  }

  /**
   * Clear tracked test data
   */
  clearTrackedData(): void {
    this.testData = [];
  }

  /**
   * Check if a string is test data based on prefix
   */
  isTestData(identifier: string): boolean {
    return identifier.includes(TEST_PREFIX) || identifier.includes(TEST_EMAIL_DOMAIN);
  }
}

// Global test data manager instance
export const testDataManager = new TestDataManager();

/**
 * Test data creation helpers
 */

export interface TestUser {
  email: string;
  password: string;
  username: string;
}

export interface TestTodo {
  title: string;
  description?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  status?: 'PENDING' | 'IN_PROGRESS' | 'DONE';
  dueDate?: string;
}

export interface TestNote {
  title: string;
  content: string;
  tags?: string[];
}

export interface TestEvent {
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  allDay?: boolean;
  color?: string;
}

export interface TestGoal {
  title: string;
  description?: string;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'ANNUAL';
  targetCount?: number;
}

/**
 * Generate test user data
 */
export function generateTestUser(prefix: string = 'user'): TestUser {
  const id = testDataManager.generateTestId(prefix);
  const user = {
    email: testDataManager.generateTestEmail(prefix),
    password: 'TestPass123!',
    username: id
  };
  
  testDataManager.trackTestData({
    type: 'user',
    identifier: user.email,
    createdAt: new Date()
  });
  
  return user;
}

/**
 * Generate test todo data
 */
export function generateTestTodo(prefix: string = 'todo'): TestTodo {
  const title = testDataManager.generateTestId(prefix);
  const todo = {
    title,
    description: `Description for ${title}`,
    priority: 'MEDIUM' as const,
    status: 'PENDING' as const
  };
  
  testDataManager.trackTestData({
    type: 'todo',
    identifier: todo.title,
    createdAt: new Date()
  });
  
  return todo;
}

/**
 * Generate test note data
 */
export function generateTestNote(prefix: string = 'note'): TestNote {
  const title = testDataManager.generateTestId(prefix);
  const note = {
    title,
    content: `Content for ${title}\n\nThis is a test note created by e2e tests.`,
    tags: ['e2e-test', prefix]
  };
  
  testDataManager.trackTestData({
    type: 'note',
    identifier: note.title,
    createdAt: new Date()
  });
  
  return note;
}

/**
 * Generate test event data
 */
export function generateTestEvent(prefix: string = 'event'): TestEvent {
  const title = testDataManager.generateTestId(prefix);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const event = {
    title,
    description: `Description for ${title}`,
    startDate: today.toISOString().split('T')[0],
    endDate: tomorrow.toISOString().split('T')[0],
    allDay: true,
    color: 'blue'
  };
  
  testDataManager.trackTestData({
    type: 'event',
    identifier: event.title,
    createdAt: new Date()
  });
  
  return event;
}

/**
 * Generate test goal data
 */
export function generateTestGoal(prefix: string = 'goal'): TestGoal {
  const title = testDataManager.generateTestId(prefix);
  const goal = {
    title,
    description: `Description for ${title}`,
    frequency: 'DAILY' as const,
    targetCount: 1
  };
  
  testDataManager.trackTestData({
    type: 'goal',
    identifier: goal.title,
    createdAt: new Date()
  });
  
  return goal;
}

/**
 * Cleanup utilities
 */

/**
 * Clean up test todos
 */
export async function cleanupTestTodos(page: Page): Promise<void> {
  try {
    await page.goto('/todos');
    await page.waitForLoadState('networkidle');
    
    // Find all test todos
    const testTodos = page.locator('.bg-card').filter({ 
      hasText: new RegExp(TEST_PREFIX) 
    });
    
    const todoCount = await testTodos.count();
    
    for (let i = 0; i < todoCount; i++) {
      const todo = testTodos.nth(i);
      const title = await todo.locator('h3').textContent();
      
      if (title && testDataManager.isTestData(title)) {
        // Click kebab menu and delete
        await todo.locator('button svg').last().click();
        await page.locator('button').filter({ hasText: 'Delete' }).click();
        
        // Confirm deletion in dialog
        await page.getByRole('dialog').getByRole('button', { name: 'Delete' }).click();
        await page.waitForTimeout(500);
      }
    }
  } catch (error) {
    console.error('Error cleaning up test todos:', error);
  }
}

/**
 * Clean up test notes
 */
export async function cleanupTestNotes(page: Page): Promise<void> {
  try {
    await page.goto('/notes');
    await page.waitForLoadState('networkidle');
    
    // Find all test notes
    const testNotes = page.locator('.bg-card').filter({ 
      hasText: new RegExp(TEST_PREFIX) 
    });
    
    const noteCount = await testNotes.count();
    
    for (let i = 0; i < noteCount; i++) {
      const note = testNotes.nth(i);
      const title = await note.locator('h3').textContent();
      
      if (title && testDataManager.isTestData(title)) {
        // Click delete button
        await note.locator('button svg.lucide-trash-2').click();
        
        // Confirm deletion in dialog
        await page.getByRole('dialog').getByRole('button', { name: 'Delete' }).click();
        await page.waitForTimeout(500);
      }
    }
  } catch (error) {
    console.error('Error cleaning up test notes:', error);
  }
}

/**
 * Clean up test events
 */
export async function cleanupTestEvents(page: Page): Promise<void> {
  try {
    await page.goto('/calendar');
    await page.waitForLoadState('networkidle');
    
    // Find all test events
    const testEvents = page.locator('.text-xs.p-1.rounded').filter({ 
      hasText: new RegExp(TEST_PREFIX) 
    });
    
    const eventCount = await testEvents.count();
    
    for (let i = 0; i < eventCount; i++) {
      const event = testEvents.nth(i);
      const title = await event.textContent();
      
      if (title && testDataManager.isTestData(title)) {
        // Click event to open edit form
        await event.click();
        
        // Click delete button in the form
        await page.locator('form').getByRole('button', { name: 'Delete' }).click();
        
        // Confirm deletion in dialog
        await page.getByRole('dialog').getByRole('button', { name: 'Delete' }).click();
        await page.waitForTimeout(500);
      }
    }
  } catch (error) {
    console.error('Error cleaning up test events:', error);
  }
}

/**
 * Clean up all test data for current test run
 */
export async function cleanupAllTestData(page: Page): Promise<void> {
  console.log('Cleaning up test data...');
  
  // Clean up in reverse order of dependencies
  await cleanupTestEvents(page);
  await cleanupTestNotes(page);
  await cleanupTestTodos(page);
  
  // Clear tracked data
  testDataManager.clearTrackedData();
  
  console.log('Test data cleanup completed');
}

/**
 * Setup test data hooks
 */
export function setupTestDataHooks() {
  return {
    beforeEach: async () => {
      // Clear any previous test data tracking
      testDataManager.clearTrackedData();
    },
    
    afterEach: async () => {
      // Optional: Clean up after each test
      // Uncomment if you want aggressive cleanup
      // await cleanupAllTestData(page);
    },
    
    afterAll: async (page: Page) => {
      // Clean up all test data after test suite
      await cleanupAllTestData(page);
    }
  };
}

/**
 * Test data validation utilities
 */

/**
 * Check if test data exists
 */
export async function testDataExists(
  page: Page, 
  type: 'todo' | 'note' | 'event' | 'goal',
  identifier: string
): Promise<boolean> {
  try {
    switch (type) {
      case 'todo':
        await page.goto('/todos');
        return await page.locator('.bg-card').filter({ hasText: identifier }).isVisible();
        
      case 'note':
        await page.goto('/notes');
        return await page.locator('.bg-card').filter({ hasText: identifier }).isVisible();
        
      case 'event':
        await page.goto('/calendar');
        return await page.locator('.text-xs.p-1.rounded').filter({ hasText: identifier }).isVisible();
        
      case 'goal':
        await page.goto('/goals');
        return await page.locator('.bg-card').filter({ hasText: identifier }).isVisible();
        
      default:
        return false;
    }
  } catch {
    return false;
  }
}

/**
 * Wait for test data to be created
 */
export async function waitForTestData(
  page: Page,
  type: 'todo' | 'note' | 'event' | 'goal',
  identifier: string,
  timeout: number = 10000
): Promise<void> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    if (await testDataExists(page, type, identifier)) {
      return;
    }
    await page.waitForTimeout(500);
  }
  
  throw new Error(`Test data ${type} with identifier "${identifier}" not found within ${timeout}ms`);
}

/**
 * Generate bulk test data
 */
export async function generateBulkTestData(
  page: Page,
  type: 'todo' | 'note',
  count: number
): Promise<void> {
  const items = [];
  
  for (let i = 0; i < count; i++) {
    if (type === 'todo') {
      items.push(generateTestTodo(`bulk_${i}`));
    } else if (type === 'note') {
      items.push(generateTestNote(`bulk_${i}`));
    }
  }
  
  // Navigate to appropriate page
  await page.goto(`/${type}s`);
  
  // Create items
  for (const item of items) {
    if (type === 'todo') {
      await page.getByRole('button', { name: 'Add TODO' }).click();
      await page.fill('input[name="title"]', item.title);
      await page.fill('textarea[name="description"]', (item as TestTodo).description || '');
      await page.getByRole('button', { name: 'Create TODO' }).click();
    } else if (type === 'note') {
      await page.getByRole('button', { name: 'New Note' }).click();
      await page.fill('input[name="title"]', item.title);
      await page.fill('textarea[name="content"]', (item as TestNote).content);
      await page.getByRole('button', { name: 'Create' }).click();
    }
    
    await page.waitForTimeout(200); // Brief wait between creations
  }
}