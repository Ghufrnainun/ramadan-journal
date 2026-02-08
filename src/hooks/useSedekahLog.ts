import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/runtime-client';

export const useSedekahLog = () => {
  const queryClient = useQueryClient();

  const { data: logs, isLoading, error } = useQuery({
    queryKey: ['sedekahLog'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('sedekah_log')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const upsertSedekahLog = useMutation({
    mutationFn: async (entry: { date: string; completed?: boolean; notes?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('sedekah_log')
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
      queryClient.invalidateQueries({ queryKey: ['sedekahLog'] });
    },
  });

  const deleteSedekahLog = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('sedekah_log')
        .delete()
        .eq('id', id);

      if (error) throw error;
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
