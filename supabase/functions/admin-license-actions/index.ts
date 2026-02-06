/**
 * Admin: revoke license or resend purchase email (requires X-Admin-Secret).
 * POST body: { action: "revoke" | "resend", license_id: string }
 * For resend we need the license - we don't store plaintext, so resend sends a generic
 * "your license (ending ****-XXXX)" note or we skip resend and only support revoke.
 * Actually: resend would require having the license. We only have hash. So we support revoke only,
 * or we add a "resend_instructions" that sends an email saying "contact support with your email to get a new license" - not ideal.
 * Best: document that "resend" is not possible without storing license codes (we don't). Admin can revoke and tell customer to contact support for a new license. So only revoke for now.
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
  if (req.method !== "POST" || !checkAdmin(req)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const { action, license_id } = body || {};
    if (!license_id) {
      return new Response(JSON.stringify({ error: "Missing license_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    if (action === "revoke") {
      const { error } = await supabase
        .from("apg_licenses")
        .update({ status: "revoked", updated_at: new Date().toISOString() })
        .eq("id", license_id);
      if (error) throw error;
      return new Response(JSON.stringify({ ok: true, message: "License revoked" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action. Use revoke." }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Action failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
