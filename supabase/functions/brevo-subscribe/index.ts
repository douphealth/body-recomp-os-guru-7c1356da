// Edge function: subscribe a body-recomp lead to Brevo with rich attributes,
// fire the welcome email immediately, and let the hourly drip dispatcher
// continue with the 21-day coaching series.
//
// Hardening (Phase 3):
//  - Per-IP rate limit (10/min) via consume_rate_limit RPC.
//  - HMAC one-click unsubscribe header on every welcome send (RFC 8058).
//  - Idempotent welcome log insert (unique constraint on email_drip_log).
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface SubscribePayload {
  email: string;
  firstName?: string;
  source: 'plan_gate' | 'exit_popup' | 'inline_results' | 'pdf_unlock' | 'footer';
  goalLabel?: string;
  calorieTarget?: number;
  proteinGrams?: number;
  workoutFrequency?: number;
  shareToken?: string;
  utm?: { source?: string; medium?: string; campaign?: string; term?: string; content?: string };
  consent?: boolean;
  doubleOptIn?: boolean;
  templateId?: number;
  redirectionUrl?: string;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const UNSUB_HOST = 'https://nzvhdfcewogkcnzxkrav.supabase.co/functions/v1/email-unsubscribe';
const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

const b64url = (bytes: ArrayBuffer | Uint8Array) => {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let bin = ''; for (const b of arr) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};
async function buildUnsubToken(email: string): Promise<string> {
  const secret = Deno.env.get('BREVO_WEBHOOK_SECRET') || '';
  const emailPart = b64url(new TextEncoder().encode(email));
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(emailPart));
  return `${emailPart}.${b64url(sig)}`;
}

function clientIp(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for') || '';
  const ip = fwd.split(',')[0].trim() || req.headers.get('cf-connecting-ip') || req.headers.get('x-real-ip') || 'unknown';
  return ip.slice(0, 64);
}

