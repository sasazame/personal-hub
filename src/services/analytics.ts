import api from '@/lib/api';
import type { DashboardData, TodoActivity } from '@/types/analytics';

export const analyticsService = {
  // ダッシュボードデータの取得
  getDashboard: async (): Promise<DashboardData> => {
    const response = await api.get<DashboardData>('/analytics/dashboard');
    return response.data;
  },

  // TODOアクティビティデータの取得
  getTodoActivity: async (): Promise<TodoActivity> => {
    const response = await api.get<TodoActivity>('/analytics/todos/activity');
    return response.data;
  },
};