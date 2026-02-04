import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RotateCcw, Check, ChevronRight, Plus } from 'lucide-react';
import { getProfile } from '@/lib/storage';
import {
  DhikrPreset,
  getDhikrSessionForPreset,
  saveDhikrSession,
  getDhikrSessions,
  getDhikrPresets,
  saveCustomDhikrPreset,
  deleteCustomDhikrPreset,
} from '@/lib/dhikr-storage';
import { cn } from '@/lib/utils';
import { markActiveDay } from '@/lib/streak';
import ResponsiveLayout from '@/components/layout/ResponsiveLayout';

const content = {
  id: {
    title: 'Dzikir',
    subtitle: 'Ketenangan Hati',
    selectDhikr: 'Pilih Dzikir',
    target: 'Target',
    completed: 'Selesai!',
    reset: 'Ulangi',
    todayProgress: 'Progress Hari Ini',
    tap: 'Ketuk untuk menghitung',
    custom: 'Buat Dzikir Baru',
    save: 'Simpan',
    cancel: 'Batal',
    deleteCustom: 'Hapus custom',
  },
  en: {
    title: 'Dhikr',
    subtitle: 'Peace of Mind',
    selectDhikr: 'Select Dhikr',
    target: 'Target',
    completed: 'Completed!',
    reset: 'Reset',
    todayProgress: "Today's Progress",
    tap: 'Tap to count',
    custom: 'Create New Dhikr',
    save: 'Save',
    cancel: 'Cancel',
    deleteCustom: 'Delete custom',
  },
};

