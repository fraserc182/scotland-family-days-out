/**
 * Error logging utility
 * Can be extended to send errors to external services like Sentry
 */

export interface ErrorLog {
  message: string;
  error?: Error;
  context?: Record<string, unknown>;
  timestamp: string;
  url?: string;
  userAgent?: string;
}

export function logError(message: string, error?: Error, context?: Record<string, unknown>): void {
  const errorLog: ErrorLog = {
    message,
    error,
    context,
    timestamp: new Date().toISOString(),
    url: typeof window !== 'undefined' ? window.location.href : undefined,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
  };

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error Log:', errorLog);
  }

  // Send to external service in production
  if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_SENTRY_DSN) {
    // TODO: Integrate with Sentry or similar service
    // sendToSentry(errorLog);
  }

  // Store in local storage for debugging (limited to last 10 errors)
  try {
    const storedErrors = localStorage.getItem('error_logs');
    const errors: ErrorLog[] = storedErrors ? JSON.parse(storedErrors) : [];
    errors.push(errorLog);
    
    // Keep only last 10 errors
    if (errors.length > 10) {
      errors.shift();
    }
    
    localStorage.setItem('error_logs', JSON.stringify(errors));
  } catch (e) {
    // Silently fail if localStorage is not available
  }
}

export function getStoredErrors(): ErrorLog[] {
  try {
    const storedErrors = localStorage.getItem('error_logs');
    return storedErrors ? JSON.parse(storedErrors) : [];
  } catch (e) {
    return [];
  }
}

export function clearStoredErrors(): void {
  try {
    localStorage.removeItem('error_logs');
  } catch (e) {
    // Silently fail if localStorage is not available
  }
}

