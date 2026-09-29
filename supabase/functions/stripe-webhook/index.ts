import {
  fetchCheckoutSession,
  serverEnv,
  supabaseRest,
  updateEntitlementFromSubscription,
  upsertEntitlementFromSession,
  verifyStripeSignature,
  type StripeCheckoutSession,
  type StripeSubscription,
} from '../_shared/billing.ts';

interface StripeEvent {
  id: string;
  type: string;
  livemode?: boolean;
  data?: { object?: Record<string, unknown> };
}

async function eventAlreadyProcessed(supabaseUrl: string, serviceRoleKey: string, eventId: string) {
  const rows = await supabaseRest<Array<{ processed_at: string | null }>>(
    supabaseUrl, serviceRoleKey,
    `stripe_webhook_events?event_id=eq.${encodeURIComponent(eventId)}&select=processed_at`,
  );
  return Boolean(rows[0]?.processed_at);
}

async function ensureEventRow(supabaseUrl: string, serviceRoleKey: string, event: StripeEvent) {
  await supabaseRest(supabaseUrl, serviceRoleKey, 'stripe_webhook_events?on_conflict=event_id', {
    method: 'POST',
    headers: { Prefer: 'resolution=ignore-duplicates,return=minimal' },
    body: JSON.stringify({ event_id: event.id, event_type: event.type, livemode: Boolean(event.livemode) }),
  });
}

async function markProcessed(supabaseUrl: string, serviceRoleKey: string, eventId: string) {
  await supabaseRest(supabaseUrl, serviceRoleKey, `stripe_webhook_events?event_id=eq.${encodeURIComponent(eventId)}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({ processed_at: new Date().toISOString(), last_error: null }),
  });
}

async function markFailed(supabaseUrl: string, serviceRoleKey: string, eventId: string, error: unknown) {
  try {
    await supabaseRest(supabaseUrl, serviceRoleKey, `stripe_webhook_events?event_id=eq.${encodeURIComponent(eventId)}`, {
      method: 'PATCH',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ last_error: String(error).slice(0, 1000) }),
    });
  } catch {}
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  const secretKey = Deno.env.get('STRIPE_SECRET_KEY');
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
  if (!secretKey || !webhookSecret) return new Response('Billing not configured', { status: 500 });

  const signature = req.headers.get('stripe-signature') || '';
  const rawBody = await req.text();
  const valid = await verifyStripeSignature(rawBody, signature, webhookSecret);
  if (!valid) return new Response('Invalid signature', { status: 400 });

  let event: StripeEvent;
  try { event = JSON.parse(rawBody) as StripeEvent; }
  catch { return new Response('Invalid payload', { status: 400 }); }
  if (!event.id || !event.type) return new Response('Invalid event', { status: 400 });

  const { supabaseUrl, serviceRoleKey } = serverEnv();
  if (await eventAlreadyProcessed(supabaseUrl, serviceRoleKey, event.id)) return new Response('ok', { status: 200 });
  await ensureEventRow(supabaseUrl, serviceRoleKey, event);

  try {
    const object = event.data?.object || {};

    if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
      const sessionId = String(object.id || '');
      if (sessionId) {
        const session = await fetchCheckoutSession(secretKey, sessionId);
        await upsertEntitlementFromSession(supabaseUrl, serviceRoleKey, secretKey, session);
      }
    } else if (
      event.type === 'customer.subscription.created' ||
      event.type === 'customer.subscription.updated' ||
      event.type === 'customer.subscription.deleted'
    ) {
      await updateEntitlementFromSubscription(supabaseUrl, serviceRoleKey, object as unknown as StripeSubscription);
    } else if (event.type === 'checkout.session.async_payment_failed') {
      const session = object as unknown as StripeCheckoutSession;
      const token = session.client_reference_id || session.metadata?.plan_token || '';
      if (token) {
        await supabaseRest(supabaseUrl, serviceRoleKey, `plan_entitlements?plan_token=eq.${encodeURIComponent(token)}`, {
          method: 'PATCH',
          headers: { Prefer: 'return=minimal' },
          body: JSON.stringify({ status: 'payment_failed' }),
        });
      }
    }

    await markProcessed(supabaseUrl, serviceRoleKey, event.id);
    return new Response('ok', { status: 200 });
  } catch (error) {
    console.error('stripe-webhook processing error', event.id, event.type, error);
    await markFailed(supabaseUrl, serviceRoleKey, event.id, error);
    return new Response('Webhook processing failed', { status: 500 });
  }
});
