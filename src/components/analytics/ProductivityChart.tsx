'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui';
import type { ProductivityStats } from '@/types/analytics';
import { ChartProps } from '@/types/common-props';

type ProductivityChartProps = ChartProps<ProductivityStats>;

export function ProductivityChart({ data }: ProductivityChartProps) {
  const t = useTranslations();
  
  // データを統合して日付でグループ化
  const chartData = data.dailyTodoCompletions.map((item, index) => ({
    date: new Date(item.date).toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
    }),
    [t('analytics.chartLabels.todoCompletions')]: item.count,
    [t('analytics.chartLabels.events')]: data.dailyEventCounts[index]?.count || 0,
    [t('analytics.chartLabels.noteCreations')]: data.dailyNoteCreations[index]?.count || 0,
  }));

  return (
    <Card className="col-span-2">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{t('analytics.productivityTrend')}</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {t('analytics.weeklyScore')}
            </span>
            <span className="text-lg font-bold text-primary">
              {data.weeklyProductivityScore}{t('analytics.scoreUnit')}
            </span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey={t('analytics.chartLabels.todoCompletions')}
              stroke="#10B981"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey={t('analytics.chartLabels.events')}
              stroke="#3B82F6"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey={t('analytics.chartLabels.noteCreations')}
              stroke="#F59E0B"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}