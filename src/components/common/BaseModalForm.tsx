'use client';

import { ReactNode } from 'react';
import { Modal, Button } from '@/components/ui';
import { ModalFormProps } from '@/types/common-props';
import { useTranslations } from 'next-intl';

export interface BaseModalFormProps<T> extends ModalFormProps<T> {
  title: string;
  children: ReactNode;
  onDelete?: () => void;
  isDeleting?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
  deleteLabel?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function BaseModalForm<T>({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
  title,
  children,
  onDelete,
  isDeleting = false,
  submitLabel,
  cancelLabel,
  deleteLabel,
  size = 'md',
}: BaseModalFormProps<T>) {
  const t = useTranslations();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries()) as T;
    onSubmit(data);
  };

  return (
    <Modal open={isOpen} onClose={onClose} size={size}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <h2 className="text-xl font-semibold">{title}</h2>
        
        {children}
        
        <div className="flex justify-between">
          <div>
            {onDelete && (
              <Button
                type="button"
                variant="danger"
                onClick={onDelete}
                disabled={isDeleting}
              >
                {isDeleting ? t('common.deleting') : (deleteLabel || t('common.delete'))}
              </Button>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isSubmitting || isDeleting}
            >
              {cancelLabel || t('common.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isDeleting}
            >
              {isSubmitting ? t('common.saving') : (submitLabel || t('common.save'))}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}

/**
 * HOC to create entity-specific modal forms
 */
export function createModalForm<TFormData>(
  displayName: string,
  FormContent: React.ComponentType<{
    data?: TFormData;
    register?: unknown;
    errors?: Record<string, unknown>;
    control?: unknown;
  }>
) {
  const ModalFormComponent = (props: BaseModalFormProps<TFormData> & {
    data?: TFormData;
    register?: unknown;
    errors?: Record<string, unknown>;
    control?: unknown;
  }) => {
    const { data, register, errors, control, ...modalProps } = props;
    
    return (
      <BaseModalForm {...modalProps}>
        <FormContent
          data={data}
          register={register}
          errors={errors}
          control={control}
        />
      </BaseModalForm>
    );
  };

  ModalFormComponent.displayName = displayName;
  
  return ModalFormComponent;
}