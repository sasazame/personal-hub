'use client';

import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import { AppLayout } from '@/components/layout/AppLayout';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Button } from '@/components/ui/Button';
import { useGoalTracking } from '@/hooks/useGoalTracking';

export default function GoalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations('goal');
  const goalId = Number(params.id);
  
  const { data: goal, isLoading } = useGoalTracking(goalId);

  return (
    <AuthGuard>
      <AppLayout>
        <div className="space-y-6">
          {/* Header */}
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
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : goal ? (
            <div className="space-y-6">
              {/* Goal Info */}
              <div>
                <h1 className="text-2xl font-bold text-foreground">{goal.title}</h1>
                {goal.description && (
                  <p className="mt-2 text-muted-foreground">{goal.description}</p>
                )}
              </div>

              {/* Tabs */}
              <div className="border-b border-border">
                <nav className="-mb-px flex space-x-8">
                  <button className="border-b-2 border-primary py-2 px-1 text-sm font-medium text-primary">
                    {t('stats')}
                  </button>
                  <button className="border-b-2 border-transparent py-2 px-1 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-border">
                    {t('history')}
                  </button>
                  <button className="border-b-2 border-transparent py-2 px-1 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-border">
                    {t('calendar')}
                  </button>
                </nav>
              </div>

              {/* Content */}
              <div className="bg-card p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-4">{t('statistics')}</h2>
                <p className="text-muted-foreground">{t('comingSoon')}</p>
              </div>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-12">{t('goalNotFound')}</p>
          )}
        </div>
      </AppLayout>
    </AuthGuard>
  );
}