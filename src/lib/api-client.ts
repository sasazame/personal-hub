import axios, { AxiosInstance, AxiosError } from 'axios';
import { isTokenExpired, debugToken } from '@/utils/jwt';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

// Token refresh management
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  
  failedQueue = [];
};

// Create Axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Required for CSRF cookies
});

// Request interceptor
apiClient.interceptors.request.use(
  async (config) => {
    // Skip token handling for auth endpoints to avoid recursion
    if (config.url?.includes('/auth/login') || 
        config.url?.includes('/auth/register') || 
        config.url?.includes('/auth/refresh')) {
      return config;
    }

    // Get valid token (refresh if needed)
    const token = localStorage.getItem('accessToken');
    if (token) {
      // Debug token info in development
      if (process.env.NODE_ENV === 'development') {
        debugToken(token);
      }
      
      // Check if token is expired before sending request
      if (isTokenExpired(token, 30)) { // 30 second buffer
        if (process.env.NODE_ENV === 'development') {
          console.warn('Access token is expired or expiring soon, will be refreshed by interceptor');
        }
        // Don't add expired/expiring token - let response interceptor handle refresh
      } else {
        config.headers.Authorization = `Bearer ${token}`;
        if (process.env.NODE_ENV === 'development') {
          console.log('API Request: Adding Bearer token to', config.url);
        }
      }
    } else {
      if (process.env.NODE_ENV === 'development') {
        console.warn('API Request: No access token found for', config.url);
      }
    }
    
    // Add CSRF token
    const csrfToken = getCookie('XSRF-TOKEN');
    if (csrfToken) {
      config.headers['X-XSRF-TOKEN'] = csrfToken;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as typeof error.config & { _retry?: boolean };
    
    // Handle 401 errors (token refresh)
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Already refreshing, add to queue
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return apiClient(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');

      if (!refreshToken) {
        processQueue(new Error('No refresh token available'), null);
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        }, {
          withCredentials: true
        });
        
        const { accessToken, refreshToken: newRefreshToken } = response.data;
        
        // Store new tokens
        localStorage.setItem('accessToken', accessToken);
        if (newRefreshToken) {
          localStorage.setItem('refreshToken', newRefreshToken);
        }

        if (process.env.NODE_ENV === 'development') {
          console.log('Token refreshed successfully');
          debugToken(accessToken);
        }

        // Process queued requests
        processQueue(null, accessToken);

        // Retry original request
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        return apiClient(originalRequest);
        
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect
        processQueue(refreshError, null);
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    // Handle 403 errors (Forbidden)
    if (error.response?.status === 403) {
      console.warn('Access forbidden. This might be expected in development environment.');
      // Don't redirect to login for 403 in development
      if (process.env.NODE_ENV === 'production') {
        localStorage.clear();
        window.location.href = '/login';
      }
      // In development, let the error propagate so the app can handle it appropriately
      // This allows TanStack Query to properly handle errors and show loading states
    }
    
    // Handle 429 errors (Rate Limit)
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['x-rate-limit-retry-after-seconds'];
      console.error(`Rate limit exceeded. Retry after ${retryAfter} seconds`);
      // You could show a toast notification here
    }
    
    return Promise.reject(error);
  }
);

// Utility function to get cookie
function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
}

// Utility function to clear all auth tokens
export function clearAuthTokens(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
}

// Utility function to check and clean expired tokens on app start
export function cleanupExpiredTokens(): void {
  if (typeof window === 'undefined') {
    return; // Skip in SSR environment
  }
  
  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');
  
  if (accessToken && isTokenExpired(accessToken)) {
    console.warn('Removing expired access token');
    localStorage.removeItem('accessToken');
  }
  
  if (refreshToken && isTokenExpired(refreshToken)) {
    console.warn('Removing expired refresh token');
    localStorage.removeItem('refreshToken');
  }
}

export default apiClient;