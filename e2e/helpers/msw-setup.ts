import { setupWorker } from 'msw/browser';
import { handlers } from '../mocks/handlers';

export const worker = setupWorker(...handlers);

export async function startMSW() {
  if (typeof window !== 'undefined') {
    await worker.start({
      onUnhandledRequest: 'bypass',
      serviceWorker: {
        url: '/mockServiceWorker.js'
      }
    });
  }
}