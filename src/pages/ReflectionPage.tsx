import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Share2, Bookmark } from 'lucide-react';
import { getProfile } from '@/lib/storage';
import { useI18n } from '@/hooks/useI18n';
import { getPromptForDate } from '@/data/reflection-prompts';
import { getAllReflections, getReflectionByDate, upsertReflection } from '@/lib/reflection-storage';
import { markReflectionDay, markActiveDay, getStreakSummary } from '@/lib/streak';
import { generateShareCard, shareImage } from '@/lib/share-card';
import { isBookmarked, toggleBookmark } from '@/lib/bookmarks';
import { toast } from '@/hooks/use-toast';

const ReflectionPage: React.FC = () => {
  const navigate = useNavigate();
  const profile = getProfile();
  const dict = useI18n(profile.language);
  const prompt = useMemo(() => getPromptForDate(new Date()), []);
  const today = new Date().toISOString().split('T')[0];
  const existing = getReflectionByDate(today);

  const [content, setContent] = useState(existing?.content || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(isBookmarked('reflection', `reflection-${today}`));

  useEffect(() => {
    if (!profile.onboardingCompleted) {
      navigate('/onboarding');
    }
  }, [navigate, profile.onboardingCompleted]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!content.trim()) return;
      setIsSaving(true);
      upsertReflection({
        date: today,
        promptId: prompt.id,
        promptText: prompt.text,
        content,
        completed: false,
      });
      setIsSaving(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [content, prompt, today]);

  const handleComplete = () => {
    const entry = upsertReflection({
      date: today,
      promptId: prompt.id,
      promptText: prompt.text,
      content,
      completed: true,
    });
    markReflectionDay(entry.date);
    markActiveDay(entry.date);
    toast({ title: dict.reflection.saved });
  };

  const handleShare = async () => {
    const body = content.trim() || prompt.text[profile.language];
    try {
      const blob = await generateShareCard({
        title: profile.language === 'id' ? 'Refleksi Ramadan' : 'Ramadan Reflection',
        subtitle: new Date().toLocaleDateString(profile.language === 'id' ? 'id-ID' : 'en-US', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
        body,
        footer: 'MyRamadhanku',
      });
      await shareImage(blob, `reflection-${today}.png`);
    } catch (e) {
      console.error('Share failed:', e);
    }
  };

  const streak = getStreakSummary(profile.ramadanStartDate);
  const recent = getAllReflections().slice(0, 4);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 pb-24">
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800/50">
        <button
          onClick={() => navigate('/dashboard')}
          className="p-2 -ml-2 rounded-lg hover:bg-slate-800/50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-400" />
        </button>
        <div className="text-center">
          <span className="font-serif text-lg text-white">{dict.reflection.title}</span>
          <p className="text-xs text-slate-500">{dict.reflection.subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="p-2 rounded-lg hover:bg-slate-800/50 transition-colors"
          >
            <Share2 className="w-5 h-5 text-slate-400" />
          </button>
          <button
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
            <Bookmark className={`w-5 h-5 ${saved ? 'text-amber-400' : 'text-slate-400'}`} />
          </button>
        </div>
      </header>

      <main className="px-6 py-6 space-y-6">
        <section className="rounded-3xl border border-slate-800/60 bg-gradient-to-br from-amber-500/10 via-slate-900/60 to-slate-900/40 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <p className="text-white font-medium">{dict.reflection.prompt}</p>
              <p className="text-xs text-slate-500">{prompt.text[profile.language]}</p>
            </div>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={dict.reflection.placeholder}
            className="w-full min-h-[180px] bg-slate-900/60 border border-slate-800 rounded-2xl p-4 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
          />
          <div className="flex items-center justify-between mt-4 text-xs text-slate-500">
            <span>{isSaving ? dict.common.loading : dict.reflection.autosave}</span>
            <span>{content.length} {dict.common.characters}</span>
          </div>
        </section>

        {!profile.hideStreak && (
          <section className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-4">
              <p className="text-xs text-slate-500">{dict.reflection.streak}</p>
              <p className="text-2xl text-amber-300 font-semibold mt-2">{streak.currentReflectionStreak} {dict.common.days}</p>
              <p className="text-xs text-slate-500 mt-2">
                {dict.reflection.totalReflection}: {streak.reflectionDays}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-4">
              <p className="text-xs text-slate-500">{dict.reflection.activeLabel}</p>
              <p className="text-2xl text-emerald-300 font-semibold mt-2">{streak.currentActiveStreak} {dict.common.days}</p>
              <p className="text-xs text-slate-500 mt-2">
                {dict.reflection.totalActive}: {streak.activeDays}
              </p>
            </div>
          </section>
        )}

        <section className="rounded-3xl border border-slate-800/60 bg-slate-900/40 p-6">
          <p className="text-white font-medium mb-4">{dict.reflection.recent}</p>
          <div className="space-y-3">
            {recent.length === 0 && (
              <p className="text-sm text-slate-500">{dict.reflection.empty}</p>
            )}
            {recent.map(entry => (
              <div key={entry.date} className="p-4 rounded-2xl bg-slate-800/50 border border-slate-800">
                <p className="text-xs text-amber-400 mb-2">{entry.date}</p>
                <p className="text-sm text-slate-300 line-clamp-2">{entry.content}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#020617] via-[#020617] to-transparent">
        <button
          onClick={handleComplete}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-900 font-semibold text-base"
        >
          {dict.common.done}
        </button>
      </div>
    </div>
  );
};

export default ReflectionPage;
