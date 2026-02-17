import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, CheckCircle2, Loader2 } from 'lucide-react';
import { useReadingProgress } from '@/hooks/useReadingProgress';
import { useDailyTracker } from '@/hooks/useDailyTracker';
import { getLocalDateKey } from '@/lib/date';
import { getProfile } from '@/lib/storage';
import { isTadarusDoneFromItems, withTadarusDoneItems } from '@/lib/tadarus-tracker';

const today = getLocalDateKey();

const TadarusCard = () => {
  const navigate = useNavigate();
  const lang = getProfile().language === 'en' ? 'en' : 'id';
  const { progress, isLoading, error } = useReadingProgress();
  const { tracker, upsertTracker, isUpdating } = useDailyTracker();
  const t = {
    id: {
      title: 'Tadarus Harian',
      loading: 'Memuat tadarus...',
      error: 'Gagal memuat progress tadarus.',
      todayStatus: 'Status hari ini',
      done: 'Sudah tadarus',
      notDone: 'Belum tadarus',
      lastRead: 'Terakhir dibaca',
      continue: 'Lanjut Baca',
      markDone: 'Tandai selesai',
      saving: 'Menyimpan...',
    },
    en: {
      title: 'Daily Tadarus',
      loading: 'Loading tadarus...',
      error: 'Failed to load tadarus progress.',
      todayStatus: 'Today status',
      done: 'Done',
      notDone: 'Not yet',
      lastRead: 'Last read',
      continue: 'Continue Reading',
      markDone: 'Mark done',
      saving: 'Saving...',
    },
  }[lang];

  const trackerItems = useMemo(
    () => tracker?.items,
    [tracker?.items],
  );
  const isDoneToday = isTadarusDoneFromItems(trackerItems);
  const hasReadingToday = progress?.date === today;
  const surah = progress?.surah_number;
  const ayah = progress?.ayah_number;

  // Keep tracker in sync for legacy rows that were saved before the linkage.
  useEffect(() => {
    if (!hasReadingToday || isDoneToday) return;
    upsertTracker({
      items: withTadarusDoneItems(trackerItems),
      notes: (tracker?.notes as Record<string, string> | null) ?? {},
    });
  }, [hasReadingToday, isDoneToday, trackerItems, tracker?.notes, upsertTracker]);

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
          <BookOpen className="h-5 w-5 text-emerald-300" />
          <h3 className="font-serif text-lg text-white">{t.title}</h3>
        </div>
        {isUpdating && <span className="text-xs text-slate-400">{t.saving}</span>}
      </div>

      <div className="space-y-4">
        <div className="rounded-xl border border-slate-700 bg-slate-950/40 p-3">
          <p className="text-xs text-slate-400">{t.todayStatus}</p>
          <p className="mt-1 flex items-center gap-2 text-sm font-medium text-white">
            <CheckCircle2 className={isDoneToday ? 'h-4 w-4 text-emerald-400' : 'h-4 w-4 text-slate-500'} />
            {isDoneToday ? t.done : t.notDone}
          </p>
        </div>

        {surah && ayah && (
          <div className="rounded-xl border border-slate-700 bg-slate-950/40 p-3">
            <p className="text-xs text-slate-400">{t.lastRead}</p>
            <p className="mt-1 text-sm text-white">
              Surah {surah}, Ayat {ayah}
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() =>
              navigate(surah ? `/quran?surah=${surah}` : '/quran')
            }
            className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-200 transition-colors hover:bg-emerald-500/20"
          >
            {t.continue}
          </button>
          <button
            type="button"
            onClick={() =>
              upsertTracker({
                items: withTadarusDoneItems(trackerItems),
                notes: (tracker?.notes as Record<string, string> | null) ?? {},
              })
            }
            disabled={isDoneToday}
            className="rounded-xl border border-slate-700 bg-slate-950/40 px-3 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-900/70 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t.markDone}
          </button>
        </div>
      </div>
    </section>
  );
};

export default TadarusCard;
