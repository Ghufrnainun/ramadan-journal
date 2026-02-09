import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Activity, Flame } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import ResponsiveLayout from '@/components/layout/ResponsiveLayout';
import { useFastingLog } from '@/hooks/useFastingLog';
import { useTarawihLog } from '@/hooks/useTarawihLog';
import { useSedekahLog } from '@/hooks/useSedekahLog';
import { useRamadanGoals } from '@/hooks/useRamadanGoals';
import { getStreakSummary } from '@/lib/streak';
import { getProfile } from '@/lib/storage';

const StatsPage = () => {
  const navigate = useNavigate();
  const profile = getProfile();
  const lang = profile.language === 'en' ? 'en' : 'id';
  const t = {
    id: {
      title: 'Statistik Ramadan',
      back: 'Kembali',
      fasting: 'Puasa Full',
      tarawih: 'Tarawih',
      sedekah: 'Sedekah',
      goalDone: 'Goal Selesai',
      trend: 'Tren 7 Hari',
      streak: 'Streak',
      activeStreak: 'Active Streak',
      reflectionStreak: 'Reflection Streak',
      days: 'hari',
      loading: 'Memuat statistik...',
      error: 'Gagal memuat statistik.',
    },
    en: {
      title: 'Ramadan Stats',
      back: 'Back',
      fasting: 'Fasting',
      tarawih: 'Tarawih',
      sedekah: 'Charity',
      goalDone: 'Completed Goals',
      trend: '7-Day Trend',
      streak: 'Streak',
      activeStreak: 'Active Streak',
      reflectionStreak: 'Reflection Streak',
      days: 'days',
      loading: 'Loading stats...',
      error: 'Failed to load stats.',
    },
  }[lang];

  const { logs: fastingLogs, isLoading: fastingLoading, error: fastingError } = useFastingLog();
  const { logs: tarawihLogs, isLoading: tarawihLoading, error: tarawihError } = useTarawihLog();
  const { logs: sedekahLogs, isLoading: sedekahLoading, error: sedekahError } = useSedekahLog();
  const { goals, isLoading: goalsLoading, error: goalsError } = useRamadanGoals();
  const isLoading = fastingLoading || tarawihLoading || sedekahLoading || goalsLoading;
  const hasError = Boolean(fastingError || tarawihError || sedekahError || goalsError);

  const summary = useMemo(() => {
    const fasting = (fastingLogs ?? []).filter((log) => log.status === 'full').length;
    const tarawih = (tarawihLogs ?? []).filter((log) => log.tarawih_done).length;
    const sedekah = (sedekahLogs ?? []).filter((log) => log.completed).length;
    const goalDone = (goals ?? []).filter((goal) => goal.completed).length;
    return { fasting, tarawih, sedekah, goalDone };
  }, [fastingLogs, tarawihLogs, sedekahLogs, goals]);
  const hasAnyActivity = summary.fasting > 0 || summary.tarawih > 0 || summary.sedekah > 0 || summary.goalDone > 0;

  const weeklyData = useMemo(() => {
    const locale = lang === 'id' ? 'id-ID' : 'en-US';
    const days = Array.from({ length: 7 }).map((_, idx) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - idx));
      const key = date.toISOString().split('T')[0];
      return { key, label: date.toLocaleDateString(locale, { weekday: 'short' }) };
    });

    return days.map((day) => ({
      day: day.label,
      fasting: (fastingLogs ?? []).some((log) => log.date === day.key && log.status === 'full') ? 1 : 0,
      tarawih: (tarawihLogs ?? []).some((log) => log.date === day.key && log.tarawih_done) ? 1 : 0,
      charity: (sedekahLogs ?? []).some((log) => log.date === day.key && log.completed) ? 1 : 0,
    }));
  }, [fastingLogs, tarawihLogs, sedekahLogs, lang]);

  const streak = getStreakSummary(profile.ramadanStartDate);

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
        <div className="hidden md:block">
          <h1 className="font-serif text-3xl text-white">{t.title}</h1>
        </div>

        {isLoading && (
          <p className="text-sm text-slate-400">{t.loading}</p>
        )}
        {hasError && (
          <p className="text-sm text-rose-300">{t.error}</p>
        )}
        {!isLoading && !hasError && !hasAnyActivity && (
          <p className="text-sm text-slate-400">
            {lang === 'id'
              ? 'Belum ada aktivitas tercatat. Mulai dari Tracker untuk melihat statistik.'
              : 'No recorded activity yet. Start from Tracker to see your stats.'}
          </p>
        )}

        <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-800/70 bg-slate-900/50 p-4">
            <p className="text-xs text-slate-400">{t.fasting}</p>
            <p className="mt-1 text-2xl font-semibold text-emerald-300">{summary.fasting}</p>
          </div>
          <div className="rounded-2xl border border-slate-800/70 bg-slate-900/50 p-4">
            <p className="text-xs text-slate-400">{t.tarawih}</p>
            <p className="mt-1 text-2xl font-semibold text-indigo-300">{summary.tarawih}</p>
          </div>
          <div className="rounded-2xl border border-slate-800/70 bg-slate-900/50 p-4">
            <p className="text-xs text-slate-400">{t.sedekah}</p>
            <p className="mt-1 text-2xl font-semibold text-amber-300">{summary.sedekah}</p>
          </div>
          <div className="rounded-2xl border border-slate-800/70 bg-slate-900/50 p-4">
            <p className="text-xs text-slate-400">{t.goalDone}</p>
            <p className="mt-1 text-2xl font-semibold text-sky-300">{summary.goalDone}</p>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800/70 bg-slate-900/50 p-5">
          <div className="mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-amber-300" />
            <h2 className="font-serif text-lg text-white">{t.trend}</h2>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="day" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: 12,
                  }}
                />
                <Bar dataKey="fasting" name={t.fasting} fill="#34d399" radius={[4, 4, 0, 0]} />
                <Bar dataKey="tarawih" name={t.tarawih} fill="#818cf8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="charity" name={t.sedekah} fill="#fbbf24" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800/70 bg-slate-900/50 p-5">
          <div className="mb-3 flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-300" />
            <h2 className="font-serif text-lg text-white">{t.streak}</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-700 bg-slate-950/40 p-3">
              <p className="text-xs text-slate-400">{t.activeStreak}</p>
              <p className="mt-1 text-xl text-white">{streak.currentActiveStreak} {t.days}</p>
            </div>
            <div className="rounded-xl border border-slate-700 bg-slate-950/40 p-3">
              <p className="text-xs text-slate-400">{t.reflectionStreak}</p>
              <p className="mt-1 text-xl text-white">{streak.currentReflectionStreak} {t.days}</p>
            </div>
          </div>
        </section>
      </main>
    </ResponsiveLayout>
  );
};

export default StatsPage;
