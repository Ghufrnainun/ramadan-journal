/**
 * Unified Profile Store - single source of truth for profile data.
 *
 * Two backends:
 *  - LocalProfileStore: localStorage (for guests and local cache)
 *  - SupabaseProfileStore: Supabase DB (for logged-in users)
 *
 * Both share the same UserProfile shape and produce consistent results.
 */

import { supabase } from '@/integrations/supabase/runtime-client';
import { debugAuthSimple } from './debug-auth';
import { queueMutation, scheduleSyncQueueDrain } from './offline-sync';

// ─── Profile Shape ──────────────────────────────────────────────────
export interface UserProfile {
  language: 'id' | 'en';
  displayName?: string | null;
  location: {
    city: string;
    province: string;
  } | null;
  ramadanStartDate: string | null;
  ramadanEndDate?: string | null;
  focusModules: string[];
  reminders: {
    sahur: boolean;
    iftar: boolean;
    prayer: boolean;
    reflection: boolean;
  };
  silentMode: boolean;
  hideStreak?: boolean;

  /**
   * ISO timestamp when setup (onboarding) was completed.
   * null = not completed.
   * Replaces the old `onboardingCompleted` boolean.
   */
  setup_completed_at: string | null;

  /** @deprecated Use setup_completed_at instead. Kept for migration. */
  onboardingCompleted?: boolean;
}

const STORAGE_KEY = 'myramadhanku_profile';

const DEFAULT_PROFILE: UserProfile = {
  language: 'id',
  displayName: null,
  location: null,
  ramadanStartDate: null,
  ramadanEndDate: null,
  focusModules: ['prayer', 'quran', 'dhikr', 'tracker', 'reflection'],
  reminders: {
    sahur: false,
    iftar: false,
    prayer: false,
    reflection: false,
  },
  silentMode: false,
  hideStreak: false,
  setup_completed_at: null,
  onboardingCompleted: false,
};

// ─── Interface ──────────────────────────────────────────────────────
export interface ProfileStore {
  getProfile(): Promise<UserProfile>;
  upsertProfile(updates: Partial<UserProfile>): Promise<void>;
  markSetupComplete(): Promise<void>;
  isSetupComplete(): Promise<boolean>;
  clearSetup(): Promise<void>;
}

// ─── Auto-migration helper ─────────────────────────────────────────
function migrateProfile(raw: Record<string, unknown>): UserProfile {
  const profile = { ...DEFAULT_PROFILE, ...raw } as UserProfile;

  // Migrate old boolean -> timestamp
  if (
    !profile.setup_completed_at &&
    (raw.onboardingCompleted === true || raw.onboarding_completed === true)
  ) {
    profile.setup_completed_at = new Date().toISOString();
    debugAuthSimple('Migrated onboardingCompleted -> setup_completed_at');
  }

  // Keep backward compat
  profile.onboardingCompleted = !!profile.setup_completed_at;

  return profile;
}

// ─── Local Profile Store ────────────────────────────────────────────
export class LocalProfileStore implements ProfileStore {
  async getProfile(): Promise<UserProfile> {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const raw = JSON.parse(stored) as Record<string, unknown>;
        return migrateProfile(raw);
      }
    } catch (e) {
      console.error('Error reading local profile:', e);
    }
    return { ...DEFAULT_PROFILE };
  }

  async upsertProfile(updates: Partial<UserProfile>): Promise<void> {
    try {
      const current = await this.getProfile();
      const updated = { ...current, ...updates };
      // Keep onboardingCompleted in sync
      updated.onboardingCompleted = !!updated.setup_completed_at;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving local profile:', e);
    }
  }

  async markSetupComplete(): Promise<void> {
    await this.upsertProfile({
      setup_completed_at: new Date().toISOString(),
      onboardingCompleted: true,
    });
    debugAuthSimple('LocalProfileStore: setup marked complete');
  }

  async isSetupComplete(): Promise<boolean> {
    const profile = await this.getProfile();
    return !!profile.setup_completed_at;
  }

  async clearSetup(): Promise<void> {
    await this.upsertProfile({
      setup_completed_at: null,
      onboardingCompleted: false,
    });
    debugAuthSimple('LocalProfileStore: setup cleared');
  }
}

// ─── Supabase Profile Store ────────────────────────────────────────
export class SupabaseProfileStore implements ProfileStore {
  constructor(private userId: string) {}

  private mapDbToProfile(row: Record<string, unknown>): Partial<UserProfile> {
    return {
      language: (row.language === 'en' ? 'en' : 'id') as 'en' | 'id',
      location:
        row.city && row.province
          ? { city: row.city as string, province: row.province as string }
          : null,
      ramadanStartDate: (row.ramadan_start_date as string) || null,
      ramadanEndDate: (row.ramadan_end_date as string) || null,
      focusModules: (row.focus_modules as string[]) || [
        'prayer',
        'quran',
        'dhikr',
        'tracker',
        'reflection',
      ],
      reminders: {
        sahur: !!row.reminders_sahur,
        iftar: !!row.reminders_iftar,
        prayer: !!row.reminders_prayer,
        reflection: !!row.reminders_reflection,
      },
      displayName: (row.display_name as string) || null,
      silentMode: !!row.silent_mode,
      hideStreak: !!row.hide_streak,
      // New field
      setup_completed_at: (row.setup_completed_at as string) || null,
      // Backward compat: derive from new field OR old boolean
      onboardingCompleted:
        !!row.setup_completed_at || !!row.onboarding_completed,
    };
  }

