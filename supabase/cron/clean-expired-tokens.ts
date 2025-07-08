import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

async function cleanup() {
  const { error } = await supabase
    .from("password_reset_tokens")
    .delete()
    .lt("expires_at", new Date().toISOString());

  if (error) {
    console.error("Error cleaning up expired tokens:", error);
  } else {
    console.log("Cleaned up expired tokens.");
  }
}

cleanup();