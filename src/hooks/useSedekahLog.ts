import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/runtime-client';
import {
  getScopedCacheKey,
  queueMutation,
  readOfflineCache,
  scheduleSyncQueueDrain,
  writeOfflineCache,
} from '@/lib/offline-sync';

type SedekahRow = Record<string, unknown>;

const sortByDateDesc = (rows: SedekahRow[]) =>
  [...rows].sort((a, b) => String(b.date ?? '').localeCompare(String(a.date ?? '')));

export const useSedekahLog = () => {
  const queryClient = useQueryClient();

  const { data: logs, isLoading, error } = useQuery({
    queryKey: ['sedekahLog'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const cacheKey = getScopedCacheKey('sedekah_log', user?.id);
      const cached = readOfflineCache<SedekahRow[]>(cacheKey, []);
      if (!user) return cached;

      try {
        const { data, error } = await supabase
          .from('sedekah_log')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false });

        if (error) throw error;
        const next = (data as SedekahRow[]) ?? [];
        writeOfflineCache(cacheKey, next);
        scheduleSyncQueueDrain();
        return next;
      } catch {
        return cached;
      }
    },
  });

  const upsertSedekahLog = useMutation({
    mutationFn: async (entry: { date: string; completed?: boolean; notes?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const cacheKey = getScopedCacheKey('sedekah_log', user.id);
      const current = readOfflineCache<SedekahRow[]>(cacheKey, []);
      const existing = current.find((row) => String(row.date) === entry.date);
      const optimistic: SedekahRow = {
        ...(existing ?? {}),
        id: existing?.id ?? crypto.randomUUID(),
        user_id: user.id,
        ...entry,
      };
      const optimisticRows = sortByDateDesc([
        optimistic,
        ...current.filter((row) => String(row.date) !== entry.date),
      ]);
      writeOfflineCache(cacheKey, optimisticRows);
      queryClient.setQueryData(['sedekahLog'], optimisticRows);

      try {
        const { data, error } = await supabase
          .from('sedekah_log')
          .upsert({
            ...optimistic,
          }, { onConflict: 'user_id,date' })
          .select()
          .single();

        if (error) throw error;
        const serverRows = sortByDateDesc([
          data as SedekahRow,
          ...optimisticRows.filter((row) => String(row.date) !== entry.date),
        ]);
        writeOfflineCache(cacheKey, serverRows);
        scheduleSyncQueueDrain();
        return data;
      } catch (error) {
        queueMutation({
          userId: user.id,
          table: 'sedekah_log',
          operation: 'upsert',
          payload: optimistic,
          onConflict: 'user_id,date',
          lastError: error instanceof Error ? error.message : 'Failed to upsert sedekah log',
        });
        scheduleSyncQueueDrain(1500);
        return optimistic;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sedekahLog'] });
    },
  });

  const deleteSedekahLog = useMutation({
    mutationFn: async (id: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const cacheKey = getScopedCacheKey('sedekah_log', user.id);
      const current = readOfflineCache<SedekahRow[]>(cacheKey, []);
      const optimistic = current.filter((row) => String(row.id) !== id);
      writeOfflineCache(cacheKey, optimistic);
      queryClient.setQueryData(['sedekahLog'], optimistic);

      try {
        const { error } = await supabase
          .from('sedekah_log')
          .delete()
          .eq('id', id);

        if (error) throw error;
        scheduleSyncQueueDrain();
      } catch (error) {
        queueMutation({
          userId: user.id,
          table: 'sedekah_log',
          operation: 'delete',
          match: { id },
          lastError: error instanceof Error ? error.message : 'Failed to delete sedekah log',
        });
        scheduleSyncQueueDrain(1500);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sedekahLog'] });
    },
  });

  return {
    logs,
    isLoading,
    error,
    upsertSedekahLog: upsertSedekahLog.mutate,
    deleteSedekahLog: deleteSedekahLog.mutate,
    isUpdating: upsertSedekahLog.isPending || deleteSedekahLog.isPending,
  };
};

