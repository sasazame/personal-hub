import { useMutation, useQueryClient } from '@tanstack/react-query';
import { goalsService } from '@/services/goals';
import { useToast } from '@/hooks/useToast';
import { useTranslations } from 'next-intl';

export const useToggleAchievement = (goalId: number) => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  const t = useTranslations('goal');

  const mutation = useMutation({
    mutationFn: () => goalsService.toggleAchievement(goalId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['goal', goalId] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      
      if (data.achieved) {
        showSuccess(t('tracking.achievementRecorded'));
      } else {
        showSuccess(t('tracking.achievementRemoved'));
      }
    },
    onError: () => {
      showError(t('errors.toggleAchievementFailed'));
    },
  });

  return {
    toggleAchievement: mutation.mutate,
    isLoading: mutation.isPending,
  };
};