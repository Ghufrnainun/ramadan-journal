import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, HandHeart, CheckSquare, PenLine } from 'lucide-react';

interface QuickActionsProps {
  lang: 'id' | 'en';
  focusModules: string[];
  onNavigate: (module: string) => void;
}

const content = {
  id: {
    quran: 'Tadarus',
    dhikr: 'Dzikir',
    tracker: 'Tracker',
    reflection: 'Refleksi',
  },
  en: {
    quran: 'Quran',
    dhikr: 'Dhikr',
    tracker: 'Tracker',
    reflection: 'Reflection',
  },
};

const moduleIcons: Record<string, React.ReactNode> = {
  quran: <BookOpen className="w-6 h-6" />,
  dhikr: <HandHeart className="w-6 h-6" />,
  tracker: <CheckSquare className="w-6 h-6" />,
  reflection: <PenLine className="w-6 h-6" />,
};

const moduleColors: Record<string, string> = {
  quran: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 text-emerald-400',
  dhikr: 'from-amber-500/20 to-amber-600/10 border-amber-500/30 text-amber-400',
  tracker: 'from-blue-500/20 to-blue-600/10 border-blue-500/30 text-blue-400',
  reflection: 'from-purple-500/20 to-purple-600/10 border-purple-500/30 text-purple-400',
};

const QuickActions: React.FC<QuickActionsProps> = ({ lang, focusModules, onNavigate }) => {
  const t = content[lang];
  
  const visibleModules = ['quran', 'dhikr', 'tracker', 'reflection'].filter(
    (m) => focusModules.includes(m)
  );

  return (
    <motion.div
      className="grid grid-cols-4 gap-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      {visibleModules.map((module) => (
        <button
          key={module}
          onClick={() => onNavigate(module)}
          className={`bg-gradient-to-br ${moduleColors[module]} border rounded-2xl p-4 flex flex-col items-center gap-2 hover:scale-105 transition-transform active:scale-95`}
        >
          {moduleIcons[module]}
          <span className="text-xs text-slate-300">{t[module as keyof typeof t]}</span>
        </button>
      ))}
    </motion.div>
  );
};

export default QuickActions;
