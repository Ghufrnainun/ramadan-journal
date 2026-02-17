import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/runtime-client';
import type { Tables } from '@/integrations/supabase/types';
import type { Json } from '@/integrations/supabase/types';
import { getLocalDateKey } from '@/lib/date';
import {
  getScopedCacheKey,
  queueMutation,
  readOfflineCache,
  scheduleSyncQueueDrain,
  writeOfflineCache,
} from '@/lib/offline-sync';

type DailyTrackerRow = Tables<'daily_tracker'>;

export const useDailyTracker = (date?: string) => {
  const queryClient = useQueryClient();
  const targetDate = date || getLocalDateKey();

  const { data: tracker, isLoading, error } = useQuery({
    queryKey: ['dailyTracker', targetDate],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const cacheKey = getScopedCacheKey(`daily_tracker:${targetDate}`, user?.id);
      const cached = readOfflineCache<DailyTrackerRow | null>(cacheKey, null);
      if (!user) return cached;

      try {
        const { data, error } = await supabase
          .from('daily_tracker')
          .select('*')
          .eq('user_id', user.id)
          .eq('date', targetDate)
          .maybeSingle();

        if (error) throw error;
        const next = (data as DailyTrackerRow) ?? null;
        writeOfflineCache(cacheKey, next);
        scheduleSyncQueueDrain();
        return next;
      } catch {
        return cached;
      }
    },
  });

  const upsertTracker = useMutation({
    mutationFn: async (update: {
      items?: Record<string, Json>;
      notes?: Record<string, Json>;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const cacheKey = getScopedCacheKey(`daily_tracker:${targetDate}`, user.id);
      const cached = readOfflineCache<DailyTrackerRow | null>(cacheKey, null);
      const optimistic = {
        ...(cached ?? {}),
        user_id: user.id,
        date: targetDate,
        ...update,
      } as DailyTrackerRow;
      writeOfflineCache(cacheKey, optimistic);
      queryClient.setQueryData(['dailyTracker', targetDate], optimistic);

      try {
        const { data, error } = await supabase
          .from('daily_tracker')
          .upsert({
            user_id: user.id,
            date: targetDate,
            ...update,
          }, { onConflict: 'user_id,date' })
          .select()
          .single();

        if (error) throw error;
        writeOfflineCache(cacheKey, data);
        scheduleSyncQueueDrain();
        return data;
      } catch (error) {
        queueMutation({
          userId: user.id,
          table: 'daily_tracker',
          operation: 'upsert',
          payload: {
            user_id: user.id,
            date: targetDate,
            ...update,
          },
          onConflict: 'user_id,date',
          lastError: error instanceof Error ? error.message : 'Failed to upsert daily tracker',
        });
        scheduleSyncQueueDrain(1500);
        return optimistic;
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['dailyTracker', targetDate], data);
    },
  });

  return {
    tracker,
    isLoading,
    error,
    upsertTracker: upsertTracker.mutate,
    isUpdating: upsertTracker.isPending,
  };
};
