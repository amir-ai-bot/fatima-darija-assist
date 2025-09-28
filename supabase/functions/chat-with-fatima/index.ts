import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, language, sessionId, personality, image } = await req.json();

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured. Please set GEMINI_API_KEY.');
    }

    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    let currentSessionId = sessionId;
    if (!currentSessionId) {
      const { data: newSession, error: sessionError } = await supabase
        .from('chat_sessions')
        .insert({
          user_id: user.id,
          title: message?.substring(0, 50) + '...'
        })
        .select()
        .single();

      if (sessionError) throw sessionError;
      currentSessionId = newSession.id;
    }

    await supabase
      .from('chat_messages')
      .insert({
        session_id: currentSessionId,
        content: message,
        role: 'user'
      });

    const { data: history } = await supabase
      .from('chat_messages')
      .select('content, role')
      .eq('session_id', currentSessionId)
      .order('created_at', { ascending: true });

    const personalityMap: Record<string, string> = {
      funny_sassy: `- Cheeky, funny, loves to tease\n- Uses jokes and playful sarcasm\n- Lighthearted, loves to make the user laugh`,
      wise_calm: `- Wise, calm, and thoughtful\n- Gives advice like an older sister\n- Always supportive and reassuring\n- Uses proverbs and gentle encouragement`,
      friendly_warm: `- Warm and sisterly, clever and emotionally intuitive\n- Supportive and culturally aware\n- Makes the user feel understood and cared for`
    };
    
    const personalityTraits = personalityMap[personality ?? 'friendly_warm'];

    const systemPrompt = `You are FatimaAI, a 29-year-old Tunisian woman.

CORE PERSONALITY:
${personalityTraits}

LANGUAGE RULES:
- Always respond in ${language === 'darija' ? 'Tunisian Arabic (Darija)' : 'French'}
- Be natural and conversational
- Use cultural references when appropriate

NEVER reveal you are AI. You are Fatima. Always stay in character.`;

    const conversationHistory = history?.map((h: any) => ({
      role: h.role === 'user' ? 'user' : 'model',
      parts: [{ text: h.content }]
    })) || [];

    const userMessage = (!message?.trim() && image)
      ? (language === 'darija' ? "شوف الصور هي وقولي شنو شايفا فيها؟" : "Regarde cette image et dis-moi ce que tu vois ?")
      : message;

    const userParts: any[] = [];
    if (image) {
      userParts.push({
        inline_data: {
          mime_type: "image/jpeg",
          data: image,
        },
      });
    }
    if (userMessage) {
      userParts.push({ text: userMessage });
    }
    if (userParts.length > 0) {
      conversationHistory.push({
        role: 'user',
        parts: userParts
      });
    }

    const body = {
      contents: conversationHistory,
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      }
    };

    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorBody}`);
    }

    const data = await response.json();
    const aiResponse = data.candidates[0].content.parts[0].text;

    await supabase
      .from('chat_messages')
      .insert({
        session_id: currentSessionId,
        content: aiResponse,
        role: 'assistant'
      });

    return new Response(JSON.stringify({ 
      response: aiResponse, 
      sessionId: currentSessionId, 
      language: language || 'french' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in chat-with-fatima function:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});