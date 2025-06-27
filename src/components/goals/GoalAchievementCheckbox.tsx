'use client';

import { Goal } from '@/types/goal';
import { CheckIcon } from '@heroicons/react/24/outline';

interface GoalAchievementCheckboxProps {
  goal: Goal;
  isAchievedToday: boolean;
  onToggle: () => void;
  isLoading?: boolean;
}

export default function GoalAchievementCheckbox({
  goal,
  isAchievedToday,
  onToggle,
  isLoading = false,
}: GoalAchievementCheckboxProps) {
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggle();
      }}
      disabled={isLoading}
      className={`
        h-6 w-6 rounded-md border-2 transition-all duration-200
        ${
          isAchievedToday
            ? 'border-green-500 bg-green-500 text-white'
            : 'border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500'
        }
        ${isLoading ? 'animate-pulse cursor-not-allowed' : 'cursor-pointer'}
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
        dark:focus:ring-offset-gray-800
      `}
      aria-label={
        isAchievedToday
          ? `Mark ${goal.title} as not achieved`
          : `Mark ${goal.title} as achieved`
      }
    >
      {isAchievedToday ? (
        <CheckIcon className="h-4 w-4" strokeWidth={3} />
      ) : (
        <span className="block h-4 w-4 opacity-0 transition-opacity duration-200 hover:opacity-30">
          <CheckIcon className="h-4 w-4" strokeWidth={3} />
        </span>
      )}
    </button>
  );
}