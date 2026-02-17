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

export const useDailyStatus = (date?: string) => {
  const queryClient = useQueryClient();
  const targetDate = date || getLocalDateKey();

  const { data: status, isLoading, error } = useQuery({
    queryKey: ['dailyStatus', targetDate],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const cacheKey = getScopedCacheKey(`daily_status:${targetDate}`, user?.id);
      const cached = readOfflineCache<Record<string, unknown> | null>(cacheKey, null);
      if (!user) return cached;

      try {
        const { data, error } = await supabase
          .from('daily_status')
          .select('*')
          .eq('user_id', user.id)
          .eq('date', targetDate)
          .maybeSingle();

        if (error) throw error;
        const next = data ?? null;
        writeOfflineCache(cacheKey, next);
        scheduleSyncQueueDrain();
        return next;
      } catch {
        return cached;
      }
    },
  });

  const upsertDailyStatus = useMutation({
    mutationFn: async (update: { intention?: string | null; mood?: string | null }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const cacheKey = getScopedCacheKey(`daily_status:${targetDate}`, user.id);
      const optimistic = {
        ...(readOfflineCache<Record<string, unknown> | null>(cacheKey, null) ?? {}),
        user_id: user.id,
        date: targetDate,
        ...update,
      };
      writeOfflineCache(cacheKey, optimistic);
      queryClient.setQueryData(['dailyStatus', targetDate], optimistic);

      try {
        const { data, error } = await supabase
          .from('daily_status')
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
          table: 'daily_status',
          operation: 'upsert',
          payload: {
            user_id: user.id,
            date: targetDate,
            ...update,
          },
          onConflict: 'user_id,date',
          lastError: error instanceof Error ? error.message : 'Failed to upsert daily status',
        });
        scheduleSyncQueueDrain(1500);
        return optimistic;
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['dailyStatus', targetDate], data);
    },
  });

  return {
    status,
    isLoading,
    error,
    upsertDailyStatus: upsertDailyStatus.mutate,
    isUpdating: upsertDailyStatus.isPending,
  };
};
