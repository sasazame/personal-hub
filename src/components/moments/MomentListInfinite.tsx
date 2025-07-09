'use client';

import { useEffect, useRef } from 'react';
import { Moment } from '@/types/moment';
import { Card } from '@/components/ui';
import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Edit, Trash2, Tag, Clock, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface MomentListInfiniteProps {
  pages?: Array<{
    content: Moment[];
    totalElements: number;
    last: boolean;
  }>;
  onMomentClick: (moment: Moment) => void;
  onEditMoment: (moment: Moment) => void;
  onDeleteMoment: (moment: Moment) => void;
  hasNextPage?: boolean;
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
  isLoading: boolean;
}

export function MomentListInfinite({ 
  pages = [],
  onMomentClick, 
  onEditMoment, 
  onDeleteMoment,
  hasNextPage,
  fetchNextPage,
  isFetchingNextPage,
  isLoading
}: MomentListInfiniteProps) {
  const t = useTranslations();
  const observerTarget = useRef<HTMLDivElement>(null);

  // Flatten all moments from pages
  const moments = pages.flatMap(page => page.content || []);

  // Set up intersection observer for infinite scrolling
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
        <p className="text-muted-foreground mt-2">{t('common.loading')}</p>
      </div>
    );
  }

  if (!moments || moments.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground text-lg">{t('moments.noMoments')}</div>
        <p className="text-sm text-muted-foreground mt-2">
          {t('moments.startRecording')}
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
      return t('common.today');
    }
    if (isYesterday(date)) {
      return t('common.yesterday');
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

  const getTagColorStyle = (tag: string) => {
    const colorMap: { [key: string]: { bg: string; text: string } } = {
      Ideas: { bg: 'rgb(243 232 255)', text: 'rgb(109 40 217)' },
      Discoveries: { bg: 'rgb(219 234 254)', text: 'rgb(29 78 216)' },
      Emotions: { bg: 'rgb(252 231 243)', text: 'rgb(190 24 93)' },
      Log: { bg: 'rgb(220 252 231)', text: 'rgb(21 128 61)' },
      Other: { bg: 'var(--color-neutral-100)', text: 'var(--color-neutral-700)' },
    };
    
    const colors = colorMap[tag] || { bg: 'rgb(254 215 170)', text: 'rgb(194 65 12)' };
    return {
      backgroundColor: colors.bg,
      color: colors.text,
    };
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
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs"
                              style={getTagColorStyle(tag)}
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
                        className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-primary"
                        title={t('common.edit')}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteMoment(moment);
                        }}
                        className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-destructive"
                        title={t('common.delete')}
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

      {/* Infinite scroll trigger */}
      <div ref={observerTarget} className="h-10 flex items-center justify-center">
        {isFetchingNextPage && (
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">{t('common.loadingMore')}</span>
          </div>
        )}
        {!hasNextPage && moments.length > 20 && (
          <p className="text-sm text-muted-foreground">{t('moments.noMoreMoments')}</p>
        )}
      </div>
    </div>
  );
}