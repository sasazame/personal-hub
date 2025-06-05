'use client';

import { useEffect } from 'react';

export function MSWInit() {
  useEffect(() => {
    if ((process.env.NEXT_PUBLIC_CI === 'true' || process.env.NODE_ENV === 'test') && typeof window !== 'undefined') {
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