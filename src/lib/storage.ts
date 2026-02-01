/**
 * Local Storage Helper for Guest Mode
 * Stores all user preferences and data locally
 */

export interface UserProfile {
  language: 'id' | 'en';
  location: {
    city: string;
    province: string;
  } | null;
  ramadanStartDate: string | null; // ISO date string
  focusModules: string[];
  reminders: {
    sahur: boolean;
    iftar: boolean;
    prayer: boolean;
    reflection: boolean;
  };
  onboardingCompleted: boolean;
}

const STORAGE_KEY = 'myramadhanku_profile';

const DEFAULT_PROFILE: UserProfile = {
  language: 'id',
  location: null,
  ramadanStartDate: null,
  focusModules: ['prayer', 'quran', 'dhikr', 'tracker', 'reflection'],
  reminders: {
    sahur: false,
    iftar: false,
    prayer: false,
    reflection: false,
  },
  onboardingCompleted: false,
};

export const getProfile = (): UserProfile => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_PROFILE, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.error('Error reading profile:', e);
  }
  return DEFAULT_PROFILE;
};

export const saveProfile = (profile: Partial<UserProfile>): void => {
  try {
    const current = getProfile();
    const updated = { ...current, ...profile };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Error saving profile:', e);
  }
};

export const clearProfile = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Error clearing profile:', e);
  }
};
