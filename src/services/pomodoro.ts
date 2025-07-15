import { 
  PomodoroSession, 
  PomodoroTask, 
  PomodoroConfig,
  CreatePomodoroSessionRequest,
  UpdatePomodoroSessionRequest,
  CreatePomodoroTaskRequest,
  UpdatePomodoroTaskRequest,
  UpdatePomodoroConfigRequest,
  PaginatedResponse
} from '@/types/pomodoro';
import apiClient from '@/lib/api-client';

class PomodoroService {
  // Session endpoints
  async createSession(data: CreatePomodoroSessionRequest): Promise<PomodoroSession> {
    const response = await apiClient.post('/pomodoro/sessions', data);
    return response.data;
  }

  async updateSession(sessionId: string, data: UpdatePomodoroSessionRequest): Promise<PomodoroSession> {
    const response = await apiClient.put(`/pomodoro/sessions/${sessionId}`, data);
    return response.data;
  }

  async getActiveSession(): Promise<PomodoroSession> {
    const response = await apiClient.get('/pomodoro/sessions/active');
    return response.data;
  }

  async getSessionHistory(page = 0, size = 20): Promise<PaginatedResponse<PomodoroSession>> {
    const response = await apiClient.get('/pomodoro/sessions', {
      params: { page, size, sort: 'createdAt,desc' }
    });
    return response.data;
  }

  // Task endpoints
  async addTaskToSession(sessionId: string, data: CreatePomodoroTaskRequest): Promise<PomodoroTask> {
    const response = await apiClient.post(`/pomodoro/sessions/${sessionId}/tasks`, data);
    return response.data;
  }

  async updateTask(sessionId: string, taskId: string, data: UpdatePomodoroTaskRequest): Promise<PomodoroTask> {
    const response = await apiClient.put(`/pomodoro/sessions/${sessionId}/tasks/${taskId}`, data);
    return response.data;
  }

  async removeTask(sessionId: string, taskId: string): Promise<void> {
    await apiClient.delete(`/pomodoro/sessions/${sessionId}/tasks/${taskId}`);
  }

  async getSessionTasks(sessionId: string): Promise<PomodoroTask[]> {
    const response = await apiClient.get(`/pomodoro/sessions/${sessionId}/tasks`);
    return response.data;
  }

  // Config endpoints
  async getConfig(): Promise<PomodoroConfig> {
    const response = await apiClient.get('/pomodoro/config');
    return response.data;
  }

  async updateConfig(data: UpdatePomodoroConfigRequest): Promise<PomodoroConfig> {
    const response = await apiClient.put('/pomodoro/config', data);
    return response.data;
  }
}

export const pomodoroService = new PomodoroService();