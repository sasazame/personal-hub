'use client';

import { AuthGuard } from '@/components/auth';
import { AppLayout } from '@/components/layout';

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

        {/* 分析データのメインコンテンツエリア */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* データが準備できたらここに分析チャートを表示 */}
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