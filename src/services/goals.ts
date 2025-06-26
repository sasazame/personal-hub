import api from '@/lib/api';
import type {
  Goal,
  CreateGoalDto,
  UpdateGoalDto,
  GoalProgress,
  RecordProgressDto,
  GoalMilestone,
  GoalType,
} from '@/types/goal';

export const goalsService = {
  createGoal: async (data: CreateGoalDto): Promise<Goal> => {
    const response = await api.post<Goal>('/goals', data);
    return response.data;
  },

  getGoal: async (id: number): Promise<Goal> => {
    const response = await api.get<Goal>(`/goals/${id}`);
    return response.data;
  },

  getUserGoals: async (): Promise<Goal[]> => {
    const response = await api.get<Goal[]>('/goals');
    return response.data;
  },

  getActiveGoals: async (): Promise<Goal[]> => {
    const response = await api.get<Goal[]>('/goals/active');
    return response.data;
  },

  getGoalsByType: async (goalType: GoalType): Promise<Goal[]> => {
    const response = await api.get<Goal[]>(`/goals/type/${goalType}`);
    return response.data;
  },

  updateGoal: async (id: number, data: UpdateGoalDto): Promise<Goal> => {
    const response = await api.put<Goal>(`/goals/${id}`, data);
    return response.data;
  },

  deleteGoal: async (id: number): Promise<void> => {
    await api.delete(`/goals/${id}`);
  },

  recordProgress: async (goalId: number, data: RecordProgressDto): Promise<GoalProgress> => {
    const response = await api.post<GoalProgress>(`/goals/${goalId}/progress`, data);
    return response.data;
  },

  getGoalProgress: async (
    goalId: number,
    startDate: string,
    endDate: string
  ): Promise<GoalProgress[]> => {
    const response = await api.get<GoalProgress[]>(`/goals/${goalId}/progress`, {
      params: { startDate, endDate },
    });
    return response.data;
  },

  getWeeklyProgress: async (goalId: number, weekStartDay?: number): Promise<number> => {
    const response = await api.get<number>(`/goals/${goalId}/weekly-progress`, {
      params: { weekStartDay },
    });
    return response.data;
  },

  getGoalMilestones: async (goalId: number): Promise<GoalMilestone[]> => {
    const response = await api.get<GoalMilestone[]>(`/goals/${goalId}/milestones`);
    return response.data;
  },

  resetWeeklyGoals: async (): Promise<void> => {
    await api.post('/goals/reset-weekly');
  },
};