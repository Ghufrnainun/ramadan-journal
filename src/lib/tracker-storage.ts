/**
 * Daily Tracker Storage Helper
 * Stores daily checklist progress locally
 */

export interface TrackerItem {
  id: string;
  label: { id: string; en: string };
  icon: string;
  isCustom?: boolean;
  type?: 'check' | 'count';
  target?: number;
}

export interface DailyProgress {
  date: string; // ISO date string (YYYY-MM-DD)
  items: Record<string, boolean>;
  notes: Record<string, string>;
  counts: Record<string, number>;
}

export const DEFAULT_TRACKER_ITEMS: TrackerItem[] = [
  {
    id: 'shalat',
    label: { id: 'Shalat Tepat Waktu', en: 'Pray on Time' },
    icon: 'clock',
    type: 'check',
  },
  {
    id: 'tadarus',
    label: { id: 'Tadarus Al-Quran', en: 'Quran Reading' },
    icon: 'book-open',
    type: 'check',
  },
  {
    id: 'dzikir',
    label: { id: 'Dzikir Pagi/Petang', en: 'Morning/Evening Dhikr' },
    icon: 'heart',
    type: 'check',
  },
  {
    id: 'sedekah',
    label: { id: 'Sedekah', en: 'Charity' },
    icon: 'hand-heart',
    type: 'check',
  },
  {
    id: 'lisan',
    label: { id: 'Menjaga Lisan', en: 'Guard Your Tongue' },
    icon: 'message-circle',
    type: 'check',
  },
];

const STORAGE_KEY = 'myramadhanku_tracker';
const CUSTOM_ITEMS_KEY = 'myramadhanku_tracker_items';

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

export const getCustomTrackerItems = (): TrackerItem[] => {
  try {
    const stored = localStorage.getItem(CUSTOM_ITEMS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as TrackerItem[];
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch (e) {
    console.error('Error reading tracker items:', e);
  }
  return [];
};

export const saveCustomTrackerItem = (item: TrackerItem): void => {
  try {
    const current = getCustomTrackerItems();
    localStorage.setItem(CUSTOM_ITEMS_KEY, JSON.stringify([{ ...item, isCustom: true }, ...current]));
  } catch (e) {
    console.error('Error saving tracker item:', e);
  }
};

export const deleteCustomTrackerItem = (itemId: string): void => {
  try {
    const next = getCustomTrackerItems().filter(item => item.id !== itemId);
    localStorage.setItem(CUSTOM_ITEMS_KEY, JSON.stringify(next));
  } catch (e) {
    console.error('Error deleting tracker item:', e);
  }
};

export const getTrackerItems = (): TrackerItem[] => {
  return [...DEFAULT_TRACKER_ITEMS, ...getCustomTrackerItems()];
};

export const getTodayProgress = (): DailyProgress => {
  const today = getTodayDate();
  const allProgress = getAllProgress();
  const existing = allProgress.find(p => p.date === today);
  
  if (existing) {
    return {
      ...existing,
      counts: existing.counts || {},
    };
  }
  
  // Return empty progress for today
  return {
    date: today,
    items: {},
    notes: {},
    counts: {},
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

export const incrementCount = (itemId: string, step: number = 1): DailyProgress => {
  const progress = getTodayProgress();
  const current = progress.counts[itemId] || 0;
  progress.counts[itemId] = current + step;
  saveProgress(progress);
  return progress;
};

export const resetCount = (itemId: string): DailyProgress => {
  const progress = getTodayProgress();
  progress.counts[itemId] = 0;
  saveProgress(progress);
  return progress;
};

export const getCompletedCount = (): number => {
  const progress = getTodayProgress();
  const items = getTrackerItems();
  return items.filter(item => {
    if (item.type === 'count') {
      const target = item.target || 33;
      return (progress.counts[item.id] || 0) >= target;
    }
    return !!progress.items[item.id];
  }).length;
};

export const getTotalItems = (): number => {
  return getTrackerItems().length;
};
