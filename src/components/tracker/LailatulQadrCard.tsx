import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Stars } from 'lucide-react';
import { supabase } from '@/integrations/supabase/runtime-client';
import { cn } from '@/lib/utils';
import { getRamadanInfo } from '@/lib/ramadan-dates';
import { getLocalDateKey } from '@/lib/date';
import { getProfile } from '@/lib/storage';
import {
  getScopedCacheKey,
  queueMutation,
  readOfflineCache,
  scheduleSyncQueueDrain,
  writeOfflineCache,
} from '@/lib/offline-sync';

const keys = ['qiyam', 'quran', 'itikaf'] as const;
type WorshipKey = (typeof keys)[number];

const keyMap: Record<WorshipKey, string> = {
  qiyam: 'Qiyamul Lail',
  quran: 'Baca Quran',
  itikaf: "I'tikaf",
};

const toIsoDate = (date: Date) => getLocalDateKey(date);

const LailatulQadrCard = () => {
  const queryClient = useQueryClient();
  const lang = getProfile().language === 'en' ? 'en' : 'id';
  const t = {
    id: {
      title: 'Malam Lailatul Qadr',
      tonight: 'Malam ke',
      loading: 'Memuat Lailatul Qadr tracker...',
      error: 'Gagal memuat Lailatul Qadr tracker.',
      done: 'Selesai',
    },
    en: {
      title: 'Lailatul Qadr Nights',
      tonight: 'Night',
      loading: 'Loading Lailatul Qadr tracker...',
      error: 'Failed to load Lailatul Qadr tracker.',
      done: 'Done',
    },
  }[lang];
  const ramadanInfo = getRamadanInfo();
  const ramadanWindow = ramadanInfo.nextRamadan;

  const nights = useMemo(() => {
    if (!ramadanWindow) return [];
    const days: { day: number; date: string; odd: boolean }[] = [];
    for (let day = 21; day <= 30; day += 1) {
      const date = new Date(ramadanWindow.start);
      date.setDate(date.getDate() + (day - 1));
      days.push({ day, date: toIsoDate(date), odd: day % 2 === 1 });
    }
    return days;
  }, [ramadanWindow]);

  const isVisible =
    ramadanInfo.status === 'during' && (ramadanInfo.currentDay ?? 0) >= 21;
  const todayNight = ramadanInfo.currentDay ?? 0;
  const today = getLocalDateKey();

  const { data, isLoading, error } = useQuery({
    queryKey: [
      'lailatulQadr',
      nights[0]?.date,
      nights[nights.length - 1]?.date,
    ],
    queryFn: async () => {
      if (!nights.length) return [];
      const { data: userRes } = await supabase.auth.getUser();
      const user = userRes.user;
      const cacheKey = getScopedCacheKey(
        `lailatul_qadr:${nights[0].date}:${nights[nights.length - 1].date}`,
        user?.id,
      );
      const cached = readOfflineCache<Array<{ id?: string; date: string; items?: Record<string, boolean> }>>(cacheKey, []);
      if (!user) return cached;

      try {
        const { data, error } = await supabase
          .from('daily_tracker')
          .select('id, date, items')
          .eq('user_id', user.id)
          .gte('date', nights[0].date)
          .lte('date', nights[nights.length - 1].date);
        if (error) throw error;
        const next = (data as Array<{ id?: string; date: string; items?: Record<string, boolean> }>) ?? [];
        writeOfflineCache(cacheKey, next);
        scheduleSyncQueueDrain();
        return next;
      } catch {
        return cached;
      }
    },
    enabled: isVisible && nights.length > 0,
  });

  const updateToday = useMutation({
    mutationFn: async (key: WorshipKey) => {
      const { data: userRes } = await supabase.auth.getUser();
      const user = userRes.user;
      if (!user) return;

      const cacheKey = getScopedCacheKey(
        `lailatul_qadr:${nights[0].date}:${nights[nights.length - 1].date}`,
        user.id,
      );
      const currentRows = readOfflineCache<Array<{ id?: string; date: string; items?: Record<string, boolean> }>>(cacheKey, data ?? []);
      const existingRow = data?.find((row) => row.date === today);
      const currentItems =
        (existingRow?.items as Record<string, boolean> | null) ?? {};
      const nextItems = {
        ...currentItems,
        [`lailatul_qadr_${key}`]: !currentItems[`lailatul_qadr_${key}`],
      };
      const optimisticRow = {
        id: existingRow?.id ?? crypto.randomUUID(),
        date: today,
        items: nextItems,
      };
      const optimisticRows = [
        optimisticRow,
        ...currentRows.filter((row) => row.date !== today),
      ];
      writeOfflineCache(cacheKey, optimisticRows);
      queryClient.setQueryData(['lailatulQadr', nights[0]?.date, nights[nights.length - 1]?.date], optimisticRows);

      try {
        const { error } = await supabase.from('daily_tracker').upsert(
          {
            id: existingRow?.id,
            user_id: user.id,
            date: today,
            items: nextItems,
          },
          { onConflict: 'user_id,date' },
        );
        if (error) throw error;
        scheduleSyncQueueDrain();
      } catch (error) {
        queueMutation({
          userId: user.id,
          table: 'daily_tracker',
          operation: 'upsert',
          payload: {
            id: existingRow?.id ?? optimisticRow.id,
            user_id: user.id,
            date: today,
            items: nextItems,
          },
          onConflict: 'user_id,date',
          lastError: error instanceof Error ? error.message : 'Failed to update lailatul qadr',
        });
        scheduleSyncQueueDrain(1500);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lailatulQadr'] });
    },
  });

  if (!isVisible) return null;

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-800/70 bg-slate-900/50 p-5">
        <div className="flex items-center gap-2 text-slate-300">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">{t.loading}</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-5">
        <p className="text-sm text-rose-200">{t.error}</p>
      </div>
    );
  }

  const rowByDate = new Map((data ?? []).map((row) => [row.date, row]));
  const todayItems =
    (rowByDate.get(today)?.items as Record<string, boolean> | undefined) ?? {};

  return (
    <section className="rounded-2xl border border-slate-800/70 bg-gradient-to-br from-slate-900/70 to-indigo-950/30 p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Stars className="h-5 w-5 text-amber-300" />
          <h3 className="font-serif text-lg text-white">{t.title}</h3>
        </div>
        <span className="text-xs text-slate-400">
          {t.tonight}-{todayNight}
        </span>
      </div>

      <div className="mb-4 grid grid-cols-5 gap-2">
        {nights.map((night) => {
          const items =
            (rowByDate.get(night.date)?.items as
              | Record<string, boolean>
              | undefined) ?? {};
          const done = keys.some((key) =>
            Boolean(items[`lailatul_qadr_${key}`]),
          );
          return (
            <div
              key={night.day}
              className={cn(
                'rounded-lg border px-2 py-2 text-center text-xs',
                done
                  ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-200'
                  : 'border-slate-700 bg-slate-900/50 text-slate-400',
                night.odd && 'shadow-[0_0_24px_rgba(251,191,36,0.15)]',
              )}
            >
              <p>
                {t.tonight} {night.day}
              </p>
              <p className="mt-1">{done ? t.done : '-'}</p>
            </div>
          );
        })}
      </div>

      <div className="space-y-3">
        {keys.map((key) => (
          <label
            key={key}
            className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-700 bg-slate-950/40 px-3 py-3 transition-colors hover:bg-slate-900/60"
          >
            <span className="text-sm font-medium text-slate-200">
              {keyMap[key]}
            </span>
            <input
              type="checkbox"
              checked={Boolean(todayItems[`lailatul_qadr_${key}`])}
              onChange={() => updateToday.mutate(key)}
              className="h-5 w-5 accent-emerald-500"
            />
          </label>
        ))}
      </div>
    </section>
  );
};

export default LailatulQadrCard;
