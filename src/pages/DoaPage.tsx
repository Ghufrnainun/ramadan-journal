import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RotateCcw, Check, ChevronRight, Loader2, BookOpen, Bookmark } from 'lucide-react';
import { getProfile } from '@/lib/storage';
import { equranApi, Doa } from '@/lib/api/equran';
import { getDoaSessions, saveDoaSession, getDoaSessionById, DoaSession } from '@/lib/doa-storage';
import { isBookmarked, toggleBookmark } from '@/lib/bookmarks';
import { markActiveDay } from '@/lib/streak';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

const content = {
  id: {
    title: 'Doa Harian',
    subtitle: 'Koleksi Doa dari Al-Quran & Sunnah',
    selectDoa: 'Pilih Doa',
    target: 'Target',
    completed: 'Selesai!',
    reset: 'Ulangi',
    todayProgress: 'Progress Hari Ini',
    tap: 'Ketuk untuk menghitung',
    loading: 'Memuat doa...',
    error: 'Gagal memuat doa',
    retry: 'Coba Lagi',
    readMode: 'Mode Baca',
    counterMode: 'Mode Hitung',
  },
  en: {
    title: 'Daily Dua',
    subtitle: "Collection of Duas from Quran & Sunnah",
    selectDoa: 'Select Dua',
    target: 'Target',
    completed: 'Completed!',
    reset: 'Reset',
    todayProgress: "Today's Progress",
    tap: 'Tap to count',
    loading: 'Loading duas...',
    error: 'Failed to load duas',
    retry: 'Try Again',
    readMode: 'Read Mode',
    counterMode: 'Counter Mode',
  },
};

