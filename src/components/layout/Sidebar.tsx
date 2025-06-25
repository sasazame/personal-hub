'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/cn';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { 
  Home, 
  CheckSquare, 
  Settings, 
  ChevronLeft,
  ChevronRight,
  Calendar,
  FileText,
  BarChart3
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

export function Sidebar() {
  const t = useTranslations();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useLocalStorage('sidebar-collapsed', false);

  const navItems: NavItem[] = [
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

  const bottomNavItems: NavItem[] = [
    {
      href: '/profile',
      label: 'Profile',
      icon: <Settings className="h-5 w-5" />
    },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/' || pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white/90 dark:bg-gray-900/80 backdrop-blur-xl border-r border-border shadow-sm transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1) hidden md:block",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex flex-col h-full">
        {/* Collapse toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-6 bg-card border border-border rounded-full p-1.5 hover:shadow-md transition-all duration-200 shadow-sm hover:scale-110"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          ) : (
            <ChevronLeft className="h-3.5 w-3.5 text-muted-foreground" />
          )}
        </button>

        {/* Main navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1.5">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
                isActive(item.href)
                  ? "bg-gradient-to-r from-primary-100 to-accent-100 dark:from-primary-900/20 dark:to-accent-900/20 text-primary-700 dark:text-primary-300 shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800",
                isCollapsed && "justify-center px-2"
              )}
              title={isCollapsed ? item.label : undefined}
            >
              <span className={cn(
                "transition-all duration-200",
                isActive(item.href) ? "scale-110 text-primary-600 dark:text-primary-400" : "group-hover:scale-105"
              )}>
                {item.icon}
              </span>
              {!isCollapsed && (
                <span className="font-medium truncate transition-all duration-200">{item.label}</span>
              )}
            </Link>
          ))}
        </nav>

        {/* Bottom navigation */}
        <nav className="px-3 py-4 border-t border-border space-y-1.5">
          {bottomNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
                isActive(item.href)
                  ? "bg-gradient-to-r from-primary-100 to-accent-100 dark:from-primary-900/20 dark:to-accent-900/20 text-primary-700 dark:text-primary-300 shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800",
                isCollapsed && "justify-center px-2"
              )}
              title={isCollapsed ? item.label : undefined}
            >
              <span className={cn(
                "transition-all duration-200",
                isActive(item.href) ? "scale-110 text-primary-600 dark:text-primary-400" : "group-hover:scale-105"
              )}>
                {item.icon}
              </span>
              {!isCollapsed && (
                <span className="font-medium truncate transition-all duration-200">{item.label}</span>
              )}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}