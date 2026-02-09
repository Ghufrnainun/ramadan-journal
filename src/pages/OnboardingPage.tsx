import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OnboardingLayout from './onboarding/OnboardingLayout';
import WelcomeStep from './onboarding/steps/WelcomeStep';
import LocationStep from './onboarding/steps/LocationStep';
import CalendarStep from './onboarding/steps/CalendarStep';
import FocusStep from './onboarding/steps/FocusStep';
import RemindersStep from './onboarding/steps/RemindersStep';
import { getProfile, saveProfile, UserProfile } from '@/lib/storage';
import { saveProfileAndSync } from '@/lib/profile-sync';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

const TOTAL_STEPS = 5;

const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const stored = getProfile();
    setProfile(stored);
  }, []);

  const lang = profile?.language || 'id';

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile(prev => prev ? { ...prev, ...updates } : null);
  };

  const handleComplete = async (reminders: UserProfile['reminders']) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const SYNC_TIMEOUT_MS = 4000;

    try {
      const baseProfile = profile ?? getProfile();
      const finalProfile: UserProfile = {
        ...baseProfile,
        reminders,
        onboardingCompleted: true,
      };

      // Save locally first so user can proceed even if network fails
      saveProfile(finalProfile);

      // Try to sync to server, but don't let a hanging request block navigation
      const success = await Promise.race([
        saveProfileAndSync(finalProfile, user?.id),
        new Promise<boolean>((resolve) => setTimeout(() => resolve(false), SYNC_TIMEOUT_MS)),
      ]);

      if (!success) {
        toast({
          title: lang === 'id' ? 'Data tersimpan lokal' : 'Data saved locally',
          description:
            lang === 'id'
              ? 'Sync memakan waktu lama. Kamu tetap bisa lanjut—akan sync saat koneksi kembali.'
              : 'Sync is taking too long. You can continue—will sync when connection returns.',
        });
      }

      navigate('/dashboard', { replace: true });
    } catch (error) {
      console.error('Onboarding completion error:', error);
      // Force local completion flag so route guards won't bounce back to onboarding
      saveProfile({ onboardingCompleted: true, reminders });
      navigate('/dashboard', { replace: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!profile) return null;

  return (
    <OnboardingLayout step={step} totalSteps={TOTAL_STEPS}>
      {step === 0 && (
        <WelcomeStep
          lang={lang}
          onNext={() => setStep(1)}
        />
      )}

      {step === 1 && (
        <LocationStep
          lang={lang}
          initialCity={profile.location}
          onNext={(location) => {
            updateProfile({ location });
            void saveProfileAndSync({ location }, user?.id);
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
            void saveProfileAndSync({ ramadanStartDate: date }, user?.id);
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
            void saveProfileAndSync({ focusModules: modules }, user?.id);
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
