-- Add additional tables for full Ramadan journal features

-- Extend profiles for additional settings
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS ramadan_end_date DATE,
ADD COLUMN IF NOT EXISTS silent_mode BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS hide_streak BOOLEAN DEFAULT FALSE;

-- Daily status (intention, mood, notes)
CREATE TABLE IF NOT EXISTS public.daily_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  intention TEXT,
  mood TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Checklist items (default + custom)
CREATE TABLE IF NOT EXISTS public.checklist_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  label_id TEXT NOT NULL,
  label_en TEXT NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Daily checklist completion
CREATE TABLE IF NOT EXISTS public.daily_checklist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  item_id UUID REFERENCES public.checklist_items(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, item_id, date)
);

-- Dhikr presets (default + custom)
CREATE TABLE IF NOT EXISTS public.dhikr_presets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  label_id TEXT NOT NULL,
  label_en TEXT NOT NULL,
  arabic TEXT NOT NULL,
  transliteration TEXT NOT NULL,
  meaning_id TEXT NOT NULL,
  meaning_en TEXT NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Reflections
CREATE TABLE IF NOT EXISTS public.reflections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  prompt TEXT,
  content TEXT NOT NULL,
  mood TEXT,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Quotes (seeded)
CREATE TABLE IF NOT EXISTS public.quotes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  text_id TEXT NOT NULL,
  text_en TEXT NOT NULL,
  source TEXT NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Bookmarks
CREATE TABLE IF NOT EXISTS public.bookmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.daily_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_checklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dhikr_presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

-- Policies: daily_status
CREATE POLICY "Users can view their daily status"
ON public.daily_status FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their daily status"
ON public.daily_status FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their daily status"
ON public.daily_status FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their daily status"
ON public.daily_status FOR DELETE
USING (auth.uid() = user_id);

-- Policies: checklist_items
CREATE POLICY "Users can read default or their items"
ON public.checklist_items FOR SELECT
USING (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Users can manage their items"
ON public.checklist_items FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policies: daily_checklist
CREATE POLICY "Users can manage their daily checklist"
ON public.daily_checklist FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policies: dhikr_presets
CREATE POLICY "Users can read default or their presets"
ON public.dhikr_presets FOR SELECT
USING (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Users can manage their presets"
ON public.dhikr_presets FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policies: reflections
CREATE POLICY "Users can manage their reflections"
ON public.reflections FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policies: quotes (public read)
CREATE POLICY "Quotes are readable"
ON public.quotes FOR SELECT
USING (TRUE);

-- Policies: bookmarks
CREATE POLICY "Users can manage their bookmarks"
ON public.bookmarks FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_daily_status_updated_at
BEFORE UPDATE ON public.daily_status
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_daily_checklist_updated_at
BEFORE UPDATE ON public.daily_checklist
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reflections_updated_at
BEFORE UPDATE ON public.reflections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
