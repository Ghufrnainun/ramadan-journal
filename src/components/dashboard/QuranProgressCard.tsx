import { BookOpen, Loader2 } from 'lucide-react';
import { useReadingProgress } from '@/hooks/useReadingProgress';
import { getProfile } from '@/lib/storage';

const QuranProgressCard = () => {
  const { progress, isLoading, error } = useReadingProgress();
  const lang = getProfile().language === 'en' ? 'en' : 'id';
  const t = {
    id: {
      title: 'Progress Quran',
      loading: 'Memuat progress Quran...',
      error: 'Gagal memuat progress Quran.',
      empty: 'Belum ada progress tersimpan. Mulai dari halaman Quran untuk mencatat bacaan.',
      lastRead: 'Terakhir Dibaca',
      surah: 'Surah',
      ayah: 'Ayat',
      juz: 'Juz',
      page: 'Halaman',
    },
    en: {
      title: 'Quran Progress',
      loading: 'Loading Quran progress...',
      error: 'Failed to load Quran progress.',
      empty: 'No saved progress yet. Start from Quran page to record your reading.',
      lastRead: 'Last Read',
      surah: 'Surah',
      ayah: 'Ayah',
      juz: 'Juz',
      page: 'Page',
    },
  }[lang];

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
      <div className="mb-4 flex items-center gap-2">
        <BookOpen className="h-5 w-5 text-emerald-300" />
        <h3 className="font-serif text-lg text-white">{t.title}</h3>
      </div>

      {!progress ? (
        <p className="text-sm text-slate-400">
          {t.empty}
        </p>
      ) : (
        <div className="space-y-3">
          <div className="rounded-xl border border-slate-700 bg-slate-950/40 p-3">
            <p className="text-xs text-slate-400">{t.lastRead}</p>
            <p className="mt-1 text-white">
              {t.surah} {progress.surah_number}, {t.ayah} {progress.ayah_number}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-700 bg-slate-950/40 p-3">
              <p className="text-xs text-slate-400">{t.juz}</p>
              <p className="mt-1 text-lg font-semibold text-amber-300">
                {progress.juz_number ?? '-'}
              </p>
            </div>
            <div className="rounded-xl border border-slate-700 bg-slate-950/40 p-3">
              <p className="text-xs text-slate-400">{t.page}</p>
              <p className="mt-1 text-lg font-semibold text-emerald-300">
                {progress.page_number ?? '-'}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default QuranProgressCard;
