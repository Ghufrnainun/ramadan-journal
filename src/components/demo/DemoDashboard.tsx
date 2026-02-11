import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, MapPin, BookOpen, Heart, Calendar, Sparkles } from 'lucide-react';

interface DemoDashboardProps {
  lang: 'id' | 'en';
}

const content = {
  id: {
    location: 'Jakarta Selatan, DKI Jakarta',
    nextPrayer: 'Maghrib',
    prayerTimes: {
      title: 'Waktu Sholat',
      subuh: 'Subuh',
      dzuhur: 'Dzuhur', 
      ashar: 'Ashar',
      maghrib: 'Maghrib',
      isya: 'Isya',
    },
    countdown: 'Menuju',
    quote: {
      text: '"Sesungguhnya Allah beserta orang-orang yang sabar."',
      source: 'QS. Al-Baqarah: 153',
    },
    quickActions: 'Aksi Cepat',
    actions: {
      quran: 'Al-Quran',
      dhikr: 'Dzikir',
      tracker: 'Tracker',
      calendar: 'Kalender',
    },
    loginHint: 'Login untuk mengakses',
  },
  en: {
    location: 'South Jakarta, DKI Jakarta',
    nextPrayer: 'Maghrib',
    prayerTimes: {
      title: 'Prayer Times',
      subuh: 'Fajr',
      dzuhur: 'Dhuhr',
      ashar: 'Asr',
      maghrib: 'Maghrib',
      isya: 'Isha',
    },
    countdown: 'Until',
    quote: {
      text: '"Indeed, Allah is with the patient."',
      source: 'QS. Al-Baqarah: 153',
    },
    quickActions: 'Quick Actions',
    actions: {
      quran: 'Quran',
      dhikr: 'Dhikr',
      tracker: 'Tracker',
      calendar: 'Calendar',
    },
    loginHint: 'Login to access',
  },
};

const MOCK_PRAYER_TIMES = {
  subuh: '04:32',
  dzuhur: '11:58',
  ashar: '15:15',
  maghrib: '17:48',
  isya: '19:02',
};

const DemoDashboard: React.FC<DemoDashboardProps> = ({ lang }) => {
  const t = content[lang];
  const [countdown, setCountdown] = useState({ hours: 2, minutes: 34, seconds: 12 });

  // Fake countdown animation
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(prev => {
        let { hours, minutes, seconds } = prev;
        seconds--;
        if (seconds < 0) {
          seconds = 59;
          minutes--;
        }
        if (minutes < 0) {
          minutes = 59;
          hours--;
        }
        if (hours < 0) {
          hours = 2;
          minutes = 34;
          seconds = 12;
        }
        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (n: number) => n.toString().padStart(2, '0');

  return (
    <div className="space-y-4">
      {/* Location */}
      <div className="flex items-center gap-2 text-slate-400 text-sm">
        <MapPin className="w-4 h-4" />
        <span>{t.location}</span>
      </div>

      {/* Countdown Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 rounded-2xl p-6"
      >
        <div className="flex items-center gap-2 text-amber-300 text-sm mb-2">
          <Clock className="w-4 h-4" />
          <span>{t.countdown} {t.nextPrayer}</span>
        </div>
        <div className="flex items-baseline gap-1 text-white font-serif">
          <span className="text-5xl">{formatTime(countdown.hours)}</span>
          <span className="text-3xl text-amber-400">:</span>
          <span className="text-5xl">{formatTime(countdown.minutes)}</span>
          <span className="text-3xl text-amber-400">:</span>
          <span className="text-5xl">{formatTime(countdown.seconds)}</span>
        </div>
      </motion.div>

      {/* Prayer Times */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4"
      >
        <h3 className="text-sm text-slate-400 mb-3">{t.prayerTimes.title}</h3>
        <div className="grid grid-cols-5 gap-2">
          {Object.entries(MOCK_PRAYER_TIMES).map(([key, time]) => {
            const isNext = key === 'maghrib';
            return (
              <div
                key={key}
                className={`text-center py-2 px-1 rounded-xl transition-colors ${
                  isNext 
                    ? 'bg-amber-500/20 border border-amber-500/30' 
                    : 'bg-slate-800/30'
                }`}
              >
                <p className={`text-xs mb-1 ${isNext ? 'text-amber-300' : 'text-slate-500'}`}>
                  {t.prayerTimes[key as keyof typeof t.prayerTimes]}
                </p>
                <p className={`text-sm font-medium ${isNext ? 'text-amber-200' : 'text-slate-300'}`}>
                  {time}
                </p>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Quote Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6"
      >
        <Sparkles className="w-5 h-5 text-amber-400 mb-3" />
        <p className="font-serif text-lg text-white leading-relaxed mb-2">
          {t.quote.text}
        </p>
        <p className="text-sm text-slate-500">{t.quote.source}</p>
      </motion.div>

      {/* Quick Actions (Disabled) */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4"
      >
        <h3 className="text-sm text-slate-400 mb-3">{t.quickActions}</h3>
        <div className="grid grid-cols-4 gap-3">
          {[
            { icon: BookOpen, label: t.actions.quran },
            { icon: Heart, label: t.actions.dhikr },
            { icon: Clock, label: t.actions.tracker },
            { icon: Calendar, label: t.actions.calendar },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="text-center p-3 rounded-xl bg-slate-800/30 border border-slate-700/50 opacity-50 cursor-not-allowed group relative"
            >
              <Icon className="w-5 h-5 mx-auto mb-1 text-slate-500" />
              <p className="text-xs text-slate-500">{label}</p>
              
              {/* Tooltip */}
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-slate-300 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {t.loginHint}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default DemoDashboard;
