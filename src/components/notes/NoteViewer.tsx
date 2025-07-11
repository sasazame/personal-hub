'use client';

import { Note } from '@/types/note';
import { Button, Modal } from '@/components/ui';
import { format } from 'date-fns';
import { Edit, Trash2, Tag, Calendar, Clock } from 'lucide-react';

interface NoteViewerProps {
  note: Note | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePin?: () => void; // Made optional since pin is not supported
}

export function NoteViewer({ note, isOpen, onClose, onEdit, onDelete }: NoteViewerProps) {
  if (!note) return null;

  return (
    <Modal open={isOpen} onClose={onClose} size="lg">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground mb-1">
              {note.title}
            </h1>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={onEdit}
            >
              <Edit className="w-4 h-4" />
            </Button>
            
            <Button
              variant="danger"
              size="sm"
              onClick={onDelete}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Tags */}
        {note.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {note.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
              >
                <Tag className="w-3 h-3" />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="prose dark:prose-invert max-w-none">
          <div className="whitespace-pre-wrap text-foreground">
            {note.content}
          </div>
        </div>

        {/* Metadata */}
        <div className="pt-4 border-t border-border">
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            {note.createdAt && (
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>作成: {format(new Date(note.createdAt), 'yyyy年M月d日 HH:mm')}</span>
              </div>
            )}
            
            {note.updatedAt && note.updatedAt !== note.createdAt && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>更新: {format(new Date(note.updatedAt), 'yyyy年M月d日 HH:mm')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-4 border-t border-border">
          <Button variant="secondary" onClick={onClose}>
            閉じる
          </Button>
        </div>
      </div>
    </Modal>
  );
}