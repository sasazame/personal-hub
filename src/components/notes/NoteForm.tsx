'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { Note, CreateNoteDto } from '@/types/note';
import { Button, Input, TextArea, Modal } from '@/components/ui';
import { X, Plus, Pin } from 'lucide-react';

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
    category: z.string().optional(),
    isPinned: z.boolean().optional(),
  });
  
  type NoteFormData = z.infer<typeof noteSchema>;
  
  const categoryOptions = [
    { value: 'work', label: t('notes.categories.work') },
    { value: 'personal', label: t('notes.categories.personal') },
    { value: 'ideas', label: t('notes.categories.ideas') },
    { value: 'learning', label: t('notes.categories.learning') },
    { value: 'project', label: t('notes.categories.project') },
    { value: 'memo', label: t('notes.categories.memo') },
    { value: 'other', label: t('notes.categories.other') }
  ];
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<NoteFormData>({
    resolver: zodResolver(noteSchema),
    defaultValues: note ? {
      title: note.title,
      content: note.content,
      category: note.category || '',
      isPinned: note.isPinned,
    } : {
      title: '',
      content: '',
      category: '',
      isPinned: false,
    }
  });

  const isPinned = watch('isPinned');

  // Reset form when note changes
  useEffect(() => {
    if (note) {
      setValue('title', note.title);
      setValue('content', note.content);
      setValue('category', note.category || '');
      setValue('isPinned', note.isPinned);
      setTags(note.tags);
    } else {
      reset();
      setTags([]);
    }
  }, [note, setValue, reset]);

  const handleFormSubmit = (data: NoteFormData) => {
    onSubmit({
      ...data,
      tags,
      isPinned: data.isPinned || false,
    });
    handleClose();
  };

  const handleClose = () => {
    reset();
    setTags([]);
    setCurrentTag('');
    onClose();
  };

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
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">
            {note ? t('notes.editNote') : t('notes.addNote')}
          </h2>
          
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setValue('isPinned', !isPinned)}
              className={`p-2 rounded-lg transition-colors ${
                isPinned 
                  ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400' 
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
              }`}
              title={isPinned ? t('notes.unpin') : t('notes.pin')}
            >
              <Pin className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
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
              {t('notes.category')}
            </label>
            <select
              {...register('category')}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t('notes.noCategory')}</option>
              {categoryOptions.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
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
            disabled={isSubmitting}
          >
            {t('common.cancel')}
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (note ? t('notes.updating') : t('notes.creating')) : note ? t('notes.update') : t('notes.create')}
          </Button>
        </div>
        </form>
      </div>
    </Modal>
  );
}