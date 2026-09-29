export const DEFAULT_APP_URL = 'https://gearuptofit.com/fitness-plan';

export interface PlanRow {
  share_token: string;
  email: string | null;
  first_name: string | null;
  goal_label: string | null;
  inputs: Record<string, unknown>;
  outputs: Record<string, unknown>;
  pdf_url?: string | null;
  created_at: string;
}

export interface EntitlementRow {
  plan_token: string;
  status: string;
  payment_mode: 'payment' | 'subscription' | null;
  stripe_customer_id: string | null;
  stripe_checkout_session_id: string | null;
  stripe_subscription_id: string | null;
  stripe_payment_intent_id: string | null;
  stripe_price_id: string | null;
  access_expires_at: string | null;
  paid_at: string | null;
  updated_at: string;
}

export interface StripeCheckoutSession {
  id: string;
  object: 'checkout.session';
  client_reference_id?: string | null;
  customer?: string | null;
  subscription?: string | null;
  payment_intent?: string | null;
  payment_status?: string | null;
  status?: string | null;
  mode?: 'payment' | 'subscription' | 'setup' | null;
  metadata?: Record<string, string> | null;
  customer_details?: { email?: string | null } | null;
  url?: string | null;
}

export interface StripeSubscription {
  id: string;
  status: string;
  customer?: string | null;
  current_period_end?: number | null;
  cancel_at_period_end?: boolean;
  metadata?: Record<string, string> | null;
}

export interface StripePrice {
  id: string;
  active: boolean;
  currency: string;
  unit_amount: number | null;
  recurring?: { interval?: string; interval_count?: number } | null;
  product?: string | {
    id: string;
    active?: boolean;
    name?: string;
    description?: string | null;
  } | null;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function validPlanToken(value: unknown): value is string {
  return typeof value === 'string' && UUID_RE.test(value);
}

export function appUrl() {
  return (Deno.env.get('PUBLIC_APP_URL') || DEFAULT_APP_URL).replace(/\/+$/, '');
}

function configuredOrigins() {
  const custom = (Deno.env.get('BILLING_ALLOWED_ORIGINS') || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  return new Set([
    'https://gearuptofit.com',
    'https://body-recomp-os-guru.lovable.app',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    ...custom,
  ]);
}

export function corsHeaders(req: Request) {
  const origin = req.headers.get('origin') || '';
  const allowOrigin = configuredOrigins().has(origin) ? origin : 'https://gearuptofit.com';
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}

export function json(req: Request, body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(req), 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

export function serverEnv() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceRoleKey) throw new Error('Supabase server environment is not configured');
  return { supabaseUrl, serviceRoleKey };
}

export function stripeEnv() {
  const secretKey = Deno.env.get('STRIPE_SECRET_KEY');
  const priceId = Deno.env.get('STRIPE_PRICE_ID');
  if (!secretKey || !priceId) throw new Error('Stripe billing environment is not configured');
  return { secretKey, priceId };
}

export async function supabaseRest<T>(
  supabaseUrl: string,
  serviceRoleKey: string,
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers || {});
  headers.set('apikey', serviceRoleKey);
  headers.set('authorization', `Bearer ${serviceRoleKey}`);
  if (init.body && !headers.has('content-type')) headers.set('content-type', 'application/json');

  const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, { ...init, headers });
  const raw = await response.text();
  if (!response.ok) throw new Error(`Supabase REST ${response.status}: ${raw.slice(0, 500)}`);
  return (raw ? JSON.parse(raw) : null) as T;
}

export async function fetchPlan(
  supabaseUrl: string,
  serviceRoleKey: string,
  token: string,
): Promise<PlanRow | null> {
  const rows = await supabaseRest<PlanRow[]>(
    supabaseUrl,
    serviceRoleKey,
    `plans?share_token=eq.${encodeURIComponent(token)}&select=share_token,email,first_name,goal_label,inputs,outputs,pdf_url,created_at`,
  );
  return rows[0] ?? null;
}

export async function fetchEntitlement(
  supabaseUrl: string,
  serviceRoleKey: string,
  token: string,
): Promise<EntitlementRow | null> {
  const rows = await supabaseRest<EntitlementRow[]>(
    supabaseUrl,
    serviceRoleKey,
    `plan_entitlements?plan_token=eq.${encodeURIComponent(token)}&select=*`,
  );
  return rows[0] ?? null;
}

export function isEntitlementActive(row: EntitlementRow | null, now = Date.now()) {
  if (!row) return false;
  if (row.payment_mode === 'payment') return row.status === 'active' || row.status === 'paid';
  if (row.payment_mode === 'subscription') {
    if (row.status === 'active' || row.status === 'trialing') return true;
    if (row.status === 'canceled' && row.access_expires_at) {
      const expires = Date.parse(row.access_expires_at);
      return Number.isFinite(expires) && expires > now;
    }
  }
  return false;
}

export async function consumeCheckoutRateLimit(
  supabaseUrl: string,
  serviceRoleKey: string,
  token: string,
) {
  const result = await supabaseRest<boolean>(supabaseUrl, serviceRoleKey, 'rpc/consume_rate_limit', {
    method: 'POST',
    body: JSON.stringify({
      p_bucket: 'stripe_checkout',
      p_key: token,
      p_limit: 5,
      p_window_seconds: 60,
    }),
  });
  return result !== false;
}

