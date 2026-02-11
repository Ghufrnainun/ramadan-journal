import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/runtime-client';
import type { Json } from '@/integrations/supabase/types';
import { getLocalDateKey } from '@/lib/date';

export const useReflections = (date?: string) => {
  const queryClient = useQueryClient();
  const targetDate = date || getLocalDateKey();

  const { data: reflections, isLoading, error } = useQuery({
    queryKey: ['reflections', targetDate],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('reflections')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', targetDate)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
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

      const { data, error } = await supabase
        .from('reflections')
        .insert({
          user_id: user.id,
          date: targetDate,
          ...reflection,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reflections', targetDate] });
    },
  });

  const updateReflection = useMutation({
    mutationFn: async (update: { id: string; content?: string; mood?: string; completed?: boolean }) => {
      const { id, ...updates } = update;
      const { data, error } = await supabase
        .from('reflections')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reflections', targetDate] });
    },
  });

  const deleteReflection = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('reflections')
        .delete()
        .eq('id', id);

      if (error) throw error;
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

      const { data, error } = await supabase
        .from('reflections')
        .upsert(
          {
            user_id: user.id,
            date: targetDate,
            ...reflection,
          },
          { onConflict: 'user_id,date' },
        )
        .select()
        .single();

      if (error) throw error;
      return data;
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
