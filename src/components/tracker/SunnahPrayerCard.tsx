import { Moon, Loader2 } from 'lucide-react';
import { useDailyTracker } from '@/hooks/useDailyTracker';
import { getProfile } from '@/lib/storage';

const sunnahItems = [
  { key: 'tahajjud', label: 'Tahajjud', rakaat: '2-8 rakaat' },
  { key: 'dhuha', label: 'Dhuha', rakaat: '2-12 rakaat' },
  { key: 'rawatib_subuh', label: 'Rawatib Subuh', rakaat: '2 rakaat' },
  { key: 'rawatib_dzuhur', label: 'Rawatib Dzuhur', rakaat: '4 rakaat' },
  { key: 'rawatib_ashar', label: 'Rawatib Ashar', rakaat: '4 rakaat' },
  { key: 'rawatib_maghrib', label: 'Rawatib Maghrib', rakaat: '2 rakaat' },
  { key: 'rawatib_isya', label: 'Rawatib Isya', rakaat: '2 rakaat' },
];

const SunnahPrayerCard = () => {
  const { tracker, isLoading, error, upsertTracker, isUpdating } =
    useDailyTracker();
  const lang = getProfile().language === 'en' ? 'en' : 'id';
  const t = {
    id: {
      title: 'Sholat Sunnah',
      loading: 'Memuat sholat sunnah...',
      error: 'Gagal memuat tracker sholat sunnah.',
      saving: 'Menyimpan...',
      today: 'hari ini',
    },
    en: {
      title: 'Sunnah Prayer',
      loading: 'Loading sunnah prayer...',
      error: 'Failed to load sunnah prayer tracker.',
      saving: 'Saving...',
      today: 'today',
    },
  }[lang];
  const items = (tracker?.items as Record<string, boolean> | null) ?? {};

  const completed = sunnahItems.reduce(
    (count, item) => count + (items[`sunnah_${item.key}`] ? 1 : 0),
    0,
  );

  const toggle = (key: string) => {
    upsertTracker({
      items: {
        ...items,
        [`sunnah_${key}`]: !items[`sunnah_${key}`],
      },
      notes: (tracker?.notes as Record<string, string> | null) ?? {},
    });
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
          <Moon className="h-5 w-5 text-sky-300" />
          <h3 className="font-serif text-lg text-white">{t.title}</h3>
        </div>
        <span className="text-xs text-slate-400">
          {isUpdating
            ? t.saving
            : `${completed}/${sunnahItems.length} ${t.today}`}
        </span>
      </div>

      <div className="space-y-3">
        {sunnahItems.map((item) => (
          <label
            key={item.key}
            className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-700 bg-slate-950/40 px-3 py-3 transition-colors hover:bg-slate-900/60"
          >
            <span className="text-sm font-medium text-slate-200">
              {item.label}
            </span>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400">{item.rakaat}</span>
              <input
                type="checkbox"
                checked={Boolean(items[`sunnah_${item.key}`])}
                onChange={() => toggle(item.key)}
                className="h-5 w-5 accent-emerald-500"
              />
            </div>
          </label>
        ))}
      </div>
    </section>
  );
};

export default SunnahPrayerCard;
