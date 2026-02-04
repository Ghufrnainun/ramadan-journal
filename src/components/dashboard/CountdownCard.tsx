import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Moon, Sparkles, CalendarDays } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import {
  getRamadanInfo,
  getRamadanGreeting,
  RamadanInfo,
} from '@/lib/ramadan-dates';

interface CountdownCardProps {
  lang: 'id' | 'en';
}

const content = {
  id: {
    before: 'Menuju Ramadan',
    during: 'Ramadan Hari ke-',
    afterEid: 'Selamat Idul Fitri',
    afterEidSubtitle: 'Taqabbalallahu minna wa minkum',
    days: 'hari',
    hours: 'jam',
    minutes: 'menit',
    seconds: 'detik',
    daysRemaining: 'hari lagi',
  },
  en: {
    before: 'Ramadan Starts In',
    during: 'Ramadan Day',
    afterEid: 'Eid Mubarak',
    afterEidSubtitle: 'May Allah accept from us and from you',
    days: 'days',
    hours: 'hours',
    minutes: 'minutes',
    seconds: 'seconds',
    daysRemaining: 'days remaining',
  },
};

const CountdownCard: React.FC<CountdownCardProps> = ({ lang }) => {
  const t = content[lang];
  const [ramadanInfo, setRamadanInfo] = useState<RamadanInfo>(() =>
    getRamadanInfo(),
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setRamadanInfo(getRamadanInfo());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Eid Mubarak state (within 7 days after Ramadan)
  if (ramadanInfo.status === 'after-eid') {
    const eidGreeting = getRamadanGreeting(lang, 'after-eid');

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="relative overflow-hidden rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-6 text-center">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="relative z-10">
            <Sparkles className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <h2 className="font-serif text-3xl text-white mb-2">
              {eidGreeting.greeting}
            </h2>
            <p className="text-emerald-400/80 text-sm font-medium">
              {eidGreeting.subtitle}
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  // During Ramadan - show current day
  if (ramadanInfo.status === 'during' && ramadanInfo.currentDay) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="relative overflow-hidden rounded-2xl bg-amber-500/10 border border-amber-500/20 p-6">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl" />

          <div className="relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-500 text-xs font-semibold uppercase mb-1">
                  {t.during}
                </p>
                <div className="flex items-baseline gap-2">
                  <h2 className="font-serif text-6xl text-white leading-none">
                    {ramadanInfo.currentDay}
                  </h2>
                  <span className="font-serif text-2xl text-amber-500/50 italic">
                    Ramadan
                  </span>
                </div>

                {ramadanInfo.daysRemaining !== undefined &&
                  ramadanInfo.daysRemaining > 0 && (
                    <p className="text-slate-400 text-xs mt-3 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                      {ramadanInfo.daysRemaining} {t.daysRemaining}
                    </p>
                  )}
              </div>
              <div className="w-16 h-16 rounded-2xl bg-amber-500 flex items-center justify-center shadow-lg opacity-90">
                <Moon className="w-8 h-8 text-white fill-white/20" />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Before Ramadan - show countdown
  if (ramadanInfo.status === 'before' && ramadanInfo.countdown) {
    const { days, hours, minutes, seconds } = ramadanInfo.countdown;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="relative overflow-hidden rounded-2xl bg-[#0F172A] border border-slate-800 p-6">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-1.5 rounded bg-amber-500/10 border border-amber-500/20">
                <CalendarDays className="w-4 h-4 text-amber-400" />
              </div>
              <span className="text-slate-300 text-sm font-medium">
                {t.before}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-4 text-center">
              {[
                { value: days, label: t.days },
                { value: hours, label: t.hours },
                { value: minutes, label: t.minutes },
                { value: seconds, label: t.seconds },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="relative">
                    <span className="font-serif text-3xl md:text-4xl text-white font-medium tabular-nums">
                      {item.value}
                    </span>
                    {i !== 3 && (
                      <span className="absolute -right-4 top-1 text-slate-700 text-2xl hidden md:block">
                        :
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 uppercase">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Date Info */}
            <div className="mt-8 flex items-center justify-between border-t border-slate-800 pt-4 text-xs">
              <div className="text-left">
                <p className="text-slate-500 mb-0.5">
                  {lang === 'id' ? 'Hari Ini' : 'Today'}
                </p>
                <p className="text-slate-300 font-medium">
                  {new Date().toLocaleDateString(
                    lang === 'id' ? 'id-ID' : 'en-US',
                    {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    },
                  )}
                </p>
              </div>
              <div className="text-right">
                <p className="text-slate-500 mb-0.5">
                  {lang === 'id' ? 'Mulai Puasa' : 'Ramadan Begins'}
                </p>
                <p className="text-amber-400 font-medium">
                  {ramadanInfo.nextRamadan?.start.toLocaleDateString(
                    lang === 'id' ? 'id-ID' : 'en-US',
                    {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    },
                  ) || '-'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Normal state
  const normalGreeting = getRamadanGreeting(lang, 'normal');

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="relative overflow-hidden rounded-2xl bg-slate-900/60 border border-slate-700/50 p-6 text-center">
        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-700/10 rounded-full blur-3xl" />
        <div className="relative z-10">
          <Moon className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h2 className="font-serif text-2xl text-slate-200 mb-1">
            {normalGreeting.greeting}
          </h2>
          <p className="text-slate-400 text-sm">{normalGreeting.subtitle}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default CountdownCard;
