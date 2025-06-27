import { useState, useCallback } from 'react';
import { UseFormReturn } from 'react-hook-form';

export interface UseFormSubmitOptions<TFormData, TSubmitData = TFormData> {
  onSubmit: (data: TSubmitData) => Promise<void> | void;
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
  transform?: (data: TFormData) => TSubmitData;
  resetOnSuccess?: boolean;
  closeOnSuccess?: boolean;
}

export interface UseFormSubmitReturn<TFormData> {
  handleSubmit: (data: TFormData) => Promise<void>;
  isSubmitting: boolean;
}

/**
 * Generic hook for handling form submissions with common patterns
 * Reduces code duplication across form components
 */
export function useFormSubmit<TFormData, TSubmitData = TFormData>(
  options: UseFormSubmitOptions<TFormData, TSubmitData>,
  form?: UseFormReturn<TFormData>,
  onClose?: () => void
): UseFormSubmitReturn<TFormData> {
  const {
    onSubmit,
    onSuccess,
    onError,
    transform,
    resetOnSuccess = true,
    closeOnSuccess = true,
  } = options;

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(
    async (data: TFormData) => {
      try {
        setIsSubmitting(true);
        
        // Transform data if transformer is provided
        const submitData = transform ? transform(data) : (data as unknown as TSubmitData);
        
        // Submit the data
        await onSubmit(submitData);
        
        // Handle success
        if (resetOnSuccess && form) {
          form.reset();
        }
        
        if (closeOnSuccess && onClose) {
          onClose();
        }
        
        onSuccess?.();
      } catch (error) {
        console.error('Form submission error:', error);
        onError?.(error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [onSubmit, onSuccess, onError, transform, resetOnSuccess, closeOnSuccess, form, onClose]
  );

  return { handleSubmit, isSubmitting };
}

/**
 * Helper to create a form data transformer with default values
 */
export function createFormDataTransformer<TFormData, TSubmitData>(
  defaultValues: Partial<TSubmitData>,
  customTransform?: (data: TFormData) => Partial<TSubmitData>
): (data: TFormData) => TSubmitData {
  return (data: TFormData): TSubmitData => {
    const transformed = customTransform ? customTransform(data) : data;
    
    // Merge with defaults, filtering out undefined values
    const result = { ...defaultValues } as TSubmitData;
    
    Object.entries(transformed as any).forEach(([key, value]) => {
      if (value !== undefined) {
        (result as any)[key] = value;
      }
    });
    
    return result;
  };
}

/**
 * Common form data transformations
 */
export const formTransformers = {
  /**
   * Ensure array fields have default empty arrays
   */
  ensureArrays: <T extends Record<string, any>>(
    data: T,
    arrayFields: Array<keyof T>
  ): T => {
    const result = { ...data };
    arrayFields.forEach(field => {
      if (!result[field]) {
        result[field] = [] as any;
      }
    });
    return result;
  },

  /**
   * Convert empty strings to undefined
   */
  emptyToUndefined: <T extends Record<string, any>>(data: T): T => {
    const result = {} as T;
    Object.entries(data).forEach(([key, value]) => {
      result[key as keyof T] = value === '' ? undefined : value;
    });
    return result;
  },

  /**
   * Format date fields
   */
  formatDates: <T extends Record<string, any>>(
    data: T,
    dateFields: Array<keyof T>,
    formatter: (date: string) => string
  ): T => {
    const result = { ...data };
    dateFields.forEach(field => {
      if (result[field]) {
        result[field] = formatter(result[field] as string) as any;
      }
    });
    return result;
  },
};