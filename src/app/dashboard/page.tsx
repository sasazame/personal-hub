'use client';

import { useTranslations } from 'next-intl';
import { AuthGuard } from '@/components/auth';
import { AppLayout } from '@/components/layout';
import { Card } from '@/components/ui';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useTodaysEvents } from '@/hooks/useCalendar';
import { useRecentNotes } from '@/hooks/useNotes';
import { useGoals } from '@/hooks/useGoals';
import { usePageTitle } from '@/hooks/usePageTitle';
import { todoApi } from '@/lib/api';
import { format } from 'date-fns';
import { isFeatureEnabled } from '@/config/features';
import { 
  CheckSquare, 
  Calendar, 
  FileText, 
  BarChart3,
  Plus,
  ArrowRight,
  Target,
  TrendingUp,
  Trophy
} from 'lucide-react';

function DashboardPage() {
  const t = useTranslations();
  usePageTitle('Dashboard - Personal Hub');

  // Fetch real data
  const { data: todosResponse, error: todosError } = useQuery({
    queryKey: ['todos', 'ALL'],
    queryFn: () => todoApi.getAll(),
    retry: (failureCount, error: unknown) => {
      // Don't retry on 403 errors in development
      if ((error as { response?: { status?: number } })?.response?.status === 403 && process.env.NODE_ENV === 'development') {
        return false;
      }
      return failureCount < 3;
    },
  });
  const { data: todaysEvents = [] } = useTodaysEvents();
  const { data: recentNotes = [] } = useRecentNotes(3);
  const { activeGoals } = useGoals();

  // Handle 403 errors in development gracefully
  const todos = todosResponse?.content || [];
  const incompleteTodos = todos.filter(todo => todo.status !== 'DONE');
  const completedTodos = todos.filter(todo => todo.status === 'DONE');
  const completionRate = todos.length > 0 ? Math.round((completedTodos.length / todos.length) * 100) : 0;
  
  // Calculate goals statistics
  const totalActiveGoals = activeGoals.length;
  const goalsWithHighAchievement = activeGoals.filter(goal => goal.progressPercentage >= 80).length;
  const dailyGoals = activeGoals.filter(goal => goal.goalType === 'DAILY');
  
  // Log error for debugging but don't break the UI
  if (todosError && process.env.NODE_ENV === 'development') {
    console.warn('Dashboard: Failed to fetch todos (this is expected in development without backend):', todosError);
  }

  const features = [
    {
      title: 'TODOs',
      description: t('dashboard.taskManagement'),
      icon: CheckSquare,
      href: '/todos',
      color: 'bg-blue-500',
      stats: t('dashboard.incompleteTasks', { count: incompleteTodos.length }),
      count: incompleteTodos.length,
      total: todos.length
    },
    {
      title: 'Goals',
      description: t('dashboard.goalTrackingDescription'),
      icon: Target,
      href: '/goals',
      color: 'bg-indigo-500',
      stats: t('dashboard.activeGoalsCount', { count: totalActiveGoals }),
      count: totalActiveGoals
    },
    {
      title: 'Calendar',
      description: t('dashboard.scheduleManagement'),
      icon: Calendar,
      href: '/calendar',
      color: 'bg-green-500',
      stats: t('dashboard.todayEventsCount', { count: todaysEvents.length }),
      count: todaysEvents.length
    },
    {
      title: 'Notes',
      description: t('dashboard.noteDocumentCreation'),
      icon: FileText,
      href: '/notes',
      color: 'bg-purple-500',
      stats: t('dashboard.recentNotesCount', { count: recentNotes.length }),
      count: recentNotes.length
    },
    ...(isFeatureEnabled('analytics') ? [{
      title: 'Analytics',
      description: t('dashboard.productivityAnalysis'),
      icon: BarChart3,
      href: '/analytics',
      color: 'bg-orange-500',
      stats: t('dashboard.completionRatePercentage', { rate: completionRate }),
      count: completionRate
    }] : [])
  ].flat();

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* ヘッダー */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">
            {t('dashboard.welcome')}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('app.description')}
          </p>
        </div>

        {/* クイックアクション */}
        <div className="flex justify-center">
          <div className="flex gap-4">
            <Link 
              href="/todos"
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-md hover:shadow-lg transition-all"
            >
              <Plus className="w-5 h-5" />
              {t('dashboard.newTodo')}
            </Link>
          </div>
        </div>

        {/* 機能カード */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => {
            const IconComponent = feature.icon;
            return (
              <Link key={feature.title} href={feature.href}>
                <Card className="h-full p-6 hover:shadow-lg transition-all cursor-pointer group">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center text-white`}>
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      {feature.stats}
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* リアルタイムデータ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 今日のイベント */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground">
                {t('dashboard.todayEvents')}
              </h2>
              <Link href="/calendar" className="text-green-600 hover:text-green-700 text-sm">
                {t('dashboard.viewAll')} →
              </Link>
            </div>
            {todaysEvents.length === 0 ? (
              <p className="text-muted-foreground text-sm">{t('dashboard.noEvents')}</p>
            ) : (
              <div className="space-y-3">
                {todaysEvents.slice(0, 3).map((event) => (
                  <div key={event.id} className="flex items-center gap-3 p-2 rounded-lg bg-green-50 dark:bg-green-900/20">
                    <Calendar className="w-4 h-4 text-green-500" />
                    <div className="flex-1">
                      <div className="font-medium text-sm">{event.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {event.allDay ? t('dashboard.allDay') : format(new Date(event.startDateTime), 'HH:mm')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* 最近のノート */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground">
                {t('dashboard.recentNotes')}
              </h2>
              <Link href="/notes" className="text-purple-600 hover:text-purple-700 text-sm">
                {t('dashboard.viewAllArrow')}
              </Link>
            </div>
            {recentNotes.length === 0 ? (
              <p className="text-muted-foreground text-sm">{t('dashboard.noNotes')}</p>
            ) : (
              <div className="space-y-3">
                {recentNotes.map((note) => (
                  <div key={note.id} className="flex items-start gap-3 p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                    <FileText className="w-4 h-4 text-purple-500 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{note.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {note.updatedAt ? format(new Date(note.updatedAt), 'M/d HH:mm') : ''}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Active Goals Section */}
        {activeGoals.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-foreground">
                {t('dashboard.activeGoals')}
              </h2>
              <Link href="/goals" className="text-indigo-600 hover:text-indigo-700 text-sm">
                {t('dashboard.viewAllArrow')}
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeGoals.slice(0, 6).map((goal) => (
                <Link key={goal.id} href={`/goals/${goal.id}`}>
                  <Card className="h-full p-4 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <h3 className="font-medium text-foreground truncate pr-2">{goal.title}</h3>
                        <div className={`px-2 py-1 rounded text-xs font-medium ${
                          goal.goalType === 'DAILY' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                          goal.goalType === 'WEEKLY' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          goal.goalType === 'MONTHLY' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                          'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                        }`}>
                          {goal.goalType}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{t('dashboard.progress')}</span>
                          <span className="font-medium">{goal.progressPercentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              goal.progressPercentage >= 80 ? 'bg-green-500' :
                              goal.progressPercentage >= 50 ? 'bg-yellow-500' :
                              'bg-blue-500'
                            }`}
                            style={{ width: `${Math.min(100, goal.progressPercentage)}%` }}
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{goal.currentValue} / {goal.targetValue} {goal.metricUnit}</span>
                        <span>{format(new Date(goal.endDate), 'MMM d')}</span>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Goal Statistics */}
        {activeGoals.length > 0 && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground">
                {t('dashboard.goalStatistics')}
              </h2>
              <Link href="/goals" className="text-indigo-600 hover:text-indigo-700 text-sm">
                {t('dashboard.manageGoals')} →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                <Target className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-indigo-600">{totalActiveGoals}</div>
                <div className="text-sm text-muted-foreground">{t('dashboard.activeGoals')}</div>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <Trophy className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-600">{goalsWithHighAchievement}</div>
                <div className="text-sm text-muted-foreground">{t('dashboard.nearCompletion')}</div>
              </div>
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-600">{dailyGoals.length}</div>
                <div className="text-sm text-muted-foreground">{t('dashboard.dailyGoals')}</div>
              </div>
              <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <BarChart3 className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-orange-600">
                  {activeGoals.length > 0 ? Math.round(activeGoals.reduce((sum, goal) => sum + goal.progressPercentage, 0) / activeGoals.length) : 0}%
                </div>
                <div className="text-sm text-muted-foreground">{t('dashboard.avgProgress')}</div>
              </div>
            </div>
          </Card>
        )}

        {/* TODO進捗サマリー */}
        {todos.length > 0 && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground">
                {t('dashboard.todoProgressSummary')}
              </h2>
              <Link href="/todos" className="text-blue-600 hover:text-blue-700 text-sm">
                {t('dashboard.viewAllArrow')}
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{todos.length}</div>
                <div className="text-sm text-muted-foreground">{t('dashboard.totalTasks')}</div>
              </div>
              <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{incompleteTodos.length}</div>
                <div className="text-sm text-muted-foreground">{t('dashboard.incomplete')}</div>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{completionRate}%</div>
                <div className="text-sm text-muted-foreground">{t('dashboard.completionRate')}</div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}

export default function Dashboard() {
  return (
    <AuthGuard>
      <DashboardPage />
    </AuthGuard>
  );
}