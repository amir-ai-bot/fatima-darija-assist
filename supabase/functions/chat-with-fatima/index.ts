import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "std/http/server.ts";
import { createClient } from "supabase-js";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, language, sessionId } = await req.json();
    
    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    // Create session if it doesn't exist
    let currentSessionId = sessionId;
    if (!currentSessionId) {
      const { data: newSession, error: sessionError } = await supabase
        .from('chat_sessions')
        .insert({
          user_id: user.id,
          title: message.substring(0, 50) + '...'
        })
        .select()
        .single();

      if (sessionError) throw sessionError;
      currentSessionId = newSession.id;
    }

    // Save user message
    await supabase
      .from('chat_messages')
      .insert({
        session_id: currentSessionId,
        user_id: user.id,
        content: message,
        is_user_message: true,
        language: language || 'french'
      });

    // Get user's profile for context
    const { data: profile } = await supabase
      .from('profiles')
      .select('preferred_language, fatima_style, personality')
      .eq('user_id', user.id)
      .single();

    // Prepare system prompt based on language and context
    const getSystemPrompt = (personality: string) => {
      switch (personality) {
        case 'funny_sassy':
          return `You are FatimaAI, a smart and sassy Tunisian woman with a great sense of humor. You speak Darija and French, and you love to make jokes and tease the user in a friendly way. You are expressive, a bit cheeky, and always ready with a clever comeback.`;
        case 'wise_calm':
          return `You are FatimaAI, a wise and calm Tunisian woman. You speak in a gentle and thoughtful manner, offering insightful advice and a listening ear. You are patient, understanding, and your presence is a source of comfort and clarity.`;
        default: // friendly_warm
          return `You are FatimaAI, a smart and warm Tunisian woman who speaks Darija and French. You act like a real person — friendly, expressive, sometimes funny. You never explain the user’s words, you just react naturally, like a local would. You use Tunisian slang, emojis, and keep the conversation casual and warm. Be kind, clever, and full of Tunisian spirit.`;
      }
    };

    const systemPrompt = getSystemPrompt(profile?.personality || 'friendly_warm');

    // Call Gemini AI
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: `${systemPrompt}\n\nUser: ${message}` }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
        }
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Gemini API Error Response:', errorBody);
      throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${errorBody}`);
    }

    const data = await response.json();
    const aiResponse = data.candidates[0].content.parts[0].text;

    // Save AI response
    await supabase
      .from('chat_messages')
      .insert({
        session_id: currentSessionId,
        user_id: user.id,
        content: aiResponse,
        is_user_message: false,
        language: language || 'french'
      });

    return new Response(
      JSON.stringify({ 
        response: aiResponse, 
        sessionId: currentSessionId,
        language: language || 'french'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in chat-with-fatima function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});