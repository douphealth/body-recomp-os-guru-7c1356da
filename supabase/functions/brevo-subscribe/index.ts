// Edge function: subscribe a body-recomp lead to Brevo with rich attributes,
// fire the welcome email immediately, and let the hourly drip dispatcher
// continue with the 21-day coaching series.
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
  utm?: { source?: string; medium?: string; campaign?: string; term?: string; content?: string };
  consent?: boolean;
  doubleOptIn?: boolean;
  templateId?: number;
  redirectionUrl?: string;
}

const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get('BREVO_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Email service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const body: SubscribePayload = await req.json();
    if (!body?.email || !isEmail(body.email) || body.email.length > 255) {
      return new Response(JSON.stringify({ error: 'Invalid email' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    if (!body.consent) {
      return new Response(JSON.stringify({ error: 'Consent required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const normalizedEmail = body.email.toLowerCase().trim();

    // DB suppression pre-check (don't subscribe known-bad addresses).
    const supaUrlPre = Deno.env.get('SUPABASE_URL');
    const supaKeyPre = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (supaUrlPre && supaKeyPre) {
      const supRes = await fetch(
        `${supaUrlPre}/rest/v1/email_suppressions?contact_email=eq.${encodeURIComponent(normalizedEmail)}&select=reason`,
        { headers: { apikey: supaKeyPre, authorization: `Bearer ${supaKeyPre}` } },
      ).catch(() => null);
      if (supRes?.ok) {
        const rows = await supRes.json().catch(() => []);
        if (Array.isArray(rows) && rows.length > 0) {
          return new Response(
            JSON.stringify({ success: true, suppressed: true, reason: rows[0].reason }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
          );
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
      UTM_SOURCE: body.utm?.source || '',
      UTM_MEDIUM: body.utm?.medium || '',
      UTM_CAMPAIGN: body.utm?.campaign || '',
      OPT_IN_DATE: new Date().toISOString(),
    };

    // Source → Brevo list mapping. IDs from setup-marketing-stack output.
    const listIdBySource: Record<string, number> = {
      plan_gate: 7,       // Body Recomp Subscribers
      exit_popup: 4,      // Exit-Intent Popup
      inline_results: 7,  // Body Recomp Subscribers
      pdf_unlock: 7,      // Body Recomp Subscribers
      footer: 5,          // Blog Subscribers
    };
    const listIds = [listIdBySource[body.source] ?? 7];

    const payload: Record<string, unknown> = {
      email: normalizedEmail,
      attributes,
      listIds,
      updateEnabled: true,
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
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
        'accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    let parsed: any = null;
    try { parsed = text ? JSON.parse(text) : null; } catch {}

    if (res.ok || parsed?.code === 'duplicate_parameter') {
      // Send Day-0 Welcome immediately (template 2). Hourly dispatcher handles Day 2-21.
      let welcomeSent = false;
      if (!useDoi) {
        try {
          const sendRes = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: { 'api-key': apiKey, 'content-type': 'application/json', 'accept': 'application/json' },
            body: JSON.stringify({
              sender: { name: 'Alex · GearUpToFit', email: 'info@gearuptofit.com' },
              to: [{ email: body.email.toLowerCase().trim(), name: body.firstName || undefined }],
              templateId: 2,
              params: {
                FIRSTNAME: body.firstName || 'there',
                GOAL: body.goalLabel || 'body recomposition',
                CALORIE_TARGET: body.calorieTarget || '',
                PROTEIN_G: body.proteinGrams || '',
              },
              tags: ['drip-day-0', 'body-recomp-welcome', `source-${body.source}`],
              headers: { 'X-Mailin-Custom': 'drip:0:2' },
            }),
          });
          welcomeSent = sendRes.ok;
          if (sendRes.ok) {
            const sendJson: any = await sendRes.json().catch(() => ({}));
            const supaUrl = Deno.env.get('SUPABASE_URL');
            const supaKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
            if (supaUrl && supaKey) {
              await fetch(`${supaUrl}/rest/v1/email_drip_log`, {
                method: 'POST',
                headers: {
                  'apikey': supaKey,
                  'authorization': `Bearer ${supaKey}`,
                  'content-type': 'application/json',
                  'prefer': 'return=minimal',
                },
                body: JSON.stringify({
                  contact_email: body.email.toLowerCase().trim(),
                  template_id: 2,
                  day_offset: 0,
                  brevo_message_id: sendJson?.messageId || null,
                  status: 'sent',
                }),
              }).catch(() => {});
            }
          } else {
            const errTxt = await sendRes.text();
            console.error('Welcome send failed', sendRes.status, errTxt);
          }
        } catch (e) {
          console.error('Welcome send exception', e);
        }
      }

      return new Response(JSON.stringify({ success: true, doubleOptIn: useDoi, welcomeSent }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    console.error('Brevo error', res.status, text);
    return new Response(JSON.stringify({ error: 'Subscription failed', detail: parsed?.message || text }),
      { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('brevo-subscribe exception', err);
    return new Response(JSON.stringify({ error: 'Internal error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
