'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import { validateTaskDescription } from '@/utils/pomodoroHelpers';
import { useTranslations } from 'next-intl';

interface TaskCreationFormProps {
  onSubmit: (description: string) => void;
  placeholder?: string;
  label?: string;
  buttonText?: string;
  disabled?: boolean;
}

export function TaskCreationForm({ 
  onSubmit, 
  placeholder, 
  label, 
  buttonText,
  disabled = false 
}: TaskCreationFormProps) {
  const t = useTranslations('pomodoro');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = () => {
    const validationError = validateTaskDescription(description);
    if (validationError) {
      setError(t(validationError));
      return;
    }
    
    onSubmit(description);
    setDescription('');
    setError(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !disabled) {
      handleSubmit();
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            if (error) setError(null);
          }}
          label={label}
          placeholder={placeholder || t('taskPlaceholder')}
          onKeyPress={handleKeyPress}
          disabled={disabled}
          error={error || undefined}
        />
        <Button
          onClick={handleSubmit}
          disabled={disabled || !description.trim()}
          variant="secondary"
          size="icon"
          className="mt-6"
        >
          <Plus className="h-4 w-4" />
          <span className="sr-only">{buttonText || t('addTask')}</span>
        </Button>
      </div>
    </div>
  );
}