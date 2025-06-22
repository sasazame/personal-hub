'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, LogIn, CheckCircle, Mail, Lock, Sparkles } from 'lucide-react';
import { Button, FloatingInput } from '@/components/ui';
import { loginSchema, type LoginFormData } from '@/lib/validations/auth';
import { useLogin, useAuth } from '@/hooks/useAuth';
import { Icons } from '@/components/ui/icons';

export default function LoginPage() {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const { login, isLoading, clearError } = useLogin();
  const { isAuthenticated, loginWithOIDC } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    // Check for registration success message
    if (searchParams.get('registered') === 'true') {
      setSuccessMessage(t('auth.registerSuccess'));
    }
  }, [searchParams, t]);

  // Redirect when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const redirectParam = searchParams.get('redirect');
      const redirectTo = redirectParam ? decodeURIComponent(redirectParam) : '/';
      router.push(redirectTo);
    }
  }, [isAuthenticated, router, searchParams]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      clearError();
      await login(data.email, data.password);
      // Redirect will happen automatically via useEffect when isAuthenticated becomes true
    } catch {
      // Error is already handled by the useLogin hook
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Premium Glass Card */}
      <div className="w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl">
          {/* Brand Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">{t('auth.login')}</h1>
            <p className="text-white/70">
              {t('auth.loginDescription')}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {successMessage && (
              <div className="p-4 text-sm text-green-100 bg-green-500/20 border border-green-500/30 rounded-xl flex items-center gap-2 backdrop-blur-sm animate-slide-in-top">
                <CheckCircle className="h-4 w-4" />
                {successMessage}
              </div>
            )}
            
            <div>
              <FloatingInput
                {...register('email')}
                type="email"
                label={t('auth.email')}
                error={errors.email?.message}
                autoComplete="email"
                disabled={isLoading}
                leftIcon={<Mail className="h-4 w-4" />}
              />
            </div>

            <div>
              <FloatingInput
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                label={t('auth.password')}
                error={errors.password?.message}
                autoComplete="current-password"
                disabled={isLoading}
                leftIcon={<Lock className="h-4 w-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-white/70 hover:text-white transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                }
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <Link
                href="/forgot-password"
                className="text-blue-300 hover:text-blue-200 transition-colors"
              >
                {t('auth.forgotPassword')}
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-0 text-white font-semibold py-3 transition-all duration-300 transform hover:scale-[1.02]"
              size="lg"
              loading={isLoading}
              leftIcon={!isLoading && <LogIn className="h-5 w-5" />}
            >
              {isLoading ? t('common.loading') : t('auth.login')}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-transparent text-white/70">{t('auth.or')}</span>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                type="button"
                onClick={() => loginWithOIDC('google')}
                className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold py-3 transition-all duration-300"
                size="lg"
                leftIcon={<Icons.google className="h-5 w-5" />}
              >
                {t('auth.continueWithGoogle')}
              </Button>
              
              <Button
                type="button"
                onClick={() => loginWithOIDC('github')}
                className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold py-3 transition-all duration-300"
                size="lg"
                leftIcon={<Icons.gitHub className="h-5 w-5" />}
              >
                {t('auth.continueWithGitHub')}
              </Button>
            </div>

            <div className="text-center text-sm text-white/70">
              {t('auth.dontHaveAccount')}{' '}
              <Link
                href="/register"
                className="text-blue-300 hover:text-blue-200 transition-colors font-medium"
              >
                {t('auth.register')}
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}