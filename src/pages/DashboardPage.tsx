import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Moon, Settings, MapPin, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { getProfile, UserProfile } from '@/lib/storage';
import { getTodayQuote } from '@/data/daily-quotes';
import { getRamadanInfo, getRamadanGreeting } from '@/lib/ramadan-dates';
import CountdownCard from '@/components/dashboard/CountdownCard';
import QuoteCard from '@/components/dashboard/QuoteCard';
import PrayerTimesCard from '@/components/dashboard/PrayerTimesCard';
import ImsakiyahCard from '@/components/dashboard/ImsakiyahCard';
import QuickActions from '@/components/dashboard/QuickActions';
import RemindersBanner from '@/components/dashboard/RemindersBanner';
import DailyStatusCard from '@/components/dashboard/DailyStatusCard';
import QuranProgressCard from '@/components/dashboard/QuranProgressCard';
import RamadanGoalsCard from '@/components/dashboard/RamadanGoalsCard';
import { getDailyProgressStats, generateDailyProgressCard, shareImage } from '@/lib/share-card';

import ResponsiveLayout from '@/components/layout/ResponsiveLayout';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    // ProtectedRoute sudah handle redirect auth + onboarding.
    // Di sini cukup load profile lokal untuk render UI.
    const stored = getProfile();
    setProfile(stored);
  }, []);

  if (!profile) return null;

  const lang = profile.language;
  const t = {
    id: {
      menu: 'Menu',
      goals: 'Target Ramadan',
      stats: 'Statistik',
      home: 'Beranda',
      more: 'Lainnya',
    },
    en: {
      menu: 'Menu',
      goals: 'Ramadan Goals',
      stats: 'Statistics',
      home: 'Home',
      more: 'More',
    },
  }[lang];
  const quote = getTodayQuote(
    profile.ramadanStartDate ? new Date(profile.ramadanStartDate) : null,
  );

  // Get dynamic greeting based on Ramadan status
  const ramadanInfo = getRamadanInfo(new Date(), profile.ramadanStartDate, profile.ramadanEndDate);
  const greeting = getRamadanGreeting(lang, ramadanInfo.status);

  const [sharing, setSharing] = useState(false);

  const handleShareProgress = async () => {
    if (sharing) return;
    setSharing(true);
    try {
      const stats = await getDailyProgressStats();
      const blob = await generateDailyProgressCard(stats, lang);
      await shareImage(blob, 'ramadan-progress.png');
    } catch (e) {
      console.error('Share failed', e);
      toast.error(lang === 'id' ? 'Gagal membuat share card' : 'Failed to create share card');
    } finally {
      setSharing(false);
    }
  };

  const handleNavigate = (module: string) => {
    const routes: Record<string, string> = {
      quran: '/quran',
      dhikr: '/dhikr',
      doa: '/doa',
      tracker: '/tracker',
      reflection: '/reflection',
      calendar: '/calendar',
      goals: '/goals',
      stats: '/stats',
    };
    navigate(routes[module] || '/dashboard');
  };

  return (
    <ResponsiveLayout>
      {/* Header - Mobile Only */}
      <header className="flex md:hidden items-center justify-between px-6 py-6 pt-8">
        <div className="flex items-center gap-2">
          <Moon className="w-6 h-6 text-amber-400" />
          <div>
            <span className="font-serif text-xl text-white block leading-none">
              MyRamadhan
            </span>
            <span className="text-[10px] text-slate-400 uppercase">
              Journal
            </span>
          </div>
        </div>
        <button
          type="button"
          aria-label="Open settings"
          onClick={() => navigate('/settings')}
          className="w-12 h-12 rounded-full bg-slate-900/50 border border-slate-800 flex items-center justify-center hover:bg-slate-800 transition-colors"
        >
          <Settings className="w-5 h-5 text-slate-400" />
        </button>
      </header>

      {/* Main Content */}
      <main className="px-6 pb-32 space-y-6 md:p-0 md:pb-0">
        {/* Greeting & Location */}
        <div className="space-y-1">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="font-serif text-3xl text-white">
              {greeting.greeting}
            </h1>
            <p className="text-slate-400">{greeting.subtitle}</p>
          </motion.div>

          {/* Location Badge */}
          {profile.location && (
            <motion.div
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/50 border border-slate-800 mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <MapPin className="w-3 h-3 text-amber-500" />
              <span className="text-slate-300 text-xs font-medium">
                {profile.location.city}, {profile.location.province}
              </span>
            </motion.div>
          )}
        </div>

        {/* Reminders Banner */}
        {profile.location && (
          <RemindersBanner
            lang={lang}
            location={profile.location}
            ramadanStartDate={profile.ramadanStartDate}
            ramadanEndDate={profile.ramadanEndDate || null}
            reminders={profile.reminders}
            silentMode={profile.silentMode}
          />
        )}

        {/* Hero Section: Countdown + Share */}
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <CountdownCard lang={lang} ramadanStartDate={profile.ramadanStartDate} ramadanEndDate={profile.ramadanEndDate} />
          </div>
          <button
            type="button"
            onClick={handleShareProgress}
            disabled={sharing}
            className="mt-1 shrink-0 w-11 h-11 rounded-xl border border-amber-500/30 bg-amber-500/10 flex items-center justify-center text-amber-300 hover:bg-amber-500/20 transition-colors disabled:opacity-50"
            aria-label="Share progress"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Actions - Grid Layout for variation */}
        <div>
          <h3 className="text-sm font-medium text-slate-400 mb-3 uppercase pl-1">
            {t.menu}
          </h3>
          <QuickActions
            lang={lang}
            focusModules={profile.focusModules}
            onNavigate={handleNavigate}
          />
          <div className="mt-3 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => navigate('/goals')}
              className="rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3 text-left text-sm text-slate-200 transition-colors hover:border-amber-400/40 hover:bg-amber-500/10"
            >
              {t.goals}
            </button>
            <button
              type="button"
              onClick={() => navigate('/stats')}
              className="rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3 text-left text-sm text-slate-200 transition-colors hover:border-emerald-400/40 hover:bg-emerald-500/10"
            >
              {t.stats}
            </button>
          </div>
        </div>

        {/* Info Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
          {/* Prayer Times */}
          {profile.location && (
            <PrayerTimesCard
              lang={lang}
              city={profile.location.city}
              province={profile.location.province}
            />
          )}

          {/* Daily Status */}
          <DailyStatusCard lang={lang} />

          {/* Quran progress */}
          <QuranProgressCard />

          {/* Quote of the Day */}
          <QuoteCard lang={lang} quote={quote} />

          {/* Goals summary */}
          <RamadanGoalsCard />

          {/* Imsakiyah Card - Show only during Ramadan */}
          {profile.location && ramadanInfo.status === 'during' && (
            <ImsakiyahCard
              lang={lang}
              provinsi={profile.location.province}
              kabkota={profile.location.city}
            />
          )}
        </div>
      </main>

      {/* Bottom Navigation - Mobile Only */}
      <nav className="fixed bottom-0 z-50 w-full md:hidden bg-[#020617]/80 backdrop-blur-xl border-t border-slate-800/50 pb-safe">
        <div className="flex items-center justify-around px-2 py-3">
          <button
            type="button"
            aria-current="page"
            disabled
            className="flex flex-col items-center gap-1 text-amber-400 cursor-default"
          >
            <Moon className="w-6 h-6 fill-amber-400/20" />
            <span className="text-[11px] font-medium">{t.home}</span>
          </button>
          <button
            onClick={() => navigate('/quran')}
            className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-300 transition-colors"
          >
            <motion.div whileTap={{ scale: 0.9 }}>
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </motion.div>
            <span className="text-[11px] font-medium">Quran</span>
          </button>
          <button
            onClick={() => navigate('/dhikr')}
            className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-300 transition-colors"
          >
            <motion.div whileTap={{ scale: 0.9 }}>
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </motion.div>
            <span className="text-[11px] font-medium">Dzikir</span>
          </button>
          <button
            onClick={() => navigate('/tracker')}
            className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-300 transition-colors"
          >
            <motion.div whileTap={{ scale: 0.9 }}>
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
            </motion.div>
            <span className="text-[11px] font-medium">Tracker</span>
          </button>
          <button
            onClick={() => navigate('/settings')}
            className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-300 transition-colors"
          >
            <motion.div whileTap={{ scale: 0.9 }}>
              <Settings className="w-6 h-6" />
            </motion.div>
            <span className="text-[11px] font-medium">{t.more}</span>
          </button>
        </div>
      </nav>
    </ResponsiveLayout>
  );
};

export default DashboardPage;
