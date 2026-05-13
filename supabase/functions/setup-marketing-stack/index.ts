// One-shot Brevo setup: custom attributes, lists, sender, DOI template.
// Idempotent. Run once after deploy + on schema changes.
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const BREVO = 'https://api.brevo.com/v3';

async function brevo(path: string, init: RequestInit = {}) {
  const apiKey = Deno.env.get('BREVO_API_KEY')!;
  const res = await fetch(`${BREVO}${path}`, {
    ...init,
    headers: {
      'api-key': apiKey,
      'accept': 'application/json',
      'content-type': 'application/json',
      ...(init.headers || {}),
    },
  });
  const text = await res.text();
  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch {}
  return { ok: res.ok, status: res.status, data, raw: text };
}

const REQUIRED_ATTRIBUTES: Array<{ name: string; type: 'text' | 'float' | 'date' | 'boolean' }> = [
  { name: 'SOURCE',          type: 'text' },
  { name: 'GOAL',            type: 'text' },
  { name: 'CALORIE_TARGET',  type: 'float' },
  { name: 'PROTEIN_G',       type: 'float' },
  { name: 'WORKOUT_FREQ',    type: 'float' },
  { name: 'UTM_SOURCE',      type: 'text' },
  { name: 'UTM_MEDIUM',      type: 'text' },
  { name: 'UTM_CAMPAIGN',    type: 'text' },
  { name: 'OPT_IN_DATE',     type: 'date' },
];

async function ensureBrevoAttributes() {
  const existing = await brevo('/contacts/attributes');
  const have = new Set<string>(
    (existing.data?.attributes || []).map((a: any) => `${a.category}:${a.name}`)
  );
  const created: string[] = [];
  const skipped: string[] = [];
  for (const attr of REQUIRED_ATTRIBUTES) {
    if (have.has(`normal:${attr.name}`)) { skipped.push(attr.name); continue; }
    const r = await brevo(`/contacts/attributes/normal/${encodeURIComponent(attr.name)}`, {
      method: 'POST',
      body: JSON.stringify({ type: attr.type }),
    });
    if (r.ok || r.status === 204) created.push(attr.name);
    else skipped.push(`${attr.name}(${r.status})`);
  }
  return { created, skipped };
}

const REQUIRED_LISTS = [
  { key: 'body_recomp', name: 'Body Recomp Subscribers' },
  { key: 'exit_popup',  name: 'Exit-Intent Popup' },
  { key: 'blog',        name: 'Blog Subscribers' },
];

async function ensureBrevoLists(): Promise<Record<string, number>> {
  const all = await brevo('/contacts/lists?limit=50');
  const byName = new Map<string, number>();
  for (const l of (all.data?.lists || [])) byName.set(l.name, l.id);

  const folders = await brevo('/contacts/folders?limit=10');
  let folderId = folders.data?.folders?.[0]?.id;
  if (!folderId) {
    const f = await brevo('/contacts/folders', {
      method: 'POST',
      body: JSON.stringify({ name: 'GearUpToFit' }),
    });
    folderId = f.data?.id;
  }

  const map: Record<string, number> = {};
  for (const l of REQUIRED_LISTS) {
    if (byName.has(l.name)) {
      map[l.key] = byName.get(l.name)!;
      continue;
    }
    const r = await brevo('/contacts/lists', {
      method: 'POST',
      body: JSON.stringify({ name: l.name, folderId }),
    });
    if (r.ok && r.data?.id) map[l.key] = r.data.id;
  }
  return map;
}

const PRIMARY_SENDER_EMAIL = 'info@gearuptofit.com';
const PRIMARY_SENDER_NAME  = 'Alex · GearUpToFit';

async function ensureBrevoSender() {
  const senders = await brevo('/senders');
  const list = senders.data?.senders || [];
  let existing = list.find((s: any) => s.email?.toLowerCase() === PRIMARY_SENDER_EMAIL);
  if (!existing) {
    const created = await brevo('/senders', {
      method: 'POST',
      body: JSON.stringify({ name: PRIMARY_SENDER_NAME, email: PRIMARY_SENDER_EMAIL }),
    });
    existing = { id: created.data?.id, email: PRIMARY_SENDER_EMAIL, active: false };
  }
  let validation: any = { skipped: true };
  if (existing?.id && !existing.active) {
    const v = await brevo(`/senders/${existing.id}/validate`, { method: 'PUT' });
    validation = { triggered: v.ok, status: v.status, note: 'check info@gearuptofit.com inbox' };
  }
  return { id: existing.id, email: existing.email, active: existing.active, validation };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  const report: Record<string, unknown> = {};
  try {
    const acct = await brevo('/account');
    report.brevo_connection = acct.ok
      ? { ok: true, plan: acct.data?.plan?.[0]?.type, email: acct.data?.email }
      : { ok: false, status: acct.status, error: acct.raw.slice(0, 300) };
    if (!acct.ok) {
      return new Response(JSON.stringify({ ...report, aborted: true }, null, 2),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    report.brevo_attributes = await ensureBrevoAttributes();
    report.brevo_lists = await ensureBrevoLists();
    report.brevo_sender = await ensureBrevoSender();

    return new Response(JSON.stringify(report, null, 2),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ ...report, error: String(err) }, null, 2),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
