'use client';

import { useTranslations } from 'next-intl';
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
  const t = useTranslations();
  const { dashboardData, todoActivity, isLoading, dashboardError, todoActivityError } = useAnalytics();

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">{t('common.loading')}</p>
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
            <p className="text-muted-foreground">{t('analytics.loadError')}</p>
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
              {t('analytics.title')}
            </h1>
            <p className="text-muted-foreground mt-1">
              {t('analytics.subtitle')}
            </p>
          </div>
        </div>

        {dashboardData && (
          <>
            {/* 統計カード */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCard
                title={t('analytics.todoCompletionRate')}
                value={`${dashboardData.todoStats.completionRate}%`}
                subtitle={`${dashboardData.todoStats.completedTodos} / ${dashboardData.todoStats.totalTodos}`}
                icon={<CheckCircleIcon className="h-8 w-8" />}
              />
              <StatsCard
                title={t('analytics.todayEvents')}
                value={dashboardData.eventStats.todayEvents}
                subtitle={t('analytics.upcomingEvents', { count: dashboardData.eventStats.upcomingEvents })}
                icon={<CalendarIcon className="h-8 w-8" />}
              />
              <StatsCard
                title={t('analytics.weeklyNotes')}
                value={dashboardData.noteStats.notesThisWeek}
                subtitle={t('analytics.totalNotes', { count: dashboardData.noteStats.totalNotes })}
                icon={<DocumentTextIcon className="h-8 w-8" />}
              />
              <StatsCard
                title={t('analytics.overdueTodos')}
                value={dashboardData.todoStats.overdueCount}
                subtitle={dashboardData.todoStats.overdueCount > 0 ? t('analytics.requiresAction') : t('analytics.none')}
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