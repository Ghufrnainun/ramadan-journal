/**
 * Debug logger for auth/routing state.
 * Enable by setting VITE_DEBUG_AUTH=true in your .env file.
 */

const DEBUG_ENABLED =
  typeof import.meta !== 'undefined' &&
  import.meta.env?.VITE_DEBUG_AUTH === 'true';

type DebugPayload = {
  route: string;
  authState: 'loading' | 'signed_in' | 'signed_out';
  appState: string;
  userId?: string | null;
  source: 'local' | 'supabase' | 'none';
  setupCompletedAt?: string | null;
  extra?: Record<string, unknown>;
};

export function debugAuth(label: string, payload: DebugPayload): void {
  if (!DEBUG_ENABLED) return;

  const timestamp = new Date().toISOString();
  console.groupCollapsed(
    `%c[AUTH DEBUG] ${label} - ${payload.appState}`,
    'color: #f59e0b; font-weight: bold;',
  );
  console.log('time:', timestamp);
  console.log('route:', payload.route);
  console.log('auth:', payload.authState);
  console.log('appState:', payload.appState);
  console.log('user:', payload.userId ?? '(none)');
  console.log('source:', payload.source);
  console.log('setup:', payload.setupCompletedAt ?? '(null)');
  if (payload.extra) {
    console.log('extra:', payload.extra);
  }
  console.groupEnd();
}

export function debugAuthSimple(message: string, ...args: unknown[]): void {
  if (!DEBUG_ENABLED) return;
  console.log(`%c[AUTH DEBUG] ${message}`, 'color: #f59e0b;', ...args);
}
