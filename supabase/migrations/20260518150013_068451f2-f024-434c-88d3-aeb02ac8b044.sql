
-- =====================================================================
-- plans table: persistent storage for generated body recomp plans
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.plans (
  share_token UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT,
  first_name TEXT,
  goal_label TEXT,
  inputs JSONB NOT NULL,
  outputs JSONB NOT NULL,
  pdf_url TEXT,
  utm JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_plans_email ON public.plans(email);
CREATE INDEX IF NOT EXISTS idx_plans_created_at ON public.plans(created_at DESC);

ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

-- Deny-all to anon/authenticated. Service role bypasses RLS.
CREATE POLICY deny_all_plans ON public.plans
  FOR ALL TO anon, authenticated
  USING (false) WITH CHECK (false);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.tg_plans_set_updated_at()
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

DROP TRIGGER IF EXISTS plans_set_updated_at ON public.plans;
CREATE TRIGGER plans_set_updated_at
  BEFORE UPDATE ON public.plans
  FOR EACH ROW EXECUTE FUNCTION public.tg_plans_set_updated_at();

-- =====================================================================
-- plan_events table: view/open analytics per token
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.plan_events (
  id BIGSERIAL PRIMARY KEY,
  share_token UUID NOT NULL REFERENCES public.plans(share_token) ON DELETE CASCADE,
  event TEXT NOT NULL,
  source TEXT,
  user_agent TEXT,
  ip_hash TEXT,
  meta JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_plan_events_token ON public.plan_events(share_token);
CREATE INDEX IF NOT EXISTS idx_plan_events_event ON public.plan_events(event);
CREATE INDEX IF NOT EXISTS idx_plan_events_created_at ON public.plan_events(created_at DESC);

ALTER TABLE public.plan_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY deny_all_plan_events ON public.plan_events
  FOR ALL TO anon, authenticated
  USING (false) WITH CHECK (false);
