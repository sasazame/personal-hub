import { useState, useMemo } from 'react';
import { useDebounce } from './useDebounce';

export interface ListFiltersConfig<T> {
  debounceMs?: number;
  defaultFilters?: T;
}

export interface ListFiltersResult<T> {
  filters: T;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  setFilter: <K extends keyof T>(key: K, value: T[K]) => void;
  resetFilters: () => void;
  debouncedFilters: T & { search?: string };
}

/**
 * Generic hook for managing list filters with search functionality
 */
export function useListFilters<T extends Record<string, unknown>>(
  config: ListFiltersConfig<T> = {}
): ListFiltersResult<T> {
  const { debounceMs = 300, defaultFilters = {} as T } = config;
  
  const [filters, setFilters] = useState<T>(defaultFilters);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Debounce search query for API calls
  const debouncedSearchQuery = useDebounce(searchQuery, debounceMs);
  
  // Combine filters with debounced search
  const debouncedFilters = useMemo(() => {
    const combined = { ...filters };
    if (debouncedSearchQuery) {
      (combined as T & { search: string }).search = debouncedSearchQuery;
    }
    return combined;
  }, [filters, debouncedSearchQuery]);
  
  const setFilter = <K extends keyof T>(key: K, value: T[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };
  
  const resetFilters = () => {
    setFilters(defaultFilters);
    setSearchQuery('');
  };
  
  return {
    filters,
    searchQuery,
    setSearchQuery,
    setFilter,
    resetFilters,
    debouncedFilters,
  };
}

/**
 * Specialized version for tag-based filtering
 */
export interface TagFiltersConfig {
  debounceMs?: number;
  defaultTags?: string[];
}

export function useTagFilters(config: TagFiltersConfig = {}) {
  const { debounceMs = 300, defaultTags = [] } = config;
  
  const [selectedTags, setSelectedTags] = useState<string[]>(defaultTags);
  const [searchQuery, setSearchQuery] = useState('');
  
  const debouncedSearchQuery = useDebounce(searchQuery, debounceMs);
  
  const addTag = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
  };
  
  const removeTag = (tag: string) => {
    setSelectedTags(selectedTags.filter(t => t !== tag));
  };
  
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      removeTag(tag);
    } else {
      addTag(tag);
    }
  };
  
  const clearTags = () => {
    setSelectedTags([]);
  };
  
  return {
    selectedTags,
    searchQuery,
    debouncedSearchQuery,
    setSearchQuery,
    addTag,
    removeTag,
    toggleTag,
    clearTags,
  };
}

/**
 * Hook for pagination with filters
 */
export interface PaginationConfig {
  defaultPage?: number;
  defaultSize?: number;
  maxSize?: number;
}

export function usePaginatedFilters<T extends Record<string, unknown>>(
  filterConfig: ListFiltersConfig<T> = {},
  paginationConfig: PaginationConfig = {}
) {
  const {
    defaultPage = 0,
    defaultSize = 20,
    maxSize = 100,
  } = paginationConfig;
  
  const filterResults = useListFilters(filterConfig);
  const [page, setPage] = useState(defaultPage);
  const [size, setSize] = useState(defaultSize);
  
  // Reset to first page when filters change
  const resetPage = () => setPage(0);
  
  const setPageSize = (newSize: number) => {
    const validSize = Math.min(Math.max(1, newSize), maxSize);
    setSize(validSize);
    resetPage();
  };
  
  const nextPage = () => setPage(p => p + 1);
  const prevPage = () => setPage(p => Math.max(0, p - 1));
  const goToPage = (pageNum: number) => setPage(Math.max(0, pageNum));
  
  return {
    ...filterResults,
    page,
    size,
    setPage: goToPage,
    setPageSize,
    nextPage,
    prevPage,
    resetPage,
  };
}