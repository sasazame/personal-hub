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
import { Card } from '@/components/ui';
import type { ProductivityStats } from '@/types/analytics';

interface ProductivityChartProps {
  data: ProductivityStats;
}

export function ProductivityChart({ data }: ProductivityChartProps) {
  // データを統合して日付でグループ化
  const chartData = data.dailyTodoCompletions.map((item, index) => ({
    date: new Date(item.date).toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
    }),
    TODO完了: item.count,
    イベント: data.dailyEventCounts[index]?.count || 0,
    ノート作成: data.dailyNoteCreations[index]?.count || 0,
  }));

  return (
    <Card className="col-span-2">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">生産性トレンド（過去7日間）</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              週間スコア:
            </span>
            <span className="text-lg font-bold text-primary">
              {data.weeklyProductivityScore}点
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
              dataKey="TODO完了"
              stroke="#10B981"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="イベント"
              stroke="#3B82F6"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="ノート作成"
              stroke="#F59E0B"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}