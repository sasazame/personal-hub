'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthGuard } from '@/components/auth';

function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // ログイン済みユーザーは自動的にダッシュボードにリダイレクト
    router.replace('/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-lg text-muted-foreground">Loading...</div>
    </div>
  );
}

export default function Home() {
  return (
    <AuthGuard>
      <HomePage />
    </AuthGuard>
  );
}