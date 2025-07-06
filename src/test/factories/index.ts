/**
 * Factory functions for creating test data
 */

import { Todo, TodoStatus, TodoPriority } from '@/types/todo';
import { Note } from '@/types/note';
import { Goal, GoalType, MetricType, GoalStatus } from '@/types/goal';
import { CalendarEvent } from '@/types/calendar';
import { User } from '@/types/user';

// Counter for unique IDs
let idCounter = 1;

/**
 * Create a mock Todo
 */
export function createMockTodo(overrides: Partial<Todo> = {}): Todo {
  const id = overrides.id ?? idCounter++;
  
  return {
    id,
    title: `Todo ${id}`,
    description: `Description for todo ${id}`,
    status: 'TODO' as TodoStatus,
    priority: 'MEDIUM' as TodoPriority,
    dueDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    parentId: null,
    isRepeatable: false,
    repeatConfig: null,
    originalTodoId: null,
    ...overrides,
  };
}

/**
 * Create multiple mock Todos
 */
export function createMockTodos(count: number, overrides: Partial<Todo> = {}): Todo[] {
  return Array.from({ length: count }, (_, i) => 
    createMockTodo({
      ...overrides,
      title: overrides.title ? `${overrides.title} ${i + 1}` : undefined,
    })
  );
}

/**
 * Create a mock Note
 */
export function createMockNote(overrides: Partial<Note> = {}): Note {
  const id = overrides.id ?? idCounter++;
  
  return {
    id,
    title: `Note ${id}`,
    content: `Content for note ${id}`,
    tags: ['tag1', 'tag2'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Create multiple mock Notes
 */
export function createMockNotes(count: number, overrides: Partial<Note> = {}): Note[] {
  return Array.from({ length: count }, (_, i) => 
    createMockNote({
      ...overrides,
      title: overrides.title ? `${overrides.title} ${i + 1}` : undefined,
    })
  );
}

/**
 * Create a mock Goal
 */
export function createMockGoal(overrides: Partial<Goal> = {}): Goal {
  const id = overrides.id ?? idCounter++;
  
  return {
    id,
    title: `Goal ${id}`,
    description: `Description for goal ${id}`,
    goalType: 'PERSONAL' as GoalType,
    metricType: 'NUMERIC' as MetricType,
    metricUnit: 'units',
    targetValue: 100,
    currentValue: 50,
    progressPercentage: 50,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 30 * 86400000).toISOString(), // 30 days from now
    status: 'IN_PROGRESS' as GoalStatus,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Create multiple mock Goals
 */
export function createMockGoals(count: number, overrides: Partial<Goal> = {}): Goal[] {
  return Array.from({ length: count }, (_, i) => 
    createMockGoal({
      ...overrides,
      title: overrides.title ? `${overrides.title} ${i + 1}` : undefined,
    })
  );
}

/**
 * Create a mock CalendarEvent
 */
export function createMockCalendarEvent(overrides: Partial<CalendarEvent> = {}): CalendarEvent {
  const id = overrides.id ?? idCounter++;
  const startDateTime = overrides.startDateTime || new Date().toISOString();
  const endDateTime = overrides.endDateTime || new Date(Date.now() + 3600000).toISOString(); // 1 hour later
  
  return {
    id,
    title: `Event ${id}`,
    description: `Description for event ${id}`,
    startDateTime,
    endDateTime,
    allDay: false,
    color: '#3B82F6',
    googleEventId: undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Create multiple mock CalendarEvents
 */
export function createMockCalendarEvents(count: number, overrides: Partial<CalendarEvent> = {}): CalendarEvent[] {
  return Array.from({ length: count }, (_, i) => 
    createMockCalendarEvent({
      ...overrides,
      title: overrides.title ? `${overrides.title} ${i + 1}` : undefined,
      startDateTime: new Date(Date.now() + i * 86400000).toISOString(), // Stagger by days
    })
  );
}

/**
 * Create a mock User
 */
export function createMockUser(overrides: Partial<User> = {}): User {
  const id = overrides.id ?? String(idCounter++);
  
  return {
    id,
    username: `User ${id}`,
    email: `user${id}@example.com`,
    weekStartDay: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Create a paginated response
 */
export interface PaginatedResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      sorted: boolean;
      direction?: string;
      properties?: string[];
    };
  };
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export function createMockPaginatedResponse<T>(
  items: T[],
  page = 0,
  size = 20
): PaginatedResponse<T> {
  const totalElements = items.length;
  const totalPages = Math.ceil(totalElements / size);
  const start = page * size;
  const end = start + size;
  const content = items.slice(start, end);
  
  return {
    content,
    pageable: {
      pageNumber: page,
      pageSize: size,
      sort: { sorted: false },
    },
    totalElements,
    totalPages,
    first: page === 0,
    last: page === totalPages - 1,
  };
}

/**
 * Reset ID counter (useful between tests)
 */
export function resetIdCounter() {
  idCounter = 1;
}