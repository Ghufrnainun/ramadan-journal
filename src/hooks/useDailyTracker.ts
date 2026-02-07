import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useDailyTracker = (date?: string) => {
  const queryClient = useQueryClient();
  const targetDate = date || new Date().toISOString().split('T')[0];

  const { data: tracker, isLoading, error } = useQuery({
    queryKey: ['dailyTracker', targetDate],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('daily_tracker')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', targetDate)
        .single();

      if (error?.code === 'PGRST116') return null; // No rows found
      if (error) throw error;
      return data;
    },
  });

  const upsertTracker = useMutation({
    mutationFn: async (update: {
      items?: Record<string, any>;
      notes?: Record<string, any>;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('daily_tracker')
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
      queryClient.setQueryData(['dailyTracker', targetDate], data);
    },
  });

  return {
    tracker,
    isLoading,
    error,
    upsertTracker: upsertTracker.mutate,
    isUpdating: upsertTracker.isPending,
  };
};
