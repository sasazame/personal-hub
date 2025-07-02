import { render, screen, waitFor } from '@/test/test-utils';
import TodosPage from '../page';
import { todoApi } from '@/lib/api';

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'todo.title': 'TODOs',
      'todo.subtitle': 'Manage your tasks',
      'todo.addTodo': 'Add TODO',
      'todo.noTodos': 'No todos found',
      'common.loading': 'Loading...',
      'errors.general': 'An error occurred',
    };
    return translations[key] || key;
  },
}));

// Mock API
jest.mock('@/lib/api', () => ({
  todoApi: {
    getAll: jest.fn(),
    getByStatus: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    getChildren: jest.fn(),
    toggleStatus: jest.fn(),
    generateInstances: jest.fn(),
  },
}));

// Mock components
jest.mock('@/components/auth', () => ({
  AuthGuard: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('@/components/layout', () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('@/components/FeatureFlag', () => ({
  FeatureFlag: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('@/hooks/usePageTitle', () => ({
  usePageTitle: jest.fn(),
}));

// Mock the toast
jest.mock('@/components/ui/toast', () => ({
  showSuccess: jest.fn(),
  showError: jest.fn(),
}));

describe('TodosPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Set up default mock responses
    (todoApi.getAll as jest.Mock).mockResolvedValue({
      content: [],
      pageable: { pageNumber: 0, pageSize: 10, sort: { sorted: false } },
      totalElements: 0,
      totalPages: 0,
      first: true,
      last: true,
    });
    (todoApi.getChildren as jest.Mock).mockResolvedValue([]);
  });

  it('renders the Add TODO button with a + prefix', async () => {
    render(<TodosPage />);

    // Wait for the page to load
    await waitFor(() => {
      expect(screen.getByText('TODOs')).toBeInTheDocument();
    });

    // Check that the Add TODO button exists
    const addButton = screen.getByRole('button', { name: /Add TODO/i });
    expect(addButton).toBeInTheDocument();
    
    // Check that the button contains the Plus icon
    const plusIcon = addButton.querySelector('svg');
    expect(plusIcon).toBeInTheDocument();
  });
});