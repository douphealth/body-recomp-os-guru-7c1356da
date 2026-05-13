// One-off admin function: writes Brevo templates 2-8 with SOTA, human-written
// body-recomp coaching content branded for GearUpToFit. Invoke once after deploy.
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BREVO = 'https://api.brevo.com/v3';
const SENDER = { name: 'Alex · GearUpToFit', email: 'info@gearuptofit.com' };
const REPLY_TO = { name: 'Alex · GearUpToFit', email: 'info@gearuptofit.com' };

// ---------- design tokens (mirror app dark + red theme) ----------
const RED = '#E53935';
const RED_DARK = '#B71C1C';
const BG = '#0A0A0F';
const PANEL = '#13131C';
const PANEL_2 = '#1B1B26';
const BORDER = '#26263A';
const TEXT = '#EDEDF0';
const MUTED = '#9C9CAB';
const LINK = '#FF6B5E';

const layout = (opts: {
  title: string;
  preheader: string;
  dayBadge: string;
  inner: string;
  footerCta: string;
}) => `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark light"><meta name="supported-color-schemes" content="dark light"><title>${opts.title}</title></head>
<body style="margin:0;padding:0;background:${BG};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,Helvetica,Arial,sans-serif;color:${TEXT};-webkit-font-smoothing:antialiased;">
<div style="display:none;font-size:1px;color:${BG};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${opts.preheader}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BG};padding:32px 12px;"><tr><td align="center">
  <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:${PANEL};border:1px solid ${BORDER};border-radius:18px;overflow:hidden;box-shadow:0 24px 60px rgba(229,57,53,0.08);">
    <tr><td style="background:linear-gradient(135deg,${PANEL} 0%,#1A1424 100%);padding:24px 32px;border-bottom:1px solid ${BORDER};">
      <table width="100%"><tr>
        <td>
          <div style="font-family:'Oswald','Bebas Neue','Arial Narrow',Arial,sans-serif;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;font-size:18px;color:${TEXT};">GEAR<span style="color:${RED}">UP</span>TOFIT</div>
          <div style="font-size:10px;color:${MUTED};letter-spacing:2px;text-transform:uppercase;margin-top:4px;font-weight:600;">Body Recomp OS · 21-Day Coaching Series</div>
        </td>
        <td align="right">
          <span style="display:inline-block;background:${RED};color:#fff;font-size:10px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;padding:6px 12px;border-radius:999px;font-family:'Oswald',Arial,sans-serif;">${opts.dayBadge}</span>
        </td>
      </tr></table>
    </td></tr>
    <tr><td style="padding:36px 32px 28px;">${opts.inner}</td></tr>
    <tr><td style="padding:24px 32px 32px;border-top:1px solid ${BORDER};background:#10101A;">${opts.footerCta}</td></tr>
  </table>
  <table role="presentation" width="600" style="max-width:600px;width:100%;margin-top:18px;"><tr><td style="text-align:center;font-size:11px;color:${MUTED};line-height:1.7;padding:8px 16px;">
    You are receiving this email because you used the free body-recomposition planner at gearuptofit.com and opted in to the 21-day coaching series. Reply any time — Alex personally reads and answers.<br><br>
    <strong style="color:${TEXT};">GearUpToFit</strong> · Alexios Papaioannou, Certified Strength &amp; Nutrition Coach<br>
    Postal: 25is Martiou 12, 26442 Patras, Greece · <a href="mailto:info@gearuptofit.com" style="color:${MUTED};text-decoration:underline;">info@gearuptofit.com</a><br><br>
    <a href="https://gearuptofit.com/fitness-plan/?utm_source=body-recomp&amp;utm_medium=email" style="color:${MUTED};text-decoration:underline;">Visit site</a> ·
    <a href="{{ unsubscribe }}" style="color:${MUTED};text-decoration:underline;">Unsubscribe in one click</a> ·
    <a href="{{ mirror }}" style="color:${MUTED};text-decoration:underline;">View in browser</a><br>
    <span style="opacity:0.7;">© ${new Date().getFullYear()} GearUpToFit. Educational content — not medical advice. Consult a physician before starting any new training or nutrition program.</span>
  </td></tr></table>
</td></tr></table></body></html>`;

