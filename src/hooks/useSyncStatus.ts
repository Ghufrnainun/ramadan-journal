import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/runtime-client';
import {
  getSyncQueueStats,
  subscribeSyncQueue,
  type SyncQueueStats,
} from '@/lib/offline-sync';

const defaultStats: SyncQueueStats = {
  total: 0,
  pending: 0,
  failed: 0,
  maxRetryReached: 0,
  isOnline: true,
};

export const useSyncStatus = () => {
  const [stats, setStats] = useState<SyncQueueStats>(defaultStats);

  useEffect(() => {
    let cancelled = false;

    const refresh = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const next = getSyncQueueStats(user?.id ?? null);
      if (!cancelled) setStats(next);
    };

    void refresh();
    const unsubscribe = subscribeSyncQueue(() => {
      void refresh();
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  return stats;
};

