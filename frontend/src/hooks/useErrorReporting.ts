import { useCallback } from 'react';
import * as Sentry from '@sentry/react';
import { notifications } from '@mantine/notifications';

export interface ErrorReportOptions {
  showNotification?: boolean;
  notificationTitle?: string;
  notificationMessage?: string;
  context?: Record<string, any>;
  level?: 'info' | 'warning' | 'error' | 'fatal';
}

export function useErrorReporting() {
  const reportError = useCallback((error: Error | string, options: ErrorReportOptions = {}) => {
    const {
      showNotification = true,
      notificationTitle = 'Error',
      notificationMessage,
      context = {},
      level = 'error',
    } = options;

    // Create error object if string was passed
    const errorObj = typeof error === 'string' ? new Error(error) : error;

    // Report to Sentry with context
    Sentry.withScope((scope) => {
      scope.setLevel(level);
      scope.setContext('userReported', {
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        ...context,
      });
      Sentry.captureException(errorObj);
    });

    // Show user notification if requested
    if (showNotification) {
      notifications.show({
        title: notificationTitle,
        message: notificationMessage || errorObj.message || 'An unexpected error occurred',
        color: 'red',
        autoClose: 5000,
      });
    }

    // Log to console in development
    if (import.meta.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('Error reported:', errorObj, context);
    }
  }, []);

  const reportWarning = useCallback(
    (message: string, options: Omit<ErrorReportOptions, 'level'> = {}) => {
      reportError(new Error(message), { ...options, level: 'warning' });
    },
    [reportError]
  );

  const reportInfo = useCallback(
    (message: string, options: Omit<ErrorReportOptions, 'level'> = {}) => {
      reportError(new Error(message), { ...options, level: 'info' });
    },
    [reportError]
  );

  return {
    reportError,
    reportWarning,
    reportInfo,
  };
}

// Global error handler for uncaught errors
export function setupGlobalErrorHandling() {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    Sentry.captureException(event.reason);
    // eslint-disable-next-line no-console
    console.error('Unhandled promise rejection:', event.reason);
  });

  // Handle other uncaught errors
  window.addEventListener('error', (event) => {
    Sentry.captureException(event.error);
    // eslint-disable-next-line no-console
    console.error('Uncaught error:', event.error);
  });
}
