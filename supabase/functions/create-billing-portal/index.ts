import {
  appUrl,
  corsHeaders,
  fetchEntitlement,
  isEntitlementActive,
  json,
  serverEnv,
  stripeEnv,
  stripeRequest,
  validPlanToken,
} from '../_shared/billing.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders(req) });
  if (req.method !== 'POST') return json(req, { error: 'Method not allowed' }, 405);

  try {
    const body = await req.json().catch(() => ({}));
    const token = String(body?.token || '');
    if (!validPlanToken(token)) return json(req, { error: 'Invalid plan token' }, 400);

    const { supabaseUrl, serviceRoleKey } = serverEnv();
    const entitlement = await fetchEntitlement(supabaseUrl, serviceRoleKey, token);
    if (!isEntitlementActive(entitlement)) return json(req, { error: 'Pro entitlement required' }, 402);
    if (entitlement?.payment_mode !== 'subscription' || !entitlement.stripe_customer_id) {
      return json(req, { error: 'This purchase does not require subscription management' }, 409);
    }

    const { secretKey } = stripeEnv();
    const form = new URLSearchParams();
    form.set('customer', entitlement.stripe_customer_id);
    form.set('return_url', `${appUrl()}/build-my-plan/results/${token}`);
    const portal = await stripeRequest<{ url?: string }>(secretKey, '/v1/billing_portal/sessions', {
      method: 'POST',
      form,
    });
    if (!portal.url) return json(req, { error: 'Stripe did not return a billing portal URL' }, 502);
    return json(req, { url: portal.url });
  } catch (error) {
    console.error('create-billing-portal', error);
    return json(req, { error: 'Unable to open billing management' }, 500);
  }
});
