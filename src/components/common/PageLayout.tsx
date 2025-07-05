import { ReactNode } from 'react';
import { AuthGuard } from '@/components/auth';
import { AppLayout } from '@/components/layout';
import { usePageTitle } from '@/hooks/usePageTitle';
import { LoadingErrorWrapper } from './LoadingErrorWrapper';

export interface PageLayoutProps {
  children: ReactNode;
  title?: string;
  requireAuth?: boolean;
  isLoading?: boolean;
  error?: Error | null | unknown;
  onRetry?: () => void;
  className?: string;
  headerContent?: ReactNode;
}

/**
 * Common page layout wrapper with auth, loading, and error handling
 */
export function PageLayout({
  children,
  title,
  requireAuth = true,
  isLoading = false,
  error,
  onRetry,
  className = 'container mx-auto p-4',
  headerContent,
}: PageLayoutProps) {
  // Set page title if provided
  if (title) {
    usePageTitle(title);
  }
  
  const content = (
    <AppLayout>
      <LoadingErrorWrapper
        isLoading={isLoading}
        error={error}
        onRetry={onRetry}
      >
        <div className={className}>
          {headerContent}
          {children}
        </div>
      </LoadingErrorWrapper>
    </AppLayout>
  );
  
  return requireAuth ? <AuthGuard>{content}</AuthGuard> : content;
}

/**
 * Page header component with title and actions
 */
export function PageHeader({
  title,
  actions,
  className = '',
}: {
  title: string;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mb-6 flex items-center justify-between ${className}`}>
      <h1 className="text-2xl font-bold">{title}</h1>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}

/**
 * Page section component
 */
export function PageSection({
  title,
  children,
  className = '',
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`mb-6 ${className}`}>
      {title && (
        <h2 className="text-lg font-semibold mb-4">{title}</h2>
      )}
      {children}
    </section>
  );
}