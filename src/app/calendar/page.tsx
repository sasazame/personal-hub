'use client';

import { AuthGuard } from '@/components/auth';
import { AppLayout } from '@/components/layout';
import { Card } from '@/components/ui';
import { Calendar as CalendarIcon, Clock, Plus } from 'lucide-react';

function CalendarPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              カレンダー
            </h1>
            <p className="text-muted-foreground mt-1">
              スケジュールとイベントを管理しましょう
            </p>
          </div>
          <button className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium rounded-lg hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 shadow-md hover:shadow-lg transition-all">
            <Plus className="w-5 h-5 inline mr-2" />
            新しいイベント
          </button>
        </div>

        {/* 開発中の表示 */}
        <Card className="p-12 text-center">
          <CalendarIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">
            カレンダー機能（開発中）
          </h2>
          <p className="text-muted-foreground">
            近日公開予定：イベント管理、スケジュール表示、リマインダー機能
          </p>
        </Card>

        {/* 今後実装予定の機能プレビュー */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <CalendarIcon className="w-6 h-6 text-green-500" />
              <h3 className="text-lg font-semibold">月間ビュー</h3>
            </div>
            <p className="text-muted-foreground text-sm">
              月全体のスケジュールを一覧で確認
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-6 h-6 text-blue-500" />
              <h3 className="text-lg font-semibold">時間管理</h3>
            </div>
            <p className="text-muted-foreground text-sm">
              詳細な時間設定とリマインダー
            </p>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

export default function Calendar() {
  return (
    <AuthGuard>
      <CalendarPage />
    </AuthGuard>
  );
}