/**
 * Canonical state machine for app access control.
 *
 * States:
 *   loading            - auth session or profile not yet resolved
 *   guest              - no session, no local setup done
 *   guest_ready        - no session, local setup complete
 *   user_needs_setup   - signed in, setup_completed_at is null
 *   user_ready         - signed in, setup_completed_at is set
 */

export type AppState =
  | 'loading'
  | 'guest'
  | 'guest_ready'
  | 'user_needs_setup'
  | 'user_ready';

export interface AppStateInput {
  /** null = still loading auth */
  authResolved: boolean;
  /** Supabase user id, null if signed out */
  userId: string | null;
  /** Whether the profile has been fetched (local or DB) */
  profileResolved: boolean;
  /** The setup_completed_at value from the resolved profile */
  setupCompletedAt: string | null;
}

/**
 * Pure function - derives canonical state from inputs.
 * No side effects, fully testable.
 */
export function deriveAppState(input: AppStateInput): AppState {
  // Auth not yet resolved
  if (!input.authResolved) return 'loading';

  // Auth resolved but profile not fetched yet
  if (!input.profileResolved) return 'loading';

  const isSetupDone = !!input.setupCompletedAt;

  // Guest (no session)
  if (!input.userId) {
    return isSetupDone ? 'guest_ready' : 'guest';
  }

  // Logged-in user
  return isSetupDone ? 'user_ready' : 'user_needs_setup';
}

/**
 * Given an app state and the current pathname, returns the redirect
 * target or null if the user can stay on the current route.
 */
export function getRedirectTarget(
  state: AppState,
  pathname: string,
): string | null {
  // Never redirect while loading
  if (state === 'loading') return null;

  const isOnboarding = pathname === '/onboarding';
  const isAuth = pathname === '/auth';
  const isPublic = pathname === '/' || pathname === '/demo';
  const isAppRoute =
    !isOnboarding && !isAuth && !isPublic && pathname !== '/404';

  switch (state) {
    case 'guest':
      // Guests without setup can access public + auth + onboarding only
      // But they need to log in first for onboarding, so redirect to auth
      if (isOnboarding || isAppRoute) return '/auth';
      return null;

    case 'guest_ready':
      // Guest with local setup - can access public pages only
      // (they can't access app routes without login)
      if (isAppRoute || isOnboarding) return '/auth';
      return null;

    case 'user_needs_setup':
      // Logged-in but setup incomplete -> must go to onboarding
      if (isOnboarding) return null; // already there
      if (isPublic || isAuth || isAppRoute) return '/onboarding';
      return null;

    case 'user_ready':
      // Logged-in and setup done -> should not be on onboarding or auth
      if (isOnboarding || isAuth) return '/dashboard';
      return null;

    default:
      return null;
  }
}
