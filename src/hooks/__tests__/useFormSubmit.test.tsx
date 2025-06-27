import { renderHook, act } from '@testing-library/react';
import { UseFormReturn } from 'react-hook-form';
import { useFormSubmit, createFormDataTransformer, formTransformers } from '../useFormSubmit';

interface TestFormData {
  name: string;
  description?: string;
}

describe('useFormSubmit', () => {
  const mockOnSubmit = jest.fn();
  const mockOnSuccess = jest.fn();
  const mockOnError = jest.fn();
  const mockOnClose = jest.fn();
  const mockReset = jest.fn();

  const mockForm = {
    reset: mockReset,
  } as unknown as UseFormReturn<TestFormData>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle successful form submission', async () => {
    const { result } = renderHook(() =>
      useFormSubmit(
        {
          onSubmit: mockOnSubmit,
          onSuccess: mockOnSuccess,
        },
        mockForm,
        mockOnClose
      )
    );

    const testData = { name: 'Test', email: 'test@example.com' };

    await act(async () => {
      await result.current.handleSubmit(testData);
    });

    expect(mockOnSubmit).toHaveBeenCalledWith(testData);
    expect(mockOnSuccess).toHaveBeenCalled();
    expect(mockReset).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
    expect(result.current.isSubmitting).toBe(false);
  });

  it('should transform data before submission', async () => {
    const transformer = jest.fn((data) => ({
      ...data,
      transformed: true,
    }));

    const { result } = renderHook(() =>
      useFormSubmit({
        onSubmit: mockOnSubmit,
        transform: transformer,
      })
    );

    const testData = { name: 'Test' };

    await act(async () => {
      await result.current.handleSubmit(testData);
    });

    expect(transformer).toHaveBeenCalledWith(testData);
    expect(mockOnSubmit).toHaveBeenCalledWith({
      name: 'Test',
      transformed: true,
    });
  });

  it('should handle submission errors', async () => {
    const error = new Error('Submission failed');
    mockOnSubmit.mockRejectedValueOnce(error);

    const { result } = renderHook(() =>
      useFormSubmit({
        onSubmit: mockOnSubmit,
        onError: mockOnError,
      })
    );

    await act(async () => {
      await result.current.handleSubmit({ test: 'data' });
    });

    expect(mockOnError).toHaveBeenCalledWith(error);
    expect(result.current.isSubmitting).toBe(false);
  });

  it('should respect resetOnSuccess option', async () => {
    const { result } = renderHook(() =>
      useFormSubmit(
        {
          onSubmit: mockOnSubmit,
          resetOnSuccess: false,
        },
        mockForm
      )
    );

    await act(async () => {
      await result.current.handleSubmit({ name: 'test' });
    });

    expect(mockReset).not.toHaveBeenCalled();
  });

  it('should respect closeOnSuccess option', async () => {
    const { result } = renderHook(() =>
      useFormSubmit(
        {
          onSubmit: mockOnSubmit,
          closeOnSuccess: false,
        },
        undefined,
        mockOnClose
      )
    );

    await act(async () => {
      await result.current.handleSubmit({ name: 'test' });
    });

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('should update isSubmitting state correctly', async () => {
    let resolveSubmit: () => void;
    const submitPromise = new Promise<void>((resolve) => {
      resolveSubmit = resolve;
    });

    mockOnSubmit.mockReturnValueOnce(submitPromise);

    const { result } = renderHook(() =>
      useFormSubmit({
        onSubmit: mockOnSubmit,
      })
    );

    expect(result.current.isSubmitting).toBe(false);

    // Start the submission without awaiting
    act(() => {
      result.current.handleSubmit({});
    });

    // Check that isSubmitting is now true
    expect(result.current.isSubmitting).toBe(true);

    // Resolve the promise and wait for state update
    await act(async () => {
      resolveSubmit!();
      await submitPromise;
    });

    expect(result.current.isSubmitting).toBe(false);
  });
});

describe('createFormDataTransformer', () => {
  it('should merge with default values', () => {
    interface FormData {
      name: string;
      extra?: string;
    }
    
    interface SubmitData {
      status: string;
      priority: string;
      name?: string;
    }
    
    const transformer = createFormDataTransformer<FormData, SubmitData>(
      { status: 'active', priority: 'medium' },
      (data) => ({ name: data.name })
    );

    const result = transformer({ name: 'Test', extra: 'data' });

    expect(result).toEqual({
      status: 'active',
      priority: 'medium',
      name: 'Test',
    });
  });

  it('should filter out undefined values', () => {
    interface FormData {
      name: string;
    }
    
    interface SubmitData {
      status: string;
      name?: string;
      description?: string;
    }
    
    const transformer = createFormDataTransformer<FormData, SubmitData>(
      { status: 'active' },
      (data) => ({
        name: data.name,
        description: undefined,
      })
    );

    const result = transformer({ name: 'Test' });

    expect(result).toEqual({
      status: 'active',
      name: 'Test',
    });
    expect(result).not.toHaveProperty('description');
  });
});

describe('formTransformers', () => {
  describe('ensureArrays', () => {
    it('should ensure specified fields are arrays', () => {
      const data = {
        name: 'Test',
        tags: null,
        categories: undefined,
        existing: ['item'],
      };

      const result = formTransformers.ensureArrays(data, ['tags', 'categories']);

      expect(result).toEqual({
        name: 'Test',
        tags: [],
        categories: [],
        existing: ['item'],
      });
    });
  });

  describe('emptyToUndefined', () => {
    it('should convert empty strings to undefined', () => {
      const data = {
        name: 'Test',
        description: '',
        notes: '  ',
        valid: 'value',
      };

      const result = formTransformers.emptyToUndefined(data);

      expect(result).toEqual({
        name: 'Test',
        description: undefined,
        notes: '  ', // Only empty strings, not whitespace
        valid: 'value',
      });
    });
  });

  describe('formatDates', () => {
    it('should format specified date fields', () => {
      const data = {
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        other: 'not-a-date',
      };

      const formatter = (date: string) => new Date(date).toISOString();

      const result = formTransformers.formatDates(
        data,
        ['startDate', 'endDate'],
        formatter
      );

      expect(result.startDate).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/);
      expect(result.endDate).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/);
      expect(result.other).toBe('not-a-date');
    });

    it('should skip null/undefined date fields', () => {
      const data = {
        startDate: null,
        endDate: undefined,
      };

      const formatter = jest.fn();

      const result = formTransformers.formatDates(
        data as Record<string, unknown>,
        ['startDate', 'endDate'],
        formatter
      );

      expect(formatter).not.toHaveBeenCalled();
      expect(result).toEqual(data);
    });
  });
});