import api from '@/lib/api';
import type {
  Goal,
  CreateGoalDto,
  UpdateGoalDto,
  GoalProgress,
  RecordProgressDto,
  GoalMilestone,
  GoalType,
  GoalWithTracking,
  ToggleAchievementResponse,
  PagedResponse,
  UpdateProgressDto,
  GoalWithStatus,
} from '@/types/goal';
import type { GoalFilter } from '@/components/goals/FilterTabs';

export const goalsService = {
  createGoal: async (data: CreateGoalDto): Promise<Goal> => {
    const response = await api.post<Goal>('/goals', data);
    return response.data;
  },

  getGoal: async (id: number): Promise<GoalWithTracking> => {
    const response = await api.get<GoalWithTracking>(`/goals/${id}`);
    return response.data;
  },
  
  getGoalWithTracking: async (id: number): Promise<GoalWithTracking> => {
    const response = await api.get<GoalWithTracking>(`/goals/${id}`);
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

  toggleAchievement: async (goalId: number, date?: string): Promise<ToggleAchievementResponse> => {
    const response = await api.post<ToggleAchievementResponse>(
      `/goals/${goalId}/achievements`,
      { date: date || new Date().toISOString().split('T')[0] }
    );
    return response.data;
  },

  removeAchievement: async (goalId: number, date: string): Promise<void> => {
    await api.delete(`/goals/${goalId}/achievements?date=${date}`);
  },

  toggleActive: async (goalId: number, isActive: boolean): Promise<Goal> => {
    const response = await api.patch<Goal>(`/goals/${goalId}/active`, { isActive });
    return response.data;
  },

  getGoalsByDateAndFilter: async (date: string, filter: GoalFilter = 'active'): Promise<GoalWithStatus[]> => {
    const response = await api.get<Record<string, GoalWithStatus[]> | GoalWithStatus[]>(`/goals?date=${date}&filter=${filter}`);
    // デバッグ用ログ
    if (process.env.NODE_ENV === 'development') {
      console.log('Goals API response:', response.data);
    }
    
    // APIレスポンスがグループ化されたオブジェクトの場合、配列に変換
    const data = response.data;
    if (Array.isArray(data)) {
      return data;
    } else if (data && typeof data === 'object') {
      // annual, monthly, weekly, daily のグループから配列を結合
      const allGoals: GoalWithStatus[] = [];
      Object.values(data).forEach(goalGroup => {
        if (Array.isArray(goalGroup)) {
          allGoals.push(...goalGroup);
        }
      });
      return allGoals;
    }
    return [];
  },

  getAchievementHistory: async (goalId: number): Promise<GoalProgress[]> => {
    const response = await api.get<GoalProgress[]>(
      `/goals/${goalId}/achievement-history`
    );
    return response.data;
  },

  getProgressHistory: async (
    goalId: number,
    params?: {
      page?: number;
      size?: number;
      startDate?: string;
      endDate?: string;
    }
  ): Promise<PagedResponse<GoalProgress>> => {
    const response = await api.get<PagedResponse<GoalProgress>>(
      `/goals/${goalId}/progress-history`,
      { params }
    );
    return response.data;
  },

  updateProgress: async (
    goalId: number,
    progressId: number,
    data: UpdateProgressDto
  ): Promise<GoalProgress> => {
    const response = await api.put<GoalProgress>(
      `/goals/${goalId}/progress/${progressId}`,
      data
    );
    return response.data;
  },

  deleteProgress: async (
    goalId: number,
    progressId: number
  ): Promise<void> => {
    await api.delete(`/goals/${goalId}/progress/${progressId}`);
  },
};