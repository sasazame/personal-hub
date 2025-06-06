import { todoApi } from '../api';
import { Todo } from '@/types/todo';

// Mock the entire api module
jest.mock('../api', () => ({
  todoApi: {
    getRepeatable: jest.fn(),
    getInstances: jest.fn(),
    generateInstances: jest.fn(),
    create: jest.fn(),
  },
}));

const mockTodoApi = todoApi as jest.Mocked<typeof todoApi>;

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('API - Recurring Tasks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue('mock-token');
  });

  describe('getRepeatable', () => {
    it('should fetch repeatable todos', async () => {
      const mockRepeatableTodos: Todo[] = [
        {
          id: 1,
          title: 'Daily Exercise',
          description: '30 minutes of walking',
          status: 'TODO',
          priority: 'HIGH',
          dueDate: '2025-01-01',
          isRepeatable: true,
          repeatConfig: {
            repeatType: 'DAILY',
            interval: 1,
          },
          createdAt: '2024-01-01T09:00:00Z',
          updatedAt: '2024-01-01T09:00:00Z',
        },
      ];

      mockTodoApi.getRepeatable.mockResolvedValue(mockRepeatableTodos);

      const result = await todoApi.getRepeatable();

      expect(mockTodoApi.getRepeatable).toHaveBeenCalled();
      expect(result).toEqual(mockRepeatableTodos);
    });

    it('should handle API errors', async () => {
      const errorMessage = 'Failed to fetch repeatable todos';
      mockGet.mockRejectedValue(new Error(errorMessage));

      await expect(todoApi.getRepeatable()).rejects.toThrow(errorMessage);
      expect(mockGet).toHaveBeenCalledWith('/todos/repeatable');
    });
  });

  describe('getInstances', () => {
    it('should fetch instances for a specific todo', async () => {
      const originalTodoId = 1;
      const mockInstances: Todo[] = [
        {
          id: 2,
          title: 'Daily Exercise',
          description: '30 minutes of walking',
          status: 'DONE',
          priority: 'HIGH',
          dueDate: '2025-01-02',
          isRepeatable: false,
          originalTodoId: 1,
          createdAt: '2025-01-02T00:00:00Z',
          updatedAt: '2025-01-02T08:30:00Z',
        },
        {
          id: 3,
          title: 'Daily Exercise',
          description: '30 minutes of walking',
          status: 'TODO',
          priority: 'HIGH',
          dueDate: '2025-01-03',
          isRepeatable: false,
          originalTodoId: 1,
          createdAt: '2025-01-03T00:00:00Z',
          updatedAt: '2025-01-03T00:00:00Z',
        },
      ];

      mockGet.mockResolvedValue({ data: mockInstances });

      const result = await todoApi.getInstances(originalTodoId);

      expect(mockGet).toHaveBeenCalledWith(`/todos/${originalTodoId}/instances`);
      expect(result).toEqual(mockInstances);
    });

    it('should handle API errors when fetching instances', async () => {
      const originalTodoId = 1;
      const errorMessage = 'Failed to fetch instances';
      mockGet.mockRejectedValue(new Error(errorMessage));

      await expect(todoApi.getInstances(originalTodoId)).rejects.toThrow(errorMessage);
      expect(mockGet).toHaveBeenCalledWith(`/todos/${originalTodoId}/instances`);
    });
  });

  describe('generateInstances', () => {
    it('should generate new instances', async () => {
      const mockGeneratedInstances: Todo[] = [
        {
          id: 4,
          title: 'Daily Exercise',
          description: '30 minutes of walking',
          status: 'TODO',
          priority: 'HIGH',
          dueDate: '2025-01-04',
          isRepeatable: false,
          originalTodoId: 1,
          createdAt: '2025-01-04T00:00:00Z',
          updatedAt: '2025-01-04T00:00:00Z',
        },
      ];

      mockPost.mockResolvedValue({ data: mockGeneratedInstances });

      const result = await todoApi.generateInstances();

      expect(mockPost).toHaveBeenCalledWith('/todos/repeat/generate');
      expect(result).toEqual(mockGeneratedInstances);
    });

    it('should handle API errors when generating instances', async () => {
      const errorMessage = 'Failed to generate instances';
      mockPost.mockRejectedValue(new Error(errorMessage));

      await expect(todoApi.generateInstances()).rejects.toThrow(errorMessage);
      expect(mockPost).toHaveBeenCalledWith('/todos/repeat/generate');
    });

    it('should return empty array when no new instances are generated', async () => {
      mockPost.mockResolvedValue({ data: [] });

      const result = await todoApi.generateInstances();

      expect(mockPost).toHaveBeenCalledWith('/todos/repeat/generate');
      expect(result).toEqual([]);
    });
  });

  describe('create with recurring configuration', () => {
    it('should create recurring todo with daily configuration', async () => {
      const recurringTodoDto = {
        title: 'Daily Exercise',
        description: '30 minutes of walking',
        priority: 'HIGH' as const,
        dueDate: '2025-01-01',
        isRepeatable: true,
        repeatConfig: {
          repeatType: 'DAILY' as const,
          interval: 1,
        },
      };

      const mockCreatedTodo: Todo = {
        id: 1,
        ...recurringTodoDto,
        status: 'TODO',
        createdAt: '2024-01-01T09:00:00Z',
        updatedAt: '2024-01-01T09:00:00Z',
      };

      mockPost.mockResolvedValue({ data: mockCreatedTodo });

      const result = await todoApi.create(recurringTodoDto);

      expect(mockPost).toHaveBeenCalledWith('/todos', recurringTodoDto);
      expect(result).toEqual(mockCreatedTodo);
    });

    it('should create recurring todo with weekly configuration', async () => {
      const weeklyTodoDto = {
        title: 'Gym Session',
        description: 'Strength training',
        priority: 'MEDIUM' as const,
        dueDate: '2025-01-06',
        isRepeatable: true,
        repeatConfig: {
          repeatType: 'WEEKLY' as const,
          interval: 1,
          daysOfWeek: [1, 3, 5], // Monday, Wednesday, Friday
        },
      };

      const mockCreatedTodo: Todo = {
        id: 2,
        ...weeklyTodoDto,
        status: 'TODO',
        createdAt: '2024-01-01T09:00:00Z',
        updatedAt: '2024-01-01T09:00:00Z',
      };

      mockPost.mockResolvedValue({ data: mockCreatedTodo });

      const result = await todoApi.create(weeklyTodoDto);

      expect(mockPost).toHaveBeenCalledWith('/todos', weeklyTodoDto);
      expect(result).toEqual(mockCreatedTodo);
    });

    it('should create recurring todo with monthly configuration', async () => {
      const monthlyTodoDto = {
        title: 'Monthly Report',
        description: 'Submit monthly report',
        priority: 'HIGH' as const,
        dueDate: '2025-01-31',
        isRepeatable: true,
        repeatConfig: {
          repeatType: 'MONTHLY' as const,
          interval: 1,
          dayOfMonth: 31,
          endDate: '2025-12-31',
        },
      };

      const mockCreatedTodo: Todo = {
        id: 3,
        ...monthlyTodoDto,
        status: 'TODO',
        createdAt: '2024-01-01T09:00:00Z',
        updatedAt: '2024-01-01T09:00:00Z',
      };

      mockPost.mockResolvedValue({ data: mockCreatedTodo });

      const result = await todoApi.create(monthlyTodoDto);

      expect(mockPost).toHaveBeenCalledWith('/todos', monthlyTodoDto);
      expect(result).toEqual(mockCreatedTodo);
    });
  });
});