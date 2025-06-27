import { useQuery } from '@tanstack/react-query';
import { goalsService } from '@/services/goals';

export const useAchievementHistory = (goalId: number) => {
  return useQuery({
    queryKey: ['achievement-history', goalId],
    queryFn: () => goalsService.getAchievementHistory(goalId),
    enabled: !!goalId,
  });
};