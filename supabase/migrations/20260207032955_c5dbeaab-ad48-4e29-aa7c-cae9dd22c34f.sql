-- 1. Fasting Log Table
CREATE TABLE fasting_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  status text NOT NULL DEFAULT 'pending',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

-- 2. Tarawih Log Table  
CREATE TABLE tarawih_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  tarawih_done boolean DEFAULT false,
  rakaat_count integer DEFAULT 0,
  witir_done boolean DEFAULT false,
  witir_rakaat integer DEFAULT 0,
  mosque_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

-- 3. Sedekah Log Table
CREATE TABLE sedekah_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  completed boolean DEFAULT false,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

-- 4. Ramadan Goals Table
CREATE TABLE ramadan_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  goal_type text NOT NULL,
  title text NOT NULL,
  target integer NOT NULL DEFAULT 1,
  current integer DEFAULT 0,
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 5. Daily Status Table (untuk intention & mood)
CREATE TABLE daily_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  intention text,
  mood text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

-- 6. Reflections Table
CREATE TABLE reflections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  prompt_id text NOT NULL,
  prompt_text jsonb NOT NULL,
  content text,
  mood text,
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Enable RLS
ALTER TABLE fasting_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE tarawih_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE sedekah_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE ramadan_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE reflections ENABLE ROW LEVEL SECURITY;

-- RLS Policies for fasting_log
CREATE POLICY "Users can view own fasting_log" ON fasting_log
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own fasting_log" ON fasting_log
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own fasting_log" ON fasting_log
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own fasting_log" ON fasting_log
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for tarawih_log
CREATE POLICY "Users can view own tarawih_log" ON tarawih_log
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tarawih_log" ON tarawih_log
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tarawih_log" ON tarawih_log
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tarawih_log" ON tarawih_log
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for sedekah_log
CREATE POLICY "Users can view own sedekah_log" ON sedekah_log
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sedekah_log" ON sedekah_log
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sedekah_log" ON sedekah_log
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own sedekah_log" ON sedekah_log
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for ramadan_goals
CREATE POLICY "Users can view own ramadan_goals" ON ramadan_goals
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own ramadan_goals" ON ramadan_goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own ramadan_goals" ON ramadan_goals
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own ramadan_goals" ON ramadan_goals
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for daily_status
CREATE POLICY "Users can view own daily_status" ON daily_status
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own daily_status" ON daily_status
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own daily_status" ON daily_status
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own daily_status" ON daily_status
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for reflections
CREATE POLICY "Users can view own reflections" ON reflections
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own reflections" ON reflections
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reflections" ON reflections
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reflections" ON reflections
  FOR DELETE USING (auth.uid() = user_id);

-- Update triggers (using existing update_updated_at_column function)
CREATE TRIGGER update_fasting_log_updated_at
  BEFORE UPDATE ON fasting_log
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tarawih_log_updated_at
  BEFORE UPDATE ON tarawih_log
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sedekah_log_updated_at
  BEFORE UPDATE ON sedekah_log
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ramadan_goals_updated_at
  BEFORE UPDATE ON ramadan_goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_status_updated_at
  BEFORE UPDATE ON daily_status
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reflections_updated_at
  BEFORE UPDATE ON reflections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();