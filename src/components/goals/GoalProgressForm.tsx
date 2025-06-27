'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { TextArea } from '@/components/ui/TextArea';
import { useGoals } from '@/hooks/useGoals';
import { MetricType } from '@/types/goal';

const progressFormSchema = z.object({
  value: z.number().min(0, 'Value must be positive'),
  date: z.string().optional(),
  note: z.string().optional(),
});

type ProgressFormData = z.infer<typeof progressFormSchema>;

interface GoalProgressFormProps {
  goalId: number;
  metricType: MetricType;
  metricUnit?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const GoalProgressForm = ({
  goalId,
  metricType,
  metricUnit,
  onSuccess,
  onCancel,
}: GoalProgressFormProps) => {
  const { recordProgress, isRecordingProgress } = useGoals();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProgressFormData>({
    resolver: zodResolver(progressFormSchema),
    defaultValues: {
      date: format(new Date(), 'yyyy-MM-dd'),
    },
  });

  const onSubmit = (data: ProgressFormData) => {
    recordProgress(
      { goalId, data },
      {
        onSuccess: () => {
          onSuccess?.();
        },
      }
    );
  };

  const getValueLabel = () => {
    switch (metricType) {
      case MetricType.TIME:
        return `Time (${metricUnit || 'minutes'})`;
      case MetricType.PERCENTAGE:
        return 'Percentage';
      case MetricType.NUMERIC:
        return `Value${metricUnit ? ` (${metricUnit})` : ''}`;
      default:
        return 'Count';
    }
  };

  const getValueStep = () => {
    return metricType === MetricType.COUNT ? '1' : '0.01';
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Input
          {...register('value', { valueAsNumber: true })}
          label={getValueLabel()}
          type="number"
          step={getValueStep()}
          placeholder="Enter value"
          error={errors.value?.message}
        />
      </div>

      <div>
        <Input
          {...register('date')}
          label="Date"
          type="date"
          max={format(new Date(), 'yyyy-MM-dd')}
        />
      </div>

      <div>
        <TextArea
          {...register('note')}
          label="Note (optional)"
          placeholder="Add any notes about this progress"
          rows={3}
        />
      </div>

      <div className="flex gap-2 justify-end">
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isRecordingProgress}
          >
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isRecordingProgress}>
          {isRecordingProgress ? 'Recording...' : 'Record Progress'}
        </Button>
      </div>
    </form>
  );
};