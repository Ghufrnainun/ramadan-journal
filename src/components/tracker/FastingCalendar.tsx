import { useMemo } from 'react';
import { Loader2, MoonStar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFastingLog } from '@/hooks/useFastingLog';
import { getRamadanInfo } from '@/lib/ramadan-dates';
import { getLocalDateKey } from '@/lib/date';
import { getProfile } from '@/lib/storage';

type FastingStatus = 'full' | 'udzur' | 'skip' | 'pending';

const statusCycle: FastingStatus[] = ['pending', 'full', 'udzur', 'skip'];

const statusStyles: Record<FastingStatus, string> = {
  full: 'bg-emerald-500/20 border-emerald-400/40 text-emerald-200',
  udzur: 'bg-sky-500/20 border-sky-400/40 text-sky-200',
  skip: 'bg-rose-500/20 border-rose-400/40 text-rose-200',
  pending: 'bg-slate-800/70 border-slate-700 text-slate-300',
};

const statusLabel: Record<FastingStatus, string> = {
  full: 'Full',
  udzur: 'Udzur',
  skip: 'Skip',
  pending: 'Pending',
};
const nextStatusLabel: Record<FastingStatus, string> = {
  full: 'Udzur',
  udzur: 'Skip',
  skip: 'Pending',
  pending: 'Full',
};

const dateToKey = (date: Date) => getLocalDateKey(date);

const getDays = (start: Date, end: Date) => {
  const days: string[] = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    days.push(dateToKey(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
};

const FastingCalendar = () => {
  const { logs, isLoading, error, upsertFastingLog, isUpdating } = useFastingLog();
  const lang = getProfile().language === 'en' ? 'en' : 'id';
  const t = {
    id: {
      title: 'Kalender Puasa',
      loading: 'Memuat kalender puasa...',
      error: 'Gagal memuat data puasa.',
      saving: 'Menyimpan...',
      day: 'Hari',
      statusLabel: statusLabel,
      next: 'Berikutnya',
    },
    en: {
      title: 'Fasting Calendar',
      loading: 'Loading fasting calendar...',
      error: 'Failed to load fasting logs.',
      saving: 'Saving...',
      day: 'Day',
      statusLabel: statusLabel,
      next: 'Next',
    },
  }[lang];

  const ramadanInfo = getRamadanInfo();
  const ramadanWindow = ramadanInfo.nextRamadan;
  const calendarDays = useMemo(() => {
    if (!ramadanWindow) return [];
    return getDays(ramadanWindow.start, ramadanWindow.end);
  }, [ramadanWindow]);

  const statusByDate = useMemo(() => {
    const map = new Map<string, FastingStatus>();
    (logs ?? []).forEach((log) => {
      map.set(log.date, (log.status as FastingStatus) || 'pending');
    });
    return map;
  }, [logs]);

  const handleCycleStatus = (date: string) => {
    const current = statusByDate.get(date) ?? 'pending';
    const next = statusCycle[(statusCycle.indexOf(current) + 1) % statusCycle.length];
    upsertFastingLog({ date, status: next });
  };

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

  return (
    <section className="rounded-2xl border border-slate-800/70 bg-slate-900/50 p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MoonStar className="h-5 w-5 text-amber-400" />
          <h3 className="font-serif text-lg text-white">{t.title}</h3>
        </div>
        {isUpdating && <span className="text-xs text-slate-400">{t.saving}</span>}
      </div>

      <div className="grid grid-cols-5 gap-2 sm:grid-cols-6">
        {calendarDays.map((date, index) => {
          const status = statusByDate.get(date) ?? 'pending';
          const day = index + 1;
          return (
            <button
              key={date}
              type="button"
              onClick={() => handleCycleStatus(date)}
              aria-pressed={status !== 'pending'}
              aria-label={`${t.day} ${day}, status ${t.statusLabel[status]}. ${t.next} ${t.statusLabel[nextStatusLabel[status]]}`}
              className={cn(
                'min-h-11 rounded-xl border p-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60',
                statusStyles[status],
              )}
            >
              <p className="text-xs font-semibold">{t.day} {day}</p>
              <p className="text-[11px] opacity-90">{t.statusLabel[status]}</p>
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
        {statusCycle.map((status) => (
          <span
            key={status}
            className={cn('rounded-full border px-2 py-1', statusStyles[status])}
          >
            {t.statusLabel[status]}
          </span>
        ))}
      </div>
    </section>
  );
};

export default FastingCalendar;