const eyebrow = (t: string) => `<div style="font-size:11px;letter-spacing:2.5px;text-transform:uppercase;color:${RED};font-weight:800;margin:0 0 12px;font-family:'Oswald',Arial,sans-serif;">${t}</div>`;
const h1 = (t: string) => `<h1 style="font-family:'Oswald','Bebas Neue',Arial,sans-serif;font-weight:700;font-size:34px;line-height:1.1;margin:0 0 18px;color:${TEXT};letter-spacing:-0.5px;">${t}</h1>`;
const h2 = (t: string) => `<h2 style="font-family:'Oswald',Arial,sans-serif;font-size:20px;line-height:1.25;margin:32px 0 12px;color:${TEXT};font-weight:700;letter-spacing:0.2px;text-transform:uppercase;">${t}</h2>`;
const p = (t: string) => `<p style="font-size:16px;line-height:1.7;margin:0 0 16px;color:${TEXT};">${t}</p>`;
const small = (t: string) => `<p style="font-size:13px;line-height:1.6;margin:0 0 12px;color:${MUTED};">${t}</p>`;
const a = (href: string, t: string) => `<a href="${href}" style="color:${LINK};text-decoration:underline;font-weight:600;">${t}</a>`;
const btn = (href: string, t: string) => `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px auto 4px;"><tr><td style="background:linear-gradient(135deg,${RED} 0%,${RED_DARK} 100%);border-radius:12px;box-shadow:0 8px 20px rgba(229,57,53,0.35);"><a href="${href}" style="display:inline-block;padding:16px 28px;color:#fff;font-weight:800;text-decoration:none;font-size:14px;letter-spacing:1px;text-transform:uppercase;font-family:'Oswald',Arial,sans-serif;">${t} →</a></td></tr></table>`;
const callout = (t: string) => `<table width="100%" style="margin:18px 0;"><tr><td style="border-left:4px solid ${RED};background:${PANEL_2};padding:16px 20px;border-radius:10px;"><p style="margin:0;font-size:15px;line-height:1.65;color:${TEXT};">${t}</p></td></tr></table>`;
const stat = (val: string, label: string) => `<td style="background:${PANEL_2};border:1px solid ${BORDER};border-radius:12px;padding:18px 14px;text-align:center;width:33%;"><div style="font-family:'Oswald',Arial,sans-serif;font-size:30px;font-weight:700;color:${RED};line-height:1;">${val}</div><div style="font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:${MUTED};margin-top:6px;font-weight:700;">${label}</div></td>`;
const statRow = (cells: string[]) => `<table width="100%" cellspacing="8" cellpadding="0" style="margin:18px 0;"><tr>${cells.join('<td style="width:8px;"></td>')}</tr></table>`;
const list = (items: string[]) => `<ul style="margin:0 0 18px;padding:0 0 0 22px;color:${TEXT};font-size:16px;line-height:1.75;">${items.map(i => `<li style="margin:0 0 10px;">${i}</li>`).join('')}</ul>`;
const checklist = (items: string[]) => `<table width="100%" style="margin:8px 0 18px;">${items.map(i => `<tr><td valign="top" style="width:28px;padding:6px 0;"><div style="width:20px;height:20px;border-radius:6px;background:${RED};color:#fff;font-weight:800;font-size:12px;text-align:center;line-height:20px;font-family:'Oswald',Arial,sans-serif;">✓</div></td><td style="padding:6px 0 6px 4px;font-size:15px;line-height:1.6;color:${TEXT};">${i}</td></tr>`).join('')}</table>`;
const divider = () => `<div style="height:1px;background:${BORDER};margin:28px 0;"></div>`;
const ps = (t: string) => `<p style="font-size:14px;line-height:1.6;margin:24px 0 0;color:${MUTED};font-style:italic;border-top:1px dashed ${BORDER};padding-top:16px;"><strong style="color:${RED};font-style:normal;">P.S.</strong> ${t}</p>`;
const sig = () => `<p style="font-size:16px;line-height:1.6;margin:28px 0 0;color:${TEXT};">Train smart,<br><strong style="font-family:'Oswald',Arial,sans-serif;font-size:20px;letter-spacing:0.3px;">Alex</strong><br><span style="color:${MUTED};font-size:13px;">Head Coach · GearUpToFit · 18 yrs coaching, 600+ recomp transformations</span></p>`;
// IMPORTANT: the React app is mounted on the WordPress host at /fitness-plan/.
// All in-app links MUST include that base path or the visitor will hit the
// WordPress 404 page (this was the cause of the broken "Open My Plan" CTA).
const APP_BASE = 'https://gearuptofit.com/fitness-plan';
const utm = (slug: string, c: string) => `${APP_BASE}/${slug.replace(/^\/+/, '')}?utm_source=body-recomp&utm_medium=email&utm_campaign=${c}`;

