-- Row Level Security: only service role (Edge Functions) can access these tables.
-- anon/authenticated get no access; service_role bypasses RLS.

ALTER TABLE apg_licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE apg_webhook_log ENABLE ROW LEVEL SECURITY;

-- No policies for anon/authenticated = no API access. Edge Functions use service_role and bypass RLS.
