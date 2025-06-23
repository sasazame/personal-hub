/**
 * Unified JWT utilities for consistent token handling across the application
 */

export interface JWTPayload {
  exp?: number;
  iat?: number;
  sub?: string;
  [key: string]: unknown;
}

/**
 * Decode JWT token payload
 * Works in both browser and Node.js environments
 */
export function decodeJWT(token: string): JWTPayload | null {
  try {
    // Split the JWT into parts
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    // Get the payload (second part)
    const base64Payload = parts[1];
    
    let payload: JWTPayload;
    
    if (typeof window !== 'undefined') {
      // Browser environment
      // Handle base64url encoding (replace URL-safe characters)
      const base64 = base64Payload.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = atob(base64);
      payload = JSON.parse(jsonPayload);
    } else {
      // Node.js environment (for tests)
      payload = JSON.parse(Buffer.from(base64Payload, 'base64').toString());
    }
    
    return payload;
  } catch (error) {
    console.warn('Failed to decode JWT token:', error);
    return null;
  }
}

/**
 * Check if JWT token is expired
 * @param token JWT token string
 * @param bufferSeconds Buffer time in seconds before considering token expired (default: 30)
 */
export function isTokenExpired(token: string, bufferSeconds: number = 30): boolean {
  try {
    const payload = decodeJWT(token);
    if (!payload || !payload.exp) {
      return true;
    }
    
    const currentTime = Math.floor(Date.now() / 1000);
    
    // Check if token has expired (with buffer)
    return payload.exp < (currentTime + bufferSeconds);
  } catch (error) {
    console.warn('Error checking token expiration:', error);
    return true;
  }
}

/**
 * Check if user has a valid access token
 */
export function hasValidAccessToken(): boolean {
  if (typeof window === 'undefined') {
    return false; // SSR environment
  }
  
  const token = localStorage.getItem('accessToken');
  if (!token) {
    return false;
  }
  
  return !isTokenExpired(token);
}

/**
 * Debug token information (development only)
 */
export function debugToken(token: string): void {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }
  
  const payload = decodeJWT(token);
  if (payload) {
    const now = Math.floor(Date.now() / 1000);
    const expiresIn = payload.exp ? payload.exp - now : 'unknown';
    
    console.log('JWT Debug Info:', {
      tokenLength: token.length,
      payload: {
        sub: payload.sub,
        exp: payload.exp,
        iat: payload.iat,
        expiresInSeconds: expiresIn,
        isExpired: payload.exp ? payload.exp < now : 'unknown'
      }
    });
  } else {
    console.log('JWT Debug: Failed to decode token');
  }
}