// ===================================================================
// DAY 0 — Welcome + Plan
// ===================================================================
const T2 = {
  subject: '🎯 {{ params.FIRSTNAME | default : "There" }}, your 8-week body recomp plan is live',
  html: layout({
    title: 'Your 8-Week Body Recomp Plan',
    preheader: 'Your calorie target, macros, training split & 21-day coaching series start now.',
    dayBadge: 'Day 0 · Start',
    inner:
      eyebrow('Welcome to Body Recomp OS') +
      h1('Your plan is locked in, {{ params.FIRSTNAME | default : "there" }}.') +
      p('I\'m Alex — head coach at GearUpToFit. I\'ve walked 600+ everyday lifters through body recomposition (lose fat, keep — or build — muscle, at the same time). It\'s harder than a straight cut, easier than people make it out to be, and it works <em>only</em> when four levers are pulled together.') +
      p('You just built your plan. The next <strong>21 days</strong> of this email series will quietly install the four levers — protein, training, NEAT, recovery — into your week so the math actually plays out on the scale and in the mirror.') +
      callout('🎯 Your daily calorie target: <strong>{{ params.CALORIE_TARGET | default : "see your dashboard" }} kcal</strong><br>🥩 Protein anchor: <strong>{{ params.PROTEIN_G | default : "see your dashboard" }} g/day</strong><br>📊 Goal: <strong>{{ params.GOAL | default : "Body Recomposition" }}</strong>') +
      statRow([stat('8', 'Weeks'), stat('4', 'Levers'), stat('21', 'Days of Coaching')]) +
      h2('Why "recomp" beats a crash cut') +
      p('A 2016 McMaster study (Longland et al.) put two groups in a 40% deficit for 4 weeks. The high-protein + resistance-training group lost <strong>4.8 kg of fat AND gained 1.2 kg of lean mass</strong>. The control group lost fat but also <em>lost</em> muscle. Same calories. Different physiology. That\'s the entire game.') +
      h2('Your week-1 game plan (do these 3 things)') +
      checklist([
        '<strong>Hit your protein floor every day.</strong> Even on rest days. Even when you\'re not hungry. This is the muscle insurance policy.',
        '<strong>Lift 3–4x this week</strong> using the split in your dashboard. Heavy enough to need the rest periods. Don\'t chase a sweat — chase reps.',
        '<strong>Walk to your step target every day.</strong> Treat it like brushing your teeth. Non-negotiable. This is the hidden lever 90% of people skip.',
      ]) +
      p('Tomorrow → the <strong>Week-1 setup</strong> email. Kitchen, training, tracking. The tiny pre-week effort that decides if week 6 happens or you give up at day 11. (I\'ve seen both, hundreds of times.)') +
      sig() +
      ps('Your plan is built on 12+ data points — bodyweight, body fat, training history, age, sex, NEAT, dietary preference and more. If anything feels off in the first week, hit reply. I\'ll personally help you re-tune.'),
    footerCta:
      p('<strong style="color:' + TEXT + ';">Re-open the planner any time</strong> — your numbers are derived from the inputs you provided. To view your dashboard or download the PDF, re-enter the wizard on the device you used:') +
      btn(utm('build-my-plan/', 'welcome'), 'Open The Planner') +
      small('Free tools you can use right now (no login needed): ' + a(utm('free-fitness-calculators/tdee-calculator/', 'welcome'), 'TDEE calculator') + ' · ' + a(utm('free-fitness-calculators/macro-calculator/', 'welcome'), 'Macro calculator') + ' · ' + a(utm('free-fitness-calculators/protein-calculator/', 'welcome'), 'Protein needs by goal')),
  }),
};

