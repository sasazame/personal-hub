import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useToggleAchievement } from '../useToggleAchievement';
import { goalsService } from '@/services/goals';
import toast from 'react-hot-toast';

jest.mock('@/services/goals');
jest.mock('react-hot-toast');

describe('useToggleAchievement', () => {
  let queryClient: QueryClient;
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    jest.clearAllMocks();
  });

  it('successfully toggles achievement', async () => {
    const mockResponse = { 
      goalId: 1, 
      periodType: 'DAILY', 
      periodDate: '2025-01-28', 
      achieved: true, 
      progressId: 123 
    };
    (goalsService.toggleAchievement as jest.Mock).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useToggleAchievement(), { wrapper });

    act(() => {
      result.current.toggleAchievement({ 
        goalId: '1', 
        date: new Date('2025-01-28') 
      });
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(goalsService.toggleAchievement).toHaveBeenCalledWith(1, '2025-01-28');
  });

  it('handles toggle achievement error', async () => {
    const mockError = new Error('Failed to toggle achievement');
    (goalsService.toggleAchievement as jest.Mock).mockRejectedValue(mockError);

    const { result } = renderHook(() => useToggleAchievement(), { wrapper });

    act(() => {
      result.current.toggleAchievement({ 
        goalId: '1', 
        date: new Date('2025-01-28') 
      });
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(toast.error).toHaveBeenCalledWith('Failed to toggle achievement');
  });

  it('performs optimistic update', async () => {
    const initialGoals = [
      { id: 1, title: 'Goal 1', completed: false },
      { id: 2, title: 'Goal 2', completed: true },
    ];

    queryClient.setQueryData(['goals', 'date', '2025-01-28', 'filter', 'active'], initialGoals);

    // Mock a slow response to ensure we can check the optimistic update
    (goalsService.toggleAchievement as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({}), 100))
    );

    const { result } = renderHook(() => useToggleAchievement(), { wrapper });

    await act(async () => {
      result.current.toggleAchievement({ 
        goalId: '1', 
        date: new Date('2025-01-28') 
      });
    });

    // Check optimistic update immediately
    const updatedGoals = queryClient.getQueryData(['goals', 'date', '2025-01-28', 'filter', 'active']);
    expect(updatedGoals).toEqual([
      { id: 1, title: 'Goal 1', completed: true },
      { id: 2, title: 'Goal 2', completed: true },
    ]);
  });

  it('rolls back optimistic update on error', async () => {
    const mockError = new Error('Failed to toggle achievement');
    (goalsService.toggleAchievement as jest.Mock).mockRejectedValue(mockError);

    const initialGoals = [
      { id: 1, title: 'Goal 1', completed: false },
      { id: 2, title: 'Goal 2', completed: true },
    ];

    queryClient.setQueryData(['goals', 'date', '2025-01-28', 'filter', 'active'], initialGoals);

    const { result } = renderHook(() => useToggleAchievement(), { wrapper });

    act(() => {
      result.current.toggleAchievement({ 
        goalId: '1', 
        date: new Date('2025-01-28') 
      });
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const rolledBackGoals = queryClient.getQueryData(['goals', 'date', '2025-01-28', 'filter', 'active']);
    expect(rolledBackGoals).toEqual(initialGoals);
  });
});