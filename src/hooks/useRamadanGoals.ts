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

type GoalRow = Tables<'ramadan_goals'>;

const sortByCreatedDesc = (rows: GoalRow[]) =>
  [...rows].sort((a, b) => String(b.created_at ?? '').localeCompare(String(a.created_at ?? '')));

export const useRamadanGoals = () => {
  const queryClient = useQueryClient();

  const { data: goals, isLoading, error } = useQuery({
    queryKey: ['ramadanGoals'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const cacheKey = getScopedCacheKey('ramadan_goals', user?.id);
      const cached = readOfflineCache<GoalRow[]>(cacheKey, []);
      if (!user) return cached;

      try {
        const { data, error } = await supabase
          .from('ramadan_goals')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        const next = (data ?? []) as GoalRow[];
        writeOfflineCache(cacheKey, next);
        scheduleSyncQueueDrain();
        return next;
      } catch {
        return cached;
      }
    },
  });

  const createGoal = useMutation({
    mutationFn: async (goal: {
      goal_type: string;
      title: string;
      target: number;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const cacheKey = getScopedCacheKey('ramadan_goals', user.id);
      const current = readOfflineCache<GoalRow[]>(cacheKey, []);
      const optimistic = {
        id: crypto.randomUUID(),
        user_id: user.id,
        ...goal,
        current: 0,
        completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as GoalRow;
      const optimisticRows = sortByCreatedDesc([optimistic, ...current]);
      writeOfflineCache(cacheKey, optimisticRows);
      queryClient.setQueryData(['ramadanGoals'], optimisticRows);

      try {
        const { data, error } = await supabase
          .from('ramadan_goals')
          .insert(optimistic as any)
          .select()
          .single();

        if (error) throw error;
        const serverRows = sortByCreatedDesc([
          data as GoalRow,
          ...optimisticRows.filter((row) => row.id !== optimistic.id),
        ]);
        writeOfflineCache(cacheKey, serverRows);
        scheduleSyncQueueDrain();
        return data;
      } catch (error) {
        queueMutation({
          userId: user.id,
          table: 'ramadan_goals',
          operation: 'insert',
          payload: optimistic as any,
          lastError: error instanceof Error ? error.message : 'Failed to create goal',
        });
        scheduleSyncQueueDrain(1500);
        return optimistic;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ramadanGoals'] });
    },
  });

  const updateGoal = useMutation({
    mutationFn: async (update: { id: string; current?: number; completed?: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const cacheKey = getScopedCacheKey('ramadan_goals', user.id);
      const current = readOfflineCache<GoalRow[]>(cacheKey, []);
      const optimisticRows = current.map((row) =>
        row.id === update.id ? { ...row, ...update } : row,
      );
      writeOfflineCache(cacheKey, optimisticRows);
      queryClient.setQueryData(['ramadanGoals'], optimisticRows);

      const payload = {
        current: update.current,
        completed: update.completed,
      };

      try {
        const { data, error } = await supabase
          .from('ramadan_goals')
          .update(payload)
          .eq('id', update.id)
          .select()
          .single();

        if (error) throw error;
        const serverRows = optimisticRows.map((row) =>
          row.id === update.id ? (data as GoalRow) : row,
        );
        writeOfflineCache(cacheKey, serverRows);
        scheduleSyncQueueDrain();
        return data;
      } catch (error) {
        queueMutation({
          userId: user.id,
          table: 'ramadan_goals',
          operation: 'update',
          payload,
          match: { id: update.id },
          lastError: error instanceof Error ? error.message : 'Failed to update goal',
        });
        scheduleSyncQueueDrain(1500);
        return optimisticRows.find((row) => row.id === update.id) ?? null;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ramadanGoals'] });
    },
  });

  const deleteGoal = useMutation({
    mutationFn: async (id: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const cacheKey = getScopedCacheKey('ramadan_goals', user.id);
      const current = readOfflineCache<GoalRow[]>(cacheKey, []);
      const optimisticRows = current.filter((row) => row.id !== id);
      writeOfflineCache(cacheKey, optimisticRows);
      queryClient.setQueryData(['ramadanGoals'], optimisticRows);

      try {
        const { error } = await supabase
          .from('ramadan_goals')
          .delete()
          .eq('id', id);

        if (error) throw error;
        scheduleSyncQueueDrain();
      } catch (error) {
        queueMutation({
          userId: user.id,
          table: 'ramadan_goals',
          operation: 'delete',
          match: { id },
          lastError: error instanceof Error ? error.message : 'Failed to delete goal',
        });
        scheduleSyncQueueDrain(1500);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ramadanGoals'] });
    },
  });

  return {
    goals,
    isLoading,
    error,
    createGoal: createGoal.mutate,
    updateGoal: updateGoal.mutate,
    deleteGoal: deleteGoal.mutate,
    isUpdating: createGoal.isPending || updateGoal.isPending || deleteGoal.isPending,
  };
};
