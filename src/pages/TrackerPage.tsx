import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Check,
  Clock,
  BookOpen,
  Heart,
  HandHeart,
  MessageCircle,
  RotateCcw,
} from 'lucide-react';
import { getProfile } from '@/lib/storage';
import {
  getTodayProgress,
  toggleItem,
  updateNote,
  getTrackerItems,
  saveCustomTrackerItem,
  deleteCustomTrackerItem,
  incrementCount,
  resetCount,
  getCompletedCount,
} from '@/lib/tracker-storage';
import { markActiveDay } from '@/lib/streak';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import ResponsiveLayout from '@/components/layout/ResponsiveLayout';

const content = {
  id: {
    title: 'Tracker Harian',
    progress: 'Progress Hari Ini',
    completed: 'selesai',
    encouragement: 'MasyaAllah! Kamu luar biasa! 🌟',
    keepGoing: 'Terus semangat! 💪',
    startDay: 'Yuk mulai hari ini! ✨',
    notePlaceholder: 'Catatan singkat...',
    addTitle: 'Tambah Tracker Baru',
    addHint: 'Tambahkan kebiasaan personal tanpa mengubah checklist utama.',
    labelId: 'Label (ID)',
    labelEn: 'Label (EN, opsional)',
    typeLabel: 'Tipe',
    typeCheck: 'Checklist',
    typeCount: 'Hitung',
    targetLabel: 'Target (count)',
    addButton: 'Simpan Tracker',
    deleteCustom: 'Hapus tracker',
    requiredError: 'Label tidak boleh kosong.',
    confirmTitle: 'Hapus tracker?',
    confirmDesc: 'Tracker custom akan dihapus dari daftar.',
    confirmCancel: 'Batal',
    confirmAction: 'Hapus',
  },
  en: {
    title: 'Daily Tracker',
    progress: "Today's Progress",
    completed: 'completed',
    encouragement: 'MashaAllah! You are amazing! 🌟',
    keepGoing: 'Keep going! 💪',
    startDay: "Let's start today! ✨",
    notePlaceholder: 'Quick note...',
    addTitle: 'Add Custom Tracker',
    addHint: 'Add a personal habit without changing the main checklist.',
    labelId: 'Label (ID)',
    labelEn: 'Label (EN, optional)',
    typeLabel: 'Type',
    typeCheck: 'Checklist',
    typeCount: 'Count',
    targetLabel: 'Target (count)',
    addButton: 'Save Tracker',
    deleteCustom: 'Delete tracker',
    requiredError: 'Label is required.',
    confirmTitle: 'Delete tracker?',
    confirmDesc: 'This custom tracker will be removed from the list.',
    confirmCancel: 'Cancel',
    confirmAction: 'Delete',
  },
};

const iconMap: Record<string, React.ReactNode> = {
  clock: <Clock className="w-5 h-5" />,
  'book-open': <BookOpen className="w-5 h-5" />,
  heart: <Heart className="w-5 h-5" />,
  'hand-heart': <HandHeart className="w-5 h-5" />,
  'message-circle': <MessageCircle className="w-5 h-5" />,
  check: <Check className="w-5 h-5" />,
};

