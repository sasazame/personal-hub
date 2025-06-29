import { 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest, 
  RegisterResponse, 
  User,
  AuthError,
  PasswordResetResponse,
  ValidateTokenResponse
} from '@/types/auth';
import { getErrorMessage } from '@/utils/errorMessages';

const API_BASE_URL = 'http://localhost:8080/api/v1';

class AuthAPIError extends Error {
  constructor(
    message: string, 
    public status?: number, 
    public code?: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AuthAPIError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorData: AuthError;
    
    try {
      errorData = await response.json();
    } catch {
      throw new AuthAPIError(
        'Network error occurred',
        response.status
      );
    }

    const friendlyMessage = getErrorMessage(new Error(errorData.error?.message || 'Request failed'));
    throw new AuthAPIError(
      friendlyMessage,
      response.status,
      errorData.error?.code,
      errorData.error?.details
    );
  }

  return response.json();
}

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('accessToken');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

export const authAPI = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    return handleResponse<LoginResponse>(response);
  },

  async register(userData: RegisterRequest): Promise<RegisterResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    return handleResponse<RegisterResponse>(response);
  },

  async getCurrentUser(): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getAuthHeaders(),
    });

    return handleResponse<User>(response);
  },

  async refreshToken(): Promise<LoginResponse> {
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (!refreshToken) {
      throw new AuthAPIError('No refresh token available');
    }

    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    return handleResponse<LoginResponse>(response);
  },

  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (refreshToken) {
      try {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ refreshToken }),
        });
      } catch (error) {
        // Ignore logout errors - we'll clear local storage anyway
        console.warn('Logout request failed:', error);
      }
    }
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ 
        currentPassword, 
        newPassword 
      }),
    });

    return handleResponse<void>(response);
  },

  async requestPasswordReset(email: string): Promise<PasswordResetResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    return handleResponse<PasswordResetResponse>(response);
  },

  async resetPassword(token: string, newPassword: string): Promise<PasswordResetResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        token, 
        newPassword 
      }),
    });

    return handleResponse<PasswordResetResponse>(response);
  },

  async validateResetToken(token: string): Promise<ValidateTokenResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/validate-reset-token?token=${encodeURIComponent(token)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return handleResponse<ValidateTokenResponse>(response);
  },
};

export { AuthAPIError };