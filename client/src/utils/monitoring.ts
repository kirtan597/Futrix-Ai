/**
 * monitoring.ts
 * Centralized monitoring and error tracking integration.
 */

interface ErrorContext {
    errorInfo?: React.ErrorInfo;
    errorId?: string;
    timestamp?: string;
    url?: string;
    userId?: string;
    [key: string]: any;
}

export function initializeMonitoring() {
    // Optional monitoring initialization
}

export function captureException(error: Error, context?: ErrorContext) {
    if (import.meta.env.DEV) {
        console.error('[Monitoring] Exception captured:', error, context);
    }
}

export function captureMessage(message: string, context?: ErrorContext) {
    if (import.meta.env.DEV) {
        console.log('[Monitoring] Message:', message, context);
    }
}

export function trackEvent(eventName: string, properties?: Record<string, any>) {
    if (import.meta.env.DEV) {
        console.log('[Monitoring] Event:', eventName, properties);
    }
}

export default {
    initializeMonitoring,
    captureException,
    captureMessage,
    trackEvent,
};
