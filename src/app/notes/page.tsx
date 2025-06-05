'use client';

import { AuthGuard } from '@/components/auth';
import { AppLayout } from '@/components/layout';
import { Card } from '@/components/ui';
import { FileText, Edit, Plus } from 'lucide-react';

function NotesPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              ノート
            </h1>
            <p className="text-muted-foreground mt-1">
              アイデアや情報を記録・整理しましょう
            </p>
          </div>
          <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-violet-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-violet-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 shadow-md hover:shadow-lg transition-all">
            <Plus className="w-5 h-5 inline mr-2" />
            新しいノート
          </button>
        </div>

        {/* 開発中の表示 */}
        <Card className="p-12 text-center">
          <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">
            ノート機能（開発中）
          </h2>
          <p className="text-muted-foreground">
            近日公開予定：リッチテキストエディタ、カテゴリ分類、検索機能
          </p>
        </Card>

        {/* 今後実装予定の機能プレビュー */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Edit className="w-6 h-6 text-purple-500" />
              <h3 className="text-lg font-semibold">リッチエディタ</h3>
            </div>
            <p className="text-muted-foreground text-sm">
              Markdown対応、画像挿入、フォーマット機能
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-6 h-6 text-indigo-500" />
              <h3 className="text-lg font-semibold">カテゴリ管理</h3>
            </div>
            <p className="text-muted-foreground text-sm">
              タグ付け、フォルダ分類、高度な検索
            </p>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

export default function Notes() {
  return (
    <AuthGuard>
      <NotesPage />
    </AuthGuard>
  );
}