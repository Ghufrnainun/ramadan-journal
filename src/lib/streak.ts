export interface StreakData {
  activeDays: string[];
  reflectionDays: string[];
}

const STORAGE_KEY = "myramadhanku_streak";

const getTodayDate = (): string => new Date().toISOString().split("T")[0];

const readStreak = (): StreakData => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as StreakData;
      return {
        activeDays: Array.isArray(parsed.activeDays) ? parsed.activeDays : [],
        reflectionDays: Array.isArray(parsed.reflectionDays)
          ? parsed.reflectionDays
          : [],
      };
    }
  } catch (e) {
    console.error("Error reading streak data:", e);
  }
  return { activeDays: [], reflectionDays: [] };
};

const writeStreak = (data: StreakData) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Error saving streak data:", e);
  }
};

const addUniqueDay = (days: string[], date: string) => {
  if (!days.includes(date)) {
    days.push(date);
  }
};

export const markActiveDay = (date: string = getTodayDate()): void => {
  const data = readStreak();
  addUniqueDay(data.activeDays, date);
  writeStreak(data);
};

export const markReflectionDay = (date: string = getTodayDate()): void => {
  const data = readStreak();
  addUniqueDay(data.reflectionDays, date);
  writeStreak(data);
};

const getRamadanWindow = (
  ramadanStartDate?: string | null,
): { start: Date; end: Date } | null => {
  if (!ramadanStartDate) return null;
  const start = new Date(ramadanStartDate);
  const end = new Date(start);
  end.setDate(end.getDate() + 30);
  return { start, end };
};

const isWithinWindow = (
  dateStr: string,
  window: { start: Date; end: Date } | null,
): boolean => {
  if (!window) return false;
  const date = new Date(dateStr);
  return date >= window.start && date <= window.end;
};

const computeCurrentStreak = (
  dates: string[],
  window: { start: Date; end: Date } | null,
): number => {
  if (!window) return 0;
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const set = new Set(dates.filter((date) => isWithinWindow(date, window)));
  let count = 0;
  const cursor = new Date(todayStr);
  while (true) {
    const key = cursor.toISOString().split("T")[0];
    if (!set.has(key)) break;
    count += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return count;
};

export const getStreakSummary = (ramadanStartDate?: string | null) => {
  const data = readStreak();
  const window = getRamadanWindow(ramadanStartDate);
  const activeInRamadan = data.activeDays.filter((date) =>
    isWithinWindow(date, window),
  );
  const reflectionInRamadan = data.reflectionDays.filter((date) =>
    isWithinWindow(date, window),
  );

  return {
    activeDays: activeInRamadan.length,
    reflectionDays: reflectionInRamadan.length,
    currentActiveStreak: computeCurrentStreak(data.activeDays, window),
    currentReflectionStreak: computeCurrentStreak(data.reflectionDays, window),
  };
};
