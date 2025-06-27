import { useQuery } from '@tanstack/react-query';
import { goalsService } from '@/services/goals';

export const useGoalTracking = (goalId: number) => {
  return useQuery({
    queryKey: ['goal', goalId, 'tracking'],
    queryFn: () => goalsService.getGoalWithTracking(goalId),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};