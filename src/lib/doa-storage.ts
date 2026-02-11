/**
 * Doa & Dhikr Storage Helper
 * Stores user progress for doa/dhikr from API
 */

import { getLocalDateKey } from '@/lib/date';

export interface DoaSession {
  doaId: number;
  count: number;
  target: number;
  date: string; // ISO date string (YYYY-MM-DD)
}

const STORAGE_KEY = 'myramadhanku_doa';

const getTodayDate = (): string => {
  return getLocalDateKey();
};

export const getDoaSessions = (): DoaSession[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const sessions: DoaSession[] = JSON.parse(stored);
      const today = getTodayDate();
      return sessions.filter(s => s.date === today);
    }
  } catch (e) {
    console.error('Error reading doa sessions:', e);
  }
  return [];
};

export const saveDoaSession = (session: DoaSession): void => {
  try {
    const allSessions = getAllDoaSessions();
    const existingIndex = allSessions.findIndex(
      s => s.doaId === session.doaId && s.date === session.date
    );
    
    if (existingIndex >= 0) {
      allSessions[existingIndex] = session;
    } else {
      allSessions.push(session);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allSessions));
  } catch (e) {
    console.error('Error saving doa session:', e);
  }
};

export const getAllDoaSessions = (): DoaSession[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Error reading all doa sessions:', e);
  }
  return [];
};

export const getDoaSessionById = (doaId: number): DoaSession | null => {
  const today = getTodayDate();
  const sessions = getDoaSessions();
  return sessions.find(s => s.doaId === doaId && s.date === today) || null;
};
