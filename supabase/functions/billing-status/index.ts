import {
  corsHeaders,
  fetchCheckoutSession,
  fetchEntitlement,
  isEntitlementActive,
  json,
  serverEnv,
  stripeEnv,
  upsertEntitlementFromSession,
  validPlanToken,
} from '../_shared/billing.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders(req) });
  if (req.method !== 'POST') return json(req, { error: 'Method not allowed' }, 405);

  try {
    const body = await req.json().catch(() => ({}));
    const token = String(body?.token || '');
    const sessionId = body?.sessionId ? String(body.sessionId) : '';
    if (!validPlanToken(token)) return json(req, { error: 'Invalid plan token' }, 400);

    const { supabaseUrl, serviceRoleKey } = serverEnv();
    let entitlement = await fetchEntitlement(supabaseUrl, serviceRoleKey, token);

    if (sessionId) {
      if (!/^cs_(test_|live_)?[A-Za-z0-9_]+$/.test(sessionId)) return json(req, { error: 'Invalid checkout session' }, 400);
      const { secretKey } = stripeEnv();
      const session = await fetchCheckoutSession(secretKey, sessionId);
      const sessionToken = session.client_reference_id || session.metadata?.plan_token || '';
      if (sessionToken !== token) return json(req, { error: 'Checkout session does not match this plan' }, 403);
      entitlement = await upsertEntitlementFromSession(supabaseUrl, serviceRoleKey, secretKey, session);
    }

    const active = isEntitlementActive(entitlement);
    return json(req, {
      active,
      tier: active ? 'pro' : 'free',
      status: entitlement?.status || 'inactive',
      mode: entitlement?.payment_mode || null,
      expiresAt: entitlement?.access_expires_at || null,
      canManageBilling: active && entitlement?.payment_mode === 'subscription' && Boolean(entitlement?.stripe_customer_id),
    });
  } catch (error) {
    console.error('billing-status', error);
    return json(req, { error: 'Unable to verify billing status' }, 500);
  }
});
