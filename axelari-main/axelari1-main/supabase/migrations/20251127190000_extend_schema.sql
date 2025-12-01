/*
  # Extended Axelari Database Schema

  ## Overview
  This migration extends the Axelari schema with additional tables for:
  - Question bank and content library
  - Assessments and notifications
  - Parent-child relationships
  - Cognitive assessments (8-dimensional psychometric model)
  - Adaptation logs and analytics caching
  - Gamification elements

  ## New Tables Created
  
  ### 1. questions
  - Question bank with multiple question types
  - Columns: id, topic_id, question_text, question_type, options, correct_answer, difficulty, bloom_level, tags, created_by
  
  ### 2. content_library
  - Learning materials (lessons, videos, documents)
  - Columns: id, topic_id, title, content_type, content_url, description, duration, created_by
  
  ### 3. assessments
  - Exam configurations and templates
  - Columns: id, title, board, grade, subject, duration, total_marks, question_ids, created_by
  
  ### 4. notifications
  - System notifications for all users
  - Columns: id, user_id, title, message, type, read, created_at
  
  ### 5. parent_child_links
  - Parent-student relationships
  - Columns: id, parent_id, student_id, relationship, active
  
  ### 6. cognitive_assessments
  - 8-dimensional psychometric profiles
  - Columns: id, student_id, visual, kinesthetic, logical, verbal, social, solitary, musical, naturalistic, assessed_at
  
  ### 7. adaptation_logs
  - Tracks ALP and DCA decisions
  - Columns: id, student_id, adaptation_type, context, decision, effectiveness_score, created_at
  
  ### 8. achievements
  - Gamification badges and rewards
  - Columns: id, student_id, achievement_type, title, description, earned_at
  
  ### 9. leaderboards
  - Performance rankings
  - Columns: id, student_id, category, score, rank, period, updated_at

  ## Security
  - RLS enabled on all tables
  - Role-based access policies
  - Data isolation by user ownership
*/

-- Create questions table
CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id uuid REFERENCES topics(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  question_type text NOT NULL CHECK (question_type IN ('mcq', 'subjective', 'true_false', 'fill_blank', 'case_based')),
  options jsonb DEFAULT '[]',
  correct_answer text NOT NULL,
  explanation text,
  difficulty text CHECK (difficulty IN ('easy', 'medium', 'hard')),
  bloom_level text CHECK (bloom_level IN ('remember', 'understand', 'apply', 'analyze', 'evaluate', 'create')),
  tags text[] DEFAULT '{}',
  image_url text,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view questions"
  ON questions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Teachers and admins can create questions"
  ON questions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('teacher', 'admin')
    )
  );

CREATE POLICY "Teachers and admins can update questions"
  ON questions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('teacher', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('teacher', 'admin')
    )
  );

-- Create content_library table
CREATE TABLE IF NOT EXISTS content_library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id uuid REFERENCES topics(id) ON DELETE CASCADE,
  title text NOT NULL,
  content_type text NOT NULL CHECK (content_type IN ('video', 'document', 'interactive', 'lesson', 'simulation')),
  content_url text,
  description text,
  duration integer DEFAULT 0,
  difficulty text CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  thumbnail_url text,
  learning_style text[] DEFAULT '{}',
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE content_library ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view content"
  ON content_library FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Teachers and admins can manage content"
  ON content_library FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('teacher', 'admin')
    )
  );

-- Create assessments table
CREATE TABLE IF NOT EXISTS assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  board text NOT NULL,
  grade integer NOT NULL,
  subject text NOT NULL,
  duration integer NOT NULL DEFAULT 60,
  total_marks integer NOT NULL DEFAULT 100,
  question_ids uuid[] DEFAULT '{}',
  instructions text,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view published assessments"
  ON assessments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Teachers and admins can manage assessments"
  ON assessments FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('teacher', 'admin')
    )
  );

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL CHECK (type IN ('info', 'success', 'warning', 'achievement', 'assignment', 'reminder')),
  read boolean DEFAULT false,
  link text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create parent_child_links table
CREATE TABLE IF NOT EXISTS parent_child_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  student_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  relationship text NOT NULL CHECK (relationship IN ('father', 'mother', 'guardian', 'other')),
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(parent_id, student_id)
);

