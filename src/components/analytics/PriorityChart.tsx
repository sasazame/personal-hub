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
import { Card } from '@/components/ui';
import type { PriorityDistribution } from '@/types/analytics';

interface PriorityChartProps {
  data: PriorityDistribution;
}

const PRIORITY_LABELS = {
  HIGH: '高',
  MEDIUM: '中',
  LOW: '低',
};

const PRIORITY_COLORS = {
  HIGH: '#EF4444',
  MEDIUM: '#F59E0B',
  LOW: '#10B981',
};

export function PriorityChart({ data }: PriorityChartProps) {
  const chartData = Object.entries(data).map(([key, value]) => ({
    priority: PRIORITY_LABELS[key as keyof typeof PRIORITY_LABELS],
    count: value,
    color: PRIORITY_COLORS[key as keyof typeof PRIORITY_COLORS],
  }));

  return (
    <Card>
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4">優先度別TODO分布</h3>
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