'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Mail, CheckCircle, Sparkles } from 'lucide-react';
import { Button, FloatingInput } from '@/components/ui';
import { z } from 'zod';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';

const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ForgotPasswordPage() {
  const t = useTranslations();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      setIsLoading(true);
      
      // Mock implementation - simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In real implementation, this would call the password reset API
      console.log('Password reset requested for:', data.email);
      
      setIsSubmitted(true);
    } catch (error) {
      console.error('Password reset failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
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
              {t('auth.resetLinkSent')}
            </h1>
            
            <p className="text-white/70 mb-8">
              {t('auth.resetLinkSentMessage')}
            </p>

            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-blue-300 hover:text-blue-200 transition-colors font-medium"
            >
              <ArrowLeft className="h-4 w-4" />
              {t('auth.backToLogin')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
              {t('auth.resetPassword')}
            </h1>
            <p className="text-white/70">
              {t('auth.resetPasswordDescription')}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-0 text-white font-semibold py-3 transition-all duration-300 transform hover:scale-[1.02]"
              size="lg"
              loading={isLoading}
              leftIcon={!isLoading && <Mail className="h-5 w-5" />}
            >
              {isLoading ? t('auth.sendingResetLink') : t('auth.sendResetLink')}
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