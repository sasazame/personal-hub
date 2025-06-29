'use client';

import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/Card';
import { GoalType, type GoalWithStatus } from '@/types/goal';
import { cn } from '@/lib/cn';
import { Switch } from '@/components/ui/switch';
import { DropdownMenu } from '@/components/ui/DropdownMenu';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

interface GoalCardProps {
  goal: GoalWithStatus;
  selectedDate?: Date;
  onToggleCompletion: (goalId: string) => void;
  onToggleActive: (goalId: string) => void;
  onEdit?: (goal: GoalWithStatus) => void;
  onDelete?: (goal: GoalWithStatus) => void;
}

export function GoalCard({ 
  goal, 
  onToggleCompletion, 
  onToggleActive,
  onEdit,
  onDelete 
}: GoalCardProps) {
  const t = useTranslations();

  const formatStreak = (goalType: GoalType, streak: number): string => {
    if (streak < 2) return ''; // 2連続以上から表示
    
    switch (goalType) {
      case GoalType.DAILY:
        return t('goal.streakContinuous', { count: streak, unit: t('goal.units.days') });
      case GoalType.WEEKLY:
        return t('goal.streakContinuous', { count: streak, unit: t('goal.units.weeks') });
      case GoalType.MONTHLY:
        return t('goal.streakContinuous', { count: streak, unit: t('goal.units.months') });
      case GoalType.ANNUAL:
        return t('goal.streakContinuous', { count: streak, unit: t('goal.units.years') });
      default:
        return '';
    }
  };


  return (
    <Card 
      className={cn(
        'p-6 hover:shadow-lg transition-shadow',
        !goal.isActive && 'opacity-60',
        goal.completed && 'ring-2 ring-green-500/20 bg-green-50/50 dark:bg-green-900/10'
      )}
    >
      <div className="space-y-4">
        {/* Header with checkbox and menu */}
        <div className="flex items-start gap-3">
          {/* Completion Checkbox */}
          <div className="mt-0.5">
            <input
              type="checkbox"
              id={`goal-${goal.id}`}
              checked={goal.completed}
              onChange={() => onToggleCompletion(String(goal.id))}
              className={cn(
                'h-5 w-5 rounded border-border text-primary focus:ring-2 focus:ring-primary cursor-pointer',
                !goal.isActive && 'cursor-not-allowed'
              )}
              disabled={!goal.isActive}
              aria-label={t('goal.toggleCompletion', { title: goal.title })}
            />
          </div>

          {/* Title and Menu */}
          <div className="flex-1 flex items-start justify-between">
            <div className="flex-1">
              <h3 className={cn(
                'text-lg font-semibold text-foreground',
                goal.completed && 'line-through text-muted-foreground'
              )}>
                {goal.title}
              </h3>
              {goal.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {goal.description}
                </p>
              )}
            </div>

            {/* Menu */}
            <DropdownMenu 
              items={[
                ...(onEdit ? [{
                  label: t('common.edit'),
                  onClick: () => onEdit(goal),
                  icon: <PencilIcon className="h-4 w-4" />
                }] : []),
                ...(onDelete ? [{
                  label: t('common.delete'),
                  onClick: () => onDelete(goal),
                  variant: 'danger' as const,
                  icon: <TrashIcon className="h-4 w-4" />
                }] : [])
              ]}
            />
          </div>
        </div>

        {/* Badges and Status Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Streak Badge */}
            {goal.currentStreak >= 2 && (
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
                {formatStreak(goal.goalType, goal.currentStreak)}
              </span>
            )}
          </div>

          {/* Active/Inactive Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {goal.isActive ? t('goal.active') : t('goal.inactive')}
            </span>
            <Switch
              checked={goal.isActive}
              onChange={() => onToggleActive(String(goal.id))}
              aria-label={t('goal.toggleActive', { title: goal.title })}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}