ALTER TABLE parent_child_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can view own links"
  ON parent_child_links FOR SELECT
  TO authenticated
  USING (auth.uid() = parent_id);

CREATE POLICY "Students can view own parent links"
  ON parent_child_links FOR SELECT
  TO authenticated
  USING (auth.uid() = student_id);

CREATE POLICY "Parents can create links"
  ON parent_child_links FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = parent_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'parent'
    )
  );

-- Create cognitive_assessments table (8-dimensional psychometric model)
CREATE TABLE IF NOT EXISTS cognitive_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  visual integer DEFAULT 50 CHECK (visual >= 0 AND visual <= 100),
  kinesthetic integer DEFAULT 50 CHECK (kinesthetic >= 0 AND kinesthetic <= 100),
  logical integer DEFAULT 50 CHECK (logical >= 0 AND logical <= 100),
  verbal integer DEFAULT 50 CHECK (verbal >= 0 AND verbal <= 100),
  social integer DEFAULT 50 CHECK (social >= 0 AND social <= 100),
  solitary integer DEFAULT 50 CHECK (solitary >= 0 AND solitary <= 100),
  musical integer DEFAULT 50 CHECK (musical >= 0 AND musical <= 100),
  naturalistic integer DEFAULT 50 CHECK (naturalistic >= 0 AND naturalistic <= 100),
  assessed_at timestamptz DEFAULT now()
);

ALTER TABLE cognitive_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own cognitive assessments"
  ON cognitive_assessments FOR SELECT
  TO authenticated
  USING (auth.uid() = student_id);

CREATE POLICY "Students can insert own cognitive assessments"
  ON cognitive_assessments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Teachers can view student cognitive assessments"
  ON cognitive_assessments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM class_assignments
      WHERE class_assignments.student_id = cognitive_assessments.student_id
      AND class_assignments.teacher_id = auth.uid()
      AND class_assignments.active = true
    )
  );

-- Create adaptation_logs table
CREATE TABLE IF NOT EXISTS adaptation_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  adaptation_type text NOT NULL CHECK (adaptation_type IN ('difficulty', 'content_format', 'pacing', 'topic_sequence', 'hint_level')),
  context jsonb DEFAULT '{}',
  decision text NOT NULL,
  effectiveness_score integer CHECK (effectiveness_score >= 0 AND effectiveness_score <= 100),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE adaptation_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own adaptation logs"
  ON adaptation_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = student_id);

CREATE POLICY "System can create adaptation logs"
  ON adaptation_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = student_id);

-- Create achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_type text NOT NULL,
  title text NOT NULL,
  description text,
  icon text,
  points integer DEFAULT 0,
  earned_at timestamptz DEFAULT now()
);

ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own achievements"
  ON achievements FOR SELECT
  TO authenticated
  USING (auth.uid() = student_id);

CREATE POLICY "System can create achievements"
  ON achievements FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = student_id);

-- Create leaderboards table
CREATE TABLE IF NOT EXISTS leaderboards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  category text NOT NULL CHECK (category IN ('overall', 'weekly', 'subject', 'accuracy', 'speed', 'consistency')),
  score integer DEFAULT 0,
  rank integer,
  period text NOT NULL,
  board text,
  grade integer,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(student_id, category, period)
);

ALTER TABLE leaderboards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view leaderboards"
  ON leaderboards FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can update leaderboards"
  ON leaderboards FOR ALL
  TO authenticated
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_questions_topic ON questions(topic_id);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_content_library_topic ON content_library(topic_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_parent_child_links_parent ON parent_child_links(parent_id);
CREATE INDEX IF NOT EXISTS idx_parent_child_links_student ON parent_child_links(student_id);
CREATE INDEX IF NOT EXISTS idx_cognitive_assessments_student ON cognitive_assessments(student_id);
CREATE INDEX IF NOT EXISTS idx_adaptation_logs_student ON adaptation_logs(student_id);
CREATE INDEX IF NOT EXISTS idx_achievements_student ON achievements(student_id);
CREATE INDEX IF NOT EXISTS idx_leaderboards_category ON leaderboards(category, period);
CREATE INDEX IF NOT EXISTS idx_leaderboards_student ON leaderboards(student_id);
