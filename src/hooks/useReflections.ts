import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/runtime-client';
import type { Json } from '@/integrations/supabase/types';
import { getLocalDateKey } from '@/lib/date';
import {
  getScopedCacheKey,
  queueMutation,
  readOfflineCache,
  scheduleSyncQueueDrain,
  writeOfflineCache,
} from '@/lib/offline-sync';

type ReflectionRow = Record<string, unknown>;

const mergeById = (rows: ReflectionRow[], next: ReflectionRow): ReflectionRow[] => {
  const id = String(next.id ?? '');
  const index = rows.findIndex((row) => String(row.id ?? '') === id);
  if (index < 0) return [next, ...rows];
  const copy = [...rows];
  copy[index] = next;
  return copy;
};

export const useReflections = (date?: string) => {
  const queryClient = useQueryClient();
  const targetDate = date || getLocalDateKey();

  const { data: reflections, isLoading, error } = useQuery({
    queryKey: ['reflections', targetDate],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const cacheKey = getScopedCacheKey(`reflections:${targetDate}`, user?.id);
      const cached = readOfflineCache<ReflectionRow[]>(cacheKey, []);
      if (!user) return cached;

      try {
        const { data, error } = await supabase
          .from('reflections')
          .select('*')
          .eq('user_id', user.id)
          .eq('date', targetDate)
          .order('created_at', { ascending: false });

        if (error) throw error;
        const next = (data as ReflectionRow[]) ?? [];
        writeOfflineCache(cacheKey, next);
        scheduleSyncQueueDrain();
        return next;
      } catch {
        return cached;
      }
    },
  });

  const createReflection = useMutation({
    mutationFn: async (reflection: {
      prompt_id: string;
      prompt_text: Json;
      content: string;
      mood?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const cacheKey = getScopedCacheKey(`reflections:${targetDate}`, user.id);
      const current = readOfflineCache<ReflectionRow[]>(cacheKey, []);
      const optimistic: ReflectionRow = {
        id: crypto.randomUUID(),
        user_id: user.id,
        date: targetDate,
        ...reflection,
        created_at: new Date().toISOString(),
      };
      const optimisticRows = mergeById(current, optimistic);
      writeOfflineCache(cacheKey, optimisticRows);
      queryClient.setQueryData(['reflections', targetDate], optimisticRows);

      try {
        const { data, error } = await supabase
          .from('reflections')
          .insert(optimistic)
          .select()
          .single();

        if (error) throw error;
        const serverRows = mergeById(optimisticRows, data as ReflectionRow);
        writeOfflineCache(cacheKey, serverRows);
        scheduleSyncQueueDrain();
        return data;
      } catch (error) {
        queueMutation({
          userId: user.id,
          table: 'reflections',
          operation: 'insert',
          payload: optimistic,
          lastError: error instanceof Error ? error.message : 'Failed to create reflection',
        });
        scheduleSyncQueueDrain(1500);
        return optimistic;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reflections', targetDate] });
    },
  });

  const updateReflection = useMutation({
    mutationFn: async (update: { id: string; content?: string; mood?: string; completed?: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const cacheKey = getScopedCacheKey(`reflections:${targetDate}`, user.id);
      const current = readOfflineCache<ReflectionRow[]>(cacheKey, []);
      const optimistic = mergeById(
        current,
        {
          ...(current.find((row) => String(row.id) === update.id) ?? {}),
          ...update,
        },
      );
      writeOfflineCache(cacheKey, optimistic);
      queryClient.setQueryData(['reflections', targetDate], optimistic);

      try {
        const { data, error } = await supabase
          .from('reflections')
          .update({ ...update, id: undefined })
          .eq('id', update.id)
          .select()
          .single();

        if (error) throw error;
        const serverRows = mergeById(optimistic, data as ReflectionRow);
        writeOfflineCache(cacheKey, serverRows);
        scheduleSyncQueueDrain();
        return data;
      } catch (error) {
        queueMutation({
          userId: user.id,
          table: 'reflections',
          operation: 'update',
          payload: { ...update, id: undefined },
          match: { id: update.id },
          lastError: error instanceof Error ? error.message : 'Failed to update reflection',
        });
        scheduleSyncQueueDrain(1500);
        return optimistic.find((row) => String(row.id) === update.id) ?? null;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reflections', targetDate] });
    },
  });

  const deleteReflection = useMutation({
    mutationFn: async (id: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const cacheKey = getScopedCacheKey(`reflections:${targetDate}`, user.id);
      const current = readOfflineCache<ReflectionRow[]>(cacheKey, []);
      const optimistic = current.filter((row) => String(row.id) !== id);
      writeOfflineCache(cacheKey, optimistic);
      queryClient.setQueryData(['reflections', targetDate], optimistic);

      try {
        const { error } = await supabase
          .from('reflections')
          .delete()
          .eq('id', id);

        if (error) throw error;
        scheduleSyncQueueDrain();
        return;
      } catch (error) {
        queueMutation({
          userId: user.id,
          table: 'reflections',
          operation: 'delete',
          match: { id },
          lastError: error instanceof Error ? error.message : 'Failed to delete reflection',
        });
        scheduleSyncQueueDrain(1500);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reflections', targetDate] });
    },
  });

  const upsertReflection = useMutation({
    mutationFn: async (reflection: {
      prompt_id: string;
      prompt_text: Json;
      content?: string;
      mood?: string;
      completed?: boolean;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const cacheKey = getScopedCacheKey(`reflections:${targetDate}`, user.id);
      const current = readOfflineCache<ReflectionRow[]>(cacheKey, []);
      const existing = current[0] ?? {};
      const optimistic: ReflectionRow = {
        ...existing,
        user_id: user.id,
        date: targetDate,
        ...reflection,
        id: existing.id ?? crypto.randomUUID(),
      };
      const optimisticRows = [optimistic];
      writeOfflineCache(cacheKey, optimisticRows);
      queryClient.setQueryData(['reflections', targetDate], optimisticRows);

      try {
        const { data, error } = await supabase
          .from('reflections')
          .upsert(
            {
              ...optimistic,
            },
            { onConflict: 'user_id,date' },
          )
          .select()
          .single();

        if (error) throw error;
        const serverRows = [data as ReflectionRow];
        writeOfflineCache(cacheKey, serverRows);
        scheduleSyncQueueDrain();
        return data;
      } catch (error) {
        queueMutation({
          userId: user.id,
          table: 'reflections',
          operation: 'upsert',
          payload: optimistic,
          onConflict: 'user_id,date',
          lastError: error instanceof Error ? error.message : 'Failed to upsert reflection',
        });
        scheduleSyncQueueDrain(1500);
        return optimistic;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reflections', targetDate] });
    },
  });

  return {
    reflections,
    isLoading,
    error,
    createReflection: createReflection.mutate,
    updateReflection: updateReflection.mutate,
    deleteReflection: deleteReflection.mutate,
    upsertReflection: upsertReflection.mutate,
    isUpdating:
      createReflection.isPending ||
      updateReflection.isPending ||
      deleteReflection.isPending ||
      upsertReflection.isPending,
  };
};

