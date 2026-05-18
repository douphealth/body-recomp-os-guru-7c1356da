// Saves (or upserts) a generated body recomp plan and returns a share token.
// Token is used in /results/:token URLs and Brevo email CTAs.
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface Payload {
  shareToken?: string;
  email?: string;
  firstName?: string;
  goalLabel?: string;
  inputs: Record<string, unknown>;
  outputs: Record<string, unknown>;
  utm?: Record<string, unknown>;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: corsHeaders });
  }

  try {
    const supaUrl = Deno.env.get('SUPABASE_URL');
    const supaKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supaUrl || !supaKey) {
      return new Response(JSON.stringify({ error: 'Server not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = (await req.json()) as Payload;
    if (!body?.inputs || !body?.outputs || typeof body.inputs !== 'object' || typeof body.outputs !== 'object') {
      return new Response(JSON.stringify({ error: 'inputs and outputs required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    // Size guard: 100KB total
    const totalSize = JSON.stringify(body.inputs).length + JSON.stringify(body.outputs).length;
    if (totalSize > 100_000) {
      return new Response(JSON.stringify({ error: 'payload too large' }), {
        status: 413, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const email = body.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)
      ? body.email.toLowerCase().trim().slice(0, 255)
      : null;
    const firstName = (body.firstName || '').toString().slice(0, 100) || null;
    const goalLabel = (body.goalLabel || '').toString().slice(0, 100) || null;

    const existingToken = body.shareToken && UUID_RE.test(body.shareToken) ? body.shareToken : null;

    const row = {
      ...(existingToken ? { share_token: existingToken } : {}),
      email,
      first_name: firstName,
      goal_label: goalLabel,
      inputs: body.inputs,
      outputs: body.outputs,
      utm: body.utm ?? null,
      updated_at: new Date().toISOString(),
    };

    const endpoint = `${supaUrl}/rest/v1/plans`;
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        apikey: supaKey,
        authorization: `Bearer ${supaKey}`,
        'content-type': 'application/json',
        prefer: 'resolution=merge-duplicates,return=representation',
      },
      body: JSON.stringify(row),
    });
    const text = await res.text();
    if (!res.ok) {
      console.error('save-plan db error', res.status, text);
      return new Response(JSON.stringify({ error: 'persist failed' }), {
        status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const rows = JSON.parse(text);
    const saved = Array.isArray(rows) ? rows[0] : rows;
    return new Response(JSON.stringify({
      shareToken: saved.share_token,
      url: `/build-my-plan/results/${saved.share_token}`,
    }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('save-plan exception', err);
    return new Response(JSON.stringify({ error: 'internal error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
