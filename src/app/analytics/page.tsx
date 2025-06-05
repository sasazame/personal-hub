'use client';

import { AuthGuard } from '@/components/auth';
import { AppLayout } from '@/components/layout';
import { Card } from '@/components/ui';
import { BarChart3, TrendingUp, Target } from 'lucide-react';

function AnalyticsPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              分析
            </h1>
            <p className="text-muted-foreground mt-1">
              生産性と進捗を分析・改善しましょう
            </p>
          </div>
        </div>

        {/* 開発中の表示 */}
        <Card className="p-12 text-center">
          <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">
            分析機能（開発中）
          </h2>
          <p className="text-muted-foreground">
            近日公開予定：タスク完了率、時間追跡、生産性レポート
          </p>
        </Card>

        {/* 今後実装予定の機能プレビュー */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-6 h-6 text-green-500" />
              <h3 className="text-lg font-semibold">進捗追跡</h3>
            </div>
            <p className="text-muted-foreground text-sm">
              日次・週次・月次の進捗グラフ
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-6 h-6 text-blue-500" />
              <h3 className="text-lg font-semibold">目標管理</h3>
            </div>
            <p className="text-muted-foreground text-sm">
              個人目標の設定と達成状況
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <BarChart3 className="w-6 h-6 text-orange-500" />
              <h3 className="text-lg font-semibold">詳細レポート</h3>
            </div>
            <p className="text-muted-foreground text-sm">
              カスタマイズ可能な分析レポート
            </p>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

export default function Analytics() {
  return (
    <AuthGuard>
      <AnalyticsPage />
    </AuthGuard>
  );
}