import { useEffect, useMemo, useState } from 'react';
import { Loader2, Moon } from 'lucide-react';
import { useTarawihLog } from '@/hooks/useTarawihLog';
import { getLocalDateKey } from '@/lib/date';
import { getProfile } from '@/lib/storage';

const today = getLocalDateKey();

const TarawihCard = () => {
  const { logs, isLoading, error, upsertTarawihLog, isUpdating } =
    useTarawihLog();
  const lang = getProfile().language === 'en' ? 'en' : 'id';
  const t = {
    id: {
      title: 'Tarawih Malam Ini',
      loading: 'Memuat tarawih...',
      error: 'Gagal memuat data tarawih.',
      saving: 'Menyimpan...',
      tarawih: 'Tarawih',
      tarawihRakaat: 'Rakaat Tarawih',
      witir: 'Witir',
      witirRakaat: 'Rakaat Witir',
      mosque: 'Masjid (opsional)',
      mosquePlaceholder: 'Contoh: Al-Ikhlas',
    },
    en: {
      title: 'Tonight Tarawih',
      loading: 'Loading tarawih...',
      error: 'Failed to load tarawih.',
      saving: 'Saving...',
      tarawih: 'Tarawih',
      tarawihRakaat: 'Tarawih Rakats',
      witir: 'Witir',
      witirRakaat: 'Witir Rakats',
      mosque: 'Mosque (optional)',
      mosquePlaceholder: 'Example: Al-Ikhlas',
    },
  }[lang];

  const todayLog = useMemo(
    () => logs?.find((item) => item.date === today),
    [logs],
  );
  const [form, setForm] = useState({
    tarawih_done: false,
    rakaat_count: 0,
    witir_done: false,
    witir_rakaat: 0,
    mosque_name: '',
  });

  useEffect(() => {
    setForm({
      tarawih_done: todayLog?.tarawih_done ?? false,
      rakaat_count: todayLog?.rakaat_count ?? 0,
      witir_done: todayLog?.witir_done ?? false,
      witir_rakaat: todayLog?.witir_rakaat ?? 0,
      mosque_name: todayLog?.mosque_name ?? '',
    });
  }, [todayLog]);

  const save = (payload: {
    tarawih_done?: boolean;
    rakaat_count?: number;
    witir_done?: boolean;
    witir_rakaat?: number;
    mosque_name?: string;
  }) => {
    const next = {
      date: today,
      tarawih_done: payload.tarawih_done ?? form.tarawih_done,
      rakaat_count: payload.rakaat_count ?? form.rakaat_count,
      witir_done: payload.witir_done ?? form.witir_done,
      witir_rakaat: payload.witir_rakaat ?? form.witir_rakaat,
      mosque_name: payload.mosque_name ?? form.mosque_name,
    };
    setForm({
      tarawih_done: next.tarawih_done,
      rakaat_count: next.rakaat_count,
      witir_done: next.witir_done,
      witir_rakaat: next.witir_rakaat,
      mosque_name: next.mosque_name,
    });
    upsertTarawihLog(next);
  };

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
    <section className="rounded-2xl border border-slate-800/70 bg-slate-900/50 p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Moon className="h-5 w-5 text-indigo-300" />
          <h3 className="font-serif text-lg text-white">{t.title}</h3>
        </div>
        {isUpdating && (
          <span className="text-xs text-slate-400">{t.saving}</span>
        )}
      </div>

      <div className="space-y-4">
        <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-700 bg-slate-950/40 px-3 py-3 transition-colors hover:bg-slate-900/60">
          <span className="text-sm font-medium text-slate-200">
            {t.tarawih}
          </span>
          <input
            type="checkbox"
            checked={form.tarawih_done}
            onChange={(e) => save({ tarawih_done: e.target.checked })}
            className="h-5 w-5 accent-emerald-500"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-slate-300">
            {t.tarawihRakaat}
          </span>
          <input
            type="number"
            min={0}
            max={36}
            value={form.rakaat_count}
            onChange={(e) =>
              save({ rakaat_count: Number(e.target.value || 0) })
            }
            className="w-full rounded-xl border border-slate-700 bg-slate-950/40 px-3 py-3 text-base text-white transition-all focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          />
        </label>

        <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-700 bg-slate-950/40 px-3 py-3 transition-colors hover:bg-slate-900/60">
          <span className="text-sm font-medium text-slate-200">{t.witir}</span>
          <input
            type="checkbox"
            checked={form.witir_done}
            onChange={(e) => save({ witir_done: e.target.checked })}
            className="h-5 w-5 accent-emerald-500"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-slate-300">
            {t.witirRakaat}
          </span>
          <input
            type="number"
            min={0}
            max={11}
            value={form.witir_rakaat}
            onChange={(e) =>
              save({ witir_rakaat: Number(e.target.value || 0) })
            }
            className="w-full rounded-xl border border-slate-700 bg-slate-950/40 px-3 py-3 text-base text-white transition-all focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-slate-300">{t.mosque}</span>
          <input
            type="text"
            value={form.mosque_name}
            onChange={(e) => save({ mosque_name: e.target.value })}
            placeholder={t.mosquePlaceholder}
            className="w-full rounded-xl border border-slate-700 bg-slate-950/40 px-3 py-3 text-base text-white placeholder:text-slate-500 transition-all focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          />
        </label>
      </div>
    </section>
  );
};

export default TarawihCard;