// ===================================================================
// DAY 2 — Week-1 Setup
// ===================================================================
const T3 = {
  subject: '🍳 Day 2 · The 30-min kitchen setup that saves week 6',
  html: layout({
    title: 'Week-1 Setup',
    preheader: 'Kitchen, training prep, tracking. The tiny pre-week that decides everything.',
    dayBadge: 'Day 2 · Setup',
    inner:
      eyebrow('Coaching Series · Email 2 of 7') +
      h1('Week 6 is won (or lost) on Day 2.') +
      p('{{ params.FIRSTNAME | default : "Hey" }} — quick truth.') +
      p('In 18 years of coaching, I\'ve never had a client fail because the program was wrong. They fail because <strong>Tuesday at 7pm</strong> they\'re tired, hungry, and there\'s nothing in the fridge that hits {{ params.PROTEIN_G | default : "their" }} g of protein. That moment compounds. Five of those moments and the plan is dead.') +
      p('Today we de-fang Tuesday at 7pm. 30 minutes, three lists, one small grocery run.') +
      h2('1. The protein anchors list (build this first)') +
      checklist([
        '<strong>3 fast proteins:</strong> rotisserie chicken, Greek yogurt 2%, cottage cheese, canned tuna, pre-cooked shrimp, eggs, deli turkey. Pick what you actually like.',
        '<strong>1 batch protein:</strong> 1.2 kg of chicken thighs / lean beef / tofu / tempeh slow-cooked Sunday for the week.',
        '<strong>1 emergency protein:</strong> a quality whey or plant protein. The "I have 90 seconds" insurance policy.',
      ]) +
      h2('2. The training prep') +
      list([
        '👟 Lay out your gym kit the night before. Friction-free.',
        '📅 Book your sessions like meetings. Same days, same times this week.',
        '📓 Open the app, screenshot the first session\'s lifts. No improvising mid-set.',
      ]) +
      h2('3. The tracking minimum (this matters)') +
      callout('Track <strong>only two numbers daily</strong> for week 1: total protein (g) and steps. Skip macros, skip calories, skip body weight. Two numbers. That\'s it. Week 2 we add one more. We compound habits, we don\'t bury you in spreadsheets on day 2.') +
      h2('The 80/20 of week 1') +
      p('Most people try to be perfect for 4 days, blow up day 5, quit day 7. Aim for <strong>80% adherence</strong> on protein + steps + lifts. Eighty percent for 8 weeks beats 100% for 9 days every single time. Mathematically. Physiologically. Psychologically.') +
      sig() +
      ps('Day 4 → protein. The single most misunderstood macro and the lever with the highest ROI for body recomposition. Don\'t skip it — it changes how you\'ll eat for the rest of your life.'),
    footerCta:
      btn(utm('build-my-plan/', 'setup'), 'Open My Dashboard') +
      small('Reply with one obstacle from your week 1 — work travel, dinner out, kids\' bedtime — and I\'ll send you a 1-line workaround.'),
  }),
};

// ===================================================================
// DAY 4 — Protein Truth
// ===================================================================
const T4 = {
  subject: '🥩 Day 4 · The protein number that changes everything',
  html: layout({
    title: 'Protein Truth',
    preheader: '1.6 g/kg, when to eat it, why MPS plateaus at 30g, and the real reason most diets fail.',
    dayBadge: 'Day 4 · Protein',
    inner:
      eyebrow('Coaching Series · Email 3 of 7') +
      h1('1.6 to 2.2.') +
      p('{{ params.FIRSTNAME | default : "Hey" }} — write these two numbers on the inside of your fridge:') +
      statRow([stat('1.6', 'g / kg / day'), stat('2.2', 'g / kg in deficit'), stat('30', 'g per meal')]) +
      p('A 2018 meta-analysis in the British Journal of Sports Medicine (Morton et al.) pooled 49 studies, 1,863 lifters. The breakpoint was clean: <strong>1.6 g of protein per kg of bodyweight</strong> per day maximised lean mass gains from training. In a calorie deficit (you, right now): bump it to <strong>2.0–2.2 g/kg</strong> to defend muscle while you cut.') +
      h2('Why protein wins recomp') +
      list([
        '🔥 <strong>Highest thermic effect</strong> of any macro — 25–30% of protein calories burn during digestion vs ~5% for carbs and ~3% for fats. Free deficit.',
        '🛡 <strong>Anti-catabolic.</strong> The amino-acid pool keeps your body building, not breaking down, even when calories are low.',
        '😴 <strong>Most satiating macro by a mile.</strong> The reason hunger doesn\'t spike like it does on a low-protein cut.',
      ]) +
      h2('Spread it across 3–5 meals') +
      p('Muscle protein synthesis (MPS) plateaus at roughly <strong>30–40g of protein per feeding</strong> in adults — extra protein in one sitting just oxidises. This is the science behind: <em>don\'t put 100g of protein in dinner and 5g in breakfast.</em>') +
      callout('🎯 <strong>Your daily protein:</strong> {{ params.PROTEIN_G | default : "see dashboard" }} g.<br>Divide into 4 hits of ~25–35g each. Anchor one to every meal + an evening Greek yogurt or casein shake. Done.') +
      h2('5 meals that hit 30g+') +
      checklist([
        '🍳 3 whole eggs + 50g egg whites scrambled + a slice of sourdough = 32g',
        '🍗 200g rotisserie chicken + rice + salsa = 50g',
        '🐟 1 can tuna + 200g 2% Greek yogurt mixed in a wrap = 45g',
        '🥩 150g lean beef stir-fry with peppers + jasmine rice = 38g',
        '🥛 250g cottage cheese + frozen berries + honey = 32g',
      ]) +
      p('Nail this one variable for 4 weeks and your body composition shifts even if everything else stays mediocre. It\'s the closest thing to a cheat code in nutrition.') +
      sig() +
      ps('Day 7 (Sunday) → the lever no one talks about: NEAT. Why your <em>step count</em> matters more than your cardio. The fix is shockingly low-effort and adds up to 400 kcal/day for most people.'),
    footerCta:
      btn(utm('free-fitness-calculators/protein-calculator/', 'protein'), 'Recalculate My Protein') +
      small('Reply with what you ate yesterday — I\'ll show you exactly where the 30g protein gaps are. Free, no catch.'),
  }),
};

