'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui';
import { CreateMomentDto, DEFAULT_MOMENT_TAGS } from '@/types/moment';
import { Send, Tag, Hash } from 'lucide-react';
import { getTagColorStyle as getTagColorStyleUtil } from '@/utils/momentUtils';

interface MomentQuickFormProps {
  onSubmit: (data: CreateMomentDto) => void;
  isSubmitting?: boolean;
}

const getTagColorStyle = (tag: string, isSelected: boolean) => {
  if (!isSelected) return {};
  return getTagColorStyleUtil(tag);
};

export function MomentQuickForm({ onSubmit, isSubmitting }: MomentQuickFormProps) {
  const t = useTranslations();
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
  const [showCustomTagInput, setShowCustomTagInput] = useState(false);

  const toggleTag = (tag: string) => {
    setTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleAddCustomTag = () => {
    if (!customTag) return;
    
    const cleanTag = customTag.replace(/^#/, '').trim();
    if (cleanTag && !tags.includes(cleanTag)) {
      setTags([...tags, cleanTag]);
    }
    setCustomTag('');
    setShowCustomTagInput(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    onSubmit({
      content: content.trim(),
      tags: tags.length > 0 ? tags : ['Other']
    });

    // Reset form
    setContent('');
    setTags([]);
    setCustomTag('');
    setShowCustomTagInput(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit(e);
    }
  };

  return (
    <div className="bg-card rounded-xl shadow-sm border border-border p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('moments.momentContentPlaceholder')}
            className="w-full px-4 py-3 pr-16 bg-muted/50 border border-input rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-foreground placeholder-muted-foreground"
            rows={3}
          />
          <div className="absolute bottom-3 right-3 text-xs text-muted-foreground">
            {content.length}/1000
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {DEFAULT_MOMENT_TAGS.map((tag) => {
              const isSelected = tags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    isSelected ? 'ring-1 ring-offset-1 ring-primary' : ''
                  }`}
                  style={getTagColorStyle(tag, isSelected)}
                >
                  <Tag className="w-3 h-3" />
                  {t(`moments.tags.${tag.toLowerCase()}`)}
                </button>
              );
            })}
            
            {/* Add custom tag button */}
            <button
              type="button"
              onClick={() => setShowCustomTagInput(!showCustomTagInput)}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all"
            >
              <Hash className="w-3 h-3" />
              {t('moments.addCustomTag')}
            </button>
          </div>

          {/* Custom tags display */}
          {tags.filter(tag => !(DEFAULT_MOMENT_TAGS as readonly string[]).includes(tag)).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.filter(tag => !(DEFAULT_MOMENT_TAGS as readonly string[]).includes(tag)).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium"
                  style={{ backgroundColor: 'var(--tag-custom-bg)', color: 'var(--tag-custom-text)' }}
                >
                  <Hash className="w-3 h-3" />
                  {tag}
                  <button
                    type="button"
                    onClick={() => setTags(tags.filter(t => t !== tag))}
                    className="ml-1 hover:opacity-70"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Custom tag input */}
          {showCustomTagInput && (
            <div className="flex gap-2">
              <input
                type="text"
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomTag();
                  }
                }}
                placeholder={t('moments.customTagPlaceholder')}
                className="flex-1 px-3 py-1 text-sm border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                autoFocus
              />
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={handleAddCustomTag}
              >
                {t('common.add')}
              </Button>
            </div>
          )}
        </div>

        {/* Submit button */}
        <div className="flex justify-end items-center gap-3">
          <span className="text-xs text-muted-foreground">
            {t('common.hint')}
          </span>
          <Button
            type="submit"
            gradient="blue"
            size="sm"
            disabled={!content.trim() || isSubmitting}
            leftIcon={<Send className="w-4 h-4" />}
          >
            {isSubmitting ? t('moments.creating') : t('moments.create')}
          </Button>
        </div>
      </form>
    </div>
  );
}