export async function stripeRequest<T>(
  secretKey: string,
  path: string,
  init: { method?: 'GET' | 'POST'; form?: URLSearchParams; idempotencyKey?: string } = {},
): Promise<T> {
  const method = init.method || (init.form ? 'POST' : 'GET');
  const headers = new Headers({ Authorization: `Bearer ${secretKey}` });
  if (init.form) headers.set('content-type', 'application/x-www-form-urlencoded');
  if (init.idempotencyKey) headers.set('Idempotency-Key', init.idempotencyKey);

  const response = await fetch(`https://api.stripe.com${path}`, {
    method,
    headers,
    body: init.form?.toString(),
  });
  const raw = await response.text();
  if (!response.ok) throw new Error(`Stripe ${response.status}: ${raw.slice(0, 700)}`);
  return JSON.parse(raw) as T;
}

export async function fetchPrice(secretKey: string, priceId: string) {
  return stripeRequest<StripePrice>(secretKey, `/v1/prices/${encodeURIComponent(priceId)}?expand%5B%5D=product`);
}

export async function fetchCheckoutSession(secretKey: string, sessionId: string) {
  return stripeRequest<StripeCheckoutSession>(secretKey, `/v1/checkout/sessions/${encodeURIComponent(sessionId)}`);
}

export async function fetchSubscription(secretKey: string, subscriptionId: string) {
  return stripeRequest<StripeSubscription>(secretKey, `/v1/subscriptions/${encodeURIComponent(subscriptionId)}`);
}

function isoFromUnix(seconds?: number | null) {
  return seconds ? new Date(seconds * 1000).toISOString() : null;
}

export async function upsertEntitlementFromSession(
  supabaseUrl: string,
  serviceRoleKey: string,
  secretKey: string,
  session: StripeCheckoutSession,
) {
  const token = session.client_reference_id || session.metadata?.plan_token || '';
  if (!validPlanToken(token)) throw new Error('Checkout session is missing a valid plan token');

  let status = 'inactive';
  let expiresAt: string | null = null;
  let customerId = typeof session.customer === 'string' ? session.customer : null;
  const subscriptionId = typeof session.subscription === 'string' ? session.subscription : null;

  if (session.mode === 'subscription' && subscriptionId) {
    const subscription = await fetchSubscription(secretKey, subscriptionId);
    status = subscription.status || 'inactive';
    expiresAt = isoFromUnix(subscription.current_period_end);
    if (typeof subscription.customer === 'string') customerId = subscription.customer;
  } else if (session.mode === 'payment') {
    const complete = session.status === 'complete';
    const paid = session.payment_status === 'paid' || session.payment_status === 'no_payment_required';
    status = complete && paid ? 'active' : session.payment_status || session.status || 'inactive';
  }

  const paidAt = isCheckoutPaid(session, status) ? new Date().toISOString() : null;
  const row = {
    plan_token: token,
    status,
    payment_mode: session.mode === 'subscription' ? 'subscription' : 'payment',
    stripe_customer_id: customerId,
    stripe_checkout_session_id: session.id,
    stripe_subscription_id: subscriptionId,
    stripe_payment_intent_id: typeof session.payment_intent === 'string' ? session.payment_intent : null,
    stripe_price_id: session.metadata?.price_id || Deno.env.get('STRIPE_PRICE_ID') || null,
    access_expires_at: expiresAt,
    ...(paidAt ? { paid_at: paidAt } : {}),
  };

  const rows = await supabaseRest<EntitlementRow[]>(
    supabaseUrl,
    serviceRoleKey,
    'plan_entitlements?on_conflict=plan_token',
    {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
      body: JSON.stringify(row),
    },
  );
  return rows[0] ?? null;
}

function isCheckoutPaid(session: StripeCheckoutSession, status: string) {
  if (session.mode === 'subscription') return status === 'active' || status === 'trialing';
  return session.status === 'complete' && (
    session.payment_status === 'paid' || session.payment_status === 'no_payment_required'
  );
}

export async function updateEntitlementFromSubscription(
  supabaseUrl: string,
  serviceRoleKey: string,
  subscription: StripeSubscription,
) {
  const token = subscription.metadata?.plan_token || '';
  const patch = {
    status: subscription.status || 'inactive',
    payment_mode: 'subscription',
    stripe_customer_id: typeof subscription.customer === 'string' ? subscription.customer : null,
    stripe_subscription_id: subscription.id,
    access_expires_at: isoFromUnix(subscription.current_period_end),
  };

  if (validPlanToken(token)) {
    const rows = await supabaseRest<EntitlementRow[]>(
      supabaseUrl,
      serviceRoleKey,
      'plan_entitlements?on_conflict=plan_token',
      {
        method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
        body: JSON.stringify({ plan_token: token, ...patch }),
      },
    );
    return rows[0] ?? null;
  }

  const rows = await supabaseRest<EntitlementRow[]>(
    supabaseUrl,
    serviceRoleKey,
    `plan_entitlements?stripe_subscription_id=eq.${encodeURIComponent(subscription.id)}`,
    {
      method: 'PATCH',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify(patch),
    },
  );
  return rows[0] ?? null;
}

export async function verifyStripeSignature(
  payload: string,
  signatureHeader: string,
  secret: string,
  toleranceSeconds = 300,
) {
  const fields = signatureHeader.split(',').map((part) => part.trim());
  const timestampValue = fields.find((part) => part.startsWith('t='))?.slice(2);
  const signatures = fields.filter((part) => part.startsWith('v1=')).map((part) => part.slice(3));
  const timestamp = Number(timestampValue);
  if (!Number.isFinite(timestamp) || signatures.length === 0) return false;
  if (Math.abs(Math.floor(Date.now() / 1000) - timestamp) > toleranceSeconds) return false;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const digest = await crypto.subtle.sign('HMAC', key, encoder.encode(`${timestamp}.${payload}`));
  const expected = Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
  return signatures.some((signature) => constantTimeEqual(signature, expected));
}

function constantTimeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
