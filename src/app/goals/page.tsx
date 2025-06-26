import { Metadata } from 'next';
import { GoalsList } from '@/components/goals';

export const metadata: Metadata = {
  title: 'Goals - Personal Hub',
  description: 'Manage your personal goals and track progress',
};

export default function GoalsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <GoalsList />
    </div>
  );
}