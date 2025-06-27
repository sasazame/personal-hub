'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/cn';
import { getRouteLabel } from '@/config/navigation';

interface BreadcrumbSegment {
  label: string;
  href?: string;
}

export function Breadcrumb() {
  const t = useTranslations();
  const pathname = usePathname();

  const generateBreadcrumbs = (): BreadcrumbSegment[] => {
    const segments = pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbSegment[] = [
      { label: t('nav.home'), href: '/' }
    ];

    let currentPath = '';
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === segments.length - 1;
      
      // Use centralized route label translation
      const label = getRouteLabel(segment, t);

      breadcrumbs.push({
        label,
        href: isLast ? undefined : currentPath
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className="py-3 px-4 md:px-0">
      <ol className="flex items-center space-x-2 text-sm">
        {breadcrumbs.map((breadcrumb, index) => {
          const isFirst = index === 0;

          return (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="h-4 w-4 text-muted-foreground/50 mx-2" />
              )}
              
              {breadcrumb.href ? (
                <Link
                  href={breadcrumb.href}
                  className={cn(
                    "flex items-center space-x-1 text-muted-foreground hover:text-primary transition-colors",
                    isFirst && "font-medium"
                  )}
                >
                  {isFirst && <Home className="h-4 w-4" />}
                  <span>{breadcrumb.label}</span>
                </Link>
              ) : (
                <span className="text-foreground font-medium">
                  {breadcrumb.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}