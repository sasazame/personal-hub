'use client';

import { useTranslations } from 'next-intl';
import { AuthGuard } from '@/components/auth';
import { AppLayout } from '@/components/layout';
import { Card } from '@/components/ui';
import Link from 'next/link';
import { 
  CheckSquare, 
  Calendar, 
  FileText, 
  BarChart3,
  Plus,
  ArrowRight
} from 'lucide-react';

function DashboardPage() {
  const t = useTranslations();

  const features = [
    {
      title: 'TODOs',
      description: 'タスクの管理と進捗確認',
      icon: CheckSquare,
      href: '/todos',
      color: 'bg-blue-500',
      stats: '5件の未完了タスク'
    },
    {
      title: 'Calendar',
      description: 'スケジュールとイベント管理',
      icon: Calendar,
      href: '/calendar',
      color: 'bg-green-500',
      stats: '今日のイベント: 3件'
    },
    {
      title: 'Notes',
      description: 'メモとドキュメント作成',
      icon: FileText,
      href: '/notes',
      color: 'bg-purple-500',
      stats: '12件のメモ'
    },
    {
      title: 'Analytics',
      description: '生産性の分析と改善',
      icon: BarChart3,
      href: '/analytics',
      color: 'bg-orange-500',
      stats: '今週の完了率: 75%'
    }
  ];

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* ヘッダー */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">
            Welcome to Personal Hub
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            あなたの生産性を向上させる統合ワークスペースです。
            TODO、カレンダー、メモを一箇所で管理しましょう。
          </p>
        </div>

        {/* クイックアクション */}
        <div className="flex justify-center">
          <div className="flex gap-4">
            <Link 
              href="/todos"
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-md hover:shadow-lg transition-all"
            >
              <Plus className="w-5 h-5" />
              新しいTODO
            </Link>
          </div>
        </div>

        {/* 機能カード */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => {
            const IconComponent = feature.icon;
            return (
              <Link key={feature.title} href={feature.href}>
                <Card className="h-full p-6 hover:shadow-lg transition-all cursor-pointer group">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center text-white`}>
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      {feature.stats}
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* 最近のアクティビティ */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            最近のアクティビティ
          </h2>
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-3">
              <CheckSquare className="w-4 h-4 text-green-500" />
              <span>「プロジェクト資料作成」を完了しました</span>
              <span className="text-xs">2時間前</span>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-blue-500" />
              <span>「チームミーティング」をスケジュールに追加しました</span>
              <span className="text-xs">5時間前</span>
            </div>
            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4 text-purple-500" />
              <span>「アイデアメモ」を作成しました</span>
              <span className="text-xs">1日前</span>
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}

export default function Dashboard() {
  return (
    <AuthGuard>
      <DashboardPage />
    </AuthGuard>
  );
}