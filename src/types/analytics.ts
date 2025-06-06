// Analytics関連の型定義

export interface TodoStats {
  totalTodos: number;
  completedTodos: number;
  inProgressTodos: number;
  pendingTodos: number;
  completionRate: number;
  overdueCount: number;
}

export interface EventStats {
  totalEvents: number;
  upcomingEvents: number;
  pastEvents: number;
  todayEvents: number;
}

export interface NoteStats {
  totalNotes: number;
  notesThisWeek: number;
  notesThisMonth: number;
  totalTags: number;
}

export interface DailyProductivity {
  date: string;
  count: number;
}

export interface ProductivityStats {
  dailyTodoCompletions: DailyProductivity[];
  dailyEventCounts: DailyProductivity[];
  dailyNoteCreations: DailyProductivity[];
  weeklyProductivityScore: number;
}

export interface DashboardData {
  todoStats: TodoStats;
  eventStats: EventStats;
  noteStats: NoteStats;
  productivityStats: ProductivityStats;
}

export interface PriorityDistribution {
  HIGH: number;
  MEDIUM: number;
  LOW: number;
}

export interface StatusDistribution {
  PENDING: number;
  IN_PROGRESS: number;
  COMPLETED: number;
  CANCELLED: number;
}

export interface TodoActivity {
  dailyCompletions: DailyProductivity[];
  dailyCreations: DailyProductivity[];
  priorityDistribution: PriorityDistribution;
  statusDistribution: StatusDistribution;
  averageCompletionTimeInDays: number;
}