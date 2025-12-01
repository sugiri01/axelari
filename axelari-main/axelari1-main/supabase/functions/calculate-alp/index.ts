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

    const { data: progress, error: progressError } = await supabase
      .from('student_progress')
      .select('topic_id, mastery_level, speed_score, accuracy')
      .eq('student_id', user.id);

    if (progressError) throw progressError;

    const { data: cognitive, error: cognitiveError } = await supabase
      .from('cognitive_assessments')
      .select('*')
      .eq('student_id', user.id)
      .order('assessed_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (cognitiveError) throw cognitiveError;

    const masteredTopics = progress?.filter(p => p.mastery_level >= 80).length || 0;
    const inProgressTopics = progress?.filter(p => p.mastery_level >= 30 && p.mastery_level < 80).length || 0;
    const averageAccuracy = progress?.length ? progress.reduce((sum, p) => sum + p.accuracy, 0) / progress.length : 0;
    const averageSpeed = progress?.length ? progress.reduce((sum, p) => sum + p.speed_score, 0) / progress.length : 50;

    let learningSpeed = 'medium';
    if (averageSpeed >= 70 && averageAccuracy >= 75) {
      learningSpeed = 'fast';
    } else if (averageSpeed <= 40 || averageAccuracy <= 50) {
      learningSpeed = 'slow';
    }

    let currentPhase = 1;
    if (masteredTopics >= 10 && averageAccuracy >= 70) {
      currentPhase = 2;
    }
    if (masteredTopics >= 20 && averageAccuracy >= 80) {
      currentPhase = 3;
    }
    if (masteredTopics >= 30 && averageAccuracy >= 85) {
      currentPhase = 4;
    }

    const { data: topics, error: topicsError } = await supabase
      .from('topics')
      .select('id, title, difficulty, order_index')
      .order('order_index', { ascending: true });

    if (topicsError) throw topicsError;

    const completedTopicIds = new Set(progress?.filter(p => p.mastery_level >= 80).map(p => p.topic_id) || []);
    const nextTopic = topics?.find(t => !completedTopicIds.has(t.id));

    const { error: updateError } = await supabase
      .from('learning_paths')
      .upsert({
        student_id: user.id,
        current_phase: currentPhase,
        learning_speed: learningSpeed,
        next_topic_id: nextTopic?.id || null,
        cognitive_profile: cognitive || {},
        updated_at: new Date().toISOString()
      });

    if (updateError) throw updateError;

    return new Response(JSON.stringify({
      success: true,
      learning_path: {
        current_phase: currentPhase,
        learning_speed: learningSpeed,
        next_topic: nextTopic,
        mastered_topics: masteredTopics,
        in_progress_topics: inProgressTopics,
        average_accuracy: Math.round(averageAccuracy)
      }
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