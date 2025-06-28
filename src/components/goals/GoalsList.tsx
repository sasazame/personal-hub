'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { PlusIcon } from '@heroicons/react/24/solid';
import { useTranslations } from 'next-intl';
import { DateNavigationHeader } from './DateNavigationHeader';
import { FilterTabs, type GoalFilter } from './FilterTabs';
import { GoalCard } from './GoalCard';
import { Modal } from '@/components/ui/Modal';
import { GoalForm } from './GoalForm';
import { useGoals } from '@/hooks/useGoals';
import { useToggleAchievement } from '@/hooks/useToggleAchievement';
import { GoalType, type GoalWithStatus } from '@/types/goal';
import { cn } from '@/lib/cn';
import toast from 'react-hot-toast';

interface GoalGroupProps {
  type: GoalType;
  goals: GoalWithStatus[];
  selectedDate: Date;
  expanded: boolean;
  onToggle: () => void;
  onToggleCompletion: (goalId: string) => void;
  onToggleActive: (goalId: string) => void;
  onEdit: (goal: GoalWithStatus) => void;
  onDelete: (goal: GoalWithStatus) => void;
}

function GoalGroup({
  type,
  goals,
  selectedDate,
  expanded,
  onToggle,
  onToggleCompletion,
  onToggleActive,
  onEdit,
  onDelete,
}: GoalGroupProps) {
  const t = useTranslations();
  
  const typeLabels: Record<GoalType, string> = {
    [GoalType.DAILY]: t('goal.sections.dailyGoals'),
    [GoalType.WEEKLY]: t('goal.sections.weeklyGoals'),
    [GoalType.MONTHLY]: t('goal.sections.monthlyGoals'),
    [GoalType.ANNUAL]: t('goal.sections.annualGoals'),
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-sm">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between text-left bg-muted/30 hover:bg-muted/50 rounded-lg transition-colors"
      >
        <div className="flex items-center gap-2">
          {expanded ? (
            <ChevronDownIcon className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronRightIcon className="h-5 w-5 text-muted-foreground" />
          )}
          <h3 className="text-lg font-semibold text-foreground">
            {typeLabels[type]}
          </h3>
          <span className="text-sm text-muted-foreground">({goals.length})</span>
        </div>
      </button>
      
      {expanded && (
        <div className="p-4 pt-0">
          {goals.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              {t('goal.noGoalsOfType', { type: typeLabels[type].toLowerCase() })}
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {goals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  selectedDate={selectedDate}
                  onToggleCompletion={onToggleCompletion}
                  onToggleActive={onToggleActive}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function GoalsList() {
  const t = useTranslations();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeFilter, setActiveFilter] = useState<GoalFilter>('active');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<GoalWithStatus | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Record<GoalType, boolean>>({
    [GoalType.DAILY]: true,
    [GoalType.WEEKLY]: true,
    [GoalType.MONTHLY]: true,
    [GoalType.ANNUAL]: true,
  });

  // Use the updated useGoals hook with date and filter parameters
  const { goals, isLoading, error, deleteGoal, isDeleting, updateGoal } = useGoals(
    format(selectedDate, 'yyyy-MM-dd'),
    activeFilter
  );

  const { toggleAchievement } = useToggleAchievement();

  const handleToggleGroup = (type: GoalType) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const handleToggleCompletion = async (goalId: string) => {
    toggleAchievement({ goalId, date: selectedDate });
  };

  const handleToggleActive = async (goalId: string) => {
    const goal = goals.find(g => g.id === Number(goalId));
    if (goal) {
      updateGoal({ 
        id: Number(goalId), 
        data: {
          title: goal.title,
          description: goal.description || '',
          goalType: goal.goalType,
          startDate: goal.startDate,
          endDate: goal.endDate,
          isActive: !goal.isActive,
          metricType: goal.metricType,
          targetValue: goal.targetValue
        }
      });
    }
  };

  const handleEdit = (goal: GoalWithStatus) => {
    setSelectedGoal(goal);
    setShowEditModal(true);
  };

  const handleDelete = (goal: GoalWithStatus) => {
    setSelectedGoal(goal);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (selectedGoal) {
      await deleteGoal(selectedGoal.id);
      setShowDeleteModal(false);
      setSelectedGoal(null);
      toast.success(t('goal.deleteSuccess'));
    }
  };

  // Ensure goals is an array
  const goalsArray = Array.isArray(goals) ? goals : [];
  
  // Filter goals based on activeFilter
  const filteredGoals = goalsArray.filter(goal => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'active') return goal.isActive;
    if (activeFilter === 'inactive') return !goal.isActive;
    return true;
  });

  // Group goals by type
  const groupedGoals = filteredGoals.reduce((acc, goal) => {
    const type = goal.goalType;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(goal);
    return acc;
  }, {} as Record<GoalType, GoalWithStatus[]>);

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
          <h1 className="text-3xl font-bold text-foreground">{t('goal.title')}</h1>
          <p className="text-muted-foreground mt-1">
            {t('goal.subtitle')}
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-md hover:shadow-lg transition-all"
        >
          <PlusIcon className="h-5 w-5" />
          {t('goal.createGoal')}
        </button>
      </div>

      <DateNavigationHeader
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
      />

      <FilterTabs
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />

      <div className="space-y-4">
        {goalTypeOrder.map((type) => (
          <GoalGroup
            key={type}
            type={type}
            goals={groupedGoals[type] || []}
            selectedDate={selectedDate}
            expanded={expandedGroups[type]}
            onToggle={() => handleToggleGroup(type)}
            onToggleCompletion={handleToggleCompletion}
            onToggleActive={handleToggleActive}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {/* Create Goal Modal */}
      <Modal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      >
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4 text-foreground">
            {t('goal.createGoal')}
          </h2>
          <GoalForm
            onSuccess={() => {
              setShowCreateModal(false);
              toast.success(t('goal.createSuccess'));
            }}
            onCancel={() => setShowCreateModal(false)}
          />
        </div>
      </Modal>

      {/* Edit Goal Modal */}
      <Modal
        open={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedGoal(null);
        }}
      >
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4 text-foreground">
            {t('goal.editGoal')}
          </h2>
          {selectedGoal && (
            <GoalForm
              goal={selectedGoal}
              onSuccess={() => {
                setShowEditModal(false);
                setSelectedGoal(null);
                toast.success(t('goal.updateSuccess'));
              }}
              onCancel={() => {
                setShowEditModal(false);
                setSelectedGoal(null);
              }}
            />
          )}
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedGoal(null);
        }}
      >
        <div className="p-6 space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            {t('goal.deleteGoal')}
          </h2>
          <p className="text-muted-foreground">
            {t('goal.confirmDelete')}
          </p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedGoal(null);
              }}
              className="px-4 py-2 text-foreground bg-muted rounded-lg hover:bg-muted/80 transition-colors"
              disabled={isDeleting}
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={confirmDelete}
              disabled={isDeleting}
              className={cn(
                'px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors',
                isDeleting && 'opacity-50 cursor-not-allowed'
              )}
            >
              {isDeleting ? t('common.deleting') : t('common.delete')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}