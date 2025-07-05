'use client';

import { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/cn';

export interface BaseListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  keyExtractor?: (item: T, index: number) => string | number;
  emptyMessage?: string;
  loadingMessage?: string;
  isLoading?: boolean;
  className?: string;
  itemClassName?: string;
  headerContent?: ReactNode;
  footerContent?: ReactNode;
  onItemClick?: (item: T) => void;
  gap?: 'none' | 'sm' | 'md' | 'lg';
}

const gapClasses = {
  none: '',
  sm: 'space-y-2',
  md: 'space-y-4',
  lg: 'space-y-6',
};

export function BaseList<T>({
  items,
  renderItem,
  keyExtractor = (_, index) => index,
  emptyMessage,
  loadingMessage,
  isLoading = false,
  className,
  itemClassName,
  headerContent,
  footerContent,
  onItemClick,
  gap = 'md',
}: BaseListProps<T>) {
  const t = useTranslations();

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center py-8', className)}>
        <p className="text-muted-foreground">
          {loadingMessage || t('common.loading')}
        </p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={cn('flex items-center justify-center py-8', className)}>
        <p className="text-muted-foreground">
          {emptyMessage || t('common.noItems')}
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      {headerContent}
      
      <div className={cn(gapClasses[gap])}>
        {items.map((item, index) => {
          const key = keyExtractor(item, index);
          const content = renderItem(item, index);
          
          if (onItemClick) {
            return (
              <div
                key={key}
                className={cn(
                  'cursor-pointer transition-colors hover:bg-accent/50',
                  itemClassName
                )}
                onClick={() => onItemClick(item)}
              >
                {content}
              </div>
            );
          }
          
          return (
            <div key={key} className={itemClassName}>
              {content}
            </div>
          );
        })}
      </div>
      
      {footerContent}
    </div>
  );
}

/**
 * Generic list with search and filter capabilities
 */
export interface FilterableListProps<T> extends BaseListProps<T> {
  searchPlaceholder?: string;
  filterOptions?: Array<{
    value: string;
    label: string;
  }>;
  onSearch?: (query: string) => void;
  onFilter?: (filter: string) => void;
  searchValue?: string;
  filterValue?: string;
}

export function FilterableList<T>({
  searchPlaceholder,
  filterOptions,
  onSearch,
  onFilter,
  searchValue = '',
  filterValue = '',
  ...listProps
}: FilterableListProps<T>) {
  const t = useTranslations();

  const headerContent = (
    <div className="mb-4 space-y-4">
      {listProps.headerContent}
      
      <div className="flex gap-4">
        {onSearch && (
          <input
            type="text"
            placeholder={searchPlaceholder || t('common.search')}
            value={searchValue}
            onChange={(e) => onSearch(e.target.value)}
            className="flex-1 px-3 py-2 border rounded-md"
          />
        )}
        
        {onFilter && filterOptions && (
          <select
            value={filterValue}
            onChange={(e) => onFilter(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="">{t('common.all')}</option>
            {filterOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );

  return <BaseList {...listProps} headerContent={headerContent} />;
}

/**
 * Create a typed list component for specific entities
 */
export function createEntityList<T>(
  displayName: string,
  ItemComponent: React.ComponentType<{ item: T; onUpdate?: (item: T) => void; onDelete?: (item: T) => void }>
) {
  const EntityListComponent = (props: Omit<BaseListProps<T>, 'renderItem'> & {
    onUpdate?: (item: T) => void;
    onDelete?: (item: T) => void;
  }) => {
    const { onUpdate, onDelete, ...listProps } = props;
    
    return (
      <BaseList
        {...listProps}
        renderItem={(item) => (
          <ItemComponent
            item={item}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        )}
      />
    );
  };

  EntityListComponent.displayName = displayName;
  
  return EntityListComponent;
}