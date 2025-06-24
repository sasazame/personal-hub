import apiClient from '@/lib/api-client';

export interface GoogleSyncSettings {
  enabled: boolean;
  calendarId?: string;
  syncDirection: 'TO_GOOGLE' | 'FROM_GOOGLE' | 'BIDIRECTIONAL';
  autoSync: boolean;
  syncInterval: number; // in minutes
}

export interface GoogleSyncStatus {
  lastSyncTime?: string;
  nextSyncTime?: string;
  isRunning: boolean;
  syncedEvents: number;
  errors?: string[];
}

export interface GoogleAuthorizationRequest {
  scopes: string[];
  redirectUri: string;
}

export interface EmailMessage {
  id: string;
  subject: string;
  from: string;
  snippet: string;
  date: string;
}

export class GoogleIntegrationService {
  /**
   * Initiate Google OAuth with Calendar and Gmail scopes
   */
  static async initiateGoogleAuth(): Promise<void> {
    // Store current page to return after auth
    sessionStorage.setItem('google_auth_return_url', window.location.pathname);
    
    // Use the existing OIDC auth service to initiate Google OAuth
    // The backend will handle the Google-specific scopes
    const { OIDCAuthService } = await import('./oidc-auth');
    
    // Check if we need to use the simple OAuth flow or the extended one
    try {
      // Try to get Google-specific authorization URL from backend
      const response = await apiClient.get('/auth/oidc/google/authorize', {
        params: {
          scope: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/gmail.readonly',
          redirect_url: window.location.origin + '/auth/google-callback',
        }
      });
      
      const { authorizationUrl, state } = response.data;
      
      // Store state for callback verification
      sessionStorage.setItem('google_oauth_state', state);
      sessionStorage.setItem('google_oauth_provider', 'google');
      
      // Redirect to Google authorization URL
      window.location.href = authorizationUrl;
    } catch (error) {
      // If the backend doesn't support the extended scope endpoint,
      // fall back to using the standard OAuth flow
      console.warn('Extended Google OAuth endpoint not available, using standard flow');
      const { OIDCAuthService } = await import('./oidc-auth');
      
      // Store a flag to indicate we want Google integration after login
      sessionStorage.setItem('pending_google_integration', 'true');
      
      if (!OIDCAuthService.isAuthenticated()) {
        // If not authenticated, initiate regular Google login
        await OIDCAuthService.initiateOAuth('google');
      } else {
        // If already authenticated but the extended endpoint is not available,
        // show an error message
        throw new Error('Google Calendar integration requires backend support for extended OAuth scopes');
      }
    }
  }
  
  /**
   * Handle Google OAuth callback with extended scopes
   */
  static async handleGoogleAuthCallback(code: string, state: string): Promise<boolean> {
    // Validate state - check both possible state keys
    const storedState = sessionStorage.getItem('google_oauth_state') || sessionStorage.getItem('oauth_state');
    if (!storedState || state !== storedState) {
      throw new Error('Invalid state parameter');
    }
    
    const codeVerifier = sessionStorage.getItem('code_verifier');
    if (!codeVerifier) {
      throw new Error('No code verifier found');
    }
    
    try {
      // Exchange code for tokens using existing OIDC endpoint
      const response = await apiClient.post('/oidc/token', {
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: window.location.origin + '/auth/callback',
        client_id: 'personal-hub-frontend',
        code_verifier: codeVerifier,
      });
      
      const { access_token, refresh_token } = response.data;
      
      // Store Google-specific tokens separately for Google API access
      localStorage.setItem('google_access_token', access_token);
      if (refresh_token) {
        localStorage.setItem('google_refresh_token', refresh_token);
      }
      
      // Clean up temporary storage
      sessionStorage.removeItem('oauth_state');
      sessionStorage.removeItem('google_oauth_state');
      sessionStorage.removeItem('code_verifier');
      sessionStorage.removeItem('oauth_provider');
      sessionStorage.removeItem('google_oauth_provider');
      
      return true;
    } catch (error) {
      console.error('Google auth callback failed:', error);
      throw error;
    }
  }
  
  /**
   * Get calendar sync settings
   */
  static async getCalendarSyncSettings(): Promise<GoogleSyncSettings> {
    const response = await apiClient.get('/calendar/sync/settings');
    return response.data;
  }
  
  /**
   * Update calendar sync settings
   */
  static async updateCalendarSyncSettings(settings: GoogleSyncSettings): Promise<GoogleSyncSettings> {
    const response = await apiClient.put('/calendar/sync/settings', settings);
    return response.data;
  }
  
  /**
   * Trigger manual calendar sync
   */
  static async triggerCalendarSync(): Promise<GoogleSyncStatus> {
    const response = await apiClient.post('/calendar/sync');
    return response.data;
  }
  
  /**
   * Get calendar sync status
   */
  static async getCalendarSyncStatus(): Promise<GoogleSyncStatus> {
    const response = await apiClient.get('/calendar/sync/status');
    return response.data;
  }
  
  /**
   * Get Gmail messages
   */
  static async getGmailMessages(query = '', maxResults = 10): Promise<EmailMessage[]> {
    const params = new URLSearchParams({
      q: query,
      maxResults: maxResults.toString(),
    });
    
    const response = await apiClient.get(`/gmail/messages?${params}`);
    return response.data;
  }
  
  /**
   * Get specific Gmail message
   */
  static async getGmailMessage(messageId: string): Promise<EmailMessage> {
    const response = await apiClient.get(`/gmail/messages/${messageId}`);
    return response.data;
  }
  
  /**
   * Convert Gmail message to task
   */
  static async convertEmailToTask(messageId: string, taskData: {
    title: string;
    description?: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    dueDate?: string;
  }): Promise<{ id: string; title: string; }> {
    const response = await apiClient.post(`/gmail/messages/${messageId}/convert-to-task`, taskData);
    return response.data;
  }
  
  /**
   * Check if user has Google integration enabled
   */
  static hasGoogleIntegration(): boolean {
    return !!localStorage.getItem('google_access_token');
  }
  
  /**
   * Revoke Google integration
   */
  static async revokeGoogleIntegration(): Promise<void> {
    try {
      // Call backend to revoke tokens
      await apiClient.post('/calendar/sync/revoke');
    } finally {
      // Always clear local tokens
      localStorage.removeItem('google_access_token');
      localStorage.removeItem('google_refresh_token');
    }
  }
  
  // PKCE helpers
  private static generateCodeVerifier(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return this.base64URLEncode(array);
  }
  
  private static async generateCodeChallenge(verifier: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return this.base64URLEncode(new Uint8Array(digest));
  }
  
  private static generateRandomState(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return this.base64URLEncode(array);
  }
  
  private static base64URLEncode(buffer: Uint8Array): string {
    return btoa(String.fromCharCode(...buffer))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }
}