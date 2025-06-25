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
        {/* Fixed label */}
        <label
          htmlFor={inputId}
          className="block text-sm font-semibold text-white/90 tracking-wide"
        >
          {label}
        </label>
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 z-10">
              {leftIcon}
            </div>
          )}
          
          <input
            id={inputId}
            type={type}
            className={cn(
              'w-full px-4 py-3.5 text-base bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl',
              'transition-all duration-200 font-normal',
              'hover:bg-white/15 hover:border-white/30',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:border-white/40',
              'placeholder:text-white/50',
              'text-white shadow-sm',
              leftIcon && 'pl-12',
              rightIcon && 'pr-12',
              error && 'border-red-400/50 bg-red-500/10 focus-visible:border-red-400/50 focus-visible:ring-red-400/30',
              disabled && 'opacity-50 cursor-not-allowed',
              focused && 'bg-white/20 border-white/40',
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
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 z-10">
              {rightIcon}
            </div>
          )}
        </div>

        {error && (
          <p className="text-sm text-red-300 animate-slide-in-top font-medium flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        )}
      </div>
    );
  }
);

FloatingInput.displayName = 'FloatingInput';