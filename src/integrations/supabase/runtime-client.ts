import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

declare global {
  interface Window {
    __APP_PUBLIC_CONFIG__?: {
      supabaseUrl?: string;
      supabaseAnonKey?: string;
    };
  }
}

const envUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const envKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

const winUrl = typeof window !== 'undefined' ? window.__APP_PUBLIC_CONFIG__?.supabaseUrl : undefined;
const winKey = typeof window !== 'undefined' ? window.__APP_PUBLIC_CONFIG__?.supabaseAnonKey : undefined;

const SUPABASE_URL = envUrl || winUrl;
const SUPABASE_PUBLISHABLE_KEY = envKey || winKey;

if (!SUPABASE_URL) {
  throw new Error('supabaseUrl is required (missing VITE_SUPABASE_URL / runtime config)');
}
if (!SUPABASE_PUBLISHABLE_KEY) {
  throw new Error('supabaseAnonKey is required (missing VITE_SUPABASE_PUBLISHABLE_KEY / runtime config)');
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});
