import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Moon, Settings, MapPin } from 'lucide-react';
import { getProfile, UserProfile } from '@/lib/storage';

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

  const content = {
    id: {
      greeting: 'Marhaban ya Ramadan',
      subtitle: 'Selamat menjalankan ibadah',
      comingSoon: 'Fitur lengkap segera hadir...',
      location: 'Lokasi',
    },
    en: {
      greeting: 'Welcome to Ramadan',
      subtitle: 'May your worship be accepted',
      comingSoon: 'Full features coming soon...',
      location: 'Location',
    },
  };

  const t = content[lang];

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
      <main className="px-6 py-8">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-serif text-3xl text-white mb-2">{t.greeting}</h1>
          <p className="text-slate-400">{t.subtitle}</p>
        </motion.div>

        {/* Location Badge */}
        {profile.location && (
          <motion.div
            className="flex items-center justify-center gap-2 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <MapPin className="w-4 h-4 text-amber-400" />
            <span className="text-amber-400/80 text-sm">
              {profile.location.city}, {profile.location.province}
            </span>
          </motion.div>
        )}

        {/* Placeholder Card */}
        <motion.div
          className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
            <Moon className="w-8 h-8 text-amber-400" />
          </div>
          <p className="text-slate-400">{t.comingSoon}</p>
          <p className="text-slate-500 text-sm mt-2">
            Dashboard, Prayer Times, Dhikr Counter, Daily Tracker
          </p>
        </motion.div>
      </main>
    </div>
  );
};

export default DashboardPage;
