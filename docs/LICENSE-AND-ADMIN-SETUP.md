# License Model, Emails, and Admin Portal

This doc describes how to provide users with a license when they purchase, the follow-up emails, and the admin portal.

## Overview

- **Purchase flow**: Stripe Checkout → webhook `apg-stripe-webhook` creates a license (hash-only in DB), sends **purchase confirmation email** with the license.
- **Activation**: App calls `apg-activate` with license + device id; one device per license.
- **Transfer**: App calls `apg-transfer` to bind the license to a new device.
- **Admin**: Visit `/admin`, enter admin secret → list licenses, revoke.

## 1. Supabase setup

**Full step-by-step:** See **[SUPABASE-SETUP.md](./SUPABASE-SETUP.md)** for creating the project, linking, migrations, secrets, and deploying functions.

Summary:

1. Create a Supabase project and run `supabase link --project-ref YOUR_REF`.
2. Run migrations: `supabase db push` (or run the SQL in `supabase/migrations/` manually in SQL Editor).
3. Set Edge Function secrets in Dashboard (see SUPABASE-SETUP.md).
4. Deploy Edge Functions: `supabase functions deploy` (or deploy each: apg-activate, apg-transfer, apg-stripe-webhook, apg-send-email, admin-licenses-list, admin-license-actions).
5. Configure the app: copy `.env.example` to `.env` and set `VITE_SUPABASE_URL`, `VITE_APG_ACTIVATE_URL`, `VITE_APG_TRANSFER_URL`.

## 2. Secrets (Supabase Dashboard → Project Settings → Edge Functions → Secrets)

| Secret | Description |
|--------|-------------|
| `SUPABASE_URL` | Auto-set. Your project URL. |
| `SUPABASE_SERVICE_ROLE_KEY` | Auto-set. |
| `SUPABASE_ANON_KEY` | Auto-set. |
| `STRIPE_WEBHOOK_SECRET` | From Stripe: Webhooks → your endpoint → Signing secret (whsec_...). |
| `STRIPE_APG_PRICE_ID` | (Optional) Comma-separated Stripe Price IDs for APG. If set, only these trigger license creation. |
| `BREVO_API_KEY` | Brevo (Sendinblue) API key for sending emails. |
| `FROM_EMAIL` | Sender email (e.g. noreply@afterpassingguide.com). Must be verified in Brevo. |
| `APG_ADMIN_SECRET` | Long random string; admin users enter this at `/admin` to view/revoke licenses. |

## 3. Stripe

1. Create a Product (e.g. "AfterPassing Guide") and Price (one-time).
2. Create a Webhook endpoint: `https://YOUR_SUPABASE_REF.supabase.co/functions/v1/apg-stripe-webhook`
   - Event: `checkout.session.completed`
   - Copy the Signing secret into `STRIPE_WEBHOOK_SECRET`.
3. (Optional) Set `STRIPE_APG_PRICE_ID` to your Price ID(s) so only APG purchases create licenses.

## 4. App env (.env or build env)

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Supabase project URL (e.g. https://xxx.supabase.co). Required for admin portal. |
| `VITE_APG_ACTIVATE_URL` | Full URL to activate function (e.g. https://xxx.supabase.co/functions/v1/apg-activate). If set, app uses this instead of default license server. |
| `VITE_APG_TRANSFER_URL` | Full URL to transfer function (e.g. https://xxx.supabase.co/functions/v1/apg-transfer). |

If you use only Supabase for licensing, set both `VITE_APG_ACTIVATE_URL` and `VITE_APG_TRANSFER_URL`. You can leave `VITE_LICENSE_SERVER_URL` unset when using these.

## 5. Emails

Templates live in `supabase/functions/apg-send-email/templates/`:

- **purchase-confirmation.html** – Sent after payment. Placeholders: `{{customer_name}}`, `{{license_key}}`, `{{plan_type}}`, `{{current_year}}`.
- **trial-welcome.html** – Optional welcome email template (no trial; AfterPassing Guide is license-only).

The webhook calls `apg-send-email` with `templateName: "purchase-confirmation"` and the same params. No need to store the raw license anywhere except in the one-time email.

## 6. Admin portal

- URL: your app origin + `/admin` (e.g. https://yourapp.com/admin).
- Login: user enters the same value as `APG_ADMIN_SECRET`.
- Actions: list licenses (email, key last 4, status, created, activated), revoke license.
- Resend license email: not supported (license codes are not stored; only hash). To “resend” you’d need to issue a new license (manual process or separate tool).

## 7. Flow summary

1. User purchases on your site (Stripe Checkout).
2. Stripe sends `checkout.session.completed` to `apg-stripe-webhook`.
3. Webhook generates a 16-char license, stores only its hash + last4 in `apg_licenses`, sends purchase-confirmation email (with the plain license) via `apg-send-email` (Brevo).
4. User enters the license in the app; app calls `apg-activate` with license + device id; license is bound to that device.
5. Admin uses `/admin` with `APG_ADMIN_SECRET` to list and revoke licenses.
