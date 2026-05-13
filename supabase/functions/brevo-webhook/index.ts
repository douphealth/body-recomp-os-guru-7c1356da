// Brevo engagement webhook → persists events + auto-suppresses bounces / spam / unsubscribes.
// Hardened with shared-secret URL token (?token=...) since Brevo doesn't sign payloads.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const SUPPRESS_EVENTS: Record<string, string> = {
  hard_bounce: 'hard_bounce',
  spam: 'spam_complaint',
  unsubscribed: 'unsubscribed',
  blocked: 'blocked',
  invalid_email: 'invalid_email',
};

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  // Shared-secret authentication via ?token=... query param (configure as Brevo webhook URL).
  const expected = Deno.env.get('BREVO_WEBHOOK_SECRET');
  if (expected) {
    const url = new URL(req.url);
    const provided = url.searchParams.get('token') || req.headers.get('x-webhook-token') || '';
    if (!provided || !timingSafeEqual(provided, expected)) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  try {
    const body = await req.json();
    const events = Array.isArray(body) ? body : [body];
    let suppressed = 0;
    let logged = 0;

    for (const e of events) {
      const email = (e.email || '').toLowerCase().trim();
      if (!email) continue;
      const evt = (e.event || 'unknown').toLowerCase();

      const { error: insErr } = await supabase.from('email_engagement_events').insert({
        contact_email: email,
        event: evt,
        template_id: e['template-id'] || e.templateId || null,
        link: e.link || null,
        occurred_at: e.ts ? new Date(e.ts * 1000).toISOString() : new Date().toISOString(),
        raw: e,
      });
      if (!insErr) logged++;

      if (SUPPRESS_EVENTS[evt]) {
        // 1. DB suppression (source of truth for our backend)
        await supabase.from('email_suppressions').upsert(
          { contact_email: email, reason: SUPPRESS_EVENTS[evt], source: 'brevo_webhook' },
          { onConflict: 'contact_email' },
        );
        // 2. Mirror to Brevo blacklist
        await fetch(`https://api.brevo.com/v3/contacts/${encodeURIComponent(email)}`, {
          method: 'PUT',
          headers: { 'api-key': Deno.env.get('BREVO_API_KEY')!, 'content-type': 'application/json' },
          body: JSON.stringify({ emailBlacklisted: true, attributes: { BLACKLIST: 1 } }),
        }).catch(() => {});
        suppressed++;
      }
    }

    return new Response(JSON.stringify({ ok: true, received: events.length, logged, suppressed }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('brevo-webhook error', err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
