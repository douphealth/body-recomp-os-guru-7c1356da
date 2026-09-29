# Body Recomp OS Pro — Stripe/Supabase production runbook

The code supports either a one-time Stripe Price or a recurring Stripe Price. The mode is derived from the configured Price at runtime.

## 1. Apply the database migration

From a Supabase CLI session linked to project `nzvhdfcewogkcnzxkrav`:

```bash
supabase db push
```

The migration creates:
- `public.plan_entitlements`
- `public.stripe_webhook_events`

Both tables have RLS enabled and deny direct anon/authenticated access. Edge Functions use the service role.

## 2. Configure Edge Function secrets

Create a Stripe Product and Price in the Stripe Dashboard first. Use a recurring Price for subscription billing or a one-time Price for a lifetime/one-time purchase.

```bash
supabase secrets set STRIPE_SECRET_KEY='sk_live_...'
supabase secrets set STRIPE_PRICE_ID='price_...'
supabase secrets set PUBLIC_APP_URL='https://gearuptofit.com/fitness-plan'
```

Optional:

```bash
supabase secrets set STRIPE_ALLOW_PROMOTION_CODES='true'
supabase secrets set BILLING_ALLOWED_ORIGINS='https://gearuptofit.com,https://body-recomp-os-guru.lovable.app'
```

Never put `STRIPE_SECRET_KEY` or the webhook signing secret into Vite/browser environment variables.

## 3. Deploy the billing functions

```bash
supabase functions deploy billing-config --no-verify-jwt
supabase functions deploy create-checkout --no-verify-jwt
supabase functions deploy billing-status --no-verify-jwt
supabase functions deploy create-billing-portal --no-verify-jwt
supabase functions deploy premium-roadmap --no-verify-jwt
supabase functions deploy stripe-webhook --no-verify-jwt
supabase functions deploy plan-pdf --no-verify-jwt
```

## 4. Configure the Stripe webhook

Create a Stripe webhook destination pointing to:

```text
https://nzvhdfcewogkcnzxkrav.supabase.co/functions/v1/stripe-webhook
```

Subscribe it to:
- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `checkout.session.async_payment_failed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`

Copy the webhook signing secret and configure it:

```bash
supabase secrets set STRIPE_WEBHOOK_SECRET='whsec_...'
```

Redeploy `stripe-webhook` after changing secrets only if your deployment process requires it; Supabase secrets are otherwise available to functions automatically.

## 5. Enable Stripe Customer Portal for subscriptions

If `STRIPE_PRICE_ID` is recurring, enable/configure Stripe Customer Portal in the Stripe Dashboard so paying users can manage their subscription.

One-time purchases do not display the Manage Billing button.

## 6. End-to-end test in Stripe test mode

Before live mode, configure test-mode values:

```bash
supabase secrets set STRIPE_SECRET_KEY='sk_test_...'
supabase secrets set STRIPE_PRICE_ID='price_test_...'
supabase secrets set STRIPE_WEBHOOK_SECRET='whsec_test_...'
```

Then validate this exact journey:

1. Generate a new free plan.
2. Confirm all existing free tabs and the normal client PDF remain usable.
3. Click **Unlock Pro securely**.
4. Confirm the browser is sent to Stripe-hosted Checkout.
5. Complete Checkout with a Stripe test card.
6. Confirm Stripe redirects to the same private plan URL with `checkout=success`.
7. Confirm the app verifies the Checkout Session server-side and changes to **Pro active**.
8. Confirm the 8-week Pro roadmap loads.
9. Confirm **Pro report** generates a signed server PDF only while Pro entitlement is valid.
10. For recurring mode, confirm **Manage billing** opens the Stripe Customer Portal.
11. Cancel the subscription in Stripe and deliver the webhook.
12. Confirm access follows the subscription status/end-of-period state.
13. Replay the same webhook event and confirm it does not duplicate billing state.

## 7. Production switch

Only after the test-mode flow passes:
- replace the Stripe secrets with live-mode `sk_live_`, live `price_`, and live `whsec_` values;
- execute one low-value real transaction;
- confirm the corresponding `plan_entitlements` row and processed webhook event;
- refund the verification transaction if desired.

## Rollback

The frontend is additive. If billing must be disabled immediately:
1. set `STRIPE_PRICE_ID` to an inactive/nonexistent value or remove billing secrets, which makes the Pro CTA non-purchasable;
2. redeploy/revert the app to the commit before this PR if needed;
3. keep the entitlement tables for audit history, or remove them later in a separate reviewed migration.

Do not delete payment records as part of an emergency UI rollback.
