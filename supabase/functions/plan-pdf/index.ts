// Generates (if missing) and serves a signed download URL for a plan's PDF.
// Request:  POST { token: string, regenerate?: boolean }
// Response: { signedUrl, expiresIn, path }
import { PDFDocument, StandardFonts, rgb } from 'npm:pdf-lib@1.17.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const BUCKET = 'plan-pdfs';
const SIGNED_URL_TTL = 60 * 60 * 24 * 7; // 7 days

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

interface PlanRow {
  share_token: string;
  email: string | null;
  first_name: string | null;
  goal_label: string | null;
  inputs: Record<string, any>;
  outputs: Record<string, any>;
  pdf_url: string | null;
  created_at: string;
}

async function fetchPlan(supaUrl: string, supaKey: string, token: string): Promise<PlanRow | null> {
  const res = await fetch(
    `${supaUrl}/rest/v1/plans?share_token=eq.${token}&select=share_token,email,first_name,goal_label,inputs,outputs,pdf_url,created_at`,
    { headers: { apikey: supaKey, authorization: `Bearer ${supaKey}` } },
  );
  if (!res.ok) return null;
  const rows = (await res.json()) as PlanRow[];
  return rows[0] ?? null;
}

async function updatePdfPath(supaUrl: string, supaKey: string, token: string, path: string) {
  await fetch(`${supaUrl}/rest/v1/plans?share_token=eq.${token}`, {
    method: 'PATCH',
    headers: {
      apikey: supaKey,
      authorization: `Bearer ${supaKey}`,
      'content-type': 'application/json',
      prefer: 'return=minimal',
    },
    body: JSON.stringify({ pdf_url: path, updated_at: new Date().toISOString() }),
  });
}

async function uploadPdf(
  supaUrl: string,
  supaKey: string,
  path: string,
  bytes: Uint8Array,
): Promise<boolean> {
  const res = await fetch(`${supaUrl}/storage/v1/object/${BUCKET}/${path}`, {
    method: 'POST',
    headers: {
      apikey: supaKey,
      authorization: `Bearer ${supaKey}`,
      'content-type': 'application/pdf',
      'x-upsert': 'true',
    },
    body: bytes,
  });
  if (!res.ok) {
    console.error('upload failed', res.status, await res.text());
    return false;
  }
  return true;
}

