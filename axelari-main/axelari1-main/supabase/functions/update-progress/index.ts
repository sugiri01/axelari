import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { topic_id, score, time_taken, questions_answered, difficulty } = await req.json();

    if (!topic_id || score === undefined) {
      throw new Error('Missing required fields');
    }

    const { data: existing, error: fetchError } = await supabase
      .from('student_progress')
      .select('*')
      .eq('student_id', user.id)
      .eq('topic_id', topic_id)
      .maybeSingle();

    if (fetchError) throw fetchError;

    const newAccuracy = score;
    const newAttempts = (existing?.attempts || 0) + 1;
    
    let newMasteryLevel = 0;
    if (existing) {
      const weightedOld = existing.mastery_level * 0.7;
      const weightedNew = newAccuracy * 0.3;
      newMasteryLevel = Math.round(weightedOld + weightedNew);
    } else {
      newMasteryLevel = Math.round(newAccuracy);
    }

    const averageTime = time_taken / questions_answered;
    let speedScore = 50;
    if (averageTime < 30) speedScore = 80;
    else if (averageTime < 60) speedScore = 65;
    else if (averageTime < 120) speedScore = 50;
    else speedScore = 35;

    const { error: upsertError } = await supabase
      .from('student_progress')
      .upsert({
        student_id: user.id,
        topic_id,
        mastery_level: newMasteryLevel,
        speed_score: speedScore,
        accuracy: newAccuracy,
        attempts: newAttempts,
        last_practiced: new Date().toISOString()
      });

    if (upsertError) throw upsertError;

    const { error: quizError } = await supabase
      .from('quiz_sessions')
      .insert({
        student_id: user.id,
        topic_id,
        difficulty,
        score,
        time_taken,
        questions_answered,
        adapted: false
      });

    if (quizError) throw quizError;

    let achievement = null;
    if (newMasteryLevel >= 80 && (!existing || existing.mastery_level < 80)) {
      const { data: topic } = await supabase
        .from('topics')
        .select('title')
        .eq('id', topic_id)
        .maybeSingle();

      const { error: achievementError } = await supabase
        .from('achievements')
        .insert({
          student_id: user.id,
          achievement_type: 'topic_mastery',
          title: 'Topic Mastered!',
          description: `Mastered ${topic?.title || 'this topic'}`,
          icon: 'trophy',
          points: 100
        });

      if (!achievementError) {
        achievement = { type: 'topic_mastery', title: 'Topic Mastered!', points: 100 };
      }
    }

    return new Response(JSON.stringify({
      success: true,
      progress: {
        mastery_level: newMasteryLevel,
        speed_score: speedScore,
        accuracy: newAccuracy,
        attempts: newAttempts
      },
      achievement
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});