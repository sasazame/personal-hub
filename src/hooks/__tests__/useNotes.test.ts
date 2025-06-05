import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import {
  useNotes,
  useRecentNotes,
  useCreateNote,
  useUpdateNote,
  useDeleteNote,
  useToggleNotePin,
} from '../useNotes';
import { notesService } from '@/services/notes';

// Mock the notes service
jest.mock('@/services/notes', () => ({
  notesService: {
    getNotes: jest.fn(),
    getRecentNotes: jest.fn(),
    createNote: jest.fn(),
    updateNote: jest.fn(),
    deleteNote: jest.fn(),
    togglePin: jest.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
  
  return Wrapper;
};

const mockNote = {
  id: 1,
  title: 'Test Note',
  content: 'Test content',
  category: 'Work',
  tags: ['test'],
  isPinned: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('useNotes hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useNotes', () => {
    it('fetches notes without filters', async () => {
      (notesService.getNotes as jest.Mock).mockResolvedValue([mockNote]);

      const { result } = renderHook(
        () => useNotes(),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(notesService.getNotes).toHaveBeenCalledWith(undefined);
      expect(result.current.data).toEqual([mockNote]);
    });

    it('fetches notes with filters', async () => {
      const filters = { category: 'Work', search: 'test' };
      (notesService.getNotes as jest.Mock).mockResolvedValue([mockNote]);

      const { result } = renderHook(
        () => useNotes(filters),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(notesService.getNotes).toHaveBeenCalledWith(filters);
    });

    it('handles loading state', () => {
      (notesService.getNotes as jest.Mock).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      const { result } = renderHook(
        () => useNotes(),
        { wrapper: createWrapper() }
      );

      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('useRecentNotes', () => {
    it('fetches recent notes with default limit', async () => {
      (notesService.getRecentNotes as jest.Mock).mockResolvedValue([mockNote]);

      const { result } = renderHook(
        () => useRecentNotes(),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(notesService.getRecentNotes).toHaveBeenCalledWith(undefined);
      expect(result.current.data).toEqual([mockNote]);
    });

    it('fetches recent notes with custom limit', async () => {
      (notesService.getRecentNotes as jest.Mock).mockResolvedValue([mockNote]);

      const { result } = renderHook(
        () => useRecentNotes(10),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(notesService.getRecentNotes).toHaveBeenCalledWith(10);
    });
  });

  describe('useCreateNote', () => {
    it('creates note successfully', async () => {
      (notesService.createNote as jest.Mock).mockResolvedValue(mockNote);

      const { result } = renderHook(
        () => useCreateNote(),
        { wrapper: createWrapper() }
      );

      const createData = {
        title: 'New Note',
        content: 'New content',
        tags: ['new'],
        isPinned: false,
      };

      result.current.mutate(createData);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(notesService.createNote).toHaveBeenCalledWith(createData);
    });

    it('handles creation error', async () => {
      const error = new Error('Create failed');
      (notesService.createNote as jest.Mock).mockRejectedValue(error);

      const { result } = renderHook(
        () => useCreateNote(),
        { wrapper: createWrapper() }
      );

      const createData = {
        title: 'New Note',
        content: 'New content',
        tags: ['new'],
        isPinned: false,
      };

      result.current.mutate(createData);

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBe(error);
    });
  });

  describe('useUpdateNote', () => {
    it('updates note successfully', async () => {
      const updatedNote = { ...mockNote, title: 'Updated Note' };
      (notesService.updateNote as jest.Mock).mockResolvedValue(updatedNote);

      const { result } = renderHook(
        () => useUpdateNote(),
        { wrapper: createWrapper() }
      );

      const updateData = { title: 'Updated Note' };

      result.current.mutate({ id: 1, data: updateData });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(notesService.updateNote).toHaveBeenCalledWith(1, updateData);
    });
  });

  describe('useDeleteNote', () => {
    it('deletes note successfully', async () => {
      (notesService.deleteNote as jest.Mock).mockResolvedValue(undefined);

      const { result } = renderHook(
        () => useDeleteNote(),
        { wrapper: createWrapper() }
      );

      result.current.mutate(1);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(notesService.deleteNote).toHaveBeenCalledWith(1);
    });

    it('handles deletion error', async () => {
      const error = new Error('Delete failed');
      (notesService.deleteNote as jest.Mock).mockRejectedValue(error);

      const { result } = renderHook(
        () => useDeleteNote(),
        { wrapper: createWrapper() }
      );

      result.current.mutate(1);

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBe(error);
    });
  });

  describe('useToggleNotePin', () => {
    it('toggles pin successfully', async () => {
      const pinnedNote = { ...mockNote, isPinned: true };
      (notesService.togglePin as jest.Mock).mockResolvedValue(pinnedNote);

      const { result } = renderHook(
        () => useToggleNotePin(),
        { wrapper: createWrapper() }
      );

      result.current.mutate(1);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(notesService.togglePin).toHaveBeenCalledWith(1);
    });
  });

  describe('Query invalidation', () => {
    it('invalidates notes queries on successful creation', async () => {
      (notesService.createNote as jest.Mock).mockResolvedValue(mockNote);

      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false },
          mutations: { retry: false },
        },
      });

      const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

      const wrapper = ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      );

      const { result } = renderHook(
        () => useCreateNote(),
        { wrapper }
      );

      const createData = {
        title: 'New Note',
        content: 'New content',
        tags: ['new'],
        isPinned: false,
      };

      result.current.mutate(createData);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['notes'] });
    });

    it('updates cache on successful update', async () => {
      const updatedNote = { ...mockNote, title: 'Updated Note' };
      (notesService.updateNote as jest.Mock).mockResolvedValue(updatedNote);

      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false },
          mutations: { retry: false },
        },
      });

      const setQueryDataSpy = jest.spyOn(queryClient, 'setQueryData');
      const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

      const wrapper = ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      );

      const { result } = renderHook(
        () => useUpdateNote(),
        { wrapper }
      );

      result.current.mutate({ id: 1, data: { title: 'Updated Note' } });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(setQueryDataSpy).toHaveBeenCalledWith(['note', 1], updatedNote);
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['notes'] });
    });
  });
});