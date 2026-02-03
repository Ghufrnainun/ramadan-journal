import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Moon, Settings, MapPin } from 'lucide-react';
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

import MobileContainer from '@/components/layout/MobileContainer';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const stored = getProfile();

    // If not completed onboarding, redirect
    if (!stored.onboardingCompleted) {
      navigate('/onboarding');
      return;
    }

    setProfile(stored);
  }, [navigate]);

  if (!profile) return null;

  const lang = profile.language;
  const quote = getTodayQuote(
    profile.ramadanStartDate ? new Date(profile.ramadanStartDate) : null,
  );

  // Get dynamic greeting based on Ramadan status
  const ramadanInfo = getRamadanInfo();
  const greeting = getRamadanGreeting(lang, ramadanInfo.status);

  const handleNavigate = (module: string) => {
    const routes: Record<string, string> = {
      quran: '/quran',
      dhikr: '/dhikr',
      doa: '/doa',
      tracker: '/tracker',
      reflection: '/reflection',
      calendar: '/calendar',
    };
    navigate(routes[module] || '/dashboard');
  };

  return (
    <MobileContainer>
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-6 pt-8">
        <div className="flex items-center gap-2">
          <Moon className="w-6 h-6 text-amber-400" />
          <div>
            <span className="font-serif text-xl text-white block leading-none">
              MyRamadhan
            </span>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest">
              Journal
            </span>
          </div>
        </div>
        <button
          onClick={() => navigate('/settings')}
          className="w-10 h-10 rounded-full bg-slate-900/50 border border-slate-800 flex items-center justify-center hover:bg-slate-800 transition-colors"
        >
          <Settings className="w-5 h-5 text-slate-400" />
        </button>
      </header>

      {/* Main Content */}
      <main className="px-6 pb-32 space-y-6">
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

        {/* Hero Section: Countdown */}
        <CountdownCard lang={lang} />

        {/* Quick Actions - Grid Layout for variation */}
        <div>
          <h3 className="text-sm font-medium text-slate-500 mb-3 uppercase tracking-wider pl-1">
            Menu
          </h3>
          <QuickActions
            lang={lang}
            focusModules={profile.focusModules}
            onNavigate={handleNavigate}
          />
        </div>

        {/* Info Cards Grid */}
        <div className="grid grid-cols-1 gap-4">
          {/* Prayer Times */}
          {profile.location && (
            <PrayerTimesCard lang={lang} city={profile.location.city} />
          )}

          {/* Daily Status */}
          <DailyStatusCard lang={lang} />

          {/* Quote of the Day */}
          <QuoteCard lang={lang} quote={quote} />

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

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 z-50 w-full max-w-[480px] bg-[#020617]/80 backdrop-blur-xl border-t border-slate-800/50 pb-safe">
        <div className="flex items-center justify-around px-2 py-3">
          <button className="flex flex-col items-center gap-1 text-amber-400">
            <Moon className="w-6 h-6 fill-amber-400/20" />
            <span className="text-[10px] font-medium">Home</span>
          </button>
          <button
            onClick={() => navigate('/quran')}
            className="flex flex-col items-center gap-1 text-slate-500 hover:text-slate-300 transition-colors"
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
            <span className="text-[10px] font-medium">Quran</span>
          </button>
          <button
            onClick={() => navigate('/dhikr')}
            className="flex flex-col items-center gap-1 text-slate-500 hover:text-slate-300 transition-colors"
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
            <span className="text-[10px] font-medium">Dzikir</span>
          </button>
          <button
            onClick={() => navigate('/tracker')}
            className="flex flex-col items-center gap-1 text-slate-500 hover:text-slate-300 transition-colors"
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
            <span className="text-[10px] font-medium">Tracker</span>
          </button>
          <button
            onClick={() => navigate('/settings')}
            className="flex flex-col items-center gap-1 text-slate-500 hover:text-slate-300 transition-colors"
          >
            <motion.div whileTap={{ scale: 0.9 }}>
              <Settings className="w-6 h-6" />
            </motion.div>
            <span className="text-[10px] font-medium">More</span>
          </button>
        </div>
      </nav>
    </MobileContainer>
  );
};

export default DashboardPage;
