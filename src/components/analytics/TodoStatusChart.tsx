'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card } from '@/components/ui';
import type { StatusDistribution } from '@/types/analytics';

interface TodoStatusChartProps {
  data: StatusDistribution;
}

const COLORS = {
  PENDING: '#FFA500',     // オレンジ
  IN_PROGRESS: '#3B82F6', // ブルー
  COMPLETED: '#10B981',   // グリーン
  CANCELLED: '#EF4444',   // レッド
};

const STATUS_LABELS = {
  PENDING: '未着手',
  IN_PROGRESS: '進行中',
  COMPLETED: '完了',
  CANCELLED: 'キャンセル',
};

export function TodoStatusChart({ data }: TodoStatusChartProps) {
  const chartData = Object.entries(data).map(([key, value]) => ({
    name: STATUS_LABELS[key as keyof typeof STATUS_LABELS],
    value,
    color: COLORS[key as keyof typeof COLORS],
  }));

  return (
    <Card>
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4">TODOステータス分布</h3>
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