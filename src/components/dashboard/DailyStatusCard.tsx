import React, { useEffect, useState } from 'react';
import { Smile, Meh, Frown } from 'lucide-react';
import { motion } from 'framer-motion';
import { getDailyStatus, saveDailyStatus } from '@/lib/daily-status';
import { cn } from '@/lib/utils';

interface DailyStatusCardProps {
  lang: 'id' | 'en';
}

const content = {
  id: {
    title: 'Niat Hari Ini',
    placeholder: 'Tulis niatmu dengan lembut...',
    mood: 'Mood',
    calm: 'Tenang',
    okay: 'Biasa',
    heavy: 'Berat',
  },
  en: {
    title: "Today's Intention",
    placeholder: 'Write a gentle intention...',
    mood: 'Mood',
    calm: 'Calm',
    okay: 'Okay',
    heavy: 'Heavy',
  },
};

const DailyStatusCard: React.FC<DailyStatusCardProps> = ({ lang }) => {
  const t = content[lang];
  const initial = getDailyStatus();
  const [intention, setIntention] = useState(initial.intention);
  const [mood, setMood] = useState<string | null>(initial.mood);

  useEffect(() => {
    const timer = setTimeout(() => {
      saveDailyStatus({ date: initial.date, intention, mood });
    }, 400);
    return () => clearTimeout(timer);
  }, [intention, mood, initial.date]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="rounded-2xl bg-slate-900/60 p-1">
        <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-5 border border-slate-800/50">
          <p className="text-amber-400 font-serif text-lg mb-3">{t.title}</p>
          <textarea
            value={intention}
            onChange={(e) => setIntention(e.target.value)}
            placeholder={t.placeholder}
            className="w-full h-24 bg-transparent border-b border-slate-700 focus:border-amber-500/50 transition-colors resize-none text-slate-200 placeholder:text-slate-600 focus:outline-none text-base leading-relaxed"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-hide">
        {[
          {
            id: 'calm',
            label: t.calm,
            icon: <Smile className="w-5 h-5" />,
            activeClass: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
          },
          {
            id: 'okay',
            label: t.okay,
            icon: <Meh className="w-5 h-5" />,
            activeClass: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
          },
          {
            id: 'heavy',
            label: t.heavy,
            icon: <Frown className="w-5 h-5" />,
            activeClass: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
          },
        ].map((option) => (
          <button
            key={option.id}
            onClick={() => setMood(option.id)}
            className={cn(
              'flex min-w-[100px] flex-1 items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-medium transition-colors',
              mood === option.id
                ? option.activeClass
                : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:bg-slate-800/60',
            )}
          >
            {option.icon}
            <span>{option.label}</span>
          </button>
        ))}
      </div>
    </motion.div>
  );
};

export default DailyStatusCard;
