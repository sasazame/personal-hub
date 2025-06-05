import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

// This sets up the Service Worker for browser environments
export const worker = setupWorker(...handlers);