'use client';

import React, { useState, forwardRef } from 'react';
import { cn } from '@/lib/cn';

export interface FloatingInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'placeholder'> {
  label: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const FloatingInput = forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ className, type = 'text', label, error, leftIcon, rightIcon, disabled, id, ...props }, ref) => {
    const [focused, setFocused] = useState(false);
    const [hasValue, setHasValue] = useState(false);
    const inputId = id || `floating-input-${Math.random().toString(36).substr(2, 9)}`;

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setFocused(true);
      props.onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setFocused(false);
      setHasValue(e.target.value !== '');
      props.onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(e.target.value !== '');
      props.onChange?.(e);
    };

    const isLabelFloating = focused || hasValue || props.value;

    return (
      <div className="relative">
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground z-10">
              {leftIcon}
            </div>
          )}
          
          <input
            id={inputId}
            type={type}
            className={cn(
              'peer w-full px-3 py-4 pt-6 text-base bg-white/10 backdrop-blur-md border border-white/20 rounded-xl',
              'transition-all duration-300 ease-out',
              'focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50',
              'placeholder-transparent',
              'text-white',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error && 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/50',
              disabled && 'opacity-50 cursor-not-allowed',
              className
            )}
            placeholder={label}
            disabled={disabled}
            ref={ref}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            {...props}
          />
          
          <label
            htmlFor={inputId}
            className={cn(
              'absolute left-3 text-white/70 transition-all duration-300 ease-out pointer-events-none',
              leftIcon && 'left-10',
              isLabelFloating
                ? 'top-2 text-xs font-medium text-primary-300'
                : 'top-1/2 transform -translate-y-1/2 text-base'
            )}
          >
            {label}
          </label>

          {rightIcon && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/70 z-10">
              {rightIcon}
            </div>
          )}
        </div>

        {error && (
          <p className="mt-2 text-sm text-red-400 animate-slide-in-top">
            {error}
          </p>
        )}
      </div>
    );
  }
);

FloatingInput.displayName = 'FloatingInput';