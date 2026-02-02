export interface ReflectionEntry {
  date: string; // YYYY-MM-DD
  promptId: string;
  promptText: { id: string; en: string };
  content: string;
  mood?: string;
  createdAt: string;
  updatedAt: string;
  completed: boolean;
}

const STORAGE_KEY = 'myramadhanku_reflections';

const getTodayDate = (): string => new Date().toISOString().split('T')[0];

const readAll = (): ReflectionEntry[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as ReflectionEntry[];
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch (e) {
    console.error('Error reading reflections:', e);
  }
  return [];
};

const writeAll = (entries: ReflectionEntry[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (e) {
    console.error('Error saving reflections:', e);
  }
};

export const getReflectionByDate = (date: string = getTodayDate()): ReflectionEntry | null => {
  const all = readAll();
  return all.find(entry => entry.date === date) || null;
};

export const saveReflection = (entry: ReflectionEntry): void => {
  const all = readAll();
  const existingIndex = all.findIndex(item => item.date === entry.date);
  const updatedEntry = { ...entry, updatedAt: new Date().toISOString() };

  if (existingIndex >= 0) {
    all[existingIndex] = updatedEntry;
  } else {
    all.unshift(updatedEntry);
  }
  writeAll(all);
};

export const upsertReflection = (entry: Omit<ReflectionEntry, 'createdAt' | 'updatedAt'>): ReflectionEntry => {
  const existing = getReflectionByDate(entry.date);
  const now = new Date().toISOString();
  const finalEntry: ReflectionEntry = existing
    ? { ...existing, ...entry, updatedAt: now }
    : { ...entry, createdAt: now, updatedAt: now };
  saveReflection(finalEntry);
  return finalEntry;
};

export const getAllReflections = (): ReflectionEntry[] => readAll();

export const markReflectionCompleted = (date: string = getTodayDate()): void => {
  const existing = getReflectionByDate(date);
  if (!existing) return;
  saveReflection({ ...existing, completed: true });
};
