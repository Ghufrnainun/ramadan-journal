-- Add missing profile preference columns used by the app
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS ramadan_end_date date,
  ADD COLUMN IF NOT EXISTS silent_mode boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS hide_streak boolean DEFAULT false;

-- Ensure existing rows have non-null booleans
UPDATE public.profiles
SET
  silent_mode = COALESCE(silent_mode, false),
  hide_streak = COALESCE(hide_streak, false)
WHERE silent_mode IS NULL OR hide_streak IS NULL;

-- Refresh PostgREST schema cache so new columns are recognized immediately
NOTIFY pgrst, 'reload schema';