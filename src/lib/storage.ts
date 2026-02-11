/**
 * Local Storage Helper — Legacy compat wrapper.
 *
 * All new code should use ProfileStore from profile-store.ts.
 * This file is kept for backward compat with components that
 * still import getProfile/saveProfile synchronously.
 */

import { getProfileSync, saveProfileSync } from './profile-store';
import type { UserProfile } from './profile-store';

export type { UserProfile };

const STORAGE_KEY = 'myramadhanku_profile';

/**
 * @deprecated Use ProfileStore.getProfile() instead.
 * Synchronous read from localStorage.
 */
export const getProfile = getProfileSync;

/**
 * @deprecated Use ProfileStore.upsertProfile() instead.
 * Synchronous write to localStorage.
 */
export const saveProfile = saveProfileSync;

export const clearProfile = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Error clearing profile:', e);
  }
};
