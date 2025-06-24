'use client';

import { Note } from '@/types/note';
import { Card } from '@/components/ui';
import { format } from 'date-fns';
import { Edit, Trash2, Tag } from 'lucide-react';

interface NoteListProps {
  notes: Note[];
  onNoteClick: (note: Note) => void;
  onEditNote: (note: Note) => void;
  onDeleteNote: (note: Note) => void;
  onTogglePin?: (note: Note) => void; // Made optional since pin is not supported
}

export function NoteList({ notes, onNoteClick, onEditNote, onDeleteNote }: NoteListProps) {
  if (!notes || !Array.isArray(notes) || notes.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground text-lg">ノートがありません</div>
        <p className="text-sm text-muted-foreground mt-2">
          新しいノートを作成して始めましょう
        </p>
      </div>
    );
  }

  // Sort notes by updated date
  const sortedNotes = [...notes].sort((a, b) => {
    return new Date(b.updatedAt || b.createdAt || '').getTime() - new Date(a.updatedAt || a.createdAt || '').getTime();
  });

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sortedNotes.map((note) => (
        <Card 
          key={note.id} 
          className="p-4 cursor-pointer hover:shadow-lg transition-all group relative"
          onClick={() => onNoteClick(note)}
        >

          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-semibold text-foreground line-clamp-2 flex-1 mr-2">
              {note.title}
            </h3>
            
            {/* Actions */}
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEditNote(note);
                }}
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-400 hover:text-blue-500"
                title="編集"
              >
                <Edit className="w-4 h-4" />
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteNote(note);
                }}
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-400 hover:text-red-500"
                title="削除"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Content preview */}
          <div className="text-sm text-muted-foreground mb-3 line-clamp-4">
            {truncateContent(note.content)}
          </div>


          {/* Tags */}
          {note.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {note.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                >
                  <Tag className="w-3 h-3" />
                  {tag}
                </span>
              ))}
              {note.tags.length > 3 && (
                <span className="text-xs text-muted-foreground">
                  +{note.tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="text-xs text-muted-foreground">
            {note.createdAt && <div>作成: {format(new Date(note.createdAt), 'yyyy/MM/dd')}</div>}
            {note.updatedAt && note.updatedAt !== note.createdAt && (
              <div>更新: {format(new Date(note.updatedAt), 'yyyy/MM/dd HH:mm')}</div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}