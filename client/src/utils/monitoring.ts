/**
 * monitoring.ts
 * 
 * Centralized monitoring and error tracking integration.
 * Supports Sentry, LogRocket, and custom logging.
 */

interface ErrorContext {
  errorInfo?: React.ErrorInfo;
  errorId?: string;
  timestamp?: string;
  url?: string;
  userId?: string;
  [key: string]: any;
}

/**
 * Initialize monitoring services
 * Call this in App.tsx on app load
 */
export function initializeMonitoring() {
  // Sentry initialization (optional - add when ready)
  if (process.env.REACT_APP_SENTRY_DSN) {
    // import * as Sentry from '@sentry/react';
    // Sentry.init({
    //   dsn: process.env.REACT_APP_SENTRY_DSN,
    //   environment: process.env.NODE_ENV,
    //   tracesSampleRate: 1.0,
    // });
  }

  // LogRocket initialization (optional)
  if (process.env.REACT_APP_LOGROCKET_ID) {
    // import LogRocket from 'logrocket';
    // LogRocket.init(process.env.REACT_APP_LOGROCKET_ID);
  }
}

/**
 * Capture exception and send to monitoring service
 */
export function captureException(error: Error, context?: ErrorContext) {
  // Log locally for development
  if (process.env.NODE_ENV === 'development') {
    console.error('[Monitoring] Exception captured:', error, context);
  }

  // Send to Sentry
  if (process.env.REACT_APP_SENTRY_DSN) {
    // import * as Sentry from '@sentry/react';
    // Sentry.captureException(error, { extra: context });
  }

  // Send to LogRocket
  if (process.env.REACT_APP_LOGROCKET_ID) {
    // import LogRocket from 'logrocket';
    // LogRocket.captureException(error, { extra: context });
  }

  // Send to custom analytics endpoint
  sendToAnalytics({
    type: 'ERROR',
    error: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Capture info message
 */
export function captureMessage(message: string, context?: ErrorContext) {
  if (process.env.NODE_ENV === 'development') {
    console.log('[Monitoring] Message:', message, context);
  }

  // Send to Sentry
  if (process.env.REACT_APP_SENTRY_DSN) {
    // import * as Sentry from '@sentry/react';
    // Sentry.captureMessage(message, { extra: context });
  }

  sendToAnalytics({
    type: 'INFO',
    message,
    context,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track custom event
 */
export function trackEvent(eventName: string, properties?: Record<string, any>) {
  if (process.env.NODE_ENV === 'development') {
    console.log('[Monitoring] Event:', eventName, properties);
  }

  // Send to analytics
  sendToAnalytics({
    type: 'EVENT',
    event: eventName,
    properties,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Send telemetry to backend analytics endpoint
 */
async function sendToAnalytics(payload: any) {
  try {
    // Only send in production or if explicitly enabled
    if (process.env.NODE_ENV !== 'production' && !process.env.REACT_APP_ENABLE_ANALYTICS) {
      return;
    }

    await fetch('/api/telemetry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => {
      // Silently fail - don't let monitoring break the app
    });
  } catch {
    // Ignore errors in monitoring
  }
}

export default {
  initializeMonitoring,
  captureException,
  captureMessage,
  trackEvent,
};
