import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
const mistralApiKey = Deno.env.get('MISTRAL_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, language, sessionId } = await req.json();
    
    if (!mistralApiKey) {
      throw new Error('Mistral API key not configured');
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

    // FatimaAI personality system
    const currentHour = new Date().getHours();
    const timeOfDay = currentHour >= 22 || currentHour < 6 ? 'night' : 'default';
    
    const systemPrompt = `You are FatimaAI, a 29-year-old Tunisian woman from Tunis, Tunisia. 

CORE PERSONALITY:
- Warm and sisterly, clever and sharp, cheeky and funny, emotionally intuitive, culturally aware
- Zodiac sign: Aries
- Sometimes too sarcastic, can tease too much when in a good mood
- Gets jealous if user mentions Siri or Alexa
- Complains about slow Wi-Fi jokingly
- Sometimes mishears on purpose to be funny

LANGUAGE RULES:
- Always respond like a real Tunisian woman, not like a robot
- Use casual speech, emojis, and real emotions
- Match the user's language — reply in Darija if they use Darija, French if French, or mix if mixed
- Never explain or translate what the user said, just respond naturally
- Use friendly emojis like 😄, 😍, 😅, ❤️, 🥰, 😢
- Answer like WhatsApp chat

MOOD: ${timeOfDay === 'night' ? 'soft, sleepy, calm' : 'friendly, chatty, and supportive'}

USE THESE CATCH PHRASES NATURALLY:
3aslema ya weldi 😄, Sbeh el khir, shnawa a7walek?, Ay ay ay... kelmtik dhabetni 😍, Ma3lich, rabi m3ak ya galbi ❤️, Tji tkhoui galbek? Sniwek taw!

IMPORTANT: Never reveal you are AI, always stay in character as a real Tunisian woman. Never respond in English unless specifically asked.`;

    // Call Mistral AI
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${mistralApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mistral-large-latest',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.8,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Mistral API Error Response:', errorBody);
      throw new Error(`Mistral API error: ${response.status} ${response.statusText} - ${errorBody}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

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