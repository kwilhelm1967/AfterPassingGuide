/**
 * AfterPassing Guide - Send email via Brevo (templates from local ./templates/)
 * POST: { toEmail, toName?, subject, templateName, params }
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function replacePlaceholders(html: string, params: Record<string, any>): string {
  let out = html;
  if (!params.current_year) params.current_year = new Date().getFullYear().toString();
  for (const [k, v] of Object.entries(params)) {
    const re = new RegExp(`\\{\\{${k}\\}\\}`, "g");
    out = out.replace(re, v != null ? String(v) : "");
  }
  return out;
}

async function loadTemplate(name: string): Promise<string> {
  const path = new URL(`./templates/${name}.html`, import.meta.url);
  return await Deno.readTextFile(path);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const { toEmail, toName, subject, templateName, params = {} } = body;
    if (!toEmail || !templateName) {
      return new Response(JSON.stringify({ error: "Missing toEmail or templateName" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const html = replacePlaceholders(await loadTemplate(templateName), params);
    const subj = subject || "AfterPassing Guide";
    const brevoKey = Deno.env.get("BREVO_API_KEY");
    const fromEmail = Deno.env.get("FROM_EMAIL") || "noreply@afterpassingguide.com";
    if (!brevoKey) {
      return new Response(JSON.stringify({ error: "BREVO_API_KEY not set" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "Accept": "application/json", "Content-Type": "application/json", "api-key": brevoKey },
      body: JSON.stringify({
        sender: { email: fromEmail, name: "AfterPassing Guide" },
        to: [{ email: toEmail, name: toName || "" }],
        subject: subj,
        htmlContent: html,
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return new Response(JSON.stringify({ error: "Brevo error", details: data }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ ok: true, messageId: data.messageId }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[apg-send-email]", e);
    return new Response(JSON.stringify({ error: "Send failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