const DoaPage: React.FC = () => {
  const navigate = useNavigate();
  const [lang, setLang] = useState<'id' | 'en'>('id');
  const [doaList, setDoaList] = useState<Doa[]>([]);
  const [selectedDoa, setSelectedDoa] = useState<Doa | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [count, setCount] = useState(0);
  const [target, setTarget] = useState(3);
  const [showRipple, setShowRipple] = useState(false);
  const [sessions, setSessions] = useState<DoaSession[]>(getDoaSessions());
  const [mode, setMode] = useState<'read' | 'counter'>('read');
  const [isBookmarkedDoa, setIsBookmarkedDoa] = useState(false);

  const t = content[lang];

  useEffect(() => {
    const profile = getProfile();
    if (!profile.onboardingCompleted) {
      navigate('/onboarding');
      return;
    }
    setLang(profile.language);
    loadDoaList();
  }, [navigate]);

  const loadDoaList = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await equranApi.getAllDoa();
      setDoaList(data);
    } catch (err) {
      setError(t.error);
      console.error('Failed to load doa:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectDoa = (doa: Doa) => {
    setSelectedDoa(doa);
    setIsBookmarkedDoa(isBookmarked('doa', `doa-${doa.id}`));
    const existing = getDoaSessionById(doa.id);
    if (existing) {
      setCount(existing.count);
      setTarget(existing.target);
    } else {
      setCount(0);
      setTarget(3); // Default target for doa
    }
  };

  const handleTap = useCallback(() => {
    if (!selectedDoa || mode !== 'counter') return;
    
    const newCount = count + 1;
    setCount(newCount);
    setShowRipple(true);
    setTimeout(() => setShowRipple(false), 300);

    if (navigator.vibrate) {
      navigator.vibrate(10);
    }

    const today = new Date().toISOString().split('T')[0];
    saveDoaSession({
      doaId: selectedDoa.id,
      count: newCount,
      target,
      date: today,
    });
    setSessions(getDoaSessions());
    markActiveDay(today);
  }, [count, selectedDoa, target, mode]);

  const handleReset = () => {
    if (!selectedDoa) return;
    setCount(0);
    const today = new Date().toISOString().split('T')[0];
    saveDoaSession({
      doaId: selectedDoa.id,
      count: 0,
      target,
      date: today,
    });
    setSessions(getDoaSessions());
  };

  const isCompleted = count >= target;
  const progress = Math.min((count / target) * 100, 100);

  // Detail View
  if (selectedDoa) {
    return (
      <div className="min-h-screen bg-[#020617] text-slate-200 flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800/50">
          <button
            onClick={() => setSelectedDoa(null)}
            className="p-2 -ml-2 rounded-lg hover:bg-slate-800/50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </button>
          <span className="font-medium text-white text-sm truncate max-w-[200px]">
            {selectedDoa.nama}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const next = toggleBookmark({
                  id: `doa-${selectedDoa.id}`,
                  type: 'doa',
                  title: selectedDoa.nama,
                  subtitle: selectedDoa.tentang || selectedDoa.grup || 'Doa',
                  content: selectedDoa.idn,
                  createdAt: new Date().toISOString(),
                });
                setIsBookmarkedDoa(next);
              }}
              className="p-2 rounded-lg hover:bg-slate-800/50 transition-colors"
            >
              <Bookmark className={`w-5 h-5 ${isBookmarkedDoa ? 'text-amber-400' : 'text-slate-400'}`} />
            </button>
            {mode === 'counter' && (
              <button
                onClick={handleReset}
                className="p-2 -mr-2 rounded-lg hover:bg-slate-800/50 transition-colors"
              >
                <RotateCcw className="w-5 h-5 text-slate-400" />
              </button>
            )}
          </div>
        </header>

        {/* Mode Toggle */}
        <div className="flex justify-center gap-2 px-6 py-3">
          <button
            onClick={() => setMode('read')}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              mode === 'read' 
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                : 'bg-slate-800/50 text-slate-400'
            }`}
          >
            <BookOpen className="w-4 h-4 inline mr-2" />
            {t.readMode}
          </button>
          <button
            onClick={() => setMode('counter')}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              mode === 'counter' 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                : 'bg-slate-800/50 text-slate-400'
            }`}
          >
            {t.counterMode}
          </button>
        </div>

        {mode === 'read' ? (
          // Read Mode
          <ScrollArea className="flex-1 px-6 py-4">
            <div className="space-y-6 pb-24">
              {/* Arabic Text */}
              <div className="text-center">
                <p 
                  className="text-3xl text-amber-400 leading-loose"
                  dir="rtl"
                  style={{ fontFamily: 'serif', lineHeight: 2.2 }}
                >
                  {selectedDoa.ar}
                </p>
              </div>

              {/* Latin */}
              <div className="bg-slate-800/30 rounded-xl p-4">
                <p className="text-slate-400 text-sm italic leading-relaxed">
                  {selectedDoa.tr}
                </p>
              </div>

              {/* Translation */}
              <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/20">
                <p className="text-slate-200 leading-relaxed">
                  {selectedDoa.idn}
                </p>
              </div>
            </div>
          </ScrollArea>
        ) : (
          // Counter Mode
          <div className="flex-1 flex flex-col items-center justify-center px-6">
            {/* Arabic Text */}
            <motion.p
              className="text-2xl text-amber-400 font-arabic mb-2 text-center max-w-xs"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              dir="rtl"
              style={{ fontFamily: 'serif', lineHeight: 1.8 }}
            >
              {selectedDoa.ar.slice(0, 100)}{selectedDoa.ar.length > 100 ? '...' : ''}
            </motion.p>
            
            <p className="text-slate-400 text-sm mb-8 text-center max-w-xs">
              {selectedDoa.nama}
            </p>

            {/* Counter Circle */}
            <motion.button
              onClick={handleTap}
              className="relative w-64 h-64 rounded-full flex items-center justify-center"
              whileTap={{ scale: 0.95 }}
            >
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
                  stroke={isCompleted ? '#22c55e' : '#10b981'}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 120}
                  strokeDashoffset={2 * Math.PI * 120 * (1 - progress / 100)}
                  initial={{ strokeDashoffset: 2 * Math.PI * 120 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 120 * (1 - progress / 100) }}
                  transition={{ duration: 0.3 }}
                />
              </svg>

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

              <AnimatePresence>
                {showRipple && (
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-emerald-400"
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
        )}
      </div>
    );
  }

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#020617] text-slate-200 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-400 mx-auto mb-4" />
          <p className="text-slate-400">{t.loading}</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-[#020617] text-slate-200 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={loadDoaList}
            className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-medium"
          >
            {t.retry}
          </button>
        </div>
      </div>
    );
  }

  // List View
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
        <div className="text-center">
          <span className="font-serif text-lg text-white">{t.title}</span>
          <p className="text-xs text-slate-500">{t.subtitle}</p>
        </div>
        <div className="w-9" />
      </header>

      {/* Today's Progress */}
      {sessions.length > 0 && (
        <div className="px-6 py-4">
          <h3 className="text-sm text-slate-500 mb-3">{t.todayProgress}</h3>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {sessions.map(session => {
              const doa = doaList.find(d => d.id === session.doaId);
              if (!doa) return null;
              const isComplete = session.count >= session.target;
              return (
                <div
                  key={session.doaId}
                  className={`flex-shrink-0 px-3 py-2 rounded-lg border ${
                    isComplete 
                      ? 'bg-green-500/10 border-green-500/30' 
                      : 'bg-slate-800/50 border-slate-700'
                  }`}
                >
                  <p className="text-xs text-slate-400 truncate max-w-[100px]">{doa.nama}</p>
                  <p className={`text-sm font-medium ${isComplete ? 'text-green-400' : 'text-white'}`}>
                    {session.count}/{session.target}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Doa List */}
      <ScrollArea className="h-[calc(100vh-180px)]">
        <div className="px-6 py-4 space-y-3">
          {doaList.map((doa, i) => {
            const session = sessions.find(s => s.doaId === doa.id);
            const isComplete = session && session.count >= session.target;
            
            return (
              <motion.div
                key={doa.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.02, 0.3) }}
              >
                <Card 
                  className={`border cursor-pointer transition-all hover:border-emerald-500/50 ${
                    isComplete 
                      ? 'bg-green-500/5 border-green-500/30' 
                      : 'bg-slate-800/30 border-slate-700'
                  }`}
                  onClick={() => handleSelectDoa(doa)}
                >
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-medium text-sm">
                      {doa.id}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{doa.nama}</p>
                      <p className="text-slate-500 text-sm truncate">{doa.idn.slice(0, 50)}...</p>
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
      </ScrollArea>
    </div>
  );
};

export default DoaPage;
