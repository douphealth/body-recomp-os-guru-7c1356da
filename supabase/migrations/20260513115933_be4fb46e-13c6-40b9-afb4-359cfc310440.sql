
-- Enable required extensions for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Suppression list (DB-side source of truth, complementing Brevo blacklist)
CREATE TABLE IF NOT EXISTS public.email_suppressions (
  id BIGSERIAL PRIMARY KEY,
  contact_email TEXT NOT NULL UNIQUE,
  reason TEXT NOT NULL DEFAULT 'unsubscribed',
  source TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_email_suppressions_email ON public.email_suppressions(contact_email);

ALTER TABLE public.email_suppressions ENABLE ROW LEVEL SECURITY;

-- Deny-all policies: only service_role (which bypasses RLS) can access.
-- Authenticated/anon users get NOTHING. This satisfies linter and is enterprise-correct.
DROP POLICY IF EXISTS "deny_all_email_drip_log" ON public.email_drip_log;
CREATE POLICY "deny_all_email_drip_log" ON public.email_drip_log
  FOR ALL TO authenticated, anon USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "deny_all_email_engagement_events" ON public.email_engagement_events;
CREATE POLICY "deny_all_email_engagement_events" ON public.email_engagement_events
  FOR ALL TO authenticated, anon USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "deny_all_email_suppressions" ON public.email_suppressions;
CREATE POLICY "deny_all_email_suppressions" ON public.email_suppressions
  FOR ALL TO authenticated, anon USING (false) WITH CHECK (false);

-- Aggregated engagement view for analytics (server-side only via service role)
CREATE OR REPLACE VIEW public.email_lead_engagement AS
SELECT
  l.contact_email,
  COUNT(*) FILTER (WHERE l.status = 'sent') AS emails_sent,
  COUNT(DISTINCT l.template_id) FILTER (WHERE l.status = 'sent') AS unique_templates,
  MAX(l.sent_at) AS last_sent_at,
  COALESCE(e.opens, 0) AS opens,
  COALESCE(e.clicks, 0) AS clicks,
  e.last_event_at
FROM public.email_drip_log l
LEFT JOIN (
  SELECT contact_email,
    COUNT(*) FILTER (WHERE event IN ('opened','unique_opened')) AS opens,
    COUNT(*) FILTER (WHERE event IN ('click','clicked')) AS clicks,
    MAX(occurred_at) AS last_event_at
  FROM public.email_engagement_events
  GROUP BY contact_email
) e ON e.contact_email = l.contact_email
GROUP BY l.contact_email, e.opens, e.clicks, e.last_event_at;

REVOKE ALL ON public.email_lead_engagement FROM anon, authenticated;
