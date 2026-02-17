/**
 * AppGate - single route guard component.
 *
 * Replaces the old ProtectedRoute. Uses the canonical state machine
 * to decide whether to render children or redirect.
 *
 * Props:
 *   requireAuth   - user must be signed in
 *   requireSetup  - user must have completed onboarding (setup_completed_at)
 */

import React, { useEffect, useState, useRef, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Moon, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { deriveAppState, getRedirectTarget, AppState } from '@/lib/app-state';
import { getProfileStore, LocalProfileStore } from '@/lib/profile-store';
import { debugAuth, debugAuthSimple } from '@/lib/debug-auth';
import { drainSyncQueue, scheduleSyncQueueDrain } from '@/lib/offline-sync';

interface AppGateProps {
  children: ReactNode;
  /** Require authentication to access this route */
  requireAuth?: boolean;
  /** Require setup/onboarding completion to access this route */
  requireSetup?: boolean;
}

const LoadingScreen = () => (
  <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center">
    <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
      <Moon className="w-8 h-8 text-amber-400" />
    </div>
    <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
  </div>
);

// Anti-loop: minimum ms between redirects to same target
const REDIRECT_COOLDOWN_MS = 2000;

const AppGate: React.FC<AppGateProps> = ({
  children,
  requireAuth = false,
  requireSetup = false,
}) => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [profileResolved, setProfileResolved] = useState(false);
  const [setupCompletedAt, setSetupCompletedAt] = useState<string | null>(null);
  const [appState, setAppState] = useState<AppState>('loading');

  // Anti-loop refs
  const lastRedirectRef = useRef<{ target: string; time: number } | null>(null);
  const hasRedirected = useRef(false);

  // Resolve profile once auth is settled
  useEffect(() => {
    if (authLoading) return;

    let cancelled = false;

    const resolveProfile = async () => {
      try {
        debugAuthSimple('AppGate: resolving profile', {
          userId: user?.id,
          path: location.pathname,
        });

        const store = user?.id
          ? getProfileStore(user.id)
          : new LocalProfileStore();

        const profile = await store.getProfile();

        if (cancelled) return;

        const completedAt = profile.setup_completed_at || null;
        setSetupCompletedAt(completedAt);
        setProfileResolved(true);

        debugAuthSimple('AppGate: profile resolved', {
          setup_completed_at: completedAt,
        });
      } catch (err) {
        console.error('AppGate: failed to resolve profile', err);
        if (!cancelled) {
          // On error, check local only as fallback
          try {
            const local = new LocalProfileStore();
            const p = await local.getProfile();
            setSetupCompletedAt(p.setup_completed_at || null);
          } catch {
            setSetupCompletedAt(null);
          }
          setProfileResolved(true);
        }
      }
    };

    // Reset on user change
    setProfileResolved(false);
    hasRedirected.current = false;
    void resolveProfile();

    return () => {
      cancelled = true;
    };
    // Only re-run when user changes - NOT on location.key
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user?.id]);

  // Compute state whenever inputs change
  useEffect(() => {
    const state = deriveAppState({
      authResolved: !authLoading,
      userId: user?.id ?? null,
      profileResolved,
      setupCompletedAt,
    });

    setAppState(state);

    debugAuth('AppGate state computed', {
      route: location.pathname,
      authState: authLoading ? 'loading' : user ? 'signed_in' : 'signed_out',
      appState: state,
      userId: user?.id,
      source: user?.id ? 'supabase' : 'local',
      setupCompletedAt,
    });
  }, [authLoading, user, profileResolved, setupCompletedAt, location.pathname]);

  useEffect(() => {
    if (!user?.id) return;
    void drainSyncQueue();
    const onOnline = () => {
      scheduleSyncQueueDrain(150);
    };
    window.addEventListener('online', onOnline);
    return () => window.removeEventListener('online', onOnline);
  }, [user?.id]);

  // Handle redirects
  useEffect(() => {
    if (appState === 'loading') return;
    if (hasRedirected.current) return;

    const target = getRedirectTarget(appState, location.pathname);

    if (!target) return;

    // Already on target
    if (location.pathname === target) return;

    // Anti-loop: don't redirect to same target within cooldown
    const now = Date.now();
    if (
      lastRedirectRef.current &&
      lastRedirectRef.current.target === target &&
      now - lastRedirectRef.current.time < REDIRECT_COOLDOWN_MS
    ) {
      debugAuthSimple(
        `AppGate: suppressed duplicate redirect to ${target} (cooldown)`,
      );
      return;
    }

    debugAuthSimple(`AppGate: redirecting ${location.pathname} -> ${target}`);
    lastRedirectRef.current = { target, time: now };
    hasRedirected.current = true;
    navigate(target, { replace: true });
  }, [appState, location.pathname, navigate]);

  // While loading, show loading screen for auth-required routes
  if (appState === 'loading') {
    if (requireAuth || requireSetup) {
      return <LoadingScreen />;
    }
    // Public routes can render while loading
    return <>{children}</>;
  }

  // After state is resolved, check if we should render
  if (requireAuth && !user) {
    return <LoadingScreen />; // Will redirect via effect
  }

  if (requireSetup && !setupCompletedAt) {
    return <LoadingScreen />; // Will redirect via effect
  }

  return <>{children}</>;
};

export default AppGate;
