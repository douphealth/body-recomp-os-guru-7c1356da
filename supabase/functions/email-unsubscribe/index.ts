// Public unsubscribe endpoint. Adds the email to DB suppression list and Brevo blacklist.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    const { email, reason } = await req.json();
    const e = String(email || '').toLowerCase().trim();
    if (!e || !isEmail(e) || e.length > 255) {
      return new Response(JSON.stringify({ error: 'Invalid email' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    await supabase.from('email_suppressions').upsert(
      { contact_email: e, reason: reason || 'user_unsubscribed', source: 'unsubscribe_page' },
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

    return new Response(JSON.stringify({ ok: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
