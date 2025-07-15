'use client';

import React from 'react';
import { PomodoroTimer } from '@/components/pomodoro/PomodoroTimer';
import { PomodoroTasks } from '@/components/pomodoro/PomodoroTasks';
import { PomodoroHistory } from '@/components/pomodoro/PomodoroHistory';
import { PomodoroConfig } from '@/components/pomodoro/PomodoroConfig';
import { useActiveSession, useCreateSession, usePomodoroConfig, useUpdateSession } from '@/hooks/usePomodoro';
import { SessionAction, SessionType } from '@/types/pomodoro';
import { prepareSessionData, getIncompleteTasks } from '@/utils/pomodoroHelpers';
import { AuthGuard } from '@/components/auth';
import { AppLayout } from '@/components/layout';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { useTranslations } from 'next-intl';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Clock } from 'lucide-react';

function PomodoroApp() {
  const t = useTranslations('pomodoro');
  usePageTitle('Pomodoro - Personal Hub');
  const { data: activeSession, isLoading } = useActiveSession();
  const { data: config } = usePomodoroConfig();
  const createSession = useCreateSession();
  const updateSession = useUpdateSession();
  
  // Tasks from active session
  const tasks = activeSession?.tasks || [];

  const handleCreateSession = (initialTask?: string) => {
    if (!config) return;
    
    const sessionData = prepareSessionData(
      config,
      initialTask,
      tasks
    );
    
    createSession.mutate(sessionData);
  };

  const handleSessionComplete = () => {
    // Check if we should auto-start break
    if (!activeSession || !config) return;
    
    if (activeSession.sessionType === 'WORK' && config.autoStartBreaks) {
      // Determine break type
      const isLongBreak = (activeSession.completedCycles + 1) % config.cyclesBeforeLongBreak === 0;
      const breakDuration = isLongBreak ? config.longBreakDuration : config.shortBreakDuration;
      
      // Create break session after a short delay
      setTimeout(() => {
        // Create session with incomplete tasks carried over
        const breakSessionData = {
          workDuration: config.workDuration,
          breakDuration: breakDuration,
          tasks: getIncompleteTasks(tasks)
        };
        
        createSession.mutate(breakSessionData, {
          onSuccess: (newSession) => {
            // Switch to break type after creation
            const breakType = isLongBreak ? SessionType.LONG_BREAK : SessionType.SHORT_BREAK;
            updateSession.mutate({
              id: newSession.id,
              action: SessionAction.SWITCH_TYPE,
              sessionType: breakType
            });
          }
        });
      }, 1000);
    } else if (activeSession.sessionType !== 'WORK' && config.autoStartWork) {
      // Auto-start work session after break
      setTimeout(() => {
        handleCreateSession();
      }, 1000);
    }
  };


  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Clock className="h-12 w-12 mx-auto mb-4 animate-pulse" />
            <p>{t('loading')}</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Clock className="h-8 w-8" />
          {t('title')}
        </h1>
        <p className="text-muted-foreground mt-2">{t('description')}</p>
      </div>

      {/* Timer and Tasks Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timer section */}
        <Card className="relative">
          <PomodoroConfig />
          <CardContent className="p-6">
            {activeSession ? (
              <PomodoroTimer onComplete={handleSessionComplete} />
            ) : (
              <div className="text-center py-12">
                <Clock className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h2 className="text-xl font-semibold mb-2">{t('noActiveSession')}</h2>
                <p className="text-muted-foreground mb-6">{t('startSessionPrompt')}</p>
                <Button 
                  onClick={() => handleCreateSession()}
                  size="lg"
                  disabled={createSession.isPending}
                >
                  {createSession.isPending ? t('creating') : t('startSession')}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tasks section - always visible */}
        <Card>
          <CardContent className="p-6">
            <PomodoroTasks 
              sessionId={activeSession?.id} 
              tasks={tasks}
              isActiveSession={!!activeSession && activeSession.status === 'ACTIVE'}
              onCreateSession={handleCreateSession}
            />
          </CardContent>
        </Card>
      </div>

      {/* History section - full width */}
      <Card>
        <CardContent className="p-6">
          <PomodoroHistory showTaskDetails={true} />
        </CardContent>
      </Card>
    </div>
    </AppLayout>
  );
}

export default function PomodoroPage() {
  return (
    <AuthGuard>
      <PomodoroApp />
    </AuthGuard>
  );
}