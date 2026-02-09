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
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);

  useEffect(() => {
    const checkOnboarding = async () => {
      if (!user) {
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
          // Fallback ke local profile kalau query gagal, supaya user tidak terkunci di onboarding.
          setOnboardingCompleted(getProfile().onboardingCompleted);
        } else {
          setOnboardingCompleted(data?.onboarding_completed ?? getProfile().onboardingCompleted);
        }
      } catch (err) {
        console.error('Error checking onboarding:', err);
        setOnboardingCompleted(getProfile().onboardingCompleted);
      } finally {
        setIsCheckingOnboarding(false);
      }
    };

    if (user) {
      checkOnboarding();
    } else {
      setIsCheckingOnboarding(false);
    }
  }, [user]);

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
