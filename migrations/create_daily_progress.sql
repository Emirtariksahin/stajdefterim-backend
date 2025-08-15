-- Daily Progress Table (Günlük İlerlemeler)
CREATE TABLE IF NOT EXISTS daily_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  internship_id UUID NOT NULL REFERENCES internships(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  completed_tasks JSONB DEFAULT '[]'::jsonb, -- Tamamlanan görevlerin listesi
  earned_credits INTEGER DEFAULT 0,
  earned_exp INTEGER DEFAULT 0,
  completion_percentage INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, internship_id, day_number)
);

-- Voice Notes Table (Sesli Notlar)
CREATE TABLE IF NOT EXISTS voice_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  internship_id UUID NOT NULL REFERENCES internships(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  topic VARCHAR(200),
  file_path TEXT NOT NULL, -- Dosya yolu (Supabase Storage)
  duration_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS Policies for daily_progress
ALTER TABLE daily_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own daily progress" ON daily_progress
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily progress" ON daily_progress
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily progress" ON daily_progress
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own daily progress" ON daily_progress
FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for voice_notes
ALTER TABLE voice_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own voice notes" ON voice_notes
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own voice notes" ON voice_notes
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own voice notes" ON voice_notes
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own voice notes" ON voice_notes
FOR DELETE USING (auth.uid() = user_id);

-- Update notes table to include day_number for daily notes
ALTER TABLE notes ADD COLUMN IF NOT EXISTS day_number INTEGER;

-- Index for better performance
CREATE INDEX IF NOT EXISTS idx_daily_progress_user_internship ON daily_progress(user_id, internship_id);
CREATE INDEX IF NOT EXISTS idx_daily_progress_day ON daily_progress(day_number);
CREATE INDEX IF NOT EXISTS idx_voice_notes_user_internship_day ON voice_notes(user_id, internship_id, day_number);
CREATE INDEX IF NOT EXISTS idx_notes_day_number ON notes(day_number) WHERE day_number IS NOT NULL;