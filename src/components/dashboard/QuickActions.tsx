import React from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  HandHeart,
  CheckSquare,
  PenLine,
  BookHeart,
  Calendar,
  BookCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
    hafalan: 'Hafalan',
  },
  en: {
    quran: 'Quran',
    dhikr: 'Dhikr',
    doa: 'Dua',
    tracker: 'Tracker',
    reflection: 'Reflection',
    calendar: 'Calendar',
    hafalan: 'Memorization',
  },
};

const moduleIcons: Record<string, React.ReactNode> = {
  quran: <BookOpen className="w-6 h-6" />,
  dhikr: <HandHeart className="w-6 h-6" />,
  doa: <BookHeart className="w-6 h-6" />,
  tracker: <CheckSquare className="w-6 h-6" />,
  reflection: <PenLine className="w-6 h-6" />,
  calendar: <Calendar className="w-6 h-6" />,
  hafalan: <BookCheck className="w-6 h-6" />,
};

const moduleColors: Record<string, string> = {
  quran: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
  dhikr: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
  doa: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
  tracker: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
  reflection: 'bg-violet-500/10 border-violet-500/30 text-violet-400',
  calendar: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400',
  hafalan: 'bg-teal-500/10 border-teal-500/30 text-teal-400',
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
    'hafalan',
  ];
  const visibleModules = allModules.filter((m) => {
    if (m === 'doa') return focusModules.includes('dhikr'); // Show doa if dhikr is selected
    if (m === 'calendar') return true; // Always show calendar
    if (m === 'hafalan') return true;
    return focusModules.includes(m);
  });

  const modules = visibleModules.map((moduleId) => ({
    id: moduleId,
    label: t[moduleId as keyof typeof t],
    icon: moduleIcons[moduleId],
    color: moduleColors[moduleId],
  }));

  return (
    <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
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
              className={cn(
                'flex h-14 w-14 items-center justify-center rounded-2xl border shadow-lg transition-[transform,box-shadow] group-hover:scale-105 group-hover:shadow-xl',
                module.color,
              )}
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
