'use client';

import { useState } from 'react';
import { OIDCAuthService } from '@/services/oidc-auth';

export default function TestOAuthPage() {
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testOAuth = async (provider: 'google' | 'github') => {
    setLoading(true);
    setError('');
    setResponse(null);
    
    try {
      const result = await OIDCAuthService.initiateOAuth(provider);
      setResponse(result);
      console.log('OAuth response:', result);
      
      // Log the authorization URL for debugging
      if (result.authorizationUrl) {
        console.log('Authorization URL:', result.authorizationUrl);
        console.log('State:', result.state);
        console.log('Provider:', result.provider);
      }
    } catch (err) {
      console.error('OAuth error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">OAuth Test Page</h1>
        
        <div className="space-y-4">
          <button
            onClick={() => testOAuth('google')}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            Test Google OAuth
          </button>
          
          <button
            onClick={() => testOAuth('github')}
            disabled={loading}
            className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900 disabled:opacity-50 ml-4"
          >
            Test GitHub OAuth
          </button>
        </div>
        
        {loading && <p className="mt-4">Loading...</p>}
        
        {error && (
          <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
            <h3 className="font-bold">Error:</h3>
            <p>{error}</p>
          </div>
        )}
        
        {response && (
          <div className="mt-4 p-4 bg-green-100 text-green-800 rounded">
            <h3 className="font-bold">Response:</h3>
            <pre className="mt-2 text-xs overflow-auto">
              {JSON.stringify(response, null, 2)}
            </pre>
          </div>
        )}
        
        <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded">
          <h3 className="font-bold mb-2">Environment Info:</h3>
          <p>API Base URL: {process.env.NEXT_PUBLIC_API_BASE_URL || 'Not set'}</p>
          <p>OAuth Redirect URI: {process.env.NEXT_PUBLIC_OAUTH_REDIRECT_URI || 'Not set'}</p>
        </div>
      </div>
    </div>
  );
}