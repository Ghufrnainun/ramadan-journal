import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useDailyStatus = (date?: string) => {
  const queryClient = useQueryClient();
  const targetDate = date || new Date().toISOString().split('T')[0];

  const { data: status, isLoading, error } = useQuery({
    queryKey: ['dailyStatus', targetDate],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('daily_status')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', targetDate)
        .single();

      if (error?.code === 'PGRST116') return null; // No rows found
      if (error) throw error;
      return data;
    },
  });

  const upsertDailyStatus = useMutation({
    mutationFn: async (update: { intention?: string; mood?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('daily_status')
        .upsert({
          user_id: user.id,
          date: targetDate,
          ...update,
        }, { onConflict: 'user_id,date' })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['dailyStatus', targetDate], data);
    },
  });

  return {
    status,
    isLoading,
    error,
    upsertDailyStatus: upsertDailyStatus.mutate,
    isUpdating: upsertDailyStatus.isPending,
  };
};