// ===================================================================
// DAY 7 — NEAT & Steps
// ===================================================================
const T5 = {
  subject: '👟 Day 7 · The 8,000-step lever that quietly out-burns cardio',
  html: layout({
    title: 'NEAT & Steps',
    preheader: 'Why your step count matters more than your cardio, and how to add 400 kcal/day without trying.',
    dayBadge: 'Day 7 · NEAT',
    inner:
      eyebrow('Coaching Series · Email 4 of 7') +
      h1('The hidden lever.') +
      p('{{ params.FIRSTNAME | default : "Hey" }} — one week in. How are the lifts feeling?') +
      p('Today\'s lesson is the variable that explains why two people with identical diets and workouts lose fat at completely different rates:') +
      callout('<strong>NEAT — Non-Exercise Activity Thermogenesis.</strong><br>Everything you burn that <em>isn\'t</em> the gym: walking, fidgeting, standing, climbing stairs, doing the dishes.') +
      h2('The Mayo Clinic experiment') +
      p('Dr. James Levine overfed 16 adults by 1,000 kcal/day for 8 weeks. Fat gain ranged from 0.4 kg to 4.2 kg. <strong>Same overfeed. 10x difference.</strong> The variable wasn\'t metabolism, genetics, or workouts. It was NEAT — the high-NEAT participants instinctively moved more and burnt the surplus off.') +
      statRow([stat('400', 'kcal / day'), stat('8K', 'Step floor'), stat('10K', 'Sweet spot')]) +
      h2('Your step floor (do this every day)') +
      checklist([
        '<strong>8,000 steps minimum.</strong> Below this and your fat-loss stalls within 2–3 weeks regardless of diet quality.',
        '<strong>10,000 steps target.</strong> The recomp sweet spot — meaningful NEAT contribution without eating into recovery.',
        '<strong>Track on your phone or a watch.</strong> Don\'t guess. Humans dramatically over-estimate steps.',
      ]) +
      h2('How to slip in 4,000 extra steps without "trying"') +
      list([
        '☕ <strong>Morning 15-min walk</strong> with coffee. Sun on face. Caffeine works better. ~1,800 steps for free.',
        '📞 <strong>Walk every phone call.</strong> Audio meetings included. Easy 1,500–3,000.',
        '🍽 <strong>10-min walk after every main meal.</strong> Crushes glucose spikes (Buffey 2022 meta-analysis) AND adds 3,000 steps.',
        '🛗 <strong>Stairs always.</strong> Free vertical NEAT. Bonus glute work.',
      ]) +
      callout('Why this matters more than gym cardio: NEAT compounds <em>silently</em> 7 days a week. A 45-min HIIT session burns ~400 kcal once. 4,000 extra daily steps burns ~200 kcal × 7 = <strong>1,400 kcal/week</strong>, with zero fatigue cost to your lifting recovery. That\'s the trade.') +
      sig() +
      ps('Day 10 → strength training rules for recomp. The non-obvious differences vs a pure bulk or pure cut. Keep most clients lift heavier <em>during</em> a recomp than they do bulking. Counter-intuitive, but the data is iron-clad.'),
    footerCta:
      btn(utm('build-my-plan/', 'neat'), 'Check My Step Target'),
  }),
};

