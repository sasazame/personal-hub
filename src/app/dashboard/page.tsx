'use client';

import { useTranslations } from 'next-intl';
import { AuthGuard } from '@/components/auth';
import { AppLayout } from '@/components/layout';
import { Card } from '@/components/ui';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useTodaysEvents } from '@/hooks/useCalendar';
import { useRecentNotes } from '@/hooks/useNotes';
import { todoApi } from '@/lib/api';
import { format } from 'date-fns';
import { 
  CheckSquare, 
  Calendar, 
  FileText, 
  BarChart3,
  Plus,
  ArrowRight
} from 'lucide-react';

function DashboardPage() {
  const t = useTranslations();

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

  // Handle 403 errors in development gracefully
  const todos = todosResponse?.content || [];
  const incompleteTodos = todos.filter(todo => todo.status !== 'DONE');
  const completedTodos = todos.filter(todo => todo.status === 'DONE');
  const completionRate = todos.length > 0 ? Math.round((completedTodos.length / todos.length) * 100) : 0;
  
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
    {
      title: 'Analytics',
      description: t('dashboard.productivityAnalysis'),
      icon: BarChart3,
      href: '/analytics',
      color: 'bg-orange-500',
      stats: `完了率: ${completionRate}%`,
      count: completionRate
    }
  ];

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