// Comprehensive i18n mock for testing
export const mockTranslations = {
  // Common
  'common.loading': 'Loading...',
  'common.save': '保存',
  'common.cancel': 'キャンセル',
  'common.delete': '削除',
  'common.edit': '編集',
  'common.close': '閉じる',
  'common.submit': '送信',
  'common.language': 'Language',
  'common.theme': 'テーマ',

  // Language
  'language.japanese': '日本語',
  'language.english': 'English',

  // Theme
  'theme.toggle': '切り替え: {mode}',
  'theme.lightMode': 'ライトモード',
  'theme.darkMode': 'ダークモード',

  // Calendar
  'calendar.newEvent': '新しいイベント',
  'calendar.eventTitle': 'イベントタイトル',
  'calendar.eventDescription': 'イベントの説明',
  'calendar.startDate': '開始日',
  'calendar.endDate': '終了日',
  'calendar.allDay': '終日',
  'calendar.saving': '保存中...',
  'calendar.creating': '作成中...',

  // Notes
  'notes.title': 'タイトル',
  'notes.content': '内容',
  'notes.tags': 'タグ',
  'notes.newTagPlaceholder': 'タグを追加',
  'notes.creating': '保存中...',
  'notes.saving': '保存中...',

  // Todos
  'todos.title': 'タイトル',
  'todos.description': '説明',
  'todos.priority': '優先度',
  'todos.status': 'ステータス',
  'todos.dueDate': '期限',
  'todos.creating': '作成中...',
  'todos.saving': '保存中...',
  'todos.addTodo': 'TODOを追加',
  'todos.editTodo': 'TODOを編集',

  // Recurring
  'recurring.title': '繰り返し設定',
  'recurring.enable': '繰り返しを有効にする',
  'recurring.type': '繰り返しタイプ',
  'recurring.daily': '毎日',
  'recurring.weekly': '毎週',
  'recurring.monthly': '毎月',
  'recurring.interval': '間隔',
  'recurring.endDate': '終了日',

  // Priority
  'priority.low': '低',
  'priority.medium': '中',
  'priority.high': '高',

  // Status
  'status.todo': 'TODO',
  'status.in_progress': '進行中',
  'status.completed': '完了',

  // Dashboard
  'dashboard.taskManagement': 'タスクの管理と進捗確認',
  'dashboard.incompleteTasks': '{count}件の未完了タスク',
  'dashboard.completedToday': '今日完了',
  'dashboard.upcomingDeadlines': '締切予定',
  'dashboard.recentActivity': '最近のアクティビティ',

  // Auth
  'auth.login': 'ログイン',
  'auth.register': '登録',
  'auth.email': 'メールアドレス',
  'auth.password': 'パスワード',
  'auth.confirmPassword': 'パスワード（確認）',
  'auth.username': 'ユーザー名',
};

export const createMockTranslations = () => {
  return jest.fn((key: string, params?: Record<string, string | number>) => {
    let result = mockTranslations[key as keyof typeof mockTranslations] || key;
    
    // Handle parameter substitution
    if (params && typeof result === 'string') {
      Object.entries(params).forEach(([param, value]) => {
        result = result.replace(`{${param}}`, String(value));
      });
    }

    return result;
  });
};

export const mockUseTranslations = createMockTranslations();

export const mockNextIntl = {
  useTranslations: () => mockUseTranslations,
  useLocale: () => 'ja',
  NextIntlClientProvider: ({ children }: { children: React.ReactNode }) => children,
};