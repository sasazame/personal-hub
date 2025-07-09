import { Moment } from '@/types/moment';
import { format } from 'date-fns';

/**
 * Groups moments by date
 * @param moments Array of moments to group
 * @returns Object with date keys (yyyy-MM-dd) and arrays of moments as values
 */
export function groupMomentsByDate(moments: Moment[]): Record<string, Moment[]> {
  return moments.reduce((groups, moment) => {
    const date = moment.createdAt ? new Date(moment.createdAt) : new Date();
    const dateKey = format(date, 'yyyy-MM-dd');
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(moment);
    return groups;
  }, {} as Record<string, Moment[]>);
}

/**
 * Gets sorted date keys in descending order
 * @param groupedMoments Object with date keys
 * @returns Array of date keys sorted in descending order
 */
export function getSortedDateKeys(groupedMoments: Record<string, Moment[]>): string[] {
  return Object.keys(groupedMoments).sort((a, b) => b.localeCompare(a));
}