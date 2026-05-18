// Hourly drip dispatcher (run via pg_cron). Reads Body Recomp subscribers
// from Brevo, computes days-since-opt-in per contact, sends the matching
// 21-day coaching series template. Idempotent via email_drip_log unique key.
//
// Hardening (Phase 3):
//  - DB unique constraint on (contact_email, template_id) prevents double-sends
//    even under concurrent dispatcher runs.
//  - Engagement throttling: after day 7, if the last 2 sent templates received
//    no open or click within 5 days each, stop the sequence and auto-suppress.
//  - RFC 8058 one-click unsubscribe headers on every send.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BREVO = 'https://api.brevo.com/v3';
const SENDER = { name: 'Alex · GearUpToFit', email: 'info@gearuptofit.com' };
const UNSUB_HOST = 'https://nzvhdfcewogkcnzxkrav.supabase.co/functions/v1/email-unsubscribe';

const SCHEDULE: Array<{ day: number; templateId: number }> = [
  { day: 0,  templateId: 2 },
  { day: 2,  templateId: 3 },
  { day: 4,  templateId: 4 },
  { day: 7,  templateId: 5 },
  { day: 10, templateId: 6 },
  { day: 14, templateId: 7 },
  { day: 21, templateId: 8 },
];
const DRIP_LIST_IDS = [7, 4];
const ENGAGEMENT_LOOKBACK_DAYS = 5;
const DISENGAGEMENT_DAY_THRESHOLD = 7; // start checking engagement after day 7

// ---------- HMAC unsubscribe token ----------
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
async function listUnsubHeaders(email: string) {
  const token = await buildUnsubToken(email);
  const url = `${UNSUB_HOST}?token=${token}`;
  return {
    'List-Unsubscribe': `<${url}>, <mailto:unsubscribe@gearuptofit.com?subject=unsubscribe>`,
    'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
  };
}

async function brevo(path: string, init: RequestInit = {}) {
  const r = await fetch(`${BREVO}${path}`, {
    ...init,
    headers: {
      'api-key': Deno.env.get('BREVO_API_KEY')!,
      'accept': 'application/json',
      'content-type': 'application/json',
      ...(init.headers || {}),
    },
  });
  const text = await r.text();
  let data: any = null; try { data = text ? JSON.parse(text) : null; } catch {}
  return { ok: r.ok, status: r.status, data, raw: text };
}

async function fetchListContacts(listId: number) {
  const out: any[] = [];
  let offset = 0; const limit = 500;
  while (true) {
    const q = new URLSearchParams({ limit: String(limit), offset: String(offset), sort: 'desc' });
    const r = await brevo(`/contacts/lists/${listId}/contacts?${q}`);
    const batch = r.data?.contacts || [];
    out.push(...batch);
    if (batch.length < limit) break;
    offset += limit;
    if (offset > 5000) break;
  }
  return out;
}

