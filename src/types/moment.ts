export interface Moment {
  id?: number;
  content: string;
  tags: string[];
  createdAt?: string; // ISO 8601 format
  updatedAt?: string; // ISO 8601 format
}

export interface CreateMomentDto {
  content: string;
  tags?: string[];
}

export interface UpdateMomentDto {
  content?: string;
  tags?: string[];
}

export interface MomentPage {
  content: Moment[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      sorted: boolean;
      direction: string;
      properties: string[];
    };
  };
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export type MomentSortBy = 'createdAt' | 'updatedAt';
export type MomentSortOrder = 'asc' | 'desc';

export interface MomentFilters {
  tags?: string[];
  search?: string;
  startDate?: string; // ISO 8601 format
  endDate?: string; // ISO 8601 format
}

export const DEFAULT_MOMENT_TAGS = [
  'Ideas',
  'Discoveries',
  'Emotions',
  'Log',
  'Other'
] as const;

export type DefaultMomentTag = typeof DEFAULT_MOMENT_TAGS[number];