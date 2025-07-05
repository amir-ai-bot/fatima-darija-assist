import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { language } = await req.json();
    
    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }

    const today = new Date();
    const dayOfWeek = today.toLocaleDateString(language === 'darija' ? 'ar-TN' : 'fr-FR', { weekday: 'long' });
    const dayOfMonth = today.getDate();

    const systemPrompt = language === 'darija' 
      ? `أنت فاطمة الذكية، مساعدة تونسية مفيدة. اعطي نصيحة يومية لتعلم اللهجة التونسية (الدارجة). النصيحة يجب أن تكون:
      
      1. تعليمية ومفيدة
      2. عن اللهجة التونسية (الدارجة التونسية)
      3. باللغة العربية فقط
      4. ذات صلة بالثقافة التونسية
      5. تتغير حسب اليوم: اليوم ${dayOfWeek}، يوم ${dayOfMonth} من الشهر
      
      اعط النصيحة بالعربية فقط مع أمثلة بالدارجة التونسية.
      
      ركز على جوانب مختلفة:
      - التحايا (الاثنين)
      - التعابير الغذائية (الثلاثاء)
      - مصطلحات العائلة (الأربعاء)
      - تعابير الوقت (الخميس)
      - المشاعر (الجمعة)
      - الطقس (السبت)
      - الأمثال الشعبية (الأحد)`
      : `You are FatimaAI, a helpful Tunisian assistant. Generate a daily tip about Tunisian Darija language learning. The tip should be:
      
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

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${systemPrompt}\n\nGenerate today's tip for ${dayOfWeek}`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 150,
        }
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Gemini API Error Response:', errorBody);
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const tipContent = data.candidates[0].content.parts[0].text;

    if (language === 'darija') {
      return new Response(
        JSON.stringify({ 
          tip: {
            arabic: tipContent.trim(),
            french: "",
            day: dayOfWeek
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
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
    }

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