'use client';

import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Breadcrumb } from './Breadcrumb';
import { PageTransition } from './PageTransition';
import { cn } from '@/lib/cn';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">{/* Theme-aware background using CSS variable */}
      
      <Header />
      <Sidebar />
      
      <main className={cn(
        "transition-all duration-300 ease-in-out",
        "md:ml-64", // Default sidebar width
        "pt-0" // Header is sticky, so no padding needed
      )}>
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <Breadcrumb />
          <PageTransition>
            {children}
          </PageTransition>
        </div>
      </main>
    </div>
  );
}