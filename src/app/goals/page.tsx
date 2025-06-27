'use client';

import { AuthGuard } from '@/components/auth';
import { AppLayout } from '@/components/layout';
import { GoalsList } from '@/components/goals';
import { usePageTitle } from '@/hooks/usePageTitle';

function GoalsApp() {
  usePageTitle('Goals - Personal Hub');

  return (
    <AppLayout>
      <GoalsList />
    </AppLayout>
  );
}

export default function GoalsPage() {
  return (
    <AuthGuard>
      <GoalsApp />
    </AuthGuard>
  );
}