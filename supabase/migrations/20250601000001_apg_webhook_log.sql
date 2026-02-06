-- Webhook log for Stripe (debugging / admin)
CREATE TABLE IF NOT EXISTS apg_webhook_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL DEFAULT 'stripe',
  event_type TEXT,
  success BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_apg_webhook_log_created ON apg_webhook_log(created_at DESC);
