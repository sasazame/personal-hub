# テストのベストプラクティス

## 概要
このドキュメントは、Personal Hubプロジェクトにおけるテストのベストプラクティスをまとめたものです。クリーンで保守性の高いテストコードを維持するためのガイドラインです。

## 1. テスト出力のクリーン化

### なぜ重要か
- **CI/CDの可読性**: ノイズが少ないログは、実際の問題を素早く特定できる
- **デバッグ効率**: 関係ない出力に埋もれず、真の問題に集中できる  
- **プロフェッショナリズム**: 整理されたテスト出力は品質への配慮を示す
- **チーム開発**: 他の開発者がテスト結果を理解しやすい

### 実装ガイドライン

#### 1.1 本番コードでの console.log
```javascript
// ❌ 悪い例
const handleClick = () => {
  console.log('Button clicked', data); // デバッグログを残さない
  // 処理
};

// ✅ 良い例
const handleClick = () => {
  // 処理のみ
};
```

#### 1.2 テストでのモック戻り値
```javascript
// ❌ 悪い例
mockResolvedValue(undefined); // TanStack Queryが警告を出す

// ✅ 良い例
mockResolvedValue({}); // 空オブジェクトを返す
mockResolvedValue(null); // または明示的にnull
mockResolvedValue({ success: true }); // または適切な値
```

#### 1.3 期待される警告の抑制
`jest.setup.js`で、テスト中に期待される警告を抑制：

```javascript
// jest.setup.js
const originalConsoleError = console.error;

console.error = (...args) => {
  // React act() 警告を抑制
  if (
    typeof args[0] === 'string' && 
    args[0].includes('was not wrapped in act(...)')
  ) {
    return;
  }
  originalConsoleError.apply(console, args);
};
```

## 2. テストの書き方

### 2.1 AAA パターン
```javascript
it('should update todo status', async () => {
  // Arrange（準備）
  const todo = { id: 1, status: 'TODO' };
  mockApi.updateTodo.mockResolvedValue({ ...todo, status: 'DONE' });
  
  // Act（実行）
  const result = await updateTodoStatus(todo.id, 'DONE');
  
  // Assert（検証）
  expect(result.status).toBe('DONE');
});
```

### 2.2 ユーザー視点のテスト
```javascript
// ❌ 実装詳細をテスト
expect(component.state.isLoading).toBe(true);

// ✅ ユーザーが見るものをテスト
expect(screen.getByText('読み込み中...')).toBeInTheDocument();
```

### 2.3 セレクタの優先順位
1. **役割とアクセシビリティ**: `getByRole`, `getByLabelText`
2. **テキスト内容**: `getByText`, `getByPlaceholderText`
3. **テストID**: `getByTestId`（最終手段）

```javascript
// ✅ 推奨
screen.getByRole('button', { name: '保存' });
screen.getByLabelText('タイトル *');

// ⚠️ 避ける
screen.getByTestId('save-button');
```

## 3. 非同期処理のテスト

### 3.1 waitFor の使用
```javascript
// ✅ 良い例
await waitFor(() => {
  expect(screen.getByText('保存しました')).toBeInTheDocument();
});

// ❌ 悪い例
setTimeout(() => {
  expect(screen.getByText('保存しました')).toBeInTheDocument();
}, 1000);
```

### 3.2 act() 警告の対処
```javascript
// ✅ 良い例
await act(async () => {
  await userEvent.click(button);
});

// コンポーネント内の非同期更新を待つ
await waitFor(() => {
  expect(mockFn).toHaveBeenCalled();
});
```

## 4. モックの管理

### 4.1 モックの配置
```javascript
// グローバルモック: jest.setup.js
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() })
}));

// ファイル固有モック: 各テストファイルの先頭
jest.mock('@/lib/api', () => ({
  todoApi: { getAll: jest.fn() }
}));
```

### 4.2 モックのリセット
```javascript
beforeEach(() => {
  jest.clearAllMocks(); // 呼び出し履歴をクリア
});

afterEach(() => {
  jest.restoreAllMocks(); // spy を元に戻す
});
```

## 5. i18n（国際化）のテスト

### 5.1 インラインモック
```javascript
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string, params?: Record<string, string>) => {
    const translations: Record<string, string> = {
      'button.save': '保存',
      'message.welcome': 'ようこそ、{name}さん'
    };
    
    let result = translations[key] || key;
    
    // パラメータ置換
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        result = result.replace(`{${param}}`, value);
      });
    }
    
    return result;
  }
}));
```

## 6. パフォーマンスの考慮

### 6.1 不要な再レンダリングを避ける
```javascript
// カスタムレンダラーで必要なプロバイダーのみラップ
const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  );
};
```

### 6.2 重いセットアップの共有
```javascript
// 一度だけ実行
beforeAll(async () => {
  // 重い初期化処理
});

// 各テストで再利用
describe('TodoList', () => {
  // テストケース
});
```

## 7. CI/CD での考慮事項

### 7.1 並列実行
```json
// package.json
{
  "scripts": {
    "test:ci": "jest --maxWorkers=50%"
  }
}
```

### 7.2 カバレッジレポート
```javascript
// jest.config.js
module.exports = {
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.spec.{ts,tsx}',
    '!src/**/*.test.{ts,tsx}'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

## 8. トラブルシューティング

### 8.1 よくある問題と解決法

#### "Query data cannot be undefined" 警告
```javascript
// 問題
mockResolvedValue(undefined);

// 解決
mockResolvedValue({});
mockResolvedValue([]);
```

#### React act() 警告
```javascript
// 問題
fireEvent.click(button);
expect(something).toBe(true);

// 解決
await act(async () => {
  fireEvent.click(button);
});
await waitFor(() => {
  expect(something).toBe(true);
});
```

#### セレクタが複数要素にマッチ
```javascript
// 問題
screen.getByText(/title/i); // 複数マッチ

// 解決
screen.getByLabelText('Title *'); // より具体的に
screen.getByRole('heading', { name: 'Title' });
```

## まとめ
これらのベストプラクティスに従うことで：
- テスト実行時の出力がクリーンになる
- CI/CDでの問題特定が容易になる
- テストの保守性が向上する
- チーム全体の生産性が向上する

常に「ユーザーが体験すること」をテストし、実装の詳細ではなく振る舞いに焦点を当てることを心がけましょう。