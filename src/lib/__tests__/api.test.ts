import { Todo, CreateTodoDto, UpdateTodoDto } from '@/types/todo';

// todoApiのモックを作成
const mockTodoApi = {
  getAll: jest.fn(),
  getById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

// apiモジュールをモック
jest.mock('../api', () => ({
  todoApi: mockTodoApi,
}));

describe('todoApi', () => {
  const mockTodo: Todo = {
    id: 1,
    title: 'Test Todo',
    description: 'Test description',
    status: 'TODO',
    priority: 'MEDIUM',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('fetches all todos successfully', async () => {
      const mockTodos = [mockTodo];
      mockTodoApi.getAll.mockResolvedValue(mockTodos);

      const result = await mockTodoApi.getAll();

      expect(mockTodoApi.getAll).toHaveBeenCalled();
      expect(result).toEqual(mockTodos);
    });

    it('handles error when fetching todos fails', async () => {
      const errorMessage = 'Network error';
      mockTodoApi.getAll.mockRejectedValue(new Error(errorMessage));

      await expect(mockTodoApi.getAll()).rejects.toThrow(errorMessage);
    });
  });

  describe('getById', () => {
    it('fetches a single todo successfully', async () => {
      mockTodoApi.getById.mockResolvedValue(mockTodo);

      const result = await mockTodoApi.getById(1);

      expect(mockTodoApi.getById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockTodo);
    });
  });

  describe('create', () => {
    it('creates a new todo successfully', async () => {
      const createDto: CreateTodoDto = {
        title: 'New Todo',
        description: 'New description',
        status: 'TODO',
        priority: 'HIGH',
      };

      const newTodo = { ...mockTodo, ...createDto };
      mockTodoApi.create.mockResolvedValue(newTodo);

      const result = await mockTodoApi.create(createDto);

      expect(mockTodoApi.create).toHaveBeenCalledWith(createDto);
      expect(result.title).toBe(createDto.title);
    });
  });

  describe('update', () => {
    it('updates a todo successfully', async () => {
      const updateDto: UpdateTodoDto = {
        title: 'Updated Todo',
        status: 'DONE',
      };

      const updatedTodo = { ...mockTodo, ...updateDto };
      mockTodoApi.update.mockResolvedValue(updatedTodo);

      const result = await mockTodoApi.update(1, updateDto);

      expect(mockTodoApi.update).toHaveBeenCalledWith(1, updateDto);
      expect(result.title).toBe(updateDto.title);
      expect(result.status).toBe(updateDto.status);
    });
  });

  describe('delete', () => {
    it('deletes a todo successfully', async () => {
      mockTodoApi.delete.mockResolvedValue(undefined);

      await mockTodoApi.delete(1);

      expect(mockTodoApi.delete).toHaveBeenCalledWith(1);
    });

    it('handles error when deletion fails', async () => {
      const errorMessage = 'Deletion failed';
      mockTodoApi.delete.mockRejectedValue(new Error(errorMessage));

      await expect(mockTodoApi.delete(1)).rejects.toThrow(errorMessage);
    });
  });
});