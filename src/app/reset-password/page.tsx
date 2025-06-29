'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Lock, CheckCircle, Sparkles, AlertCircle } from 'lucide-react';
import { Button, FloatingInput } from '@/components/ui';
import { PasswordStrength } from '@/components/ui/PasswordStrength';
import { z } from 'zod';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { authAPI } from '@/services/auth';
import { useToast } from '@/hooks/useToast';

const resetPasswordSchema = z.object({
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one digit'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const t = useTranslations();
  const router = useRouter();
  const toast = useToast();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [tokenError, setTokenError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const newPassword = watch('newPassword');

  // Validate token on mount
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setTokenError(t('auth.invalidResetLink'));
        setIsValidating(false);
        return;
      }

      try {
        const response = await authAPI.validateResetToken(token);
        if (response.success) {
          setIsTokenValid(true);
        }
      } catch (error) {
        setTokenError(error instanceof Error ? error.message : t('auth.invalidOrExpiredToken'));
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [token, t]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) return;

    try {
      setIsLoading(true);
      
      const response = await authAPI.resetPassword(token, data.newPassword);
      
      if (response.success) {
        setIsSuccess(true);
        toast.showSuccess(t('auth.passwordResetSuccess'));
        
        // Redirect to login page after 3 seconds
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      }
    } catch (error) {
      console.error('Password reset failed:', error);
      toast.showError(error instanceof Error ? error.message : t('auth.passwordResetFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>{t('auth.validatingToken')}</p>
        </div>
      </div>
    );
  }

  // Invalid token state
  if (!isTokenValid || tokenError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative">
        {/* Language Switcher */}
        <div className="absolute top-4 right-4 z-50">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-2">
            <LanguageSwitcher />
          </div>
        </div>

        {/* Error Card */}
        <div className="w-full max-w-md">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl">
                <AlertCircle className="h-8 w-8 text-white" />
              </div>
            </div>
            
            <h1 className="text-3xl font-bold text-white mb-4">
              {t('auth.invalidResetLink')}
            </h1>
            
            <p className="text-white/70 mb-8">
              {tokenError || t('auth.invalidOrExpiredToken')}
            </p>

            <Link
              href="/forgot-password"
              className="inline-flex items-center gap-2 text-blue-300 hover:text-blue-200 transition-colors font-medium"
            >
              <ArrowLeft className="h-4 w-4" />
              {t('auth.requestNewLink')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative">
        {/* Language Switcher */}
        <div className="absolute top-4 right-4 z-50">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-2">
            <LanguageSwitcher />
          </div>
        </div>

        {/* Success Card */}
        <div className="w-full max-w-md">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
            </div>
            
            <h1 className="text-3xl font-bold text-white mb-4">
              {t('auth.passwordResetSuccess')}
            </h1>
            
            <p className="text-white/70 mb-8">
              {t('auth.passwordResetSuccessMessage')}
            </p>

            <p className="text-white/50 text-sm">
              {t('auth.redirectingToLogin')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Reset password form
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      {/* Language Switcher */}
      <div className="absolute top-4 right-4 z-50">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-2">
          <LanguageSwitcher />
        </div>
      </div>

      {/* Reset Password Glass Card */}
      <div className="w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl">
          {/* Brand Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {t('auth.setNewPassword')}
            </h1>
            <p className="text-white/70">
              {t('auth.setNewPasswordDescription')}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <FloatingInput
                {...register('newPassword')}
                type="password"
                label={t('auth.newPassword')}
                error={errors.newPassword?.message}
                autoComplete="new-password"
                disabled={isLoading}
                leftIcon={<Lock className="h-4 w-4" />}
              />
              {newPassword && (
                <div className="mt-2">
                  <PasswordStrength password={newPassword} />
                </div>
              )}
            </div>

            <div>
              <FloatingInput
                {...register('confirmPassword')}
                type="password"
                label={t('auth.confirmPassword')}
                error={errors.confirmPassword?.message}
                autoComplete="new-password"
                disabled={isLoading}
                leftIcon={<Lock className="h-4 w-4" />}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-0 text-white font-semibold py-3 transition-all duration-300 transform hover:scale-[1.02]"
              size="lg"
              loading={isLoading}
              leftIcon={!isLoading && <Lock className="h-5 w-5" />}
            >
              {isLoading ? t('auth.resettingPassword') : t('auth.resetPassword')}
            </Button>

            <div className="text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-blue-300 hover:text-blue-200 transition-colors font-medium"
              >
                <ArrowLeft className="h-4 w-4" />
                {t('auth.backToLogin')}
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}