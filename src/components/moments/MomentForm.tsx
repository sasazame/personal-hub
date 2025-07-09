'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { Moment, CreateMomentDto, DEFAULT_MOMENT_TAGS } from '@/types/moment';
import { Button, TextArea, Modal } from '@/components/ui';
import { X, Plus, Tag } from 'lucide-react';
import { useFormSubmit } from '@/hooks/useFormSubmit';

interface MomentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateMomentDto) => void;
  moment?: Moment;
  isSubmitting?: boolean;
}

export function MomentForm({ isOpen, onClose, onSubmit, moment, isSubmitting }: MomentFormProps) {
  const t = useTranslations();
  const [tags, setTags] = useState<string[]>(moment?.tags || []);
  const [currentTag, setCurrentTag] = useState('');
  const [showCustomTagInput, setShowCustomTagInput] = useState(false);
  
  const momentSchema = z.object({
    content: z.string().min(1, t('moments.contentRequired')),
  });
  
  type MomentFormData = z.infer<typeof momentSchema>;
  
  const form = useForm<MomentFormData>({
    resolver: zodResolver(momentSchema),
    defaultValues: moment ? {
      content: moment.content,
    } : {
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
    setShowCustomTagInput(false);
    onClose();
  };

  const { handleSubmit: handleFormSubmit, isSubmitting: isFormSubmitting } = useFormSubmit<MomentFormData, CreateMomentDto>(
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

  // Reset form when moment changes
  useEffect(() => {
    if (moment) {
      setValue('content', moment.content);
      setTags(moment.tags);
    } else {
      reset();
      setTags([]);
    }
  }, [moment, setValue, reset]);

  const toggleTag = (tag: string) => {
    if (tags.includes(tag)) {
      setTags(tags.filter(t => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
  };

  const addCustomTag = () => {
    const trimmedTag = currentTag.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      // Add hashtag if not present
      const formattedTag = trimmedTag.startsWith('#') ? trimmedTag : `#${trimmedTag}`;
      setTags([...tags, formattedTag]);
      setCurrentTag('');
      setShowCustomTagInput(false);
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCustomTag();
    }
  };

  const getTagColor = (tag: string) => {
    switch (tag) {
      case 'Ideas':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800';
      case 'Discoveries':
        return 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-800';
      case 'Emotions':
        return 'bg-pink-100 dark:bg-pink-900 text-pink-700 dark:text-pink-300 hover:bg-pink-200 dark:hover:bg-pink-800';
      case 'Log':
        return 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800';
      case 'Other':
        return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700';
      default:
        // Custom tags
        return 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300';
    }
  };

  const getSubmitButtonText = () => {
    const isLoading = isFormSubmitting || isSubmitting;
    if (moment) {
      return isLoading ? t('moments.updating') : t('moments.update');
    }
    return isLoading ? t('moments.creating') : t('moments.create');
  };

  return (
    <Modal open={isOpen} onClose={handleClose} size="md">
      <div className="p-6">
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-4">
              {moment ? t('moments.editMoment') : t('moments.addMoment')}
            </h2>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {t('moments.momentContent')} *
            </label>
            <TextArea
              {...register('content')}
              label=""
              placeholder={t('moments.momentContentPlaceholder')}
              rows={6}
              error={errors.content?.message}
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              {t('moments.tagsLabel')}
            </label>
            
            {/* Default tags */}
            <div className="flex flex-wrap gap-2 mb-3">
              {DEFAULT_MOMENT_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-colors ${
                    tags.includes(tag) 
                      ? getTagColor(tag) + ' ring-2 ring-offset-1 ring-blue-500 dark:ring-blue-400'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <Tag className="w-3 h-3" />
                  {t(`moments.tags.${tag.toLowerCase()}`)}
                </button>
              ))}
            </div>

            {/* Custom tags */}
            {tags.filter(tag => !(DEFAULT_MOMENT_TAGS as readonly string[]).includes(tag)).length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3 pt-3 border-t border-border">
                {tags.filter(tag => !(DEFAULT_MOMENT_TAGS as readonly string[]).includes(tag)).map((tag) => (
                  <span
                    key={tag}
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm ${getTagColor(tag)}`}
                  >
                    <Tag className="w-3 h-3" />
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

            {/* Add custom tag */}
            {showCustomTagInput ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyPress={handleTagKeyPress}
                  placeholder={t('moments.customTagPlaceholder')}
                  className="flex-1 px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={addCustomTag}
                  disabled={!currentTag.trim()}
                >
                  <Plus className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setCurrentTag('');
                    setShowCustomTagInput(false);
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowCustomTagInput(true)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <Plus className="w-3 h-3" />
                {t('moments.addCustomTag')}
              </button>
            )}
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
              {getSubmitButtonText()}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}