import { useQuery } from '@tanstack/react-query';
import { CreateNoteDto, UpdateNoteDto, NoteFilters, Note } from '@/types/note';
import { notesService } from '@/services/notes';
import { createEntityHooks, createPaginatedEntityHooks } from './useEntityHooks';

// Create the base entity hooks
const entityHooks = createEntityHooks<Note, CreateNoteDto, UpdateNoteDto, NoteFilters>({
  entityName: 'Note',
  service: {
    getAll: () => notesService.getAllNotes(),
    getById: async (id: number) => {
      const note = await notesService.getNote(id);
      if (!note) {
        throw new Error('Note not found');
      }
      return note;
    },
    create: (data: CreateNoteDto) => notesService.createNote(data),
    update: (id: number, data: UpdateNoteDto) => notesService.updateNote(id, data),
    delete: (id: number) => notesService.deleteNote(id),
  },
  queryKey: 'notes',
  getFilters: async (filters: NoteFilters) => {
    // Handle search and tags filters
    if (filters?.search) {
      return notesService.searchNotes(filters.search);
    }
    
    if (filters?.tags && filters.tags.length > 0) {
      // For simplicity, search by first tag
      return notesService.getNotesByTag(filters.tags[0]);
    }
    
    // Default: get all notes
    return notesService.getAllNotes();
  },
  staleTime: 1000 * 60 * 5, // 5 minutes
  additionalInvalidateKeys: [['notes']],
});

// Export the generated hooks with proper names
export const useNotes = entityHooks.useNoteList;
export const useNote = entityHooks.useNote;
export const useCreateNote = entityHooks.useCreateNote;
export const useUpdateNote = entityHooks.useUpdateNote;
export const useDeleteNote = entityHooks.useDeleteNote;

// Create paginated hook
export const useNotesPaginated = createPaginatedEntityHooks<Note>(
  'Notes',
  'notes',
  ({ page, size }: { page: number; size: number }) => notesService.getNotes(page, size)
);

// Additional custom hooks that don't fit the standard pattern
export function useRecentNotes(limit?: number) {
  return useQuery({
    queryKey: ['notes', 'recent', limit],
    queryFn: () => notesService.getRecentNotes(limit),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useNoteCategories() {
  // Return empty array as categories are not supported in backend
  return useQuery({
    queryKey: ['notes', 'categories'],
    queryFn: () => Promise.resolve([]),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

export function useNoteTags() {
  return useQuery({
    queryKey: ['notes', 'tags'],
    queryFn: () => notesService.getTags(),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

// Remove toggle pin functionality as it's not supported in backend
export function useToggleNotePin() {
  return {
    mutate: () => {
      // No-op since backend doesn't support pinning
      return Promise.resolve();
    },
    mutateAsync: () => {
      // No-op since backend doesn't support pinning
      return Promise.resolve();
    },
    isLoading: false,
    isError: false,
    error: null,
  };
}