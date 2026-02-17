import * as Sentry from '@sentry/react';

let initialized = false;

export const initMonitoring = () => {
  if (initialized) return;
  const dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined;
  if (!dsn) return;

  Sentry.init({
    dsn,
    environment: (import.meta.env.MODE || 'development') as string,
    tracesSampleRate: import.meta.env.DEV ? 0.1 : 0.2,
  });

  initialized = true;
};