// ===================================================================
// DAY 10 — Strength Rules
// ===================================================================
const T6 = {
  subject: '🏋 Day 10 · The strength rules that protect every gram of muscle',
  html: layout({
    title: 'Strength Training Rules',
    preheader: 'Heavy + low volume beats moderate + high volume in a deficit. Here\'s the protocol.',
    dayBadge: 'Day 10 · Lift',
    inner:
      eyebrow('Coaching Series · Email 5 of 7') +
      h1('In a deficit, lift like a powerlifter.') +
      p('{{ params.FIRSTNAME | default : "Hey" }} — the most expensive mistake recomping lifters make:') +
      p('They drop the weight, add reps, "tone." Within 4 weeks they\'ve lost 1.5 kg of muscle and the mirror looks worse, not better. The fix is the opposite of intuition: <strong>heavy compounds, fewer sets, full rest periods.</strong>') +
      statRow([stat('80%+', '1RM Loads'), stat('5–8', 'Reps Sweet Spot'), stat('10', 'Sets / Muscle / Wk')]) +
      h2('Why heavy wins in a deficit') +
      p('A landmark 2014 study (Schoenfeld et al.) showed: in a calorie deficit, the <strong>strength signal</strong> is what tells your body "do not catabolize this tissue — we still need it." Drop the load and your nervous system reads the demand as lower → preserved muscle becomes optional → you lose it.') +
      callout('🎯 <strong>The recomp lifting protocol:</strong><br>• Compound lift first: squat / bench / deadlift / OHP / row<br>• 3–5 sets in the 5–8 rep range at RPE 7–8<br>• 2–3 min rest between heavy sets (yes, that long)<br>• 1 isolation movement after for the target muscle, 2–3 sets of 10–15') +
      h2('The 4 non-negotiables') +
      checklist([
        '<strong>Progressive overload tracked weekly.</strong> Add 1.25–2.5 kg to your top set OR add 1 rep at the same load. One or the other every session.',
        '<strong>Hit each major muscle 2x per week minimum.</strong> Frequency drives growth in a deficit more than total volume (Schoenfeld 2017 meta).',
        '<strong>Stop sets 1–2 reps from failure.</strong> Recovery is the bottleneck when calories are low — don\'t torch your CNS.',
        '<strong>Deload week every 6.</strong> Drop volume 40%, keep load 90%. Skip and you\'ll regress in week 7.',
      ]) +
      h2('What to cut (gently)') +
      list([
        '❌ <strong>Long metcons / 60-min HIIT classes.</strong> They eat into recovery without preserving muscle.',
        '❌ <strong>"Pump" workouts of 25 sets per session.</strong> Junk volume in a deficit = empty fatigue.',
        '✅ <strong>Replace with:</strong> daily walks (yesterday\'s email) + 2–3 short Zone-2 sessions if you enjoy cardio.',
      ]) +
      p('Lift heavy. Track every session. Add weight or reps weekly. That\'s the entire recomp lifting playbook in 11 words. The discipline of doing exactly that for 8 weeks is what separates "tried" from "transformed."') +
      sig() +
      ps('Day 14 → the inflection point. Week 4 is where most plans break — the scale stalls, motivation dips, the body is shifting but you can\'t see it yet. The fix is the most important email in this series. Don\'t miss it.'),
    footerCta:
      btn(utm('tools/one-rep-max-calculator/', 'lifting'), 'Calculate My 1RMs') +
      small('Stuck on a lift? Reply with the exercise + your current weights × reps. I\'ll send back the next 3-week progression I\'d use.'),
  }),
};

