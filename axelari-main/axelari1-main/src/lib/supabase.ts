import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Temporary fix: Don't throw error if env vars are missing, just log warning
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Key missing. Supabase client will not work.');
}

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce'
    },
    global: {
      headers: {
        'x-application-name': 'axelari-learning'
      }
    }
  })
  : {} as any; // Cast to any to avoid type errors in consuming components for now

export type UserRole = 'student' | 'teacher' | 'parent' | 'admin';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  title: string;
  description?: string;
  board: string;
  grade: number;
  subject: string;
  created_at: string;
  updated_at?: string;
}

export interface Topic {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  order_index: number;
  estimated_time: number;
  created_at: string;
}

export interface StudentProgress {
  id: string;
  student_id: string;
  topic_id: string;
  mastery_level: number;
  speed_score: number;
  accuracy: number;
  attempts: number;
  last_practiced?: string;
  created_at: string;
}

export interface PerformanceMetric {
  id: string;
  student_id: string;
  date: string;
  topics_mastered: number;
  accuracy: number;
  speed: number;
  consistency: number;
  streak_days: number;
  created_at: string;
}

export interface LearningPath {
  id: string;
  student_id: string;
  current_phase: number;
  cognitive_profile: Record<string, any>;
  learning_speed: 'slow' | 'medium' | 'fast';
  next_topic_id?: string;
  updated_at: string;
}
