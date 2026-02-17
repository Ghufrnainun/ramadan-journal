import fs from 'node:fs';
import path from 'node:path';

const migrationsDir = path.resolve('supabase', 'migrations');
const files = fs.existsSync(migrationsDir)
  ? fs.readdirSync(migrationsDir).filter((file) => file.endsWith('.sql'))
  : [];

if (files.length === 0) {
  console.error('No SQL migrations found in supabase/migrations.');
  process.exit(1);
}

const content = files
  .map((file) => fs.readFileSync(path.join(migrationsDir, file), 'utf8').toLowerCase())
  .join('\n');

const protectedTables = [
  'profiles',
  'reading_progress',
  'dhikr_sessions',
  'daily_tracker',
  'fasting_log',
  'tarawih_log',
  'sedekah_log',
  'ramadan_goals',
  'daily_status',
  'reflections',
];

const missing = protectedTables.filter((table) => {
  const hasTableMention = content.includes(table);
  const hasAuthGuard = content.includes('auth.uid() = user_id');
  return !hasTableMention || !hasAuthGuard;
});

if (missing.length > 0) {
  console.error(`RLS guard check failed for tables: ${missing.join(', ')}`);
  process.exit(1);
}

console.log('RLS guard check passed.');
