'use client';

import { useEffect, useRef, useMemo } from 'react';
import { Moment } from '@/types/moment';
import { Card } from '@/components/ui';
import { Edit, Trash2, Tag, Clock, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { groupMomentsByDate, getSortedDateKeys, formatDateHeader, formatTime, getTagColorStyle } from '@/utils/momentUtils';

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

  // Group moments by date and sort them
  const { groupedMoments, sortedDates } = useMemo(() => {
    if (!moments || moments.length === 0) {
      return { groupedMoments: {}, sortedDates: [] };
    }
    
    const grouped = groupMomentsByDate(moments);
    const sorted = getSortedDateKeys(grouped);
    
    // Pre-sort moments within each date group
    const sortedGrouped: Record<string, Moment[]> = {};
    for (const dateKey of sorted) {
      sortedGrouped[dateKey] = grouped[dateKey].sort((a, b) => 
        new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
      );
    }
    
    return { groupedMoments: sortedGrouped, sortedDates: sorted };
  }, [moments]);

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




  return (
    <div className="space-y-6">
      {sortedDates.map((dateKey) => (
        <div key={dateKey}>
          {/* Date Header */}
          <h3 className="text-lg font-semibold text-foreground mb-3 sticky top-0 bg-background z-10 py-2">
            {formatDateHeader(dateKey, t)}
          </h3>
          
          {/* Moments for this date */}
          <div className="space-y-3">
            {groupedMoments[dateKey].map((moment) => (
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