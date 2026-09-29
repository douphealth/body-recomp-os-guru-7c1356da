-- Stripe-backed Pro entitlements. Service-role only; public clients never read or write these tables directly.
CREATE TABLE IF NOT EXISTS public.plan_entitlements (
  plan_token UUID PRIMARY KEY REFERENCES public.plans(share_token) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'inactive',
  payment_mode TEXT CHECK (payment_mode IN ('payment', 'subscription')),
  stripe_customer_id TEXT,
  stripe_checkout_session_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_payment_intent_id TEXT,
  stripe_price_id TEXT,
  access_expires_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_plan_entitlements_customer
  ON public.plan_entitlements(stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_plan_entitlements_status
  ON public.plan_entitlements(status);

ALTER TABLE public.plan_entitlements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS deny_all_plan_entitlements ON public.plan_entitlements;
CREATE POLICY deny_all_plan_entitlements ON public.plan_entitlements
  FOR ALL TO anon, authenticated
  USING (false) WITH CHECK (false);

CREATE TABLE IF NOT EXISTS public.stripe_webhook_events (
  event_id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  livemode BOOLEAN NOT NULL DEFAULT false,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ,
  last_error TEXT
);

CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_received
  ON public.stripe_webhook_events(received_at DESC);
CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_pending
  ON public.stripe_webhook_events(received_at)
  WHERE processed_at IS NULL;

ALTER TABLE public.stripe_webhook_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS deny_all_stripe_webhook_events ON public.stripe_webhook_events;
CREATE POLICY deny_all_stripe_webhook_events ON public.stripe_webhook_events
  FOR ALL TO anon, authenticated
  USING (false) WITH CHECK (false);

CREATE OR REPLACE FUNCTION public.tg_billing_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.tg_billing_set_updated_at() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS plan_entitlements_set_updated_at ON public.plan_entitlements;
CREATE TRIGGER plan_entitlements_set_updated_at
  BEFORE UPDATE ON public.plan_entitlements
  FOR EACH ROW EXECUTE FUNCTION public.tg_billing_set_updated_at();
