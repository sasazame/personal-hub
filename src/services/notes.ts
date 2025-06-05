import { Note, CreateNoteDto, UpdateNoteDto, NoteFilters } from '@/types/note';

// Mock data for development
const mockNotes: Note[] = [
  {
    id: 1,
    title: 'プロジェクトアイデア',
    content: `新しいプロジェクトのアイデアをまとめる

## 概要
- ユーザー向けの生産性向上ツール
- TODO、カレンダー、メモの統合
- シンプルで直感的なUI/UX

## 技術スタック
- Frontend: Next.js, React, TypeScript
- Backend: Spring Boot, Java
- Database: PostgreSQL
- Deployment: Vercel + Heroku

## 次のステップ
1. プロトタイプの作成
2. ユーザーフィードバックの収集
3. MVP の開発`,
    category: 'プロジェクト',
    tags: ['開発', 'アイデア', 'Web'],
    isPinned: true,
    createdAt: new Date(2025, 5, 1).toISOString(),
    updatedAt: new Date(2025, 5, 5).toISOString(),
  },
  {
    id: 2,
    title: '学習メモ: React Hooks',
    content: `React Hooksについて学んだことをまとめる

## useState
- 関数コンポーネントで状態を管理
- const [state, setState] = useState(initialValue)

## useEffect
- 副作用の処理
- 依存配列で実行タイミングを制御

## useCallback & useMemo
- パフォーマンス最適化のために使用
- 不要な再レンダリングを防ぐ

## カスタムフック
- ロジックの再利用
- use で始まる名前をつける`,
    category: '学習',
    tags: ['React', 'JavaScript', 'フロントエンド'],
    isPinned: false,
    createdAt: new Date(2025, 5, 3).toISOString(),
    updatedAt: new Date(2025, 5, 3).toISOString(),
  },
  {
    id: 3,
    title: '会議メモ: 週次レビュー',
    content: `2025/06/10 チームミーティング

## 参加者
- 田中さん (PM)
- 佐藤さん (デザイナー)
- 自分 (エンジニア)

## 議題
1. 今週の進捗報告
2. 来週のタスク確認
3. 課題と改善点

## 決定事項
- 新機能のリリースは来週金曜日
- UIデザインの最終確認を今週中に完了
- テストケースの追加が必要

## アクションアイテム
- [ ] バグ修正 (優先度: 高)
- [ ] パフォーマンステストの実行
- [ ] ドキュメントの更新`,
    category: '仕事',
    tags: ['会議', 'ミーティング', 'TODO'],
    isPinned: false,
    createdAt: new Date(2025, 5, 10).toISOString(),
    updatedAt: new Date(2025, 5, 10).toISOString(),
  },
  {
    id: 4,
    title: '料理レシピ: カレー',
    content: `美味しいカレーの作り方

## 材料 (4人分)
- 玉ねぎ: 2個
- じゃがいも: 3個
- にんじん: 1本
- 豚肉: 300g
- カレールー: 1箱

## 作り方
1. 野菜を一口大に切る
2. 肉を炒める
3. 野菜を加えて炒める
4. 水を加えて煮込む (20分)
5. ルーを加えて溶かす
6. さらに5分煮込んで完成

## コツ
- 玉ねぎをよく炒めると甘みが出る
- じゃがいもは最後に加えると煮崩れしない`,
    category: '個人',
    tags: ['料理', 'レシピ', 'カレー'],
    isPinned: false,
    createdAt: new Date(2025, 5, 8).toISOString(),
    updatedAt: new Date(2025, 5, 9).toISOString(),
  },
];

const notes = [...mockNotes];
let nextId = 5;

// Simulate API delays
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const notesService = {
  async getNotes(filters?: NoteFilters): Promise<Note[]> {
    await delay(300);
    
    let filteredNotes = [...notes];

    if (filters?.search) {
      const search = filters.search.toLowerCase();
      filteredNotes = filteredNotes.filter(note =>
        note.title.toLowerCase().includes(search) ||
        note.content.toLowerCase().includes(search) ||
        note.tags.some(tag => tag.toLowerCase().includes(search))
      );
    }

    if (filters?.category) {
      filteredNotes = filteredNotes.filter(note => note.category === filters.category);
    }

    if (filters?.tags && filters.tags.length > 0) {
      filteredNotes = filteredNotes.filter(note =>
        filters.tags!.some(tag => note.tags.includes(tag))
      );
    }

    if (filters?.isPinned !== undefined) {
      filteredNotes = filteredNotes.filter(note => note.isPinned === filters.isPinned);
    }

    return filteredNotes;
  },

  async getNote(id: number): Promise<Note | null> {
    await delay(200);
    return notes.find(note => note.id === id) || null;
  },

  async createNote(data: CreateNoteDto): Promise<Note> {
    await delay(500);
    
    const newNote: Note = {
      id: nextId++,
      ...data,
      isPinned: data.isPinned || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    notes.push(newNote);
    return newNote;
  },

  async updateNote(id: number, data: UpdateNoteDto): Promise<Note> {
    await delay(500);
    
    const noteIndex = notes.findIndex(note => note.id === id);
    if (noteIndex === -1) {
      throw new Error('Note not found');
    }
    
    const updatedNote: Note = {
      ...notes[noteIndex],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    
    notes[noteIndex] = updatedNote;
    return updatedNote;
  },

  async deleteNote(id: number): Promise<void> {
    await delay(300);
    
    const noteIndex = notes.findIndex(note => note.id === id);
    if (noteIndex === -1) {
      throw new Error('Note not found');
    }
    
    notes.splice(noteIndex, 1);
  },

  async togglePin(id: number): Promise<Note> {
    await delay(200);
    
    const noteIndex = notes.findIndex(note => note.id === id);
    if (noteIndex === -1) {
      throw new Error('Note not found');
    }
    
    const updatedNote: Note = {
      ...notes[noteIndex],
      isPinned: !notes[noteIndex].isPinned,
      updatedAt: new Date().toISOString(),
    };
    
    notes[noteIndex] = updatedNote;
    return updatedNote;
  },

  // Get all unique categories
  async getCategories(): Promise<string[]> {
    await delay(100);
    
    const categories = new Set<string>();
    notes.forEach(note => {
      if (note.category) {
        categories.add(note.category);
      }
    });
    
    return Array.from(categories).sort();
  },

  // Get all unique tags
  async getTags(): Promise<string[]> {
    await delay(100);
    
    const tags = new Set<string>();
    notes.forEach(note => {
      note.tags.forEach(tag => tags.add(tag));
    });
    
    return Array.from(tags).sort();
  },

  // Get recently updated notes
  async getRecentNotes(limit: number = 5): Promise<Note[]> {
    await delay(200);
    
    return [...notes]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, limit);
  },
};