import { Todo } from './todo';

export interface PomodoroSession {
  id: string;
  userId: string;
  startTime?: string;
  endTime?: string;
  workDuration: number;
  breakDuration: number;
  completedCycles: number;
  status: string;
  sessionType: string;
  tasks?: PomodoroTask[];
  createdAt: string;
  updatedAt: string;
}

export enum SessionStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum SessionType {
  WORK = 'WORK',
  SHORT_BREAK = 'SHORT_BREAK',
  LONG_BREAK = 'LONG_BREAK'
}

export interface PomodoroTask {
  id: string;
  sessionId: string;
  todoId?: number;
  description: string;
  completed: boolean;
  orderIndex: number;
  linkedTodo?: Todo;
  createdAt: string;
  updatedAt: string;
}

export interface PomodoroConfig {
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  cyclesBeforeLongBreak: number;
  autoStartBreaks: boolean;
  autoStartWork: boolean;
  soundEnabled: boolean;
  soundVolume: number;
  alarmSound: string;
}

// Request types
export interface CreatePomodoroSessionRequest {
  workDuration: number;
  breakDuration: number;
  tasks?: CreatePomodoroTaskRequest[];
}

export interface CreatePomodoroTaskRequest {
  todoId?: number;
  description: string;
}

export interface UpdatePomodoroSessionRequest {
  action: SessionAction;
  sessionType?: SessionType;
}

export enum SessionAction {
  START = 'START',
  PAUSE = 'PAUSE',
  RESUME = 'RESUME',
  COMPLETE = 'COMPLETE',
  CANCEL = 'CANCEL',
  SWITCH_TYPE = 'SWITCH_TYPE'
}

export interface UpdatePomodoroTaskRequest {
  completed: boolean;
}

export interface UpdatePomodoroConfigRequest {
  workDuration?: number;
  shortBreakDuration?: number;
  longBreakDuration?: number;
  cyclesBeforeLongBreak?: number;
  alarmSound?: string;
  alarmVolume?: number;
  autoStartBreaks?: boolean;
  autoStartWork?: boolean;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}