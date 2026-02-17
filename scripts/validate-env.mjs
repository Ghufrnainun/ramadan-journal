import fs from 'node:fs';
import path from 'node:path';

const requiredPair =
  process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const configPath = path.resolve('public', 'app-public-config.json');
let hasPublicConfig = false;

if (fs.existsSync(configPath)) {
  try {
    const data = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    hasPublicConfig = !!(data?.supabaseUrl && data?.supabaseAnonKey);
  } catch {
    hasPublicConfig = false;
  }
}

if (!requiredPair && !hasPublicConfig) {
  console.error(
    'Missing Supabase runtime config: set VITE_SUPABASE_URL + VITE_SUPABASE_PUBLISHABLE_KEY or provide public/app-public-config.json with supabaseUrl + supabaseAnonKey.',
  );
  process.exit(1);
}

if (process.env.VITE_SENTRY_DSN) {
  const isHttp = /^https?:\/\//.test(process.env.VITE_SENTRY_DSN);
  if (!isHttp) {
    console.error('VITE_SENTRY_DSN must be a valid URL when provided.');
    process.exit(1);
  }
}

console.log('Environment validation passed.');

