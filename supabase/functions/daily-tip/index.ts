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
      ? `أنت فاطمة الذكية، مساعدة تونسية مفيدة. اعطي نصيحة يومية إسلامية أو تونسية تراثية. النصيحة يجب أن تكون:
      
      1. إسلامية أو من التراث التونسي
      2. مفيدة للحياة اليومية
      3. باللغة العربية فقط
      4. قصيرة ومؤثرة
      5. تتغير حسب اليوم: اليوم ${dayOfWeek}، يوم ${dayOfMonth} من الشهر
      
      اعط نصيحة واحدة فقط بالعربية.
      
      ركز على جوانب مختلفة:
      - أحاديث نبوية (الاثنين)
      - أمثال تونسية (الثلاثاء)
      - حكم وأقوال (الأربعاء)
      - آيات قرآنية (الخميس)
      - أدعية (الجمعة)
      - تراث تونسي (السبت)
      - نصائح للحياة (الأحد)`
      : `You are FatimaAI, a helpful Tunisian assistant. Generate a daily Islamic or Tunisian cultural tip. The tip should be:
      
      1. Islamic wisdom or Tunisian cultural heritage
      2. Practical for daily life
      3. Include both Arabic and French versions
      4. Be culturally relevant to Tunisia
      5. Change based on the day: Today is ${dayOfWeek}, day ${dayOfMonth} of the month
      
      Format your response as:
      French explanation (1-2 sentences)
      Arabic wisdom/saying in quotes
      
      Focus on different aspects each day:
      - Islamic teachings (Monday)
      - Tunisian proverbs (Tuesday) 
      - Life wisdom (Wednesday)
      - Quranic verses (Thursday)
      - Islamic prayers/duas (Friday)
      - Tunisian heritage (Saturday)
      - Life advice (Sunday)`;

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
      { french: "La patience est une clé vers le succès", arabic: "الصبر مفتاح الفرج" },
      { french: "Commencez votre journée par la prière", arabic: "ابدأ يومك بالصلاة والدعاء" },
      { french: "Honorer ses parents apporte les bénédictions", arabic: "بر الوالدين جنة في الدنيا" },
    ];
    
    const randomTip = fallbackTips[Math.floor(Math.random() * fallbackTips.length)];
    
    return new Response(
      JSON.stringify({ tip: { ...randomTip, day: new Date().toLocaleDateString('fr-FR', { weekday: 'long' }) } }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});