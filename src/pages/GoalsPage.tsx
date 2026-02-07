import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Target, Trash2, Sparkles } from 'lucide-react';
import ResponsiveLayout from '@/components/layout/ResponsiveLayout';
import { getProfile } from '@/lib/storage';
import { useRamadanGoals } from '@/hooks/useRamadanGoals';
import { useFastingLog } from '@/hooks/useFastingLog';
import { useTarawihLog } from '@/hooks/useTarawihLog';
import { useSedekahLog } from '@/hooks/useSedekahLog';
import { useReadingProgress } from '@/hooks/useReadingProgress';

const presets = [
  { goal_type: 'khatam', title: 'Khatam 1x', target: 30 },
  { goal_type: 'fasting_30', title: 'Puasa 30 Hari', target: 30 },
  { goal_type: 'tarawih_30', title: 'Tarawih 30 Malam', target: 30 },
  { goal_type: 'sedekah_30', title: 'Sedekah Harian', target: 30 },
];

const GoalsPage = () => {
  const navigate = useNavigate();
  const profile = getProfile();
  const lang = profile.language === 'en' ? 'en' : 'id';
  const t = {
    id: {
      title: 'Ramadan Goals',
      presetGoals: 'Preset Goals',
      customGoal: 'Custom Goal',
      addGoal: 'Tambah Goal',
      titleRequired: 'Judul goal wajib diisi.',
      targetRequired: 'Target minimal 1.',
      deleteConfirm: 'Hapus goal ini?',
      loading: 'Memuat goals...',
      error: 'Gagal memuat goals.',
      done: 'Goal selesai',
      placeholder: 'Contoh: Khatam tafsir ringkas',
      back: 'Back',
    },
    en: {
      title: 'Ramadan Goals',
      presetGoals: 'Preset Goals',
      customGoal: 'Custom Goal',
      addGoal: 'Add Goal',
      titleRequired: 'Goal title is required.',
      targetRequired: 'Target must be at least 1.',
      deleteConfirm: 'Delete this goal?',
      loading: 'Loading goals...',
      error: 'Failed to load goals.',
      done: 'Goal completed',
      placeholder: 'Example: Finish concise tafsir',
      back: 'Back',
    },
  }[lang];
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState(30);
  const [formError, setFormError] = useState('');
  const pendingUpdateIds = useRef(new Set<string>());

  const { goals, isLoading, error, createGoal, updateGoal, deleteGoal, isUpdating } =
    useRamadanGoals();
  const { logs: fastingLogs } = useFastingLog();
  const { logs: tarawihLogs } = useTarawihLog();
  const { logs: sedekahLogs } = useSedekahLog();
  const { progress: readingProgress } = useReadingProgress();

  useEffect(() => {
    if (!profile.onboardingCompleted) {
      navigate('/onboarding');
    }
  }, [navigate, profile.onboardingCompleted]);

  const computed = useMemo(() => {
    return {
      fasting_30: (fastingLogs ?? []).filter((log) => log.status === 'full').length,
      tarawih_30: (tarawihLogs ?? []).filter((log) => log.tarawih_done).length,
      sedekah_30: (sedekahLogs ?? []).filter((log) => log.completed).length,
      khatam: Math.min(30, readingProgress?.juz_number ?? 0),
    };
  }, [fastingLogs, tarawihLogs, sedekahLogs, readingProgress]);

  useEffect(() => {
    if (isUpdating) return;
    (goals ?? []).forEach((goal) => {
      if (!(goal.goal_type in computed)) return;
      const current = computed[goal.goal_type as keyof typeof computed];
      const completed = current >= goal.target;
      if (
        ((goal.current ?? 0) !== current || Boolean(goal.completed) !== completed) &&
        !pendingUpdateIds.current.has(goal.id)
      ) {
        pendingUpdateIds.current.add(goal.id);
        updateGoal(
          { id: goal.id, current, completed },
          {
            onSettled: () => {
              pendingUpdateIds.current.delete(goal.id);
            },
          },
        );
      }
    });
  }, [computed, goals, updateGoal, isUpdating]);

  const existingTypes = new Set((goals ?? []).map((goal) => goal.goal_type));

  return (
    <ResponsiveLayout className="pb-24">
      <header className="flex items-center justify-between border-b border-slate-800/50 px-6 py-4 md:hidden">
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-800/50"
          aria-label={t.back}
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <span className="font-serif text-lg text-white">{t.title}</span>
        <div className="w-9" />
      </header>

      <main className="space-y-6 px-6 py-6 md:px-0 md:py-0">
        <div className="hidden items-center justify-between md:flex">
          <h1 className="font-serif text-3xl text-white">{t.title}</h1>
        </div>

        <section className="rounded-2xl border border-slate-800/70 bg-slate-900/50 p-5">
          <div className="mb-3 flex items-center gap-2">
            <Target className="h-5 w-5 text-amber-300" />
            <h2 className="font-serif text-lg text-white">{t.presetGoals}</h2>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {presets.map((preset) => (
              <button
                key={preset.goal_type}
                type="button"
                disabled={existingTypes.has(preset.goal_type) || isUpdating}
                onClick={() =>
                  createGoal({
                    goal_type: preset.goal_type,
                    title: preset.title,
                    target: preset.target,
                  })
                }
                className="rounded-xl border border-slate-700 bg-slate-950/40 px-3 py-2 text-left text-sm text-slate-200 transition-colors enabled:hover:border-amber-400/40 enabled:hover:bg-amber-500/10 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {preset.title}
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800/70 bg-slate-900/50 p-5">
          <h2 className="mb-3 font-serif text-lg text-white">{t.customGoal}</h2>
          <div className="space-y-2">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t.placeholder}
              className="w-full rounded-xl border border-slate-700 bg-slate-950/40 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-amber-500/50 focus:outline-none"
            />
            <input
              type="number"
              min={1}
              value={target}
              onChange={(e) => setTarget(Math.max(1, Number(e.target.value || 1)))}
              className="w-full rounded-xl border border-slate-700 bg-slate-950/40 px-3 py-2 text-sm text-white focus:border-amber-500/50 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => {
                if (!title.trim()) {
                  setFormError(t.titleRequired);
                  return;
                }
                if (target < 1) {
                  setFormError(t.targetRequired);
                  return;
                }
                setFormError('');
                createGoal({ goal_type: 'custom', title: title.trim(), target });
                setTitle('');
                setTarget(30);
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-amber-400/40 bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-200 transition-colors hover:bg-amber-500/20"
            >
              <Plus className="h-4 w-4" />
              {t.addGoal}
            </button>
            {formError && <p className="text-xs text-rose-300">{formError}</p>}
          </div>
        </section>

        <section className="space-y-3">
          {isLoading && <p className="text-sm text-slate-400">{t.loading}</p>}
          {error && <p className="text-sm text-rose-300">{t.error}</p>}
          {(goals ?? []).map((goal) => {
            const current = goal.current ?? 0;
            const pct = Math.min(100, Math.round((current / goal.target) * 100));
            const completed = Boolean(goal.completed);
            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-slate-800/70 bg-slate-900/50 p-4"
              >
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="text-white">{goal.title}</p>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(t.deleteConfirm)) {
                        deleteGoal(goal.id);
                      }
                    }}
                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-800/70 hover:text-rose-300"
                    aria-label="Delete goal"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <p className="mb-2 text-xs text-slate-400">
                  {current}/{goal.target}
                </p>
                <div className="mb-3 h-2 overflow-hidden rounded-full bg-slate-700/70">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-400 to-emerald-400"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                {goal.goal_type === 'custom' && (
                  <div className="mb-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        updateGoal({
                          id: goal.id,
                          current: Math.max(0, current - 1),
                          completed: Math.max(0, current - 1) >= goal.target,
                        })
                      }
                      className="rounded-lg border border-slate-700 px-2 py-1 text-xs text-slate-300"
                    >
                      -1
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        updateGoal({
                          id: goal.id,
                          current: current + 1,
                          completed: current + 1 >= goal.target,
                        })
                      }
                      className="rounded-lg border border-slate-700 px-2 py-1 text-xs text-slate-300"
                    >
                      +1
                    </button>
                  </div>
                )}
                {completed && (
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-200"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    {t.done}
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </section>
      </main>
    </ResponsiveLayout>
  );
};

export default GoalsPage;