  private mapProfileToDb(profile: UserProfile) {
    return {
      language: profile.language,
      city: profile.location?.city || null,
      province: profile.location?.province || null,
      ramadan_start_date: profile.ramadanStartDate || null,
      ramadan_end_date: profile.ramadanEndDate || null,
      focus_modules: profile.focusModules,
      reminders_sahur: profile.reminders.sahur,
      reminders_iftar: profile.reminders.iftar,
      reminders_prayer: profile.reminders.prayer,
      reminders_reflection: profile.reminders.reflection,
      display_name: profile.displayName || null,
      silent_mode: profile.silentMode,
      hide_streak: profile.hideStreak || false,
      // Write both fields for DB compat
      onboarding_completed: !!profile.setup_completed_at,
      setup_completed_at: profile.setup_completed_at || null,
    };
  }

  async getProfile(): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', this.userId)
      .maybeSingle();

    if (error) {
      console.error('Failed to load profile from DB:', error);
      // Fallback to local
      return new LocalProfileStore().getProfile();
    }

    if (!data) {
      // No DB record yet - return local profile
      return new LocalProfileStore().getProfile();
    }

    const dbPartial = this.mapDbToProfile(data as Record<string, unknown>);
    const localProfile = await new LocalProfileStore().getProfile();

    // CRITICAL: Never downgrade setup_completed_at
    const finalSetup =
      localProfile.setup_completed_at || dbPartial.setup_completed_at || null;

    const merged = migrateProfile({
      ...DEFAULT_PROFILE,
      ...dbPartial,
      setup_completed_at: finalSetup,
    });

    // Sync merged profile back to localStorage for fast reads
    await new LocalProfileStore().upsertProfile(merged);

    return merged;
  }

  async upsertProfile(updates: Partial<UserProfile>): Promise<void> {
    // Update local first (always available)
    const localStore = new LocalProfileStore();
    await localStore.upsertProfile(updates);

    // Then sync to DB
    const fullProfile = await localStore.getProfile();
    const dbData = this.mapProfileToDb(fullProfile);

    const { error } = await supabase
      .from('profiles')
      .upsert({ user_id: this.userId, ...dbData }, { onConflict: 'user_id' });

    if (error) {
      console.error('Failed to sync profile to DB:', error);
      queueMutation({
        userId: this.userId,
        table: 'profiles',
        operation: 'upsert',
        payload: { user_id: this.userId, ...dbData },
        onConflict: 'user_id',
        lastError: error.message,
      });
      scheduleSyncQueueDrain(1500);
    } else {
      scheduleSyncQueueDrain();
    }
  }

  async markSetupComplete(): Promise<void> {
    const now = new Date().toISOString();

    // Local first - user can proceed even if DB write fails
    const localStore = new LocalProfileStore();
    await localStore.upsertProfile({
      setup_completed_at: now,
      onboardingCompleted: true,
    });

    // Then DB
    const fullProfile = await localStore.getProfile();
    const dbData = this.mapProfileToDb({
      ...fullProfile,
      setup_completed_at: now,
    });

    const { error } = await supabase
      .from('profiles')
      .upsert({ user_id: this.userId, ...dbData }, { onConflict: 'user_id' });

    if (error) {
      console.error('Failed to mark setup complete in DB:', error);
      // Local is already updated, so user won't loop
      queueMutation({
        userId: this.userId,
        table: 'profiles',
        operation: 'upsert',
        payload: { user_id: this.userId, ...dbData },
        onConflict: 'user_id',
        lastError: error.message,
      });
      scheduleSyncQueueDrain(1500);
    } else {
      scheduleSyncQueueDrain();
    }

    debugAuthSimple('SupabaseProfileStore: setup marked complete');
  }

  async isSetupComplete(): Promise<boolean> {
    const profile = await this.getProfile();
    return !!profile.setup_completed_at;
  }

  async clearSetup(): Promise<void> {
    const localStore = new LocalProfileStore();
    await localStore.clearSetup();

    const { error } = await supabase
      .from('profiles')
      .update({
        setup_completed_at: null,
        onboarding_completed: false,
      })
      .eq('user_id', this.userId);

    if (error) {
      console.error('Failed to clear setup in DB:', error);
      queueMutation({
        userId: this.userId,
        table: 'profiles',
        operation: 'update',
        payload: {
          setup_completed_at: null,
          onboarding_completed: false,
        },
        match: { user_id: this.userId },
        lastError: error.message,
      });
      scheduleSyncQueueDrain(1500);
    } else {
      scheduleSyncQueueDrain();
    }

    debugAuthSimple('SupabaseProfileStore: setup cleared');
  }
}

// ─── Factory ────────────────────────────────────────────────────────
export function getProfileStore(userId?: string | null): ProfileStore {
  if (userId) {
    return new SupabaseProfileStore(userId);
  }
  return new LocalProfileStore();
}

// ─── Legacy compat export ───────────────────────────────────────────
// These synchronous wrappers maintain backward compat for components
// that still call the old getProfile/saveProfile API.
export function getProfileSync(): UserProfile {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const raw = JSON.parse(stored) as Record<string, unknown>;
      return migrateProfile(raw);
    }
  } catch (e) {
    console.error('Error reading profile:', e);
  }
  return { ...DEFAULT_PROFILE };
}

export function saveProfileSync(updates: Partial<UserProfile>): void {
  try {
    const current = getProfileSync();
    const updated = { ...current, ...updates };
    updated.onboardingCompleted = !!updated.setup_completed_at;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Error saving profile:', e);
  }
}
