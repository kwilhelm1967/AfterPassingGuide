/**
 * Admin: list APG licenses (requires X-Admin-Secret header)
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-secret",
};

function checkAdmin(req: Request): boolean {
  const secret = Deno.env.get("APG_ADMIN_SECRET");
  const header = req.headers.get("x-admin-secret");
  return !!secret && secret === header;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (!checkAdmin(req)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data, error } = await supabase
      .from("apg_licenses")
      .select("id, key_last4, email, customer_name, status, activated_at, created_at, stripe_session_id")
      .order("created_at", { ascending: false })
      .limit(500);

    if (error) throw error;
    return new Response(JSON.stringify({ licenses: data || [] }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Failed to list licenses" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
