'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ArrowLeft, Calendar } from 'lucide-react';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';

export default function TermsPage() {
  const t = useTranslations();
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const sections = [
    'acceptance',
    'description',
    'userResponsibilities',
    'limitations',
    'intellectualProperty',
    'termination',
    'contact'
  ];

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
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        {/* Navigation */}
        <div className="mb-8">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-blue-300 hover:text-blue-200 transition-colors font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </Link>
        </div>

        {/* Main Content */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">
              {t('legal.terms.title')}
            </h1>
            <div className="flex items-center justify-center gap-2 text-white/70">
              <Calendar className="h-4 w-4" />
              <span>{t('legal.terms.lastUpdated', { date: currentDate })}</span>
            </div>
          </div>

          {/* Content Sections */}
          <div className="space-y-8">
            {sections.map((section) => (
              <section key={section} className="prose prose-invert max-w-none">
                <h2 className="text-2xl font-semibold text-white mb-4">
                  {t(`legal.terms.${section}.title`)}
                </h2>
                <p className="text-white/80 leading-relaxed">
                  {t(`legal.terms.${section}.content`)}
                </p>
              </section>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-white/20 text-center">
            <p className="text-white/60 text-sm">
              Personal Hub - Open Source Personal Productivity Application
            </p>
            <div className="mt-4 flex justify-center gap-6">
              <Link
                href="/privacy"
                className="text-blue-300 hover:text-blue-200 transition-colors"
              >
                {t('legal.privacy.title')}
              </Link>
              <Link
                href="/login"
                className="text-blue-300 hover:text-blue-200 transition-colors"
              >
                {t('auth.login')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}