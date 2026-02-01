import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Moon, Sparkles, CalendarDays } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface CountdownCardProps {
  lang: 'id' | 'en';
  ramadanStartDate: string | null;
}

const content = {
  id: {
    before: 'Menuju Ramadan',
    during: 'Ramadan Hari ke-',
    after: 'Selamat Idul Fitri',
    days: 'hari',
    hours: 'jam',
    minutes: 'menit',
    seconds: 'detik',
  },
  en: {
    before: 'Ramadan Starts In',
    during: 'Ramadan Day',
    after: 'Eid Mubarak',
    days: 'days',
    hours: 'hours',
    minutes: 'minutes',
    seconds: 'seconds',
  },
};

const CountdownCard: React.FC<CountdownCardProps> = ({ lang, ramadanStartDate }) => {
  const t = content[lang];
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const startDate = ramadanStartDate ? new Date(ramadanStartDate) : new Date('2025-03-01');
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 30);

  const diffToStart = startDate.getTime() - now.getTime();
  const diffFromStart = now.getTime() - startDate.getTime();
  const isBeforeRamadan = diffToStart > 0;
  const isAfterRamadan = now.getTime() > endDate.getTime();
  const currentDay = Math.floor(diffFromStart / (1000 * 60 * 60 * 24)) + 1;

  if (isAfterRamadan) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-gradient-to-br from-amber-500/20 to-amber-600/10 border-amber-500/30 overflow-hidden">
          <CardContent className="p-6 text-center">
            <Sparkles className="w-12 h-12 text-amber-400 mx-auto mb-3" />
            <h2 className="font-serif text-2xl text-white">{t.after}</h2>
            <p className="text-amber-400/80 text-sm mt-1">
              {lang === 'id' ? 'Taqabbalallahu minna wa minkum' : 'May Allah accept from us and from you'}
            </p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (isBeforeRamadan) {
    const days = Math.floor(diffToStart / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffToStart % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffToStart % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffToStart % (1000 * 60)) / 1000);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700/50 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <CalendarDays className="w-5 h-5 text-amber-400" />
              <span className="text-slate-400 text-sm">{t.before}</span>
            </div>
            
            <div className="grid grid-cols-4 gap-3 text-center">
              <div className="bg-slate-800/50 rounded-xl p-3">
                <div className="font-serif text-3xl text-white">{days}</div>
                <div className="text-xs text-slate-500 mt-1">{t.days}</div>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-3">
                <div className="font-serif text-3xl text-white">{hours}</div>
                <div className="text-xs text-slate-500 mt-1">{t.hours}</div>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-3">
                <div className="font-serif text-3xl text-white">{minutes}</div>
                <div className="text-xs text-slate-500 mt-1">{t.minutes}</div>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-3">
                <div className="font-serif text-3xl text-white">{seconds}</div>
                <div className="text-xs text-slate-500 mt-1">{t.seconds}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // During Ramadan
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="bg-gradient-to-br from-amber-500/20 to-amber-600/5 border-amber-500/30 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl" />
        <CardContent className="p-6 relative">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-400/80 text-sm mb-1">{t.during}</p>
              <h2 className="font-serif text-5xl text-white">{Math.min(currentDay, 30)}</h2>
              <p className="text-slate-400 text-xs mt-2">
                {lang === 'id' ? `${30 - currentDay} hari lagi` : `${30 - currentDay} days remaining`}
              </p>
            </div>
            <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center">
              <Moon className="w-10 h-10 text-amber-400" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CountdownCard;
