import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DemoDashboard from '@/components/demo/DemoDashboard';
import DemoDhikr from '@/components/demo/DemoDhikr';
import DemoTracker from '@/components/demo/DemoTracker';
import { supabase } from '@/integrations/supabase/runtime-client';
import { lovable } from '@/integrations/lovable';
import { toast } from '@/hooks/use-toast';

// Helper to detect custom domain (not Lovable-managed)
const isCustomDomain = () => {
  const hostname = window.location.hostname;
  return (
    !hostname.includes('lovable.app') &&
    !hostname.includes('lovableproject.com')
  );
};

const isValidOAuthRedirectUrl = (url: string) => {
  const oauthUrl = new URL(url);
  const isSecure = oauthUrl.protocol === 'https:';
  const isSupabaseAuthorize = oauthUrl.pathname.startsWith('/auth/v1/authorize');
  const isGoogleHost = ['accounts.google.com', 'www.google.com'].includes(oauthUrl.hostname);

  return isSecure && (isSupabaseAuthorize || isGoogleHost);
};

const content = {
  id: {
    title: 'Mode Demo',
    subtitle: 'Coba fitur-fitur MyRamadhan tanpa membuat akun.',
    note: 'Data tidak akan tersimpan.',
    tabs: {
      dashboard: 'Dashboard',
      dhikr: 'Dzikir',
      tracker: 'Tracker',
    },
    cta: {
      title: 'Suka fiturnya?',
      subtitle: 'Daftar gratis untuk menyimpan progressmu',
      button: 'Daftar dengan Google',
    },
  },
  en: {
    title: 'Demo Mode',
    subtitle: 'Try MyRamadhan features without creating an account.',
    note: 'Data will not be saved.',
    tabs: {
      dashboard: 'Dashboard',
      dhikr: 'Dhikr',
      tracker: 'Tracker',
    },
    cta: {
      title: 'Like what you see?',
      subtitle: 'Sign up free to save your progress',
      button: 'Sign up with Google',
    },
  },
};

const DemoPage: React.FC = () => {
  const navigate = useNavigate();
  const [lang] = useState<'id' | 'en'>('id');
  const [isLoading, setIsLoading] = useState(false);
  const t = content[lang];

  const handleSignUp = async () => {
    setIsLoading(true);
    try {
      if (isCustomDomain()) {
        // Bypass Lovable auth-bridge for custom domains
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/auth`,
            skipBrowserRedirect: true,
          },
        });

        if (error) {
          toast({
            title: lang === 'id' ? 'Gagal mendaftar' : 'Sign up failed',
            description: error.message,
            variant: 'destructive',
          });
          return;
        }

        // Validate and redirect to Google OAuth
        if (data?.url) {
          if (isValidOAuthRedirectUrl(data.url)) {
            window.location.href = data.url;
          } else {
            throw new Error('Invalid OAuth redirect URL');
          }
        }
      } else {
        // Use Lovable managed OAuth for Lovable domains
        const result = await lovable.auth.signInWithOAuth('google', {
          redirect_uri: `${window.location.origin}/auth`,
        });

        if (result.error) {
          toast({
            title: lang === 'id' ? 'Gagal mendaftar' : 'Sign up failed',
            description: result.error.message,
            variant: 'destructive',
          });
        }
      }
    } catch (error) {
      console.error('Sign up error:', error);
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
    <div className="min-h-screen bg-[#020617] text-slate-200">
      {/* Header */}
      <header className="sticky top-0 bg-[#020617]/90 backdrop-blur-sm border-b border-slate-800/50 z-20">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="p-2 -ml-2 rounded-lg hover:bg-slate-800/50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </button>
          
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-amber-400 text-sm font-medium">{t.title}</span>
          </div>

          <button
            onClick={() => navigate('/auth')}
            className="text-sm text-amber-400 hover:text-amber-300 transition-colors font-medium"
          >
            Daftar →
          </button>
        </div>
      </header>

      {/* Info Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-amber-500/10 border-b border-amber-500/20 py-3 px-4 text-center"
      >
        <p className="text-sm text-amber-200">
          {t.subtitle} <span className="text-amber-400/70">{t.note}</span>
        </p>
      </motion.div>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 py-6">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="w-full grid grid-cols-3 bg-slate-900/50 border border-slate-800 rounded-xl p-1 mb-6">
            <TabsTrigger 
              value="dashboard"
              className="rounded-lg data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300"
            >
              {t.tabs.dashboard}
            </TabsTrigger>
            <TabsTrigger 
              value="dhikr"
              className="rounded-lg data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300"
            >
              {t.tabs.dhikr}
            </TabsTrigger>
            <TabsTrigger 
              value="tracker"
              className="rounded-lg data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300"
            >
              {t.tabs.tracker}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-0">
            <DemoDashboard lang={lang} />
          </TabsContent>

          <TabsContent value="dhikr" className="mt-0">
            <DemoDhikr lang={lang} />
          </TabsContent>

          <TabsContent value="tracker" className="mt-0">
            <DemoTracker lang={lang} />
          </TabsContent>
        </Tabs>
      </main>

      {/* CTA Footer */}
      <div className="sticky bottom-0 bg-gradient-to-t from-[#020617] via-[#020617] to-transparent pt-8 pb-6 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="max-w-md mx-auto bg-slate-900/80 border border-slate-800 rounded-2xl p-6 text-center backdrop-blur-sm"
        >
          <p className="font-serif text-lg text-white mb-1">{t.cta.title}</p>
          <p className="text-sm text-slate-400 mb-4">{t.cta.subtitle}</p>
          <button
            onClick={handleSignUp}
            disabled={isLoading}
            className="w-full py-3 px-6 rounded-xl font-medium bg-white text-slate-900 hover:bg-slate-100 transition-colors flex items-center justify-center gap-3 disabled:opacity-50"
          >
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
            <span>{t.cta.button}</span>
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default DemoPage;
