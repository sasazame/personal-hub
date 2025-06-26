'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { GoalProgressForm } from './GoalProgressForm';
import { GoalStatus, MetricType, type Goal } from '@/types/goal';
import { useGoals } from '@/hooks/useGoals';
import { cn } from '@/lib/cn';

interface GoalCardProps {
  goal: Goal;
  onEdit?: () => void;
}

export const GoalCard = ({ goal, onEdit }: GoalCardProps) => {
  const { deleteGoal, isDeleting } = useGoals();
  const [showProgressModal, setShowProgressModal] = useState(false);

  const getStatusColor = (status: GoalStatus) => {
    switch (status) {
      case GoalStatus.ACTIVE:
        return 'text-blue-600 bg-blue-50';
      case GoalStatus.COMPLETED:
        return 'text-green-600 bg-green-50';
      case GoalStatus.PAUSED:
        return 'text-yellow-600 bg-yellow-50';
      case GoalStatus.ARCHIVED:
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const formatMetricValue = (value: number, metricType: MetricType, unit?: string) => {
    switch (metricType) {
      case MetricType.TIME:
        return `${value} ${unit || 'minutes'}`;
      case MetricType.PERCENTAGE:
        return `${value}%`;
      case MetricType.NUMERIC:
        return `${value}${unit ? ` ${unit}` : ''}`;
      default:
        return value.toString();
    }
  };

  const progressPercentage = Math.min(100, Math.round(goal.progressPercentage));

  return (
    <>
      <Card className="p-6 hover:shadow-lg transition-shadow">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{goal.title}</h3>
              {goal.description && (
                <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
              )}
            </div>
            <span
              className={cn(
                'px-2 py-1 text-xs font-medium rounded-full',
                getStatusColor(goal.status)
              )}
            >
              {goal.status}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Progress</span>
              <span className="font-medium">
                {formatMetricValue(goal.currentValue, goal.metricType, goal.metricUnit)} /{' '}
                {formatMetricValue(goal.targetValue, goal.metricType, goal.metricUnit)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="text-right text-sm text-gray-600">{progressPercentage}%</div>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>{goal.goalType}</span>
            <span>
              {format(new Date(goal.startDate), 'MMM d')} -{' '}
              {format(new Date(goal.endDate), 'MMM d, yyyy')}
            </span>
          </div>

          <div className="flex gap-2 pt-2">
            {goal.status === GoalStatus.ACTIVE && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowProgressModal(true)}
              >
                Record Progress
              </Button>
            )}
            {onEdit && (
              <Button variant="secondary" size="sm" onClick={onEdit}>
                Edit
              </Button>
            )}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => deleteGoal(goal.id)}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </Card>

      <Modal
        open={showProgressModal}
        onClose={() => setShowProgressModal(false)}
      >
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Record Progress</h2>
          <GoalProgressForm
          goalId={goal.id}
          metricType={goal.metricType}
          metricUnit={goal.metricUnit}
          onSuccess={() => setShowProgressModal(false)}
          onCancel={() => setShowProgressModal(false)}
        />
        </div>
      </Modal>
    </>
  );
};