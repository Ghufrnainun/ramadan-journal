import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookCheck, Circle, Search, CheckCircle2, RotateCcw } from 'lucide-react';
import ResponsiveLayout from '@/components/layout/ResponsiveLayout';
import { getProfile } from '@/lib/storage';
import { JUZ_30_SURAHS } from '@/data/juz30-surahs';
import {
  getJuz30MemorizationProgress,
  getJuz30MemorizationSummary,
  getMemorizationStatus,
  markMemorizationReviewedToday,
  MemorizationStatus,
  upsertMemorizationStatus,
} from '@/lib/juz30-memorization';
import { getLocalDateKey } from '@/lib/date';
import { cn } from '@/lib/utils';

type FilterKey = 'all' | MemorizationStatus;

const HafalanPage = () => {
  const navigate = useNavigate();
  const profile = getProfile();
  const lang = profile.language === 'en' ? 'en' : 'id';
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterKey>('all');
  const [progress, setProgress] = useState(getJuz30MemorizationProgress());

  const t = {
    id: {
      title: 'Hafalan Juz 30',
      subtitle: 'Pantau progres hafalan surat-surat pendek',
      back: 'Kembali',
      search: 'Cari surat...',
      all: 'Semua',
      not_started: 'Belum Mulai',
      learning: 'Sedang Hafal',
      memorized: 'Sudah Lancar',
      reviewed: 'Murajaah Hari Ini',
      surah: 'Surat',
      ayah: 'ayat',
      progress: 'Progres',
    },
    en: {
      title: 'Juz 30 Memorization',
      subtitle: 'Track your short-surah memorization progress',
      back: 'Back',
      search: 'Search surah...',
      all: 'All',
      not_started: 'Not Started',
      learning: 'Learning',
      memorized: 'Memorized',
      reviewed: 'Reviewed Today',
      surah: 'Surah',
      ayah: 'verses',
      progress: 'Progress',
    },
  }[lang];
  const today = getLocalDateKey();

  const summary = useMemo(
    () => getJuz30MemorizationSummary(JUZ_30_SURAHS.length, progress),
    [progress],
  );

  const completion = Math.round((summary.memorized / summary.total) * 100);

  const visibleSurahs = useMemo(() => {
    const query = search.trim().toLowerCase();
    return JUZ_30_SURAHS.filter((surah) => {
      const status = getMemorizationStatus(progress, surah.number);
      const filterMatch = filter === 'all' ? true : status === filter;
      const textMatch =
        !query ||
        surah.latinName.toLowerCase().includes(query) ||
        surah.number.toString().includes(query);
      return filterMatch && textMatch;
    });
  }, [filter, progress, search]);

  const updateStatus = (surahNumber: number, status: MemorizationStatus) => {
    setProgress(upsertMemorizationStatus(surahNumber, status));
  };

  const markReviewed = (surahNumber: number) => {
    setProgress(markMemorizationReviewedToday(surahNumber));
  };

  const getQuranSurahUrl = (surahNumber: number) =>
    `https://myramadhanku.web.id/quran?surah=${surahNumber}`;

  return (
    <ResponsiveLayout className="pb-24">
      <header className="sticky top-0 z-20 border-b border-slate-800/50 bg-[#020617]/95 px-6 py-4 backdrop-blur">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800/50"
            aria-label={t.back}
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="text-center">
            <h1 className="font-serif text-lg text-white">{t.title}</h1>
            <p className="text-xs text-slate-400">{t.subtitle}</p>
          </div>
          <div className="w-9" />
        </div>
      </header>

      <main className="space-y-5 px-6 py-6 md:px-0">
        <section className="overflow-hidden rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase text-emerald-300">{t.progress}</p>
              <p className="text-2xl font-serif text-white">{completion}%</p>
            </div>
            <BookCheck className="h-10 w-10 text-emerald-400" />
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-900">
            <div className="h-full rounded-full bg-emerald-400" style={{ width: `${completion}%` }} />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-xs md:grid-cols-4">
            <div className="rounded-lg border border-slate-800/80 bg-slate-900/60 p-3 text-slate-300">
              {t.memorized}: {summary.memorized}
            </div>
            <div className="rounded-lg border border-slate-800/80 bg-slate-900/60 p-3 text-slate-300">
              {t.learning}: {summary.learning}
            </div>
            <div className="rounded-lg border border-slate-800/80 bg-slate-900/60 p-3 text-slate-300">
              {t.not_started}: {summary.notStarted}
            </div>
            <div className="rounded-lg border border-slate-800/80 bg-slate-900/60 p-3 text-slate-300">
              {t.reviewed}: {summary.reviewedToday}
            </div>
          </div>
        </section>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t.search}
            className="w-full rounded-xl border border-slate-800 bg-slate-900 py-3 pl-10 pr-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/60"
          />
        </div>

        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {(['all', 'not_started', 'learning', 'memorized'] as const).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={cn(
                'rounded-xl border px-3 py-2 text-xs transition-colors',
                filter === key
                  ? 'border-emerald-400/50 bg-emerald-500/20 text-emerald-300'
                  : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200',
              )}
            >
              {t[key]}
            </button>
          ))}
        </div>

        <section className="space-y-3">
          {visibleSurahs.map((surah) => {
            const status = getMemorizationStatus(progress, surah.number);
            const reviewedToday = progress[surah.number]?.lastReviewedAt === today;
            return (
              <article
                key={surah.number}
                className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4"
              >
                <div className="mb-3 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs text-slate-500">
                      {t.surah} {surah.number}
                    </p>
                    <a
                      href={getQuranSurahUrl(surah.number)}
                      className="text-base font-semibold text-white underline-offset-4 hover:text-emerald-300 hover:underline"
                    >
                      {surah.latinName}
                    </a>
                    <p className="text-sm text-emerald-300">{surah.arabicName}</p>
                    <p className="text-xs text-slate-400">
                      {surah.verses} {t.ayah}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => markReviewed(surah.number)}
                    className="rounded-lg border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200 hover:bg-amber-500/20"
                  >
                    {t.reviewed}
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => updateStatus(surah.number, 'not_started')}
                    className={cn(
                      'inline-flex items-center justify-center gap-1 rounded-lg border px-2 py-2 text-xs transition-colors',
                      status === 'not_started'
                        ? 'border-slate-500 bg-slate-800 text-white'
                        : 'border-slate-700 text-slate-400 hover:text-slate-200',
                    )}
                  >
                    <Circle className="h-3.5 w-3.5" />
                    {t.not_started}
                  </button>
                  <button
                    type="button"
                    onClick={() => updateStatus(surah.number, 'learning')}
                    className={cn(
                      'inline-flex items-center justify-center gap-1 rounded-lg border px-2 py-2 text-xs transition-colors',
                      status === 'learning'
                        ? 'border-amber-400/50 bg-amber-500/20 text-amber-200'
                        : 'border-slate-700 text-slate-400 hover:text-slate-200',
                    )}
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    {t.learning}
                  </button>
                  <button
                    type="button"
                    onClick={() => updateStatus(surah.number, 'memorized')}
                    className={cn(
                      'inline-flex items-center justify-center gap-1 rounded-lg border px-2 py-2 text-xs transition-colors',
                      status === 'memorized'
                        ? 'border-emerald-400/50 bg-emerald-500/20 text-emerald-200'
                        : 'border-slate-700 text-slate-400 hover:text-slate-200',
                    )}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {t.memorized}
                  </button>
                </div>
                {reviewedToday && (
                  <p className="mt-2 text-xs text-amber-300">{t.reviewed}</p>
                )}
              </article>
            );
          })}
        </section>
      </main>
    </ResponsiveLayout>
  );
};

export default HafalanPage;
