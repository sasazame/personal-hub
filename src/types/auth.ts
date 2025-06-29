// Authentication related types

export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface AuthError {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export interface PasswordResetResponse {
  message: string;
  success: boolean;
}

export interface ValidateTokenResponse {
  message: string;
  success: boolean;
}