const TrackerPage: React.FC = () => {
  const navigate = useNavigate();
  const [lang, setLang] = useState<'id' | 'en'>('id');
  const [progress, setProgress] = useState(getTodayProgress());
  const [completedCount, setCompletedCount] = useState(getCompletedCount());
  const [items, setItems] = useState(getTrackerItems());
  const [customLabelId, setCustomLabelId] = useState('');
  const [customLabelEn, setCustomLabelEn] = useState('');
  const [customType, setCustomType] = useState<'check' | 'count'>('check');
  const [customTarget, setCustomTarget] = useState(33);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const profile = getProfile();
    if (!profile.onboardingCompleted) {
      navigate('/onboarding');
      return;
    }
    setLang(profile.language);
  }, [navigate]);

  const t = content[lang];
  const totalItems = items.length || 1;
  const progressPercent = (completedCount / totalItems) * 100;

  const handleToggle = (itemId: string) => {
    const updated = toggleItem(itemId);
    setProgress(updated);
    setCompletedCount(getCompletedCount());
    markActiveDay(updated.date);
  };

  const handleIncrement = (itemId: string) => {
    const updated = incrementCount(itemId);
    setProgress(updated);
    setCompletedCount(getCompletedCount());
    markActiveDay(updated.date);
  };

  const handleResetCount = (itemId: string) => {
    const updated = resetCount(itemId);
    setProgress(updated);
    setCompletedCount(getCompletedCount());
  };

  const refreshItems = () => {
    setItems(getTrackerItems());
    setCompletedCount(getCompletedCount());
  };

  const handleAddTracker = () => {
    if (!customLabelId.trim()) {
      setFormError(t.requiredError);
      return;
    }
    setFormError(null);
    saveCustomTrackerItem({
      id: `custom-${Date.now()}`,
      label: {
        id: customLabelId.trim(),
        en: customLabelEn.trim() || customLabelId.trim(),
      },
      icon: 'check',
      isCustom: true,
      type: customType,
      target: customType === 'count' ? customTarget : undefined,
    });
    setCustomLabelId('');
    setCustomLabelEn('');
    setCustomType('check');
    setCustomTarget(33);
    refreshItems();
  };

  const getMessage = () => {
    if (completedCount === totalItems) return t.encouragement;
    if (completedCount > 0) return t.keepGoing;
    return t.startDay;
  };

  return (
    <ResponsiveLayout className="pb-24">
      {/* Header - Mobile Only */}
      <header className="md:hidden flex items-center justify-between px-6 py-4 border-b border-slate-800/50 sticky top-0 bg-[#020617]/80 z-20">
        <button
          onClick={() => navigate('/dashboard')}
          className="p-2 -ml-2 rounded-lg hover:bg-slate-800/50 transition-colors"
          aria-label="Back to dashboard"
        >
          <ArrowLeft className="w-5 h-5 text-slate-400" />
        </button>
        <span className="font-serif text-lg text-white text-balance">
          {t.title}
        </span>
        <div className="w-9" />
      </header>

      {/* Desktop Header */}
      <div className="hidden md:flex items-center justify-between mb-8 max-w-2xl mx-auto w-full">
        <h1 className="font-serif text-3xl text-white">{t.title}</h1>
      </div>

      {/* Progress Card */}
      <div className="px-6 py-6 md:p-0 mb-6 max-w-2xl mx-auto w-full">
        <div>
          <div className="rounded-2xl bg-slate-900/50 border border-slate-800/70 p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-400 text-sm font-medium">
                {t.progress}
              </span>
              <span className="text-amber-400 font-medium bg-amber-500/10 px-2 py-1 rounded-lg text-xs border border-amber-500/20 tabular-nums">
                {completedCount}/{totalItems} {t.completed}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="h-3 bg-slate-800/50 rounded-full overflow-hidden mb-4">
              <div
                className="h-full bg-amber-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Message */}
            <p className="text-center text-white text-sm font-medium text-pretty">
              {getMessage()}
            </p>
          </div>
        </div>
      </div>

      {/* Checklist Items */}
      <div className="px-6 space-y-3 md:p-0 max-w-2xl mx-auto w-full">
        {items.map((item) => {
          const isCount = item.type === 'count';
          const isChecked = progress.items[item.id] || false;
          const currentCount = progress.counts?.[item.id] || 0;
          const targetCount = item.target || 33;
          const isCompleted = isCount ? currentCount >= targetCount : isChecked;

          return (
            <div key={item.id}>
              <button
                onClick={() =>
                  isCount ? handleIncrement(item.id) : handleToggle(item.id)
                }
                className={cn(
                  'w-full p-4 rounded-xl border flex items-center gap-4 transition-colors duration-300 group',
                  isCompleted
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : 'bg-slate-800/30 border-slate-700 hover:bg-slate-800/50 hover:border-slate-600',
                )}
              >
                {/* Checkbox */}
                <div
                  className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-300 shrink-0',
                    isCompleted
                      ? 'bg-emerald-500 text-white shadow-lg'
                      : 'bg-slate-700/50 text-slate-500 group-hover:bg-slate-700',
                  )}
                >
                  {isCompleted ? (
                    <div>
                      <Check className="w-5 h-5" />
                    </div>
                  ) : (
                    iconMap[item.icon]
                  )}
                </div>

                {/* Label */}
                <span
                  className={cn(
                    'flex-1 text-left font-medium transition-colors duration-300',
                    isCompleted
                      ? 'text-emerald-400 line-through decoration-emerald-500/50'
                      : 'text-white group-hover:text-amber-100',
                  )}
                >
                  {item.label[lang]}
                </span>

                {/* Status Indicator */}
                {isCompleted && (
                  <span className="text-green-400 text-xs bg-green-500/20 px-2 py-1 rounded-full tabular-nums">
                    ✓
                  </span>
                )}
              </button>
              {isCount && (
                <div className="mt-2 flex items-center justify-between gap-3 px-1">
                  <div className="text-xs text-slate-500">
                    {t.typeCount}:{' '}
                    <span className="text-slate-200 tabular-nums">
                      {currentCount}/{targetCount}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleIncrement(item.id)}
                      className="px-3 py-1.5 rounded-lg border border-amber-500/30 text-amber-300 text-xs hover:bg-amber-500/10 transition-colors"
                    >
                      <span className="sr-only">{t.typeCount}</span>
                      +1
                    </button>
                    <button
                      onClick={() => handleResetCount(item.id)}
                      aria-label="Reset count"
                      className="p-2 rounded-lg border border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
              {item.isCustom && (
                <div className="mt-2 flex items-center justify-end">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button className="text-xs text-rose-300 hover:text-rose-200 bg-rose-500/10 px-2 py-1 rounded-lg transition-colors">
                        {t.deleteCustom}
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-slate-900 border-slate-800">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-white">
                          {t.confirmTitle}
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-400">
                          {t.confirmDesc}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="border-slate-700 text-slate-300 hover:bg-slate-800">
                          {t.confirmCancel}
                        </AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-rose-500 text-white hover:bg-rose-400"
                          onClick={() => {
                            deleteCustomTrackerItem(item.id);
                            refreshItems();
                          }}
                        >
                          {t.confirmAction}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
              <div className="mt-2 px-1">
                <textarea
                  value={progress.notes[item.id] || ''}
                  onChange={(e) => {
                    const updated = updateNote(item.id, e.target.value);
                    setProgress(updated);
                  }}
                  placeholder={t.notePlaceholder}
                  className="w-full bg-slate-800/20 border-b border-slate-700/50 px-2 py-2 text-xs text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50 transition-colors resize-none h-auto min-h-[32px] focus:min-h-[60px] focus:bg-slate-800/40 rounded-lg text-left"
                  rows={1}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Custom Tracker */}
      <div className="px-6 mt-8 md:px-0 max-w-2xl mx-auto w-full">
        <div className="rounded-2xl bg-slate-900/50 border border-slate-800/70 p-6 space-y-4">
          <div>
            <p className="font-serif text-white text-lg text-balance mb-1">
              {t.addTitle}
            </p>
            <p className="text-sm text-slate-500 text-pretty">{t.addHint}</p>
          </div>
          <div className="space-y-3">
            <input
              value={customLabelId}
              onChange={(e) => setCustomLabelId(e.target.value)}
              placeholder={t.labelId}
              className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50 transition-colors"
            />
            <input
              value={customLabelEn}
              onChange={(e) => setCustomLabelEn(e.target.value)}
              placeholder={t.labelEn}
              className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50 transition-colors"
            />
            <div className="space-y-2">
              <label className="text-xs text-slate-500">{t.typeLabel}</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setCustomType('check')}
                  className={cn(
                    'py-2 rounded-lg border text-sm transition-colors',
                    customType === 'check'
                      ? 'border-amber-500/40 text-amber-300 bg-amber-500/10'
                      : 'border-slate-800 text-slate-400 hover:bg-slate-900/40',
                  )}
                >
                  {t.typeCheck}
                </button>
                <button
                  onClick={() => setCustomType('count')}
                  className={cn(
                    'py-2 rounded-lg border text-sm transition-colors',
                    customType === 'count'
                      ? 'border-amber-500/40 text-amber-300 bg-amber-500/10'
                      : 'border-slate-800 text-slate-400 hover:bg-slate-900/40',
                  )}
                >
                  {t.typeCount}
                </button>
              </div>
            </div>
            {customType === 'count' && (
              <div className="space-y-2">
                <label className="text-xs text-slate-500">
                  {t.targetLabel}
                </label>
                <input
                  type="number"
                  min={1}
                  value={customTarget}
                  onChange={(e) =>
                    setCustomTarget(Math.max(1, Number(e.target.value || 1)))
                  }
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50 transition-colors"
                />
              </div>
            )}
            {formError && (
              <p className="text-xs text-rose-400 bg-rose-500/10 px-3 py-2 rounded-lg">
                {formError}
              </p>
            )}
            <button
              onClick={handleAddTracker}
              className="w-full py-3 rounded-xl border border-amber-500/30 text-amber-300 hover:bg-amber-500/10 transition-colors text-sm font-medium"
            >
              {t.addButton}
            </button>
          </div>
        </div>
      </div>

      {/* Motivational Footer */}
      {completedCount === totalItems && (
        <div className="px-6 mt-8 md:px-0 max-w-2xl mx-auto w-full">
          <div className="text-center p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
            <span className="text-4xl mb-3 block">🎉</span>
            <p className="text-emerald-400 font-serif text-lg text-balance">
              {lang === 'id'
                ? 'Alhamdulillah, hari ini sempurna!'
                : 'Alhamdulillah, perfect day!'}
            </p>
          </div>
        </div>
      )}
    </ResponsiveLayout>
  );
};

export default TrackerPage;