// ===================================================================
// DAY 14 — Plateau-Proof
// ===================================================================
const T7 = {
  subject: '🔁 Day 14 · The week-4 inflection (and how to plateau-proof it)',
  html: layout({
    title: 'The Week-4 Inflection',
    preheader: 'Why the scale stalls, why your body is still changing, and the 5-minute audit.',
    dayBadge: 'Day 14 · Inflection',
    inner:
      eyebrow('Coaching Series · Email 6 of 7') +
      h1('Around week 4, it gets weird.') +
      p('{{ params.FIRSTNAME | default : "Hey" }} — two weeks in. Whether you\'re crushing it or wobbling, this email is the one I want you to read twice.') +
      p('Around week 3–5 of every recomp, three things happen at once and they look like failure:') +
      checklist([
        '<strong>The scale stalls</strong> for 7–10 days even though you\'re adherent.',
        '<strong>The mirror looks roughly the same.</strong>',
        '<strong>Motivation dips</strong> exactly when consistency matters most.',
      ]) +
      callout('Here\'s the truth: <strong>this is the moment your body composition is shifting fastest.</strong> Muscle is denser than fat. As you swap one for the other, scale weight stalls but the inches drop, the pump comes back, the lifts go up. The scale is the worst measurement we have for recomp. It\'s also the only one most people use. Mistake.') +
      h2('The 5-minute week-4 audit') +
      p('Run this <em>before</em> changing anything. 90% of "plateaus" are reporting errors, not metabolic ones.') +
      checklist([
        '<strong>Are you actually hitting protein 7 days/week?</strong> Pull last week\'s log. Average it. Below {{ params.PROTEIN_G | default : "your target" }} g? That\'s the leak.',
        '<strong>Are you actually averaging your step floor?</strong> Two big-walk days don\'t cancel five sedentary ones.',
        '<strong>Did you progress every lift?</strong> If 3 sessions in a row had identical loads/reps, your body has no reason to keep adapting.',
        '<strong>Have you had 2 nights of <6h sleep?</strong> Cortisol holds water weight. Looks like fat. Isn\'t.',
        '<strong>Are you measuring weight at the same time, same conditions?</strong> Scale fluctuates 1–2 kg daily on the same body.',
      ]) +
      h2('The 3 measurements that actually move') +
      statRow([stat('Waist', 'cm — narrowest'), stat('Hip', 'cm — widest'), stat('AM Photo', 'fasted, same light')]) +
      p('Take these <strong>weekly, same morning, same conditions</strong>. The waist:hip ratio + the photo will show the recomp the scale hides. I\'ve had clients drop 4 cm off the waist with a scale change of <em>zero</em>. That\'s a textbook recomp month.') +
      h2('When to actually adjust') +
      list([
        '✅ <strong>Audit clean + 14 days of zero waist change?</strong> Drop 100 kcal from carbs, add 1,000 daily steps. That\'s it.',
        '❌ <strong>Don\'t crash the calories.</strong> Don\'t add 4 hours of cardio. Tiny adjustments, 14-day windows, repeat.',
        '✅ <strong>Take a 1-week diet break</strong> at maintenance every 6–8 weeks. Restores leptin, sanity, hormones.',
      ]) +
      sig() +
      ps('Day 21 (final email) → the re-assess. Did the plan work? What changes for the next 8 weeks? How to keep recomping without burning out. The graduation email.'),
    footerCta:
      btn(utm('build-my-plan/', 'inflection'), 'Re-Open My Plan'),
  }),
};

// ===================================================================
// DAY 21 — Re-Assess
// ===================================================================
const T8 = {
  subject: '🎓 You\'ve evolved. Time to re-assess.',
  html: layout({
    title: 'Re-Assess + Next 8 Weeks',
    preheader: '21 days in. New body. New numbers. New plan inside.',
    dayBadge: 'Day 21 · Re-Match',
    inner:
      eyebrow('Coaching Series · Email 7 of 7 · The Finale') +
      h1('Three weeks in. Different lifter.') +
      p('{{ params.FIRSTNAME | default : "Hey" }} — final email of the series. Quick check-in.') +
      p('Three weeks of consistent training, protein, and walking changes you. Lifts climb. Pants fit different. Energy is more steady. Maybe you\'ve held the deficit perfectly. Maybe you\'ve learned which 20% of habits give you 80% of the result. Maybe you discovered you actually <em>like</em> tracking protein.') +
      p('That\'s not the same person who built the plan on Day 0. Which means your numbers probably need a refresh.') +
      h2('When to re-build the plan') +
      checklist([
        '<strong>Bodyweight changed by 2 kg+</strong> (up or down)',
        '<strong>You\'re progressing your top sets every single week</strong> — could probably push more food now',
        '<strong>You\'ve added or dropped a training day</strong>',
        '<strong>Your step average shifted by 2,000+</strong>',
        '<strong>The plateau audit (Day 14 email) showed adjustments needed</strong>',
      ]) +
      callout('The re-build takes <strong>90 seconds</strong>. Same wizard. New stats. We re-derive your TDEE, macros, and training prescription with everything you\'ve learned about yourself in 3 weeks. Old plan is preserved — gives you a fresh one to compare.') +
      btn(utm('build-my-plan/', 'rematch'), 'Re-Build My Plan') +
      divider() +
      h2('The 3 rules for the next 8 weeks') +
      list([
        '<strong>1. Hit protein.</strong> If you do nothing else, do this. It\'s the recomp moat.',
        '<strong>2. Progress one lift per session.</strong> Doesn\'t matter which. Just one. Compounds insanely over a year.',
        '<strong>3. Walk every day.</strong> Even 6,000 on a "rest" day. The compounding here is silent and absurd.',
      ]) +
      h2('And one ask') +
      p('If this series helped you, two small things would mean the world:') +
      list([
        '💬 <strong>Hit reply</strong> and tell me what changed for you in 21 days. I read every single one — and the wins fuel the next ones.',
        '🔁 <strong>Forward this</strong> to the friend / partner / sibling who keeps "starting Monday." (You know who.)',
      ]) +
      p('Either way — I\'m glad we crossed paths. You showed up for 21 days. Most don\'t. The compounding from here is real, and very, very fun.') +
      sig() +
      ps('This is the last "scheduled" email. But I\'m not going anywhere. Stay subscribed for occasional drops — new training cycles, the rare deep-dive worth your inbox, and the next gen of Body Recomp OS as we ship it.'),
    footerCta:
      p('<strong style="color:' + TEXT + ';">Keep going:</strong>') +
      small('🏋 ' + a(utm('build-my-plan/', 'rematch'), 'Re-build my 8-week plan') + '<br>📚 ' + a(utm('workout-plans/', 'rematch'), 'Training & nutrition library') + '<br>🛠 ' + a(utm('free-fitness-calculators/', 'rematch'), 'Calculators (TDEE, macros, 1RM, body fat)') + '<br>📩 ' + a('mailto:info@gearuptofit.com', 'Email Alex directly')),
  }),
};

