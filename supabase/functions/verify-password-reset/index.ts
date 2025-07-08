import { serve } from "std/http/server.ts";
import { createClient } from "@supabase/supabase-js";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { email, token, password } = await req.json();
    if (!email || !token || !password) {
      throw new Error("Email, token, and password are required");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data, error } = await supabase
      .from('password_reset_tokens')
      .select('*')
      .eq('user_email', email)
      .eq('token', token)
      .single();

    if (error || !data) {
      throw new Error("Invalid token or email.");
    }

    if (new Date(data.expires_at) < new Date()) {
      throw new Error("Token has expired.");
    }

    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) throw listError;
    
    const user = users.find(u => u.email === email);
    if (!user) {
        throw new Error("User not found.");
    }

    const { error: updateError } = await supabase.auth.admin.updateUserById(
        user.id,
        { password }
    );

    if (updateError) {
      throw updateError;
    }

    await supabase
      .from('password_reset_tokens')
      .delete()
      .eq('id', data.id);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});