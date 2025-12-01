import { supabase } from './supabase';

export interface Question {
  id: string;
  question_text: string;
  question_type: string;
  options: any[];
  correct_answer: string;
  explanation: string;
  difficulty: string;
  image_url?: string;
}

export async function getAdaptiveQuestions(topicId: string, count: number = 10): Promise<{
  questions: Question[];
  difficulty: string;
  mastery_level: number;
} | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/adaptive-questions?topic_id=${topicId}&count=${count}`;
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
      }
    });

    if (!response.ok) {
      throw new Error('Failed to get adaptive questions');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error getting adaptive questions:', error);
    return null;
  }
}

export async function updateProgress(
  topicId: string,
  score: number,
  timeTaken: number,
  questionsAnswered: number,
  difficulty: string
): Promise<{
  progress: any;
  achievement: any | null;
} | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/update-progress`;
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic_id: topicId,
        score,
        time_taken: timeTaken,
        questions_answered: questionsAnswered,
        difficulty
      })
    });

    if (!response.ok) {
      throw new Error('Failed to update progress');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error updating progress:', error);
    return null;
  }
}

export async function adaptContentFormat(
  studentId: string,
  cognitiveProfile: any
): Promise<string[]> {
  const preferences: string[] = [];

  if (cognitiveProfile.visual >= 70) {
    preferences.push('video', 'interactive', 'simulation');
  }

  if (cognitiveProfile.kinesthetic >= 70) {
    preferences.push('interactive', 'simulation');
  }

  if (cognitiveProfile.logical >= 70) {
    preferences.push('document', 'lesson');
  }

  if (cognitiveProfile.verbal >= 70) {
    preferences.push('document', 'lesson');
  }

  if (preferences.length === 0) {
    preferences.push('lesson', 'document', 'video');
  }

  return preferences;
}

export async function logAdaptation(
  studentId: string,
  adaptationType: 'difficulty' | 'content_format' | 'pacing' | 'topic_sequence' | 'hint_level',
  context: any,
  decision: string
) {
  try {
    const { error } = await supabase
      .from('adaptation_logs')
      .insert({
        student_id: studentId,
        adaptation_type: adaptationType,
        context,
        decision
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error logging adaptation:', error);
    return false;
  }
}
