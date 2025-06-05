'use client';

import React from 'react';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/cn';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        'relative inline-flex h-8 w-14 items-center rounded-full',
        'bg-neutral-200 dark:bg-neutral-700',
        'transition-colors duration-300 ease-in-out',
        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
        'hover:bg-neutral-300 dark:hover:bg-neutral-600'
      )}
      aria-label={`切り替え: ${theme === 'light' ? 'ダークモード' : 'ライトモード'}`}
    >
      <span
        className={cn(
          'inline-block h-6 w-6 transform rounded-full',
          'bg-white dark:bg-neutral-900 shadow-lg',
          'transition-all duration-300 ease-in-out',
          'border-2 border-neutral-300 dark:border-neutral-600',
          theme === 'dark' ? 'translate-x-7 ' : 'translate-x-1'
        )}
      >
        <span className="sr-only">
          {theme === 'light' ? 'ライトモード' : 'ダークモード'}
        </span>
      </span>
      
      {/* Sun icon */}
      <svg
        className={cn(
          'absolute left-1.5 h-4 w-4',
          'transition-opacity duration-300',
          'text-yellow-500',
          theme === 'light' ? 'opacity-100' : 'opacity-0'
        )}
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
          clipRule="evenodd"
        />
      </svg>
      
      {/* Moon icon */}
      <svg
        className={cn(
          'absolute right-1.5 h-4 w-4',
          'transition-opacity duration-300',
          'text-slate-500',
          theme === 'dark' ? 'opacity-100' : 'opacity-0'
        )}
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
      </svg>
    </button>
  );
}