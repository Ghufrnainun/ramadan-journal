import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/runtime-client';
import { debugAuthSimple } from '@/lib/debug-auth';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    // Set up auth state listener FIRST
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;

      debugAuthSimple(`Auth event: ${event}`, { userId: session?.user?.id });
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);

      // NOTE: We deliberately do NOT call syncProfileOnLogin here.
      // Profile resolution is handled by AppGate to avoid race conditions.
    });

    // THEN check for existing session
    void supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (!isMounted) return;
        debugAuthSimple('Initial session check', { userId: session?.user?.id });
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Auth: failed to get initial session', error);
        if (!isMounted) return;
        setSession(null);
        setUser(null);
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    debugAuthSimple('Signing out');
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
