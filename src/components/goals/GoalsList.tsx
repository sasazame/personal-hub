'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { GoalCard } from './GoalCard';
import { Modal } from '@/components/ui/Modal';
import { GoalForm } from './GoalForm';
import { useGoals } from '@/hooks/useGoals';
import { GoalType, type Goal } from '@/types/goal';

export const GoalsList = () => {
  const t = useTranslations();
  const { goals, activeGoals, isLoading, error } = useGoals();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedType, setSelectedType] = useState<GoalType | 'ALL'>('ALL');
  const [showActiveOnly, setShowActiveOnly] = useState(false);

  const filteredGoals = (showActiveOnly ? activeGoals : goals).filter((goal) => {
    if (selectedType === 'ALL') return true;
    return goal.goalType === selectedType;
  });

  const groupedGoals = filteredGoals.reduce((acc, goal) => {
    const type = goal.goalType;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(goal);
    return acc;
  }, {} as Record<GoalType, Goal[]>);

  // Define the order for goal types
  const goalTypeOrder = [GoalType.DAILY, GoalType.WEEKLY, GoalType.MONTHLY, GoalType.ANNUAL];

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-lg text-muted-foreground">{t('common.loading')}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-lg text-destructive">{t('errors.general')}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {t('goal.title')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('goal.subtitle')}
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-md hover:shadow-lg transition-all"
        >
          {t('goal.createGoal')}
        </button>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-foreground">{t('goal.filterByType')}</label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as GoalType | 'ALL')}
            className="px-3 py-1 border border-border rounded-md text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">{t('goal.allTypes')}</option>
            <option value={GoalType.DAILY}>{t('goal.types.daily')}</option>
            <option value={GoalType.WEEKLY}>{t('goal.types.weekly')}</option>
            <option value={GoalType.MONTHLY}>{t('goal.types.monthly')}</option>
            <option value={GoalType.ANNUAL}>{t('goal.types.annual')}</option>
          </select>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showActiveOnly}
            onChange={(e) => setShowActiveOnly(e.target.checked)}
            className="rounded text-primary focus:ring-primary"
          />
          <span className="text-foreground">{t('goal.activeGoalsOnly')}</span>
        </label>
      </div>

      {filteredGoals.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-lg shadow">
          <p className="text-muted-foreground mb-4">{t('goal.noGoals')}</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-md hover:shadow-lg transition-all"
          >
            {t('goal.createFirstGoal')}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {selectedType === 'ALL' ? (
            goalTypeOrder
              .filter(type => groupedGoals[type])
              .map((type) => (
                <div key={type} className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">
                    {t(`goal.sections.${type.toLowerCase()}Goals`)}
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {groupedGoals[type].map((goal) => (
                      <GoalCard key={goal.id} goal={goal} />
                    ))}
                  </div>
                </div>
              ))
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredGoals.map((goal) => (
                <GoalCard key={goal.id} goal={goal} />
              ))}
            </div>
          )}
        </div>
      )}

      <Modal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      >
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4 text-foreground">{t('goal.createGoal')}</h2>
          <GoalForm
            onSuccess={() => setShowCreateModal(false)}
            onCancel={() => setShowCreateModal(false)}
          />
        </div>
      </Modal>
    </div>
  );
};