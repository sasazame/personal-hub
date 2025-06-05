'use client';

import { useState } from 'react';
import { AuthGuard } from '@/components/auth';
import { AppLayout } from '@/components/layout';
import { Button, Input, Modal } from '@/components/ui';
import { NoteList, NoteForm, NoteViewer } from '@/components/notes';
import { useNotes, useCreateNote, useUpdateNote, useDeleteNote, useToggleNotePin, useNoteCategories } from '@/hooks/useNotes';
import { Note, CreateNoteDto, UpdateNoteDto, NoteFilters } from '@/types/note';
import { showSuccess, showError } from '@/components/ui/toast';
import { Plus, Search, Pin } from 'lucide-react';

function NotesPage() {
  const [filters] = useState<NoteFilters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [viewingNote, setViewingNote] = useState<Note | null>(null);
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);
  const [showPinnedOnly, setShowPinnedOnly] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const currentFilters = {
    ...filters,
    search: searchQuery,
    category: selectedCategory || undefined,
    isPinned: showPinnedOnly || undefined,
  };

  const { data: notes = [], isLoading } = useNotes(currentFilters);
  const { data: categories = [] } = useNoteCategories();
  const createMutation = useCreateNote();
  const updateMutation = useUpdateNote();
  const deleteMutation = useDeleteNote();
  const togglePinMutation = useToggleNotePin();

  const handleCreateNote = (data: CreateNoteDto) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        showSuccess('ノートを作成しました');
        setIsFormOpen(false);
      },
      onError: (error) => {
        showError(error instanceof Error ? error.message : 'ノートの作成に失敗しました');
      },
    });
  };

  const handleUpdateNote = (data: UpdateNoteDto) => {
    if (selectedNote) {
      updateMutation.mutate({ id: selectedNote.id, data }, {
        onSuccess: () => {
          showSuccess('ノートを更新しました');
          setIsFormOpen(false);
          setSelectedNote(null);
          setViewingNote(null);
        },
        onError: (error) => {
          showError(error instanceof Error ? error.message : 'ノートの更新に失敗しました');
        },
      });
    }
  };

  const handleDeleteNote = () => {
    if (noteToDelete) {
      deleteMutation.mutate(noteToDelete.id, {
        onSuccess: () => {
          showSuccess('ノートを削除しました');
          setNoteToDelete(null);
          setViewingNote(null);
        },
        onError: (error) => {
          showError(error instanceof Error ? error.message : 'ノートの削除に失敗しました');
        },
      });
    }
  };

  const handleTogglePin = (note: Note) => {
    togglePinMutation.mutate(note.id, {
      onSuccess: () => {
        showSuccess(note.isPinned ? 'ピンを外しました' : 'ピン留めしました');
      },
      onError: (error) => {
        showError(error instanceof Error ? error.message : 'ピン留めの切り替えに失敗しました');
      },
    });
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
          <div className="text-lg text-muted-foreground">ノートを読み込み中...</div>
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
              ノート
            </h1>
            <p className="text-muted-foreground mt-1">
              アイデアや情報を記録・整理しましょう
            </p>
          </div>
          <Button 
            onClick={handleNewNote}
            className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            新しいノート
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
                placeholder="ノートを検索..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-10"
              />
            </div>
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">全てのカテゴリ</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          {/* Pin Filter */}
          <Button
            variant={showPinnedOnly ? "primary" : "secondary"}
            onClick={() => setShowPinnedOnly(!showPinnedOnly)}
            size="sm"
          >
            <Pin className="w-4 h-4 mr-1" />
            ピン留めのみ
          </Button>
        </div>

        {/* Stats */}
        <div className="text-sm text-muted-foreground">
          {notes.length}件のノート
          {searchQuery && ` (「${searchQuery}」で検索)`}
          {selectedCategory && ` (カテゴリ: ${selectedCategory})`}
          {showPinnedOnly && ` (ピン留めのみ)`}
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
          onTogglePin={() => viewingNote && handleTogglePin(viewingNote)}
        />

        {/* Delete Confirmation Modal */}
        {noteToDelete && (
          <Modal open={true} onClose={() => setNoteToDelete(null)}>
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">ノートを削除</h2>
              <p className="text-muted-foreground">
                「{noteToDelete.title}」を削除してもよろしいですか？
                この操作は取り消せません。
              </p>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="secondary"
                  onClick={() => setNoteToDelete(null)}
                  disabled={deleteMutation.isPending}
                >
                  キャンセル
                </Button>
                <Button
                  variant="danger"
                  onClick={handleDeleteNote}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? '削除中...' : '削除'}
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