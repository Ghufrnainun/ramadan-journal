import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useDhikrSessions = (date?: string) => {
  const queryClient = useQueryClient();
  const targetDate = date || new Date().toISOString().split('T')[0];

  const { data: sessions, isLoading, error } = useQuery({
    queryKey: ['dhikrSessions', targetDate],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('dhikr_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', targetDate)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
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

      const { data, error } = await supabase
        .from('dhikr_sessions')
        .upsert({
          user_id: user.id,
          date: targetDate,
          ...session,
        }, { onConflict: 'user_id,preset_id,date' })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dhikrSessions', targetDate] });
    },
  });

  const deleteDhikrSession = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('dhikr_sessions')
        .delete()
        .eq('id', id);

      if (error) throw error;
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
