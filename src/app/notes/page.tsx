'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { AuthGuard } from '@/components/auth';
import { AppLayout } from '@/components/layout';
import { Button, Input, Modal } from '@/components/ui';
import { NoteList, NoteForm, NoteViewer } from '@/components/notes';
import { useNotes, useCreateNote, useUpdateNote, useDeleteNote, useNoteTags } from '@/hooks/useNotes';
import { Note, CreateNoteDto, UpdateNoteDto, NoteFilters } from '@/types/note';
import { usePageTitle } from '@/hooks/usePageTitle';
import { showSuccess, showError } from '@/components/ui/toast';
import { Plus, Search } from 'lucide-react';

function NotesPage() {
  const t = useTranslations();
  usePageTitle('Notes - Personal Hub');
  const [filters] = useState<NoteFilters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [viewingNote, setViewingNote] = useState<Note | null>(null);
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);
  const [selectedTag, setSelectedTag] = useState<string>('');

  const currentFilters = {
    ...filters,
    search: searchQuery,
    tags: selectedTag ? [selectedTag] : undefined,
  };

  const { data: notes = [], isLoading, error } = useNotes(currentFilters);
  const { data: tags = [] } = useNoteTags();
  const createMutation = useCreateNote();
  const updateMutation = useUpdateNote();
  const deleteMutation = useDeleteNote();

  const handleCreateNote = (data: CreateNoteDto) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        showSuccess(t('notes.noteCreated'));
        setIsFormOpen(false);
      },
      onError: (error) => {
        showError(error instanceof Error ? error.message : t('notes.createFailed'));
      },
    });
  };

  const handleUpdateNote = (data: UpdateNoteDto) => {
    if (selectedNote && selectedNote.id) {
      updateMutation.mutate({ id: selectedNote.id, data }, {
        onSuccess: () => {
          showSuccess(t('notes.noteUpdated'));
          setIsFormOpen(false);
          setSelectedNote(null);
          setViewingNote(null);
        },
        onError: (error) => {
          showError(error instanceof Error ? error.message : t('notes.updateFailed'));
        },
      });
    }
  };

  const handleDeleteNote = () => {
    if (noteToDelete && noteToDelete.id) {
      deleteMutation.mutate(noteToDelete.id, {
        onSuccess: () => {
          showSuccess(t('notes.noteDeleted'));
          setNoteToDelete(null);
          setViewingNote(null);
        },
        onError: (error) => {
          showError(error instanceof Error ? error.message : t('notes.deleteFailed'));
        },
      });
    }
  };

  const handleTogglePin = () => {
    // Pin functionality not supported in backend
    showError(t('notes.pinNotSupported'));
  };

  const handleNewNote = () => {
    setSelectedNote(null);
    setIsFormOpen(true);
  };

  const handleEditNote = (note: Note) => {
    setSelectedNote(note);
    setViewingNote(null);
    setIsFormOpen(true);
  };

  const handleViewNote = (note: Note) => {
    setViewingNote(note);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedNote(null);
  };

  const handleCloseViewer = () => {
    setViewingNote(null);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="text-lg text-muted-foreground">{t('common.loading')}</div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="text-lg text-red-500">Error loading notes: {error.message}</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {t('notes.title')}
            </h1>
            <p className="text-muted-foreground mt-1">
              {t('notes.subtitle')}
            </p>
          </div>
          <Button 
            onClick={handleNewNote}
            gradient="purple"
            size="lg"
            leftIcon={<Plus className="w-5 h-5" />}
          >
            {t('notes.newNote')}
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center">
          {/* Search */}
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                label=""
                placeholder={t('notes.searchPlaceholder')}
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-10"
              />
            </div>
          </div>

          {/* Tag Filter */}
          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{t('notes.allTags')}</option>
            {tags.map((tag: string) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </div>

        {/* Stats */}
        <div className="text-sm text-muted-foreground">
          {t('notes.countNotes', { count: notes.length })}
          {searchQuery && ` (${t('notes.searchResults', { query: searchQuery })})`}
          {selectedTag && ` (${t('notes.tagFilter', { tag: selectedTag })})`}
        </div>

        {/* Note List */}
        <NoteList
          notes={notes}
          onNoteClick={handleViewNote}
          onEditNote={handleEditNote}
          onDeleteNote={setNoteToDelete}
          onTogglePin={handleTogglePin}
        />

        {/* Note Form */}
        <NoteForm
          isOpen={isFormOpen}
          onClose={handleCloseForm}
          onSubmit={selectedNote ? 
            (data) => handleUpdateNote(data as UpdateNoteDto) : 
            handleCreateNote
          }
          note={selectedNote || undefined}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
        />

        {/* Note Viewer */}
        <NoteViewer
          note={viewingNote}
          isOpen={!!viewingNote}
          onClose={handleCloseViewer}
          onEdit={() => viewingNote && handleEditNote(viewingNote)}
          onDelete={() => viewingNote && setNoteToDelete(viewingNote)}
          onTogglePin={() => handleTogglePin()}
        />

        {/* Delete Confirmation Modal */}
        {noteToDelete && (
          <Modal open={true} onClose={() => setNoteToDelete(null)}>
            <div className="p-6 space-y-4">
              <h2 className="text-xl font-semibold text-foreground">{t('notes.deleteNote')}</h2>
              <p className="text-muted-foreground">
                {t('notes.confirmDelete', { title: noteToDelete.title })}
              </p>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="secondary"
                  onClick={() => setNoteToDelete(null)}
                  disabled={deleteMutation.isPending}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  variant="danger"
                  onClick={handleDeleteNote}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? t('common.deleting') : t('common.delete')}
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </AppLayout>
  );
}

export default function Notes() {
  return (
    <AuthGuard>
      <NotesPage />
    </AuthGuard>
  );
}