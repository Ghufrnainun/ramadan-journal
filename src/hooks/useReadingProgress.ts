import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/runtime-client';
import type { Json, Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { getLocalDateKey } from '@/lib/date';
import { asJsonRecord, withTadarusDoneItems } from '@/lib/tadarus-tracker';
import {
  getScopedCacheKey,
  queueMutation,
  readOfflineCache,
  scheduleSyncQueueDrain,
  writeOfflineCache,
} from '@/lib/offline-sync';

type ReadingProgressRow = Tables<'reading_progress'>;
type DailyTrackerRow = Tables<'daily_tracker'>;
type ReadingProgressInsert = TablesInsert<'reading_progress'>;
type ReadingProgressUpdate = TablesUpdate<'reading_progress'>;
type DailyTrackerInsert = TablesInsert<'daily_tracker'>;

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
      const targetDate = entry.date || getLocalDateKey();
      const dailyTrackerCacheKey = getScopedCacheKey(
        `daily_tracker:${targetDate}`,
        user.id,
      );
      const optimistic = {
        id: crypto.randomUUID(),
        user_id: user.id,
        date: targetDate,
        surah_number: entry.surah_number,
        ayah_number: entry.ayah_number,
        page_number: entry.page_number ?? null,
        juz_number: entry.juz_number ?? null,
        daily_target_pages: entry.daily_target_pages ?? null,
        created_at: new Date().toISOString(),
      } as ReadingProgressRow;
      writeOfflineCache(cacheKey, optimistic);
      queryClient.setQueryData(['readingProgress'], optimistic);

      const syncDailyTrackerFromReading = async () => {
        const cachedDailyTracker = readOfflineCache<DailyTrackerRow | null>(
          dailyTrackerCacheKey,
          null,
        );
        const nextItems = withTadarusDoneItems(cachedDailyTracker?.items, {
          surahNumber: optimistic.surah_number,
          ayahNumber: optimistic.ayah_number,
          pageNumber: optimistic.page_number,
          juzNumber: optimistic.juz_number,
          lastReadAt: optimistic.created_at,
        });
        const optimisticTracker = {
          ...(cachedDailyTracker ?? {}),
          user_id: user.id,
          date: targetDate,
          items: nextItems,
          notes: cachedDailyTracker?.notes ?? {},
        } as DailyTrackerRow;
        writeOfflineCache(dailyTrackerCacheKey, optimisticTracker);
        queryClient.setQueryData(['dailyTracker', targetDate], optimisticTracker);

        try {
          const { data: existingTracker, error: existingError } = await supabase
            .from('daily_tracker')
            .select('id, items, notes')
            .eq('user_id', user.id)
            .eq('date', targetDate)
            .maybeSingle();
          if (existingError) throw existingError;

          const mergedItems = {
            ...asJsonRecord(existingTracker?.items),
            ...nextItems,
          };
          const payload: DailyTrackerInsert = {
            id: existingTracker?.id,
            user_id: user.id,
            date: targetDate,
            items: mergedItems,
            notes: existingTracker?.notes ?? cachedDailyTracker?.notes ?? {},
          };
          const { data: trackerData, error: trackerError } = await supabase
            .from('daily_tracker')
            .upsert(payload, { onConflict: 'user_id,date' })
            .select()
            .single();
          if (trackerError) throw trackerError;

          writeOfflineCache(dailyTrackerCacheKey, trackerData);
          queryClient.setQueryData(['dailyTracker', targetDate], trackerData);
          scheduleSyncQueueDrain();
        } catch (error) {
          queueMutation({
            userId: user.id,
            table: 'daily_tracker',
            operation: 'upsert',
            payload: {
              user_id: user.id,
              date: targetDate,
              items: nextItems,
              notes: cachedDailyTracker?.notes ?? {},
            },
            onConflict: 'user_id,date',
            lastError:
              error instanceof Error
                ? error.message
                : 'Failed to sync tadarus daily tracker',
          });
          scheduleSyncQueueDrain(1500);
        }
      };

      try {
        const { data, error } = await supabase
          .from('reading_progress')
          .insert(optimistic as ReadingProgressInsert)
          .select()
          .single();

        if (error) throw error;
        writeOfflineCache(cacheKey, data);
        await syncDailyTrackerFromReading();
        scheduleSyncQueueDrain();
        return data;
      } catch (error) {
        queueMutation({
          userId: user.id,
          table: 'reading_progress',
          operation: 'insert',
          payload: optimistic as ReadingProgressInsert,
          lastError: error instanceof Error ? error.message : 'Failed to record reading progress',
        });
        await syncDailyTrackerFromReading();
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
      const optimistic = {
        ...(current ?? { id: update.id, user_id: user.id }),
        ...update,
      } as ReadingProgressRow;
      writeOfflineCache(cacheKey, optimistic);
      queryClient.setQueryData(['readingProgress'], optimistic);

      const payload: ReadingProgressUpdate = {
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
