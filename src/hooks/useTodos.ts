import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Todo, CreateTodoDto, UpdateTodoDto, TodoStatus } from '@/types/todo';
import { todoApi } from '@/lib/api';
import { createEntityHooks } from './useEntityHooks';

// Create filter type for todos
interface TodoFilters {
  status?: TodoStatus | 'ALL';
  parentId?: number;
}

// Create the base entity hooks
const entityHooks = createEntityHooks<Todo, CreateTodoDto, UpdateTodoDto, TodoFilters>({
  entityName: 'Todo',
  service: {
    getAll: async () => {
      const response = await todoApi.getAll();
      return response.content;
    },
    getById: (id: number) => todoApi.getById(id),
    create: (data: CreateTodoDto) => todoApi.create(data),
    update: (id: number, data: UpdateTodoDto) => todoApi.update(id, data),
    delete: (id: number) => todoApi.delete(id),
  },
  queryKey: 'todos',
  getFilters: async (filters: TodoFilters) => {
    if (filters.status && filters.status !== 'ALL') {
      return todoApi.getByStatus(filters.status);
    }
    if (filters.parentId !== undefined) {
      return todoApi.getChildren(filters.parentId);
    }
    const response = await todoApi.getAll();
    return response.content;
  },
  staleTime: 1000 * 60 * 2, // 2 minutes
  additionalInvalidateKeys: [['todos'], ['recurring-tasks']],
});

// Export the standard CRUD hooks
export const useTodos = entityHooks.useTodoList;
export const useTodo = entityHooks.useTodo;
export const useCreateTodo = entityHooks.useCreateTodo;
export const useUpdateTodo = entityHooks.useUpdateTodo;
export const useDeleteTodo = entityHooks.useDeleteTodo;

// Additional custom hooks for todos
export function useToggleTodoStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => todoApi.toggleStatus(id),
    onSuccess: (updatedTodo) => {
      // Update specific todo in cache
      queryClient.setQueryData(['todos', updatedTodo.id], updatedTodo);
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
}

export function useChildTodos(parentId: number | null) {
  return useQuery({
    queryKey: ['todos', 'children', parentId],
    queryFn: () => parentId ? todoApi.getChildren(parentId) : Promise.resolve([]),
    enabled: !!parentId,
  });
}

export function useRepeatableTodos() {
  return useQuery({
    queryKey: ['todos', 'repeatable'],
    queryFn: () => todoApi.getRepeatable(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useTodoInstances(originalTodoId: number | null) {
  return useQuery({
    queryKey: ['todos', 'instances', originalTodoId],
    queryFn: () => originalTodoId ? todoApi.getInstances(originalTodoId) : Promise.resolve([]),
    enabled: !!originalTodoId,
  });
}

export function useGenerateTodoInstances() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => todoApi.generateInstances(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      queryClient.invalidateQueries({ queryKey: ['recurring-tasks'] });
    },
  });
}

// Combined hook for todos page
export function useTodosPage(status: TodoStatus | 'ALL' = 'ALL') {
  const todosQuery = useTodos({ status });
  const createMutation = useCreateTodo();
  const updateMutation = useUpdateTodo();
  const deleteMutation = useDeleteTodo();
  const toggleStatusMutation = useToggleTodoStatus();
  const generateInstancesMutation = useGenerateTodoInstances();
  
  return {
    todos: todosQuery.data ?? [],
    isLoading: todosQuery.isLoading,
    error: todosQuery.error,
    createTodo: createMutation.mutate,
    updateTodo: updateMutation.mutate,
    deleteTodo: deleteMutation.mutate,
    toggleStatus: toggleStatusMutation.mutate,
    generateInstances: generateInstancesMutation.mutate,
    isCreating: createMutation.isLoading,
    isUpdating: updateMutation.isLoading,
    isDeleting: deleteMutation.isLoading,
  };
}