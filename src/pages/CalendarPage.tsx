import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
  parseISO,
} from 'date-fns';
import { ArrowLeft, ChevronLeft, ChevronRight, Check, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import ResponsiveLayout from '@/components/layout/ResponsiveLayout';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { getProfile } from '@/lib/storage';
import { useFastingLog } from '@/hooks/useFastingLog';
import { useTarawihLog } from '@/hooks/useTarawihLog';
import { useSedekahLog } from '@/hooks/useSedekahLog';
import { supabase } from '@/integrations/supabase/runtime-client';
import { getScopedCacheKey, readOfflineCache, writeOfflineCache } from '@/lib/offline-sync';

interface DailyStatusCalendarEntry {
  date: string;
  intention: string;
  mood: string | null;
}

const content = {
  id: {
    tracker: 'Tracker',
    completed: 'Selesai',
    backToDashboard: 'Kembali ke dashboard',
    happyDays: 'Hari Bahagia',
    perfectDays: 'Hari Sempurna',
    journals: 'Jurnal',
    dailyJournal: 'Jurnal Harian',
    mood: 'Mood',
    noIntention: 'Belum ada niat',
    noJournalEntry: 'Belum ada entri jurnal untuk hari ini.',
    noTrackerData: 'Belum ada data tracker untuk hari ini.',
    loadingTracker: 'Memuat data tracker...',
    trackerError: 'Gagal memuat data tracker.',
    fasting: 'Puasa Full',
    tarawih: 'Tarawih',
    sedekah: 'Sedekah',
  },
  en: {
    tracker: 'Tracker',
    completed: 'Completed',
    backToDashboard: 'Back to dashboard',
    happyDays: 'Happy Days',
    perfectDays: 'Perfect Days',
    journals: 'Journals',
    dailyJournal: 'Daily Journal',
    mood: 'Mood',
    noIntention: 'No intention set',
    noJournalEntry: 'No journal entry for this day.',
    noTrackerData: 'No tracker data for this day.',
    loadingTracker: 'Loading tracker data...',
    trackerError: 'Failed to load tracker data.',
    fasting: 'Full Fasting',
    tarawih: 'Tarawih',
    sedekah: 'Charity',
  },
};

const CalendarPage = () => {
  const navigate = useNavigate();
  const [lang, setLang] = useState<'id' | 'en'>('id');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const { logs: fastingLogs, isLoading: fastingLoading, error: fastingError } = useFastingLog();
  const { logs: tarawihLogs, isLoading: tarawihLoading, error: tarawihError } = useTarawihLog();
  const { logs: sedekahLogs, isLoading: sedekahLoading, error: sedekahError } = useSedekahLog();
  const monthStart = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
  const monthEnd = format(endOfMonth(currentMonth), 'yyyy-MM-dd');
  const {
    data: dailyStatuses = [],
    isLoading: dailyStatusLoading,
    error: dailyStatusError,
  } = useQuery<DailyStatusCalendarEntry[]>({
    queryKey: ['dailyStatusMonth', monthStart, monthEnd],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const cacheKey = getScopedCacheKey(
        `daily_status_month:${monthStart}:${monthEnd}`,
        user?.id,
      );
      const cached = readOfflineCache<DailyStatusCalendarEntry[]>(cacheKey, []);
      if (!user) return cached;

      try {
        const { data, error } = await supabase
          .from('daily_status')
          .select('date, intention, mood')
          .eq('user_id', user.id)
          .gte('date', monthStart)
          .lte('date', monthEnd);

        if (error) throw error;
        const normalized = (
          data?.map((row) => ({
            date: row.date,
            intention: row.intention || '',
            mood: row.mood || null,
          })) ?? []
        );
        writeOfflineCache(cacheKey, normalized);
        return normalized;
      } catch {
        return cached;
      }
    },
  });

  const isTrackerLoading =
    fastingLoading || tarawihLoading || sedekahLoading || dailyStatusLoading;
  const trackerError = fastingError || tarawihError || sedekahError || dailyStatusError;

  const t = content[lang];

  useEffect(() => {
    const profile = getProfile();
    setLang(profile.language);
  }, []);

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const getStatusForDate = useCallback((date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return dailyStatuses.find((s) => s.date === dateStr);
  }, [dailyStatuses]);

  const getTrackerSummaryForDate = useCallback((date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const fastingDone = (fastingLogs ?? []).some(
      (log) => log.date === dateStr && log.status === 'full',
    );
    const tarawihDone = (tarawihLogs ?? []).some(
      (log) => log.date === dateStr && log.tarawih_done,
    );
    const sedekahDone = (sedekahLogs ?? []).some(
      (log) => log.date === dateStr && log.completed,
    );
    const completedCount = [fastingDone, tarawihDone, sedekahDone].filter(Boolean).length;
    const totalItems = 3;
    const progressPercent = (completedCount / totalItems) * 100;

    return {
      fastingDone,
      tarawihDone,
      sedekahDone,
      completedCount,
      totalItems,
      progressPercent,
    };
  }, [fastingLogs, tarawihLogs, sedekahLogs]);

  const dayContentByDate = useMemo(() => {
    const map = new Map<string, { moodColor: string | null; progressPercent: number }>();

    const moodColors: Record<string, string> = {
      calm: 'bg-emerald-500',
      okay: 'bg-amber-500',
      heavy: 'bg-rose-500',
      happy: 'bg-emerald-500',
      neutral: 'bg-amber-500',
      sad: 'bg-rose-500',
    };

    days.forEach((date) => {
      const key = format(date, 'yyyy-MM-dd');
      const status = getStatusForDate(date);
      const trackerSummary = getTrackerSummaryForDate(date);
      map.set(key, {
        moodColor: status?.mood ? moodColors[status.mood] : null,
        progressPercent: trackerSummary.progressPercent,
      });
    });

    return map;
  }, [days, getStatusForDate, getTrackerSummaryForDate]);

  const perfectDaysCount = useMemo(
    () =>
      days.filter((date) => {
        const summary = getTrackerSummaryForDate(date);
        return summary.completedCount === summary.totalItems;
      }).length,
    [days, getTrackerSummaryForDate],
  );

  return (
    <ResponsiveLayout className="pb-24">
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800/50 sticky top-0 bg-[#020617]/80 backdrop-blur z-20">
        <button
          type="button"
          aria-label={t.backToDashboard}
          onClick={() => navigate('/dashboard')}
          className="p-2 -ml-2 rounded-lg hover:bg-slate-800/50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-400" />
        </button>
        <span className="font-serif text-lg text-white">
          {format(currentMonth, 'MMMM yyyy')}
        </span>
        <div className="flex gap-1">
          <button
            type="button"
            aria-label="Previous month"
            onClick={prevMonth}
            className="h-11 w-11 flex items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-800/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            aria-label="Next month"
            onClick={nextMonth}
            className="h-11 w-11 flex items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-800/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </header>

      {isTrackerLoading && (
        <div className="px-6 pt-4">
          <p className="text-sm text-slate-400">{t.loadingTracker}</p>
        </div>
      )}

      {trackerError && (
        <div className="px-6 pt-4">
          <p className="text-sm text-rose-300">{t.trackerError}</p>
        </div>
      )}

      <div className="px-6 py-6">
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
            <div
              key={d}
              className="text-center text-xs text-slate-500 font-medium py-2"
            >
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: startOfMonth(currentMonth).getDay() }).map(
            (_, i) => (
              <div key={`empty-${i}`} />
            ),
          )}

          {days.map((date, i) => {
            const key = format(date, 'yyyy-MM-dd');
            const contentByDay = dayContentByDate.get(key);
            const isSelected = selectedDate && isSameDay(date, selectedDate);
            const isTodayDate = isToday(date);

            return (
              <motion.button
                key={key}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.02 }}
                onClick={() => setSelectedDate(date)}
                className={cn(
                  'relative aspect-square rounded-xl flex flex-col items-center justify-center transition-colors border',
                  isSelected
                    ? 'bg-amber-500/20 border-amber-500 text-white'
                    : isTodayDate
                      ? 'bg-slate-800 border-slate-700 text-amber-400'
                      : 'bg-slate-900/50 border-slate-800/50 text-slate-300 hover:bg-slate-800 hover:border-slate-700',
                )}
              >
                <span className="text-sm font-medium relative z-10">
                  {format(date, 'd')}
                </span>

                <div className="absolute bottom-2 flex gap-1">
                  {contentByDay?.moodColor && (
                    <div
                      className={cn('w-1.5 h-1.5 rounded-full', contentByDay.moodColor)}
                    />
                  )}
                  {(contentByDay?.progressPercent ?? 0) > 0 && (
                    <div
                      className={cn(
                        'w-1.5 h-1.5 rounded-full',
                        contentByDay?.progressPercent === 100
                          ? 'bg-emerald-400'
                          : 'bg-slate-600',
                      )}
                    />
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className="px-6">
        <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 flex justify-between items-center">
          <div className="text-center w-1/3">
            <span className="text-2xl font-serif text-white">
              {
                dailyStatuses.filter(
                  (s) =>
                    ['calm', 'happy'].includes(s.mood || '') &&
                    isSameMonth(parseISO(s.date), currentMonth),
                ).length
              }
            </span>
            <p className="text-xs text-slate-500 uppercase mt-1">
              {t.happyDays}
            </p>
          </div>
          <div className="w-px h-10 bg-slate-800" />
          <div className="text-center w-1/3">
            <span className="text-2xl font-serif text-emerald-400">
              {perfectDaysCount}
            </span>
            <p className="text-xs text-slate-500 uppercase mt-1">{t.perfectDays}</p>
          </div>
          <div className="w-px h-10 bg-slate-800" />
          <div className="text-center w-1/3">
            <span className="text-2xl font-serif text-amber-400">
              {
                dailyStatuses.filter(
                  (s) =>
                    s.intention && isSameMonth(parseISO(s.date), currentMonth),
                ).length
              }
            </span>
            <p className="text-xs text-slate-500 uppercase mt-1">{t.journals}</p>
          </div>
        </div>
      </div>

      <Dialog open={!!selectedDate} onOpenChange={() => setSelectedDate(null)}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-200 max-w-[360px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl border-b border-slate-800 pb-3">
              {selectedDate && format(selectedDate, 'EEEE, d MMMM yyyy')}
            </DialogTitle>
            <DialogDescription className="hidden" />
          </DialogHeader>

          {selectedDate && (
            <div className="space-y-6 pt-2">
              {getStatusForDate(selectedDate) ? (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-slate-400 uppercase">
                    {t.dailyJournal}
                  </h4>
                  <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800">
                    {getStatusForDate(selectedDate)?.mood && (
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-slate-400 text-sm">{t.mood}:</span>
                        <span className="capitalize text-white font-medium">
                          {getStatusForDate(selectedDate)?.mood}
                        </span>
                      </div>
                    )}
                    <p className="text-slate-300 italic">
                      "
                      {getStatusForDate(selectedDate)?.intention ||
                        t.noIntention}
                      "
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-slate-500 text-sm italic text-center">
                  {t.noJournalEntry}
                </p>
              )}

              {(() => {
                const summary = getTrackerSummaryForDate(selectedDate);
                const trackerItems = [
                  { label: t.fasting, done: summary.fastingDone },
                  { label: t.tarawih, done: summary.tarawihDone },
                  { label: t.sedekah, done: summary.sedekahDone },
                ];
                const hasAnyData = trackerItems.some((item) => item.done);

                if (!hasAnyData) {
                  return (
                    <p className="text-slate-500 text-sm italic text-center">
                      {t.noTrackerData}
                    </p>
                  );
                }

                return (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-slate-400 uppercase">
                      {t.tracker}
                    </h4>
                    <div className="space-y-2">
                      {trackerItems.map((item) => (
                        <div
                          key={item.label}
                          className="flex items-center justify-between p-2 rounded-lg bg-slate-800/20"
                        >
                          <span
                            className={cn(
                              'text-sm',
                              item.done ? 'text-emerald-400' : 'text-slate-500',
                            )}
                          >
                            {item.label}
                          </span>
                          {item.done ? (
                            <Check className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <X className="w-4 h-4 text-slate-700" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </ResponsiveLayout>
  );
};

export default CalendarPage;
