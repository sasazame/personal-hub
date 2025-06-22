'use client';

import React from 'react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { LoginButton } from './LoginButton';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  fallback,
  redirectTo,
}) => {
  const defaultFallback = (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h2 className="text-2xl font-semibold">ログインが必要です</h2>
      <p className="text-muted-foreground">この機能を利用するにはログインしてください。</p>
      <div className="flex gap-2">
        <LoginButton provider="google" variant="outline" />
        <LoginButton provider="github" variant="outline" />
      </div>
    </div>
  );

  return (
    <AuthGuard fallback={fallback || defaultFallback} redirectTo={redirectTo}>
      {children}
    </AuthGuard>
  );
};