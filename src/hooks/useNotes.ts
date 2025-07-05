import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CreateNoteDto, UpdateNoteDto, NoteFilters } from '@/types/note';
import { notesService } from '@/services/notes';

export function useNotes(filters?: NoteFilters) {
  return useQuery({
    queryKey: ['notes', 'all', filters],
    queryFn: async () => {
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
  });
}

export function useNotesPaginated(page = 0, size = 10) {
  return useQuery({
    queryKey: ['notes', 'paginated', page, size],
    queryFn: () => notesService.getNotes(page, size),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useNote(id: number) {
  return useQuery({
    queryKey: ['note', id],
    queryFn: () => notesService.getNote(id),
    enabled: !!id,
  });
}

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

export function useCreateNote() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateNoteDto) => notesService.createNote(data),
    onSuccess: () => {
      // Invalidate all notes queries
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });
}

export function useUpdateNote() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateNoteDto }) => 
      notesService.updateNote(id, data),
    onSuccess: (updatedNote) => {
      // Update the specific note in cache
      queryClient.setQueryData(['note', updatedNote.id], updatedNote);
      
      // Invalidate notes queries
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => notesService.deleteNote(id),
    onSuccess: (_, deletedId) => {
      // Remove from specific note cache
      queryClient.removeQueries({ queryKey: ['note', deletedId] });
      
      // Invalidate notes queries
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });
}

// Remove toggle pin functionality as it's not supported in backend
export function useToggleNotePin() {
  return useMutation({
    mutationFn: () => {
      // No-op mutation since backend doesn't support pinning
      return Promise.resolve();
    },
    onSuccess: () => {
      // Do nothing
    },
  });
}