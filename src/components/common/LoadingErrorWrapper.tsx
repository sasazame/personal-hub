import { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';

export interface LoadingErrorWrapperProps {
  isLoading?: boolean;
  error?: Error | null | unknown;
  loadingMessage?: string;
  errorMessage?: string;
  children: ReactNode;
  className?: string;
  loadingClassName?: string;
  errorClassName?: string;
  showSpinner?: boolean;
  onRetry?: () => void;
}

/**
 * Wrapper component that handles loading and error states
 */
export function LoadingErrorWrapper({
  isLoading = false,
  error,
  loadingMessage,
  errorMessage,
  children,
  className = '',
  loadingClassName = '',
  errorClassName = '',
  showSpinner = true,
  onRetry,
}: LoadingErrorWrapperProps) {
  const t = useTranslations();
  
  if (isLoading) {
    return (
      <div className={`flex justify-center items-center py-8 ${className} ${loadingClassName}`}>
        {showSpinner && (
          <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        )}
        <span className="text-gray-600 dark:text-gray-400">
          {loadingMessage || t('common.loading')}
        </span>
      </div>
    );
  }
  
  if (error) {
    const message = error instanceof Error ? error.message : errorMessage || t('errors.general');
    
    return (
      <div className={`p-4 ${className} ${errorClassName}`}>
        <div className="text-red-600 dark:text-red-400">
          {message}
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-2 text-sm text-primary hover:underline"
          >
            {t('common.retry')}
          </button>
        )}
      </div>
    );
  }
  
  return <>{children}</>;
}

/**
 * Simple loading spinner component
 */
export function LoadingSpinner({ 
  size = 'md',
  className = '',
}: {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };
  
  return (
    <div className={`flex justify-center items-center ${className}`}>
      <Loader2 className={`animate-spin text-primary ${sizeClasses[size]}`} />
    </div>
  );
}

/**
 * Full page loading state
 */
export function PageLoading({ message }: { message?: string }) {
  const t = useTranslations();
  
  return (
    <div className="flex flex-col justify-center items-center min-h-[50vh]">
      <LoadingSpinner size="lg" />
      <p className="mt-4 text-gray-600 dark:text-gray-400">
        {message || t('common.loading')}
      </p>
    </div>
  );
}

/**
 * Full page error state
 */
export function PageError({ 
  error,
  onRetry,
}: {
  error: Error | unknown;
  onRetry?: () => void;
}) {
  const t = useTranslations();
  const message = error instanceof Error ? error.message : t('errors.general');
  
  return (
    <div className="flex flex-col justify-center items-center min-h-[50vh] p-4">
      <div className="text-red-600 dark:text-red-400 text-center max-w-md">
        <h2 className="text-xl font-semibold mb-2">{t('errors.somethingWentWrong')}</h2>
        <p>{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
        >
          {t('common.retry')}
        </button>
      )}
    </div>
  );
}

/**
 * Empty state component
 */
export function EmptyState({
  title,
  description,
  icon: Icon,
  action,
}: {
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  action?: {
    label: string;
    onClick: () => void;
  };
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      {Icon && (
        <Icon className="h-12 w-12 text-gray-400 dark:text-gray-600 mb-4" />
      )}
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-sm">
          {description}
        </p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}