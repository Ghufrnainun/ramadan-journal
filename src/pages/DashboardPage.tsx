import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Moon, Settings, MapPin } from 'lucide-react';
import { getProfile, UserProfile } from '@/lib/storage';
import { getTodayQuote } from '@/data/daily-quotes';
import CountdownCard from '@/components/dashboard/CountdownCard';
import QuoteCard from '@/components/dashboard/QuoteCard';
import PrayerTimesCard from '@/components/dashboard/PrayerTimesCard';
import QuickActions from '@/components/dashboard/QuickActions';

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
  const quote = getTodayQuote(profile.ramadanStartDate ? new Date(profile.ramadanStartDate) : null);

  const content = {
    id: {
      greeting: 'Marhaban ya Ramadan',
      subtitle: 'Selamat menjalankan ibadah',
    },
    en: {
      greeting: 'Welcome to Ramadan',
      subtitle: 'May your worship be accepted',
    },
  };

  const t = content[lang];

  const handleNavigate = (module: string) => {
    // Will be implemented when modules are built
    console.log('Navigate to:', module);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800/50">
        <div className="flex items-center gap-2">
          <Moon className="w-5 h-5 text-amber-400" />
          <span className="font-serif text-lg text-white">MyRamadhanKu</span>
        </div>
        <button
          onClick={() => navigate('/settings')}
          className="p-2 rounded-lg hover:bg-slate-800/50 transition-colors"
        >
          <Settings className="w-5 h-5 text-slate-400" />
        </button>
      </header>

      {/* Main Content */}
      <main className="px-6 py-6 pb-24 space-y-5">
        {/* Greeting */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-serif text-2xl text-white mb-1">{t.greeting}</h1>
          <p className="text-slate-400 text-sm">{t.subtitle}</p>
        </motion.div>

        {/* Location Badge */}
        {profile.location && (
          <motion.div
            className="flex items-center justify-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-amber-400/80 text-xs">
              {profile.location.city}, {profile.location.province}
            </span>
          </motion.div>
        )}

        {/* Countdown Card */}
        <CountdownCard 
          lang={lang} 
          ramadanStartDate={profile.ramadanStartDate} 
        />

        {/* Prayer Times Card */}
        {profile.location && (
          <PrayerTimesCard 
            lang={lang} 
            city={profile.location.city} 
          />
        )}

        {/* Quote of the Day */}
        <QuoteCard lang={lang} quote={quote} />

        {/* Quick Actions */}
        <QuickActions 
          lang={lang} 
          focusModules={profile.focusModules}
          onNavigate={handleNavigate}
        />
      </main>

      {/* Bottom Navigation Placeholder */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur border-t border-slate-800/50 px-6 py-3">
        <div className="flex items-center justify-around">
          <button className="flex flex-col items-center gap-1 text-amber-400">
            <Moon className="w-5 h-5" />
            <span className="text-xs">Home</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-slate-500 hover:text-slate-400 transition-colors">
            <motion.div whileTap={{ scale: 0.9 }}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </motion.div>
            <span className="text-xs">Quran</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-slate-500 hover:text-slate-400 transition-colors">
            <motion.div whileTap={{ scale: 0.9 }}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </motion.div>
            <span className="text-xs">Dzikir</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-slate-500 hover:text-slate-400 transition-colors">
            <motion.div whileTap={{ scale: 0.9 }}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </motion.div>
            <span className="text-xs">Tracker</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default DashboardPage;
