import { useMutation, useQueryClient } from '@tanstack/react-query';
import { goalsService } from '@/services/goals';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import type { GoalWithStatus } from '@/types/goal';

export const useToggleAchievement = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ goalId, date }: { goalId: string; date: Date }) => {
      const dateStr = format(date, 'yyyy-MM-dd');
      return goalsService.toggleAchievement(Number(goalId), dateStr);
    },
    onMutate: async ({ goalId, date }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ 
        queryKey: ['goals', 'date', format(date, 'yyyy-MM-dd')] 
      });

      // Snapshot the previous value  
      const dateStr = format(date, 'yyyy-MM-dd');
      const previousGoalsActive = queryClient.getQueryData<GoalWithStatus[]>([
        'goals',
        'date',
        dateStr,
        'filter',
        'active',
      ]);
      const previousGoalsAll = queryClient.getQueryData<GoalWithStatus[]>([
        'goals',
        'date',
        dateStr,
        'filter',
        'all',
      ]);

      // Optimistically update the goal's completed status
      queryClient.setQueryData<GoalWithStatus[]>(
        ['goals', 'date', format(date, 'yyyy-MM-dd'), 'filter', 'active'],
        (old) => {
          if (!old) return [];
          return old.map((goal) =>
            goal.id === Number(goalId)
              ? { ...goal, completed: !goal.completed }
              : goal
          );
        }
      );

      queryClient.setQueryData<GoalWithStatus[]>(
        ['goals', 'date', format(date, 'yyyy-MM-dd'), 'filter', 'all'],
        (old) => {
          if (!old) return [];
          return old.map((goal) =>
            goal.id === Number(goalId)
              ? { ...goal, completed: !goal.completed }
              : goal
          );
        }
      );

      // Return a context object with the snapshotted value
      return { previousGoalsActive, previousGoalsAll };
    },
    onError: (_err, { date }, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousGoalsActive) {
        queryClient.setQueryData(
          ['goals', 'date', format(date, 'yyyy-MM-dd'), 'filter', 'active'],
          context.previousGoalsActive
        );
      }
      if (context?.previousGoalsAll) {
        queryClient.setQueryData(
          ['goals', 'date', format(date, 'yyyy-MM-dd'), 'filter', 'all'],
          context.previousGoalsAll
        );
      }
      toast.error('Failed to toggle achievement');
    },
    onSettled: (data, error, { date }) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ 
        queryKey: ['goals', 'date', format(date, 'yyyy-MM-dd')] 
      });
    },
  });

  return {
    toggleAchievement: mutation.mutate,
    isLoading: mutation.isPending,
  };
};