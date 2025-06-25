'use client';

import { useEffect } from 'react';

export function MSWInit() {
  useEffect(() => {
    // Only enable MSW in CI or test environments
    const shouldEnableMSW = process.env.NEXT_PUBLIC_CI === 'true' || process.env.NODE_ENV === 'test';
    
    if (!shouldEnableMSW && typeof window !== 'undefined') {
      // Clean up any existing MSW service workers in non-CI environments
      navigator.serviceWorker?.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
          if (registration.scope.includes('mockServiceWorker')) {
            registration.unregister();
            console.log('[MSW] Cleaned up Mock Service Worker');
          }
        });
      });
      return;
    }
    
    if (shouldEnableMSW && typeof window !== 'undefined') {
      import('../../e2e/mocks/handlers').then(({ handlers }) => {
        import('msw/browser').then(({ setupWorker }) => {
          const worker = setupWorker(...handlers);
          worker.start({
            onUnhandledRequest: 'bypass',
            serviceWorker: {
              url: '/mockServiceWorker.js'
            }
          }).then(() => {
            console.log('[MSW] Mock Service Worker started for CI environment');
          });
        });
      });
    }
  }, []);

  return null;
}