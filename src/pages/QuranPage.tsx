import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  BookOpen,
  ChevronRight,
  Play,
  Pause,
  Loader2,
  Bookmark,
  CheckCircle,
  Search,
  X,
} from 'lucide-react';
import { getProfile } from '@/lib/storage';
import { equranApi, Surah, SurahDetail } from '@/lib/api/equran';
import {
  getReadingProgress,
  getReadingTarget,
  saveReadingProgress,
  saveReadingTarget,
} from '@/lib/reading-progress';
import { useReadingProgress } from '@/hooks/useReadingProgress';
import { isBookmarked, toggleBookmark } from '@/lib/bookmarks';
import { markActiveDay } from '@/lib/streak';
import ResponsiveLayout from '@/components/layout/ResponsiveLayout';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

const content = {
  id: {
    title: 'Tadarus',
    subtitle: 'Al-Quran Digital',
    loading: 'Memuat...',
    error: 'Gagal memuat data',
    retry: 'Coba Lagi',
    ayat: 'ayat',
    surah: 'Surat',
    searchPlaceholder: 'Cari surat...',
    markLast: 'Tandai Terakhir',
    continueReading: 'Lanjutkan Membaca',
    lastRead: 'Terakhir Dibaca',
    target: 'Target Harian',
    pages: 'halaman',
    noResults: 'Surat tidak ditemukan',
  },
  en: {
    title: 'Quran Reading',
    subtitle: 'Digital Quran',
    loading: 'Loading...',
    error: 'Failed to load data',
    retry: 'Try Again',
    ayat: 'verses',
    surah: 'Surah',
    searchPlaceholder: 'Search surah...',
    markLast: 'Mark last read',
    continueReading: 'Continue Reading',
    lastRead: 'Last Read',
    target: 'Daily Target',
    pages: 'pages',
    noResults: 'Surah not found',
  },
};

const QuranPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [lang, setLang] = useState<'id' | 'en'>('id');
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSurah, setSelectedSurah] = useState<SurahDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSurah, setIsLoadingSurah] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playingAudio, setPlayingAudio] = useState<HTMLAudioElement | null>(
    null,
  );
  const [playingAyah, setPlayingAyah] = useState<number | null>(null);
  const [readingTarget] = useState(getReadingTarget().dailyTargetPages);
  const [readingProgress, setReadingProgress] = useState(getReadingProgress());
  const { recordProgress } = useReadingProgress();

  const [playingFullSurah, setPlayingFullSurah] =
    useState<HTMLAudioElement | null>(null);

  const t = content[lang];

  const loadSurahs = useCallback(async (errorMessage: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await equranApi.getAllSurahs();
      setSurahs(data);
    } catch (err) {
      setError(errorMessage);
      console.error('Failed to load surahs:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadSurah = useCallback(
    async (number: number) => {
      try {
        setIsLoadingSurah(true);
        const data = await equranApi.getSurah(number);
        setSelectedSurah(data);
        setSearchParams({ surah: number.toString() });
      } catch (err) {
        console.error('Failed to load surah:', err);
      } finally {
        setIsLoadingSurah(false);
      }
    },
    [setSearchParams],
  );

  const handleMarkProgress = (ayahNumber: number) => {
    if (!selectedSurah) return;
    const updated = saveReadingProgress({
      surahNumber: selectedSurah.nomor,
      ayahNumber,
      pageNumber: undefined,
    });
    setReadingProgress(updated);
    recordProgress({
      surah_number: selectedSurah.nomor,
      ayah_number: ayahNumber,
      daily_target_pages: readingTarget,
    });
    markActiveDay();
  };

  const handleBack = () => {
    if (selectedSurah) {
      setSelectedSurah(null);
      setSearchParams({});
      stopAudio();
    } else {
      navigate('/dashboard');
    }
  };

  const playAyahAudio = (audioUrl: string, ayahNumber: number) => {
    stopAudio();
    const audio = new Audio(audioUrl);
    audio.onended = () => {
      setPlayingAudio(null);
      setPlayingAyah(null);
    };
    audio.play();
    setPlayingAudio(audio);
    setPlayingAyah(ayahNumber);
  };

  const toggleFullSurahAudio = () => {
    if (playingFullSurah) {
      stopAudio();
      return;
    }

    if (!selectedSurah || !selectedSurah.audioFull) return;

    // Default to first available audio source (usually '01' Abdullah Al-Juhany or similar)
    // The API returns an object like { "01": "url", "02": "url" }
    const audioSources = Object.values(selectedSurah.audioFull);
    if (audioSources.length === 0) return;

    const audioUrl = audioSources[0]; // Pick the first one (usually '01') or a specific one if preferred

    stopAudio(); // Stop any existing audio (ayah or full)

    const audio = new Audio(audioUrl);
    audio.onended = () => {
      setPlayingFullSurah(null);
    };
    audio.play();
    setPlayingFullSurah(audio);
  };

  const stopAudio = useCallback(() => {
    if (playingAudio) {
      playingAudio.pause();
      playingAudio.currentTime = 0;
      setPlayingAudio(null);
      setPlayingAyah(null);
    }
    if (playingFullSurah) {
      playingFullSurah.pause();
      playingFullSurah.currentTime = 0;
      setPlayingFullSurah(null);
    }
  }, [playingAudio, playingFullSurah]);

  useEffect(() => {
    // Onboarding guard removed — AppGate handles this at the route level
    const profile = getProfile();
    const nextLang = profile.language;
    setLang(nextLang);
    void loadSurahs(content[nextLang].error);
  }, [loadSurahs]);

  useEffect(() => {
    const surahParam = searchParams.get('surah');
    if (surahParam && surahs.length > 0) {
      void loadSurah(parseInt(surahParam, 10));
    }
  }, [loadSurah, searchParams, surahs]);

  // Stop audio when unmounting or leaving
  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, [stopAudio]);

  const filteredSurahs = useMemo(() => {
    if (!searchQuery) return surahs;
    const lowerQuery = searchQuery.toLowerCase();
    return surahs.filter(
      (s) =>
        s.namaLatin.toLowerCase().includes(lowerQuery) ||
        s.arti.toLowerCase().includes(lowerQuery) ||
        s.nomor.toString().includes(lowerQuery),
    );
  }, [surahs, searchQuery]);

  // Loading State
  if (isLoading) {
    return (
      <ResponsiveLayout className="flex items-center justify-center min-h-dvh">
        <div className="text-center max-w-lg mx-auto">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-400 mx-auto mb-4" />
          <p className="text-slate-400">{t.loading}</p>
        </div>
      </ResponsiveLayout>
    );
  }

  // Error State
  if (error) {
    return (
      <ResponsiveLayout className="flex items-center justify-center min-h-dvh">
        <div className="text-center p-6">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => void loadSurahs(t.error)}
            className="px-6 py-3 bg-amber-500 text-slate-900 rounded-xl font-medium hover:bg-amber-400 transition-colors"
          >
            {t.retry}
          </button>
        </div>
      </ResponsiveLayout>
    );
  }

  /* =========================================================================
     SURAH DETAIL VIEW
     ========================================================================= */
  if (selectedSurah) {
    return (
      <ResponsiveLayout className="pb-32">
        {/* Sticky Header - Mobile Only? No, keep sticky header for detail view but adapt */}
        <header className="sticky top-0 z-20 bg-[#020617]/95 backdrop-blur border-b border-slate-800/50">
          <div className="flex items-center justify-between px-6 py-4">
            <button
              type="button"
              aria-label="Back to surah list"
              onClick={handleBack}
              className="p-3 -ml-3 rounded-lg hover:bg-slate-800/50 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-400" />
            </button>
            <div className="text-center">
              <span className="font-serif text-lg text-white block leading-tight">
                {selectedSurah.namaLatin}
              </span>
              <span className="text-xs text-slate-400">
                {selectedSurah.arti}
              </span>
            </div>
            <div className="w-9" />
          </div>
        </header>

        {/* Hero Card */}
        <div className="px-6 py-6">
          <div className="rounded-3xl bg-emerald-500/10 border border-emerald-500/20 p-8 text-center relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10">
              <p className="text-6xl text-emerald-400 font-serif mb-3 leading-tight">
                {selectedSurah.nama}
              </p>
              <div className="flex flex-col items-center gap-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300/80 text-xs font-medium">
                  <span>{selectedSurah.tempatTurun.toUpperCase()}</span>
                  <span>•</span>
                  <span>
                    {selectedSurah.jumlahAyat} {t.ayat.toUpperCase()}
                  </span>
                </div>

                {selectedSurah.audioFull && (
                  <button
                    onClick={toggleFullSurahAudio}
                    className={cn(
                      'inline-flex items-center gap-2 px-6 py-2.5 rounded-full font-medium transition-colors duration-300 shadow-lg',
                      playingFullSurah
                        ? 'bg-amber-500 text-slate-900 hover:bg-amber-400'
                        : 'bg-emerald-500 text-slate-900 hover:bg-emerald-400',
                    )}
                  >
                    {playingFullSurah ? (
                      <>
                        <Pause className="w-4 h-4 fill-current" />
                        Stop Murottal
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-current" />
                        Play Murottal
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bismillah */}
        {selectedSurah.nomor !== 1 && selectedSurah.nomor !== 9 && (
          <div className="px-6 py-4 mb-2 text-center">
            <p className="text-3xl text-emerald-400 font-serif leading-relaxed opacity-90">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </p>
          </div>
        )}

        {/* Ayahs List */}
        <div className="px-5 space-y-6">
          {selectedSurah.ayat.map((ayah) => {
            const isActive = playingAyah === ayah.nomorAyat;
            return (
              <motion.div
                key={ayah.nomorAyat}
                id={`ayah-${ayah.nomorAyat}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  'rounded-2xl p-5 border transition-colors duration-300',
                  isActive
                    ? 'bg-emerald-900/10 border-emerald-500/30 shadow-lg'
                    : 'bg-slate-900/30 border-slate-800/50 hover:border-slate-700 hover:bg-slate-900/50',
                )}
              >
                {/* Header (Number + Actions) */}
                <div className="flex items-center justify-between mb-6 bg-slate-950/30 rounded-xl p-2">
                  <span className="inline-flex items-center justify-center w-8 h-8 text-sm font-bold bg-slate-800 text-emerald-400 rounded-lg border border-slate-700/50 font-serif">
                    {ayah.nomorAyat}
                  </span>

                  <div className="flex items-center gap-1">
                    {ayah.audio && Object.keys(ayah.audio).length > 0 && (
                      <button
                        type="button"
                        aria-label={
                          isActive
                            ? `Pause ayah ${ayah.nomorAyat}`
                            : `Play ayah ${ayah.nomorAyat}`
                        }
                        onClick={() => {
                          const audioUrl = Object.values(ayah.audio)[0];
                          if (isActive) {
                            stopAudio();
                          } else {
                            playAyahAudio(audioUrl, ayah.nomorAyat);
                          }
                        }}
                        className={cn(
                          'p-3 rounded-lg transition-colors',
                          isActive
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'hover:bg-slate-800 text-slate-400',
                        )}
                      >
                        {isActive ? (
                          <Pause className="w-4 h-4 fill-current" />
                        ) : (
                          <Play className="w-4 h-4 fill-current" />
                        )}
                      </button>
                    )}
                    <button
                      type="button"
                      aria-label={`Mark ayah ${ayah.nomorAyat} as last read`}
                      onClick={() => handleMarkProgress(ayah.nomorAyat)}
                      className="p-3 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-emerald-400 transition-colors"
                      title={t.markLast}
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Bookmark ayah ${ayah.nomorAyat}`}
                      onClick={() => {
                        const bookmarkId = `ayah-${selectedSurah.nomor}-${ayah.nomorAyat}`;
                        toggleBookmark({
                          id: bookmarkId,
                          type: 'ayah',
                          title: `${selectedSurah.namaLatin} : ${ayah.nomorAyat}`,
                          subtitle: selectedSurah.arti,
                          content: ayah.teksIndonesia,
                          createdAt: new Date().toISOString(),
                        });
                      }}
                      className={cn(
                        'p-3 rounded-lg hover:bg-slate-800 transition-colors',
                        isBookmarked(
                          'ayah',
                          `ayah-${selectedSurah.nomor}-${ayah.nomorAyat}`,
                        )
                          ? 'text-amber-400'
                          : 'text-slate-400 hover:text-amber-400',
                      )}
                    >
                      <Bookmark className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-6">
                  {/* Arabic */}
                  <p
                    className="text-3xl sm:text-4xl text-right leading-[2.2] text-slate-100 font-serif"
                    dir="rtl"
                  >
                    {ayah.teksArab}
                  </p>

                  {/* Translations */}
                  <div className="space-y-3 pt-2 border-t border-slate-800/30">
                    <p className="text-emerald-400/90 text-sm font-medium italic">
                      {ayah.teksLatin}
                    </p>
                    <p className="text-slate-300 text-base leading-relaxed">
                      {ayah.teksIndonesia}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Sticky Player (Only when playing) */}
        <AnimatePresence>
          {(playingAudio || playingFullSurah) && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-[440px] px-4 pb-safe z-50"
            >
              <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/50 rounded-2xl p-4 shadow-xl flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-emerald-400 text-xs font-bold uppercase mb-0.5">
                    Now Playing
                  </p>
                  <p className="text-white text-sm font-medium truncate">
                    {playingFullSurah
                      ? `Full Surah: ${selectedSurah.namaLatin}`
                      : `Ayat ${playingAyah}`}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {/* Simplified controls for now */}
                  <button
                    type="button"
                    aria-label="Pause audio playback"
                    onClick={stopAudio}
                    className="w-12 h-12 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center transition-colors shadow-lg"
                  >
                    <Pause className="w-4 h-4 fill-current" />
                  </button>
                  <button
                    type="button"
                    aria-label="Close audio player"
                    onClick={stopAudio}
                    className="p-3 text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </ResponsiveLayout>
    );
  }

  /* =========================================================================
     SURAH LIST VIEW
     ========================================================================= */
  const handleContinueReading = () => {
    if (readingProgress) {
      loadSurah(readingProgress.surahNumber);
      // Could also scroll to ayah here in the future
    }
  };

  return (
    <ResponsiveLayout className="pb-24">
      {/* Header - Mobile Only or desktop title? */}
      <header className="px-6 py-4 sticky top-0 bg-[#020617]/80 backdrop-blur z-20 space-y-4 border-b border-slate-800/50 md:hidden">
        <div className="flex items-center justify-between">
          <button
            type="button"
            aria-label="Back to dashboard"
            onClick={() => navigate('/dashboard')}
            className="p-2 -ml-2 rounded-lg hover:bg-slate-800/50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </button>
          <span className="font-serif text-lg text-white">{t.title}</span>
          <div className="w-9" />
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="search"
            name="quran-search-mobile"
            aria-label={t.searchPlaceholder}
            autoComplete="off"
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-base text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </header>

      {/* Desktop Header / Search */}
      <div className="hidden md:flex items-center justify-between mb-6">
        <h1 className="font-serif text-3xl text-white">{t.title}</h1>
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="search"
            name="quran-search-desktop"
            aria-label={t.searchPlaceholder}
            autoComplete="off"
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
          />
        </div>
      </div>

      <ScrollArea className="h-[calc(100dvh-140px)] md:h-auto">
        <div className="px-6 py-4 space-y-6 pb-32 md:p-0 md:pb-0">
          {/* Last Read Card - Only show if no search query */}
          {!searchQuery && readingProgress && (
            <div className="relative overflow-hidden rounded-2xl bg-indigo-500/10 border border-indigo-500/20 p-6">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl" />

              <div className="relative z-10 flex items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-semibold text-indigo-300 uppercase">
                      {t.lastRead}
                    </span>
                  </div>
                  <p className="text-xl font-serif text-white mb-1">
                    {t.surah} {readingProgress.surahNumber}
                  </p>
                  <p className="text-slate-400 text-sm">
                    {t.ayat} {readingProgress.ayahNumber}
                  </p>
                </div>

                <button
                  type="button"
                  aria-label="Continue reading from last progress"
                  onClick={handleContinueReading}
                  className="shrink-0 w-12 h-12 rounded-full bg-indigo-500 hover:bg-indigo-400 flex items-center justify-center text-white shadow-lg transition-transform active:scale-95"
                >
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                </button>
              </div>
            </div>
          )}

          {/* Surah List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredSurahs.length > 0 ? (
              filteredSurahs.map((surah, i) => (
                <motion.button
                  key={surah.nomor}
                  onClick={() => loadSurah(surah.nomor)}
                  disabled={isLoadingSurah}
                  className="w-full p-4 rounded-2xl border border-slate-800/60 bg-slate-900/20 hover:bg-slate-800/50 hover:border-emerald-500/20 transition-colors flex items-center gap-4 text-left group disabled:opacity-50"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.03, 0.5) }}
                >
                  {/* Number */}
                  <div className="w-10 h-10 shrink-0 rounded-xl bg-slate-800/50 group-hover:bg-emerald-500/10 flex items-center justify-center text-slate-400 group-hover:text-emerald-400 font-bold text-sm transition-colors border border-slate-700/50 group-hover:border-emerald-500/10 font-serif">
                    {surah.nomor}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between">
                      <p className="text-white font-medium group-hover:text-emerald-200 transition-colors truncate pr-2">
                        {surah.namaLatin}
                      </p>
                      <span className="text-xl text-slate-700 group-hover:text-emerald-500/20 font-serif transition-colors shrink-0">
                        {surah.nama}
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs mt-0.5 truncate">
                      {surah.arti} • {surah.jumlahAyat} {t.ayat}
                    </p>
                  </div>
                </motion.button>
              ))
            ) : (
              <div className="text-center py-12 text-slate-500">
                <p>{t.noResults}</p>
              </div>
            )}
          </div>
        </div>
      </ScrollArea>

      {/* Loading Overlay */}
      {isLoadingSurah && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 rounded-2xl p-6 flex items-center gap-4 border border-slate-800 shadow-2xl">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
            <span className="text-slate-200 font-medium">{t.loading}</span>
          </div>
        </div>
      )}
    </ResponsiveLayout>
    );
  }

  // List View
  return (
    <ResponsiveLayout>
      <div className="max-w-4xl mx-auto w-full">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-[#020617]/95 backdrop-blur border-b border-slate-800/50">
          <div className="px-6 py-4 md:px-0 md:py-6">
            <h1 className="font-serif text-2xl text-white mb-1">{t.title}</h1>
            <p className="text-slate-400 text-sm">{t.subtitle}</p>
          </div>
          {/* Search */}
          <div className="px-6 pb-4 md:px-0 relative">
            <Search className="absolute left-9 md:left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-base"
            />
          </div>
        </header>

        {/* Surah List */}
        <div className="px-6 py-4 md:px-0 space-y-3 pb-32">
          {filteredSurahs.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-slate-800 mx-auto mb-4" />
              <p className="text-slate-500">{t.noResults}</p>
            </div>
          ) : (
            filteredSurahs.map((surah) => (
              <motion.div
                key={surah.nomor}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => loadSurah(surah.nomor)}
                className="group p-4 rounded-2xl border border-slate-800 bg-slate-900/40 hover:bg-slate-800/60 transition-all cursor-pointer flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-medium text-slate-400 group-hover:text-emerald-400 group-hover:bg-emerald-500/10 transition-colors">
                  {surah.nomor}
                </div>
                <div className="flex-1">
                  <h3 className="font-serif text-lg text-white group-hover:text-emerald-400 transition-colors">
                    {surah.namaLatin}
                  </h3>
                  <p className="text-slate-400 text-xs mt-0.5">
                    {surah.arti} • {surah.jumlahAyat} {t.ayat}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-serif text-xl text-emerald-500/40 font-medium">
                    {surah.nama}
                  </p>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </ResponsiveLayout>
  );
};

export default QuranPage;
