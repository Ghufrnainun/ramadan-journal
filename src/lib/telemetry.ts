type TelemetryLevel = 'error' | 'warn' | 'info';

interface TelemetryEvent {
  level: TelemetryLevel;
  type: 'window_error' | 'unhandled_rejection' | 'boot_error';
  message: string;
  stack?: string;
  timestamp: string;
  pathname: string;
  userAgent: string;
}

const STORAGE_KEY = 'myramadhanku_telemetry_buffer';
const MAX_EVENTS = 50;

let initialized = false;

function readBuffer(): TelemetryEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as TelemetryEvent[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeBuffer(events: TelemetryEvent[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events.slice(-MAX_EVENTS)));
  } catch {
    // Ignore storage errors.
  }
}

export function trackClientEvent(event: TelemetryEvent) {
  const current = readBuffer();
  current.push(event);
  writeBuffer(current);

  if (import.meta.env.VITE_TELEMETRY_DEBUG === 'true') {
    console.error('[telemetry]', event.type, event.message, event);
  }
}

export function setupGlobalErrorTelemetry() {
  if (initialized || typeof window === 'undefined') return;
  initialized = true;

  window.addEventListener('error', (event) => {
    trackClientEvent({
      level: 'error',
      type: 'window_error',
      message: event.message || 'Unknown window error',
      stack: event.error?.stack,
      timestamp: new Date().toISOString(),
      pathname: window.location.pathname,
      userAgent: navigator.userAgent,
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    const reason =
      typeof event.reason === 'string'
        ? event.reason
        : event.reason?.message || 'Unhandled promise rejection';

    trackClientEvent({
      level: 'error',
      type: 'unhandled_rejection',
      message: reason,
      stack: event.reason?.stack,
      timestamp: new Date().toISOString(),
      pathname: window.location.pathname,
      userAgent: navigator.userAgent,
    });
  });
}

export function trackBootError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;

  trackClientEvent({
    level: 'error',
    type: 'boot_error',
    message,
    stack,
    timestamp: new Date().toISOString(),
    pathname: typeof window !== 'undefined' ? window.location.pathname : '/',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
  });
}
