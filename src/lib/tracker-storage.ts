/**
 * Daily Tracker Storage Helper
 * Stores daily checklist progress locally
 */

export interface TrackerItem {
  id: string;
  label: { id: string; en: string };
  icon: string;
}

export interface DailyProgress {
  date: string; // ISO date string (YYYY-MM-DD)
  items: Record<string, boolean>;
  notes: Record<string, string>;
}

export const DEFAULT_TRACKER_ITEMS: TrackerItem[] = [
  {
    id: 'shalat',
    label: { id: 'Shalat Tepat Waktu', en: 'Pray on Time' },
    icon: 'clock',
  },
  {
    id: 'tadarus',
    label: { id: 'Tadarus Al-Quran', en: 'Quran Reading' },
    icon: 'book-open',
  },
  {
    id: 'dzikir',
    label: { id: 'Dzikir Pagi/Petang', en: 'Morning/Evening Dhikr' },
    icon: 'heart',
  },
  {
    id: 'sedekah',
    label: { id: 'Sedekah', en: 'Charity' },
    icon: 'hand-heart',
  },
  {
    id: 'lisan',
    label: { id: 'Menjaga Lisan', en: 'Guard Your Tongue' },
    icon: 'message-circle',
  },
];

const STORAGE_KEY = 'myramadhanku_tracker';

const getTodayDate = (): string => {
  return new Date().toISOString().split('T')[0];
};

export const getAllProgress = (): DailyProgress[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Error reading tracker progress:', e);
  }
  return [];
};

export const getTodayProgress = (): DailyProgress => {
  const today = getTodayDate();
  const allProgress = getAllProgress();
  const existing = allProgress.find(p => p.date === today);
  
  if (existing) {
    return existing;
  }
  
  // Return empty progress for today
  return {
    date: today,
    items: {},
    notes: {},
  };
};

export const saveProgress = (progress: DailyProgress): void => {
  try {
    const allProgress = getAllProgress();
    const existingIndex = allProgress.findIndex(p => p.date === progress.date);
    
    if (existingIndex >= 0) {
      allProgress[existingIndex] = progress;
    } else {
      allProgress.push(progress);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allProgress));
  } catch (e) {
    console.error('Error saving tracker progress:', e);
  }
};

export const toggleItem = (itemId: string): DailyProgress => {
  const progress = getTodayProgress();
  progress.items[itemId] = !progress.items[itemId];
  saveProgress(progress);
  return progress;
};

export const updateNote = (itemId: string, note: string): DailyProgress => {
  const progress = getTodayProgress();
  progress.notes[itemId] = note;
  saveProgress(progress);
  return progress;
};

export const getCompletedCount = (): number => {
  const progress = getTodayProgress();
  return Object.values(progress.items).filter(Boolean).length;
};

export const getTotalItems = (): number => {
  return DEFAULT_TRACKER_ITEMS.length;
};
