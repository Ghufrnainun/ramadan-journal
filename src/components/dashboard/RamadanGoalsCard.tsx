import { useMemo } from 'react';
import { Sparkles, Target, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRamadanGoals } from '@/hooks/useRamadanGoals';
import { getProfile } from '@/lib/storage';

const RamadanGoalsCard = () => {
  const { goals, isLoading, error } = useRamadanGoals();
  const lang = getProfile().language === 'en' ? 'en' : 'id';
  const t = {
    id: {
      title: 'Ramadan Goals',
      loading: 'Memuat goals...',
      error: 'Gagal memuat goals Ramadan.',
      summary: 'target selesai',
      allDone: 'Semua goal selesai. MasyaAllah.',
    },
    en: {
      title: 'Ramadan Goals',
      loading: 'Loading goals...',
      error: 'Failed to load Ramadan goals.',
      summary: 'goals completed',
      allDone: 'All goals completed. MashaAllah.',
    },
  }[lang];

  const summary = useMemo(() => {
    const list = goals ?? [];
    const completed = list.filter((goal) => goal.completed).length;
    return {
      total: list.length,
      completed,
      items: list.slice(0, 3),
    };
  }, [goals]);

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-800/70 bg-slate-900/50 p-5">
        <div className="flex items-center gap-2 text-slate-300">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">{t.loading}</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-5">
        <p className="text-sm text-rose-200">{t.error}</p>
      </div>
    );
  }

  return (
    <section className="relative overflow-hidden rounded-2xl border border-slate-800/70 bg-slate-900/50 p-5">
      <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-amber-500/10 blur-3xl" />
      <div className="relative">
        <div className="mb-4 flex items-center gap-2">
          <Target className="h-5 w-5 text-amber-300" />
          <h3 className="font-serif text-lg text-white">{t.title}</h3>
        </div>

        <p className="mb-4 text-sm text-slate-300">
          {summary.completed}/{summary.total} {t.summary}
        </p>

        <div className="space-y-2">
          {summary.items.map((goal) => {
            const current = goal.current ?? 0;
            const target = goal.target || 1;
            const pct = Math.min(100, Math.round((current / target) * 100));
            return (
              <div key={goal.id} className="rounded-xl border border-slate-700 bg-slate-950/40 p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="truncate text-sm text-white">{goal.title}</p>
                  <span className="text-xs text-slate-400">{current}/{target}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-700/80">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-400 to-emerald-400"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {summary.total > 0 && summary.completed === summary.total && (
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mt-4 rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-3 text-sm text-emerald-200"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span>{t.allDone}</span>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default RamadanGoalsCard;
