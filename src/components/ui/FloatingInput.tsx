'use client';

import React, { useState, forwardRef } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/cn';

export interface FloatingInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'placeholder'> {
  label: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  placeholderKey?: string; // Custom translation key for placeholder
}

export const FloatingInput = forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ className, type = 'text', label, error, leftIcon, rightIcon, disabled, id, placeholderKey, ...props }, ref) => {
    const [focused, setFocused] = useState(false);
    const t = useTranslations();
    const inputId = id || `floating-input-${Math.random().toString(36).substr(2, 9)}`;

    // Generate placeholder text
    const getPlaceholder = () => {
      if (placeholderKey) {
        return t(placeholderKey);
      }
      
      // Map common field types to specific translation keys
      const fieldType = type === 'email' ? 'email' : 
                       type === 'password' ? 'password' : 
                       label.toLowerCase().includes('username') ? 'username' : null;
      
      if (fieldType) {
        return t(`input.${fieldType}Placeholder`);
      }
      
      // Fallback to generic placeholder
      return t('input.placeholder', { field: label });
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setFocused(true);
      props.onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setFocused(false);
      props.onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      props.onChange?.(e);
    };

    return (
      <div className="space-y-2">
        {/* 固定ラベル */}
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-white/90"
        >
          {label}
        </label>
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70 z-10">
              {leftIcon}
            </div>
          )}
          
          <input
            id={inputId}
            type={type}
            className={cn(
              'w-full px-3 py-3 text-base bg-white/10 backdrop-blur-md border border-white/20 rounded-xl',
              'transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50',
              'placeholder:text-white/40',
              'text-white',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error && 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/50',
              disabled && 'opacity-50 cursor-not-allowed',
              focused && 'bg-white/15',
              className
            )}
            placeholder={getPlaceholder()}
            disabled={disabled}
            ref={ref}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/70 z-10">
              {rightIcon}
            </div>
          )}
        </div>

        {error && (
          <p className="text-sm text-red-400 animate-slide-in-top">
            {error}
          </p>
        )}
      </div>
    );
  }
);

FloatingInput.displayName = 'FloatingInput';