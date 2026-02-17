import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/runtime-client';
import type { Tables } from '@/integrations/supabase/types';
import {
  getScopedCacheKey,
  queueMutation,
  readOfflineCache,
  scheduleSyncQueueDrain,
  writeOfflineCache,
} from '@/lib/offline-sync';

type FastingRow = Tables<'fasting_log'>;

const sortByDateDesc = (rows: FastingRow[]) =>
  [...rows].sort((a, b) => String(b.date ?? '').localeCompare(String(a.date ?? '')));

export const useFastingLog = () => {
  const queryClient = useQueryClient();

  const { data: logs, isLoading, error } = useQuery({
    queryKey: ['fastingLog'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const cacheKey = getScopedCacheKey('fasting_log', user?.id);
      const cached = readOfflineCache<FastingRow[]>(cacheKey, []);
      if (!user) return cached;

      try {
        const { data, error } = await supabase
          .from('fasting_log')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false });

        if (error) throw error;
        const next = (data ?? []) as FastingRow[];
        writeOfflineCache(cacheKey, next);
        scheduleSyncQueueDrain();
        return next;
      } catch {
        return cached;
      }
    },
  });

  const upsertFastingLog = useMutation({
    mutationFn: async (entry: { date: string; status: string; notes?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const cacheKey = getScopedCacheKey('fasting_log', user.id);
      const current = readOfflineCache<FastingRow[]>(cacheKey, []);
      const existing = current.find((row) => row.date === entry.date);
      const optimistic = {
        ...(existing ?? {}),
        id: existing?.id ?? crypto.randomUUID(),
        user_id: user.id,
        ...entry,
      } as FastingRow;
      const optimisticRows = sortByDateDesc([
        optimistic,
        ...current.filter((row) => row.date !== entry.date),
      ]);
      writeOfflineCache(cacheKey, optimisticRows);
      queryClient.setQueryData(['fastingLog'], optimisticRows);

      try {
        const { data, error } = await supabase
          .from('fasting_log')
          .upsert(optimistic as any, { onConflict: 'user_id,date' })
          .select()
          .single();

        if (error) throw error;
        const serverRows = sortByDateDesc([
          data as FastingRow,
          ...optimisticRows.filter((row) => row.date !== entry.date),
        ]);
        writeOfflineCache(cacheKey, serverRows);
        scheduleSyncQueueDrain();
        return data;
      } catch (error) {
        queueMutation({
          userId: user.id,
          table: 'fasting_log',
          operation: 'upsert',
          payload: optimistic as any,
          onConflict: 'user_id,date',
          lastError: error instanceof Error ? error.message : 'Failed to upsert fasting log',
        });
        scheduleSyncQueueDrain(1500);
        return optimistic;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fastingLog'] });
    },
  });

  const deleteFastingLog = useMutation({
    mutationFn: async (id: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const cacheKey = getScopedCacheKey('fasting_log', user.id);
      const current = readOfflineCache<FastingRow[]>(cacheKey, []);
      const optimistic = current.filter((row) => row.id !== id);
      writeOfflineCache(cacheKey, optimistic);
      queryClient.setQueryData(['fastingLog'], optimistic);

      try {
        const { error } = await supabase
          .from('fasting_log')
          .delete()
          .eq('id', id);

        if (error) throw error;
        scheduleSyncQueueDrain();
      } catch (error) {
        queueMutation({
          userId: user.id,
          table: 'fasting_log',
          operation: 'delete',
          match: { id },
          lastError: error instanceof Error ? error.message : 'Failed to delete fasting log',
        });
        scheduleSyncQueueDrain(1500);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fastingLog'] });
    },
  });

  return {
    logs,
    isLoading,
    error,
    upsertFastingLog: upsertFastingLog.mutate,
    deleteFastingLog: deleteFastingLog.mutate,
    isUpdating: upsertFastingLog.isPending || deleteFastingLog.isPending,
  };
};
