import { Moment } from '@/types/moment';
import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';

// Tag color mappings
const TAG_COLOR_MAP = {
  Ideas: { 
    light: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300',
    hover: 'hover:bg-blue-200 dark:hover:bg-blue-800',
    css: { bg: 'var(--tag-ideas-bg)', text: 'var(--tag-ideas-text)' }
  },
  Discoveries: { 
    light: 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300',
    hover: 'hover:bg-purple-200 dark:hover:bg-purple-800',
    css: { bg: 'var(--tag-discoveries-bg)', text: 'var(--tag-discoveries-text)' }
  },
  Emotions: { 
    light: 'bg-pink-100 dark:bg-pink-900 text-pink-700 dark:text-pink-300',
    hover: 'hover:bg-pink-200 dark:hover:bg-pink-800',
    css: { bg: 'var(--tag-emotions-bg)', text: 'var(--tag-emotions-text)' }
  },
  Log: { 
    light: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300',
    hover: 'hover:bg-green-200 dark:hover:bg-green-800',
    css: { bg: 'var(--tag-log-bg)', text: 'var(--tag-log-text)' }
  },
  Other: { 
    light: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
    hover: 'hover:bg-gray-200 dark:hover:bg-gray-700',
    css: { bg: 'var(--color-neutral-100)', text: 'var(--color-neutral-700)' }
  }
};

const DEFAULT_TAG_COLOR = {
  light: 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300',
  hover: '',
  css: { bg: 'var(--tag-default-bg)', text: 'var(--tag-default-text)' }
};

/**
 * Groups moments by date
 * @param moments Array of moments to group
 * @returns Object with date keys (yyyy-MM-dd) and arrays of moments as values
 */
export function groupMomentsByDate(moments: Moment[]): Record<string, Moment[]> {
  return moments.reduce((groups, moment) => {
    try {
      const date = moment.createdAt ? new Date(moment.createdAt) : new Date();
      
      // Validate the date
      if (isNaN(date.getTime())) {
        console.warn(`Invalid date for moment ${moment.id}:`, moment.createdAt);
        // Use current date as fallback
        const fallbackDate = new Date();
        const dateKey = format(fallbackDate, 'yyyy-MM-dd');
        if (!groups[dateKey]) {
          groups[dateKey] = [];
        }
        groups[dateKey].push(moment);
        return groups;
      }
      
      const dateKey = format(date, 'yyyy-MM-dd');
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(moment);
    } catch (error) {
      console.error(`Error processing moment ${moment.id}:`, error);
      // Group under 'invalid' key for problematic dates
      if (!groups['invalid']) {
        groups['invalid'] = [];
      }
      groups['invalid'].push(moment);
    }
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

/**
 * Formats a date string for display as a header
 * @param dateString Date string in yyyy-MM-dd format
 * @param t Optional translation function for i18n
 * @returns Formatted date string (e.g., "今日", "昨日", "12月25日 (月)")
 */
export function formatDateHeader(dateString: string, t?: (key: string) => string): string {
  try {
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      console.warn(`Invalid date string for header: ${dateString}`);
      return dateString; // Return original string as fallback
    }
    
    if (isToday(date)) {
      return t ? t('common.today') : '今日';
    }
    if (isYesterday(date)) {
      return t ? t('common.yesterday') : '昨日';
    }
    return format(date, 'M月d日 (E)', { locale: ja });
  } catch (error) {
    console.error(`Error formatting date header for ${dateString}:`, error);
    return dateString; // Return original string as fallback
  }
}

/**
 * Formats a time for display
 * @param dateString ISO date string
 * @returns Formatted time string (e.g., "3分前", "14:30")
 */
export function formatTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      console.warn(`Invalid date string for time: ${dateString}`);
      return ''; // Return empty string for invalid dates
    }
    
    if (isToday(date)) {
      return formatDistanceToNow(date, { addSuffix: true, locale: ja });
    }
    return format(date, 'HH:mm');
  } catch (error) {
    console.error(`Error formatting time for ${dateString}:`, error);
    return ''; // Return empty string as fallback
  }
}

/**
 * Gets Tailwind CSS classes for a tag
 * @param tag Tag name
 * @param includeHover Whether to include hover classes
 * @returns Tailwind CSS class string
 */
export function getTagColorClasses(tag: string, includeHover = false): string {
  const colorConfig = TAG_COLOR_MAP[tag as keyof typeof TAG_COLOR_MAP] || DEFAULT_TAG_COLOR;
  return includeHover && colorConfig.hover 
    ? `${colorConfig.light} ${colorConfig.hover}`
    : colorConfig.light;
}

/**
 * Gets CSS variable style object for a tag
 * @param tag Tag name
 * @returns CSS style object with background and color
 */
export function getTagColorStyle(tag: string): { backgroundColor: string; color: string } {
  const colorConfig = TAG_COLOR_MAP[tag as keyof typeof TAG_COLOR_MAP] || DEFAULT_TAG_COLOR;
  return {
    backgroundColor: colorConfig.css.bg,
    color: colorConfig.css.text,
  };
}