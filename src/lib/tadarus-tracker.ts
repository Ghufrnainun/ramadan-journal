import type { Json } from '@/integrations/supabase/types';

type TadarusMeta = {
  surahNumber?: number | null;
  ayahNumber?: number | null;
  pageNumber?: number | null;
  juzNumber?: number | null;
  lastReadAt?: string | null;
};

const isRecord = (value: unknown): value is Record<string, Json> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

export const asJsonRecord = (value: unknown): Record<string, Json> =>
  isRecord(value) ? value : {};

export const isTadarusDoneFromItems = (value: unknown): boolean => {
  const items = asJsonRecord(value);
  return Boolean(items.tadarus_done) || Boolean(items.tadarus);
};

export const withTadarusDoneItems = (
  currentItems: unknown,
  meta?: TadarusMeta,
): Record<string, Json> => {
  const base = asJsonRecord(currentItems);
  return {
    ...base,
    tadarus_done: true,
    tadarus: true,
    ...(meta?.surahNumber ? { tadarus_surah_number: meta.surahNumber } : {}),
    ...(meta?.ayahNumber ? { tadarus_ayah_number: meta.ayahNumber } : {}),
    ...(meta?.pageNumber ? { tadarus_page_number: meta.pageNumber } : {}),
    ...(meta?.juzNumber ? { tadarus_juz_number: meta.juzNumber } : {}),
    ...(meta?.lastReadAt ? { tadarus_last_read_at: meta.lastReadAt } : {}),
  };
};
