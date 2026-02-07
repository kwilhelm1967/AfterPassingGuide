/**
 * AfterPassing Guide - Stripe webhook
 * On checkout.session.completed (paid): create license (hash-only), send purchase email with license.
 * Required secrets: STRIPE_WEBHOOK_SECRET, SUPABASE_SERVICE_ROLE_KEY, BREVO_API_KEY, FROM_EMAIL
 * Optional: STRIPE_APG_PRICE_ID (comma-separated) - only process these price IDs; if unset, process all.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { keyHashAndLast4 } from "../_shared/keyHash.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
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

async function verifyStripeSignature(
  rawBody: ArrayBuffer,
  signatureHeader: string,
  secret: string
): Promise<{ valid: boolean; event?: any }> {
  try {
    const parts: Record<string, string> = {};
    for (const part of signatureHeader.split(",")) {
      const [k, v] = part.split("=");
      if (k && v) parts[k.trim()] = v.trim();
    }
    const t = parts["t"];
    const v1 = signatureHeader.split(",").find((p) => p.trim().startsWith("v1="))?.split("=")[1]?.trim();
    if (!t || !v1) return { valid: false };
    const bodyStr = new TextDecoder().decode(rawBody);
    const message = `${t}.${bodyStr}`;
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
    const hex = Array.from(new Uint8Array(sig))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    if (hex.toLowerCase() !== v1.toLowerCase()) return { valid: false };
    return { valid: true, event: JSON.parse(bodyStr) };
  } catch {
    return { valid: false };
  }
}

async function logWebhook(supabase: any, success: boolean, eventType?: string) {
  try {
    await supabase.from("apg_webhook_log").insert({ source: "stripe", event_type: eventType, success });
  } catch (_) {}
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const brevoApiKey = Deno.env.get("BREVO_API_KEY");
  const fromEmail = Deno.env.get("FROM_EMAIL") || "noreply@afterpassingguide.com";
  const apgPriceIds = (Deno.env.get("STRIPE_APG_PRICE_ID") || "").split(",").map((s) => s.trim()).filter(Boolean);

  if (!webhookSecret || !supabaseKey) {
    console.error("[apg-webhook] Missing STRIPE_WEBHOOK_SECRET or SUPABASE_SERVICE_ROLE_KEY");
    return new Response(JSON.stringify({ error: "Server config error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return new Response(JSON.stringify({ error: "No signature" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const rawBody = await req.arrayBuffer();
  const { valid, event } = await verifyStripeSignature(rawBody, signature, webhookSecret);
  if (!valid || !event) {
    const supabase = createClient(supabaseUrl, supabaseKey);
    await logWebhook(supabase, false, "signature_failed");
    return new Response(JSON.stringify({ error: "Invalid signature" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  if (event.type !== "checkout.session.completed") {
    await logWebhook(supabase, true, event.type);
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const session = event.data.object as any;
  if (session.payment_status !== "paid") {
    await logWebhook(supabase, true, event.type);
    return new Response(JSON.stringify({ received: true, status: "payment_pending" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const priceId = session.line_items?.data?.[0]?.price?.id ?? session.line_items?.data?.[0]?.price_id;
  if (apgPriceIds.length > 0 && priceId && !apgPriceIds.includes(priceId)) {
    await logWebhook(supabase, true, event.type);
    return new Response(JSON.stringify({ received: true, skipped: "not_apg_price" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const customerEmail = session.customer_details?.email || session.customer_email;
  const customerName = session.customer_details?.name || null;
  if (!customerEmail) {
    await logWebhook(supabase, false, event.type);
    return new Response(JSON.stringify({ error: "No customer email" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

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
    email: customerEmail,
    customer_name: customerName,
    stripe_session_id: session.id,
    stripe_customer_id: session.customer ?? null,
    stripe_payment_intent_id: session.payment_intent ?? null,
    plan_type: session.metadata?.plan_type || "aftercare_single",
    status: "active",
    created_at: now,
    updated_at: now,
  });

  if (insertErr) {
    console.error("[apg-webhook] License insert failed:", insertErr);
    await logWebhook(supabase, false, event.type);
    return new Response(JSON.stringify({ error: "Failed to create license" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (brevoApiKey) {
    try {
      const sendEmailUrl = `${supabaseUrl}/functions/v1/apg-send-email`;
      const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
      await fetch(sendEmailUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${anonKey}` },
        body: JSON.stringify({
          toEmail: customerEmail,
          toName: customerName || customerEmail.split("@")[0],
          templateName: "purchase-confirmation",
          subject: "Your AfterPassing Guide License",
          params: {
            customer_name: customerName?.split(" ")[0] || customerEmail.split("@")[0],
            license_key: formatLicenseKey(licenseKey),
            plan_type: "AfterPassing Guide",
            current_year: new Date().getFullYear().toString(),
          },
        }),
      });
    } catch (e) {
      console.error("[apg-webhook] Send email failed:", e);
    }
  }

  await logWebhook(supabase, true, event.type);

  console.log(`[WEBHOOK] License created (last4: ****-****-****-${keyLast4}) for ${customerEmail}`);
  console.log(`[WEBHOOK] Returning 200 OK response`);

  return new Response(
    JSON.stringify({
      received: true,
      license_key: formatLicenseKey(licenseKey),
      session_id: session.id,
    }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
});
