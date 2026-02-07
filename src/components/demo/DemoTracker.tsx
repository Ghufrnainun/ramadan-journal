import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Clock, BookOpen, Heart, HandHeart, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DemoTrackerProps {
  lang: 'id' | 'en';
}

const content = {
  id: {
    title: 'Tracker Demo',
    progress: 'Progress Hari Ini',
    completed: 'selesai',
    encouragement: 'MasyaAllah! Kamu luar biasa! 🌟',
    keepGoing: 'Terus semangat! 💪',
    startDay: 'Yuk mulai hari ini! ✨',
    note: 'Progress tidak tersimpan dalam mode demo',
  },
  en: {
    title: 'Tracker Demo',
    progress: "Today's Progress",
    completed: 'completed',
    encouragement: 'MashaAllah! You are amazing! 🌟',
    keepGoing: 'Keep going! 💪',
    startDay: "Let's start today! ✨",
    note: 'Progress is not saved in demo mode',
  },
};

const DEMO_ITEMS = [
  {
    id: 'shalat_subuh',
    label: { id: 'Shalat Subuh', en: 'Fajr Prayer' },
    icon: Clock,
    defaultChecked: true,
  },
  {
    id: 'shalat_dzuhur',
    label: { id: 'Shalat Dzuhur', en: 'Dhuhr Prayer' },
    icon: Clock,
    defaultChecked: false,
  },
  {
    id: 'tadarus',
    label: { id: 'Tadarus Al-Quran', en: 'Quran Reading' },
    icon: BookOpen,
    defaultChecked: false,
  },
  {
    id: 'dzikir',
    label: { id: 'Dzikir Pagi/Petang', en: 'Morning/Evening Dhikr' },
    icon: Heart,
    defaultChecked: false,
  },
  {
    id: 'sedekah',
    label: { id: 'Sedekah Hari Ini', en: 'Daily Charity' },
    icon: HandHeart,
    defaultChecked: false,
  },
];

const DemoTracker: React.FC<DemoTrackerProps> = ({ lang }) => {
  const t = content[lang];
  
  // Local state for demo - not persisted
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    DEMO_ITEMS.forEach(item => {
      initial[item.id] = item.defaultChecked;
    });
    return initial;
  });

  const handleToggle = (itemId: string) => {
    setCheckedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const completedCount = Object.values(checkedItems).filter(Boolean).length;
  const totalItems = DEMO_ITEMS.length;
  const progressPercent = (completedCount / totalItems) * 100;

  const getMessage = () => {
    if (completedCount === totalItems) return t.encouragement;
    if (completedCount > 0) return t.keepGoing;
    return t.startDay;
  };

  return (
    <div className="space-y-4">
      {/* Warning Banner */}
      <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">
        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
        <p className="text-sm text-amber-200">{t.note}</p>
      </div>

      {/* Progress Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-slate-400 text-sm font-medium">{t.progress}</span>
          <span className="text-amber-400 font-medium bg-amber-500/10 px-2 py-1 rounded-lg text-xs border border-amber-500/20 tabular-nums">
            {completedCount}/{totalItems} {t.completed}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="h-3 bg-slate-800/50 rounded-full overflow-hidden mb-3">
          <motion.div
            className="h-full bg-amber-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Message */}
        <p className="text-center text-white text-sm font-medium">{getMessage()}</p>
      </motion.div>

      {/* Checklist Items */}
      <div className="space-y-3">
        {DEMO_ITEMS.map((item, i) => {
          const isChecked = checkedItems[item.id];
          const Icon = item.icon;

          return (
            <motion.button
              key={item.id}
              onClick={() => handleToggle(item.id)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={cn(
                'w-full p-4 rounded-xl border flex items-center gap-4 transition-colors duration-300 group',
                isChecked
                  ? 'bg-emerald-500/10 border-emerald-500/30'
                  : 'bg-slate-800/30 border-slate-700 hover:bg-slate-800/50 hover:border-slate-600'
              )}
            >
              {/* Checkbox */}
              <div
                className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-300 shrink-0',
                  isChecked
                    ? 'bg-emerald-500 text-white shadow-lg'
                    : 'bg-slate-700/50 text-slate-500 group-hover:bg-slate-700'
                )}
              >
                {isChecked ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>

              {/* Label */}
              <span
                className={cn(
                  'flex-1 text-left font-medium transition-colors duration-300',
                  isChecked
                    ? 'text-emerald-400 line-through decoration-emerald-500/50'
                    : 'text-white group-hover:text-amber-100'
                )}
              >
                {item.label[lang]}
              </span>

              {/* Status Indicator */}
              {isChecked && (
                <span className="text-green-400 text-xs bg-green-500/20 px-2 py-1 rounded-full">
                  ✓
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Celebration */}
      {completedCount === totalItems && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl"
        >
          <span className="text-4xl mb-3 block">🎉</span>
          <p className="text-emerald-400 font-serif text-lg">
            {lang === 'id' ? 'Alhamdulillah, luar biasa!' : 'Alhamdulillah, amazing!'}
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default DemoTracker;
