import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '@/services/analytics';

export const useAnalytics = () => {
  // ダッシュボードデータの取得
  const {
    data: dashboardData,
    error: dashboardError,
    isLoading: isDashboardLoading,
  } = useQuery({
    queryKey: ['analytics', 'dashboard'],
    queryFn: analyticsService.getDashboard,
    staleTime: 5 * 60 * 1000, // 5分間キャッシュ
  });

  // TODOアクティビティデータの取得
  const {
    data: todoActivity,
    error: todoActivityError,
    isLoading: isTodoActivityLoading,
  } = useQuery({
    queryKey: ['analytics', 'todoActivity'],
    queryFn: analyticsService.getTodoActivity,
    staleTime: 5 * 60 * 1000, // 5分間キャッシュ
  });

  return {
    dashboardData,
    todoActivity,
    isDashboardLoading,
    isTodoActivityLoading,
    dashboardError,
    todoActivityError,
    isLoading: isDashboardLoading || isTodoActivityLoading,
  };
};