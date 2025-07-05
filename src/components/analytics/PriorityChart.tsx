'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui';
import type { PriorityDistribution } from '@/types/analytics';
import { ChartProps } from '@/types/common-props';

type PriorityChartProps = ChartProps<PriorityDistribution>;


const PRIORITY_COLORS = {
  HIGH: '#EF4444',
  MEDIUM: '#F59E0B',
  LOW: '#10B981',
};

export function PriorityChart({ data }: PriorityChartProps) {
  const t = useTranslations();
  
  const getPriorityLabel = (priority: string): string => {
    switch (priority) {
      case 'HIGH':
        return t('analytics.priorities.high');
      case 'MEDIUM':
        return t('analytics.priorities.medium');
      case 'LOW':
        return t('analytics.priorities.low');
      default:
        return priority;
    }
  };
  
  const chartData = Object.entries(data).map(([key, value]) => ({
    priority: getPriorityLabel(key),
    count: value,
    color: PRIORITY_COLORS[key as keyof typeof PRIORITY_COLORS],
  }));

  return (
    <Card>
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4">{t('analytics.priorityDistribution')}</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="priority" />
            <YAxis />
            <Tooltip />
            <Bar
              dataKey="count"
              fill="#3B82F6"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}