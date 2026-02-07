/**
 * AfterPassing Guide - Grant license from partner (e.g. LLV Family purchase)
 *
 * POST with X-Partner-Secret (or Authorization: Bearer <secret>).
 * Body: { email (required), customer_name?, source? }
 * Creates one APG license and optionally sends "included with partner" email.
 *
 * Required secrets: APG_PARTNER_SECRET, SUPABASE_SERVICE_ROLE_KEY
 * Optional: BREVO_API_KEY, FROM_EMAIL, SUPABASE_ANON_KEY (for invoking apg-send-email)
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { keyHashAndLast4 } from "../_shared/keyHash.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-partner-secret",
};

function generateLicenseKey(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  let result = "";
  for (let i = 0; i < 16; i++) result += chars[array[i] % chars.length];
  return result;
}

function formatLicenseKey(key: string): string {
  if (key.length !== 16) return key;
  return `${key.slice(0, 4)}-${key.slice(4, 8)}-${key.slice(8, 12)}-${key.slice(12, 16)}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const partnerSecret = Deno.env.get("APG_PARTNER_SECRET");
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  if (!partnerSecret || !supabaseKey) {
    console.error("[apg-grant-license] Missing APG_PARTNER_SECRET or SUPABASE_SERVICE_ROLE_KEY");
    return new Response(JSON.stringify({ error: "Server config error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const authHeader = req.headers.get("authorization");
  const partnerHeader = req.headers.get("x-partner-secret");
  const token = partnerHeader || (authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null);
  if (!token || token !== partnerSecret) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let body: { email?: string; customer_name?: string; source?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  if (!email) {
    return new Response(JSON.stringify({ error: "Missing email" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const customerName = typeof body.customer_name === "string" ? body.customer_name.trim() || null : null;
  const source = typeof body.source === "string" ? body.source.trim() : "partner";

  const supabase = createClient(supabaseUrl, supabaseKey);

  let licenseKey = "";
  let keyHash = "";
  let keyLast4 = "";
  for (let attempt = 0; attempt < 10; attempt++) {
    licenseKey = generateLicenseKey();
    const out = await keyHashAndLast4(licenseKey);
    keyHash = out.hash;
    keyLast4 = out.last4;
    const { data: existing } = await supabase.from("apg_licenses").select("id").eq("license_key_hash", keyHash).single();
    if (!existing) break;
  }

  const now = new Date().toISOString();
  const { error: insertErr } = await supabase.from("apg_licenses").insert({
    license_key_hash: keyHash,
    key_last4: keyLast4,
    email,
    customer_name: customerName,
    stripe_session_id: null,
    stripe_customer_id: null,
    stripe_payment_intent_id: null,
    plan_type: "aftercare_single",
    status: "active",
    created_at: now,
    updated_at: now,
  });

  if (insertErr) {
    console.error("[apg-grant-license] License insert failed:", insertErr);
    return new Response(JSON.stringify({ error: "Failed to create license" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const brevoApiKey = Deno.env.get("BREVO_API_KEY");
  if (brevoApiKey) {
    try {
      const sendEmailUrl = `${supabaseUrl}/functions/v1/apg-send-email`;
      const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
      await fetch(sendEmailUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${anonKey}` },
        body: JSON.stringify({
          toEmail: email,
          toName: customerName || email.split("@")[0],
          templateName: "purchase-confirmation",
          subject: source === "llv_family"
            ? "Your AfterPassing Guide License (Included with Local Legacy Vault Family)"
            : "Your AfterPassing Guide License",
          params: {
            customer_name: customerName?.split(" ")[0] || email.split("@")[0],
            license_key: formatLicenseKey(licenseKey),
            plan_type: "AfterPassing Guide",
            current_year: new Date().getFullYear().toString(),
          },
        }),
      });
    } catch (e) {
      console.error("[apg-grant-license] Send email failed:", e);
    }
  }

  console.log(`[apg-grant-license] License created (last4: ****-****-****-${keyLast4}) for ${email} source=${source}`);

  return new Response(
    JSON.stringify({ success: true, key_last4: keyLast4 }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
