import {
  appUrl,
  consumeCheckoutRateLimit,
  corsHeaders,
  fetchEntitlement,
  fetchPlan,
  fetchPrice,
  isEntitlementActive,
  json,
  serverEnv,
  stripeEnv,
  stripeRequest,
  validPlanToken,
  type StripeCheckoutSession,
} from '../_shared/billing.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders(req) });
  if (req.method !== 'POST') return json(req, { error: 'Method not allowed' }, 405);

  try {
    const body = await req.json().catch(() => ({}));
    const token = String(body?.token || '');
    if (!validPlanToken(token)) return json(req, { error: 'Invalid plan token' }, 400);

    const { supabaseUrl, serviceRoleKey } = serverEnv();
    const { secretKey, priceId } = stripeEnv();

    const [plan, entitlement] = await Promise.all([
      fetchPlan(supabaseUrl, serviceRoleKey, token),
      fetchEntitlement(supabaseUrl, serviceRoleKey, token),
    ]);
    if (!plan) return json(req, { error: 'Plan not found' }, 404);
    if (isEntitlementActive(entitlement)) return json(req, { alreadyActive: true, active: true });

    const allowed = await consumeCheckoutRateLimit(supabaseUrl, serviceRoleKey, token);
    if (!allowed) return json(req, { error: 'Too many checkout attempts. Try again in a minute.' }, 429);

    const price = await fetchPrice(secretKey, priceId);
    if (!price.active) return json(req, { error: 'Billing price is inactive' }, 503);
    const product = typeof price.product === 'object' && price.product ? price.product : null;
    if (product?.active === false) return json(req, { error: 'Billing product is inactive' }, 503);

    const mode = price.recurring ? 'subscription' : 'payment';
    const resultUrl = `${appUrl()}/build-my-plan/results/${token}`;
    const form = new URLSearchParams();
    form.set('mode', mode);
    form.set('success_url', `${resultUrl}?checkout=success&session_id={CHECKOUT_SESSION_ID}`);
    form.set('cancel_url', `${resultUrl}?checkout=cancelled`);
    form.set('client_reference_id', token);
    form.set('line_items[0][price]', priceId);
    form.set('line_items[0][quantity]', '1');
    form.set('metadata[plan_token]', token);
    form.set('metadata[price_id]', priceId);
    form.set('billing_address_collection', 'auto');

    if (plan.email) form.set('customer_email', plan.email);
    if (Deno.env.get('STRIPE_ALLOW_PROMOTION_CODES') === 'true') form.set('allow_promotion_codes', 'true');

    if (mode === 'subscription') {
      form.set('subscription_data[metadata][plan_token]', token);
      form.set('subscription_data[metadata][price_id]', priceId);
    } else {
      form.set('customer_creation', 'always');
      form.set('payment_intent_data[metadata][plan_token]', token);
      form.set('payment_intent_data[metadata][price_id]', priceId);
    }

    const session = await stripeRequest<StripeCheckoutSession>(secretKey, '/v1/checkout/sessions', {
      method: 'POST',
      form,
      idempotencyKey: `checkout:${token}:${priceId}:${Math.floor(Date.now() / 300000)}`,
    });

    if (!session.url) return json(req, { error: 'Stripe did not return a checkout URL' }, 502);
    return json(req, { url: session.url, sessionId: session.id, mode });
  } catch (error) {
    console.error('create-checkout', error);
    return json(req, { error: 'Unable to start secure checkout' }, 500);
  }
});
