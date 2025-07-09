'use client';

import { Moment } from '@/types/moment';
import { Card } from '@/components/ui';
import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Edit, Trash2, Tag, Clock } from 'lucide-react';

interface MomentListProps {
  moments: Moment[];
  onMomentClick: (moment: Moment) => void;
  onEditMoment: (moment: Moment) => void;
  onDeleteMoment: (moment: Moment) => void;
}

export function MomentList({ moments, onMomentClick, onEditMoment, onDeleteMoment }: MomentListProps) {
  if (!moments || !Array.isArray(moments) || moments.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground text-lg">モーメントがありません</div>
        <p className="text-sm text-muted-foreground mt-2">
          新しいモーメントを記録して始めましょう
        </p>
      </div>
    );
  }

  // Group moments by date
  const groupedMoments = moments.reduce((groups, moment) => {
    const date = moment.createdAt ? new Date(moment.createdAt) : new Date();
    const dateKey = format(date, 'yyyy-MM-dd');
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(moment);
    return groups;
  }, {} as Record<string, Moment[]>);

  // Sort dates in descending order
  const sortedDates = Object.keys(groupedMoments).sort((a, b) => b.localeCompare(a));

  const formatDateHeader = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) {
      return '今日';
    }
    if (isYesterday(date)) {
      return '昨日';
    }
    return format(date, 'M月d日 (E)', { locale: ja });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) {
      return formatDistanceToNow(date, { addSuffix: true, locale: ja });
    }
    return format(date, 'HH:mm');
  };

  const getTagColor = (tag: string) => {
    switch (tag) {
      case 'Ideas':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300';
      case 'Discoveries':
        return 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300';
      case 'Emotions':
        return 'bg-pink-100 dark:bg-pink-900 text-pink-700 dark:text-pink-300';
      case 'Log':
        return 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300';
      case 'Other':
        return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
      default:
        // Custom tags
        return 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300';
    }
  };

  return (
    <div className="space-y-6">
      {sortedDates.map((dateKey) => (
        <div key={dateKey}>
          {/* Date Header */}
          <h3 className="text-lg font-semibold text-foreground mb-3 sticky top-0 bg-background z-10 py-2">
            {formatDateHeader(dateKey)}
          </h3>
          
          {/* Moments for this date */}
          <div className="space-y-3">
            {groupedMoments[dateKey]
              .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())
              .map((moment) => (
                <Card 
                  key={moment.id} 
                  className="p-4 cursor-pointer hover:shadow-md transition-all group relative timeline-card"
                  onClick={() => onMomentClick(moment)}
                >
                  <div className="flex items-start gap-3">
                    {/* Time indicator */}
                    <div className="flex-shrink-0 text-sm text-muted-foreground flex items-center gap-1 min-w-[80px]">
                      <Clock className="w-3 h-3" />
                      {moment.createdAt && formatTime(moment.createdAt)}
                    </div>
                    
                    {/* Content and actions */}
                    <div className="flex-grow">
                      {/* Content */}
                      <div className="text-foreground whitespace-pre-wrap break-words mb-2">
                        {moment.content}
                      </div>
                      
                      {/* Tags */}
                      {moment.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {moment.tags.map((tag) => (
                            <span
                              key={tag}
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getTagColor(tag)}`}
                            >
                              <Tag className="w-3 h-3" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Actions */}
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditMoment(moment);
                        }}
                        className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-400 hover:text-blue-500"
                        title="編集"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteMoment(moment);
                        }}
                        className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-400 hover:text-red-500"
                        title="削除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}