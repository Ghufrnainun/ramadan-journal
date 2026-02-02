import React, { useEffect, useState } from 'react';
import { Smile, Meh, Frown } from 'lucide-react';
import { motion } from 'framer-motion';
import { getDailyStatus, saveDailyStatus } from '@/lib/daily-status';

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
    >
      <div className="rounded-3xl border border-slate-800/60 bg-slate-900/40 p-5 space-y-4">
        <div>
          <p className="text-white font-medium">{t.title}</p>
          <textarea
            value={intention}
            onChange={(e) => setIntention(e.target.value)}
            placeholder={t.placeholder}
            className="mt-3 w-full min-h-[90px] bg-slate-800/60 border border-slate-700 rounded-2xl p-3 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
          />
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-3">{t.mood}</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'calm', label: t.calm, icon: <Smile className="w-4 h-4" /> },
              { id: 'okay', label: t.okay, icon: <Meh className="w-4 h-4" /> },
              { id: 'heavy', label: t.heavy, icon: <Frown className="w-4 h-4" /> },
            ].map(option => (
              <button
                key={option.id}
                onClick={() => setMood(option.id)}
                className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs transition-all ${
                  mood === option.id
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-200'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800'
                }`}
              >
                {option.icon}
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DailyStatusCard;
