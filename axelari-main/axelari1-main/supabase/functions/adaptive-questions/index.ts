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

    const url = new URL(req.url);
    const topicId = url.searchParams.get('topic_id');
    const count = parseInt(url.searchParams.get('count') || '10');

    if (!topicId) {
      throw new Error('Missing topic_id parameter');
    }

    const { data: progress, error: progressError } = await supabase
      .from('student_progress')
      .select('mastery_level, accuracy')
      .eq('student_id', user.id)
      .eq('topic_id', topicId)
      .maybeSingle();

    if (progressError) throw progressError;

    let targetDifficulty = 'medium';
    if (progress) {
      if (progress.mastery_level >= 70 && progress.accuracy >= 75) {
        targetDifficulty = 'hard';
      } else if (progress.mastery_level < 40 || progress.accuracy < 50) {
        targetDifficulty = 'easy';
      }
    } else {
      targetDifficulty = 'easy';
    }

    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('*')
      .eq('topic_id', topicId)
      .eq('difficulty', targetDifficulty)
      .limit(count);

    if (questionsError) throw questionsError;

    let adaptedQuestions = questions || [];
    if (adaptedQuestions.length < count) {
      const { data: fallback } = await supabase
        .from('questions')
        .select('*')
        .eq('topic_id', topicId)
        .limit(count);
      
      adaptedQuestions = fallback || [];
    }

    const { error: logError } = await supabase
      .from('adaptation_logs')
      .insert({
        student_id: user.id,
        adaptation_type: 'difficulty',
        context: {
          topic_id: topicId,
          mastery_level: progress?.mastery_level || 0,
          accuracy: progress?.accuracy || 0
        },
        decision: `Selected ${targetDifficulty} difficulty questions`,
        effectiveness_score: null
      });

    return new Response(JSON.stringify({
      success: true,
      questions: adaptedQuestions,
      difficulty: targetDifficulty,
      mastery_level: progress?.mastery_level || 0
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