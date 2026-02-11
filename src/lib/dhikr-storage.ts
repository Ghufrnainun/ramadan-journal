/**
 * Dhikr Storage Helper
 * Stores dhikr counts and sessions locally
 */

import { getLocalDateKey } from '@/lib/date';

export interface DhikrPreset {
  id: string;
  arabic: string;
  transliteration: string;
  meaning: { id: string; en: string };
  defaultTarget: number;
  isCustom?: boolean;
}

export interface DhikrSession {
  presetId: string;
  count: number;
  target: number;
  date: string; // ISO date string (YYYY-MM-DD)
}

export const DHIKR_PRESETS: DhikrPreset[] = [
  {
    id: 'subhanallah',
    arabic: 'سُبْحَانَ اللهِ',
    transliteration: 'SubhanAllah',
    meaning: { id: 'Maha Suci Allah', en: 'Glory be to Allah' },
    defaultTarget: 33,
  },
  {
    id: 'alhamdulillah',
    arabic: 'الْحَمْدُ لِلَّهِ',
    transliteration: 'Alhamdulillah',
    meaning: { id: 'Segala puji bagi Allah', en: 'All praise is due to Allah' },
    defaultTarget: 33,
  },
  {
    id: 'allahuakbar',
    arabic: 'اللهُ أَكْبَرُ',
    transliteration: 'Allahu Akbar',
    meaning: { id: 'Allah Maha Besar', en: 'Allah is the Greatest' },
    defaultTarget: 33,
  },
  {
    id: 'lailahaillallah',
    arabic: 'لَا إِلٰهَ إِلَّا اللهُ',
    transliteration: 'La ilaha illallah',
    meaning: { id: 'Tiada Tuhan selain Allah', en: 'There is no god but Allah' },
    defaultTarget: 100,
  },
  {
    id: 'astaghfirullah',
    arabic: 'أَسْتَغْفِرُ اللهَ',
    transliteration: 'Astaghfirullah',
    meaning: { id: 'Aku memohon ampunan Allah', en: 'I seek forgiveness from Allah' },
    defaultTarget: 100,
  },
  {
    id: 'salawat',
    arabic: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ',
    transliteration: 'Allahumma salli \'ala Muhammad',
    meaning: { id: 'Ya Allah, limpahkan shalawat kepada Muhammad', en: 'O Allah, send blessings upon Muhammad' },
    defaultTarget: 100,
  },
];

const STORAGE_KEY = 'myramadhanku_dhikr';
const PRESETS_KEY = 'myramadhanku_dhikr_presets';

const getTodayDate = (): string => {
  return getLocalDateKey();
};

export const getDhikrSessions = (): DhikrSession[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const sessions: DhikrSession[] = JSON.parse(stored);
      // Filter only today's sessions
      const today = getTodayDate();
      return sessions.filter(s => s.date === today);
    }
  } catch (e) {
    console.error('Error reading dhikr sessions:', e);
  }
  return [];
};

export const getCustomDhikrPresets = (): DhikrPreset[] => {
  try {
    const stored = localStorage.getItem(PRESETS_KEY);
    if (stored) {
      const presets = JSON.parse(stored) as DhikrPreset[];
      return Array.isArray(presets) ? presets : [];
    }
  } catch (e) {
    console.error('Error reading dhikr presets:', e);
  }
  return [];
};

export const saveCustomDhikrPreset = (preset: DhikrPreset): void => {
  try {
    const current = getCustomDhikrPresets();
    const updated = [{ ...preset, isCustom: true }, ...current];
    localStorage.setItem(PRESETS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Error saving dhikr preset:', e);
  }
};

export const deleteCustomDhikrPreset = (presetId: string): void => {
  try {
    const current = getCustomDhikrPresets().filter(p => p.id !== presetId);
    localStorage.setItem(PRESETS_KEY, JSON.stringify(current));
  } catch (e) {
    console.error('Error deleting dhikr preset:', e);
  }
};

export const getDhikrPresets = (): DhikrPreset[] => {
  return [...DHIKR_PRESETS, ...getCustomDhikrPresets()];
};

export const saveDhikrSession = (session: DhikrSession): void => {
  try {
    const allSessions = getAllDhikrSessions();
    const existingIndex = allSessions.findIndex(
      s => s.presetId === session.presetId && s.date === session.date
    );
    
    if (existingIndex >= 0) {
      allSessions[existingIndex] = session;
    } else {
      allSessions.push(session);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allSessions));
  } catch (e) {
    console.error('Error saving dhikr session:', e);
  }
};

export const getAllDhikrSessions = (): DhikrSession[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Error reading all dhikr sessions:', e);
  }
  return [];
};

export const getDhikrSessionForPreset = (presetId: string): DhikrSession | null => {
  const today = getTodayDate();
  const sessions = getDhikrSessions();
  return sessions.find(s => s.presetId === presetId && s.date === today) || null;
};

export const resetDailyDhikr = (): void => {
  try {
    const allSessions = getAllDhikrSessions();
    const today = getTodayDate();
    const filtered = allSessions.filter(s => s.date !== today);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.error('Error resetting daily dhikr:', e);
  }
};
