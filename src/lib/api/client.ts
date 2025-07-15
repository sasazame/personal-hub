import axios from 'axios';

const validateApiUrl = (url: string): string => {
  try {
    const validatedUrl = new URL(url);
    if (!['http:', 'https:'].includes(validatedUrl.protocol)) {
      console.error('Invalid API URL protocol:', validatedUrl.protocol);
      return 'http://localhost:8080/api/v1';
    }
    return url;
  } catch (error) {
    console.error('Invalid API URL format:', url, error);
    return 'http://localhost:8080/api/v1';
  }
};

const API_BASE_URL = validateApiUrl(
  process.env.NEXT_PUBLIC_API_URL || 
  process.env.NEXT_PUBLIC_API_BASE_URL || 
  'http://localhost:8080/api/v1'
);

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Required for CSRF cookies
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Make login redirect path configurable
const LOGIN_REDIRECT_PATH = process.env.NEXT_PUBLIC_LOGIN_PATH || '/login';

// Handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = LOGIN_REDIRECT_PATH;
      }
    }
    return Promise.reject(error);
  }
);