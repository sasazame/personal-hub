'use client';

import { Moment } from '@/types/moment';
import { Modal, Button } from '@/components/ui';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Edit, Trash2, Tag, Clock } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { getTagColorClasses } from '@/utils/momentUtils';

interface MomentViewerProps {
  isOpen: boolean;
  onClose: () => void;
  moment: Moment | null;
  onEdit: () => void;
  onDelete: () => void;
}

export function MomentViewer({ isOpen, onClose, moment, onEdit, onDelete }: MomentViewerProps) {
  const t = useTranslations();

  if (!moment) return null;


  return (
    <Modal open={isOpen} onClose={onClose} size="md">
      <div className="p-6">
        {/* Header with actions */}
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">
            {t('moments.momentDetails')}
          </h2>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
              className="text-blue-600 hover:text-blue-700"
            >
              <Edit className="w-4 h-4" />
              {t('common.edit')}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
              {t('common.delete')}
            </Button>
          </div>
        </div>

        {/* Timestamp */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Clock className="w-4 h-4" />
          {moment.createdAt && (
            <time dateTime={moment.createdAt}>
              {format(new Date(moment.createdAt), 'yyyy年M月d日 (E) HH:mm', { locale: ja })}
            </time>
          )}
        </div>

        {/* Content */}
        <div className="mb-6">
          <div className="text-foreground whitespace-pre-wrap break-words text-lg leading-relaxed">
            {moment.content}
          </div>
        </div>

        {/* Tags */}
        {moment.tags.length > 0 && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {moment.tags.map((tag) => (
                <span
                  key={tag}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm ${getTagColorClasses(tag)}`}
                >
                  <Tag className="w-4 h-4" />
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Footer with metadata */}
        <div className="pt-4 border-t border-border">
          <div className="flex justify-between text-xs text-muted-foreground">
            <div>
              {moment.createdAt && (
                <span>{t('common.created')}: {format(new Date(moment.createdAt), 'yyyy/MM/dd HH:mm')}</span>
              )}
            </div>
            <div>
              {moment.updatedAt && moment.updatedAt !== moment.createdAt && (
                <span>{t('common.updated')}: {format(new Date(moment.updatedAt), 'yyyy/MM/dd HH:mm')}</span>
              )}
            </div>
          </div>
        </div>

        {/* Close button */}
        <div className="flex justify-end mt-6">
          <Button
            variant="secondary"
            onClick={onClose}
          >
            {t('common.close')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}