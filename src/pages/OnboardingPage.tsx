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

const TOTAL_STEPS = 5;

const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const stored = getProfile();
    setProfile(stored);
    
    // If already completed onboarding, redirect to dashboard
    if (stored.onboardingCompleted) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const lang = profile?.language || 'id';

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile(prev => prev ? { ...prev, ...updates } : null);
  };

  const handleComplete = (reminders: UserProfile['reminders']) => {
    const finalProfile = {
      ...profile,
      reminders,
      onboardingCompleted: true,
    };
    void saveProfileAndSync(finalProfile, user?.id);
    navigate('/dashboard');
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
