import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/runtime-client';
import type { TablesUpdate } from '@/integrations/supabase/types';
import {
  getScopedCacheKey,
  queueMutation,
  readOfflineCache,
  scheduleSyncQueueDrain,
  writeOfflineCache,
} from '@/lib/offline-sync';

type ProfileRow = Record<string, unknown>;

export const useProfile = () => {
  const queryClient = useQueryClient();

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const cacheKey = getScopedCacheKey('profile', user?.id);
      const cached = readOfflineCache<ProfileRow | null>(cacheKey, null);
      if (!user) return cached;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        writeOfflineCache(cacheKey, data);
        scheduleSyncQueueDrain();
        return data;
      } catch {
        return cached;
      }
    },
    enabled: true,
  });

  const updateProfile = useMutation({
    mutationFn: async (updates: TablesUpdate<'profiles'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const cacheKey = getScopedCacheKey('profile', user.id);
      const optimistic = {
        ...(readOfflineCache<ProfileRow | null>(cacheKey, null) ?? {}),
        ...updates,
        user_id: user.id,
      };
      writeOfflineCache(cacheKey, optimistic);
      queryClient.setQueryData(['profile'], optimistic);

      try {
        const { data, error } = await supabase
          .from('profiles')
          .update(updates)
          .eq('user_id', user.id)
          .select()
          .single();

        if (error) throw error;
        writeOfflineCache(cacheKey, data);
        scheduleSyncQueueDrain();
        return data;
      } catch (error) {
        queueMutation({
          userId: user.id,
          table: 'profiles',
          operation: 'update',
          payload: updates as Record<string, unknown>,
          match: { user_id: user.id },
          lastError: error instanceof Error ? error.message : 'Failed to update profile',
        });
        scheduleSyncQueueDrain(1500);
        return optimistic;
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['profile'], data);
    },
  });

  return {
    profile,
    isLoading,
    error,
    updateProfile: updateProfile.mutate,
    isUpdating: updateProfile.isPending,
  };
};