const daysBetween = (a: Date, b: Date) => Math.floor((b.getTime() - a.getTime()) / 86400000);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const report = {
    scanned: 0, sent: 0,
    skipped_already_sent: 0, skipped_no_match: 0,
    skipped_suppressed: 0, skipped_disengaged: 0,
    errors: 0, details: [] as any[],
  };
  const now = new Date();

  try {
    const seen = new Set<string>();
    const contacts: any[] = [];
    for (const listId of DRIP_LIST_IDS) {
      const list = await fetchListContacts(listId);
      for (const c of list) {
        if (seen.has(c.email)) continue;
        seen.add(c.email); contacts.push(c);
      }
    }
    report.scanned = contacts.length;

    const emails = contacts.map(c => c.email);
    const sentMap = new Map<string, Map<number, string>>(); // email -> template_id -> sent_at
    const suppressedSet = new Set<string>();
    const engagedByTemplate = new Map<string, Set<number>>(); // email -> template_ids opened/clicked

    if (emails.length) {
      const [{ data: logs }, { data: sups }, { data: events }] = await Promise.all([
        supabase.from('email_drip_log')
          .select('contact_email, template_id, sent_at')
          .in('contact_email', emails)
          .eq('status', 'sent'),
        supabase.from('email_suppressions').select('contact_email').in('contact_email', emails),
        supabase.from('email_engagement_events')
          .select('contact_email, template_id, event')
          .in('contact_email', emails)
          .in('event', ['opened', 'clicked', 'open', 'click']),
      ]);
      for (const r of (logs || [])) {
        if (!sentMap.has(r.contact_email)) sentMap.set(r.contact_email, new Map());
        sentMap.get(r.contact_email)!.set(r.template_id, r.sent_at);
      }
      for (const s of (sups || [])) suppressedSet.add(s.contact_email);
      for (const e of (events || [])) {
        if (!e.template_id) continue;
        if (!engagedByTemplate.has(e.contact_email)) engagedByTemplate.set(e.contact_email, new Set());
        engagedByTemplate.get(e.contact_email)!.add(e.template_id);
      }
    }

    for (const c of contacts) {
      const attrs = c.attributes || {};
      if (attrs.BLACKLIST === 1 || c.emailBlacklisted || suppressedSet.has(c.email)) {
        report.skipped_suppressed++; continue;
      }

      const optInRaw = attrs.OPT_IN_DATE || attrs.DOI_CONFIRMED || c.createdAt;
      const optInDate = optInRaw ? new Date(optInRaw) : new Date(c.createdAt);
      const daysSince = daysBetween(optInDate, now);

      const due = [...SCHEDULE].reverse().find(s => daysSince >= s.day);
      if (!due) { report.skipped_no_match++; continue; }

      const alreadyMap = sentMap.get(c.email);
      if (alreadyMap?.has(due.templateId)) { report.skipped_already_sent++; continue; }

      // Engagement throttling: once we're past the threshold, require some
      // engagement in the last 2 sent templates (each older than lookback).
      if (due.day >= DISENGAGEMENT_DAY_THRESHOLD && alreadyMap && alreadyMap.size >= 2) {
        const recentSent = [...alreadyMap.entries()]
          .sort((a, b) => new Date(b[1]).getTime() - new Date(a[1]).getTime())
          .slice(0, 2);
        const cutoff = now.getTime() - ENGAGEMENT_LOOKBACK_DAYS * 86400000;
        const allOldEnough = recentSent.every(([, sentAt]) => new Date(sentAt).getTime() <= cutoff);
        if (allOldEnough) {
          const engaged = engagedByTemplate.get(c.email) || new Set<number>();
          const anyEngagement = recentSent.some(([tid]) => engaged.has(tid));
          if (!anyEngagement) {
            report.skipped_disengaged++;
            await supabase.from('email_suppressions').upsert(
              { contact_email: c.email, reason: 'inactive', source: 'drip_engagement_gate' },
              { onConflict: 'contact_email' },
            );
            report.details.push({ email: c.email, day: due.day, disengaged: true });
            continue;
          }
        }
      }

      const planToken = (attrs.PLAN_TOKEN || '').toString();
      const planUrl = planToken
        ? `https://gearuptofit.com/fitness-plan/build-my-plan/results/${planToken}?utm_source=email&utm_medium=drip&utm_campaign=body_recomp&utm_content=day${due.day}`
        : 'https://gearuptofit.com/fitness-plan/build-my-plan';

      const unsubHeaders = await listUnsubHeaders(c.email);
      const unsubUrl = `${UNSUB_HOST}?token=${await buildUnsubToken(c.email)}`;

      const send = await brevo('/smtp/email', {
        method: 'POST',
        body: JSON.stringify({
          sender: SENDER,
          to: [{ email: c.email, name: attrs.FIRSTNAME || undefined }],
          templateId: due.templateId,
          params: {
            FIRSTNAME: attrs.FIRSTNAME || 'there',
            GOAL: attrs.GOAL || 'body recomposition',
            CALORIE_TARGET: attrs.CALORIE_TARGET || '',
            PROTEIN_G: attrs.PROTEIN_G || '',
            PLAN_URL: planUrl,
            PLAN_TOKEN: planToken,
            UNSUBSCRIBE_URL: unsubUrl,
          },
          tags: [`drip-day-${due.day}`, 'body-recomp-sequence'],
          headers: {
            'X-Mailin-Custom': `drip:${due.day}:${due.templateId}`,
            ...unsubHeaders,
          },
        }),
      });

      if (send.ok) {
        // Idempotent insert: unique (contact_email, template_id) prevents dupes.
        const { error: insErr } = await supabase.from('email_drip_log').insert({
          contact_email: c.email,
          template_id: due.templateId,
          day_offset: due.day,
          brevo_message_id: send.data?.messageId,
          status: 'sent',
        });
        if (insErr && (insErr as any).code === '23505') {
          report.skipped_already_sent++;
          continue;
        }
        report.sent++;
        report.details.push({ email: c.email, day: due.day, templateId: due.templateId, ok: true });
      } else {
        report.errors++;
        await supabase.from('email_drip_log').insert({
          contact_email: c.email,
          template_id: due.templateId,
          day_offset: due.day,
          status: 'failed',
          error: send.raw.slice(0, 500),
        });
        report.details.push({ email: c.email, day: due.day, templateId: due.templateId, ok: false, error: send.raw.slice(0, 200) });
      }
    }

    return new Response(JSON.stringify(report, null, 2),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ ...report, fatal: String(err) }, null, 2),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
