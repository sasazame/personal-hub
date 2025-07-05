import { useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { useCrudMutation } from './useCrudMutation';

export interface EntityService<TEntity, TCreateDto, TUpdateDto> {
  getAll?: () => Promise<TEntity[]>;
  getById?: (id: number) => Promise<TEntity>;
  create?: (data: TCreateDto) => Promise<TEntity>;
  update?: (id: number, data: TUpdateDto) => Promise<TEntity>;
  delete?: (id: number) => Promise<void>;
}

export interface EntityHookConfig<TEntity, TCreateDto, TUpdateDto, TFilters = void> {
  entityName: string;
  service: EntityService<TEntity, TCreateDto, TUpdateDto>;
  queryKey: string | string[];
  getFilters?: (filters: TFilters) => Promise<TEntity[]>;
  staleTime?: number;
  onCreateSuccess?: (data: TEntity) => void;
  onUpdateSuccess?: (data: TEntity) => void;
  onDeleteSuccess?: (id: number) => void;
  additionalInvalidateKeys?: string[][];
}

/**
 * Factory to create entity-specific hooks with CRUD operations
 */
export function createEntityHooks<
  TEntity,
  TCreateDto = Partial<TEntity>,
  TUpdateDto = Partial<TEntity>,
  TFilters = void
>(config: EntityHookConfig<TEntity, TCreateDto, TUpdateDto, TFilters>) {
  const {
    entityName,
    service,
    queryKey,
    getFilters,
    staleTime = 1000 * 60 * 5, // 5 minutes default
    onCreateSuccess,
    onUpdateSuccess,
    onDeleteSuccess,
    additionalInvalidateKeys = [],
  } = config;

  const baseQueryKey = Array.isArray(queryKey) ? queryKey : [queryKey];

  // Main list hook
  const useEntityList = (filters?: TFilters, queryOptions?: Partial<UseQueryOptions<TEntity[]>>) => {
    return useQuery({
      queryKey: filters ? [...baseQueryKey, 'filtered', filters] : [...baseQueryKey, 'all'],
      queryFn: async () => {
        if (filters && getFilters) {
          return getFilters(filters);
        }
        if (service.getAll) {
          return service.getAll();
        }
        throw new Error(`No getAll method defined for ${entityName}`);
      },
      staleTime,
      ...queryOptions,
    });
  };

  // Single entity hook
  const useEntity = (id: number | undefined, queryOptions?: Partial<UseQueryOptions<TEntity>>) => {
    return useQuery({
      queryKey: [...baseQueryKey, id],
      queryFn: () => {
        if (!id) throw new Error('ID is required');
        if (service.getById) {
          return service.getById(id);
        }
        throw new Error(`No getById method defined for ${entityName}`);
      },
      enabled: !!id,
      ...queryOptions,
    });
  };

  // Create mutation hook
  const useCreateEntity = () => {
    const queryClient = useQueryClient();
    
    const mutation = useCrudMutation<TEntity, TCreateDto>({
      mutationFn: (data) => {
        if (service.create) {
          return service.create(data);
        }
        throw new Error(`No create method defined for ${entityName}`);
      },
      queryKey: baseQueryKey,
      successMessage: `${entityName}.created`,
      errorMessage: `${entityName}.createFailed`,
      invalidateQueries: additionalInvalidateKeys,
      onSuccess: (data) => {
        onCreateSuccess?.(data);
      },
    });
    
    // Return the full mutation object to expose all properties
    return mutation;
  };

  // Update mutation hook
  const useUpdateEntity = () => {
    const queryClient = useQueryClient();
    
    const mutation = useCrudMutation<TEntity, { id: number; data: TUpdateDto }>({
      mutationFn: ({ id, data }) => {
        if (service.update) {
          return service.update(id, data);
        }
        throw new Error(`No update method defined for ${entityName}`);
      },
      queryKey: baseQueryKey,
      successMessage: `${entityName}.updated`,
      errorMessage: `${entityName}.updateFailed`,
      invalidateQueries: additionalInvalidateKeys,
      onSuccess: (data, variables) => {
        // Update specific entity in cache
        queryClient.setQueryData([...baseQueryKey, variables.id], data);
        onUpdateSuccess?.(data);
      },
    });
    
    return mutation;
  };

  // Delete mutation hook
  const useDeleteEntity = () => {
    const queryClient = useQueryClient();
    
    const mutation = useCrudMutation<void, number>({
      mutationFn: (id) => {
        if (service.delete) {
          return service.delete(id);
        }
        throw new Error(`No delete method defined for ${entityName}`);
      },
      queryKey: baseQueryKey,
      successMessage: `${entityName}.deleted`,
      errorMessage: `${entityName}.deleteFailed`,
      invalidateQueries: additionalInvalidateKeys,
      onSuccess: (_, id) => {
        // Remove specific entity from cache
        queryClient.removeQueries({ queryKey: [...baseQueryKey, id] });
        onDeleteSuccess?.(id);
      },
    });
    
    return mutation;
  };

  // Combined hook for convenience
  const useEntityCrud = (filters?: TFilters) => {
    const listQuery = useEntityList(filters);
    const createMutation = useCreateEntity();
    const updateMutation = useUpdateEntity();
    const deleteMutation = useDeleteEntity();

    return {
      // Data
      items: listQuery.data ?? [],
      isLoading: listQuery.isLoading,
      error: listQuery.error,
      
      // Mutations
      create: createMutation.mutate,
      update: updateMutation.mutate,
      delete: deleteMutation.mutate,
      
      // Loading states
      isCreating: createMutation.isLoading,
      isUpdating: updateMutation.isLoading,
      isDeleting: deleteMutation.isLoading,
      
      // Async versions
      createAsync: createMutation.mutateAsync,
      updateAsync: updateMutation.mutateAsync,
      deleteAsync: deleteMutation.mutateAsync,
    };
  };

  return {
    [`use${entityName}List`]: useEntityList,
    [`use${entityName}`]: useEntity,
    [`useCreate${entityName}`]: useCreateEntity,
    [`useUpdate${entityName}`]: useUpdateEntity,
    [`useDelete${entityName}`]: useDeleteEntity,
    [`use${entityName}Crud`]: useEntityCrud,
  };
}

/**
 * Helper to create paginated list hooks
 */
export function createPaginatedEntityHooks<TEntity, TPageParams = { page: number; size: number }>(
  entityName: string,
  queryKey: string | string[],
  fetchFn: (params: TPageParams) => Promise<{ content: TEntity[]; totalElements: number; totalPages: number }>
) {
  const baseQueryKey = Array.isArray(queryKey) ? queryKey : [queryKey];

  return (params: TPageParams, queryOptions?: Partial<UseQueryOptions>) => {
    return useQuery({
      queryKey: [...baseQueryKey, 'paginated', params],
      queryFn: () => fetchFn(params),
      ...queryOptions,
    });
  };
}