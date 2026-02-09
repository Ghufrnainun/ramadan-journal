import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/runtime-client';
import { getProfile } from '@/lib/storage';
import { Loader2, Moon } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const LoadingScreen = () => (
  <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center">
    <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
      <Moon className="w-8 h-8 text-amber-400" />
    </div>
    <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
  </div>
);

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading: authLoading } = useAuth();
  const location = useLocation();
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState<
    boolean | null
  >(null);

  useEffect(() => {
    const checkOnboarding = async () => {
      if (!user) {
        setIsCheckingOnboarding(false);
        return;
      }

      // Check local storage first - this is always up-to-date after onboarding completion
      const localOnboardingCompleted = getProfile().onboardingCompleted;

      // If local storage says onboarding is completed, trust it immediately
      // This prevents the loop where DB query returns stale data
      if (localOnboardingCompleted) {
        setOnboardingCompleted(true);
        setIsCheckingOnboarding(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error checking onboarding:', error);
          // Fallback: local says false, so keep it false
          setOnboardingCompleted(false);
        } else {
          // Local is false, rely on DB
          setOnboardingCompleted(Boolean(data?.onboarding_completed));
        }
      } catch (err) {
        console.error('Error checking onboarding:', err);
        setOnboardingCompleted(false);
      } finally {
        setIsCheckingOnboarding(false);
      }
    };

    if (user) {
      checkOnboarding();
    } else {
      setIsCheckingOnboarding(false);
    }
  }, [user, location.key]);

  // Still loading auth
  if (authLoading) {
    return <LoadingScreen />;
  }

  // Not authenticated
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Still checking onboarding status
  if (isCheckingOnboarding) {
    return <LoadingScreen />;
  }

  // On onboarding page - always allow
  if (location.pathname === '/onboarding') {
    return <>{children}</>;
  }

  // Not on onboarding page but onboarding not completed - redirect to onboarding
  if (!onboardingCompleted) {
    return <Navigate to="/onboarding" replace />;
  }

  // All checks passed
  return <>{children}</>;
};

export default ProtectedRoute;
