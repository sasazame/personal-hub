'use client';

import React, { useState, forwardRef, useEffect, useRef } from 'react';
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
    const inputRef = useRef<HTMLInputElement>(null);
    const inputId = id || `floating-input-${Math.random().toString(36).substr(2, 9)}`;

    // 実際の要素への参照を統合
    const combinedRef = (element: HTMLInputElement | null) => {
      inputRef.current = element;
      if (typeof ref === 'function') {
        ref(element);
      } else if (ref) {
        ref.current = element;
      }
    };

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

    // 自動入力された値を検知する関数
    const checkForAutofill = () => {
      if (inputRef.current) {
        const value = inputRef.current.value;
        const hasAutofillValue = value !== '' || inputRef.current.matches(':-webkit-autofill');
        setHasValue(hasAutofillValue);
      }
    };

    // マウント時とタイマーで自動入力を検知
    useEffect(() => {
      // 初期チェック
      checkForAutofill();

      // 少し遅れてもう一度チェック（自動入力が遅延する場合に対応）
      const timer1 = setTimeout(checkForAutofill, 100);
      const timer2 = setTimeout(checkForAutofill, 500);
      const timer3 = setTimeout(checkForAutofill, 1000);

      // MutationObserverで入力要素の変更を監視
      let observer: MutationObserver | null = null;
      if (inputRef.current) {
        observer = new MutationObserver(() => {
          checkForAutofill();
        });
        observer.observe(inputRef.current, {
          attributes: true,
          attributeFilter: ['value', 'class'],
        });
      }

      // animationstartイベントでWebKitの自動入力を検知
      const handleAnimationStart = (e: AnimationEvent) => {
        if (e.animationName === 'autofill') {
          checkForAutofill();
        }
      };

      if (inputRef.current) {
        inputRef.current.addEventListener('animationstart', handleAnimationStart);
      }

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
        if (observer) {
          observer.disconnect();
        }
        if (inputRef.current) {
          inputRef.current.removeEventListener('animationstart', handleAnimationStart);
        }
      };
    }, []);

    // propsの値が変更された時もチェック
    useEffect(() => {
      checkForAutofill();
    }, [props.value]);

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
            ref={combinedRef}
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