async function rateLimit(supaUrl: string, supaKey: string, ip: string): Promise<boolean> {
  try {
    const r = await fetch(`${supaUrl}/rest/v1/rpc/consume_rate_limit`, {
      method: 'POST',
      headers: {
        apikey: supaKey, authorization: `Bearer ${supaKey}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ p_bucket: 'brevo-subscribe', p_key: ip, p_limit: 10, p_window_seconds: 60 }),
    });
    if (!r.ok) return true; // fail-open if the RPC itself errors
    const allowed = await r.json();
    return allowed === true;
  } catch { return true; }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get('BREVO_API_KEY');
    const supaUrl = Deno.env.get('SUPABASE_URL');
    const supaKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!apiKey) return json({ error: 'Email service not configured' }, 500);

    // Rate limit per IP
    if (supaUrl && supaKey) {
      const allowed = await rateLimit(supaUrl, supaKey, clientIp(req));
      if (!allowed) {
        return new Response(JSON.stringify({ error: 'Too many requests. Try again in a minute.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Retry-After': '60' },
        });
      }
    }

    const body: SubscribePayload = await req.json();
    if (!body?.email || !isEmail(body.email) || body.email.length > 255) return json({ error: 'Invalid email' }, 400);
    if (!body.consent) return json({ error: 'Consent required' }, 400);
    if (!['plan_gate','exit_popup','inline_results','pdf_unlock','footer'].includes(body.source)) {
      return json({ error: 'Invalid source' }, 400);
    }

    const normalizedEmail = body.email.toLowerCase().trim();

    // DB suppression pre-check.
    if (supaUrl && supaKey) {
      const supRes = await fetch(
        `${supaUrl}/rest/v1/email_suppressions?contact_email=eq.${encodeURIComponent(normalizedEmail)}&select=reason`,
        { headers: { apikey: supaKey, authorization: `Bearer ${supaKey}` } },
      ).catch(() => null);
      if (supRes?.ok) {
        const rows = await supRes.json().catch(() => []);
        if (Array.isArray(rows) && rows.length > 0) {
          return json({ success: true, suppressed: true, reason: rows[0].reason });
        }
      }
    }

    const attributes: Record<string, unknown> = {
      FIRSTNAME: (body.firstName || '').slice(0, 100),
      SOURCE: body.source,
      GOAL: body.goalLabel || '',
      CALORIE_TARGET: body.calorieTarget ?? null,
      PROTEIN_G: body.proteinGrams ?? null,
      WORKOUT_FREQ: body.workoutFrequency ?? null,
      PLAN_TOKEN: body.shareToken && UUID_RE.test(body.shareToken) ? body.shareToken : '',
      UTM_SOURCE: body.utm?.source || '',
      UTM_MEDIUM: body.utm?.medium || '',
      UTM_CAMPAIGN: body.utm?.campaign || '',
      OPT_IN_DATE: new Date().toISOString(),
    };

    const planToken = body.shareToken && UUID_RE.test(body.shareToken) ? body.shareToken : '';
    const planUrl = planToken
      ? `https://gearuptofit.com/fitness-plan/build-my-plan/results/${planToken}?utm_source=email&utm_medium=drip&utm_campaign=body_recomp&utm_content=day0`
      : 'https://gearuptofit.com/fitness-plan/build-my-plan';

    const listIdBySource: Record<string, number> = {
      plan_gate: 7, exit_popup: 4, inline_results: 7, pdf_unlock: 7, footer: 5,
    };
    const listIds = [listIdBySource[body.source] ?? 7];

    const payload: Record<string, unknown> = {
      email: normalizedEmail, attributes, listIds, updateEnabled: true,
    };

    const useDoi = !!(body.doubleOptIn && body.templateId);
    const endpoint = useDoi
      ? 'https://api.brevo.com/v3/contacts/doubleOptinConfirmation'
      : 'https://api.brevo.com/v3/contacts';

    if (useDoi) {
      payload.templateId = body.templateId;
      payload.redirectionUrl = body.redirectionUrl || 'https://gearuptofit.com/build-my-plan/?confirmed=1';
      payload.includeListIds = listIds;
      delete payload.listIds;
    }

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'api-key': apiKey, 'accept': 'application/json' },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    let parsed: any = null; try { parsed = text ? JSON.parse(text) : null; } catch {}

    if (res.ok || parsed?.code === 'duplicate_parameter') {
      let welcomeSent = false;
      if (!useDoi) {
        try {
          const unsubToken = await buildUnsubToken(normalizedEmail);
          const unsubUrl = `${UNSUB_HOST}?token=${unsubToken}`;
          const sendRes = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: { 'api-key': apiKey, 'content-type': 'application/json', 'accept': 'application/json' },
            body: JSON.stringify({
              sender: { name: 'Alex · GearUpToFit', email: 'info@gearuptofit.com' },
              to: [{ email: normalizedEmail, name: body.firstName || undefined }],
              templateId: 2,
              params: {
                FIRSTNAME: body.firstName || 'there',
                GOAL: body.goalLabel || 'body recomposition',
                CALORIE_TARGET: body.calorieTarget || '',
                PROTEIN_G: body.proteinGrams || '',
                PLAN_URL: planUrl,
                PLAN_TOKEN: planToken,
                UNSUBSCRIBE_URL: unsubUrl,
              },
              tags: ['drip-day-0', 'body-recomp-welcome', `source-${body.source}`],
              headers: {
                'X-Mailin-Custom': 'drip:0:2',
                'List-Unsubscribe': `<${unsubUrl}>, <mailto:unsubscribe@gearuptofit.com?subject=unsubscribe>`,
                'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
              },
            }),
          });
          welcomeSent = sendRes.ok;
          if (sendRes.ok && supaUrl && supaKey) {
            const sendJson: any = await sendRes.json().catch(() => ({}));
            // Idempotent: unique constraint on (contact_email, template_id) makes this safe.
            await fetch(`${supaUrl}/rest/v1/email_drip_log`, {
              method: 'POST',
              headers: {
                apikey: supaKey, authorization: `Bearer ${supaKey}`,
                'content-type': 'application/json',
                prefer: 'return=minimal,resolution=ignore-duplicates',
              },
              body: JSON.stringify({
                contact_email: normalizedEmail,
                template_id: 2,
                day_offset: 0,
                brevo_message_id: sendJson?.messageId || null,
                status: 'sent',
              }),
            }).catch(() => {});
          } else if (!sendRes.ok) {
            const errTxt = await sendRes.text();
            console.error('Welcome send failed', sendRes.status, errTxt);
          }
        } catch (e) {
          console.error('Welcome send exception', e);
        }
      }

      return json({ success: true, doubleOptIn: useDoi, welcomeSent });
    }

    console.error('Brevo error', res.status, text);
    return json({ error: 'Subscription failed', detail: parsed?.message || text }, 502);
  } catch (err) {
    console.error('brevo-subscribe exception', err);
    return json({ error: 'Internal error' }, 500);
  }
});
