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
import { Card } from '@/components/ui';
import type { TodoActivity } from '@/types/analytics';

interface TodoActivityChartProps {
  data: TodoActivity;
}

export function TodoActivityChart({ data }: TodoActivityChartProps) {
  // データを統合
  const chartData = data.dailyCompletions.map((item, index) => ({
    date: new Date(item.date).toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
    }),
    完了: item.count,
    作成: data.dailyCreations[index]?.count || 0,
  }));

  return (
    <Card className="col-span-2">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">TODOアクティビティ（過去30日間）</h3>
          <div className="text-sm text-muted-foreground">
            平均完了時間: {data.averageCompletionTimeInDays.toFixed(1)}日
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
              dataKey="作成"
              stackId="1"
              stroke="#3B82F6"
              fill="#3B82F6"
              fillOpacity={0.6}
            />
            <Area
              type="monotone"
              dataKey="完了"
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