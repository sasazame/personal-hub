import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Note, CreateNoteDto, UpdateNoteDto, NoteFilters } from '@/types/note';
import { notesService } from '@/services/notes';

export function useNotes(filters?: NoteFilters) {
  return useQuery({
    queryKey: ['notes', filters],
    queryFn: () => notesService.getNotes(filters),
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
  return useQuery({
    queryKey: ['notes', 'categories'],
    queryFn: () => notesService.getCategories(),
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

export function useToggleNotePin() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => notesService.togglePin(id),
    onSuccess: (updatedNote) => {
      // Update the specific note in cache
      queryClient.setQueryData(['note', updatedNote.id], updatedNote);
      
      // Invalidate notes queries
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });
}