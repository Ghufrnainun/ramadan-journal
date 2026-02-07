import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Share2 } from 'lucide-react';
import ResponsiveLayout from '@/components/layout/ResponsiveLayout';
import { getProfile } from '@/lib/storage';
import FastingCalendar from '@/components/tracker/FastingCalendar';
import TarawihCard from '@/components/tracker/TarawihCard';
import SedekahCard from '@/components/tracker/SedekahCard';
import LailatulQadrCard from '@/components/tracker/LailatulQadrCard';
import SunnahPrayerCard from '@/components/tracker/SunnahPrayerCard';
import { generateWeeklySummaryCard, getWeeklySummaryStats, shareImage } from '@/lib/share-card';
import { toast } from '@/hooks/use-toast';

const TrackerPage = () => {
  const navigate = useNavigate();
  const profile = getProfile();
  const [isSharing, setIsSharing] = useState(false);
  const lang = profile.language === 'en' ? 'en' : 'id';
  const t = {
    id: {
      title: 'Tracker Ramadan',
      shareWeekly: 'Bagikan Mingguan',
      back: 'Back',
      share: 'Share weekly summary',
      shareErrorTitle: 'Gagal membuat kartu',
      shareErrorDesc: 'Periksa koneksi lalu coba lagi.',
    },
    en: {
      title: 'Ramadan Tracker',
      shareWeekly: 'Share Weekly',
      back: 'Back',
      share: 'Share weekly summary',
      shareErrorTitle: 'Failed to generate card',
      shareErrorDesc: 'Please check your connection and try again.',
    },
  }[lang];

  useEffect(() => {
    if (!profile.onboardingCompleted) {
      navigate('/onboarding');
    }
  }, [navigate, profile.onboardingCompleted]);

  const handleWeeklyShare = async () => {
    if (isSharing) return;
    setIsSharing(true);
    try {
      const stats = await getWeeklySummaryStats();
      const blob = await generateWeeklySummaryCard(stats, profile.language);
      await shareImage(blob, `ramadan-week-${stats.weekNumber}.png`);
    } catch (error) {
      console.error(error);
      toast({
        title: t.shareErrorTitle,
        description: t.shareErrorDesc,
        variant: 'destructive',
      });
    } finally {
      setIsSharing(false);
    }
  };

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
        <button
          type="button"
          onClick={handleWeeklyShare}
          disabled={isSharing}
          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800/50 disabled:cursor-not-allowed disabled:opacity-60"
          aria-label={t.share}
        >
          {isSharing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Share2 className="h-5 w-5" />}
        </button>
      </header>

      <main className="space-y-6 px-6 py-6 md:px-0 md:py-0">
        <div className="hidden items-center justify-between md:flex">
          <h1 className="font-serif text-3xl text-white">{t.title}</h1>
          <button
            type="button"
            onClick={handleWeeklyShare}
            disabled={isSharing}
            className="inline-flex items-center gap-2 rounded-xl border border-amber-400/40 bg-amber-500/10 px-4 py-2 text-sm text-amber-200 transition-colors hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSharing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4" />}
            {isSharing ? '...' : t.shareWeekly}
          </button>
        </div>

        <FastingCalendar />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <TarawihCard />
          <SedekahCard />
        </div>

        <SunnahPrayerCard />
        <LailatulQadrCard />
      </main>
    </ResponsiveLayout>
  );
};

export default TrackerPage;
