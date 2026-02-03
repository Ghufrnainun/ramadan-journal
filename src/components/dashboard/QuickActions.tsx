import React from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  HandHeart,
  CheckSquare,
  PenLine,
  BookHeart,
  Calendar,
} from 'lucide-react';

interface QuickActionsProps {
  lang: 'id' | 'en';
  focusModules: string[];
  onNavigate: (module: string) => void;
}

const content = {
  id: {
    quran: 'Tadarus',
    dhikr: 'Dzikir',
    doa: 'Doa',
    tracker: 'Tracker',
    reflection: 'Refleksi',
    calendar: 'Kalender',
  },
  en: {
    quran: 'Quran',
    dhikr: 'Dhikr',
    doa: 'Dua',
    tracker: 'Tracker',
    reflection: 'Reflection',
    calendar: 'Calendar',
  },
};

const moduleIcons: Record<string, React.ReactNode> = {
  quran: <BookOpen className="w-6 h-6" />,
  dhikr: <HandHeart className="w-6 h-6" />,
  doa: <BookHeart className="w-6 h-6" />,
  tracker: <CheckSquare className="w-6 h-6" />,
  reflection: <PenLine className="w-6 h-6" />,
  calendar: <Calendar className="w-6 h-6" />,
};

const moduleColors: Record<string, string> = {
  quran:
    'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 text-emerald-400',
  dhikr: 'from-amber-500/20 to-amber-600/10 border-amber-500/30 text-amber-400',
  doa: 'from-rose-500/20 to-rose-600/10 border-rose-500/30 text-rose-400',
  tracker: 'from-blue-500/20 to-blue-600/10 border-blue-500/30 text-blue-400',
  reflection:
    'from-purple-500/20 to-purple-600/10 border-purple-500/30 text-purple-400',
  calendar:
    'from-indigo-500/20 to-indigo-600/10 border-indigo-500/30 text-indigo-400',
};

const QuickActions: React.FC<QuickActionsProps> = ({
  lang,
  focusModules,
  onNavigate,
}) => {
  const t = content[lang];

  // Always show doa alongside dhikr if dhikr is selected
  const allModules = [
    'quran',
    'dhikr',
    'doa',
    'tracker',
    'reflection',
    'calendar',
  ];
  const visibleModules = allModules.filter((m) => {
    if (m === 'doa') return focusModules.includes('dhikr'); // Show doa if dhikr is selected
    if (m === 'calendar') return true; // Always show calendar
    return focusModules.includes(m);
  });

  const modules = visibleModules.map((moduleId) => ({
    id: moduleId,
    label: t[moduleId as keyof typeof t],
    icon: moduleIcons[moduleId],
    color: moduleColors[moduleId],
  }));

  return (
    <div className="grid grid-cols-4 gap-4">
      {modules.map((module, index) => {
        // If user has focused modules, only show those first (for later implementation)
        // For now show all 4 main ones

        return (
          <motion.button
            key={module.id}
            onClick={() => onNavigate(module.id)}
            className="flex flex-col items-center gap-2 group"
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <div
              className={`w-14 h-14 rounded-2xl ${module.color} flex items-center justify-center shadow-lg transition-transform group-hover:scale-105 group-hover:shadow-amber-900/20 border border-white/5`}
            >
              {/* Force white color on existing icons */}
              {React.cloneElement(module.icon as React.ReactElement, {
                className: 'w-6 h-6 text-white',
              })}
            </div>
            <span className="text-[10px] font-medium text-slate-400 group-hover:text-slate-300 transition-colors text-center w-full truncate">
              {module.label}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
};

export default QuickActions;
