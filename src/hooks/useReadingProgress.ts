import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/runtime-client';
import { getLocalDateKey } from '@/lib/date';
import {
  getScopedCacheKey,
  queueMutation,
  readOfflineCache,
  scheduleSyncQueueDrain,
  writeOfflineCache,
} from '@/lib/offline-sync';

type ReadingProgressRow = Record<string, unknown>;

const sortByDateDesc = (rows: ReadingProgressRow[]) =>
  [...rows].sort((a, b) => String(b.date ?? '').localeCompare(String(a.date ?? '')));

export const useReadingProgress = () => {
  const queryClient = useQueryClient();

  const { data: progress, isLoading, error } = useQuery({
    queryKey: ['readingProgress'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const cacheKey = getScopedCacheKey('reading_progress', user?.id);
      const cached = readOfflineCache<ReadingProgressRow | null>(cacheKey, null);
      if (!user) return cached;

      try {
        const { data, error } = await supabase
          .from('reading_progress')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) throw error;
        const next = (data as ReadingProgressRow) ?? null;
        writeOfflineCache(cacheKey, next);
        scheduleSyncQueueDrain();
        return next;
      } catch {
        return cached;
      }
    },
  });

  const recordProgress = useMutation({
    mutationFn: async (entry: {
      date?: string;
      surah_number: number;
      ayah_number: number;
      page_number?: number;
      juz_number?: number;
      daily_target_pages?: number;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const cacheKey = getScopedCacheKey('reading_progress', user.id);
      const optimistic: ReadingProgressRow = {
        id: crypto.randomUUID(),
        user_id: user.id,
        date: entry.date || getLocalDateKey(),
        surah_number: entry.surah_number,
        ayah_number: entry.ayah_number,
        page_number: entry.page_number,
        juz_number: entry.juz_number,
        daily_target_pages: entry.daily_target_pages,
      };
      writeOfflineCache(cacheKey, optimistic);
      queryClient.setQueryData(['readingProgress'], optimistic);

      try {
        const { data, error } = await supabase
          .from('reading_progress')
          .insert(optimistic)
          .select()
          .single();

        if (error) throw error;
        writeOfflineCache(cacheKey, data);
        scheduleSyncQueueDrain();
        return data;
      } catch (error) {
        queueMutation({
          userId: user.id,
          table: 'reading_progress',
          operation: 'insert',
          payload: optimistic,
          lastError: error instanceof Error ? error.message : 'Failed to record reading progress',
        });
        scheduleSyncQueueDrain(1500);
        return optimistic;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['readingProgress'] });
    },
  });

  const updateProgress = useMutation({
    mutationFn: async (update: { id: string; surah_number?: number; ayah_number?: number; page_number?: number; juz_number?: number }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const cacheKey = getScopedCacheKey('reading_progress', user.id);
      const current = readOfflineCache<ReadingProgressRow | null>(cacheKey, null);
      const optimistic: ReadingProgressRow = {
        ...(current ?? { id: update.id, user_id: user.id }),
        ...update,
      };
      writeOfflineCache(cacheKey, optimistic);
      queryClient.setQueryData(['readingProgress'], optimistic);

      const payload = {
        surah_number: update.surah_number,
        ayah_number: update.ayah_number,
        page_number: update.page_number,
        juz_number: update.juz_number,
      };

      try {
        const { data, error } = await supabase
          .from('reading_progress')
          .update(payload)
          .eq('id', update.id)
          .select()
          .single();

        if (error) throw error;
        writeOfflineCache(cacheKey, data);
        scheduleSyncQueueDrain();
        return data;
      } catch (error) {
        queueMutation({
          userId: user.id,
          table: 'reading_progress',
          operation: 'update',
          payload,
          match: { id: update.id },
          lastError: error instanceof Error ? error.message : 'Failed to update reading progress',
        });
        scheduleSyncQueueDrain(1500);
        return optimistic;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['readingProgress'] });
    },
  });

  return {
    progress,
    isLoading,
    error,
    recordProgress: recordProgress.mutate,
    updateProgress: updateProgress.mutate,
    isUpdating: recordProgress.isPending || updateProgress.isPending,
  };
};

