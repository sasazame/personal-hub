import { useState, useEffect } from 'react';
import { UseFormReturn, FieldValues } from 'react-hook-form';
import { useCrudMutation, CrudMutationConfig } from './useCrudMutation';

export interface UseModalFormConfig<TFormData extends FieldValues, TEntity, TCreateDto, TUpdateDto> {
  // Form configuration
  form: UseFormReturn<TFormData>;
  
  // Modal state
  isOpen: boolean;
  onClose: () => void;
  
  // Entity being edited (if any)
  entity?: TEntity;
  
  // Transform form data to DTOs
  transformCreate?: (data: TFormData) => TCreateDto;
  transformUpdate?: (data: TFormData) => TUpdateDto;
  
  // Mutation configurations
  createConfig: Omit<CrudMutationConfig<TEntity, TCreateDto>, 'mutationFn'> & {
    mutationFn: (data: TCreateDto) => Promise<TEntity>;
  };
  updateConfig: Omit<CrudMutationConfig<TEntity, { id: number; data: TUpdateDto }>, 'mutationFn'> & {
    mutationFn: (params: { id: number; data: TUpdateDto }) => Promise<TEntity>;
  };
  
  // Get entity ID
  getEntityId?: (entity: TEntity & { id?: number }) => number;
  
  // Callbacks
  onSuccess?: (data: TEntity) => void;
}

/**
 * Generic hook for modal forms with create/update functionality
 */
export function useModalForm<TFormData extends FieldValues, TEntity, TCreateDto = TFormData, TUpdateDto = Partial<TFormData>>({
  form,
  isOpen,
  onClose,
  entity,
  transformCreate = (data) => data as unknown as TCreateDto,
  transformUpdate = (data) => data as unknown as TUpdateDto,
  createConfig,
  updateConfig,
  getEntityId = (entity: TEntity & { id?: number }) => entity.id as number,
  onSuccess,
}: UseModalFormConfig<TFormData, TEntity, TCreateDto, TUpdateDto>) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const createMutation = useCrudMutation<TEntity, TCreateDto>({
    ...createConfig,
    onSuccess: (data) => {
      onSuccess?.(data);
      onClose();
      form.reset();
      createConfig.onSuccess?.(data, {} as TCreateDto, undefined);
    },
  });
  
  const updateMutation = useCrudMutation<TEntity, { id: number; data: TUpdateDto }>({
    ...updateConfig,
    onSuccess: (data) => {
      onSuccess?.(data);
      onClose();
      form.reset();
      updateConfig.onSuccess?.(data, {} as { id: number; data: TUpdateDto }, undefined);
    },
  });
  
  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      form.reset();
    }
  }, [isOpen, form]);
  
  const handleSubmit = form.handleSubmit(async (data: TFormData) => {
    setIsSubmitting(true);
    try {
      if (entity) {
        const updateData = transformUpdate(data);
        await updateMutation.mutateAsync({
          id: getEntityId(entity),
          data: updateData,
        });
      } else {
        const createData = transformCreate(data);
        await createMutation.mutateAsync(createData);
      }
    } finally {
      setIsSubmitting(false);
    }
  });
  
  return {
    isSubmitting: isSubmitting || createMutation.isLoading || updateMutation.isLoading,
    isError: createMutation.isError || updateMutation.isError,
    error: createMutation.error || updateMutation.error,
    handleSubmit,
    resetForm: () => form.reset(),
  };
}

/**
 * Simplified version for forms that don't need separate create/update DTOs
 */
export function useSimpleModalForm<TFormData extends Record<string, unknown>, TEntity extends { id?: number }>({
  form,
  isOpen,
  onClose,
  entity,
  entityName,
  service,
  onSuccess,
}: {
  form: UseFormReturn<TFormData>;
  isOpen: boolean;
  onClose: () => void;
  entity?: TEntity;
  entityName: string;
  service: {
    create: (data: TFormData) => Promise<TEntity>;
    update: (id: number, data: Partial<TFormData>) => Promise<TEntity>;
  };
  onSuccess?: (data: TEntity) => void;
}) {
  return useModalForm<TFormData, TEntity, TFormData, Partial<TFormData>>({
    form,
    isOpen,
    onClose,
    entity,
    createConfig: {
      mutationFn: service.create,
      queryKey: [`${entityName}-list`],
      successMessage: `${entityName}.created`,
      errorMessage: `${entityName}.createFailed`,
    },
    updateConfig: {
      mutationFn: ({ id, data }) => service.update(id, data),
      queryKey: [`${entityName}-list`],
      successMessage: `${entityName}.updated`,
      errorMessage: `${entityName}.updateFailed`,
    },
    onSuccess,
  });
}