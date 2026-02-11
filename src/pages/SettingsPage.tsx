import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Bell,
  Globe,
  MapPin,
  Moon,
  RotateCcw,
  ShieldCheck,
  User,
} from 'lucide-react';
import { getProfile } from '@/lib/storage';
import type { UserProfile } from '@/lib/profile-store';
import { getProfileStore } from '@/lib/profile-store';
import { useAuth } from '@/hooks/useAuth';
import { useI18n } from '@/hooks/useI18n';
import { getProvinces, getCitiesByProvince } from '@/data/indonesia-cities';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import ResponsiveLayout from '@/components/layout/ResponsiveLayout';

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile>(getProfile());
  const dict = useI18n(profile.language);

  const provinces = useMemo(() => getProvinces(), []);
  const cities = useMemo(() => {
    if (!profile.location?.province) return [];
    return getCitiesByProvince(profile.location.province);
  }, [profile.location?.province]);

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...updates }));
  };

  const saveChanges = async () => {
    const store = getProfileStore(user?.id);
    await store.upsertProfile(profile);
    navigate('/dashboard');
  };

  const handleResetOnboarding = async () => {
    const confirmed = window.confirm(
      profile.language === 'id'
        ? 'Reset onboarding? Kamu akan diarahkan ke halaman setup ulang.'
        : 'Reset onboarding? You will be redirected to setup again.',
    );
    if (!confirmed) return;
    const store = getProfileStore(user?.id);
    await store.clearSetup();
    navigate('/onboarding', { replace: true });
  };

  const requestNotifications = async () => {
    if (!('Notification' in window)) return;
    await Notification.requestPermission();
  };

  const handleReset = () => {
    const confirmed = window.confirm('Reset semua data lokal?');
    if (!confirmed) return;
    localStorage.clear();
    window.location.href = '/';
  };

  return (
    <ResponsiveLayout className="pb-0">
      <header className="md:hidden flex items-center justify-between px-6 py-4 border-b border-slate-800/50 sticky top-0 bg-[#020617]/80 backdrop-blur z-10">
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
            {dict.settings.title}
          </span>
          <p className="text-xs text-slate-500">{dict.settings.subtitle}</p>
        </div>
        <div className="w-9" />
      </header>

      {/* Desktop Header */}
      <div className="hidden md:flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl text-white">
            {dict.settings.title}
          </h1>
          <p className="text-slate-400 mt-1">{dict.settings.subtitle}</p>
        </div>
      </div>

      <main className="px-6 py-6 space-y-6 pb-32 md:p-0 md:pb-12">
        <section className="rounded-3xl border border-slate-800/60 bg-slate-900/40 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <User className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-white font-medium">{dict.settings.profile}</p>
              <p className="text-xs text-slate-500">
                {user?.email || dict.settings.guest}
              </p>
            </div>
          </div>
          <input
            type="text"
            value={profile.displayName || ''}
            onChange={(e) => updateProfile({ displayName: e.target.value })}
            placeholder={dict.settings.displayNamePlaceholder}
            className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
          />
        </section>

        <section className="rounded-3xl border border-slate-800/60 bg-slate-900/40 p-6 space-y-3">
          <p className="text-white font-medium">{dict.settings.shortcuts}</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate('/bookmarks')}
              className="py-3 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800/70 transition-colors text-sm"
            >
              {dict.settings.bookmarks}
            </button>
            <button
              onClick={() => navigate('/reflection')}
              className="py-3 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800/70 transition-colors text-sm"
            >
              {dict.settings.reflection}
            </button>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-800/60 bg-slate-900/40 p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Globe className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-white font-medium">{dict.settings.language}</p>
              <p className="text-xs text-slate-500">ID / EN</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => updateProfile({ language: 'id' })}
              className={`flex-1 py-3 rounded-xl text-sm font-medium border transition-colors ${
                profile.language === 'id'
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                  : 'bg-slate-800/50 border-slate-700 text-slate-400'
              }`}
            >
              Bahasa Indonesia
            </button>
            <button
              onClick={() => updateProfile({ language: 'en' })}
              className={`flex-1 py-3 rounded-xl text-sm font-medium border transition-colors ${
                profile.language === 'en'
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                  : 'bg-slate-800/50 border-slate-700 text-slate-400'
              }`}
            >
              English
            </button>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-800/60 bg-slate-900/40 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-white font-medium">{dict.settings.location}</p>
              <p className="text-xs text-slate-500">
                {profile.location
                  ? `${profile.location.city}, ${profile.location.province}`
                  : dict.settings.locationUnset}
              </p>
            </div>
          </div>
          <Select
            value={profile.location?.province || ''}
            onValueChange={(value) =>
              updateProfile({
                location: value ? { city: '', province: value } : null,
              })
            }
          >
            <SelectTrigger className="w-full h-12 bg-slate-800/60 border-slate-700 text-slate-200">
              <SelectValue placeholder={dict.settings.selectProvince} />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700 text-white max-h-[300px]">
              {provinces.map((province) => (
                <SelectItem key={province} value={province}>
                  {province}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={profile.location?.city || ''}
            onValueChange={(value) =>
              updateProfile({
                location: profile.location?.province
                  ? { city: value, province: profile.location.province }
                  : null,
              })
            }
            disabled={!profile.location?.province}
          >
            <SelectTrigger className="w-full h-12 bg-slate-800/60 border-slate-700 text-slate-200">
              <SelectValue placeholder={dict.settings.selectCity} />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700 text-white max-h-[300px]">
              {cities.map((city) => (
                <SelectItem key={city.name} value={city.name}>
                  {city.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </section>

        <section className="rounded-3xl border border-slate-800/60 bg-slate-900/40 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
              <Moon className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <p className="text-white font-medium">{dict.settings.ramadan}</p>
              <p className="text-xs text-slate-500">
                {dict.settings.ramadanNote}
              </p>
            </div>
          </div>
          <input
            type="date"
            value={profile.ramadanStartDate || ''}
            onChange={(e) =>
              updateProfile({ ramadanStartDate: e.target.value || null })
            }
            className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
          />
          <div className="pt-3 border-t border-slate-800/70">
            <p className="text-white font-medium text-sm">
              {dict.settings.ramadanEnd}
            </p>
            <p className="text-xs text-slate-500 mb-3">
              {dict.settings.ramadanEndNote}
            </p>
            <input
              type="date"
              value={profile.ramadanEndDate || ''}
              onChange={(e) =>
                updateProfile({ ramadanEndDate: e.target.value || null })
              }
              className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
            />
          </div>
        </section>

        <section className="rounded-3xl border border-slate-800/60 bg-slate-900/40 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <Bell className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-white font-medium">
                {dict.settings.reminders}
              </p>
              <p className="text-xs text-slate-500">
                {dict.settings.remindersNote}
              </p>
            </div>
          </div>

          {(['sahur', 'iftar', 'prayer', 'reflection'] as const).map((key) => (
            <label
              key={key}
              className="flex items-center justify-between gap-4"
            >
              <span className="text-sm text-slate-300 capitalize">{key}</span>
              <Switch
                checked={profile.reminders[key]}
                onCheckedChange={(checked) =>
                  updateProfile({
                    reminders: { ...profile.reminders, [key]: checked },
                  })
                }
              />
            </label>
          ))}

          <label className="flex items-center justify-between gap-4 pt-2 border-t border-slate-800">
            <span className="text-sm text-slate-300">
              {dict.settings.silentMode}
            </span>
            <Switch
              checked={profile.silentMode}
              onCheckedChange={(checked) =>
                updateProfile({ silentMode: checked })
              }
            />
          </label>
          <label className="flex items-center justify-between gap-4">
            <span className="text-sm text-slate-300">
              {dict.settings.hideStreak}
            </span>
            <Switch
              checked={!!profile.hideStreak}
              onCheckedChange={(checked) =>
                updateProfile({ hideStreak: checked })
              }
            />
          </label>
        </section>

        <section className="rounded-3xl border border-slate-800/60 bg-slate-900/40 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-white font-medium">
                {dict.settings.notifications}
              </p>
              <p className="text-xs text-slate-500">
                {dict.settings.notificationNote}
              </p>
            </div>
          </div>
          <button
            onClick={requestNotifications}
            className="w-full py-3 rounded-xl border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10 transition-colors text-sm"
          >
            {dict.settings.enableNotifications}
          </button>
        </section>

        <section className="rounded-3xl border border-slate-800/60 bg-slate-900/40 p-6 space-y-3">
          <p className="text-white font-medium">{dict.settings.data}</p>
          <button
            onClick={handleResetOnboarding}
            className="w-full py-3 rounded-xl border border-amber-500/30 text-amber-300 hover:bg-amber-500/10 transition-colors text-sm flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            {profile.language === 'id'
              ? 'Reset Onboarding'
              : 'Reset Onboarding'}
          </button>
          <button
            onClick={handleReset}
            className="w-full py-3 rounded-xl border border-rose-500/30 text-rose-300 hover:bg-rose-500/10 transition-colors text-sm"
          >
            {dict.settings.reset}
          </button>
        </section>

        {user && (
          <button
            onClick={signOut}
            className="w-full py-4 rounded-2xl bg-slate-800/80 text-slate-200 hover:bg-slate-700/80 transition-colors"
          >
            {dict.settings.logout}
          </button>
        )}
      </main>

      {/* Fixed bottom button constrained to max width - Mobile Only */}
      <div className="md:hidden fixed bottom-0 w-full max-w-[480px] left-1/2 -translate-x-1/2 p-6 pb-safe bg-[#020617]/90 z-20">
        <button
          onClick={saveChanges}
          className="w-full py-4 rounded-2xl bg-amber-500 text-slate-900 font-semibold text-base shadow-md hover:bg-amber-400 transition-colors"
        >
          {dict.settings.saveChanges}
        </button>
      </div>

      {/* Desktop Save Button */}
      <div className="hidden md:flex justify-end mt-8 border-t border-slate-800 pt-6">
        <button
          onClick={saveChanges}
          className="px-8 py-3 rounded-xl bg-amber-500 text-slate-900 font-semibold hover:bg-amber-400 transition-colors"
        >
          {dict.settings.saveChanges}
        </button>
      </div>
    </ResponsiveLayout>
  );
};

export default SettingsPage;
