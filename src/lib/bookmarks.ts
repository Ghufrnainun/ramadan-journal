export type BookmarkType = 'quote' | 'ayah' | 'doa' | 'dhikr' | 'reflection';

export interface BookmarkItem {
  id: string;
  type: BookmarkType;
  title: string;
  subtitle?: string;
  content?: string;
  source?: string;
  metadata?: Record<string, string>;
  createdAt: string;
}

const STORAGE_KEY = 'myramadhanku_bookmarks';

const readBookmarks = (): BookmarkItem[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as BookmarkItem[];
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch (e) {
    console.error('Error reading bookmarks:', e);
  }
  return [];
};

const writeBookmarks = (items: BookmarkItem[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Error saving bookmarks:', e);
  }
};

export const getBookmarks = (): BookmarkItem[] => readBookmarks();

export const getBookmarksByType = (type: BookmarkType): BookmarkItem[] => {
  return readBookmarks().filter(item => item.type === type);
};

export const isBookmarked = (type: BookmarkType, id: string): boolean => {
  return readBookmarks().some(item => item.type === type && item.id === id);
};

export const addBookmark = (item: BookmarkItem): void => {
  const items = readBookmarks();
  if (items.some(existing => existing.type === item.type && existing.id === item.id)) {
    return;
  }
  writeBookmarks([item, ...items]);
};

export const removeBookmark = (type: BookmarkType, id: string): void => {
  const items = readBookmarks().filter(item => !(item.type === type && item.id === id));
  writeBookmarks(items);
};

export const toggleBookmark = (item: BookmarkItem): boolean => {
  const items = readBookmarks();
  const exists = items.some(existing => existing.type === item.type && existing.id === item.id);
  if (exists) {
    writeBookmarks(items.filter(existing => !(existing.type === item.type && existing.id === item.id)));
    return false;
  }
  writeBookmarks([item, ...items]);
  return true;
};
