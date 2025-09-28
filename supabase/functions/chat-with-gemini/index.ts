import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { query } = await req.json()

    if (!query) {
      return new Response(JSON.stringify({ error: "Missing query in request body" }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }
    
    if (!GEMINI_API_KEY) {
      return new Response(JSON.stringify({ error: "GEMINI_API_KEY is not set in Supabase secrets." }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts:[{
            text: `System: You are a helpful assistant that speaks and understands Tunisian Darija. Always respond in Tunisian Darija.

User: ${query}`
          }]
        }]
      })
    });

    const data = await res.json();

    // Log the full response from Gemini for debugging in Supabase logs
    console.log("Gemini API Response:", JSON.stringify(data, null, 2));

    // Check for API errors within the response body
    if (data.error) {
      console.error("Gemini API Error:", data.error.message);
      return new Response(JSON.stringify({ error: `Gemini API Error: ${data.error.message}` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }
    
    if (!data.candidates || data.candidates.length === 0) {
        const reason = data.promptFeedback?.blockReason || 'No content returned from API.';
        console.warn(`Gemini response missing candidates. Reason: ${reason}`);
        return new Response(JSON.stringify({ error: `Gemini did not return a response. Reason: ${reason}` }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        });
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error("Edge function error:", error);
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})