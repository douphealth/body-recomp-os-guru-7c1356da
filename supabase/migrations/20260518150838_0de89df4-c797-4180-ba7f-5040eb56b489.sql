-- 1. Idempotency: a given drip template can only be logged once per contact.
-- Existing duplicates (if any) are de-duplicated first.
DELETE FROM public.email_drip_log a
USING public.email_drip_log b
WHERE a.id > b.id
  AND a.contact_email = b.contact_email
  AND a.template_id   = b.template_id;

CREATE UNIQUE INDEX IF NOT EXISTS uq_email_drip_log_contact_template
  ON public.email_drip_log (contact_email, template_id);

CREATE INDEX IF NOT EXISTS idx_email_engagement_events_email_event_time
  ON public.email_engagement_events (contact_email, event, occurred_at DESC);

-- 2. Rate-limit table (backend-only).
CREATE TABLE IF NOT EXISTS public.rate_limits (
  bucket text NOT NULL,
  key text NOT NULL,
  window_start timestamptz NOT NULL DEFAULT date_trunc('minute', now()),
  hits integer NOT NULL DEFAULT 0,
  PRIMARY KEY (bucket, key, window_start)
);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "deny_all_rate_limits"
  ON public.rate_limits
  FOR ALL TO anon, authenticated
  USING (false) WITH CHECK (false);

CREATE INDEX IF NOT EXISTS idx_rate_limits_window
  ON public.rate_limits (window_start);

-- 3. Atomic limiter. Returns true if the call is within budget, false if blocked.
CREATE OR REPLACE FUNCTION public.consume_rate_limit(
  p_bucket text,
  p_key text,
  p_limit integer DEFAULT 10,
  p_window_seconds integer DEFAULT 60
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_window timestamptz := date_trunc('minute', now());
  v_hits integer;
BEGIN
  INSERT INTO public.rate_limits (bucket, key, window_start, hits)
  VALUES (p_bucket, p_key, v_window, 1)
  ON CONFLICT (bucket, key, window_start)
  DO UPDATE SET hits = public.rate_limits.hits + 1
  RETURNING hits INTO v_hits;

  -- Opportunistic cleanup of old rows.
  DELETE FROM public.rate_limits
  WHERE window_start < now() - interval '1 hour';

  RETURN v_hits <= p_limit;
END;
$$;

REVOKE ALL ON FUNCTION public.consume_rate_limit(text, text, integer, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.consume_rate_limit(text, text, integer, integer) TO service_role;