import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RotateCcw, Check, ChevronRight } from 'lucide-react';
import { getProfile } from '@/lib/storage';
import { 
  DHIKR_PRESETS, 
  DhikrPreset, 
  getDhikrSessionForPreset, 
  saveDhikrSession,
  getDhikrSessions
} from '@/lib/dhikr-storage';
import { Card, CardContent } from '@/components/ui/card';

const content = {
  id: {
    title: 'Dzikir',
    selectDhikr: 'Pilih Dzikir',
    target: 'Target',
    completed: 'Selesai!',
    reset: 'Ulangi',
    todayProgress: 'Progress Hari Ini',
    tap: 'Ketuk untuk menghitung',
  },
  en: {
    title: 'Dhikr',
    selectDhikr: 'Select Dhikr',
    target: 'Target',
    completed: 'Completed!',
    reset: 'Reset',
    todayProgress: "Today's Progress",
    tap: 'Tap to count',
  },
};

const DhikrPage: React.FC = () => {
  const navigate = useNavigate();
  const [lang, setLang] = useState<'id' | 'en'>('id');
  const [selectedPreset, setSelectedPreset] = useState<DhikrPreset | null>(null);
  const [count, setCount] = useState(0);
  const [target, setTarget] = useState(33);
  const [showRipple, setShowRipple] = useState(false);
  const [sessions, setSessions] = useState(getDhikrSessions());

  useEffect(() => {
    const profile = getProfile();
    if (!profile.onboardingCompleted) {
      navigate('/onboarding');
      return;
    }
    setLang(profile.language);
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
      setTarget(preset.defaultTarget);
    }
  };

  const handleTap = useCallback(() => {
    if (!selectedPreset) return;
    
    const newCount = count + 1;
    setCount(newCount);
    setShowRipple(true);
    setTimeout(() => setShowRipple(false), 300);

    // Vibrate if supported
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }

    // Save session
    const today = new Date().toISOString().split('T')[0];
    saveDhikrSession({
      presetId: selectedPreset.id,
      count: newCount,
      target,
      date: today,
    });
    setSessions(getDhikrSessions());
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

  const isCompleted = count >= target;
  const progress = Math.min((count / target) * 100, 100);

  // Counter View
  if (selectedPreset) {
    return (
      <div className="min-h-screen bg-[#020617] text-slate-200 flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800/50">
          <button
            onClick={() => setSelectedPreset(null)}
            className="p-2 -ml-2 rounded-lg hover:bg-slate-800/50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </button>
          <span className="font-serif text-lg text-white">{selectedPreset.transliteration}</span>
          <button
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
            className="text-4xl text-amber-400 font-arabic mb-2 text-center"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ fontFamily: 'serif' }}
          >
            {selectedPreset.arabic}
          </motion.p>
          
          {/* Meaning */}
          <p className="text-slate-400 text-sm mb-12 text-center">
            {selectedPreset.meaning[lang]}
          </p>

          {/* Counter Circle */}
          <motion.button
            onClick={handleTap}
            className="relative w-64 h-64 rounded-full flex items-center justify-center"
            whileTap={{ scale: 0.95 }}
          >
            {/* Progress Ring */}
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle
                cx="128"
                cy="128"
                r="120"
                fill="none"
                stroke="rgba(100, 116, 139, 0.2)"
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
                strokeDashoffset={2 * Math.PI * 120 * (1 - progress / 100)}
                initial={{ strokeDashoffset: 2 * Math.PI * 120 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 120 * (1 - progress / 100) }}
                transition={{ duration: 0.3 }}
              />
            </svg>

            {/* Inner Circle */}
            <div className={`w-56 h-56 rounded-full flex flex-col items-center justify-center transition-colors ${
              isCompleted ? 'bg-green-500/10' : 'bg-slate-800/50'
            }`}>
              {isCompleted ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex flex-col items-center"
                >
                  <Check className="w-12 h-12 text-green-400 mb-2" />
                  <span className="text-green-400 font-medium">{t.completed}</span>
                </motion.div>
              ) : (
                <>
                  <span className="text-6xl font-serif text-white">{count}</span>
                  <span className="text-slate-500 text-sm mt-1">/ {target}</span>
                </>
              )}
            </div>

            {/* Ripple Effect */}
            <AnimatePresence>
              {showRipple && (
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-amber-400"
                  initial={{ scale: 0.8, opacity: 1 }}
                  animate={{ scale: 1.2, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </AnimatePresence>
          </motion.button>

          <p className="text-slate-500 text-sm mt-8">{t.tap}</p>
        </div>
      </div>
    );
  }

  // Selection View
  return (
    <div className="min-h-screen bg-[#020617] text-slate-200">
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

      {/* Today's Progress */}
      {sessions.length > 0 && (
        <div className="px-6 py-4">
          <h3 className="text-sm text-slate-500 mb-3">{t.todayProgress}</h3>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {sessions.map(session => {
              const preset = DHIKR_PRESETS.find(p => p.id === session.presetId);
              if (!preset) return null;
              const isComplete = session.count >= session.target;
              return (
                <div
                  key={session.presetId}
                  className={`flex-shrink-0 px-3 py-2 rounded-lg border ${
                    isComplete 
                      ? 'bg-green-500/10 border-green-500/30' 
                      : 'bg-slate-800/50 border-slate-700'
                  }`}
                >
                  <p className="text-xs text-slate-400">{preset.transliteration}</p>
                  <p className={`text-sm font-medium ${isComplete ? 'text-green-400' : 'text-white'}`}>
                    {session.count}/{session.target}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Dhikr List */}
      <div className="px-6 py-4">
        <h3 className="text-sm text-slate-500 mb-3">{t.selectDhikr}</h3>
        <div className="space-y-3">
          {DHIKR_PRESETS.map((preset, i) => {
            const session = sessions.find(s => s.presetId === preset.id);
            const isComplete = session && session.count >= session.target;
            
            return (
              <motion.div
                key={preset.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card 
                  className={`border cursor-pointer transition-all hover:border-amber-500/50 ${
                    isComplete 
                      ? 'bg-green-500/5 border-green-500/30' 
                      : 'bg-slate-800/30 border-slate-700'
                  }`}
                  onClick={() => handleSelectPreset(preset)}
                >
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="flex-1">
                      <p className="text-xl text-amber-400 mb-1" style={{ fontFamily: 'serif' }}>
                        {preset.arabic}
                      </p>
                      <p className="text-white font-medium">{preset.transliteration}</p>
                      <p className="text-slate-500 text-sm">{preset.meaning[lang]}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {session && (
                        <span className={`text-sm ${isComplete ? 'text-green-400' : 'text-slate-400'}`}>
                          {session.count}/{session.target}
                        </span>
                      )}
                      <ChevronRight className="w-5 h-5 text-slate-500" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DhikrPage;
