import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Share2, Bookmark } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/runtime-client';
import { getProfile } from '@/lib/storage';
import { useI18n } from '@/hooks/useI18n';
import { getPromptForDate } from '@/data/reflection-prompts';
import {
  markReflectionDay,
  markActiveDay,
  getStreakSummary,
} from '@/lib/streak';
import { generateShareCard, shareImage } from '@/lib/share-card';
import { isBookmarked, toggleBookmark } from '@/lib/bookmarks';
import { toast } from '@/hooks/use-toast';
import { getLocalDateKey } from '@/lib/date';
import ResponsiveLayout from '@/components/layout/ResponsiveLayout';
import { useReflections } from '@/hooks/useReflections';

interface RecentReflection {
  id: string;
  date: string;
  content: string | null;
}

const ReflectionPage: React.FC = () => {
  const navigate = useNavigate();
  const profile = getProfile();
  const dict = useI18n(profile.language);
  const prompt = useMemo(() => getPromptForDate(new Date()), []);
  const today = getLocalDateKey();

  const {
    reflections,
    isLoading: reflectionsLoading,
    error: reflectionsError,
    upsertReflection,
    isUpdating,
  } = useReflections(today);
  const todayReflection = reflections?.[0] ?? null;

  const [content, setContent] = useState('');
  const [isHydrated, setIsHydrated] = useState(false);
  const [saved, setSaved] = useState(
    isBookmarked('reflection', `reflection-${today}`),
  );

  // Onboarding guard removed. AppGate handles this at the route level.

  useEffect(() => {
    if (reflectionsLoading || isHydrated) return;
    setContent(todayReflection?.content || '');
    setIsHydrated(true);
  }, [isHydrated, reflectionsLoading, todayReflection]);

  useEffect(() => {
    if (!isHydrated) return;
    if (!content.trim()) return;

    const serverContent = todayReflection?.content || '';
    if (content === serverContent) return;

    const timer = setTimeout(() => {
      upsertReflection({
        prompt_id: prompt.id,
        prompt_text: prompt.text,
        content,
        completed: todayReflection?.completed ?? false,
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [
    content,
    isHydrated,
    prompt.id,
    prompt.text,
    todayReflection?.completed,
    todayReflection?.content,
    upsertReflection,
  ]);

  const handleComplete = () => {
    if (!content.trim()) return;

    upsertReflection({
      prompt_id: prompt.id,
      prompt_text: prompt.text,
      content,
      completed: true,
    });
    markReflectionDay(today);
    markActiveDay(today);
    toast({ title: dict.reflection.saved });
  };

  const handleShare = async () => {
    const body = content.trim() || prompt.text[profile.language];
    try {
      const blob = await generateShareCard({
        title:
          profile.language === 'id' ? 'Refleksi Ramadan' : 'Ramadan Reflection',
        subtitle: new Date().toLocaleDateString(
          profile.language === 'id' ? 'id-ID' : 'en-US',
          {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          },
        ),
        body,
        footer: 'MyRamadhanku',
      });
      await shareImage(blob, `reflection-${today}.png`);
    } catch (e) {
      console.error('Share failed:', e);
    }
  };

  const streak = getStreakSummary(profile.ramadanStartDate);
  const {
    data: recent = [],
    error: recentError,
  } = useQuery<RecentReflection[]>({
    queryKey: ['reflectionsRecent'],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return [];

      try {
        const { data, error } = await supabase
          .from('reflections')
          .select('id, date, content')
          .eq('user_id', user.id)
          .order('date', { ascending: false })
          .limit(4);

        if (error) throw error;
        return (data as RecentReflection[]) ?? [];
      } catch {
        return [];
      }
    },
  });

  const reflectionErrorMessage =
    profile.language === 'id'
      ? 'Gagal memuat refleksi. Coba lagi nanti.'
      : 'Failed to load reflections. Please try again later.';

  return (
    <ResponsiveLayout className="pb-24">
      <header className="flex md:hidden items-center justify-between px-6 py-4 border-b border-slate-800/50">
        <button
          type="button"
          aria-label="Back to dashboard"
          onClick={() => navigate('/dashboard')}
          className="p-2 -ml-2 rounded-lg hover:bg-slate-800/50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-400" />
        </button>
        <div className="text-center">
          <span className="font-serif text-lg text-white">
            {dict.reflection.title}
          </span>
          <p className="text-xs text-slate-500">{dict.reflection.subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Share reflection"
            onClick={handleShare}
            className="p-2 rounded-lg hover:bg-slate-800/50 transition-colors"
          >
            <Share2 className="w-5 h-5 text-slate-400" />
          </button>
          <button
            type="button"
            aria-label="Bookmark reflection"
            onClick={() => {
              const next = toggleBookmark({
                id: `reflection-${today}`,
                type: 'reflection',
                title: prompt.text[profile.language],
                subtitle: today,
                content: content.trim(),
                createdAt: new Date().toISOString(),
              });
              setSaved(next);
            }}
            className="p-2 rounded-lg hover:bg-slate-800/50 transition-colors"
          >
            <Bookmark
              className={`w-5 h-5 ${saved ? 'text-amber-400' : 'text-slate-400'}`}
            />
          </button>
        </div>
      </header>

      <div className="hidden md:flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl text-white">
            {dict.reflection.title}
          </h1>
          <p className="text-slate-400 mt-1">{dict.reflection.subtitle}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors text-sm"
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>
        </div>
      </div>

      <main className="px-6 py-6 space-y-6 md:p-0">
        <section className="rounded-3xl border border-slate-800/60 bg-slate-900/60 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <p className="text-white font-medium">{dict.reflection.prompt}</p>
              <p className="text-xs text-slate-500">
                {prompt.text[profile.language]}
              </p>
            </div>
          </div>
          {reflectionsError && (
            <p className="mb-3 text-xs text-rose-300">{reflectionErrorMessage}</p>
          )}
          <label htmlFor="reflection-content" className="sr-only">
            {dict.reflection.prompt}
          </label>
          <textarea
            id="reflection-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={dict.reflection.placeholder}
            className="w-full min-h-[180px] bg-slate-900/60 border border-slate-800 rounded-2xl p-4 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
          />
          <div className="flex items-center justify-between mt-4 text-xs text-slate-500">
            <span>
              {reflectionsLoading || isUpdating
                ? dict.common.loading
                : dict.reflection.autosave}
            </span>
            <span>
              {content.length} {dict.common.characters}
            </span>
          </div>

          <div className="hidden md:flex justify-end mt-4">
            <button
              onClick={handleComplete}
              disabled={!content.trim()}
              className="px-6 py-2 rounded-xl bg-amber-500 text-slate-900 font-medium hover:bg-amber-400 transition-colors disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
            >
              {dict.common.done}
            </button>
          </div>
        </section>

        {!profile.hideStreak && (
          <section className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-4">
              <p className="text-xs text-slate-500">{dict.reflection.streak}</p>
              <p className="text-2xl text-amber-300 font-semibold mt-2">
                {streak.currentReflectionStreak} {dict.common.days}
              </p>
              <p className="text-xs text-slate-500 mt-2">
                {dict.reflection.totalReflection}: {streak.reflectionDays}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-4">
              <p className="text-xs text-slate-500">
                {dict.reflection.activeLabel}
              </p>
              <p className="text-2xl text-emerald-300 font-semibold mt-2">
                {streak.currentActiveStreak} {dict.common.days}
              </p>
              <p className="text-xs text-slate-500 mt-2">
                {dict.reflection.totalActive}: {streak.activeDays}
              </p>
            </div>
          </section>
        )}

        <section className="rounded-3xl border border-slate-800/60 bg-slate-900/40 p-6">
          <p className="text-white font-medium mb-4">
            {dict.reflection.recent}
          </p>
          <div className="space-y-3">
            {recentError && (
              <p className="text-sm text-rose-300">{reflectionErrorMessage}</p>
            )}
            {!recentError && recent.length === 0 && (
              <p className="text-sm text-slate-500">{dict.reflection.empty}</p>
            )}
            {recent.map((entry) => (
              <div
                key={entry.id}
                className="p-4 rounded-2xl bg-slate-800/50 border border-slate-800"
              >
                <p className="text-xs text-amber-400 mb-2">{entry.date}</p>
                <p className="text-sm text-slate-300 line-clamp-2">
                  {entry.content || '-'}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-6 pb-safe bg-[#020617]/90 md:hidden">
        <button
          onClick={handleComplete}
          disabled={!content.trim()}
          className="w-full py-4 rounded-2xl bg-amber-500 text-slate-900 font-semibold text-base hover:bg-amber-400 transition-colors disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
        >
          {dict.common.done}
        </button>
      </div>
    </ResponsiveLayout>
  );
};

export default ReflectionPage;
