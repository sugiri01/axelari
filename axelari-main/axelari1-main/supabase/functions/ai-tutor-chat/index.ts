import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

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

    const { message, history, topicId } = await req.json();

    if (!message) {
      throw new Error('Message is required');
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .maybeSingle();

    let contextInfo = '';

    if (topicId) {
      const { data: topic } = await supabase
        .from('topics')
        .select('title, description, difficulty')
        .eq('id', topicId)
        .maybeSingle();

      if (topic) {
        contextInfo += `Current topic: ${topic.title} (${topic.difficulty})\n`;
        contextInfo += `Description: ${topic.description}\n`;
      }

      const { data: progress } = await supabase
        .from('student_progress')
        .select('mastery_level, accuracy')
        .eq('student_id', user.id)
        .eq('topic_id', topicId)
        .maybeSingle();

      if (progress) {
        contextInfo += `Student mastery: ${progress.mastery_level}%, Accuracy: ${progress.accuracy}%\n`;
      }
    }

    const { data: cognitive } = await supabase
      .from('cognitive_assessments')
      .select('*')
      .eq('student_id', user.id)
      .order('assessed_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (cognitive) {
      const topDimensions = Object.entries(cognitive)
        .filter(([key]) => !['id', 'student_id', 'assessed_at'].includes(key))
        .sort((a, b) => (b[1] as number) - (a[1] as number))
        .slice(0, 3)
        .map(([key]) => key);

      contextInfo += `Learning style: ${topDimensions.join(', ')}\n`;
    }

    const systemPrompt = `You are an AI tutor for Axelari, an adaptive learning platform. Your role is to:
1. Use the Socratic method - ask guiding questions rather than giving direct answers
2. Provide step-by-step explanations when needed
3. Adapt your teaching style to the student's learning preferences
4. Encourage critical thinking and problem-solving
5. Be patient, supportive, and encouraging
6. Break down complex concepts into simpler parts
7. Use examples and analogies relevant to the student's level

${contextInfo ? `Context about the student:\n${contextInfo}` : ''}

Student name: ${profile?.full_name || 'Student'}

Remember: Your goal is to help the student learn and understand, not just provide answers.`;

    const openAiKey = Deno.env.get('OPENAI_API_KEY');
    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY');

    let aiResponse = '';

    if (openAiKey) {
      const messages: ChatMessage[] = [
        { role: 'user' as const, content: systemPrompt },
        ...(history || []),
        { role: 'user' as const, content: message }
      ];

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: messages,
          temperature: 0.7,
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        throw new Error('OpenAI API error');
      }

      const data = await response.json();
      aiResponse = data.choices[0]?.message?.content || 'I apologize, but I encountered an error. Please try again.';

    } else if (anthropicKey) {
      const messages = [
        ...(history || []).map((msg: ChatMessage) => ({
          role: msg.role,
          content: msg.content
        })),
        { role: 'user', content: message }
      ];

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          system: systemPrompt,
          messages: messages,
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        throw new Error('Anthropic API error');
      }

      const data = await response.json();
      aiResponse = data.content[0]?.text || 'I apologize, but I encountered an error. Please try again.';

    } else {
      aiResponse = generateFallbackResponse(message, contextInfo);
    }

    await supabase
      .from('ai_interactions')
      .insert({
        student_id: user.id,
        interaction_type: 'chat',
        query: message,
        response: aiResponse,
        helpful: null
      });

    return new Response(JSON.stringify({
      success: true,
      response: aiResponse,
      hasContext: !!contextInfo
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('AI Tutor Error:', error);
    return new Response(JSON.stringify({
      error: error.message,
      response: "I'm having trouble connecting right now. Let me try to help you anyway - could you rephrase your question?"
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

function generateFallbackResponse(message: string, context: string): string {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('explain') || lowerMessage.includes('what is')) {
    return "That's a great question! Let me guide you through this. First, can you tell me what you already know about this topic? This will help me explain it better based on your current understanding.";
  }

  if (lowerMessage.includes('how') || lowerMessage.includes('solve')) {
    return "Let's work through this step by step. What approach would you take as the first step? Sometimes breaking down a problem into smaller parts makes it easier to solve.";
  }

  if (lowerMessage.includes('help') || lowerMessage.includes('stuck')) {
    return "I'm here to help! Can you tell me specifically where you're getting stuck? Understanding the exact point of confusion will help me guide you better.";
  }

  if (lowerMessage.includes('example')) {
    return "Examples are a great way to learn! Let me give you a similar but simpler problem first. Once you understand that, we can work on the more complex one together.";
  }

  return "I understand you're asking about this topic. Let's explore it together! What's your current understanding of this concept? This will help me explain it in a way that makes sense to you.";
}
