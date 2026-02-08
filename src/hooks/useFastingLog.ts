import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/runtime-client';

export const useFastingLog = () => {
  const queryClient = useQueryClient();

  const { data: logs, isLoading, error } = useQuery({
    queryKey: ['fastingLog'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('fasting_log')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const upsertFastingLog = useMutation({
    mutationFn: async (entry: { date: string; status: string; notes?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('fasting_log')
        .upsert({
          user_id: user.id,
          ...entry,
        }, { onConflict: 'user_id,date' })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fastingLog'] });
    },
  });

  const deleteFastingLog = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('fasting_log')
        .delete()
        .eq('id', id);

      if (error) throw error;
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
