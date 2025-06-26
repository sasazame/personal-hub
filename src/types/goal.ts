export interface Goal {
  id: number;
  title: string;
  description?: string;
  goalType: GoalType;
  metricType: MetricType;
  metricUnit?: string;
  targetValue: number;
  currentValue: number;
  progressPercentage: number;
  startDate: string;
  endDate: string;
  status: GoalStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGoalDto {
  title: string;
  description?: string;
  goalType: GoalType;
  metricType: MetricType;
  metricUnit?: string;
  targetValue: number;
  startDate: string;
  endDate: string;
}

export interface UpdateGoalDto {
  title: string;
  description?: string;
  metricUnit?: string;
  targetValue: number;
  endDate: string;
}

export interface GoalProgress {
  id: number;
  goalId: number;
  date: string;
  value: number;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecordProgressDto {
  value: number;
  date?: string;
  note?: string;
}

export interface GoalMilestone {
  id: number;
  goalId: number;
  title: string;
  targetValue: number;
  achieved: boolean;
  achievedDate?: string;
  createdAt: string;
  updatedAt: string;
}

export enum GoalType {
  ANNUAL = 'ANNUAL',
  MONTHLY = 'MONTHLY',
  WEEKLY = 'WEEKLY',
  DAILY = 'DAILY'
}

export enum MetricType {
  COUNT = 'COUNT',
  NUMERIC = 'NUMERIC',
  PERCENTAGE = 'PERCENTAGE',
  TIME = 'TIME'
}

export enum GoalStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED',
  PAUSED = 'PAUSED'
}

export interface UpdateWeekStartDayDto {
  weekStartDay: number;
}