'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui';
import type { TodoActivity } from '@/types/analytics';
import { ChartProps } from '@/types/common-props';

type TodoActivityChartProps = ChartProps<TodoActivity>;

export function TodoActivityChart({ data }: TodoActivityChartProps) {
  const t = useTranslations();
  
  // データを統合
  const chartData = data.dailyCompletions.map((item, index) => ({
    date: new Date(item.date).toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
    }),
    [t('analytics.chartLabels.completed')]: item.count,
    [t('analytics.chartLabels.created')]: data.dailyCreations[index]?.count || 0,
  }));

  return (
    <Card className="col-span-2">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{t('analytics.todoActivity')}</h3>
          <div className="text-sm text-muted-foreground">
            {t('analytics.averageCompletionTime', { days: data.averageCompletionTimeInDays.toFixed(1) })}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Area
              type="monotone"
              dataKey={t('analytics.chartLabels.created')}
              stackId="1"
              stroke="#3B82F6"
              fill="#3B82F6"
              fillOpacity={0.6}
            />
            <Area
              type="monotone"
              dataKey={t('analytics.chartLabels.completed')}
              stackId="2"
              stroke="#10B981"
              fill="#10B981"
              fillOpacity={0.6}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}