async function signUrl(
  supaUrl: string,
  supaKey: string,
  path: string,
): Promise<string | null> {
  const res = await fetch(`${supaUrl}/storage/v1/object/sign/${BUCKET}/${path}`, {
    method: 'POST',
    headers: {
      apikey: supaKey,
      authorization: `Bearer ${supaKey}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ expiresIn: SIGNED_URL_TTL }),
  });
  if (!res.ok) {
    console.error('sign failed', res.status, await res.text());
    return null;
  }
  const { signedURL, signedUrl } = await res.json();
  const rel = signedUrl || signedURL;
  return rel ? `${supaUrl}/storage/v1${rel}` : null;
}

// ---------- PDF rendering ----------

interface DrawCtx {
  doc: PDFDocument;
  font: any;
  bold: any;
  page: any;
  y: number;
  pageNum: number;
  totalPages: { value: number };
}

const PAGE_W = 595.28; // A4
const PAGE_H = 841.89;
const MARGIN = 48;
const BRAND = rgb(0.91, 0.27, 0.16); // ~#e84528
const INK = rgb(0.08, 0.08, 0.1);
const MUTED = rgb(0.42, 0.42, 0.46);
const RULE = rgb(0.88, 0.88, 0.9);

const sanitize = (s: unknown): string =>
  String(s ?? '')
    // Strip characters StandardFonts (WinAnsi) cannot encode.
    .replace(/[^\x09\x0A\x0D\x20-\x7E\u00A0-\u00FF]/g, '')
    .slice(0, 4000);

function newPage(ctx: DrawCtx) {
  ctx.page = ctx.doc.addPage([PAGE_W, PAGE_H]);
  ctx.y = PAGE_H - MARGIN;
  ctx.pageNum += 1;
  ctx.totalPages.value = ctx.pageNum;
  // Footer band
  ctx.page.drawRectangle({ x: 0, y: 0, width: PAGE_W, height: 28, color: rgb(0.97, 0.97, 0.98) });
  ctx.page.drawText('gearuptofit.com  •  Body Recomp OS', {
    x: MARGIN, y: 10, size: 8, font: ctx.font, color: MUTED,
  });
  ctx.page.drawText(`p. ${ctx.pageNum}`, {
    x: PAGE_W - MARGIN - 30, y: 10, size: 8, font: ctx.font, color: MUTED,
  });
}

function ensure(ctx: DrawCtx, needed: number) {
  if (ctx.y - needed < MARGIN + 28) newPage(ctx);
}

function h1(ctx: DrawCtx, text: string) {
  ensure(ctx, 36);
  ctx.page.drawText(sanitize(text), { x: MARGIN, y: ctx.y - 20, size: 22, font: ctx.bold, color: INK });
  ctx.y -= 28;
  ctx.page.drawRectangle({ x: MARGIN, y: ctx.y, width: 48, height: 3, color: BRAND });
  ctx.y -= 18;
}

function h2(ctx: DrawCtx, text: string) {
  ensure(ctx, 26);
  ctx.y -= 6;
  ctx.page.drawText(sanitize(text).toUpperCase(), {
    x: MARGIN, y: ctx.y - 12, size: 11, font: ctx.bold, color: BRAND,
  });
  ctx.y -= 18;
  ctx.page.drawLine({
    start: { x: MARGIN, y: ctx.y }, end: { x: PAGE_W - MARGIN, y: ctx.y }, thickness: 0.5, color: RULE,
  });
  ctx.y -= 10;
}

function wrap(text: string, font: any, size: number, maxWidth: number): string[] {
  const words = sanitize(text).split(/\s+/);
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    const probe = cur ? `${cur} ${w}` : w;
    if (font.widthOfTextAtSize(probe, size) > maxWidth) {
      if (cur) lines.push(cur);
      cur = w;
    } else cur = probe;
  }
  if (cur) lines.push(cur);
  return lines;
}

function para(ctx: DrawCtx, text: string, opts: { size?: number; bold?: boolean; color?: any } = {}) {
  const size = opts.size ?? 10;
  const font = opts.bold ? ctx.bold : ctx.font;
  const color = opts.color ?? INK;
  const lines = wrap(text, font, size, PAGE_W - MARGIN * 2);
  for (const line of lines) {
    ensure(ctx, size + 4);
    ctx.page.drawText(line, { x: MARGIN, y: ctx.y - size, size, font, color });
    ctx.y -= size + 4;
  }
}

function kv(ctx: DrawCtx, label: string, value: string) {
  ensure(ctx, 16);
  ctx.page.drawText(sanitize(label), { x: MARGIN, y: ctx.y - 11, size: 10, font: ctx.font, color: MUTED });
  ctx.page.drawText(sanitize(value), {
    x: MARGIN + 180, y: ctx.y - 11, size: 10, font: ctx.bold, color: INK,
  });
  ctx.y -= 16;
}

function statBox(ctx: DrawCtx, x: number, w: number, label: string, value: string, sub?: string) {
  const h = 56;
  ctx.page.drawRectangle({
    x, y: ctx.y - h, width: w, height: h,
    color: rgb(0.98, 0.98, 0.99),
    borderColor: RULE, borderWidth: 0.5,
  });
  ctx.page.drawRectangle({ x, y: ctx.y - 3, width: w, height: 3, color: BRAND });
  ctx.page.drawText(sanitize(label).toUpperCase(), {
    x: x + 10, y: ctx.y - 18, size: 7, font: ctx.bold, color: MUTED,
  });
  ctx.page.drawText(sanitize(value), {
    x: x + 10, y: ctx.y - 38, size: 18, font: ctx.bold, color: INK,
  });
  if (sub) {
    ctx.page.drawText(sanitize(sub), {
      x: x + 10, y: ctx.y - 50, size: 8, font: ctx.font, color: MUTED,
    });
  }
}

function statRow(ctx: DrawCtx, items: { label: string; value: string; sub?: string }[]) {
  ensure(ctx, 64);
  const gap = 10;
  const w = (PAGE_W - MARGIN * 2 - gap * (items.length - 1)) / items.length;
  items.forEach((it, i) => statBox(ctx, MARGIN + i * (w + gap), w, it.label, it.value, it.sub));
  ctx.y -= 64;
}

async function renderPdf(plan: PlanRow): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle(`GearUpToFit ${plan.goal_label ?? 'Body Recomp'} Plan`);
  doc.setAuthor('GearUpToFit');
  doc.setCreator('GearUpToFit Body Recomp OS');
  doc.setProducer('GearUpToFit');
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const ctx: DrawCtx = { doc, font, bold, page: null as any, y: 0, pageNum: 0, totalPages: { value: 0 } };
  newPage(ctx);

  // Cover hero
  ctx.page.drawRectangle({ x: 0, y: PAGE_H - 160, width: PAGE_W, height: 160, color: rgb(0.06, 0.07, 0.09) });
  ctx.page.drawRectangle({ x: 0, y: PAGE_H - 164, width: PAGE_W, height: 4, color: BRAND });
  ctx.page.drawText('GEARUPTOFIT', { x: MARGIN, y: PAGE_H - 50, size: 11, font: bold, color: BRAND });
  ctx.page.drawText('Body Recomp OS', { x: MARGIN, y: PAGE_H - 68, size: 9, font, color: rgb(0.8, 0.8, 0.85) });
  ctx.page.drawText(sanitize((plan.goal_label ?? 'Your').toUpperCase() + ' SYSTEM'), {
    x: MARGIN, y: PAGE_H - 110, size: 26, font: bold, color: rgb(1, 1, 1),
  });
  const greet = plan.first_name ? `Built for ${plan.first_name}` : 'Your 8-Week Personalized Plan';
  ctx.page.drawText(sanitize(greet), { x: MARGIN, y: PAGE_H - 132, size: 11, font, color: rgb(0.85, 0.85, 0.9) });
  const issued = new Date(plan.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  ctx.page.drawText(sanitize(`Issued ${issued}`), { x: MARGIN, y: PAGE_H - 148, size: 9, font, color: rgb(0.75, 0.75, 0.8) });
  ctx.y = PAGE_H - 184;

  const o = plan.outputs ?? {};
  const i = plan.inputs ?? {};

  h2(ctx, 'Your numbers');
  statRow(ctx, [
    { label: 'Calories / day', value: String(o.calorieTarget ?? '—'), sub: 'kcal target' },
    { label: 'Protein', value: `${o.proteinGrams ?? '—'} g`, sub: 'per day' },
    { label: 'BMR', value: String(o.bmr ?? '—'), sub: 'kcal at rest' },
  ]);
  statRow(ctx, [
    { label: 'TDEE', value: String(o.tdee ?? '—'), sub: 'maintenance' },
    { label: 'Lean mass', value: `${o.leanBodyMass ?? '—'} kg`, sub: 'estimate' },
    { label: 'Weekly workouts', value: String(i.workoutFrequency ?? '—'), sub: 'sessions/wk' },
  ]);

  h2(ctx, 'Profile');
  kv(ctx, 'Age',             `${i.age ?? '—'} yr`);
  kv(ctx, 'Sex',             `${i.sex ?? '—'}`);
  kv(ctx, 'Weight',          `${i.weightKg ?? '—'} kg`);
  kv(ctx, 'Body fat',        `${i.bodyFatPercent ?? '—'} %`);
  kv(ctx, 'Activity level',  `${i.activityLevel ?? i.workoutFrequency ?? '—'}`);
  kv(ctx, 'Equipment',       `${i.equipmentAccess ?? '—'}`);
  kv(ctx, 'Diet style',      `${i.dietStyle ?? '—'}`);
  if (i.dailySteps) kv(ctx, 'Daily steps', `${i.dailySteps}`);

  if (o.quickSummary) {
    h2(ctx, 'Plan summary');
    para(ctx, String(o.quickSummary));
  }

  if (Array.isArray(o.macroSplit) && o.macroSplit.length) {
    h2(ctx, 'Macros');
    for (const m of o.macroSplit) {
      kv(ctx, String(m.name ?? m.label ?? 'Macro'), `${m.grams ?? '—'} g  •  ${m.calories ?? '—'} kcal`);
    }
  }

  if (Array.isArray(o.weeklyTrainingSplit) && o.weeklyTrainingSplit.length) {
    h2(ctx, 'Weekly training split');
    for (const day of o.weeklyTrainingSplit) {
      const name = day.day ?? day.name ?? 'Day';
      const focus = day.focus ?? day.title ?? day.session ?? '';
      kv(ctx, String(name), String(focus));
      if (Array.isArray(day.exercises)) {
        for (const ex of day.exercises) {
          const line = `• ${ex.name ?? ex} ${ex.sets ? `— ${ex.sets}x${ex.reps ?? ''}` : ''}`.trim();
          para(ctx, line, { size: 9, color: MUTED });
        }
      }
    }
  }

  if (o.cardioPlan || o.recoveryPlan || Array.isArray(o.dailyHabits)) {
    h2(ctx, 'Cardio & recovery');
    if (o.cardioPlan)   para(ctx, `Cardio: ${typeof o.cardioPlan === 'string' ? o.cardioPlan : JSON.stringify(o.cardioPlan)}`);
    if (o.recoveryPlan) para(ctx, `Recovery: ${typeof o.recoveryPlan === 'string' ? o.recoveryPlan : JSON.stringify(o.recoveryPlan)}`);
    if (Array.isArray(o.dailyHabits)) {
      for (const h of o.dailyHabits) para(ctx, `• ${typeof h === 'string' ? h : h.label ?? h.title ?? ''}`, { size: 9 });
    }
  }

  // Science / methodology
  h2(ctx, 'Methodology');
  para(ctx,
    'Your calorie target is the average of two validated equations — Mifflin-St Jeor (1990) and Katch-McArdle ' +
    '— multiplied by an activity factor from your training frequency and daily steps. Protein targets follow ' +
    'ISSN guidance (1.6–2.2 g/kg) scaled to lean body mass. Heart-rate zones use the Karvonen method.',
  );

  // Final CTA page
  newPage(ctx);
  h1(ctx, 'Next 7 days');
  para(ctx, '1. Hit your protein target every day. It is the single biggest lever.', { size: 11 });
  para(ctx, '2. Complete every prescribed training session — log weights and reps.', { size: 11 });
  para(ctx, '3. Average your daily step target across the week, not every single day.', { size: 11 });
  para(ctx, '4. Track weight every morning post-bathroom and use a 7-day rolling average.', { size: 11 });
  para(ctx, '5. Re-open your live plan dashboard for daily check-ins and updates.', { size: 11 });

  ctx.y -= 16;
  ctx.page.drawRectangle({
    x: MARGIN, y: ctx.y - 70, width: PAGE_W - MARGIN * 2, height: 70,
    color: rgb(0.06, 0.07, 0.09),
  });
  ctx.page.drawRectangle({ x: MARGIN, y: ctx.y - 3, width: PAGE_W - MARGIN * 2, height: 3, color: BRAND });
  ctx.page.drawText('Open your live plan', { x: MARGIN + 16, y: ctx.y - 26, size: 13, font: bold, color: rgb(1, 1, 1) });
  ctx.page.drawText(
    `gearuptofit.com/fitness-plan/results/${plan.share_token}`,
    { x: MARGIN + 16, y: ctx.y - 46, size: 10, font, color: rgb(0.85, 0.85, 0.9) },
  );
  ctx.page.drawText('Always up to date. Re-runs your numbers as you progress.', {
    x: MARGIN + 16, y: ctx.y - 60, size: 8, font, color: rgb(0.7, 0.7, 0.75),
  });

  return await doc.save();
}

// ---------- handler ----------

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const supaUrl = Deno.env.get('SUPABASE_URL');
  const supaKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supaUrl || !supaKey) return json({ error: 'Server not configured' }, 500);

  let body: { token?: string; regenerate?: boolean };
  try { body = await req.json(); } catch { return json({ error: 'Invalid JSON' }, 400); }

  const token = (body.token ?? '').toString();
  if (!UUID_RE.test(token)) return json({ error: 'Invalid token' }, 400);

  try {
    const plan = await fetchPlan(supaUrl, supaKey, token);
    if (!plan) return json({ error: 'Plan not found' }, 404);

    let path = plan.pdf_url || '';
    const needsBuild = body.regenerate || !path;

    if (needsBuild) {
      const bytes = await renderPdf(plan);
      path = `${token}.pdf`;
      const ok = await uploadPdf(supaUrl, supaKey, path, bytes);
      if (!ok) return json({ error: 'Upload failed' }, 502);
      await updatePdfPath(supaUrl, supaKey, token, path);
    }

    const signed = await signUrl(supaUrl, supaKey, path);
    if (!signed) return json({ error: 'Sign failed' }, 502);

    return json({ signedUrl: signed, expiresIn: SIGNED_URL_TTL, path });
  } catch (err) {
    console.error('plan-pdf exception', err);
    return json({ error: 'internal error' }, 500);
  }
});
