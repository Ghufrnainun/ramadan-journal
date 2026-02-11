import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/runtime-client';
import { getLocalDateKey } from '@/lib/date';

export const useReadingProgress = () => {
  const queryClient = useQueryClient();

  const { data: progress, isLoading, error } = useQuery({
    queryKey: ['readingProgress'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('reading_progress')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data ?? null;
    },
  });

  const recordProgress = useMutation({
    mutationFn: async (entry: {
      date?: string;
      surah_number: number;
      ayah_number: number;
      page_number?: number;
      juz_number?: number;
      daily_target_pages?: number;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('reading_progress')
        .insert({
          user_id: user.id,
          date: entry.date || getLocalDateKey(),
          surah_number: entry.surah_number,
          ayah_number: entry.ayah_number,
          page_number: entry.page_number,
          juz_number: entry.juz_number,
          daily_target_pages: entry.daily_target_pages,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['readingProgress'] });
    },
  });

  const updateProgress = useMutation({
    mutationFn: async (update: { id: string; surah_number?: number; ayah_number?: number; page_number?: number; juz_number?: number }) => {
      const { id, ...updates } = update;
      const { data, error } = await supabase
        .from('reading_progress')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['readingProgress'] });
    },
  });

  return {
    progress,
    isLoading,
    error,
    recordProgress: recordProgress.mutate,
    updateProgress: updateProgress.mutate,
    isUpdating: recordProgress.isPending || updateProgress.isPending,
  };
};
