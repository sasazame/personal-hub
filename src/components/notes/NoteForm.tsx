'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { Note, CreateNoteDto } from '@/types/note';
import { Button, Input, TextArea, Modal } from '@/components/ui';
import { X, Plus } from 'lucide-react';
import { useFormSubmit } from '@/hooks/useFormSubmit';

// Schema and type will be created inside component to access translations

interface NoteFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateNoteDto) => void;
  note?: Note;
  isSubmitting?: boolean;
}

// Category options will be created inside component to access translations

export function NoteForm({ isOpen, onClose, onSubmit, note, isSubmitting }: NoteFormProps) {
  const t = useTranslations();
  const [tags, setTags] = useState<string[]>(note?.tags || []);
  const [currentTag, setCurrentTag] = useState('');
  
  const noteSchema = z.object({
    title: z.string().min(1, t('notes.titleRequired')),
    content: z.string().min(1, t('notes.contentRequired')),
  });
  
  type NoteFormData = z.infer<typeof noteSchema>;
  
  const form = useForm<NoteFormData>({
    resolver: zodResolver(noteSchema),
    defaultValues: note ? {
      title: note.title,
      content: note.content,
    } : {
      title: '',
      content: '',
    }
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = form;

  // Create custom close handler
  const handleClose = () => {
    reset();
    setTags([]);
    setCurrentTag('');
    onClose();
  };

  const { handleSubmit: handleFormSubmit, isSubmitting: isFormSubmitting } = useFormSubmit<NoteFormData, CreateNoteDto>(
    {
      onSubmit,
      transform: (data) => ({
        ...data,
        tags,
      }),
      resetOnSuccess: true,
      closeOnSuccess: true,
    },
    form,
    handleClose
  );

  // Reset form when note changes
  useEffect(() => {
    if (note) {
      setValue('title', note.title);
      setValue('content', note.content);
      setTags(note.tags);
    } else {
      reset();
      setTags([]);
    }
  }, [note, setValue, reset]);

  const addTag = () => {
    const trimmedTag = currentTag.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <Modal open={isOpen} onClose={handleClose} size="lg">
      <div className="p-6">
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            {note ? t('notes.editNote') : t('notes.addNote')}
          </h2>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            {t('notes.noteTitle')} *
          </label>
          <Input
            {...register('title')}
            label=""
            placeholder={t('notes.noteTitlePlaceholder')}
            error={errors.title?.message}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            {t('notes.noteContent')} *
          </label>
          <TextArea
            {...register('content')}
            label=""
            placeholder={t('notes.noteContentPlaceholder')}
            rows={12}
            error={errors.content?.message}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            {t('notes.tags')}
          </label>
          
          {/* Current tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:text-red-500 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Add tag input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={currentTag}
              onChange={(e) => setCurrentTag(e.target.value)}
              onKeyPress={handleTagKeyPress}
              placeholder={t('notes.newTagPlaceholder')}
              className="flex-1 px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button
              type="button"
              variant="secondary"
              onClick={addTag}
              disabled={!currentTag.trim()}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex gap-3 justify-end pt-4 border-t border-border">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isFormSubmitting || isSubmitting}
          >
            {t('common.cancel')}
          </Button>
          <Button
            type="submit"
            disabled={isFormSubmitting || isSubmitting}
          >
            {(isFormSubmitting || isSubmitting) ? (note ? t('notes.updating') : t('notes.creating')) : note ? t('notes.update') : t('notes.create')}
          </Button>
        </div>
        </form>
      </div>
    </Modal>
  );
}