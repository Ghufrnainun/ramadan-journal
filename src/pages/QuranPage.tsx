import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, Target, TrendingUp } from 'lucide-react';
import { getProfile } from '@/lib/storage';
import { Card, CardContent } from '@/components/ui/card';

const content = {
  id: {
    title: 'Tadarus',
    subtitle: 'Tracking bacaan Al-Quran',
    currentProgress: 'Progress Saat Ini',
    juz: 'Juz',
    surah: 'Surah',
    page: 'Halaman',
    dailyTarget: 'Target Harian',
    pagesPerDay: 'halaman/hari',
    comingSoon: 'Fitur lengkap segera hadir',
    startReading: 'Mulai Membaca',
    features: [
      'Tracking progress juz dan halaman',
      'Target harian yang bisa disesuaikan',
      'Bookmark ayat favorit',
      'Statistik bacaan mingguan',
    ],
  },
  en: {
    title: 'Quran Reading',
    subtitle: 'Track your Quran progress',
    currentProgress: 'Current Progress',
    juz: 'Juz',
    surah: 'Surah',
    page: 'Page',
    dailyTarget: 'Daily Target',
    pagesPerDay: 'pages/day',
    comingSoon: 'Full features coming soon',
    startReading: 'Start Reading',
    features: [
      'Track juz and page progress',
      'Customizable daily targets',
      'Bookmark favorite verses',
      'Weekly reading statistics',
    ],
  },
};

const QuranPage: React.FC = () => {
  const navigate = useNavigate();
  const [lang, setLang] = useState<'id' | 'en'>('id');

  useEffect(() => {
    const profile = getProfile();
    if (!profile.onboardingCompleted) {
      navigate('/onboarding');
      return;
    }
    setLang(profile.language);
  }, [navigate]);

  const t = content[lang];

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
        <span className="font-serif text-lg text-white">{t.title}</span>
        <div className="w-9" />
      </header>

      <div className="px-6 py-6 space-y-6">
        {/* Hero Section */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-10 h-10 text-emerald-400" />
          </div>
          <h1 className="font-serif text-2xl text-white mb-2">{t.title}</h1>
          <p className="text-slate-400 text-sm">{t.subtitle}</p>
        </motion.div>

        {/* Progress Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                <span className="text-slate-400 text-sm">{t.currentProgress}</span>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-slate-800/50 rounded-xl p-4">
                  <p className="text-2xl font-serif text-white">1</p>
                  <p className="text-xs text-slate-500 mt-1">{t.juz}</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4">
                  <p className="text-2xl font-serif text-white">1</p>
                  <p className="text-xs text-slate-500 mt-1">{t.surah}</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4">
                  <p className="text-2xl font-serif text-white">1</p>
                  <p className="text-xs text-slate-500 mt-1">{t.page}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Daily Target */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="bg-slate-800/30 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <Target className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{t.dailyTarget}</p>
                    <p className="text-slate-500 text-sm">20 {t.pagesPerDay}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Coming Soon Features */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-slate-800/20 border-slate-700/50">
            <CardContent className="p-6">
              <p className="text-amber-400 text-sm font-medium mb-4">
                ✨ {t.comingSoon}
              </p>
              <ul className="space-y-3">
                {t.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-emerald-400 mt-0.5">•</span>
                    <span className="text-slate-400 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>

        {/* Start Reading Button */}
        <motion.button
          className="w-full py-4 rounded-xl font-semibold bg-gradient-to-r from-emerald-500 to-emerald-600 text-white transition-all hover:shadow-lg hover:shadow-emerald-500/20"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          whileTap={{ scale: 0.98 }}
        >
          {t.startReading}
        </motion.button>
      </div>
    </div>
  );
};

export default QuranPage;
