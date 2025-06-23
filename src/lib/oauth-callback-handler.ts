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