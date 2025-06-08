'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui';
import type { StatusDistribution } from '@/types/analytics';

interface TodoStatusChartProps {
  data: StatusDistribution;
}

const COLORS = {
  PENDING: '#FFA500',
  IN_PROGRESS: '#3B82F6',
  COMPLETED: '#10B981',
  CANCELLED: '#EF4444',
};

// Status labels will be translated dynamically

export function TodoStatusChart({ data }: TodoStatusChartProps) {
  const t = useTranslations();
  
  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'PENDING':
        return t('analytics.statusLabels.notStarted');
      case 'IN_PROGRESS':
        return t('analytics.statusLabels.inProgress');
      case 'COMPLETED':
        return t('analytics.statusLabels.completed');
      case 'CANCELLED':
        return t('analytics.statusLabels.cancelled');
      default:
        return status;
    }
  };
  
  const chartData = Object.entries(data).map(([key, value]) => ({
    name: getStatusLabel(key),
    value,
    color: COLORS[key as keyof typeof COLORS],
  }));

  return (
    <Card>
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4">{t('analytics.todoStatusDistribution')}</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}