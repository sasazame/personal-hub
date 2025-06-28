'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, addDays } from 'date-fns';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/Input';
import { TextArea } from '@/components/ui/TextArea';
import { useGoals } from '@/hooks/useGoals';
import { GoalType, MetricType, type Goal } from '@/types/goal';

const goalFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  goalType: z.nativeEnum(GoalType),
  // Start and end dates will be hidden in initial release
  // but keeping them for future use
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

type GoalFormData = z.infer<typeof goalFormSchema>;

interface GoalFormProps {
  goal?: Goal;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function GoalForm({ goal, onSuccess, onCancel }: GoalFormProps) {
  const t = useTranslations();
  const { createGoal, isCreating, updateGoal, isUpdating } = useGoals();
  const isEditing = !!goal;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GoalFormData>({
    resolver: zodResolver(goalFormSchema),
    defaultValues: goal ? {
      title: goal.title,
      description: goal.description || '',
      goalType: goal.goalType,
      startDate: format(new Date(goal.startDate), 'yyyy-MM-dd'),
      endDate: format(new Date(goal.endDate), 'yyyy-MM-dd'),
    } : {
      goalType: GoalType.DAILY,
      // Default dates - will be hidden in UI but sent to backend
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: format(addDays(new Date(), 365), 'yyyy-MM-dd'),
    },
  });

  const onSubmit = (data: GoalFormData) => {
    // For new goals, ensure we have default values for required backend fields
    const submitData = {
      ...data,
      // These fields are temporarily hardcoded until backend is updated
      metricType: MetricType.COUNT,
      targetValue: 1,
      currentValue: 0,
      // Ensure dates are set
      startDate: data.startDate || format(new Date(), 'yyyy-MM-dd'),
      endDate: data.endDate || format(addDays(new Date(), 365), 'yyyy-MM-dd'),
    };

    if (isEditing) {
      updateGoal({ id: goal.id, data: submitData }, {
        onSuccess: () => {
          onSuccess?.();
        },
      });
    } else {
      createGoal(submitData, {
        onSuccess: () => {
          onSuccess?.();
        },
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Input
          {...register('title')}
          label={t('goal.fields.title')}
          placeholder={t('goal.placeholders.title')}
          error={errors.title?.message}
        />
      </div>

      <div>
        <TextArea
          {...register('description')}
          label={t('goal.fields.description')}
          placeholder={t('goal.placeholders.description')}
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          {t('goal.fields.goalType')}
        </label>
        <select
          {...register('goalType')}
          className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
        >
          <option value={GoalType.DAILY}>{t('goal.types.daily')}</option>
          <option value={GoalType.WEEKLY}>{t('goal.types.weekly')}</option>
          <option value={GoalType.MONTHLY}>{t('goal.types.monthly')}</option>
          <option value={GoalType.ANNUAL}>{t('goal.types.annual')}</option>
        </select>
      </div>

      {/* Hidden fields for future use - not displayed in initial release */}
      <input type="hidden" {...register('startDate')} />
      <input type="hidden" {...register('endDate')} />

      <div className="flex gap-2 justify-end pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isCreating || isUpdating}
            className="px-4 py-2 text-foreground bg-muted rounded-lg hover:bg-muted/80 transition-colors disabled:opacity-50"
          >
            {t('common.cancel')}
          </button>
        )}
        <button
          type="submit"
          disabled={isCreating || isUpdating}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {isEditing 
            ? (isUpdating ? t('goal.updating') : t('goal.updateGoal')) 
            : (isCreating ? t('goal.creating') : t('goal.createGoal'))
          }
        </button>
      </div>
    </form>
  );
}