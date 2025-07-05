/**
 * Common mock implementations for testing
 */

// Toast mock
export const toastMock = {
  showSuccess: jest.fn(),
  showError: jest.fn(),
  showWarning: jest.fn(),
  showInfo: jest.fn(),
};

// Router mock
export const routerMock = {
  push: jest.fn(),
  replace: jest.fn(),
  refresh: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  prefetch: jest.fn(),
};

// Next-intl translations mock
export const createTranslationsMock = (translations: Record<string, string> = {}) => {
  return (key: string) => {
    // Handle nested keys like 'todo.statusOptions.NOT_STARTED'
    const keys = key.split('.');
    let value = translations[key];
    
    if (!value) {
      // Try to find nested value
      let current: unknown = translations;
      for (const k of keys) {
        if (current && typeof current === 'object' && k in (current as Record<string, unknown>)) {
          current = (current as Record<string, unknown>)[k];
        } else {
          current = key; // Return key if not found
          break;
        }
      }
      value = typeof current === 'string' ? current : key;
    }
    
    return value;
  };
};

// Common translations for todos
export const todoTranslations = {
  'todo.statusOptions.NOT_STARTED': 'Not Started',
  'todo.statusOptions.IN_PROGRESS': 'In Progress',
  'todo.statusOptions.COMPLETED': 'Completed',
  'todo.priorityOptions.LOW': 'Low',
  'todo.priorityOptions.MEDIUM': 'Medium',
  'todo.priorityOptions.HIGH': 'High',
  'todo.markComplete': 'Mark as complete',
  'todo.markIncomplete': 'Mark as incomplete',
  'todo.edit': 'Edit',
  'todo.delete': 'Delete',
  'todo.addSubtask': 'Add subtask',
  'todo.subtasks': 'Subtasks',
  'todo.titleRequired': 'Title is required',
  'todo.todoAdded': 'Todo added successfully',
  'todo.todoUpdated': 'Todo updated successfully',
  'todo.todoDeleted': 'Todo deleted successfully',
};

// Common translations for auth
export const authTranslations = {
  'auth.login': 'Login',
  'auth.logout': 'Logout',
  'auth.register': 'Register',
  'auth.email': 'Email',
  'auth.password': 'Password',
  'auth.confirmPassword': 'Confirm Password',
  'auth.sessionExpired': 'Session expired',
  'auth.invalidCredentials': 'Invalid credentials',
};

// Common translations for errors
export const errorTranslations = {
  'errors.general': 'An error occurred',
  'errors.network': 'Network error',
  'errors.validation': 'Validation error',
  'errors.unauthorized': 'Unauthorized',
  'errors.notFound': 'Not found',
};

// Common translations
export const commonTranslations = {
  'common.save': 'Save',
  'common.cancel': 'Cancel',
  'common.delete': 'Delete',
  'common.edit': 'Edit',
  'common.search': 'Search',
  'common.filter': 'Filter',
  'common.all': 'All',
  'common.none': 'None',
  'common.loading': 'Loading...',
  'common.noResults': 'No results found',
};

// Combine all translations
export const defaultTranslations = {
  ...todoTranslations,
  ...authTranslations,
  ...errorTranslations,
  ...commonTranslations,
};

// Theme mock
export const themeMock = {
  theme: 'light',
  setTheme: jest.fn(),
  toggleTheme: jest.fn(),
};

// Auth context mock
export const authMock = {
  user: null,
  login: jest.fn(),
  logout: jest.fn(),
  register: jest.fn(),
  isAuthenticated: false,
  isLoading: false,
};

// Query client mock utilities
export const createMockQueryClient = () => {
  return {
    invalidateQueries: jest.fn(),
    setQueryData: jest.fn(),
    getQueryData: jest.fn(),
    removeQueries: jest.fn(),
    cancelQueries: jest.fn(),
    refetchQueries: jest.fn(),
  };
};