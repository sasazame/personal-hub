'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { TextArea } from '@/components/ui/TextArea';
import { useGoals } from '@/hooks/useGoals';
import { GoalType, MetricType } from '@/types/goal';

const goalFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  goalType: z.nativeEnum(GoalType),
  metricType: z.nativeEnum(MetricType),
  metricUnit: z.string().optional(),
  targetValue: z.number().positive('Target value must be positive'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
}).refine((data) => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  return end > start;
}, {
  message: 'End date must be after start date',
  path: ['endDate'],
});

type GoalFormData = z.infer<typeof goalFormSchema>;

interface GoalFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const GoalForm = ({ onSuccess, onCancel }: GoalFormProps) => {
  const { createGoal, isCreating } = useGoals();
  const [selectedMetricType, setSelectedMetricType] = useState<MetricType>(MetricType.COUNT);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<GoalFormData>({
    resolver: zodResolver(goalFormSchema),
    defaultValues: {
      goalType: GoalType.WEEKLY,
      metricType: MetricType.COUNT,
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    },
  });

  const onSubmit = (data: GoalFormData) => {
    createGoal(data, {
      onSuccess: () => {
        onSuccess?.();
      },
    });
  };

  const getMetricUnitPlaceholder = () => {
    switch (selectedMetricType) {
      case MetricType.NUMERIC:
        return 'e.g., kg, km, hours';
      case MetricType.TIME:
        return 'minutes';
      case MetricType.PERCENTAGE:
        return '%';
      default:
        return '';
    }
  };

  const shouldShowMetricUnit = () => {
    return selectedMetricType === MetricType.NUMERIC || selectedMetricType === MetricType.TIME;
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Input
          {...register('title')}
          label="Title"
          placeholder="Goal title"
          error={errors.title?.message}
        />
      </div>

      <div>
        <TextArea
          {...register('description')}
          label="Description (optional)"
          placeholder="Description (optional)"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Goal Type</label>
          <select
            {...register('goalType')}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
          >
            <option value={GoalType.DAILY}>Daily</option>
            <option value={GoalType.WEEKLY}>Weekly</option>
            <option value={GoalType.MONTHLY}>Monthly</option>
            <option value={GoalType.ANNUAL}>Annual</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Metric Type</label>
          <select
            {...register('metricType')}
            onChange={(e) => {
              const value = e.target.value as MetricType;
              setSelectedMetricType(value);
              setValue('metricType', value);
            }}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
          >
            <option value={MetricType.COUNT}>Count</option>
            <option value={MetricType.NUMERIC}>Numeric</option>
            <option value={MetricType.PERCENTAGE}>Percentage</option>
            <option value={MetricType.TIME}>Time</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Input
            {...register('targetValue', { valueAsNumber: true })}
            label="Target Value"
            type="number"
            step="0.01"
            placeholder="Target value"
            error={errors.targetValue?.message}
          />
        </div>

        {shouldShowMetricUnit() && (
          <div>
            <Input
              {...register('metricUnit')}
              label="Unit"
              placeholder={getMetricUnitPlaceholder()}
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Input
            {...register('startDate')}
            label="Start Date"
            type="date"
            error={errors.startDate?.message}
          />
        </div>

        <div>
          <Input
            {...register('endDate')}
            label="End Date"
            type="date"
            error={errors.endDate?.message}
          />
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isCreating}
          >
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isCreating}>
          {isCreating ? 'Creating...' : 'Create Goal'}
        </Button>
      </div>
    </form>
  );
};