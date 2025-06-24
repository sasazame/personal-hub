'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { GoogleIntegrationService } from '@/services/google-integration';
import { showSuccess, showError } from '@/components/ui/toast';
import { AppLayout } from '@/components/layout';
import { Card, CardContent } from '@/components/ui/Card';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function GoogleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      console.log('[Google Callback] Params:', { 
        hasCode: !!code, 
        hasState: !!state, 
        error, 
        errorDescription,
        storedState: sessionStorage.getItem('oauth_state')
      });

      if (error) {
        setStatus('error');
        setErrorMessage(errorDescription || error);
        showError(`Google authorization failed: ${errorDescription || error}`);
        return;
      }

      if (!code || !state) {
        setStatus('error');
        setErrorMessage('Missing authorization code or state');
        showError('Invalid authorization response');
        return;
      }

      try {
        await GoogleIntegrationService.handleGoogleAuthCallback(code, state);
        setStatus('success');
        showSuccess('Google account connected successfully!');
        
        // Redirect back to calendar or the page they came from
        const returnUrl = sessionStorage.getItem('google_auth_return_url') || '/calendar';
        
        setTimeout(() => {
          router.push(returnUrl);
        }, 2000);
      } catch (err) {
        setStatus('error');
        const message = err instanceof Error ? err.message : 'Failed to complete Google authorization';
        setErrorMessage(message);
        showError(message);
        
        // Log detailed error for debugging
        console.error('[Google Callback] Error details:', err);
      }
    };

    handleCallback();
  }, [searchParams, router]);

  return (
    <AppLayout>
      <div className="min-h-[60vh] flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              {status === 'processing' && (
                <>
                  <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto" />
                  <h2 className="text-xl font-semibold">Connecting Google Account</h2>
                  <p className="text-muted-foreground">
                    Please wait while we complete the authorization...
                  </p>
                </>
              )}

              {status === 'success' && (
                <>
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                  <h2 className="text-xl font-semibold">Successfully Connected!</h2>
                  <p className="text-muted-foreground">
                    Your Google account has been connected. Redirecting...
                  </p>
                </>
              )}

              {status === 'error' && (
                <>
                  <XCircle className="h-12 w-12 text-red-500 mx-auto" />
                  <h2 className="text-xl font-semibold">Connection Failed</h2>
                  <p className="text-muted-foreground">
                    {errorMessage}
                  </p>
                  <button
                    onClick={() => router.push('/calendar')}
                    className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                  >
                    Go to Calendar
                  </button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}