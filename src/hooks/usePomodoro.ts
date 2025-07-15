import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pomodoroService } from '@/services/pomodoro';
import { 
  PomodoroSession, 
  UpdatePomodoroSessionRequest,
  CreatePomodoroSessionRequest,
  CreatePomodoroTaskRequest,
  UpdatePomodoroTaskRequest,
  UpdatePomodoroConfigRequest,
  SessionAction
} from '@/types/pomodoro';

interface PomodoroStats {
  todaySessionsCount: number;
  todayWorkMinutes: number;
  activeSession?: PomodoroSession;
}

export function usePomodoroStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data: response, ...rest } = useQuery({
    queryKey: ['pomodoro', 'sessions', 'today', today.toISOString()],
    queryFn: async () => {
      // Optimize by fetching fewer sessions initially
      // Most users won't have more than 20 sessions in a day
      return await pomodoroService.getSessionHistory(0, 20);
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  // Extract sessions from paginated response
  const sessions = response?.content || [];

  // Calculate stats
  const todaySessions = sessions.filter((session: PomodoroSession) => {
    const sessionDate = new Date(session.createdAt);
    return sessionDate >= today;
  });

  const todayWorkMinutes = todaySessions
    .filter((s: PomodoroSession) => s.sessionType === 'WORK' && s.status === 'COMPLETED')
    .reduce((total: number, s: PomodoroSession) => total + s.workDuration, 0);

  const activeSession = sessions.find((s: PomodoroSession) => s.status === 'ACTIVE');

  const stats: PomodoroStats = {
    todaySessionsCount: todaySessions.filter((s: PomodoroSession) => s.sessionType === 'WORK').length,
    todayWorkMinutes,
    activeSession,
  };

  return { ...rest, data: stats };
}

export function useActiveSession() {
  const queryClient = useQueryClient();
  
  return useQuery({
    queryKey: ['pomodoro', 'active-session'],
    queryFn: async () => {
      try {
        const session = await pomodoroService.getActiveSession();
        
        // Validate session state
        if (session && session.status === 'ACTIVE' && session.startTime) {
          // Check if session should have already completed based on time
          const startTime = new Date(session.startTime).getTime();
          const duration = session.sessionType === 'WORK' 
            ? session.workDuration * 60 * 1000 
            : session.breakDuration * 60 * 1000;
          const expectedEndTime = startTime + duration;
          
          // If session should have completed but hasn't, mark it as completed
          if (Date.now() > expectedEndTime + 5000) { // 5 second grace period
            console.warn('Found stale active session, marking as completed');
            await pomodoroService.updateSession(session.id, {
              action: SessionAction.COMPLETE
            });
            // Invalidate queries to refresh state
            queryClient.invalidateQueries({ queryKey: ['pomodoro'] });
            return null;
          }
        }
        
        return session;
      } catch (error) {
        // If there's no active session (404), return null
        const axiosError = error as { response?: { status?: number } };
        if (axiosError?.response?.status === 404) {
          return null;
        }
        throw error;
      }
    },
    retry: false, // Don't retry if there's no active session
    refetchInterval: 30000, // Check every 30 seconds for stale sessions
  });
}

export function useCreateSession() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreatePomodoroSessionRequest) => {
      return await pomodoroService.createSession(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pomodoro'] });
    },
  });
}

export function useUpdateSession() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & UpdatePomodoroSessionRequest) => {
      return await pomodoroService.updateSession(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pomodoro'] });
      // Specifically refetch the active session to ensure UI updates immediately
      queryClient.refetchQueries({ queryKey: ['pomodoro', 'active-session'] });
    },
  });
}

export function usePomodoroConfig() {
  return useQuery({
    queryKey: ['pomodoro', 'config'],
    queryFn: async () => {
      return await pomodoroService.getConfig();
    },
  });
}

export function useUpdateConfig() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (config: UpdatePomodoroConfigRequest) => {
      return await pomodoroService.updateConfig(config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pomodoro', 'config'] });
    },
  });
}

export function useSessionHistory(page = 0, size = 10) {
  return useQuery({
    queryKey: ['pomodoro', 'sessions', 'history', page, size],
    queryFn: async () => {
      return await pomodoroService.getSessionHistory(page, size);
    },
  });
}

export function useAddTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ sessionId, ...data }: { sessionId: string } & CreatePomodoroTaskRequest) => {
      return await pomodoroService.addTaskToSession(sessionId, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pomodoro', 'tasks', variables.sessionId] });
      queryClient.invalidateQueries({ queryKey: ['pomodoro', 'active-session'] });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ sessionId, taskId, ...data }: { sessionId: string; taskId: string } & UpdatePomodoroTaskRequest) => {
      return await pomodoroService.updateTask(sessionId, taskId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pomodoro'] });
      // Specifically refetch active session to get updated task list
      queryClient.invalidateQueries({ queryKey: ['pomodoro', 'active-session'] });
    },
  });
}

export function useRemoveTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ sessionId, taskId }: { sessionId: string; taskId: string }) => {
      return await pomodoroService.removeTask(sessionId, taskId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pomodoro'] });
      // Specifically refetch active session to get updated task list
      queryClient.invalidateQueries({ queryKey: ['pomodoro', 'active-session'] });
    },
  });
}

export function useSessionTasks(sessionId?: string) {
  return useQuery({
    queryKey: ['pomodoro', 'tasks', sessionId],
    queryFn: async () => {
      if (!sessionId) return [];
      // Tasks are included in the session object
      const session = await pomodoroService.getActiveSession();
      return session?.tasks || [];
    },
    enabled: !!sessionId,
  });
}

export function useLastSession() {
  return useQuery({
    queryKey: ['pomodoro', 'last-session'],
    queryFn: async () => {
      // First try to get active session
      try {
        const activeSession = await pomodoroService.getActiveSession();
        if (activeSession) return activeSession;
      } catch (error) {
        console.error('Failed to fetch active session:', error);
        // Continue to get last session from history
      }
      
      // If no active session, get the most recent from history
      const history = await pomodoroService.getSessionHistory(0, 1);
      return history.content[0] || null;
    },
  });
}