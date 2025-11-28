import { useEffect } from 'react';
import * as Sentry from '@sentry/react';
import { createRoot } from 'react-dom/client';
import {
  createRoutesFromChildren,
  matchRoutes,
  useLocation,
  useNavigationType,
} from 'react-router';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import { setupGlobalErrorHandling } from './hooks/useErrorReporting';

const container = document.getElementById('root')!;
let root = createRoot(container);

// Initialize Sentry for error tracking and performance monitoring
const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;
const DEFAULT_SENTRY_ENVIRONMENT = 'local';
if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    sendDefaultPii: true,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
      Sentry.reactRouterV7BrowserTracingIntegration({
        useEffect,
        useLocation,
        useNavigationType,
        createRoutesFromChildren,
        matchRoutes,
      }),
    ],
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    environment: import.meta.env.VITE_SENTRY_ENVIRONMENT || DEFAULT_SENTRY_ENVIRONMENT,
    release: import.meta.env.VITE_SENTRY_RELEASE,
  });

  // Wrap the root render with Sentry's error handling for React 18
  root = createRoot(container);
}

// Set up global error handling
setupGlobalErrorHandling();

// Render app with nested error boundaries
root.render(
  <ErrorBoundary>
    <Sentry.ErrorBoundary showDialog>
      <App />
    </Sentry.ErrorBoundary>
  </ErrorBoundary>
);
