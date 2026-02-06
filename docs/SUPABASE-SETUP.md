# Supabase setup for AfterPassing Guide

Use this when you want **license activation**, **purchase emails**, and the **admin portal** to run on Supabase (no separate license server).

## Prerequisites

- [Supabase CLI](https://supabase.com/docs/guides/cli) installed (`npm i -g supabase` or download).
- A Supabase account ([supabase.com](https://supabase.com)).

---

## 1. Create and link the project

1. In [Supabase Dashboard](https://app.supabase.com), create a new project (or use an existing one).
2. Note your **Project ref** (Settings → General → Reference ID) and **API URL** (Settings → API → Project URL).
3. In this repo, link the project:

   ```bash
   cd path/to/AfterPassingGuide
   supabase link --project-ref YOUR_PROJECT_REF
   ```

   When prompted, enter your database password.

---

## 2. Run migrations

Apply the database schema (licenses table, webhook log, RLS):

```bash
supabase db push
```

Or run the SQL manually: open **SQL Editor** in the Dashboard and run, in order:

- `supabase/migrations/20250601000000_apg_licenses.sql`
- `supabase/migrations/20250601000001_apg_webhook_log.sql`
- `supabase/migrations/20250601000002_apg_rls.sql`

---

## 3. Set Edge Function secrets

In Dashboard: **Project Settings → Edge Functions → Secrets**. Add:

| Secret | Description |
|--------|-------------|
| `SUPABASE_URL` | Auto-set; your Project URL. |
| `SUPABASE_SERVICE_ROLE_KEY` | Auto-set. |
| `APG_ADMIN_SECRET` | **You set this.** Long random string; used to log in at `/admin`. |
| `STRIPE_WEBHOOK_SECRET` | From Stripe (Webhooks → your endpoint → Signing secret). Only if using Stripe. |
| `STRIPE_APG_PRICE_ID` | (Optional) Stripe Price ID(s), comma-separated. If set, only these create licenses. |
| `BREVO_API_KEY` | Brevo (Sendinblue) API key for sending purchase emails. |
| `FROM_EMAIL` | Sender email (e.g. `noreply@afterpassingguide.com`). Must be verified in Brevo. |

---

## 4. Deploy Edge Functions

From the repo root:

```bash
supabase functions deploy apg-activate
supabase functions deploy apg-transfer
supabase functions deploy apg-stripe-webhook
supabase functions deploy apg-send-email
supabase functions deploy admin-licenses-list
supabase functions deploy admin-license-actions
```

Or deploy all at once:

```bash
supabase functions deploy
```

---

## 5. Configure the app

1. Copy the example env file and set your Supabase project URL and function URLs:

   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and replace `YOUR_PROJECT_REF` with your actual project ref:

   ```env
   VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
   VITE_APG_ACTIVATE_URL=https://YOUR_PROJECT_REF.supabase.co/functions/v1/apg-activate
   VITE_APG_TRANSFER_URL=https://YOUR_PROJECT_REF.supabase.co/functions/v1/apg-transfer
   ```

3. Restart the dev server so Vite picks up the env vars. The app will use these URLs for activation/transfer and the admin portal at `/admin`.

---

## 6. (Optional) Stripe webhook

If you use Stripe for purchases:

1. In Stripe: **Developers → Webhooks → Add endpoint**.
2. URL: `https://YOUR_PROJECT_REF.supabase.co/functions/v1/apg-stripe-webhook`
3. Event: `checkout.session.completed`.
4. Copy the **Signing secret** into the Supabase secret `STRIPE_WEBHOOK_SECRET`.

See [LICENSE-AND-ADMIN-SETUP.md](./LICENSE-AND-ADMIN-SETUP.md) for the full purchase → email → activation flow.

---

## Quick check

- **Activation:** App calls `apg-activate` with license + device id; one device per license.
- **Admin:** Open `https://your-app-origin/admin`, enter the value of `APG_ADMIN_SECRET`; you should see the license list.
- **Emails:** After a Stripe purchase, `apg-stripe-webhook` creates the license and triggers `apg-send-email` with the purchase-confirmation template.
