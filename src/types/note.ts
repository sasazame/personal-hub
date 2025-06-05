export interface Note {
  id: number;
  title: string;
  content: string;
  category?: string;
  tags: string[];
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoteDto {
  title: string;
  content: string;
  category?: string;
  tags: string[];
  isPinned?: boolean;
}

export interface UpdateNoteDto {
  title?: string;
  content?: string;
  category?: string;
  tags?: string[];
  isPinned?: boolean;
}

export interface NoteCategory {
  id: string;
  name: string;
  color: string;
  count: number;
}

export type NoteSortBy = 'createdAt' | 'updatedAt' | 'title' | 'category';
export type NoteSortOrder = 'asc' | 'desc';

export interface NoteFilters {
  category?: string;
  tags?: string[];
  search?: string;
  isPinned?: boolean;
}