import { OIDCAuthService } from '@/services/oidc-auth';

export interface OAuthCallbackResult {
  success: boolean;
  user?: {
    id: string;
    email: string;
    username: string;
    createdAt: string;
    updatedAt: string;
  };
  error?: string;
}

export async function handleOAuthCallback(
  code: string,
  state: string,
  errorParam?: string,
  errorDescription?: string
): Promise<OAuthCallbackResult> {
  try {
    // Handle OAuth errors
    if (errorParam) {
      if (errorParam === 'access_denied') {
        return { success: false, error: 'Authentication was cancelled' };
      } else {
        return { success: false, error: errorDescription || 'Authentication failed' };
      }
    }

    // Validate required parameters
    if (!code || !state) {
      return { success: false, error: 'Missing authorization code or state parameter' };
    }

    // Verify state parameter for CSRF protection
    const savedState = sessionStorage.getItem('oauth_state');
    const provider = sessionStorage.getItem('oauth_provider');

    if (!savedState || state !== savedState) {
      return { success: false, error: 'Invalid state parameter - potential CSRF attack' };
    }

    if (!provider) {
      return { success: false, error: 'Missing provider information' };
    }

    // Handle callback with backend
    const authResponse = await OIDCAuthService.handleOAuthCallback(provider, code, state);

    // Clean up session storage
    sessionStorage.removeItem('oauth_state');
    sessionStorage.removeItem('oauth_provider');
    
    // Check if this was a Google OAuth with extended scopes
    const isGoogleIntegration = provider === 'google' && sessionStorage.getItem('google_auth_return_url');
    
    if (isGoogleIntegration) {
      // For Google integration, we need to mark this as successfully authenticated
      // but NOT store the access token as the main app token
      // The backend should have already stored the Google tokens internally
      
      // Mark Google integration as enabled (without storing the actual Google token)
      localStorage.setItem('google_integration_enabled', 'true');
      
      // Store user info for Google integration
      if (authResponse.user) {
        localStorage.setItem('google_user', JSON.stringify(authResponse.user));
      }
      
      console.log('[Google Auth] Google integration authenticated successfully');
      console.log('[Google Auth] Note: Google tokens are managed by backend, not stored in frontend');
    }

    return { success: true, user: authResponse.user };

  } catch (error) {
    console.error('OAuth callback error:', error);
    
    // Clean up session storage on error
    sessionStorage.removeItem('oauth_state');
    sessionStorage.removeItem('oauth_provider');
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Authentication failed' 
    };
  }
}