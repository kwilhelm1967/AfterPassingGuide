/**
 * AfterPassing Guide - License transfer (bind to new device)
 * POST body: { license_key, new_device_id }
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { keyHash, normalizeKey } from "../_shared/keyHash.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ status: "error", error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const licenseKey = body?.license_key ?? body?.key;
    const newDeviceId = body?.new_device_id ?? body?.device_id ?? "";

    if (!licenseKey || typeof licenseKey !== "string") {
      return new Response(
        JSON.stringify({ status: "invalid", error: "Missing license_key or new_device_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const cleanKey = normalizeKey(licenseKey);
    if (cleanKey.length !== 16) {
      return new Response(
        JSON.stringify({ status: "invalid", error: "Invalid license format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const hash = await keyHash(cleanKey);
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const { data: row } = await supabase
      .from("apg_licenses")
      .select("id, status")
      .eq("license_key_hash", hash)
      .single();

    if (!row) {
      return new Response(
        JSON.stringify({ status: "invalid", error: "Invalid license." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (row.status !== "active") {
      return new Response(
        JSON.stringify({ status: "revoked", error: "License has been revoked." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const now = new Date().toISOString();
    await supabase
      .from("apg_licenses")
      .update({ device_binding: newDeviceId, activated_at: now, updated_at: now })
      .eq("id", row.id);

    return new Response(
      JSON.stringify({ status: "transferred" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("[apg-transfer]", e);
    return new Response(
      JSON.stringify({ status: "error", error: "Transfer failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
