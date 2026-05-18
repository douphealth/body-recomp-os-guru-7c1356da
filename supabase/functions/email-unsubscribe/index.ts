// Public unsubscribe endpoint. Supports:
//   - RFC 8058 one-click (POST with List-Unsubscribe=One-Click body)
//   - GET ?token=... → HTML confirmation page
//   - POST { email } from in-app pages (legacy compat)
// Tokens are HMAC-SHA256 signed with BREVO_WEBHOOK_SECRET so links cannot be
// guessed or replayed to suppress someone else's address.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

const b64url = (bytes: ArrayBuffer | Uint8Array) => {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let bin = '';
  for (const b of arr) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};
const b64urlDecode = (s: string) => {
  const pad = s.length % 4 ? '='.repeat(4 - (s.length % 4)) : '';
  return atob(s.replace(/-/g, '+').replace(/_/g, '/') + pad);
};

async function hmac(secret: string, payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  return b64url(sig);
}

async function verifyToken(token: string, secret: string): Promise<string | null> {
  // token = base64url(email).base64url(hmac)
  const [emailPart, sigPart] = token.split('.');
  if (!emailPart || !sigPart) return null;
  let email: string;
  try { email = b64urlDecode(emailPart).toLowerCase().trim(); } catch { return null; }
  if (!isEmail(email)) return null;
  const expected = await hmac(secret, emailPart);
  // constant-time compare
  if (expected.length !== sigPart.length) return null;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ sigPart.charCodeAt(i);
  return diff === 0 ? email : null;
}

async function suppressEmail(e: string, reason: string, source: string) {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );
  await supabase.from('email_suppressions').upsert(
    { contact_email: e, reason, source },
    { onConflict: 'contact_email' },
  );
  const apiKey = Deno.env.get('BREVO_API_KEY');
  if (apiKey) {
    await fetch(`https://api.brevo.com/v3/contacts/${encodeURIComponent(e)}`, {
      method: 'PUT',
      headers: { 'api-key': apiKey, 'content-type': 'application/json' },
      body: JSON.stringify({ emailBlacklisted: true, attributes: { BLACKLIST: 1 } }),
    }).catch(() => {});
  }
}

const html = (body: string, status = 200) =>
  new Response(
    `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Unsubscribed · GearUpToFit</title>
<style>
  body{margin:0;font:16px/1.5 -apple-system,Segoe UI,Inter,Arial,sans-serif;background:#0b0b0d;color:#f5f5f7;display:grid;place-items:center;min-height:100vh;padding:24px}
  .card{max-width:480px;background:#16161a;border:1px solid #26262b;border-radius:16px;padding:32px;text-align:center}
  h1{font-family:Oswald,Impact,sans-serif;letter-spacing:.05em;margin:0 0 12px;font-size:28px}
  p{margin:8px 0;color:#b8b8c2}
  a{color:#e84528;text-decoration:none;font-weight:600}
  .brand{font-size:11px;letter-spacing:.2em;color:#e84528;text-transform:uppercase;margin-bottom:8px}
</style>
<div class="card">${body}<p style="margin-top:24px"><a href="https://gearuptofit.com">Back to GearUpToFit</a></p></div>`,
    { status, headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' } },
  );

const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  const url = new URL(req.url);
  const secret = Deno.env.get('BREVO_WEBHOOK_SECRET') || '';

  try {
    // ---- RFC 8058 one-click (mail clients POST application/x-www-form-urlencoded) ----
    if (req.method === 'POST' && (req.headers.get('content-type') || '').includes('application/x-www-form-urlencoded')) {
      const form = await req.formData();
      const oneClick = String(form.get('List-Unsubscribe') || '') === 'One-Click';
      const token = url.searchParams.get('token') || '';
      if (oneClick && secret && token) {
        const email = await verifyToken(token, secret);
        if (!email) return json({ error: 'Invalid token' }, 400);
        await suppressEmail(email, 'user_unsubscribed', 'one_click_header');
        return json({ ok: true });
      }
    }

    // ---- GET ?token=... → confirmation page ----
    if (req.method === 'GET') {
      const token = url.searchParams.get('token') || '';
      if (!token || !secret) return html('<div class="brand">GearUpToFit</div><h1>INVALID LINK</h1><p>This unsubscribe link is missing or malformed.</p>', 400);
      const email = await verifyToken(token, secret);
      if (!email) return html('<div class="brand">GearUpToFit</div><h1>LINK EXPIRED</h1><p>This unsubscribe link is no longer valid.</p>', 400);
      await suppressEmail(email, 'user_unsubscribed', 'unsubscribe_link');
      return html(`<div class="brand">GearUpToFit</div><h1>YOU'RE UNSUBSCRIBED</h1><p>${email} has been removed from all marketing emails.</p><p style="font-size:13px;opacity:.7">Transactional messages (like your plan link) will still be delivered.</p>`);
    }

    // ---- POST JSON { email } (in-app legacy) ----
    if (req.method === 'POST') {
      const { email, reason } = await req.json().catch(() => ({} as any));
      const e = String(email || '').toLowerCase().trim();
      if (!e || !isEmail(e) || e.length > 255) return json({ error: 'Invalid email' }, 400);
      await suppressEmail(e, reason || 'user_unsubscribed', 'unsubscribe_page');
      return json({ ok: true });
    }

    return json({ error: 'Method not allowed' }, 405);
  } catch (err) {
    console.error('unsubscribe error', err);
    return json({ error: 'Internal error' }, 500);
  }
});
