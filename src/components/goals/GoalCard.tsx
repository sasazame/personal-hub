'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { GoalProgressForm } from './GoalProgressForm';
import { GoalForm } from './GoalForm';
import { GoalStatus, MetricType, type Goal } from '@/types/goal';
import { useGoals } from '@/hooks/useGoals';
import { useGoalTracking } from '@/hooks/useGoalTracking';
import { useToggleAchievement } from '@/hooks/useToggleAchievement';
import GoalAchievementCheckbox from './GoalAchievementCheckbox';
import GoalTrackingInfo from './GoalTrackingInfo';
import { cn } from '@/lib/cn';
import { useRouter } from 'next/navigation';
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';

interface GoalCardProps {
  goal: Goal;
}

export const GoalCard = ({ goal }: GoalCardProps) => {
  const t = useTranslations();
  const router = useRouter();
  const { deleteGoal, isDeleting } = useGoals();
  const { data: goalWithTracking, isLoading: isTrackingLoading } = useGoalTracking(goal.id);
  const { toggleAchievement, isLoading: isToggling } = useToggleAchievement(goal.id);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const getStatusColor = (status: GoalStatus) => {
    switch (status) {
      case GoalStatus.ACTIVE:
        return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20';
      case GoalStatus.COMPLETED:
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
      case GoalStatus.PAUSED:
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20';
      case GoalStatus.ARCHIVED:
        return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const formatMetricValue = (value: number, metricType: MetricType, unit?: string) => {
    switch (metricType) {
      case MetricType.TIME:
        return `${value} ${unit || t('goal.units.minutes')}`;
      case MetricType.PERCENTAGE:
        return `${value}%`;
      case MetricType.NUMERIC:
        return `${value}${unit ? ` ${unit}` : ''}`;
      default:
        return value.toString();
    }
  };

  const progressPercentage = Math.min(100, Math.round(goal.progressPercentage));

  const handleDelete = async () => {
    await deleteGoal(goal.id);
    setShowDeleteModal(false);
  };

  return (
    <>
      <Card className="p-6 hover:shadow-lg transition-shadow">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            {/* Checkbox */}
            <GoalAchievementCheckbox
              goal={goal}
              isAchievedToday={goalWithTracking?.trackingInfo?.currentPeriodAchieved || false}
              onToggle={() => toggleAchievement()}
              isLoading={isToggling || isTrackingLoading}
            />
            
            {/* Title and Status */}
            <div className="flex-1 flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground">{goal.title}</h3>
                {goal.description && (
                  <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'px-2 py-1 text-xs font-medium rounded-full',
                    getStatusColor(goal.status)
                  )}
                >
                  {t(`goal.statuses.${goal.status.toLowerCase()}`)}
                </span>
                
                {/* Kebab Menu */}
                <Menu as="div" className="relative">
                  <Menu.Button className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <EllipsisVerticalIcon className="h-5 w-5 text-gray-500" />
                  </Menu.Button>
                  
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                      <div className="py-1">
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={() => setShowEditModal(true)}
                              className={cn(
                                'block w-full text-left px-4 py-2 text-sm',
                                active ? 'bg-gray-100 dark:bg-gray-700' : '',
                                'text-gray-700 dark:text-gray-200'
                              )}
                            >
                              {t('common.edit')}
                            </button>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={() => router.push(`/goals/${goal.id}/history`)}
                              className={cn(
                                'block w-full text-left px-4 py-2 text-sm',
                                active ? 'bg-gray-100 dark:bg-gray-700' : '',
                                'text-gray-700 dark:text-gray-200'
                              )}
                            >
                              {t('goal.achievementHistory')}
                            </button>
                          )}
                        </Menu.Item>
                        {goal.status === GoalStatus.ACTIVE && (
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={() => setShowProgressModal(true)}
                                className={cn(
                                  'block w-full text-left px-4 py-2 text-sm',
                                  active ? 'bg-gray-100 dark:bg-gray-700' : '',
                                  'text-gray-700 dark:text-gray-200'
                                )}
                              >
                                {t('goal.recordProgress')}
                              </button>
                            )}
                          </Menu.Item>
                        )}
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={() => setShowDeleteModal(true)}
                              className={cn(
                                'block w-full text-left px-4 py-2 text-sm',
                                active ? 'bg-gray-100 dark:bg-gray-700' : '',
                                'text-red-600 dark:text-red-400'
                              )}
                            >
                              {t('common.delete')}
                            </button>
                          )}
                        </Menu.Item>
                      </div>
                    </Menu.Items>
                  </Transition>
                </Menu>
              </div>
            </div>
          </div>

          {/* Compact Progress Display */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">{t('goal.progress')}:</span>
              <span className="font-medium text-foreground">
                {formatMetricValue(goal.currentValue, goal.metricType, goal.metricUnit)}/{formatMetricValue(goal.targetValue, goal.metricType, goal.metricUnit)} ({progressPercentage}%)
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span>{t(`goal.types.${goal.goalType.toLowerCase()}`)}</span>
              <span>•</span>
              <span>{format(new Date(goal.endDate), 'MMM d, yyyy', { locale: ja })}</span>
            </div>
          </div>

          {/* Tracking Info */}
          {goalWithTracking && !isTrackingLoading && (
            <GoalTrackingInfo goal={goalWithTracking} />
          )}
        </div>
      </Card>

      <Modal
        open={showProgressModal}
        onClose={() => setShowProgressModal(false)}
      >
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4 text-foreground">{t('goal.recordProgress')}</h2>
          <GoalProgressForm
            goalId={goal.id}
            metricType={goal.metricType}
            metricUnit={goal.metricUnit}
            onSuccess={() => setShowProgressModal(false)}
            onCancel={() => setShowProgressModal(false)}
          />
        </div>
      </Modal>

      <Modal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
      >
        <div className="p-6 space-y-4">
          <h2 className="text-xl font-semibold text-foreground">{t('goal.deleteGoal')}</h2>
          <p className="text-muted-foreground">
            {t('goal.confirmDelete')}
          </p>
          <div className="flex gap-3 justify-end">
            <Button
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
              disabled={isDeleting}
            >
              {t('common.cancel')}
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? t('common.deleting') : t('common.delete')}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
      >
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4 text-foreground">{t('goal.editGoal')}</h2>
          <GoalForm
            goal={goal}
            onSuccess={() => setShowEditModal(false)}
            onCancel={() => setShowEditModal(false)}
          />
        </div>
      </Modal>
    </>
  );
};