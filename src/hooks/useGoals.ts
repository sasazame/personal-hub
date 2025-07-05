import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { goalsService } from '@/services/goals';
import type {
  Goal,
  CreateGoalDto,
  UpdateGoalDto,
  RecordProgressDto,
  GoalType,
  GoalWithStatus,
} from '@/types/goal';
import type { GoalFilter } from '@/components/goals/FilterTabs';
import { createEntityHooks } from './useEntityHooks';

// Custom filter type that combines date and filter
interface GoalFilters {
  date?: string;
  filter: GoalFilter;
}

// Create the base entity hooks
const entityHooks = createEntityHooks<Goal, CreateGoalDto, UpdateGoalDto, GoalFilters>({
  entityName: 'Goal',
  service: {
    create: (data: CreateGoalDto) => goalsService.createGoal(data),
    update: (id: number, data: UpdateGoalDto) => goalsService.updateGoal(id, data),
    delete: (id: number) => goalsService.deleteGoal(id),
    getById: (id: number) => goalsService.getGoal(id),
  },
  queryKey: 'goals',
  getFilters: async (filters: GoalFilters) => {
    const date = filters.date || new Date().toISOString().split('T')[0];
    return goalsService.getGoalsByDateAndFilter(date, filters.filter);
  },
  additionalInvalidateKeys: [['goals']],
});

// Export the standard CRUD hooks
export const useCreateGoal = entityHooks.useCreateGoal;
export const useUpdateGoal = entityHooks.useUpdateGoal;
export const useDeleteGoal = entityHooks.useDeleteGoal;
export const useGoal = entityHooks.useGoal;

// Main useGoals hook with custom logic
export const useGoals = (date?: string, filter: GoalFilter = 'active') => {
  const queryClient = useQueryClient();
  
  // Use the entity list hook with filters
  const goalsQuery = entityHooks.useGoalList({ date, filter });

  // Legacy active goals query (disabled)
  const activeGoalsQuery = useQuery({
    queryKey: ['goals', 'active'],
    queryFn: goalsService.getActiveGoals,
    enabled: false, // Disabled as we're using the new filtered query
  });

  // Additional mutations specific to goals
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

  // Get the CRUD operations from entity hooks
  const createMutation = useCreateGoal();
  const updateMutation = useUpdateGoal();
  const deleteMutation = useDeleteGoal();

  return {
    goals: (goalsQuery.data ?? []) as GoalWithStatus[],
    activeGoals: activeGoalsQuery.data ?? [],
    isLoading: goalsQuery.isLoading,
    error: goalsQuery.error,
    createGoal: createMutation.mutate,
    updateGoal: updateMutation.mutate,
    deleteGoal: deleteMutation.mutate,
    recordProgress: recordProgressMutation.mutate,
    resetWeeklyGoals: resetWeeklyGoalsMutation.mutate,
    isCreating: createMutation.isLoading,
    isUpdating: updateMutation.isLoading,
    isDeleting: deleteMutation.isLoading,
    isRecordingProgress: recordProgressMutation.isPending,
  };
};

// Additional custom hooks
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

// Extended useGoal hook with milestones
export const useGoalWithMilestones = (id: number) => {
  const goalQuery = useGoal(id);
  
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