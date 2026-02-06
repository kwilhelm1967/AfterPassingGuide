/**
 * AfterPassing Guide - License activation
 * POST body: { license_key, device_id, product?: "AFTERCARE_ASSISTANT" }
 * Response: { status: "activated" | "device_mismatch" | "invalid" | "revoked" | "error", plan_type?, error? }
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
    const deviceId = body?.device_id ?? body?.device_binding ?? "";

    if (!licenseKey || typeof licenseKey !== "string") {
      return new Response(
        JSON.stringify({ status: "invalid", error: "Missing license_key" }),
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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: row, error: fetchError } = await supabase
      .from("apg_licenses")
      .select("id, status, device_binding, activated_at, plan_type")
      .eq("license_key_hash", hash)
      .single();

    if (fetchError || !row) {
      return new Response(
        JSON.stringify({ status: "invalid", error: "This is not a valid license." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (row.status !== "active") {
      return new Response(
        JSON.stringify({ status: "revoked", error: "This license has been revoked." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const now = new Date().toISOString();

    if (!row.device_binding) {
      await supabase
        .from("apg_licenses")
        .update({
          device_binding: deviceId,
          activated_at: now,
          updated_at: now,
        })
        .eq("id", row.id);
      return new Response(
        JSON.stringify({ status: "activated", plan_type: row.plan_type ?? "aftercare_single" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (row.device_binding === deviceId) {
      return new Response(
        JSON.stringify({ status: "activated", plan_type: row.plan_type ?? "aftercare_single" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        status: "device_mismatch",
        error: "This license is active on another device. Transfer required.",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("[apg-activate]", e);
    return new Response(
      JSON.stringify({ status: "error", error: "Activation failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
