'use client';

import { GoalWithTracking } from '@/types/goal';
import { useTranslations } from 'next-intl';

interface GoalTrackingInfoProps {
  goal: GoalWithTracking;
}

export default function GoalTrackingInfo({ goal }: GoalTrackingInfoProps) {
  const t = useTranslations('goal');
  const { trackingInfo } = goal;

  const getStreakEmoji = (streak: number) => {
    if (streak >= 30) return '🔥🔥🔥';
    if (streak >= 14) return '🔥🔥';
    if (streak >= 7) return '🔥';
    if (streak >= 3) return '✨';
    return '';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACHIEVED':
        return 'text-green-600 dark:text-green-400';
      case 'PENDING':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'FAILED':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-3">
      {/* Achievement Progress */}
      <div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            📊 {t('tracking.achievementStatus')}
          </span>
          <span className="font-medium">
            {t('tracking.achievedDays', {
              achieved: trackingInfo.achievedDays,
              total: trackingInfo.totalDays,
            })} ({Math.round(trackingInfo.achievementRate)}%)
          </span>
        </div>
        <div className="mt-1 h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            className="h-2 rounded-full bg-blue-500 transition-all duration-300"
            style={{ width: `${trackingInfo.achievementRate}%` }}
          />
        </div>
      </div>

      {/* Streak Info */}
      {trackingInfo.currentStreak > 0 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            {getStreakEmoji(trackingInfo.currentStreak)} {t('tracking.currentStreak')}
          </span>
          <span className="font-medium">
            {trackingInfo.currentStreak} {t('days')}
            {trackingInfo.longestStreak > 0 && (
              <span className="ml-2 text-gray-500">
                ({t('tracking.longestStreak')}: {trackingInfo.longestStreak} {t('days')})
              </span>
            )}
          </span>
        </div>
      )}

      {/* Today's Status */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600 dark:text-gray-400">{t('today')}:</span>
        <span className={`font-medium ${getStatusColor(trackingInfo.todayStatus)}`}>
          {trackingInfo.todayStatus === 'ACHIEVED' && '✅ '}
          {trackingInfo.todayStatus === 'PENDING' && '⏳ '}
          {trackingInfo.todayStatus === 'FAILED' && '❌ '}
          {t(`tracking.todayStatus.${trackingInfo.todayStatus.toLowerCase()}`)}
        </span>
      </div>
    </div>
  );
}