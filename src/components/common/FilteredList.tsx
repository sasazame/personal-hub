import { ReactNode } from 'react';
import { Input } from '@/components/ui';
import { Search } from 'lucide-react';
import { useTranslations } from 'next-intl';

export interface FilteredListProps<T> {
  // Data
  items: T[];
  isLoading?: boolean;
  error?: Error | null;
  
  // Search
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchPlaceholder?: string;
  
  // Rendering
  renderItem: (item: T) => ReactNode;
  keyExtractor: (item: T) => string | number;
  
  // Layout
  title?: string;
  actions?: ReactNode;
  filters?: ReactNode;
  emptyMessage?: string;
  className?: string;
  listClassName?: string;
}

/**
 * Generic filtered list component with search and custom filters
 */
export function FilteredList<T>({
  items,
  isLoading = false,
  error,
  searchQuery,
  onSearchChange,
  searchPlaceholder,
  renderItem,
  keyExtractor,
  title,
  actions,
  filters,
  emptyMessage,
  className = '',
  listClassName = '',
}: FilteredListProps<T>) {
  const t = useTranslations();
  
  if (error) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="text-red-600 dark:text-red-400">
          {error.message || t('errors.general')}
        </div>
      </div>
    );
  }
  
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      {(title || actions) && (
        <div className="flex items-center justify-between">
          {title && <h1 className="text-2xl font-bold">{title}</h1>}
          {actions && <div className="flex gap-2">{actions}</div>}
        </div>
      )}
      
      {/* Search and filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            label=""
            placeholder={searchPlaceholder || t('common.search')}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        
        {filters && <div>{filters}</div>}
      </div>
      
      {/* List */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
        </div>
      ) : items.length === 0 ? (
        <div className="py-8 text-center text-gray-500 dark:text-gray-400">
          {emptyMessage || t('common.noResults')}
        </div>
      ) : (
        <div className={`space-y-2 ${listClassName}`}>
          {items.map(item => (
            <div key={keyExtractor(item)}>
              {renderItem(item)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Tag filter component
 */
export interface TagFilterProps {
  tags: Array<{ name: string; count?: number }>;
  selectedTag: string;
  onTagSelect: (tag: string) => void;
  allTagsLabel?: string;
}

export function TagFilter({
  tags,
  selectedTag,
  onTagSelect,
  allTagsLabel,
}: TagFilterProps) {
  const t = useTranslations();
  
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onTagSelect('')}
        className={`rounded-full px-3 py-1 text-sm transition-colors ${
          !selectedTag
            ? 'bg-primary text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
        }`}
      >
        {allTagsLabel || t('common.all')}
      </button>
      {tags.map((tag) => (
        <button
          key={tag.name}
          onClick={() => onTagSelect(tag.name)}
          className={`rounded-full px-3 py-1 text-sm transition-colors ${
            selectedTag === tag.name
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          {tag.name}
          {tag.count !== undefined && ` (${tag.count})`}
        </button>
      ))}
    </div>
  );
}

/**
 * Status filter component
 */
export interface StatusOption<T> {
  value: T;
  label: string;
  color?: string;
}

export interface StatusFilterProps<T> {
  options: StatusOption<T>[];
  selectedStatus: T;
  onStatusSelect: (status: T) => void;
  className?: string;
}

export function StatusFilter<T extends string>({
  options,
  selectedStatus,
  onStatusSelect,
  className = '',
}: StatusFilterProps<T>) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onStatusSelect(option.value)}
          className={`rounded-full px-3 py-1 text-sm transition-colors ${
            selectedStatus === option.value
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
          }`}
          style={
            option.color && selectedStatus === option.value
              ? { backgroundColor: option.color }
              : undefined
          }
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}