const DhikrPage: React.FC = () => {
  const navigate = useNavigate();
  const [lang, setLang] = useState<'id' | 'en'>('id');
  const [selectedPreset, setSelectedPreset] = useState<DhikrPreset | null>(
    null,
  );
  const [count, setCount] = useState(0);
  const [target, setTarget] = useState(33);
  const [showRipple, setShowRipple] = useState(false);

  // Use user's logic for sessions reactivity
  const [sessions, setSessions] = useState(getDhikrSessions());
  const [presets, setPresets] = useState<DhikrPreset[]>([]);

  const [isCreating, setIsCreating] = useState(false);
  const [customForm, setCustomForm] = useState({
    transliteration: '',
    target: 33,
  });

  useEffect(() => {
    const profile = getProfile();
    if (!profile.onboardingCompleted) {
      navigate('/onboarding');
      return;
    }
    setLang(profile.language);
    setPresets(getDhikrPresets());
    setSessions(getDhikrSessions());
  }, [navigate]);

  const t = content[lang];

  const handleSelectPreset = (preset: DhikrPreset) => {
    setSelectedPreset(preset);
    const existing = getDhikrSessionForPreset(preset.id);
    if (existing) {
      setCount(existing.count);
      setTarget(existing.target);
    } else {
      setCount(0);
      setTarget(preset.defaultTarget || 33);
    }
  };

  const handleTap = useCallback(() => {
    if (!selectedPreset) return;

    // Vibrate if supported
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }

    const newCount = count + 1;
    setCount(newCount);
    setShowRipple(true);
    setTimeout(() => setShowRipple(false), 300);

    // Save session
    const today = new Date().toISOString().split('T')[0];
    saveDhikrSession({
      presetId: selectedPreset.id,
      count: newCount,
      target,
      date: today,
    });
    setSessions(getDhikrSessions()); // Update sessions list immediately
    markActiveDay(today);
  }, [count, selectedPreset, target]);

  const handleReset = () => {
    if (!selectedPreset) return;
    setCount(0);
    const today = new Date().toISOString().split('T')[0];
    saveDhikrSession({
      presetId: selectedPreset.id,
      count: 0,
      target,
      date: today,
    });
    setSessions(getDhikrSessions());
  };

  const handleSaveCustom = () => {
    if (!customForm.transliteration.trim()) return;

    saveCustomDhikrPreset({
      id: `custom-${Date.now()}`,
      arabic: customForm.transliteration, // Use title as arabic placeholder
      transliteration: customForm.transliteration,
      meaning: {
        id: 'Dzikir Kustom',
        en: 'Custom Dhikr',
      },
      defaultTarget: customForm.target,
      isCustom: true,
    });

    setPresets(getDhikrPresets());
    setIsCreating(false);
    setCustomForm({ transliteration: '', target: 33 });
  };

  const progress = Math.min((count / target) * 100, 100);
  const isCompleted = count >= target;

  // Counter View (Premium Circular Design)
  if (selectedPreset) {
    return (
      <ResponsiveLayout className="flex flex-col">
        {/* Header - Mobile Only */}
        <header className="md:hidden flex items-center justify-between px-6 py-4 border-b border-slate-800/50">
          <button
            type="button"
            aria-label="Back to dhikr list"
            onClick={() => setSelectedPreset(null)}
            className="p-2 -ml-2 rounded-lg hover:bg-slate-800/50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </button>
          <span className="font-serif text-lg text-white truncate max-w-[200px] text-center">
            {selectedPreset.transliteration}
          </span>
          <button
            type="button"
            aria-label="Reset dzikir counter"
            onClick={handleReset}
            className="p-2 -mr-2 rounded-lg hover:bg-slate-800/50 transition-colors"
          >
            <RotateCcw className="w-5 h-5 text-slate-400" />
          </button>
        </header>

        {/* Main Counter Area */}
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          {/* Arabic Text */}
          <motion.p
            className="text-3xl sm:text-4xl text-amber-400 font-serif mb-4 text-center leading-relaxed"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {selectedPreset.arabic}
          </motion.p>

          {/* Meaning */}
          <p className="text-slate-400 text-sm mb-12 text-center max-w-sm leading-relaxed">
            {selectedPreset.meaning[lang]}
          </p>

          {/* Counter Circle */}
          <motion.button
            onClick={handleTap}
            className="relative w-64 h-64 rounded-full flex items-center justify-center group"
            whileTap={{ scale: 0.95 }}
          >
            {/* Progress Ring */}
            <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
              <circle
                cx="128"
                cy="128"
                r="120"
                fill="none"
                stroke="rgba(30, 41, 59, 0.5)"
                strokeWidth="8"
              />
              <motion.circle
                cx="128"
                cy="128"
                r="120"
                fill="none"
                stroke={isCompleted ? '#22c55e' : '#d4a574'}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 120}
                strokeDashoffset={2 * Math.PI * 120}
                animate={{
                  strokeDashoffset: 2 * Math.PI * 120 * (1 - progress / 100),
                }}
                transition={{ duration: 0.1 }}
              />
            </svg>

            {/* Inner Circle */}
            <div
              className={cn(
                'w-56 h-56 rounded-full flex flex-col items-center justify-center transition-colors duration-300 border-4',
                isCompleted
                  ? 'bg-green-500/10 border-green-500/30'
                  : 'bg-slate-900 border-slate-800 group-hover:bg-slate-800',
              )}
            >
              {isCompleted ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex flex-col items-center"
                >
                  <Check className="w-12 h-12 text-green-400 mb-2" />
                  <span className="text-green-400 font-medium">
                    {t.completed}
                  </span>
                </motion.div>
              ) : (
                <>
                  <span className="text-6xl font-serif text-white">
                    {count}
                  </span>
                  <span className="text-slate-500 text-sm mt-1">
                    / {target}
                  </span>
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

          <p className="text-slate-500 text-sm mt-8 animate-pulse text-center w-full">
            {t.tap}
          </p>
        </div>
      </ResponsiveLayout>
    );
  }

  // List View with Layout
  return (
    <ResponsiveLayout className="pb-24">
      {/* Header */}
      {/* Header - Mobile Only */}
      <header className="flex md:hidden items-center justify-between px-6 py-4 border-b border-slate-800/50 sticky top-0 bg-[#020617]/80 backdrop-blur z-20">
        <button
          type="button"
          aria-label="Back to dashboard"
          onClick={() => navigate('/dashboard')}
          className="p-2 -ml-2 rounded-lg hover:bg-slate-800/50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-400" />
        </button>
        <div className="text-center">
          <span className="font-serif text-lg text-white">{t.title}</span>
          <p className="text-xs text-slate-500">{t.subtitle}</p>
        </div>
        <div className="w-9" />
      </header>

      {/* Desktop Header */}
      <div className="hidden md:flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl text-white">{t.title}</h1>
          <p className="text-slate-400 mt-1">{t.subtitle}</p>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6 space-y-6 md:p-0">
        {/* Create New Toggle */}
        <button
          type="button"
          aria-label={isCreating ? 'Hide custom dzikir form' : 'Show custom dzikir form'}
          onClick={() => setIsCreating(!isCreating)}
          className="w-full p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 flex items-center justify-center gap-2 hover:bg-amber-500/20 transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          {t.custom}
        </button>

        {/* Custom Form */}
        <AnimatePresence>
          {isCreating && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800 space-y-3">
                <input
                  value={customForm.transliteration}
                  onChange={(e) =>
                    setCustomForm({
                      ...customForm,
                      transliteration: e.target.value,
                    })
                  }
                  placeholder={
                    lang === 'id'
                      ? 'Nama Dzikir (Misal: Subhanallah)'
                      : 'Dhikr Name (e.g. Subhanallah)'
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50"
                  autoFocus
                />
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <label className="text-xs text-slate-500 mb-1 block">
                      {t.target}
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={customForm.target}
                      onChange={(e) =>
                        setCustomForm({
                          ...customForm,
                          target: Number(e.target.value),
                        })
                      }
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50"
                    />
                  </div>
                  <div className="flex items-end gap-2 pt-5">
                    <button
                      onClick={() => setIsCreating(false)}
                      className="px-4 py-2 rounded-lg bg-slate-800 text-slate-400 hover:bg-slate-700 text-sm transition-colors"
                    >
                      {t.cancel}
                    </button>
                    <button
                      onClick={handleSaveCustom}
                      className="px-4 py-2 rounded-lg bg-amber-500 text-slate-900 hover:bg-amber-400 font-medium text-sm transition-colors"
                    >
                      {t.save}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sessions/Progress bar (Optional but useful) */}
        {sessions.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-6 px-6 scrollbar-hide">
            {sessions.map((session) => {
              const preset = presets.find((p) => p.id === session.presetId);
              if (!preset) return null;
              const isComplete = session.count >= session.target;
              return (
                <div
                  key={session.presetId}
                  className={cn(
                    'flex-shrink-0 px-3 py-2 rounded-lg border',
                    isComplete
                      ? 'bg-green-500/10 border-green-500/30'
                      : 'bg-slate-800/50 border-slate-700',
                  )}
                >
                  <p className="text-xs text-slate-400 truncate max-w-[100px]">
                    {preset.transliteration}
                  </p>
                  <p
                    className={cn(
                      'text-sm font-medium',
                      isComplete ? 'text-green-400' : 'text-white',
                    )}
                  >
                    {session.count}/{session.target}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* Presets List */}
        <div className="space-y-3">
          {presets.map((preset, i) => {
            const session = sessions.find((s) => s.presetId === preset.id);
            const isComplete = session && session.count >= session.target;

            return (
              <motion.button
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                className={cn(
                  'w-full p-4 rounded-2xl border transition-colors flex items-center justify-between group text-left',
                  isComplete
                    ? 'bg-green-500/5 border-green-500/20'
                    : 'bg-slate-900/40 border-slate-800 hover:border-amber-500/30 hover:bg-slate-800/50',
                )}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center font-medium text-sm border transition-colors shrink-0',
                      isComplete
                        ? 'bg-green-500/10 border-green-500/30 text-green-400'
                        : 'bg-slate-800 text-amber-500 border-slate-700 group-hover:border-amber-500/30',
                    )}
                  >
                    {preset.defaultTarget || 33}
                  </div>
                  <div className="min-w-0">
                    <p
                      className={cn(
                        'font-medium truncate transition-colors',
                        isComplete
                          ? 'text-green-100'
                          : 'text-white group-hover:text-amber-200',
                      )}
                    >
                      {preset.transliteration}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {preset.meaning[lang]}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {session && (
                    <span
                      className={cn(
                        'text-xs font-medium',
                        isComplete ? 'text-green-400' : 'text-slate-500',
                      )}
                    >
                      {session.count}
                    </span>
                  )}
                  <ChevronRight className="w-5 h-5 text-slate-700 group-hover:text-amber-500/50 transition-colors shrink-0" />
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </ResponsiveLayout>
  );
};

export default DhikrPage;
