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
    
    try {
      console.log('[Google Auth] Initiating Google OAuth flow...');
      
      // Get authorization URL from backend (no parameters needed)
      const response = await apiClient.get('/auth/oidc/google/authorize');
      
      console.log('[Google Auth] Received authorization URL from backend:', response.data);
      
      const { authorizationUrl, state } = response.data;
      
      if (!authorizationUrl || !state) {
        throw new Error('Invalid response from authorization endpoint');
      }
      
      // Store backend-generated state for callback verification
      sessionStorage.setItem('oauth_state', state);
      // Also store provider for compatibility with existing callback handler
      sessionStorage.setItem('oauth_provider', 'google');
      
      console.log('[Google Auth] Redirecting to Google authorization URL...');
      
      // Check if the authorization URL has the correct redirect_uri
      const url = new URL(authorizationUrl);
      const redirectUri = url.searchParams.get('redirect_uri');
      console.log('[Google Auth] Redirect URI in auth URL:', redirectUri);
      
      // Redirect to Google authorization URL
      window.location.href = authorizationUrl;
    } catch (error) {
      console.error('[Google Auth] Failed to initiate Google OAuth:', error);
      
      // If the endpoint returns 404, show appropriate error
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status: number } };
        if (axiosError.response?.status === 404) {
          throw new Error('Google OAuth integration is not available. Please contact support.');
        }
      }
      
      throw new Error('Failed to initiate Google authentication. Please try again.');
    }
  }
  
  /**
   * Handle Google OAuth callback with extended scopes
   */
  static async handleGoogleAuthCallback(code: string, state: string): Promise<boolean> {
    console.log('[Google Auth] Handling OAuth callback...');
    
    // Validate state
    const storedState = sessionStorage.getItem('oauth_state');
    if (!storedState || state !== storedState) {
      console.error('[Google Auth] State mismatch:', { received: state, stored: storedState });
      throw new Error('Invalid state parameter - potential CSRF attack');
    }
    
    try {
      console.log('[Google Auth] Sending callback to backend...');
      
      // Send code and state to backend callback endpoint
      const response = await apiClient.post('/auth/oidc/google/callback', {
        code: code,
        state: state
      });
      
      console.log('[Google Auth] Callback response:', response.data);
      
      const { token, user } = response.data;
      
      if (!token) {
        throw new Error('No token received from authentication');
      }
      
      // Store the token (the backend already validates Google access)
      localStorage.setItem('google_access_token', token);
      
      // Store user info if provided
      if (user) {
        localStorage.setItem('google_user', JSON.stringify(user));
      }
      
      // Clean up temporary storage
      sessionStorage.removeItem('oauth_state');
      sessionStorage.removeItem('google_auth_return_url');
      
      console.log('[Google Auth] Authentication successful');
      
      return true;
    } catch (error) {
      console.error('[Google Auth] Callback failed:', error);
      
      // Clean up on error
      sessionStorage.removeItem('oauth_state');
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status: number; data?: { message?: string } } };
        if (axiosError.response?.data?.message) {
          throw new Error(axiosError.response.data.message);
        }
      }
      
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
    // Check if we have a Google access token
    const hasToken = !!localStorage.getItem('google_access_token');
    
    // Also check if the token is still valid (basic check)
    if (hasToken) {
      try {
        const user = localStorage.getItem('google_user');
        if (user) {
          JSON.parse(user); // Validate JSON
        }
        return true;
      } catch {
        // Invalid data, clean up
        localStorage.removeItem('google_access_token');
        localStorage.removeItem('google_user');
        return false;
      }
    }
    
    return false;
  }
  
  /**
   * Revoke Google integration
   */
  static async revokeGoogleIntegration(): Promise<void> {
    try {
      // Call backend to revoke tokens
      await apiClient.post('/calendar/sync/revoke');
    } catch (error) {
      console.error('[Google Auth] Failed to revoke on backend:', error);
      // Continue with local cleanup even if backend fails
    } finally {
      // Always clear local tokens and data
      localStorage.removeItem('google_access_token');
      localStorage.removeItem('google_refresh_token');
      localStorage.removeItem('google_user');
      
      // Clear any session data
      sessionStorage.removeItem('oauth_state');
      sessionStorage.removeItem('google_auth_return_url');
      
      console.log('[Google Auth] Local Google integration data cleared');
    }
  }
}