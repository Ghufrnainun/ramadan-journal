import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/runtime-client';
import type { Tables } from '@/integrations/supabase/types';
import { getLocalDateKey } from '@/lib/date';
import {
  getScopedCacheKey,
  queueMutation,
  readOfflineCache,
  scheduleSyncQueueDrain,
  writeOfflineCache,
} from '@/lib/offline-sync';

type DhikrSessionRow = Tables<'dhikr_sessions'>;

const sortByCreatedDesc = (rows: DhikrSessionRow[]) =>
  [...rows].sort((a, b) => String(b.created_at ?? '').localeCompare(String(a.created_at ?? '')));

export const useDhikrSessions = (date?: string) => {
  const queryClient = useQueryClient();
  const targetDate = date || getLocalDateKey();

  const { data: sessions, isLoading, error } = useQuery({
    queryKey: ['dhikrSessions', targetDate],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const cacheKey = getScopedCacheKey(`dhikr_sessions:${targetDate}`, user?.id);
      const cached = readOfflineCache<DhikrSessionRow[]>(cacheKey, []);
      if (!user) return cached;

      try {
        const { data, error } = await supabase
          .from('dhikr_sessions')
          .select('*')
          .eq('user_id', user.id)
          .eq('date', targetDate)
          .order('created_at', { ascending: false });

        if (error) throw error;
        const next = (data ?? []) as DhikrSessionRow[];
        writeOfflineCache(cacheKey, next);
        scheduleSyncQueueDrain();
        return next;
      } catch {
        return cached;
      }
    },
  });

  const upsertDhikrSession = useMutation({
    mutationFn: async (session: {
      preset_id: string;
      target?: number;
      count?: number;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const cacheKey = getScopedCacheKey(`dhikr_sessions:${targetDate}`, user.id);
      const current = readOfflineCache<DhikrSessionRow[]>(cacheKey, []);
      const existing = current.find((row) => row.preset_id === session.preset_id);
      const optimistic = {
        ...(existing ?? {}),
        id: existing?.id ?? crypto.randomUUID(),
        user_id: user.id,
        date: targetDate,
        ...session,
      } as DhikrSessionRow;
      const optimisticRows = sortByCreatedDesc([
        optimistic,
        ...current.filter((row) => row.preset_id !== session.preset_id),
      ]);
      writeOfflineCache(cacheKey, optimisticRows);
      queryClient.setQueryData(['dhikrSessions', targetDate], optimisticRows);

      try {
        const { data, error } = await supabase
          .from('dhikr_sessions')
          .upsert(optimistic as any, { onConflict: 'user_id,preset_id,date' })
          .select()
          .single();

        if (error) throw error;
        const serverRows = sortByCreatedDesc([
          data as DhikrSessionRow,
          ...optimisticRows.filter((row) => row.preset_id !== session.preset_id),
        ]);
        writeOfflineCache(cacheKey, serverRows);
        scheduleSyncQueueDrain();
        return data;
      } catch (error) {
        queueMutation({
          userId: user.id,
          table: 'dhikr_sessions',
          operation: 'upsert',
          payload: optimistic as any,
          onConflict: 'user_id,preset_id,date',
          lastError: error instanceof Error ? error.message : 'Failed to upsert dhikr session',
        });
        scheduleSyncQueueDrain(1500);
        return optimistic;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dhikrSessions', targetDate] });
    },
  });

  const deleteDhikrSession = useMutation({
    mutationFn: async (id: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const cacheKey = getScopedCacheKey(`dhikr_sessions:${targetDate}`, user.id);
      const current = readOfflineCache<DhikrSessionRow[]>(cacheKey, []);
      const optimistic = current.filter((row) => row.id !== id);
      writeOfflineCache(cacheKey, optimistic);
      queryClient.setQueryData(['dhikrSessions', targetDate], optimistic);

      try {
        const { error } = await supabase
          .from('dhikr_sessions')
          .delete()
          .eq('id', id);

        if (error) throw error;
        scheduleSyncQueueDrain();
      } catch (error) {
        queueMutation({
          userId: user.id,
          table: 'dhikr_sessions',
          operation: 'delete',
          match: { id },
          lastError: error instanceof Error ? error.message : 'Failed to delete dhikr session',
        });
        scheduleSyncQueueDrain(1500);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dhikrSessions', targetDate] });
    },
  });

  return {
    sessions,
    isLoading,
    error,
    upsertDhikrSession: upsertDhikrSession.mutate,
    deleteDhikrSession: deleteDhikrSession.mutate,
    isUpdating: upsertDhikrSession.isPending || deleteDhikrSession.isPending,
  };
};
