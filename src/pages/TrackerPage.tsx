import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, Clock, BookOpen, Heart, HandHeart, MessageCircle } from 'lucide-react';
import { getProfile } from '@/lib/storage';
import { 
  DEFAULT_TRACKER_ITEMS, 
  getTodayProgress, 
  toggleItem,
  updateNote,
  getCompletedCount,
  getTotalItems 
} from '@/lib/tracker-storage';
import { Card, CardContent } from '@/components/ui/card';
import { markActiveDay } from '@/lib/streak';

const content = {
  id: {
    title: 'Tracker Harian',
    progress: 'Progress Hari Ini',
    completed: 'selesai',
    encouragement: 'MasyaAllah! Kamu luar biasa! 🌟',
    keepGoing: 'Terus semangat! 💪',
    startDay: 'Yuk mulai hari ini! ✨',
    notePlaceholder: 'Catatan singkat...',
  },
  en: {
    title: 'Daily Tracker',
    progress: "Today's Progress",
    completed: 'completed',
    encouragement: 'MashaAllah! You are amazing! 🌟',
    keepGoing: 'Keep going! 💪',
    startDay: "Let's start today! ✨",
    notePlaceholder: 'Quick note...',
  },
};

const iconMap: Record<string, React.ReactNode> = {
  clock: <Clock className="w-5 h-5" />,
  'book-open': <BookOpen className="w-5 h-5" />,
  heart: <Heart className="w-5 h-5" />,
  'hand-heart': <HandHeart className="w-5 h-5" />,
  'message-circle': <MessageCircle className="w-5 h-5" />,
};

const TrackerPage: React.FC = () => {
  const navigate = useNavigate();
  const [lang, setLang] = useState<'id' | 'en'>('id');
  const [progress, setProgress] = useState(getTodayProgress());
  const [completedCount, setCompletedCount] = useState(getCompletedCount());

  useEffect(() => {
    const profile = getProfile();
    if (!profile.onboardingCompleted) {
      navigate('/onboarding');
      return;
    }
    setLang(profile.language);
  }, [navigate]);

  const t = content[lang];
  const totalItems = getTotalItems();
  const progressPercent = (completedCount / totalItems) * 100;

  const handleToggle = (itemId: string) => {
    const updated = toggleItem(itemId);
    setProgress(updated);
    setCompletedCount(Object.values(updated.items).filter(Boolean).length);
    markActiveDay(updated.date);
  };

  const getMessage = () => {
    if (completedCount === totalItems) return t.encouragement;
    if (completedCount > 0) return t.keepGoing;
    return t.startDay;
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 pb-24">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800/50">
        <button
          onClick={() => navigate('/dashboard')}
          className="p-2 -ml-2 rounded-lg hover:bg-slate-800/50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-400" />
        </button>
        <span className="font-serif text-lg text-white">{t.title}</span>
        <div className="w-9" />
      </header>

      {/* Progress Card */}
      <div className="px-6 py-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-slate-400 text-sm">{t.progress}</span>
                <span className="text-amber-400 font-medium">
                  {completedCount}/{totalItems} {t.completed}
                </span>
              </div>
              
              {/* Progress Bar */}
              <div className="h-3 bg-slate-800/50 rounded-full overflow-hidden mb-4">
                <motion.div
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>

              {/* Message */}
              <p className="text-center text-white text-sm">{getMessage()}</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Checklist Items */}
      <div className="px-6 space-y-3">
        {DEFAULT_TRACKER_ITEMS.map((item, i) => {
          const isChecked = progress.items[item.id] || false;
          
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <button
                onClick={() => handleToggle(item.id)}
                className={`w-full p-4 rounded-xl border flex items-center gap-4 transition-all ${
                  isChecked
                    ? 'bg-green-500/10 border-green-500/30'
                    : 'bg-slate-800/30 border-slate-700 hover:border-slate-600'
                }`}
              >
                {/* Checkbox */}
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                    isChecked
                      ? 'bg-green-500 text-white'
                      : 'bg-slate-700/50 text-slate-500'
                  }`}
                >
                  {isChecked ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                    >
                      <Check className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    iconMap[item.icon]
                  )}
                </div>

                {/* Label */}
                <span
                  className={`flex-1 text-left font-medium transition-all ${
                    isChecked ? 'text-green-400 line-through' : 'text-white'
                  }`}
                >
                  {item.label[lang]}
                </span>

                {/* Status Indicator */}
                {isChecked && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-green-400 text-xs bg-green-500/20 px-2 py-1 rounded-full"
                  >
                    ✓
                  </motion.span>
                )}
              </button>
              <div className="mt-2">
                <textarea
                  value={progress.notes[item.id] || ''}
                  onChange={(e) => {
                    const updated = updateNote(item.id, e.target.value);
                    setProgress(updated);
                  }}
                  placeholder={t.notePlaceholder}
                  className="w-full bg-slate-800/40 border border-slate-700/70 rounded-xl px-3 py-2 text-xs text-slate-300 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Motivational Footer */}
      {completedCount === totalItems && (
        <motion.div
          className="px-6 mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-center p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/20 rounded-xl">
            <span className="text-4xl mb-3 block">🎉</span>
            <p className="text-green-400 font-serif text-lg">
              {lang === 'id' 
                ? 'Alhamdulillah, hari ini sempurna!' 
                : 'Alhamdulillah, perfect day!'}
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default TrackerPage;
