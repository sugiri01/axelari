import { supabase } from './supabase';

export interface LearningPathData {
  current_phase: number;
  learning_speed: string;
  next_topic: {
    id: string;
    title: string;
    difficulty: string;
  } | null;
  mastered_topics: number;
  in_progress_topics: number;
  average_accuracy: number;
}

export async function calculateLearningPath(studentId: string): Promise<LearningPathData | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/calculate-alp`;
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error('Failed to calculate learning path');
    }

    const result = await response.json();
    return result.learning_path;
  } catch (error) {
    console.error('Error calculating learning path:', error);
    return null;
  }
}

export async function getNextRecommendedTopic(studentId: string) {
  try {
    const { data, error } = await supabase
      .from('learning_paths')
      .select('next_topic_id, current_phase')
      .eq('student_id', studentId)
      .maybeSingle();

    if (error) throw error;

    if (!data?.next_topic_id) return null;

    const { data: topic, error: topicError } = await supabase
      .from('topics')
      .select('*')
      .eq('id', data.next_topic_id)
      .maybeSingle();

    if (topicError) throw topicError;

    return {
      ...topic,
      phase: data.current_phase
    };
  } catch (error) {
    console.error('Error getting next topic:', error);
    return null;
  }
}

export async function updateCognitiveProfile(studentId: string, dimensions: {
  visual?: number;
  kinesthetic?: number;
  logical?: number;
  verbal?: number;
  social?: number;
  solitary?: number;
  musical?: number;
  naturalistic?: number;
}) {
  try {
    const { error } = await supabase
      .from('cognitive_assessments')
      .insert({
        student_id: studentId,
        ...dimensions
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating cognitive profile:', error);
    return false;
  }
}
