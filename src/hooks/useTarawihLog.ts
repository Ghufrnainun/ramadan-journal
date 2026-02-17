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

type TarawihRow = Tables<'tarawih_log'>;

const sortByDateDesc = (rows: TarawihRow[]) =>
  [...rows].sort((a, b) => String(b.date ?? '').localeCompare(String(a.date ?? '')));

export const useTarawihLog = () => {
  const queryClient = useQueryClient();

  const { data: logs, isLoading, error } = useQuery({
    queryKey: ['tarawihLog'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const cacheKey = getScopedCacheKey('tarawih_log', user?.id);
      const cached = readOfflineCache<TarawihRow[]>(cacheKey, []);
      if (!user) return cached;

      try {
        const { data, error } = await supabase
          .from('tarawih_log')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false });

        if (error) throw error;
        const next = (data ?? []) as TarawihRow[];
        writeOfflineCache(cacheKey, next);
        scheduleSyncQueueDrain();
        return next;
      } catch {
        return cached;
      }
    },
  });

  const upsertTarawihLog = useMutation({
    mutationFn: async (entry: {
      date: string;
      tarawih_done?: boolean;
      rakaat_count?: number;
      witir_done?: boolean;
      witir_rakaat?: number;
      mosque_name?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const cacheKey = getScopedCacheKey('tarawih_log', user.id);
      const current = readOfflineCache<TarawihRow[]>(cacheKey, []);
      const existing = current.find((row) => row.date === entry.date);
      const optimistic = {
        ...(existing ?? {}),
        id: existing?.id ?? crypto.randomUUID(),
        user_id: user.id,
        ...entry,
      } as TarawihRow;
      const optimisticRows = sortByDateDesc([
        optimistic,
        ...current.filter((row) => row.date !== entry.date),
      ]);
      writeOfflineCache(cacheKey, optimisticRows);
      queryClient.setQueryData(['tarawihLog'], optimisticRows);

      try {
        const { data, error } = await supabase
          .from('tarawih_log')
          .upsert(optimistic as any, { onConflict: 'user_id,date' })
          .select()
          .single();

        if (error) throw error;
        const serverRows = sortByDateDesc([
          data as TarawihRow,
          ...optimisticRows.filter((row) => row.date !== entry.date),
        ]);
        writeOfflineCache(cacheKey, serverRows);
        scheduleSyncQueueDrain();
        return data;
      } catch (error) {
        queueMutation({
          userId: user.id,
          table: 'tarawih_log',
          operation: 'upsert',
          payload: optimistic as any,
          onConflict: 'user_id,date',
          lastError: error instanceof Error ? error.message : 'Failed to upsert tarawih log',
        });
        scheduleSyncQueueDrain(1500);
        return optimistic;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tarawihLog'] });
    },
  });

  const deleteTarawihLog = useMutation({
    mutationFn: async (id: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const cacheKey = getScopedCacheKey('tarawih_log', user.id);
      const current = readOfflineCache<TarawihRow[]>(cacheKey, []);
      const optimistic = current.filter((row) => row.id !== id);
      writeOfflineCache(cacheKey, optimistic);
      queryClient.setQueryData(['tarawihLog'], optimistic);

      try {
        const { error } = await supabase
          .from('tarawih_log')
          .delete()
          .eq('id', id);

        if (error) throw error;
        scheduleSyncQueueDrain();
      } catch (error) {
        queueMutation({
          userId: user.id,
          table: 'tarawih_log',
          operation: 'delete',
          match: { id },
          lastError: error instanceof Error ? error.message : 'Failed to delete tarawih log',
        });
        scheduleSyncQueueDrain(1500);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tarawihLog'] });
    },
  });

  return {
    logs,
    isLoading,
    error,
    upsertTarawihLog: upsertTarawihLog.mutate,
    deleteTarawihLog: deleteTarawihLog.mutate,
    isUpdating: upsertTarawihLog.isPending || deleteTarawihLog.isPending,
  };
};
