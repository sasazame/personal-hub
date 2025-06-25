'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useAuth, useLogout } from '@/hooks/useAuth';
import { Button, ThemeToggle, LanguageSwitcher } from '@/components/ui';
import { LogOut, User, Menu, X, Sparkles, Home, CheckSquare, Calendar, FileText, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/cn';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/hooks/useTheme';

export function Header() {
  const t = useTranslations();
  const { user, isAuthenticated } = useAuth();
  const { logout, isLoading } = useLogout();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { theme } = useTheme();

  // Mobile navigation items
  const mobileNavItems = [
    {
      href: '/dashboard',
      label: t('nav.dashboard'),
      icon: <Home className="h-5 w-5" />
    },
    {
      href: '/todos',
      label: t('nav.todos'),
      icon: <CheckSquare className="h-5 w-5" />
    },
    {
      href: '/calendar',
      label: t('nav.calendar'),
      icon: <Calendar className="h-5 w-5" />
    },
    {
      href: '/notes',
      label: t('nav.notes'),
      icon: <FileText className="h-5 w-5" />
    },
    {
      href: '/analytics',
      label: t('nav.analytics'),
      icon: <BarChart3 className="h-5 w-5" />
    },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/' || pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    await logout();
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Glassmorphism header */}
      <div className="bg-white/10 dark:bg-gray-900/10 backdrop-blur-xl border-b border-white/20 dark:border-gray-700/20">
        <div className="container px-4 mx-auto">
          <div className="flex h-16 items-center justify-between">
            {/* Logo and brand */}
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg blur-lg opacity-70"></div>
                  <div className="relative bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-lg">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                  {t('app.title')}
                </h1>
              </Link>
            </div>

            {/* Desktop navigation */}
            <nav className="hidden md:flex items-center justify-end flex-1">
              <Link 
                href="/profile"
                className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <User className="h-4 w-4" />
                <span className="font-medium">{user.username}</span>
              </Link>
            </nav>

            {/* Desktop actions */}
            <div className="hidden md:flex items-center space-x-4">
              <LanguageSwitcher />
              <ThemeToggle />
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                loading={isLoading}
                className="hover:bg-white/20 dark:hover:bg-gray-800/20"
                leftIcon={<LogOut className="h-4 w-4" />}
              >
                {t('header.logout')}
              </Button>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6 text-gray-700 dark:text-gray-300" />
              ) : (
                <Menu className="h-6 w-6 text-gray-700 dark:text-gray-300" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "md:hidden absolute top-16 left-0 w-full backdrop-blur-xl transform transition-all duration-300 ease-in-out",
          theme === 'dark' 
            ? "bg-gray-900/95 border-b border-gray-700/20" 
            : "bg-white/95 border-b border-white/20",
          isMobileMenuOpen ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"
        )}
      >
        <nav className="container px-4 mx-auto py-4 space-y-2">
          {/* Main navigation links */}
          <div className="space-y-1">
            {mobileNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "flex items-center space-x-3 p-3 rounded-lg transition-all duration-200",
                  isActive(item.href)
                    ? "bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-600 border border-blue-500/20"
                    : theme === 'dark'
                      ? "text-gray-300 hover:bg-gray-800"
                      : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <span className={cn(
                  "transition-transform duration-200",
                  isActive(item.href) && "scale-110"
                )}>
                  {item.icon}
                </span>
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </div>

          {/* User profile section */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <Link
              href="/profile"
              onClick={() => setIsMobileMenuOpen(false)}
              className={cn(
                "flex items-center space-x-3 p-3 rounded-lg transition-all duration-200",
                isActive('/profile')
                  ? "bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-600 border border-blue-500/20"
                  : theme === 'dark'
                    ? "text-gray-300 hover:bg-gray-800"
                    : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <User className={cn("h-5 w-5", theme === 'dark' ? "text-gray-300" : "text-gray-700")} />
              <span className={cn("font-medium", theme === 'dark' ? "text-gray-300" : "text-gray-700")}>{user.username}</span>
            </Link>
          </div>

          {/* Logout and settings */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
            <button
              onClick={() => {
                handleLogout();
                setIsMobileMenuOpen(false);
              }}
              disabled={isLoading}
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors w-full text-left"
            >
              <LogOut className={cn("h-5 w-5", theme === 'dark' ? "text-gray-300" : "text-gray-700")} />
              <span className={cn("font-medium", theme === 'dark' ? "text-gray-300" : "text-gray-700")}>
                {isLoading ? t('header.loggingOut') : t('header.logout')}
              </span>
            </button>
          </div>

          {/* Theme and language toggles */}
          <div className="flex items-center justify-center space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </nav>
      </div>
    </header>
  );
}