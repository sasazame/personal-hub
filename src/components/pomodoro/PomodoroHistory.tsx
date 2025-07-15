'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSessionHistory } from '@/hooks/usePomodoro';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PomodoroSession, PomodoroTask } from '@/types/pomodoro';
import { Clock, CheckCircle, Calendar } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/cn';
import { pomodoroService } from '@/services/pomodoro';

interface PomodoroHistoryProps {
  showTaskDetails?: boolean;
}

export function PomodoroHistory({ showTaskDetails = false }: PomodoroHistoryProps) {
  const t = useTranslations('pomodoro.history');
  const [page, setPage] = React.useState(0);
  const [showCount, setShowCount] = React.useState(10);
  const { data, isLoading } = useSessionHistory(page, showCount);
  const [sessionTasks, setSessionTasks] = useState<Record<string, PomodoroTask[]>>({});
  const [loadingTasks, setLoadingTasks] = useState<Set<string>>(new Set());

  // Memoized fetchTasks function
  const fetchTasks = useCallback(async (sessions: PomodoroSession[]) => {
    const sessionsToFetch = sessions.filter(
      (session: PomodoroSession) => 
        !sessionTasks[session.id] && 
        !loadingTasks.has(session.id)
    );

    if (sessionsToFetch.length === 0) return;

    setLoadingTasks(prev => {
      const next = new Set(prev);
      sessionsToFetch.forEach((s: PomodoroSession) => next.add(s.id));
      return next;
    });

    const taskPromises = sessionsToFetch.map(async (session: PomodoroSession) => {
      try {
        const tasks = await pomodoroService.getSessionTasks(session.id);
        return { sessionId: session.id, tasks };
      } catch (error) {
        console.error(`Failed to fetch tasks for session ${session.id}:`, error);
        // TODO: Show user notification about failed task loading
        return { sessionId: session.id, tasks: [], error: true };
      }
    });

    const results = await Promise.all(taskPromises);
    
    setSessionTasks(prev => {
      const next = { ...prev };
      results.forEach(({ sessionId, tasks }) => {
        next[sessionId] = tasks;
      });
      return next;
    });

    setLoadingTasks(prev => {
      const next = new Set(prev);
      sessionsToFetch.forEach((s: PomodoroSession) => next.delete(s.id));
      return next;
    });
  }, [sessionTasks, loadingTasks]);

  // Fetch tasks for visible sessions
  useEffect(() => {
    if (!data || !showTaskDetails) return;
    fetchTasks(data.content);
  }, [data, showTaskDetails, fetchTasks]);

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} ${t('minutes')}`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };


  const getSessionTypeColor = (type: string) => {
    switch (type) {
      case 'WORK':
        return 'text-primary';
      case 'SHORT_BREAK':
      case 'LONG_BREAK':
        return 'text-green-500';
      default:
        return 'text-blue-500';
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">{t('loading')}</div>;
  }

  if (!data || data.content.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {t('noHistory')}
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="session-history">
      <h3 className="text-lg font-semibold mb-4">{t('title')}</h3>

      <div className="space-y-3">
        {data.content
          .filter((session: PomodoroSession) => 
            session.status === 'COMPLETED' || session.status === 'CANCELLED'
          )
          .map((session: PomodoroSession) => {
          const duration = session.sessionType === 'WORK' ? session.workDuration : session.breakDuration;
          
          // Get tasks from our fetched data
          const tasks = sessionTasks[session.id] || [];
          const completedTasks = tasks.filter(t => t.completed).length;
          const totalTasks = tasks.length;
          const hasTasks = totalTasks > 0;

          return (
            <Card key={session.id} data-testid="session-item">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {session.status === 'COMPLETED' ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <Clock className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className={cn(
                        "font-medium",
                        getSessionTypeColor(session.sessionType)
                      )}>
                        {t(`sessionType.${session.sessionType.toLowerCase()}`)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        • {formatDuration(duration)}
                      </span>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      <Calendar className="inline h-3 w-3 mr-1" />
                      {session.startTime 
                        ? format(new Date(session.startTime), 'PPp')
                        : formatDistanceToNow(new Date(session.createdAt), { addSuffix: true })}
                    </div>

                    {hasTasks && (
                      <div className="mt-2 text-sm">
                        <span className="text-muted-foreground">{t('tasksCompleted')}:</span>{' '}
                        <span className="font-medium">{completedTasks}/{totalTasks}</span>
                      </div>
                    )}

                    {/* Show task details if enabled */}
                    {showTaskDetails && tasks.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {tasks.slice(0, 3).map((task) => (
                          <div key={task.id} className="text-sm flex items-center gap-2">
                            <span className={cn(
                              "flex-shrink-0 w-4 h-4 rounded-full border-2",
                              task.completed 
                                ? "bg-green-500 border-green-500" 
                                : "border-gray-300"
                            )} />
                            <span className={cn(
                              "truncate",
                              task.completed && "line-through text-muted-foreground"
                            )}>
                              {task.description}
                            </span>
                          </div>
                        ))}
                        {tasks.length > 3 && (
                          <div className="text-sm text-muted-foreground pl-6">
                            +{tasks.length - 3} more...
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="text-right">
                    <span className={cn(
                      "inline-flex px-2 py-1 text-xs rounded-full",
                      session.status === 'COMPLETED'
                        ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                        : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                    )}>
                      {session.status === 'COMPLETED' ? t('status.completed') : t('status.active')}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Show more / Pagination */}
      <div className="flex justify-center mt-6">
        {data.totalElements > showCount && showCount === 10 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCount(20)}
          >
            {t('showMore')}
          </Button>
        )}
        
        {showCount > 10 && data.totalPages > 1 && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 0}
            >
              {t('previous')}
            </Button>
            <span className="flex items-center px-3 text-sm text-muted-foreground">
              {t('page', { current: page + 1, total: data.totalPages })}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page === data.totalPages - 1}
            >
              {t('next')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}