import { useEffect, useMemo, useState } from 'react';
import { HandHeart, Loader2 } from 'lucide-react';
import { useSedekahLog } from '@/hooks/useSedekahLog';
import { getLocalDateKey } from '@/lib/date';
import { getProfile } from '@/lib/storage';

const today = getLocalDateKey();

const SedekahCard = () => {
  const { logs, isLoading, error, upsertSedekahLog, isUpdating } = useSedekahLog();
  const lang = getProfile().language === 'en' ? 'en' : 'id';
  const t = {
    id: {
      title: 'Sedekah Hari Ini',
      loading: 'Memuat sedekah...',
      error: 'Gagal memuat data sedekah.',
      saving: 'Menyimpan...',
      done: 'Sudah bersedekah',
      notes: 'Catatan (opsional)',
      placeholder: 'Contoh: sedekah makanan untuk tetangga',
    },
    en: {
      title: 'Today Sedekah',
      loading: 'Loading sedekah...',
      error: 'Failed to load sedekah.',
      saving: 'Saving...',
      done: 'Sedekah done',
      notes: 'Notes (optional)',
      placeholder: 'Example: shared food with neighbors',
    },
  }[lang];

  const todayLog = useMemo(
    () => logs?.find((item) => item.date === today),
    [logs],
  );
  const [form, setForm] = useState({ completed: false, notes: '' });

  useEffect(() => {
    setForm({
      completed: todayLog?.completed ?? false,
      notes: todayLog?.notes ?? '',
    });
  }, [todayLog]);

  const save = (payload: { completed?: boolean; notes?: string }) => {
    const next = {
      date: today,
      completed: payload.completed ?? form.completed,
      notes: payload.notes ?? form.notes,
    };
    setForm(next);
    upsertSedekahLog(next);
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
          <HandHeart className="h-5 w-5 text-emerald-300" />
          <h3 className="font-serif text-lg text-white">{t.title}</h3>
        </div>
        {isUpdating && <span className="text-xs text-slate-400">{t.saving}</span>}
      </div>

      <label className="mb-3 flex cursor-pointer items-center justify-between rounded-xl border border-slate-700 bg-slate-950/40 px-3 py-2">
        <span className="text-sm text-slate-200">{t.done}</span>
        <input
          type="checkbox"
          checked={form.completed}
          onChange={(e) => save({ completed: e.target.checked })}
          className="h-4 w-4 accent-emerald-500"
        />
      </label>

      <label className="block space-y-1">
        <span className="text-xs text-slate-400">{t.notes}</span>
        <textarea
          value={form.notes}
          onChange={(e) => save({ notes: e.target.value })}
          placeholder={t.placeholder}
          className="min-h-[86px] w-full rounded-xl border border-slate-700 bg-slate-950/40 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-amber-500/50 focus:outline-none"
        />
      </label>
    </section>
  );
};

export default SedekahCard;
