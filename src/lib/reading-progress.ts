export interface ReadingProgress {
  surahNumber: number;
  ayahNumber: number;
  pageNumber?: number;
  updatedAt: string;
}

export interface ReadingTarget {
  dailyTargetPages: number;
}

const PROGRESS_KEY = 'myramadhanku_reading_progress';
const TARGET_KEY = 'myramadhanku_reading_target';

export const getReadingProgress = (): ReadingProgress | null => {
  try {
    const stored = localStorage.getItem(PROGRESS_KEY);
    if (stored) {
      return JSON.parse(stored) as ReadingProgress;
    }
  } catch (e) {
    console.error('Error reading reading progress:', e);
  }
  return null;
};

export const saveReadingProgress = (progress: Omit<ReadingProgress, 'updatedAt'>): ReadingProgress => {
  const updated: ReadingProgress = {
    ...progress,
    updatedAt: new Date().toISOString(),
  };
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Error saving reading progress:', e);
  }
  return updated;
};

export const getReadingTarget = (): ReadingTarget => {
  try {
    const stored = localStorage.getItem(TARGET_KEY);
    if (stored) {
      return JSON.parse(stored) as ReadingTarget;
    }
  } catch (e) {
    console.error('Error reading reading target:', e);
  }
  return { dailyTargetPages: 20 };
};

export const saveReadingTarget = (target: ReadingTarget): void => {
  try {
    localStorage.setItem(TARGET_KEY, JSON.stringify(target));
  } catch (e) {
    console.error('Error saving reading target:', e);
  }
};
