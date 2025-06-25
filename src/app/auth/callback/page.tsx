'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { CheckCircle, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { useAuth } from '@/contexts/AuthContext';

export default function OAuthCallbackPage() {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { handleOAuthCallback } = useAuth();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const processCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const errorParam = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');
        
        // Check if backend redirected with tokens directly
        const accessToken = searchParams.get('access_token');
        const refreshToken = searchParams.get('refresh_token');
        
        if (accessToken) {
          // Backend handled OAuth and sent tokens directly
          localStorage.setItem('accessToken', accessToken);
          if (refreshToken) {
            localStorage.setItem('refreshToken', refreshToken);
          }
          
          // Debug token in development
          if (process.env.NODE_ENV === 'development') {
            console.log('OAuth Callback: Received tokens directly from URL');
            const { debugToken } = await import('@/utils/jwt');
            debugToken(accessToken);
          }
          
          setStatus('success');
          setTimeout(() => {
            router.push('/dashboard');
          }, 2000);
          return;
        }

        if (!code || !state) {
          setError('Missing authorization parameters');
          setStatus('error');
          return;
        }

        const result = await handleOAuthCallback(code, state, errorParam || undefined, errorDescription || undefined);

        if (result && result.success) {
          setStatus('success');
          
          // Check if this was a Google integration callback
          const googleReturnUrl = sessionStorage.getItem('google_auth_return_url');
          if (googleReturnUrl) {
            sessionStorage.removeItem('google_auth_return_url');
            // Redirect back to where Google integration was initiated
            setTimeout(() => {
              router.push(googleReturnUrl);
            }, 2000);
          } else {
            // Normal OAuth flow - redirect to dashboard
            setTimeout(() => {
              router.push('/dashboard');
            }, 2000);
          }
        } else {
          setError(result?.error || 'Authentication failed');
          setStatus('error');
        }
      } catch (error) {
        console.error('OAuth callback processing error:', error);
        setError('Failed to process authentication callback');
        setStatus('error');
      }
    };

    processCallback();
  }, [searchParams, router, handleOAuthCallback]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20" />
      <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
      <div className="absolute top-0 right-1/4 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
      <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-slate-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />

      {/* Language Switcher */}
      <div className="absolute top-4 right-4 z-50">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-2">
          <LanguageSwitcher />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl text-center">
            
            {status === 'processing' && (
              <>
                <div className="flex items-center justify-center mb-6">
                  <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl">
                    <Loader2 className="h-8 w-8 text-white animate-spin" />
                  </div>
                </div>
                <h1 className="text-3xl font-bold text-white mb-4">
                  {t('auth.processingCallback')}
                </h1>
                <p className="text-white/70">
                  Please wait while we complete your authentication...
                </p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="flex items-center justify-center mb-6">
                  <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl">
                    <CheckCircle className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h1 className="text-3xl font-bold text-white mb-4">
                  {t('auth.authenticationSuccess')}
                </h1>
                <p className="text-white/70 mb-6">
                  Redirecting you to the dashboard...
                </p>
                <div className="flex items-center justify-center">
                  <Loader2 className="h-5 w-5 text-white/70 animate-spin" />
                </div>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="flex items-center justify-center mb-6">
                  <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl">
                    <AlertCircle className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h1 className="text-3xl font-bold text-white mb-4">
                  {t('auth.authenticationError')}
                </h1>
                <p className="text-white/70 mb-8">
                  {error}
                </p>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02]"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {t('auth.backToLogin')}
                </Link>
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}