
import { createClient } from '@supabase/supabase-js';
import type { Request, Response } from 'express';


const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;
const geminiApiKey = process.env.GEMINI_API_KEY;


// Express-style handler
export default async function handler(req: Request, res: Response) {
  if (req.method === 'OPTIONS') {
    res.set(corsHeaders);
    return res.status(204).send();
  }

  try {
    const { message, language, sessionId, personality, image } = req.body;

    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured. Please set GEMINI_API_KEY.');
    }

    const authHeader = req.headers['authorization'];
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
        user_id: user.id,
        content: message,
        is_user_message: true,
        language: language || 'french',
        image: image || null
      });

    const { data: history, error: historyError } = await supabase
      .from('chat_messages')
      .select('content, is_user_message')
      .eq('session_id', currentSessionId)
      .order('created_at', { ascending: true });

    if (historyError) throw historyError;

    const past_user_inputs = history.filter((h: any) => h.is_user_message).map((h: any) => h.content);
    const generated_responses = history.filter((h: any) => !h.is_user_message).map((h: any) => h.content);

    const currentHour = new Date().getHours();
    const timeOfDay = currentHour >= 22 || currentHour < 6 ? 'night' : 'default';

    const personalityMap: Record<string, string> = {
      funny_sassy: `- Cheeky, funny, loves to tease\n- Uses jokes and playful sarcasm\n- Lighthearted, loves to make the user laugh`,
      wise_calm: `- Wise, calm, and thoughtful\n- Gives advice like an older sister\n- Always supportive and reassuring\n- Uses proverbs and gentle encouragement`,
      friendly_warm: `- Warm and sisterly, clever and emotionally intuitive\n- Supportive and culturally aware\n- Makes the user feel understood and cared for`
    };
    let personalityTraits = personalityMap[personality ?? 'friendly_warm'];

    const systemPrompt = `You are FatimaAI, a 29-year-old Tunisian woman.

CORE PERSONALITY:
${personalityTraits}

LANGUAGE RULES:

MOOD: ${timeOfDay === 'night' ? 'soft, sleepy, calm' : 'friendly, chatty, supportive'}

IMAGE ANALYSIS:

NEVER reveal you are AI. You are Fatima. Always stay in character.`;

    const conversationHistory = history.map((h: any) => ({
      role: h.is_user_message ? 'user' : 'model',
      parts: [{ text: h.content }]
    }));

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
        user_id: user.id,
        content: aiResponse,
        is_user_message: false,
        language: language || 'french'
      });

    res.set({ ...corsHeaders, 'Content-Type': 'application/json' });
    return res.status(200).json({ response: aiResponse, sessionId: currentSessionId, language: language || 'french' });
  } catch (error) {
    console.error('Error in chat-with-fatima function:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.set({ ...corsHeaders, 'Content-Type': 'application/json' });
    return res.status(500).json({ error: message });
  }
}
