'use client';

import { useState } from 'react';
import { GoalCard } from './GoalCard';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { GoalForm } from './GoalForm';
import { useGoals } from '@/hooks/useGoals';
import { GoalType, type Goal } from '@/types/goal';

export const GoalsList = () => {
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

  if (isLoading) {
    return <div className="text-center py-8">Loading goals...</div>;
  }

  if (error) {
    return <div className="text-red-600 text-center py-8">Error loading goals</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">My Goals</h2>
        <Button onClick={() => setShowCreateModal(true)}>Create Goal</Button>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Filter by type:</label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as GoalType | 'ALL')}
            className="px-3 py-1 border rounded-md text-sm"
          >
            <option value="ALL">All Types</option>
            <option value={GoalType.DAILY}>Daily</option>
            <option value={GoalType.WEEKLY}>Weekly</option>
            <option value={GoalType.MONTHLY}>Monthly</option>
            <option value={GoalType.ANNUAL}>Annual</option>
          </select>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showActiveOnly}
            onChange={(e) => setShowActiveOnly(e.target.checked)}
            className="rounded"
          />
          <span>Active goals only</span>
        </label>
      </div>

      {filteredGoals.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 mb-4">No goals found</p>
          <Button onClick={() => setShowCreateModal(true)}>Create your first goal</Button>
        </div>
      ) : (
        <div className="space-y-6">
          {selectedType === 'ALL' ? (
            Object.entries(groupedGoals).map(([type, goals]) => (
              <div key={type} className="space-y-4">
                <h3 className="text-lg font-semibold capitalize">{type.toLowerCase()} Goals</h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {goals.map((goal) => (
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
          <h2 className="text-xl font-semibold mb-4">Create New Goal</h2>
          <GoalForm
          onSuccess={() => setShowCreateModal(false)}
          onCancel={() => setShowCreateModal(false)}
        />
        </div>
      </Modal>
    </div>
  );
};