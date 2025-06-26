import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { goalsService } from '@/services/goals';
import type {
  UpdateGoalDto,
  RecordProgressDto,
  GoalType,
} from '@/types/goal';

export const useGoals = () => {
  const queryClient = useQueryClient();

  const goalsQuery = useQuery({
    queryKey: ['goals'],
    queryFn: goalsService.getUserGoals,
  });

  const activeGoalsQuery = useQuery({
    queryKey: ['goals', 'active'],
    queryFn: goalsService.getActiveGoals,
  });

  const createGoalMutation = useMutation({
    mutationFn: goalsService.createGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });

  const updateGoalMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateGoalDto }) =>
      goalsService.updateGoal(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });

  const deleteGoalMutation = useMutation({
    mutationFn: goalsService.deleteGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });

  const recordProgressMutation = useMutation({
    mutationFn: ({ goalId, data }: { goalId: number; data: RecordProgressDto }) =>
      goalsService.recordProgress(goalId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['goal', variables.goalId] });
      queryClient.invalidateQueries({ queryKey: ['goal-progress', variables.goalId] });
    },
  });

  const resetWeeklyGoalsMutation = useMutation({
    mutationFn: goalsService.resetWeeklyGoals,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });

  return {
    goals: goalsQuery.data ?? [],
    activeGoals: activeGoalsQuery.data ?? [],
    isLoading: goalsQuery.isLoading || activeGoalsQuery.isLoading,
    error: goalsQuery.error || activeGoalsQuery.error,
    createGoal: createGoalMutation.mutate,
    updateGoal: updateGoalMutation.mutate,
    deleteGoal: deleteGoalMutation.mutate,
    recordProgress: recordProgressMutation.mutate,
    resetWeeklyGoals: resetWeeklyGoalsMutation.mutate,
    isCreating: createGoalMutation.isPending,
    isUpdating: updateGoalMutation.isPending,
    isDeleting: deleteGoalMutation.isPending,
    isRecordingProgress: recordProgressMutation.isPending,
  };
};

export const useGoal = (id: number) => {
  const goalQuery = useQuery({
    queryKey: ['goal', id],
    queryFn: () => goalsService.getGoal(id),
    enabled: !!id,
  });

  const milestonesQuery = useQuery({
    queryKey: ['goal-milestones', id],
    queryFn: () => goalsService.getGoalMilestones(id),
    enabled: !!id,
  });

  return {
    goal: goalQuery.data,
    milestones: milestonesQuery.data ?? [],
    isLoading: goalQuery.isLoading || milestonesQuery.isLoading,
    error: goalQuery.error || milestonesQuery.error,
  };
};

export const useGoalProgress = (goalId: number, startDate: string, endDate: string) => {
  const progressQuery = useQuery({
    queryKey: ['goal-progress', goalId, startDate, endDate],
    queryFn: () => goalsService.getGoalProgress(goalId, startDate, endDate),
    enabled: !!goalId && !!startDate && !!endDate,
  });

  return {
    progress: progressQuery.data ?? [],
    isLoading: progressQuery.isLoading,
    error: progressQuery.error,
  };
};

export const useGoalsByType = (goalType: GoalType) => {
  const goalsQuery = useQuery({
    queryKey: ['goals', 'type', goalType],
    queryFn: () => goalsService.getGoalsByType(goalType),
    enabled: !!goalType,
  });

  return {
    goals: goalsQuery.data ?? [],
    isLoading: goalsQuery.isLoading,
    error: goalsQuery.error,
  };
};