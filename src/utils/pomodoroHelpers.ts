import type { PomodoroTask, PomodoroConfig, CreatePomodoroSessionRequest, CreatePomodoroTaskRequest } from '@/types/pomodoro';
import type { UseMutationResult } from '@tanstack/react-query';

/**
 * Helper function to create a Pomodoro task with session validation
 */
export const createPomodoroTask = (
  sessionId: string | undefined,
  description: string,
  options?: {
    todoId?: number;
    onNoSession?: (description: string) => void;
    onError?: (message: string) => void;
  }
) => {
  if (!sessionId) {
    if (options?.onNoSession) {
      options.onNoSession(description);
    } else if (options?.onError) {
      options.onError('noActiveSession');
    }
    return null;
  }

  return {
    sessionId,
    description,
    todoId: options?.todoId
  };
};

/**
 * Get incomplete tasks from a task list
 */
export const getIncompleteTasks = (tasks: PomodoroTask[]) => {
  return tasks
    .filter(task => !task.completed)
    .map(task => ({
      description: task.description,
      todoId: task.todoId
    }));
};

/**
 * Prepare session data with optional initial tasks
 */
export const prepareSessionData = (
  config: PomodoroConfig,
  initialTask?: string,
  existingTasks?: PomodoroTask[]
): CreatePomodoroSessionRequest => {
  const baseData = {
    workDuration: config.workDuration,
    breakDuration: config.shortBreakDuration,
  };

  const tasks = [];
  
  if (initialTask) {
    tasks.push({ description: initialTask });
  }
  
  // Check if carryOverIncompleteTasks is enabled (default to true if not specified)
  const shouldCarryOver = (config as any).carryOverIncompleteTasks !== false;
  if (existingTasks && shouldCarryOver) {
    tasks.push(...getIncompleteTasks(existingTasks));
  }

  return tasks.length > 0 ? { ...baseData, tasks } : baseData;
};

/**
 * Validate task description
 */
export const validateTaskDescription = (description: string): string | null => {
  if (!description.trim()) {
    return 'taskRequired';
  }
  if (description.length > 500) {
    return 'taskTooLong';
  }
  return null;
};

/**
 * Create tasks from template
 */
type AddTaskMutation = UseMutationResult<PomodoroTask, Error, CreatePomodoroTaskRequest & { sessionId: string }>;

export const createTasksFromTemplate = async (
  templateTasks: string[],
  sessionId: string | undefined,
  addTaskMutation: AddTaskMutation,
  options?: {
    onCreateSession?: (description: string) => void;
    onSuccess?: () => void;
    onError?: (error: any) => void;
  }
): Promise<void> => {
  if (!sessionId && options?.onCreateSession && templateTasks.length > 0) {
    // Create session with first task
    options.onCreateSession(templateTasks[0]);
    // Remaining tasks should be handled after session creation
    return;
  }

  if (!sessionId) {
    options?.onError?.(new Error('No active session'));
    return;
  }

  try {
    // Batch create all tasks
    await Promise.all(
      templateTasks.map(description => 
        addTaskMutation.mutateAsync({
          sessionId,
          description
        })
      )
    );
    options?.onSuccess?.();
  } catch (error) {
    options?.onError?.(error);
  }
};