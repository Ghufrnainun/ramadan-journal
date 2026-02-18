import { getLocalDateKey } from '@/lib/date';

export type MemorizationStatus = 'not_started' | 'learning' | 'memorized';

export interface MemorizationEntry {
  surahNumber: number;
  status: MemorizationStatus;
  lastReviewedAt?: string;
  updatedAt: string;
}

export interface MemorizationSummary {
  total: number;
  notStarted: number;
  learning: number;
  memorized: number;
  reviewedToday: number;
}

const STORAGE_KEY = 'myramadhanku_juz30_memorization';

type ProgressMap = Record<number, MemorizationEntry>;

const parseStoredProgress = (value: string | null): ProgressMap => {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value) as ProgressMap;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (error) {
    console.error('Error reading Juz 30 memorization progress:', error);
    return {};
  }
};

export const getJuz30MemorizationProgress = (): ProgressMap =>
  parseStoredProgress(localStorage.getItem(STORAGE_KEY));

const saveProgressMap = (progress: ProgressMap): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (error) {
    console.error('Error saving Juz 30 memorization progress:', error);
  }
};

export const upsertMemorizationStatus = (
  surahNumber: number,
  status: MemorizationStatus,
): ProgressMap => {
  const progress = getJuz30MemorizationProgress();
  const existing = progress[surahNumber];
  progress[surahNumber] = {
    surahNumber,
    status,
    lastReviewedAt: existing?.lastReviewedAt,
    updatedAt: new Date().toISOString(),
  };
  saveProgressMap(progress);
  return progress;
};

export const markMemorizationReviewedToday = (surahNumber: number): ProgressMap => {
  const progress = getJuz30MemorizationProgress();
  const existing = progress[surahNumber];
  progress[surahNumber] = {
    surahNumber,
    status: existing?.status ?? 'learning',
    lastReviewedAt: getLocalDateKey(),
    updatedAt: new Date().toISOString(),
  };
  saveProgressMap(progress);
  return progress;
};

export const clearJuz30MemorizationProgress = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing Juz 30 memorization progress:', error);
  }
};

export const getMemorizationStatus = (
  progress: ProgressMap,
  surahNumber: number,
): MemorizationStatus => progress[surahNumber]?.status ?? 'not_started';

export const getJuz30MemorizationSummary = (
  totalSurahs: number,
  progress: ProgressMap,
): MemorizationSummary => {
  const entries = Object.values(progress);
  const today = getLocalDateKey();

  const memorized = entries.filter((entry) => entry.status === 'memorized').length;
  const learning = entries.filter((entry) => entry.status === 'learning').length;
  const notStarted = totalSurahs - memorized - learning;
  const reviewedToday = entries.filter((entry) => entry.lastReviewedAt === today).length;

  return {
    total: totalSurahs,
    memorized,
    learning,
    notStarted,
    reviewedToday,
  };
};
