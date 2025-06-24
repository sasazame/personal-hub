export interface Note {
  id?: number;
  title: string;
  content: string;
  tags: string[];
  createdAt?: string; // ISO 8601 format
  updatedAt?: string; // ISO 8601 format
}

export interface CreateNoteDto {
  title: string;
  content: string;
  tags?: string[];
}

export interface UpdateNoteDto {
  title: string;
  content: string;
  tags?: string[];
}

export interface NotePage {
  content: Note[];
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

export type NoteSortBy = 'createdAt' | 'updatedAt' | 'title';
export type NoteSortOrder = 'asc' | 'desc';

export interface NoteFilters {
  tags?: string[];
  search?: string;
}