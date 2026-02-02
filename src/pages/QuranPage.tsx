import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, ChevronRight, Play, Pause, Loader2 } from 'lucide-react';
import { getProfile } from '@/lib/storage';
import { equranApi, Surah, SurahDetail } from '@/lib/api/equran';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

const content = {
  id: {
    title: 'Tadarus',
    subtitle: 'Al-Quran Digital',
    loading: 'Memuat...',
    error: 'Gagal memuat data',
    retry: 'Coba Lagi',
    ayat: 'ayat',
    surah: 'Surat',
    juz: 'Juz',
    page: 'Halaman',
  },
  en: {
    title: 'Quran Reading',
    subtitle: 'Digital Quran',
    loading: 'Loading...',
    error: 'Failed to load data',
    retry: 'Try Again',
    ayat: 'verses',
    surah: 'Surah',
    juz: 'Juz',
    page: 'Page',
  },
};

const QuranPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [lang, setLang] = useState<'id' | 'en'>('id');
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<SurahDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSurah, setIsLoadingSurah] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playingAudio, setPlayingAudio] = useState<HTMLAudioElement | null>(null);
  const [playingAyah, setPlayingAyah] = useState<number | null>(null);

  const t = content[lang];

  useEffect(() => {
    const profile = getProfile();
    if (!profile.onboardingCompleted) {
      navigate('/onboarding');
      return;
    }
    setLang(profile.language);
    loadSurahs();
  }, [navigate]);

  useEffect(() => {
    const surahParam = searchParams.get('surah');
    if (surahParam && surahs.length > 0) {
      loadSurah(parseInt(surahParam));
    }
  }, [searchParams, surahs]);

  const loadSurahs = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await equranApi.getAllSurahs();
      setSurahs(data);
    } catch (err) {
      setError(t.error);
      console.error('Failed to load surahs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSurah = async (number: number) => {
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

  const stopAudio = () => {
    if (playingAudio) {
      playingAudio.pause();
      playingAudio.currentTime = 0;
      setPlayingAudio(null);
      setPlayingAyah(null);
    }
  };

  // Surah Detail View
  if (selectedSurah) {
    return (
      <div className="min-h-screen bg-[#020617] text-slate-200">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-[#020617]/95 backdrop-blur border-b border-slate-800/50">
          <div className="flex items-center justify-between px-6 py-4">
            <button
              onClick={handleBack}
              className="p-2 -ml-2 rounded-lg hover:bg-slate-800/50 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-400" />
            </button>
            <div className="text-center">
              <span className="font-serif text-lg text-white">{selectedSurah.namaLatin}</span>
              <p className="text-xs text-slate-500">{selectedSurah.arti}</p>
            </div>
            <div className="w-9" />
          </div>
        </header>

        {/* Surah Info Card */}
        <div className="px-6 py-4">
          <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20">
            <CardContent className="p-6 text-center">
              <p className="text-4xl text-amber-400 font-serif mb-2">{selectedSurah.nama}</p>
              <p className="text-slate-400 text-sm">
                {selectedSurah.tempatTurun} • {selectedSurah.jumlahAyat} {t.ayat}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Bismillah */}
        {selectedSurah.nomor !== 1 && selectedSurah.nomor !== 9 && (
          <div className="px-6 py-4">
            <p className="text-3xl text-center text-amber-400 font-serif">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </p>
          </div>
        )}

        {/* Ayahs */}
        <ScrollArea className="h-[calc(100vh-280px)]">
          <div className="px-6 pb-24 space-y-6">
            {selectedSurah.ayat.map((ayah) => (
              <motion.div
                key={ayah.nomorAyat}
                className="border-b border-slate-800/30 pb-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {/* Arabic Text */}
                <div className="flex justify-between items-start mb-4">
                  <p 
                    className="text-2xl text-right leading-loose flex-1 text-white font-serif" 
                    dir="rtl"
                    style={{ fontFamily: 'serif', lineHeight: 2.2 }}
                  >
                    {ayah.teksArab}
                    <span className="inline-flex items-center justify-center w-8 h-8 ml-2 text-sm bg-amber-500/20 text-amber-400 rounded-full">
                      {ayah.nomorAyat}
                    </span>
                  </p>
                </div>

                {/* Latin Transliteration */}
                <p className="text-slate-400 text-sm italic mb-2">{ayah.teksLatin}</p>

                {/* Indonesian Translation */}
                <p className="text-slate-300 text-sm">{ayah.teksIndonesia}</p>

                {/* Audio Button */}
                {ayah.audio && Object.keys(ayah.audio).length > 0 && (
                  <button
                    onClick={() => {
                      const audioUrl = Object.values(ayah.audio)[0];
                      if (playingAyah === ayah.nomorAyat) {
                        stopAudio();
                      } else {
                        playAyahAudio(audioUrl, ayah.nomorAyat);
                      }
                    }}
                    className="mt-3 flex items-center gap-2 text-emerald-400 text-sm hover:text-emerald-300 transition-colors"
                  >
                    {playingAyah === ayah.nomorAyat ? (
                      <>
                        <Pause className="w-4 h-4" />
                        <span>Pause</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        <span>Play Audio</span>
                      </>
                    )}
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      </div>
    );
  }

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#020617] text-slate-200 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-amber-400 mx-auto mb-4" />
          <p className="text-slate-400">{t.loading}</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-[#020617] text-slate-200 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={loadSurahs}
            className="px-6 py-3 bg-amber-500 text-slate-900 rounded-xl font-medium"
          >
            {t.retry}
          </button>
        </div>
      </div>
    );
  }

  // Surah List View
  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 pb-24">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800/50">
        <button
          onClick={() => navigate('/dashboard')}
          className="p-2 -ml-2 rounded-lg hover:bg-slate-800/50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-400" />
        </button>
        <div className="text-center">
          <span className="font-serif text-lg text-white">{t.title}</span>
          <p className="text-xs text-slate-500">{t.subtitle}</p>
        </div>
        <div className="w-9" />
      </header>

      {/* Surah List */}
      <ScrollArea className="h-[calc(100vh-80px)]">
        <div className="px-6 py-4 space-y-2">
          {surahs.map((surah, i) => (
            <motion.button
              key={surah.nomor}
              onClick={() => loadSurah(surah.nomor)}
              disabled={isLoadingSurah}
              className="w-full p-4 rounded-xl border border-slate-800 bg-slate-800/30 hover:border-emerald-500/50 transition-all flex items-center gap-4 text-left disabled:opacity-50"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.02, 0.5) }}
            >
              {/* Number */}
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-medium text-sm">
                {surah.nomor}
              </div>

              {/* Info */}
              <div className="flex-1">
                <p className="text-white font-medium">{surah.namaLatin}</p>
                <p className="text-slate-500 text-sm">
                  {surah.arti} • {surah.jumlahAyat} {t.ayat}
                </p>
              </div>

              {/* Arabic Name */}
              <p className="text-xl text-amber-400 font-serif">{surah.nama}</p>

              <ChevronRight className="w-5 h-5 text-slate-600" />
            </motion.button>
          ))}
        </div>
      </ScrollArea>

      {/* Loading Overlay */}
      {isLoadingSurah && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-900 rounded-2xl p-6 flex items-center gap-4">
            <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
            <span className="text-white">{t.loading}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuranPage;
