import { useMutation, useQueryClient, UseMutationOptions } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useToast } from './useToast';

export interface CrudMutationConfig<TData, TVariables, TContext = unknown> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  queryKey?: string[];
  successMessage?: string | ((data: TData) => string);
  errorMessage?: string | ((error: Error) => string);
  onSuccess?: (data: TData, variables: TVariables, context: TContext | undefined) => void;
  onError?: (error: Error, variables: TVariables, context: TContext | undefined) => void;
  invalidateQueries?: string[][];
}

export interface CrudMutationResult<TData, TVariables, TContext = unknown> {
  mutate: (
    variables: TVariables,
    options?: Omit<UseMutationOptions<TData, Error, TVariables, TContext>, 'mutationFn'>
  ) => void;
  mutateAsync: (
    variables: TVariables,
    options?: Omit<UseMutationOptions<TData, Error, TVariables, TContext>, 'mutationFn'>
  ) => Promise<TData>;
  isLoading: boolean;
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: Error | null;
  data: TData | undefined;
  reset: () => void;
}

/**
 * Generic CRUD mutation hook factory
 * Provides consistent error handling, success messages, and query invalidation
 */
export function useCrudMutation<TData = unknown, TVariables = void, TContext = unknown>(
  config: CrudMutationConfig<TData, TVariables, TContext>
): CrudMutationResult<TData, TVariables, TContext> {
  const t = useTranslations();
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  const {
    mutationFn,
    queryKey,
    successMessage,
    errorMessage,
    onSuccess,
    onError,
    invalidateQueries = [],
  } = config;

  const mutation = useMutation<TData, Error, TVariables, TContext>({
    mutationFn,
    onSuccess: (data, variables, context) => {
      // Show success message
      if (successMessage) {
        const message = typeof successMessage === 'function' 
          ? successMessage(data) 
          : successMessage;
        showSuccess(message);
      }

      // Invalidate queries
      if (queryKey) {
        queryClient.invalidateQueries({ queryKey });
      }
      
      invalidateQueries.forEach(key => {
        queryClient.invalidateQueries({ queryKey: key });
      });

      // Call custom onSuccess handler
      onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      // Show error message
      if (errorMessage) {
        const message = typeof errorMessage === 'function'
          ? errorMessage(error)
          : errorMessage;
        showError(message);
      } else {
        showError(error.message || t('common.error'));
      }

      // Call custom onError handler
      onError?.(error, variables, context);
    },
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset,
  };
}

/**
 * Factory function to create entity-specific CRUD hooks
 */
export function createCrudHooks<TEntity, TCreateDto, TUpdateDto>(
  entityName: string,
  service: {
    create: (data: TCreateDto) => Promise<TEntity>;
    update: (id: number, data: TUpdateDto) => Promise<TEntity>;
    delete: (id: number) => Promise<void>;
  }
) {
  const useCreate = () => {
    const t = useTranslations();
    return useCrudMutation<TEntity, TCreateDto>({
      mutationFn: service.create,
      queryKey: [`${entityName}-list`],
      successMessage: t(`${entityName}.created`),
      errorMessage: (error) => error.message || t(`${entityName}.createFailed`),
    });
  };

  const useUpdate = () => {
    const t = useTranslations();
    return useCrudMutation<TEntity, { id: number; data: TUpdateDto }>({
      mutationFn: ({ id, data }) => service.update(id, data),
      queryKey: [`${entityName}-list`],
      successMessage: t(`${entityName}.updated`),
      errorMessage: (error) => error.message || t(`${entityName}.updateFailed`),
    });
  };

  const useDelete = () => {
    const t = useTranslations();
    return useCrudMutation<void, number>({
      mutationFn: service.delete,
      queryKey: [`${entityName}-list`],
      successMessage: t(`${entityName}.deleted`),
      errorMessage: (error) => error.message || t(`${entityName}.deleteFailed`),
    });
  };

  return { useCreate, useUpdate, useDelete };
}