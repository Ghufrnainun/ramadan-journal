import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OnboardingLayout from './onboarding/OnboardingLayout';
import WelcomeStep from './onboarding/steps/WelcomeStep';
import LocationStep from './onboarding/steps/LocationStep';
import CalendarStep from './onboarding/steps/CalendarStep';
import FocusStep from './onboarding/steps/FocusStep';
import RemindersStep from './onboarding/steps/RemindersStep';
import { getProfile, UserProfile } from '@/lib/storage';
import { saveProfileAndSync } from '@/lib/profile-sync';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

const TOTAL_STEPS = 5;

const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<UserProfile | null>(null);
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
    const finalProfile = {
      ...profile,
      reminders,
      onboardingCompleted: true,
    };
    
    // Await sync dan verify sebelum redirect
    const success = await saveProfileAndSync(finalProfile, user?.id);
    if (success) {
      navigate('/dashboard');
    } else {
      toast({
        title: lang === 'id' ? 'Gagal menyimpan onboarding' : 'Failed to save onboarding',
        description: lang === 'id' ? 'Coba klik Selesai sekali lagi.' : 'Please tap Done once again.',
        variant: 'destructive',
      });
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
        />
      )}
    </OnboardingLayout>
  );
};

export default OnboardingPage;
