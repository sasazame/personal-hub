'use client';

import { AuthGuard } from '@/components/auth';
import { AppLayout } from '@/components/layout';
import { useAnalytics } from '@/hooks/useAnalytics';
import {
  StatsCard,
  TodoStatusChart,
  ProductivityChart,
  TodoActivityChart,
  PriorityChart,
} from '@/components/analytics';
import {
  CalendarIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

function AnalyticsPage() {
  const { dashboardData, todoActivity, isLoading, dashboardError, todoActivityError } = useAnalytics();

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">データを読み込んでいます...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (dashboardError || todoActivityError) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center">
            <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-muted-foreground">データの読み込みに失敗しました</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              分析
            </h1>
            <p className="text-muted-foreground mt-1">
              生産性と進捗を分析・改善しましょう
            </p>
          </div>
        </div>

        {dashboardData && (
          <>
            {/* 統計カード */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCard
                title="TODO完了率"
                value={`${dashboardData.todoStats.completionRate}%`}
                subtitle={`${dashboardData.todoStats.completedTodos} / ${dashboardData.todoStats.totalTodos} 件`}
                icon={<CheckCircleIcon className="h-8 w-8" />}
              />
              <StatsCard
                title="本日のイベント"
                value={dashboardData.eventStats.todayEvents}
                subtitle={`今後: ${dashboardData.eventStats.upcomingEvents}件`}
                icon={<CalendarIcon className="h-8 w-8" />}
              />
              <StatsCard
                title="今週のノート"
                value={dashboardData.noteStats.notesThisWeek}
                subtitle={`総数: ${dashboardData.noteStats.totalNotes}件`}
                icon={<DocumentTextIcon className="h-8 w-8" />}
              />
              <StatsCard
                title="期限切れTODO"
                value={dashboardData.todoStats.overdueCount}
                subtitle={dashboardData.todoStats.overdueCount > 0 ? '要対応' : 'なし'}
                icon={<ExclamationTriangleIcon className="h-8 w-8" />}
                className={dashboardData.todoStats.overdueCount > 0 ? 'border-red-500' : ''}
              />
            </div>

            {/* 生産性チャート */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ProductivityChart data={dashboardData.productivityStats} />
            </div>

            {/* TODOステータスと優先度 */}
            {todoActivity && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TodoStatusChart data={todoActivity.statusDistribution} />
                <PriorityChart data={todoActivity.priorityDistribution} />
              </div>
            )}

            {/* TODOアクティビティ */}
            {todoActivity && (
              <div className="grid grid-cols-1 gap-6">
                <TodoActivityChart data={todoActivity} />
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}

export default function Analytics() {
  return (
    <AuthGuard>
      <AnalyticsPage />
    </AuthGuard>
  );
}