'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { GuardProps } from '@/types/common-props';

interface AuthGuardProps extends GuardProps {
  fallback?: ReactNode;
}

export function AuthGuard({ 
  children, 
  fallback = <div>Loading...</div>, 
  redirectTo = '/login' 
}: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Save the current path with query params as intended destination
      const currentPath = window.location.pathname + window.location.search;
      const searchParams = new URLSearchParams();
      // Save redirect if not just root path without query params
      if (currentPath !== '/') {
        searchParams.set('redirect', currentPath);
      }
      const loginUrl = `${redirectTo}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
      router.push(loginUrl);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  if (isLoading) {
    return <>{fallback}</>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

type GuestGuardProps = GuardProps;

export function GuestGuard({ 
  children, 
  redirectTo = '/' 
}: GuestGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  if (isAuthenticated) {
    // Still show loading while redirecting
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Redirecting...</div>
      </div>
    );
  }

  return <>{children}</>;
}