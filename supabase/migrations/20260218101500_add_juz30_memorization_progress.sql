-- Juz 30 memorization progress (server-side readiness)
CREATE TABLE IF NOT EXISTS public.juz30_memorization_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  surah_number INTEGER NOT NULL CHECK (surah_number BETWEEN 78 AND 114),
  status TEXT NOT NULL DEFAULT 'not_started'
    CHECK (status IN ('not_started', 'learning', 'memorized')),
  last_reviewed_at DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, surah_number)
);

CREATE INDEX IF NOT EXISTS idx_juz30_memorization_progress_user_id
  ON public.juz30_memorization_progress (user_id);

CREATE INDEX IF NOT EXISTS idx_juz30_memorization_progress_user_status
  ON public.juz30_memorization_progress (user_id, status);

ALTER TABLE public.juz30_memorization_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their juz30 memorization progress"
ON public.juz30_memorization_progress
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their juz30 memorization progress"
ON public.juz30_memorization_progress
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their juz30 memorization progress"
ON public.juz30_memorization_progress
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their juz30 memorization progress"
ON public.juz30_memorization_progress
FOR DELETE
USING (auth.uid() = user_id);

CREATE TRIGGER update_juz30_memorization_progress_updated_at
BEFORE UPDATE ON public.juz30_memorization_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
