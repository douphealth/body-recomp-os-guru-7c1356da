import { corsHeaders, fetchPrice, json, stripeEnv } from '../_shared/billing.ts';

function formatPrice(amount: number | null, currency: string) {
  if (amount == null) return null;
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
      maximumFractionDigits: amount % 100 === 0 ? 0 : 2,
    }).format(amount / 100);
  } catch {
    return `${(amount / 100).toFixed(2)} ${currency.toUpperCase()}`;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders(req) });
  if (req.method !== 'POST') return json(req, { error: 'Method not allowed' }, 405);

  try {
    const { secretKey, priceId } = stripeEnv();
    const price = await fetchPrice(secretKey, priceId);
    if (!price.active) return json(req, { configured: false, error: 'Configured Stripe price is inactive' }, 503);

    const product = typeof price.product === 'object' && price.product ? price.product : null;
    if (product?.active === false) return json(req, { configured: false, error: 'Configured Stripe product is inactive' }, 503);

    const interval = price.recurring?.interval || null;
    return json(req, {
      configured: true,
      productName: product?.name || 'Body Recomp OS Pro',
      description: product?.description || 'Premium execution roadmap, secure Pro report, and billing access.',
      priceLabel: formatPrice(price.unit_amount, price.currency),
      currency: price.currency,
      amount: price.unit_amount,
      mode: interval ? 'subscription' : 'payment',
      interval,
      intervalCount: price.recurring?.interval_count || null,
    });
  } catch (error) {
    console.error('billing-config', error);
    return json(req, { configured: false, error: 'Billing is not configured yet' }, 503);
  }
});
