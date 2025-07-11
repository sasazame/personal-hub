export interface Todo {
  id: number;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate?: string;
  parentId?: number | null;
  isRepeatable?: boolean;
  repeatConfig?: RepeatConfig | null;
  originalTodoId?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTodoDto {
  title: string;
  description?: string;
  status?: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate?: string;
  parentId?: number | null;
  isRepeatable?: boolean;
  repeatConfig?: RepeatConfig | null;
}

export interface UpdateTodoDto {
  title?: string;
  description?: string;
  status?: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate?: string;
  parentId?: number | null;
  isRepeatable?: boolean;
  repeatConfig?: RepeatConfig | null;
}

export type TodoStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type TodoPriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type RepeatType = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY' | 'ONCE';

export interface RepeatConfig {
  repeatType: RepeatType;
  interval?: number;
  daysOfWeek?: number[] | null;
  dayOfMonth?: number | null;
  endDate?: string | null;
}

export interface PaginationParams {
  page?: number;
  size?: number;
  sort?: string;
}

export interface PaginationMeta {
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface PaginatedResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      sorted: boolean;
      orderBy?: string;
      direction?: 'ASC' | 'DESC';
    };
  };
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}