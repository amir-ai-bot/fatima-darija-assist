import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "std/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const mistralApiKey = Deno.env.get('MISTRAL_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!mistralApiKey) {
      throw new Error('Mistral API key not configured');
    }

    const today = new Date();
    const dayOfWeek = today.toLocaleDateString('fr-FR', { weekday: 'long' });
    const dayOfMonth = today.getDate();

    const systemPrompt = `You are FatimaAI, a helpful Tunisian assistant. Generate a daily tip about Tunisian Darija language learning. The tip should be:
    
    1. Educational and practical
    2. About Tunisian Darija (Tunisian Arabic dialect)
    3. Include both the phrase in Arabic and French translation
    4. Be culturally relevant to Tunisia
    5. Change based on the day: Today is ${dayOfWeek}, day ${dayOfMonth} of the month
    
    Format your response as:
    French explanation (1-2 sentences)
    Arabic phrase in quotes
    
    Make it different each day by focusing on different aspects like:
    - Greetings (Monday)
    - Food expressions (Tuesday) 
    - Family terms (Wednesday)
    - Time expressions (Thursday)
    - Emotions (Friday)
    - Weather (Saturday)
    - Common sayings (Sunday)`;

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
          { role: 'user', content: `Generate today's tip for ${dayOfWeek}` }
        ],
        temperature: 0.7,
        max_tokens: 150,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Mistral API Error Response:', errorBody);
      throw new Error(`Mistral API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const tipContent = data.choices[0].message.content;

    // Parse the response to extract French and Arabic parts
    const lines = tipContent.split('\n').filter(line => line.trim());
    const frenchPart = lines.find(line => !line.includes('"') && line.trim().length > 10) || lines[0];
    const arabicPart = lines.find(line => line.includes('"')) || '"مرحبا بيك"';

    return new Response(
      JSON.stringify({ 
        tip: {
          french: frenchPart,
          arabic: arabicPart.replace(/"/g, ''),
          day: dayOfWeek
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in daily-tip function:', error);
    
    // Fallback tip
    const fallbackTips = [
      { french: "Pour dire 'Bonjour' en darija tunisien :", arabic: "أهلا وسهلا" },
      { french: "Pour dire 'Comment ça va ?' en darija :", arabic: "كيفاش الصحة؟" },
      { french: "Pour dire 'Merci beaucoup' :", arabic: "بارك الله فيك" },
    ];
    
    const randomTip = fallbackTips[Math.floor(Math.random() * fallbackTips.length)];
    
    return new Response(
      JSON.stringify({ tip: { ...randomTip, day: new Date().toLocaleDateString('fr-FR', { weekday: 'long' }) } }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});