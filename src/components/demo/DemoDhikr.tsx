import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, RotateCcw, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DemoDhikrProps {
  lang: 'id' | 'en';
}

const content = {
  id: {
    title: 'Dzikir Demo',
    tap: 'Ketuk untuk menghitung',
    completed: 'Selesai!',
    reset: 'Ulangi',
    note: 'Progress tidak tersimpan dalam mode demo',
    select: 'Pilih dzikir:',
  },
  en: {
    title: 'Dhikr Demo',
    tap: 'Tap to count',
    completed: 'Completed!',
    reset: 'Reset',
    note: 'Progress is not saved in demo mode',
    select: 'Select dhikr:',
  },
};

const DEMO_PRESETS = [
  {
    id: 'subhanallah',
    arabic: 'سُبْحَانَ اللهِ',
    transliteration: 'SubhanAllah',
    meaning: { id: 'Maha Suci Allah', en: 'Glory be to Allah' },
    target: 33,
  },
  {
    id: 'alhamdulillah',
    arabic: 'الْحَمْدُ لِلَّهِ',
    transliteration: 'Alhamdulillah',
    meaning: { id: 'Segala puji bagi Allah', en: 'All praise is due to Allah' },
    target: 33,
  },
  {
    id: 'allahuakbar',
    arabic: 'اللهُ أَكْبَرُ',
    transliteration: 'Allahu Akbar',
    meaning: { id: 'Allah Maha Besar', en: 'Allah is the Greatest' },
    target: 33,
  },
];

const DemoDhikr: React.FC<DemoDhikrProps> = ({ lang }) => {
  const t = content[lang];
  const [selectedPreset, setSelectedPreset] = useState(DEMO_PRESETS[0]);
  const [count, setCount] = useState(0);
  const [showRipple, setShowRipple] = useState(false);

  const target = selectedPreset.target;
  const progress = Math.min((count / target) * 100, 100);
  const isCompleted = count >= target;

  const handleTap = useCallback(() => {
    // Vibrate if supported
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }

    setCount(prev => prev + 1);
    setShowRipple(true);
    setTimeout(() => setShowRipple(false), 300);
  }, []);

  const handleReset = () => {
    setCount(0);
  };

  const handleSelectPreset = (preset: typeof DEMO_PRESETS[0]) => {
    setSelectedPreset(preset);
    setCount(0);
  };

  return (
    <div className="space-y-4">
      {/* Warning Banner */}
      <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">
        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
        <p className="text-sm text-amber-200">{t.note}</p>
      </div>

      {/* Preset Selector */}
      <div className="space-y-2">
        <p className="text-sm text-slate-400">{t.select}</p>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {DEMO_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleSelectPreset(preset)}
              className={cn(
                'flex-shrink-0 px-4 py-2 rounded-xl border transition-colors text-sm',
                selectedPreset.id === preset.id
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-200'
                  : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
              )}
            >
              {preset.transliteration}
            </button>
          ))}
        </div>
      </div>

      {/* Counter Area */}
      <div className="flex flex-col items-center py-6">
        {/* Arabic Text */}
        <motion.p
          key={selectedPreset.id}
          className="text-3xl text-amber-400 font-serif mb-2 text-center"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {selectedPreset.arabic}
        </motion.p>

        {/* Meaning */}
        <p className="text-slate-400 text-sm mb-8 text-center">
          {selectedPreset.meaning[lang]}
        </p>

        {/* Counter Circle */}
        <motion.button
          onClick={handleTap}
          className="relative w-52 h-52 rounded-full flex items-center justify-center group"
          whileTap={{ scale: 0.95 }}
        >
          {/* Progress Ring */}
          <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
            <circle
              cx="104"
              cy="104"
              r="96"
              fill="none"
              stroke="rgba(30, 41, 59, 0.5)"
              strokeWidth="8"
            />
            <motion.circle
              cx="104"
              cy="104"
              r="96"
              fill="none"
              stroke={isCompleted ? '#22c55e' : '#d4a574'}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 96}
              strokeDashoffset={2 * Math.PI * 96}
              animate={{
                strokeDashoffset: 2 * Math.PI * 96 * (1 - progress / 100),
              }}
              transition={{ duration: 0.1 }}
            />
          </svg>

          {/* Inner Circle */}
          <div
            className={cn(
              'w-44 h-44 rounded-full flex flex-col items-center justify-center transition-colors duration-300 border-4',
              isCompleted
                ? 'bg-green-500/10 border-green-500/30'
                : 'bg-slate-900 border-slate-800 group-hover:bg-slate-800'
            )}
          >
            {isCompleted ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex flex-col items-center"
              >
                <Check className="w-10 h-10 text-green-400 mb-2" />
                <span className="text-green-400 font-medium">{t.completed}</span>
              </motion.div>
            ) : (
              <>
                <span className="text-5xl font-serif text-white">{count}</span>
                <span className="text-slate-500 text-sm mt-1">/ {target}</span>
              </>
            )}
          </div>

          {/* Ripple Effect */}
          <AnimatePresence>
            {showRipple && (
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-amber-400/50"
                initial={{ scale: 0.8, opacity: 1 }}
                animate={{ scale: 1.2, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              />
            )}
          </AnimatePresence>
        </motion.button>

        <p className="text-slate-500 text-sm mt-6 animate-pulse">{t.tap}</p>

        {/* Reset Button */}
        {count > 0 && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={handleReset}
            className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="text-sm">{t.reset}</span>
          </motion.button>
        )}
      </div>
    </div>
  );
};

export default DemoDhikr;
