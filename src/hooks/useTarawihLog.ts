import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useTarawihLog = () => {
  const queryClient = useQueryClient();

  const { data: logs, isLoading, error } = useQuery({
    queryKey: ['tarawihLog'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('tarawih_log')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;
      return data;
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

      const { data, error } = await supabase
        .from('tarawih_log')
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
      queryClient.invalidateQueries({ queryKey: ['tarawihLog'] });
    },
  });

  const deleteTarawihLog = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tarawih_log')
        .delete()
        .eq('id', id);

      if (error) throw error;
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