const TEMPLATES: Record<number, { subject: string; html: string; name: string; tag: string }> = {
  2: { ...T2, name: 'BodyRecomp · Day 0 · Welcome + Plan',     tag: 'drip-day-0' },
  3: { ...T3, name: 'BodyRecomp · Day 2 · Week-1 Setup',       tag: 'drip-day-2' },
  4: { ...T4, name: 'BodyRecomp · Day 4 · Protein Truth',      tag: 'drip-day-4' },
  5: { ...T5, name: 'BodyRecomp · Day 7 · NEAT & Steps',       tag: 'drip-day-7' },
  6: { ...T6, name: 'BodyRecomp · Day 10 · Strength Rules',    tag: 'drip-day-10' },
  7: { ...T7, name: 'BodyRecomp · Day 14 · Week-4 Inflection', tag: 'drip-day-14' },
  8: { ...T8, name: 'BodyRecomp · Day 21 · Re-Assess',         tag: 'drip-day-21' },
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  const apiKey = Deno.env.get('BREVO_API_KEY');
  if (!apiKey) return new Response(JSON.stringify({ error: 'no key' }), { status: 500, headers: corsHeaders });

  const url = new URL(req.url);
  const mode = url.searchParams.get('mode') || 'update'; // 'update' (PUT existing 2-8) or 'create' (POST new)

  // Need a verified sender for create mode
  let senderId: number | undefined;
  if (mode === 'create') {
    const senders = await fetch(`${BREVO}/senders`, { headers: { 'api-key': apiKey, accept: 'application/json' } });
    const sj: any = await senders.json().catch(() => ({}));
    senderId = (sj.senders || []).find((s: any) => s.email?.toLowerCase() === SENDER.email)?.id;
  }

  const results: any[] = [];
  for (const [idStr, tpl] of Object.entries(TEMPLATES)) {
    const id = Number(idStr);
    const body: any = {
      sender: senderId ? { id: senderId } : SENDER,
      replyTo: REPLY_TO.email,
      templateName: tpl.name,
      subject: tpl.subject,
      htmlContent: tpl.html,
      isActive: true,
      tag: tpl.tag,
    };
    const isCreate = mode === 'create';
    const r = await fetch(
      isCreate ? `${BREVO}/smtp/templates` : `${BREVO}/smtp/templates/${id}`,
      {
        method: isCreate ? 'POST' : 'PUT',
        headers: { 'api-key': apiKey, 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify(body),
      },
    );
    const text = await r.text();
    let parsed: any = null;
    try { parsed = text ? JSON.parse(text) : null; } catch {}
    results.push({ id, ok: r.ok, status: r.status, name: tpl.name, newId: parsed?.id, body: text.slice(0, 200) });
  }
  return new Response(JSON.stringify({ mode, updated: results }, null, 2), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
