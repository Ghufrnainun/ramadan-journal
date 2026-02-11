import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OnboardingLayout from './onboarding/OnboardingLayout';
import WelcomeStep from './onboarding/steps/WelcomeStep';
import LocationStep from './onboarding/steps/LocationStep';
import CalendarStep from './onboarding/steps/CalendarStep';
import FocusStep from './onboarding/steps/FocusStep';
import RemindersStep from './onboarding/steps/RemindersStep';
import { getProfileStore } from '@/lib/profile-store';
import type { UserProfile } from '@/lib/profile-store';
import { getProfile } from '@/lib/storage';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { debugAuthSimple } from '@/lib/debug-auth';

const TOTAL_STEPS = 5;

const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // AppGate already handles redirect for initialized users.
    // Just load the current profile for the form.
    const stored = getProfile();
    setProfile(stored);
  }, []);

  const lang = profile?.language || 'id';

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile((prev) => (prev ? { ...prev, ...updates } : null));
  };

  const handleStepSave = async (updates: Partial<UserProfile>) => {
    // Save intermediate step data via store
    const store = getProfileStore(user?.id);
    await store.upsertProfile(updates);
  };

  const handleComplete = async (reminders: UserProfile['reminders']) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      debugAuthSimple('OnboardingPage: completing setup');

      const store = getProfileStore(user?.id);
      const baseProfile = profile ?? getProfile();

      // 1. Save all profile data
      await store.upsertProfile({
        ...baseProfile,
        reminders,
      });

      // 2. Atomically mark setup as complete
      await store.markSetupComplete();

      debugAuthSimple(
        'OnboardingPage: setup complete, navigating to dashboard',
      );

      // 3. Navigate AFTER writes finish
      navigate('/dashboard', { replace: true });
    } catch (error) {
      console.error('Onboarding completion error:', error);

      // Emergency fallback: force local completion so user doesn't loop
      const store = getProfileStore(user?.id);
      try {
        await store.markSetupComplete();
      } catch {
        // Last resort: direct localStorage
        const { saveProfile: saveLegacy } = await import('@/lib/storage');
        saveLegacy({
          setup_completed_at: new Date().toISOString(),
          onboardingCompleted: true,
          reminders,
        });
      }

      toast({
        title: lang === 'id' ? 'Data tersimpan lokal' : 'Data saved locally',
        description:
          lang === 'id'
            ? 'Terjadi kesalahan saat menyimpan. Data kamu tetap aman di perangkat.'
            : 'An error occurred while saving. Your data is safe on this device.',
      });

      navigate('/dashboard', { replace: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!profile) return null;

  return (
    <OnboardingLayout step={step} totalSteps={TOTAL_STEPS}>
      {step === 0 && <WelcomeStep lang={lang} onNext={() => setStep(1)} />}

      {step === 1 && (
        <LocationStep
          lang={lang}
          initialCity={profile.location}
          onNext={(location) => {
            updateProfile({ location });
            void handleStepSave({ location });
            setStep(2);
          }}
          onBack={() => setStep(0)}
        />
      )}

      {step === 2 && (
        <CalendarStep
          lang={lang}
          initialDate={profile.ramadanStartDate}
          onNext={(date) => {
            updateProfile({ ramadanStartDate: date });
            void handleStepSave({ ramadanStartDate: date });
            setStep(3);
          }}
          onBack={() => setStep(1)}
        />
      )}

      {step === 3 && (
        <FocusStep
          lang={lang}
          initialModules={profile.focusModules}
          onNext={(modules) => {
            updateProfile({ focusModules: modules });
            void handleStepSave({ focusModules: modules });
            setStep(4);
          }}
          onBack={() => setStep(2)}
        />
      )}

      {step === 4 && (
        <RemindersStep
          lang={lang}
          initialReminders={profile.reminders}
          onComplete={handleComplete}
          onBack={() => setStep(3)}
          isSubmitting={isSubmitting}
        />
      )}
    </OnboardingLayout>
  );
};

export default OnboardingPage;
