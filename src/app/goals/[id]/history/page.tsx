'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ChevronLeftIcon, CalendarIcon, ListBulletIcon } from '@heroicons/react/24/outline';
import { AppLayout } from '@/components/layout/AppLayout';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Button } from '@/components/ui/Button';
import { useGoalTracking } from '@/hooks/useGoalTracking';
import { useAchievementHistory } from '@/hooks/useAchievementHistory';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Card } from '@/components/ui/Card';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, startOfWeek, endOfWeek } from 'date-fns';
import { cn } from '@/lib/cn';

export default function GoalHistoryPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations('goal');
  const goalId = Number(params.id);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('list');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const { data: goal, isLoading } = useGoalTracking(goalId);
  const { data: achievements, isLoading: isLoadingAchievements } = useAchievementHistory(goalId);

  // Generate calendar days
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Map achievements by date
  const achievementsByDate = achievements?.reduce((acc, achievement) => {
    const dateKey = format(new Date(achievement.date), 'yyyy-MM-dd');
    acc[dateKey] = achievement;
    return acc;
  }, {} as Record<string, typeof achievements[0]>) || {};

  return (
    <AuthGuard>
      <AppLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/goals')}
                className="flex items-center gap-1"
              >
                <ChevronLeftIcon className="h-4 w-4" />
                {t('back')}
              </Button>
              <h1 className="text-xl font-semibold">{t('achievementHistory')}</h1>
            </div>

            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                  viewMode === 'list'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                )}
              >
                <ListBulletIcon className="h-4 w-4" />
                {t('listView')}
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                  viewMode === 'calendar'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                )}
              >
                <CalendarIcon className="h-4 w-4" />
                {t('calendarView')}
              </button>
            </div>
          </div>

          {isLoading || isLoadingAchievements ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : goal ? (
            <div className="space-y-6">
              {/* Goal Info */}
              <div className="bg-card p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold text-foreground">{goal.title}</h2>
                {goal.description && (
                  <p className="mt-2 text-sm text-muted-foreground">{goal.description}</p>
                )}
                <div className="mt-4 flex items-center gap-4 text-sm">
                  <span className="text-muted-foreground">
                    {t('type')}: <span className="text-foreground">{t(`types.${goal.goalType.toLowerCase()}`)}</span>
                  </span>
                  <span className="text-muted-foreground">
                    {t('progress')}: <span className="text-foreground">
                      {goal.currentValue}/{goal.targetValue} {goal.metricUnit}
                    </span>
                  </span>
                </div>
              </div>

              {/* Content based on view mode */}
              {viewMode === 'list' ? (
                <div className="space-y-4">
                  {achievements && achievements.length > 0 ? (
                    achievements.map((achievement) => (
                      <Card key={achievement.id} className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            {achievement.value.toString() === goal.targetValue.toString() ? (
                              <CheckCircleIcon className="h-6 w-6 text-green-500 mt-0.5" />
                            ) : (
                              <div className="h-6 w-6 rounded-full border-2 border-gray-300 dark:border-gray-600 mt-0.5" />
                            )}
                            <div>
                              <div className="font-medium text-foreground">
                                {format(new Date(achievement.date), 'yyyy年M月d日 (E)', { locale: ja })}
                              </div>
                              <div className="text-sm text-muted-foreground mt-1">
                                {achievement.value}/{goal.targetValue} {goal.metricUnit}
                              </div>
                              {achievement.note && (
                                <p className="text-sm text-muted-foreground mt-2">
                                  {achievement.note}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(achievement.createdAt), 'HH:mm')}
                          </div>
                        </div>
                      </Card>
                    ))
                  ) : (
                    <Card className="p-6 text-center">
                      <p className="text-muted-foreground">{t('noAchievements')}</p>
                    </Card>
                  )}
                </div>
              ) : (
                <div className="bg-card p-6 rounded-lg shadow">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">
                      {format(currentMonth, 'yyyy年M月', { locale: ja })}
                    </h3>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                      >
                        <ChevronLeftIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentMonth(new Date())}
                      >
                        {t('today')}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                      >
                        <ChevronLeftIcon className="h-4 w-4 rotate-180" />
                      </Button>
                    </div>
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-1">
                    {/* Day headers */}
                    {['日', '月', '火', '水', '木', '金', '土'].map((day) => (
                      <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                        {day}
                      </div>
                    ))}

                    {/* Calendar days */}
                    {calendarDays.map((day) => {
                      const dateKey = format(day, 'yyyy-MM-dd');
                      const achievement = achievementsByDate[dateKey];
                      const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
                      const isToday = isSameDay(day, new Date());

                      return (
                        <div
                          key={dateKey}
                          className={cn(
                            'aspect-square p-2 border rounded-md',
                            isCurrentMonth ? 'bg-background' : 'bg-muted/30',
                            isToday && 'border-primary',
                            achievement && 'bg-green-50 dark:bg-green-900/20'
                          )}
                        >
                          <div className="text-sm text-center">
                            <div className={cn(
                              'font-medium',
                              isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'
                            )}>
                              {format(day, 'd')}
                            </div>
                            {achievement && (
                              <CheckCircleIcon className="h-4 w-4 text-green-500 mx-auto mt-1" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Legend */}
                  <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <CheckCircleIcon className="h-4 w-4 text-green-500" />
                      <span>{t('achieved')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
                      <span>{t('pending')}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-12">{t('goalNotFound')}</p>
          )}
        </div>
      </AppLayout>
    </AuthGuard>
  );
}