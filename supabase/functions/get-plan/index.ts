// Returns a saved plan by share token. Public (no auth) — token IS the credential.
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function hashIp(ip: string): Promise<string> {
  const data = new TextEncoder().encode(ip + '|gutf-salt-v1');
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf)).slice(0, 8).map(b => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    let token = url.searchParams.get('token') || '';
    let source = url.searchParams.get('source') || '';
    if (req.method === 'POST') {
      const body = await req.json().catch(() => ({}));
      token = body.token || token;
      source = body.source || source;
    }
    if (!token || !UUID_RE.test(token)) {
      return new Response(JSON.stringify({ error: 'invalid token' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supaUrl = Deno.env.get('SUPABASE_URL');
    const supaKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supaUrl || !supaKey) {
      return new Response(JSON.stringify({ error: 'Server not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const res = await fetch(
      `${supaUrl}/rest/v1/plans?share_token=eq.${encodeURIComponent(token)}&select=share_token,email,first_name,goal_label,inputs,outputs,pdf_url,created_at`,
      { headers: { apikey: supaKey, authorization: `Bearer ${supaKey}` } },
    );
    if (!res.ok) {
      return new Response(JSON.stringify({ error: 'fetch failed' }), {
        status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const rows = await res.json();
    if (!Array.isArray(rows) || rows.length === 0) {
      return new Response(JSON.stringify({ error: 'not found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const plan = rows[0];

    // Fire-and-forget analytics event
    try {
      const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '';
      const ua = req.headers.get('user-agent') || '';
      const ipHash = ip ? await hashIp(ip) : null;
      fetch(`${supaUrl}/rest/v1/plan_events`, {
        method: 'POST',
        headers: {
          apikey: supaKey,
          authorization: `Bearer ${supaKey}`,
          'content-type': 'application/json',
          prefer: 'return=minimal',
        },
        body: JSON.stringify({
          share_token: token,
          event: 'view',
          source: source || null,
          user_agent: ua.slice(0, 500),
          ip_hash: ipHash,
        }),
      }).catch(() => {});
    } catch {}

    return new Response(JSON.stringify({ plan }), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Cache-Control': 'private, max-age=60',
      },
    });
  } catch (err) {
    console.error('get-plan exception', err);
    return new Response(JSON.stringify({ error: 'internal error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
