import { getLocalDateKey } from '@/lib/date';

export interface DailyStatusEntry {
  date: string;
  intention: string;
  mood: string | null;
}

const STORAGE_KEY = 'myramadhanku_daily_status';

const getTodayDate = (): string => getLocalDateKey();

const readAll = (): DailyStatusEntry[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as DailyStatusEntry[];
    }
  } catch (e) {
    console.error('Error reading daily status:', e);
  }
  return [];
};

const writeAll = (entries: DailyStatusEntry[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (e) {
    console.error('Error saving daily status:', e);
  }
};

export const getDailyStatus = (date: string = getTodayDate()): DailyStatusEntry => {
  const all = readAll();
  const existing = all.find(entry => entry.date === date);
  return existing || { date, intention: '', mood: null };
};

export const saveDailyStatus = (entry: DailyStatusEntry): void => {
  const all = readAll();
  const index = all.findIndex(item => item.date === entry.date);
  if (index >= 0) {
    all[index] = entry;
  } else {
    all.unshift(entry);
  }
  writeAll(all);
};
