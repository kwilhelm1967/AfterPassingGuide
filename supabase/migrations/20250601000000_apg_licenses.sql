-- AfterPassing Guide: licenses table (hash-only, no plaintext keys)
-- Product identifier: AFTERCARE_ASSISTANT / AfterPassing Guide

CREATE TABLE IF NOT EXISTS apg_licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  license_key_hash TEXT NOT NULL UNIQUE,
  key_last4 TEXT NOT NULL,
  email TEXT NOT NULL,
  customer_name TEXT,
  stripe_session_id TEXT,
  stripe_customer_id TEXT,
  stripe_payment_intent_id TEXT,
  plan_type TEXT DEFAULT 'aftercare_single',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked', 'replaced')),
  device_binding TEXT,
  activated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_apg_licenses_email ON apg_licenses(email);
CREATE INDEX IF NOT EXISTS idx_apg_licenses_hash ON apg_licenses(license_key_hash);
CREATE INDEX IF NOT EXISTS idx_apg_licenses_stripe_session ON apg_licenses(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_apg_licenses_created ON apg_licenses(created_at DESC);

COMMENT ON TABLE apg_licenses IS 'AfterPassing Guide paid licenses; key stored as hash only.';
