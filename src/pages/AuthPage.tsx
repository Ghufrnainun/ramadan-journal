import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Moon, Loader2, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/runtime-client';
import { lovable } from '@/integrations/lovable';
import { toast } from '@/hooks/use-toast';
import MobileContainer from '@/components/layout/MobileContainer';

const content = {
  id: {
    title: 'Masuk ke MyRamadhanku',
    subtitle: 'Simpan progress ibadahmu dan akses dari mana saja',
    benefits: [
      'Sync progress di semua perangkat',
      'Data tersimpan aman di cloud',
      'Tidak perlu setup ulang',
    ],
  },
  en: {
    title: 'Sign in to MyRamadhanku',
    subtitle: 'Save your worship progress and access from anywhere',
    benefits: [
      'Sync progress across all devices',
      'Data safely stored in cloud',
      'No need to setup again',
    ],
  },
};

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [lang] = useState<'id' | 'en'>('id');
  const t = content[lang];

  useEffect(() => {
    // Check if already logged in
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        // Check if onboarding is completed
        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (profile?.onboarding_completed) {
          navigate('/dashboard');
        } else {
          navigate('/onboarding');
        }
      }
    };
    checkAuth();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        navigate('/onboarding');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth('google', {
        redirect_uri: `${window.location.origin}/auth`,
      });

      if (result.error) {
        toast({
          title: lang === 'id' ? 'Gagal masuk' : 'Sign in failed',
          description: result.error.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Google sign in error:', error);
      toast({
        title: lang === 'id' ? 'Terjadi kesalahan' : 'An error occurred',
        description: lang === 'id' ? 'Silakan coba lagi' : 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MobileContainer className="flex flex-col items-center justify-center px-6 text-slate-200">
      {/* Back Button */}
      <motion.button
        onClick={() => navigate('/')}
        className="absolute top-4 left-4 p-2 rounded-lg hover:bg-slate-800/50 transition-colors"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <ArrowLeft className="w-5 h-5 text-slate-400" />
      </motion.button>

      {/* Logo */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
          <Moon className="w-10 h-10 text-amber-400" />
        </div>
        <h1 className="font-serif text-2xl text-white text-center">
          {t.title}
        </h1>
        <p className="text-slate-400 text-sm text-center mt-2 max-w-xs">
          {t.subtitle}
        </p>
      </motion.div>

      {/* Benefits List */}
      <motion.div
        className="w-full max-w-sm mb-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="space-y-3">
          {t.benefits.map((benefit, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-4 py-3 bg-slate-900/50 border border-slate-800 rounded-xl"
            >
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                <span className="text-emerald-400 text-xs">✓</span>
              </div>
              <span className="text-sm text-slate-300">{benefit}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Auth Button */}
      <motion.div
        className="w-full max-w-sm space-y-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {/* Google Sign In */}
        <button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full py-4 px-6 rounded-xl font-medium bg-white text-slate-900 hover:bg-slate-100 transition-colors flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Sign in with Google</span>
            </>
          )}
        </button>

        {/* Demo Link */}
        <p className="text-center text-slate-500 text-sm">
          {lang === 'id' ? 'Ingin coba dulu?' : 'Want to try first?'}{' '}
          <button
            onClick={() => navigate('/demo')}
            className="text-amber-400 hover:text-amber-300 transition-colors underline underline-offset-2"
          >
            {lang === 'id' ? 'Lihat Demo' : 'View Demo'}
          </button>
        </p>
      </motion.div>
    </MobileContainer>
  );
};

export default AuthPage;
