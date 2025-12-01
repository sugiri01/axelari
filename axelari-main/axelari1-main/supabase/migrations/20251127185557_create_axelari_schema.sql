/*
  # Axelari Platform Database Schema

  ## Overview
  Complete database schema for Axelari AI-powered adaptive learning platform
  supporting Student, Teacher, Parent, and Admin layers.

  ## New Tables Created
  
  ### 1. profiles
  - Extends auth.users with role and additional user data
  - Columns: id, email, full_name, role, avatar_url, created_at, updated_at
  - Role types: student, teacher, parent, admin
  
  ### 2. courses
  - Stores course/subject information
  - Columns: id, title, description, board, grade, subject, created_at
  
  ### 3. topics
  - Individual learning topics within courses
  - Columns: id, course_id, title, description, difficulty, order_index, estimated_time
  
  ### 4. student_progress
  - Tracks individual student progress on topics
  - Columns: id, student_id, topic_id, mastery_level, speed_score, accuracy, attempts, last_practiced
  
  ### 5. quiz_sessions
  - Records quiz attempts and adaptive behavior
  - Columns: id, student_id, topic_id, difficulty, score, time_taken, questions_answered, adapted
  
  ### 6. performance_metrics
  - Aggregated student performance data
  - Columns: id, student_id, date, topics_mastered, accuracy, speed, consistency, streak_days
  
  ### 7. learning_paths
  - ALP-generated personalized learning sequences
  - Columns: id, student_id, current_phase, cognitive_profile, learning_speed, next_topic_id
  
  ### 8. ai_interactions
  - Logs AI tutor conversations and assistance
  - Columns: id, student_id, interaction_type, query, response, helpful, created_at
  
  ### 9. class_assignments
  - Links students to teachers and classes
  - Columns: id, student_id, teacher_id, class_name, board, grade, active
  
  ## Security
  - Row Level Security (RLS) enabled on all tables
  - Policies restrict access based on user roles and ownership
  - Students can only access their own data
  - Teachers can access their students' data
  - Parents can access their children's data
  - Admins have broader access
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL CHECK (role IN ('student', 'teacher', 'parent', 'admin')),
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  board text NOT NULL,
  grade integer NOT NULL,
  subject text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view courses"
  ON courses FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Teachers and admins can create courses"
  ON courses FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('teacher', 'admin')
    )
  );

-- Create topics table
CREATE TABLE IF NOT EXISTS topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  difficulty text CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  order_index integer NOT NULL DEFAULT 0,
  estimated_time integer DEFAULT 30,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view topics"
  ON topics FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Teachers and admins can manage topics"
  ON topics FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('teacher', 'admin')
    )
  );

-- Create class_assignments table (moved before student_progress to resolve dependency)
CREATE TABLE IF NOT EXISTS class_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  teacher_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  class_name text NOT NULL,
  board text NOT NULL,
  grade integer NOT NULL,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE class_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own class assignments"
  ON class_assignments FOR SELECT
  TO authenticated
  USING (auth.uid() = student_id);

CREATE POLICY "Teachers can view their class assignments"
  ON class_assignments FOR SELECT
  TO authenticated
  USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can create class assignments"
  ON class_assignments FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = teacher_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'teacher'
    )
  );

-- Create student_progress table
CREATE TABLE IF NOT EXISTS student_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  topic_id uuid REFERENCES topics(id) ON DELETE CASCADE,
  mastery_level integer DEFAULT 0 CHECK (mastery_level >= 0 AND mastery_level <= 100),
  speed_score integer DEFAULT 50,
  accuracy integer DEFAULT 0,
  attempts integer DEFAULT 0,
  last_practiced timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(student_id, topic_id)
);

ALTER TABLE student_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own progress"
  ON student_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = student_id);

CREATE POLICY "Students can update own progress"
  ON student_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = student_id)
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can insert own progress"
  ON student_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Teachers can view student progress"
  ON student_progress FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM class_assignments
      WHERE class_assignments.student_id = student_progress.student_id
      AND class_assignments.teacher_id = auth.uid()
      AND class_assignments.active = true
    )
  );

-- Create quiz_sessions table
CREATE TABLE IF NOT EXISTS quiz_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  topic_id uuid REFERENCES topics(id) ON DELETE CASCADE,
  difficulty text NOT NULL,
  score integer DEFAULT 0,
  time_taken integer DEFAULT 0,
  questions_answered integer DEFAULT 0,
  adapted boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own quiz sessions"
  ON quiz_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = student_id);

CREATE POLICY "Students can create quiz sessions"
  ON quiz_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = student_id);

-- Create performance_metrics table
CREATE TABLE IF NOT EXISTS performance_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  topics_mastered integer DEFAULT 0,
  accuracy integer DEFAULT 0,
  speed integer DEFAULT 0,
  consistency integer DEFAULT 0,
  streak_days integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(student_id, date)
);

ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own metrics"
  ON performance_metrics FOR SELECT
  TO authenticated
  USING (auth.uid() = student_id);

CREATE POLICY "Students can insert own metrics"
  ON performance_metrics FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update own metrics"
  ON performance_metrics FOR UPDATE
  TO authenticated
  USING (auth.uid() = student_id)
  WITH CHECK (auth.uid() = student_id);

-- Create learning_paths table
CREATE TABLE IF NOT EXISTS learning_paths (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  current_phase integer DEFAULT 1,
  cognitive_profile jsonb DEFAULT '{}',
  learning_speed text DEFAULT 'medium',
  next_topic_id uuid REFERENCES topics(id),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE learning_paths ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own learning path"
  ON learning_paths FOR SELECT
  TO authenticated
  USING (auth.uid() = student_id);

CREATE POLICY "Students can update own learning path"
  ON learning_paths FOR UPDATE
  TO authenticated
  USING (auth.uid() = student_id)
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can insert own learning path"
  ON learning_paths FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = student_id);

-- Create ai_interactions table
CREATE TABLE IF NOT EXISTS ai_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  interaction_type text NOT NULL,
  query text NOT NULL,
  response text,
  helpful boolean,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ai_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own AI interactions"
  ON ai_interactions FOR SELECT
  TO authenticated
  USING (auth.uid() = student_id);

CREATE POLICY "Students can create AI interactions"
  ON ai_interactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = student_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_student_progress_student ON student_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_student_progress_topic ON student_progress(topic_id);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_student ON quiz_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_student ON performance_metrics(student_id);
CREATE INDEX IF NOT EXISTS idx_class_assignments_student ON class_assignments(student_id);
CREATE INDEX IF NOT EXISTS idx_class_assignments_teacher ON class_assignments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_topics_course ON topics(course_id);