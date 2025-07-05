/**
 * Utilities for testing React hooks
 */

import React from 'react';
import { renderHook, RenderHookOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { createTestQueryClient } from './setup';

interface TestWrapperProps {
  children: React.ReactNode;
  queryClient?: QueryClient;
  initialAuth?: {
    user?: any;
    isAuthenticated?: boolean;
  };
}

/**
 * Create a wrapper component for hook tests
 */
export function createHookWrapper({
  queryClient = createTestQueryClient(),
  initialAuth = {},
}: Partial<TestWrapperProps> = {}) {
  return function TestWrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </AuthProvider>
      </QueryClientProvider>
    );
  };
}

/**
 * Render a hook with all necessary providers
 */
export function renderHookWithProviders<TProps, TResult>(
  hook: (props: TProps) => TResult,
  options?: RenderHookOptions<TProps> & {
    queryClient?: QueryClient;
    initialAuth?: {
      user?: any;
      isAuthenticated?: boolean;
    };
  }
) {
  const { queryClient, initialAuth, ...renderOptions } = options || {};
  
  return renderHook(hook, {
    wrapper: createHookWrapper({ queryClient, initialAuth }),
    ...renderOptions,
  });
}

/**
 * Wait for a hook to finish loading
 */
export async function waitForHookToLoad<T>(
  result: { current: { isLoading?: boolean; isPending?: boolean; data?: T } }
): Promise<T | undefined> {
  const { waitFor } = await import('@testing-library/react');
  
  await waitFor(() => {
    expect(result.current.isLoading ?? result.current.isPending).toBe(false);
  });
  
  return result.current.data;
}

/**
 * Test a mutation hook
 */
export async function testMutation<TData, TVariables, TError = unknown>(
  result: {
    current: {
      mutate: (variables: TVariables) => void;
      mutateAsync: (variables: TVariables) => Promise<TData>;
      isLoading?: boolean;
      isPending?: boolean;
      isSuccess?: boolean;
      isError?: boolean;
      data?: TData;
      error?: TError;
    };
  },
  variables: TVariables
): Promise<{ data?: TData; error?: TError }> {
  const { act, waitFor } = await import('@testing-library/react');
  
  await act(async () => {
    result.current.mutate(variables);
  });
  
  await waitFor(() => {
    expect(result.current.isLoading ?? result.current.isPending).toBe(false);
  });
  
  return {
    data: result.current.data,
    error: result.current.error,
  };
}

/**
 * Test a mutation hook with async
 */
export async function testMutationAsync<TData, TVariables, TError = unknown>(
  result: {
    current: {
      mutateAsync: (variables: TVariables) => Promise<TData>;
    };
  },
  variables: TVariables
): Promise<TData> {
  const { act } = await import('@testing-library/react');
  
  let data: TData;
  
  await act(async () => {
    data = await result.current.mutateAsync(variables);
  });
  
  return data!;
}

/**
 * Mock a successful query response
 */
export function mockQuerySuccess<T>(queryClient: QueryClient, queryKey: unknown[], data: T) {
  queryClient.setQueryData(queryKey, data);
}

/**
 * Mock a failed query response
 */
export function mockQueryError(queryClient: QueryClient, queryKey: unknown[], error: Error) {
  queryClient.setQueryData(queryKey, () => {
    throw error;
  });
}

/**
 * Wait for queries to be invalidated
 */
export async function waitForInvalidation(
  queryClient: QueryClient,
  queryKey: unknown[]
): Promise<void> {
  const { waitFor } = await import('@testing-library/react');
  
  const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');
  
  await waitFor(() => {
    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey })
    );
  });
}

/**
 * Create a mock mutation function
 */
export function createMockMutation<TData, TVariables>(
  implementation?: (variables: TVariables) => Promise<TData>
) {
  const mockFn = jest.fn(implementation || (() => Promise.resolve({} as TData)));
  
  return {
    mockFn,
    expectToBeCalled: () => expect(mockFn).toHaveBeenCalled(),
    expectToBeCalledWith: (variables: TVariables) => 
      expect(mockFn).toHaveBeenCalledWith(variables),
    expectToBeCalledTimes: (times: number) => 
      expect(mockFn).toHaveBeenCalledTimes(times),
    reset: () => mockFn.mockReset(),
  };
}