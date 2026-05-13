import jsPDF from 'jspdf';
import { type PlanResults, type UserInputs } from '@/lib/calculations';
import logoUrl from '@/assets/logo.png';

/* ─── Color Palette (white-background premium) ─── */
const RED: RGB     = [200, 35, 30];
const DARK: RGB    = [25, 25, 30];
const BODY: RGB    = [60, 60, 70];
const LABEL: RGB   = [130, 130, 140];
const RULE: RGB    = [220, 220, 225];
const CARD: RGB    = [245, 245, 248];
const WHITE: RGB   = [255, 255, 255];
const BLUE: RGB    = [40, 110, 220];
const AMBER: RGB   = [200, 155, 25];
const GREEN: RGB   = [30, 160, 80];
const SOFT_RED: RGB = [255, 240, 240];
const SOFT_BLUE: RGB = [235, 245, 255];
const SOFT_GREEN: RGB = [235, 250, 240];
const SOFT_AMBER: RGB = [255, 250, 235];

type RGB = [number, number, number];

const tc = (d: jsPDF, c: RGB) => d.setTextColor(c[0], c[1], c[2]);
const fc = (d: jsPDF, c: RGB) => d.setFillColor(c[0], c[1], c[2]);
const dc = (d: jsPDF, c: RGB) => d.setDrawColor(c[0], c[1], c[2]);

/* ─── Sanitize text ─── */
function clean(text: string): string {
  return text
    .replace(/[\u{1F000}-\u{1FFFF}]/gu, '')
    .replace(/[\u{2600}-\u{27BF}]/gu, '')
    .replace(/[\u{FE00}-\u{FE0F}]/gu, '')
    .replace(/[\u{200D}]/gu, '')
    .replace(/[\u{E0020}-\u{E007F}]/gu, '')
    .replace(/[\u00D8\u00DE\u00CF\u00FE\u00DF\u00DC\u00A7\u00C5\u00CA\u00E0\u00D0]/g, '')
    .replace(/[^\x20-\x7E]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/* ─── Helpers ─── */
function whiteBg(d: jsPDF) {
  fc(d, WHITE);
  d.rect(0, 0, d.internal.pageSize.getWidth(), d.internal.pageSize.getHeight(), 'F');
}

function rRect(d: jsPDF, x: number, y: number, w: number, h: number, r: number, fill: RGB, border?: RGB) {
  fc(d, fill);
  d.roundedRect(x, y, w, h, r, r, 'F');
  if (border) {
    dc(d, border);
    d.setLineWidth(0.3);
    d.roundedRect(x, y, w, h, r, r, 'S');
  }
}

function hLine(d: jsPDF, x1: number, y1: number, x2: number, c: RGB, w = 0.3) {
  dc(d, c);
  d.setLineWidth(w);
  d.line(x1, y1, x2, y1);
}

function footer(d: jsPDF, pg: number, total: number) {
  const pw = d.internal.pageSize.getWidth();
  const ph = d.internal.pageSize.getHeight();
  hLine(d, 15, ph - 16, pw - 15, RULE, 0.2);
  d.setFontSize(6.5);
  d.setFont('helvetica', 'normal');
  tc(d, LABEL);
  d.text('GearUpToFit Body Recomp OS  |  Science-Backed Fitness Planning', 15, ph - 10);
  tc(d, BLUE);
  const fLinkX = 15 + d.getTextWidth('GearUpToFit Body Recomp OS  |  Science-Backed Fitness Planning') + 4;
  d.textWithLink('gearuptofit.com', fLinkX, ph - 10, { url: 'https://gearuptofit.com' });
  tc(d, RED);
  d.text(`Page ${pg} of ${total}`, pw - 15, ph - 10, { align: 'right' });
}

function section(d: jsPDF, y: number, title: string): number {
  const pw = d.internal.pageSize.getWidth();
  fc(d, RED);
  d.rect(15, y, 3, 7, 'F');
  d.setFontSize(11);
  d.setFont('helvetica', 'bold');
  tc(d, DARK);
  d.text(clean(title).toUpperCase(), 22, y + 5.5);
  hLine(d, 15, y + 9, pw - 15, RULE);
  return y + 14;
}

function needPage(d: jsPDF, y: number, need: number): number {
  if (y + need > d.internal.pageSize.getHeight() - 22) {
    d.addPage();
    whiteBg(d);
    return 20;
  }
  return y;
}

/* ─── Logo loader ─── */
async function loadLogo(): Promise<string | null> {
  try {
    const resp = await fetch(logoUrl);
    const blob = await resp.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

/* ─── Meal plan data (shared source of truth) ─── */
import { getSampleMeals, type MealBlock, type MealItem } from '@/lib/meal-plans';

/* ═══════════════════════════════════════════════════════════
   MAIN EXPORT
   ═══════════════════════════════════════════════════════════ */
export async function generatePlanPDF(plan: PlanResults, inputs: UserInputs) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const logoData = await loadLogo();

  const gearLinks = [
    { label: 'Complete Fitness Workout Guides', url: 'https://gearuptofit.com/fitness/', desc: 'Step-by-step workout routines for all levels' },
    { label: 'Nutrition & Healthy Meal Plans', url: 'https://gearuptofit.com/nutrition/', desc: 'Evidence-based nutrition strategies and recipes' },
    { label: 'Running Programs for All Levels', url: 'https://gearuptofit.com/running/', desc: 'From couch-to-5K to marathon training plans' },
    { label: 'Proven Weight Loss Strategies', url: 'https://gearuptofit.com/weight-loss/', desc: 'Sustainable fat loss methods backed by science' },
    { label: 'Health & Wellness Resources', url: 'https://gearuptofit.com/health/', desc: 'Sleep, stress management, and recovery tips' },
  ];

  /* ═══ PAGE 1: COVER ═══ */
  whiteBg(doc);

  // Top accent bar
  fc(doc, RED);
  doc.rect(0, 0, pw, 4, 'F');

  // Logo
  if (logoData) {
    doc.addImage(logoData, 'PNG', pw / 2 - 15, 14, 30, 30);
  }

  const brandY = logoData ? 50 : 30;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  tc(doc, RED);
  doc.text('GEAR UP TO FIT', pw / 2, brandY, { align: 'center' });
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  tc(doc, LABEL);
  doc.text('BODY RECOMP OS  |  EVIDENCE-BASED FITNESS PLANNING', pw / 2, brandY + 5, { align: 'center' });

  // Title
  const titleY = brandY + 22;
  doc.setFontSize(26);
  doc.setFont('helvetica', 'bold');
  tc(doc, DARK);
  doc.text('YOUR PERSONALIZED 8-WEEK', pw / 2, titleY, { align: 'center' });
  doc.setFontSize(30);
  tc(doc, RED);
  doc.text(clean(plan.goalLabel).toUpperCase() + ' PLAN', pw / 2, titleY + 12, { align: 'center' });

  // Decorative line
  fc(doc, RED);
  doc.rect(pw / 2 - 25, titleY + 17, 50, 0.8, 'F');

  // Summary
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  tc(doc, BODY);
  const sumLines = doc.splitTextToSize(clean(plan.quickSummary), pw - 60);
  doc.text(sumLines, pw / 2, titleY + 25, { align: 'center' });

  // Profile card
  const pcY = titleY + 25 + sumLines.length * 4 + 6;
  rRect(doc, 20, pcY, pw - 40, 44, 3, CARD, RULE);

  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  tc(doc, RED);
  doc.text('YOUR PROFILE', pw / 2, pcY + 8, { align: 'center' });

  const profileData = [
    ['Age', `${inputs.age} years`],
    ['Sex', inputs.sex.charAt(0).toUpperCase() + inputs.sex.slice(1)],
    ['Weight', `${inputs.weightKg} kg (${Math.round(inputs.weightKg * 2.205)} lbs)`],
    ['Height', `${inputs.heightCm} cm (${Math.floor(inputs.heightCm / 2.54 / 12)}'${Math.round(inputs.heightCm / 2.54 % 12)}")`],
    ['Body Fat', `${inputs.bodyFatPercent}%`],
    ['LBM', `${plan.leanBodyMass} kg`],
  ];

  const colW = (pw - 60) / 3;
  profileData.forEach((item, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 30 + col * colW;
    const iy = pcY + 15 + row * 14;
    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    tc(doc, LABEL);
    doc.text(item[0].toUpperCase(), x, iy);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    tc(doc, DARK);
    doc.text(item[1], x, iy + 5);
  });

  // Calorie hero box
  const calY = pcY + 52;
  rRect(doc, 20, calY, pw - 40, 36, 3, WHITE, RED);

  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  tc(doc, RED);
  doc.text('DAILY CALORIE TARGET', pw / 2, calY + 8, { align: 'center' });
  doc.setFontSize(34);
  tc(doc, DARK);
  doc.text(`${plan.calorieTarget}`, pw / 2, calY + 24, { align: 'center' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  tc(doc, LABEL);
  const defLabel = plan.deficitOrSurplus < 0 ? `${Math.abs(plan.deficitOrSurplus)} kcal deficit from TDEE` : plan.deficitOrSurplus > 0 ? `${plan.deficitOrSurplus} kcal surplus from TDEE` : 'Maintenance (calorie cycling)';
  doc.text(`kcal / day  |  ${defLabel}`, pw / 2, calY + 31, { align: 'center' });

  // Macro cards
  const macY = calY + 44;
  const macW = (pw - 50) / 3;
  const macros = [
    { label: 'PROTEIN', value: `${plan.proteinGrams}g`, pct: `${plan.proteinPercent}%`, detail: `${plan.proteinPerKgLBM}g/kg LBM`, color: RED },
    { label: 'CARBS', value: `${plan.carbGrams}g`, pct: `${plan.carbPercent}%`, detail: `${Math.round(plan.carbGrams / inputs.weightKg * 10) / 10}g/kg BW`, color: BLUE },
    { label: 'FAT', value: `${plan.fatGrams}g`, pct: `${plan.fatPercent}%`, detail: `${Math.round(plan.fatGrams / inputs.weightKg * 10) / 10}g/kg BW`, color: AMBER },
  ];

  macros.forEach((m, i) => {
    const x = 20 + i * (macW + 5);
    rRect(doc, x, macY, macW, 32, 3, CARD, RULE);
    fc(doc, m.color);
    doc.rect(x + 1, macY + 0.5, macW - 2, 2.5, 'F');
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'bold');
    tc(doc, LABEL);
    doc.text(m.label, x + macW / 2, macY + 9, { align: 'center' });
    doc.setFontSize(16);
    tc(doc, DARK);
    doc.text(m.value, x + macW / 2, macY + 19, { align: 'center' });
    doc.setFontSize(7);
    tc(doc, m.color);
    doc.text(m.pct, x + macW / 2, macY + 24, { align: 'center' });
    doc.setFontSize(5.5);
    tc(doc, LABEL);
    doc.text(m.detail, x + macW / 2, macY + 28, { align: 'center' });
  });

  // Additional targets
  const addY = macY + 38;
  const addW = (pw - 50) / 4;
  [
    { label: 'FIBER', value: `${plan.fiberGrams}g/day` },
    { label: 'WATER', value: `${plan.waterLiters}L/day` },
    { label: 'TRAINING', value: `${inputs.workoutFrequency}x/week` },
    { label: 'STEPS', value: `${inputs.stepCount.toLocaleString()}/day` },
  ].forEach((t, i) => {
    const x = 20 + i * (addW + 3.3);
    doc.setFontSize(5.5);
    doc.setFont('helvetica', 'bold');
    tc(doc, LABEL);
    doc.text(t.label, x + addW / 2, addY, { align: 'center' });
    doc.setFontSize(9);
    tc(doc, DARK);
    doc.text(t.value, x + addW / 2, addY + 5, { align: 'center' });
  });

  // Footer info
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  tc(doc, LABEL);
  doc.text(`Generated ${today}  |  Formulas: Mifflin-St Jeor + Katch-McArdle  |  Diet: ${inputs.dietStyle}`, pw / 2, ph - 22, { align: 'center' });
  doc.text('For informational purposes only. Consult a healthcare professional before beginning any program.', pw / 2, ph - 17, { align: 'center' });

  /* ═══ PAGE 2: HOW TO USE THIS GUIDE ═══ */
  doc.addPage();
  whiteBg(doc);
  let y = 20;
  y = section(doc, y, 'How To Use This Guide');

  rRect(doc, 15, y, pw - 30, 18, 3, SOFT_RED, [240, 200, 200] as RGB);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  tc(doc, BODY);
  doc.text('Read this once. Then keep the guide on your phone or printed by your kitchen.', 22, y + 7);
  doc.setFont('helvetica', 'bold');
  tc(doc, RED);
  doc.text('Consistency over perfection. Track. Adjust. Repeat.', 22, y + 13);
  y += 24;

  const usage = [
    { t: '1. Daily Anchors', d: `Hit your calorie target (${plan.calorieTarget} kcal) within ±100. Hit your protein floor (${plan.proteinGrams}g) every single day — non-negotiable.` },
    { t: '2. Training Days', d: `${inputs.workoutFrequency} sessions/week. Warm up 5-8 min, then follow the day's prescription. Log every working set: weight, reps, RPE.` },
    { t: '3. Progressive Overload', d: 'Add reps before load. Hit the top of your rep range across all working sets → add 2.5-5kg next session. This is how you grow / preserve muscle.' },
    { t: '4. Cardio & Steps', d: `Daily steps target: ${inputs.stepCount.toLocaleString()}. Cardio sessions are scheduled separately — do them on rest days or after lifting.` },
    { t: '5. Weekly Check-in', d: 'Same morning, same conditions: weigh in, photo (front/side), waist measurement. Use the 4-week trend, not the daily number.' },
    { t: '6. Adjust Every 2 Weeks', d: inputs.goal === 'fat-loss' ? 'If average weight has not moved in 2 weeks → drop calories by 100-150 OR add 1k steps/day.' : inputs.goal === 'lean-muscle' ? 'If weight is not up 0.25-0.5% bodyweight / week → add 100-150 kcal (mostly carbs).' : 'Track waist + lifts. If waist drops and lifts climb, plan is working — hold the line.' },
    { t: '7. Phase Transitions', d: 'Each 2-week phase changes your sets/reps/rest. Read the phase header each week before training. Deload week (W7) is mandatory — earned recovery.' },
    { t: '8. The Three Non-Negotiables', d: 'Sleep 7-9h. Hit protein. Show up to training. If only one of these is happening → fix that first before tweaking anything else.' },
  ];

  usage.forEach((u) => {
    y = needPage(doc, y, 18);
    fc(doc, RED);
    doc.circle(19, y + 2, 1.6, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    tc(doc, DARK);
    doc.text(clean(u.t), 24, y + 3);
    y += 5;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    tc(doc, BODY);
    const lines = doc.splitTextToSize(clean(u.d), pw - 44);
    doc.text(lines, 24, y + 3);
    y += lines.length * 4 + 6;
  });

  // Quick legend
  y = needPage(doc, y, 30);
  rRect(doc, 15, y, pw - 30, 22, 3, CARD, RULE);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  tc(doc, RED);
  doc.text('LEGEND', 22, y + 6);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  tc(doc, BODY);
  doc.text('RPE = Rate of Perceived Exertion (1-10).  RIR = Reps in Reserve.  LBM = Lean Body Mass.  TDEE = Total Daily Energy Expenditure.', 22, y + 12);
  doc.text('Z2 = aerobic / fat-oxidation zone.  AMRAP = As Many Reps As Possible.  EMOM = Every Minute on the Minute.', 22, y + 17);

  /* ═══ SCIENCE & METHODOLOGY ═══ */
  doc.addPage();
  whiteBg(doc);
  y = 20;

  y = section(doc, y, 'The Science Behind Your Plan');

  rRect(doc, 15, y, pw - 30, 20, 3, SOFT_BLUE, [200, 215, 240]);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  tc(doc, BODY);
  const sciIntro = 'Every number in this plan is derived from peer-reviewed research and validated equations. Below is the scientific basis for each component of your personalized program.';
  const sciIntroLines = doc.splitTextToSize(clean(sciIntro), pw - 50);
  doc.text(sciIntroLines, 22, y + 7);
  y += 24;

  plan.scienceNotes.forEach((note) => {
    y = needPage(doc, y, 30);
    fc(doc, RED);
    doc.circle(19, y + 1.5, 1.5, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    tc(doc, DARK);
    doc.text(clean(note.title), 24, y + 3);
    y += 7;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    tc(doc, BODY);
    const expLines = doc.splitTextToSize(clean(note.explanation), pw - 40);
    doc.text(expLines, 22, y);
    y += expLines.length * 3.8 + 2;
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'italic');
    tc(doc, LABEL);
    const citLines = doc.splitTextToSize(clean(note.citation), pw - 44);
    doc.text(citLines, 24, y);
    y += citLines.length * 3.2 + 6;
  });

  /* ═══ PAGE 3: NUTRITION DETAIL ═══ */
  doc.addPage();
  whiteBg(doc);
  y = 20;
  y = section(doc, y, 'Nutrition Breakdown');

  const nutrData = [
    ['Basal Metabolic Rate (BMR)', `${plan.bmr} kcal`],
    ['Total Daily Energy Expenditure (TDEE)', `${plan.tdee} kcal`],
    ['Thermic Effect of Food (TEF)', `~${plan.tef} kcal`],
    ['Non-Exercise Activity (NEAT)', `~${plan.neat} kcal`],
    ['Daily Calorie Target', `${plan.calorieTarget} kcal`],
    ['Lean Body Mass', `${plan.leanBodyMass} kg`],
    ['Protein per kg LBM', `${plan.proteinPerKgLBM} g/kg`],
    ['Daily Fiber Target', `${plan.fiberGrams}g`],
    ['Daily Water Target', `${plan.waterLiters}L`],
    ['Formulas Used', 'Mifflin-St Jeor + Katch-McArdle (averaged)'],
    ['Diet Style', inputs.dietStyle.charAt(0).toUpperCase() + inputs.dietStyle.slice(1)],
  ];
  if (plan.weeklyCalorieRange) {
    nutrData.push(['Recomp Cycling Range', `${plan.weeklyCalorieRange.low} - ${plan.weeklyCalorieRange.high} kcal`]);
  }

  rRect(doc, 15, y, pw - 30, nutrData.length * 9 + 8, 3, CARD, RULE);
  y += 6;
  nutrData.forEach(([lbl, val], i) => {
    if (i > 0) hLine(doc, 22, y + 0.5, pw - 22, [235, 235, 240] as RGB, 0.15);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    tc(doc, BODY);
    doc.text(clean(lbl), 22, y + 5);
    doc.setFont('helvetica', 'bold');
    tc(doc, DARK);
    doc.text(clean(val), pw - 22, y + 5, { align: 'right' });
    y += 9;
  });
  y += 14;

  // Macro table
  y = needPage(doc, y, 55);
  y = section(doc, y, 'Daily Macro Targets');
  rRect(doc, 15, y, pw - 30, 48, 3, WHITE, RULE);

  const cx = [25, 75, 112, 150];
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  tc(doc, LABEL);
  doc.text('MACRO', cx[0], y + 7);
  doc.text('GRAMS', cx[1], y + 7);
  doc.text('CALORIES', cx[2], y + 7);
  doc.text('% OF TOTAL', cx[3], y + 7);
  hLine(doc, 20, y + 9, pw - 20, RULE);

  const mRows = [
    { name: 'Protein', g: plan.proteinGrams, cal: plan.proteinGrams * 4, pct: plan.proteinPercent, c: RED },
    { name: 'Carbohydrates', g: plan.carbGrams, cal: plan.carbGrams * 4, pct: plan.carbPercent, c: BLUE },
    { name: 'Fat', g: plan.fatGrams, cal: plan.fatGrams * 9, pct: plan.fatPercent, c: AMBER },
  ];

  let ry = y + 17;
  mRows.forEach(r => {
    fc(doc, r.c);
    doc.circle(22, ry - 1, 1.5, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    tc(doc, DARK);
    doc.text(r.name, cx[0], ry);
    doc.setFont('helvetica', 'normal');
    tc(doc, BODY);
    doc.text(`${r.g}g`, cx[1], ry);
    doc.text(`${r.cal} kcal`, cx[2], ry);
    tc(doc, r.c);
    doc.setFont('helvetica', 'bold');
    doc.text(`${r.pct}%`, cx[3], ry);
    ry += 10;
  });

  hLine(doc, 20, ry - 4, pw - 20, RULE);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  tc(doc, RED);
  doc.text('TOTAL', cx[0], ry + 1);
  tc(doc, DARK);
  doc.text(`${plan.proteinGrams + plan.carbGrams + plan.fatGrams}g`, cx[1], ry + 1);
  doc.text(`${plan.calorieTarget} kcal`, cx[2], ry + 1);
  doc.text('100%', cx[3], ry + 1);

  y = ry + 14;

  /* ═══ MEAL TIMING ═══ */
  y = needPage(doc, y, 60);
  y = section(doc, y, 'Recommended Meal Timing');

  plan.mealTiming.forEach((meal) => {
    y = needPage(doc, y, 24);
    rRect(doc, 15, y, pw - 30, 20, 2, CARD, RULE);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    tc(doc, RED);
    doc.text(clean(meal.meal), 22, y + 5);
    doc.setFontSize(7);
    tc(doc, LABEL);
    doc.text(clean(meal.timing), 70, y + 5);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    tc(doc, BODY);
    doc.text(`${meal.calories} kcal  |  P: ${meal.protein}g  |  C: ${meal.carbs}g  |  F: ${meal.fat}g`, 22, y + 11);
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'italic');
    tc(doc, LABEL);
    doc.text(clean(meal.notes), 22, y + 16);
    y += 24;
  });

  /* ═══ SAMPLE MEAL PLAN ═══ */
  doc.addPage();
  whiteBg(doc);
  y = 20;
  const dietLabel = inputs.dietStyle === 'keto' ? 'Ketogenic' : inputs.dietStyle === 'high-protein' ? 'High-Protein' : inputs.dietStyle === 'vegetarian' ? 'Vegetarian' : 'Standard Balanced';
  y = section(doc, y, `Sample Day - ${dietLabel} Meal Plan`);

  rRect(doc, 15, y, pw - 30, 16, 2, SOFT_AMBER, [230, 220, 190] as RGB);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  tc(doc, BODY);
  doc.text('This is a sample day of eating based on your diet style and macro targets. Swap foods with similar macros to suit your preferences.', 22, y + 5);
  doc.text('Portions are approximate -- use a food scale for accuracy. Adjust serving sizes to hit your exact daily targets.', 22, y + 10);
  y += 20;

  const meals = getSampleMeals(inputs);
  let grandTotal = { calories: 0, protein: 0, carbs: 0, fat: 0 };

  meals.forEach((meal) => {
    y = needPage(doc, y, 12 + meal.items.length * 7);

    // Meal header
    rRect(doc, 15, y, pw - 30, 8, 2, RED);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    tc(doc, WHITE);
    doc.text(clean(meal.meal).toUpperCase(), 22, y + 5.5);
    y += 10;

    // Column headers
    doc.setFontSize(6);
    doc.setFont('helvetica', 'bold');
    tc(doc, LABEL);
    doc.text('FOOD ITEM', 22, y + 3);
    doc.text('PORTION', 90, y + 3);
    doc.text('CAL', 120, y + 3);
    doc.text('P', 136, y + 3);
    doc.text('C', 148, y + 3);
    doc.text('F', 160, y + 3);
    hLine(doc, 20, y + 5, pw - 20, RULE, 0.2);
    y += 8;

    let mealCal = 0, mealP = 0, mealC = 0, mealF = 0;

    meal.items.forEach((item, idx) => {
      const bgColor = idx % 2 === 0 ? CARD : WHITE;
      rRect(doc, 17, y - 2, pw - 34, 6, 0.5, bgColor);

      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      tc(doc, DARK);
      doc.text(clean(item.name), 22, y + 2);
      doc.setFontSize(7);
      tc(doc, LABEL);
      doc.text(item.portion, 90, y + 2);
      tc(doc, BODY);
      doc.text(`${item.calories}`, 120, y + 2);
      tc(doc, RED);
      doc.text(`${item.protein}`, 136, y + 2);
      tc(doc, BLUE);
      doc.text(`${item.carbs}`, 148, y + 2);
      tc(doc, AMBER);
      doc.text(`${item.fat}`, 160, y + 2);

      mealCal += item.calories;
      mealP += item.protein;
      mealC += item.carbs;
      mealF += item.fat;
      y += 6;
    });

    // Meal subtotal
    hLine(doc, 20, y, pw - 20, RULE, 0.2);
    y += 3;
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    tc(doc, DARK);
    doc.text('Subtotal', 22, y + 2);
    doc.text(`${mealCal}`, 120, y + 2);
    tc(doc, RED);
    doc.text(`${mealP}g`, 133, y + 2);
    tc(doc, BLUE);
    doc.text(`${mealC}g`, 145, y + 2);
    tc(doc, AMBER);
    doc.text(`${mealF}g`, 157, y + 2);
    y += 8;

    grandTotal.calories += mealCal;
    grandTotal.protein += mealP;
    grandTotal.carbs += mealC;
    grandTotal.fat += mealF;
  });

  // Grand total vs target
  y += 4;
  y = needPage(doc, y, 28);
  rRect(doc, 15, y, pw - 30, 24, 3, WHITE, RED);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  tc(doc, RED);
  doc.text('DAILY TOTAL vs TARGET', pw / 2, y + 5, { align: 'center' });

  const compX = [40, 80, 115, 145];
  const compLabels = ['', 'CALORIES', 'PROTEIN', 'CARBS', 'FAT'];
  doc.setFontSize(6);
  tc(doc, LABEL);
  compLabels.slice(1).forEach((l, i) => doc.text(l, compX[i], y + 10));

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  tc(doc, DARK);
  doc.text('Meal Plan', 20, y + 16);
  doc.text(`~${grandTotal.calories}`, compX[0], y + 16);
  tc(doc, RED); doc.text(`${grandTotal.protein}g`, compX[1], y + 16);
  tc(doc, BLUE); doc.text(`${grandTotal.carbs}g`, compX[2], y + 16);
  tc(doc, AMBER); doc.text(`${grandTotal.fat}g`, compX[3], y + 16);

  tc(doc, LABEL);
  doc.setFont('helvetica', 'normal');
  doc.text('Target', 20, y + 21);
  tc(doc, DARK); doc.text(`${plan.calorieTarget}`, compX[0], y + 21);
  tc(doc, RED); doc.text(`${plan.proteinGrams}g`, compX[1], y + 21);
  tc(doc, BLUE); doc.text(`${plan.carbGrams}g`, compX[2], y + 21);
  tc(doc, AMBER); doc.text(`${plan.fatGrams}g`, compX[3], y + 21);

  y += 30;

  /* ═══ TRAINING PLAN ═══ */
  doc.addPage();
  whiteBg(doc);
  y = 20;
  y = section(doc, y, '8-Week Periodized Training Program');

  // RPE guide
  rRect(doc, 15, y, pw - 30, 22, 2, SOFT_GREEN, [200, 230, 210] as RGB);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  tc(doc, GREEN);
  doc.text('RPE (Rate of Perceived Exertion) Guide', 22, y + 5);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  tc(doc, BODY);
  doc.text('RPE 6-7: Could do 3-4 more reps  |  RPE 7-8: Could do 2-3 more reps  |  RPE 8-9: Could do 1-2 more reps  |  RPE 10: Failure', 22, y + 11);
  doc.text('Rest between sets: Compounds 2-3 min  |  Isolations 60-90s  |  Core/Abs 45-60s', 22, y + 16);
  y += 28;

  plan.trainingPlan.forEach((week) => {
    y = needPage(doc, y, 20);

    const weekLabel = clean(`${week.weekRange} -- ${week.phase}`);
    if (week.deload) {
      rRect(doc, 15, y, pw - 30, 14, 2, [255, 248, 230] as RGB, [220, 195, 130] as RGB);
      tc(doc, [160, 120, 20] as RGB);
    } else {
      rRect(doc, 15, y, pw - 30, 14, 2, RED);
      tc(doc, WHITE);
    }
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(weekLabel, 20, y + 5.5);

    if (week.intensityGuideline) {
      doc.setFontSize(6);
      doc.setFont('helvetica', 'normal');
      if (week.deload) tc(doc, [160, 120, 20] as RGB); else tc(doc, [255, 200, 200] as RGB);
      doc.text(clean(week.intensityGuideline), 20, y + 10.5);
    }
    y += 18;

    week.days.forEach(day => {
      y = needPage(doc, y, 10 + day.exercises.length * 7);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      tc(doc, RED);
      doc.text(clean(`${day.day} -- ${day.focus}`), 20, y);
      y += 5;

      // Column anchors (mm) — widened to prevent overlap on long prescriptions
      const colExercise = 25;
      const colSets = pw - 82;
      const colRpe = pw - 40;
      const colRest = pw - 22;
      const exerciseMaxW = colSets - colExercise - 3;
      const setsMaxW = colRpe - colSets - 3;

      doc.setFontSize(6);
      doc.setFont('helvetica', 'bold');
      tc(doc, LABEL);
      doc.text('EXERCISE', colExercise, y);
      doc.text('SETS x REPS', colSets, y);
      doc.text('RPE', colRpe, y);
      doc.text('REST', colRest, y, { align: 'right' });
      y += 4;

      day.exercises.forEach(ex => {
        const nameLines = doc.splitTextToSize(clean(ex.name), exerciseMaxW);
        const setsRaw = `${ex.sets} x ${clean(ex.reps)}`;
        const setsLines = doc.splitTextToSize(setsRaw, setsMaxW);
        const rowLines = Math.max(nameLines.length, setsLines.length);

        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        tc(doc, BODY);
        fc(doc, LABEL);
        doc.circle(22, y - 0.8, 0.6, 'F');
        doc.text(nameLines, colExercise, y);
        doc.setFont('helvetica', 'bold');
        tc(doc, DARK);
        doc.text(setsLines, colSets, y);
        if (ex.rpe) { doc.setFont('helvetica', 'normal'); tc(doc, RED); doc.text(clean(ex.rpe), colRpe, y); }
        if (ex.rest) { doc.setFont('helvetica', 'normal'); tc(doc, LABEL); doc.text(clean(ex.rest), colRest, y, { align: 'right' }); }
        y += rowLines * 4 + 1.5;
        if (ex.notes) {
          doc.setFontSize(6.5);
          doc.setFont('helvetica', 'italic');
          tc(doc, LABEL);
          const noteLines = doc.splitTextToSize(clean(ex.notes), exerciseMaxW + 30);
          doc.text(noteLines, 28, y);
          y += noteLines.length * 3.2 + 1;
        }
      });
      y += 2;
    });
    hLine(doc, 20, y, pw - 20, RULE);
    y += 5;
  });

  /* ═══ 8-WEEK TRAINING COMPLIANCE GRID ═══ */
  doc.addPage();
  whiteBg(doc);
  y = 20;
  y = section(doc, y, '8-Week Training Compliance Tracker');

  rRect(doc, 15, y, pw - 30, 14, 2, SOFT_GREEN, [200, 230, 210] as RGB);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  tc(doc, BODY);
  doc.text('Tick a box after every completed session. Aim for 90%+ compliance per phase.', 22, y + 6);
  doc.text(`Target: ${inputs.workoutFrequency} sessions/week x 8 weeks = ${inputs.workoutFrequency * 8} sessions total.`, 22, y + 11);
  y += 20;

  const gridDayCount = inputs.workoutFrequency;
  const labelW = 22;          // "Week N" column
  const phaseColW = 28;       // dedicated phase column on the right
  const gridLeft = 18;
  const gridRight = pw - 18;
  const sessionAreaW = (gridRight - gridLeft) - labelW - phaseColW;
  const cellW = sessionAreaW / gridDayCount;
  const cellH = 9;
  const sessionsLeft = gridLeft + labelW;
  const phaseColX = gridRight - phaseColW;

  // Header row
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  tc(doc, LABEL);
  doc.text('WEEK', gridLeft, y + 5);
  for (let s = 0; s < gridDayCount; s++) {
    doc.text(`S${s + 1}`, sessionsLeft + s * cellW + cellW / 2, y + 5, { align: 'center' });
  }
  doc.text('PHASE', phaseColX + phaseColW / 2, y + 5, { align: 'center' });
  hLine(doc, 15, y + 7, pw - 15, RULE);
  y += 10;

  for (let w = 1; w <= 8; w++) {
    const phaseIdx = Math.floor((w - 1) / 2);
    const week = plan.trainingPlan[phaseIdx];
    const isDeloadWeek = week?.deload;
    const rowBg = w % 2 === 0 ? CARD : WHITE;
    fc(doc, rowBg);
    doc.rect(15, y - 1, pw - 30, cellH, 'F');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    tc(doc, isDeloadWeek ? [160, 120, 20] as RGB : DARK);
    doc.text(`Week ${w}`, gridLeft, y + 5);

    for (let s = 0; s < gridDayCount; s++) {
      const cx = sessionsLeft + s * cellW + cellW / 2 - 2;
      dc(doc, isDeloadWeek ? [200, 170, 90] as RGB : RED);
      doc.setLineWidth(0.4);
      doc.roundedRect(cx, y + 1, 4, 4, 0.5, 0.5, 'S');
    }

    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'italic');
    tc(doc, isDeloadWeek ? [160, 120, 20] as RGB : LABEL);
    const phaseLabel = isDeloadWeek ? 'Deload' : phaseIdx === 0 ? 'Foundation' : phaseIdx === 1 ? 'Build' : 'Peak';
    doc.text(phaseLabel, phaseColX + phaseColW / 2, y + 5, { align: 'center' });
    y += cellH;
  }

  y += 6;
  y = needPage(doc, y, 30);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  tc(doc, RED);
  doc.text('PHASE-BY-PHASE PROGRESSION', 18, y);
  y += 4;
  plan.trainingPlan.forEach((wk, i) => {
    y = needPage(doc, y, 20);
    const bg = wk.deload ? [255, 248, 230] as RGB : i === 2 ? SOFT_RED : SOFT_BLUE;
    const border = wk.deload ? [220, 195, 130] as RGB : i === 2 ? [240, 200, 200] as RGB : [200, 215, 240] as RGB;
    rRect(doc, 15, y, pw - 30, 17, 2, bg, border);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    tc(doc, wk.deload ? [160, 120, 20] as RGB : DARK);
    doc.text(`${clean(wk.weekRange)} - ${clean(wk.phase)}`, 20, y + 5);
    doc.setFontSize(6.8);
    doc.setFont('helvetica', 'normal');
    tc(doc, BODY);
    doc.text(clean(wk.intensityGuideline || ''), 20, y + 10);
    doc.setFont('helvetica', 'italic');
    tc(doc, LABEL);
    const vc = doc.splitTextToSize(clean(wk.volumeChange || ''), pw - 40);
    doc.text(vc[0] || '', 20, y + 14);
    y += 20;
  });

  /* ═══ CARDIO & HEART RATE ZONES ═══ */
  y = needPage(doc, y, 70);
  if (y < 25) y = 20;
  y = section(doc, y, 'Cardio Plan');

  const cardioInfo = [
    ['Type', clean(plan.cardioPlan.type)],
    ['Sessions / Week', `${plan.cardioPlan.sessionsPerWeek}x`],
    ['Duration', clean(plan.cardioPlan.duration)],
    ['Intensity', clean(plan.cardioPlan.intensity)],
  ];
  rRect(doc, 15, y, pw - 30, cardioInfo.length * 9 + 8, 3, CARD, RULE);
  y += 6;
  cardioInfo.forEach(([lbl, val]) => {
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    tc(doc, BODY);
    doc.text(lbl, 22, y + 4);
    doc.setFont('helvetica', 'bold');
    tc(doc, DARK);
    doc.text(val, pw - 22, y + 4, { align: 'right' });
    y += 9;
  });

  if (plan.cardioPlan.runningPlan) {
    y += 4;
    const rpText = clean(plan.cardioPlan.runningPlan);
    const rpLines = doc.splitTextToSize(rpText, pw - 50);
    rRect(doc, 15, y, pw - 30, 8 + rpLines.length * 4, 2, SOFT_RED, [240, 200, 200] as RGB);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    tc(doc, RED);
    doc.text('Running Program', 22, y + 5);
    doc.setFont('helvetica', 'normal');
    tc(doc, BODY);
    doc.text(rpLines, 22, y + 10);
    y += 14 + rpLines.length * 4;
  }

  // Heart Rate Zones
  if (plan.cardioPlan.heartRateZones) {
    y += 8;
    y = needPage(doc, y, 50);
    y = section(doc, y, 'Heart Rate Training Zones (Karvonen Formula)');
    
    rRect(doc, 15, y, pw - 30, plan.cardioPlan.heartRateZones.length * 9 + 10, 3, CARD, RULE);
    y += 6;
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'bold');
    tc(doc, LABEL);
    doc.text('ZONE', 22, y + 3);
    doc.text('HEART RATE', 80, y + 3);
    doc.text('PURPOSE', 120, y + 3);
    hLine(doc, 20, y + 5, pw - 20, RULE);
    y += 8;
    
    plan.cardioPlan.heartRateZones.forEach((z) => {
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      tc(doc, DARK);
      doc.text(clean(z.zone), 22, y + 3);
      doc.setFont('helvetica', 'normal');
      tc(doc, RED);
      doc.text(clean(z.bpm), 80, y + 3);
      tc(doc, BODY);
      doc.text(clean(z.purpose), 120, y + 3);
      y += 9;
    });
    y += 4;
  }

  y += 10;

  // Recovery checklist
  y = needPage(doc, y, 20 + plan.recoveryChecklist.length * 9);
  y = section(doc, y, 'Daily Recovery Checklist');

  const ckH = plan.recoveryChecklist.length * 9 + 8;
  rRect(doc, 15, y, pw - 30, ckH, 3, CARD, RULE);
  y += 7;

  plan.recoveryChecklist.forEach(item => {
    y = needPage(doc, y, 10);
    dc(doc, RED);
    doc.setLineWidth(0.4);
    doc.roundedRect(22, y - 2.5, 3.5, 3.5, 0.5, 0.5, 'S');
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    tc(doc, BODY);
    const cleanItem = clean(item);
    const itemLines = doc.splitTextToSize(cleanItem, pw - 60);
    doc.text(itemLines, 29, y);
    y += Math.max(8, itemLines.length * 4 + 4);
  });

  /* ═══ 8-WEEK HABIT PLAN ═══ */
  y += 8;
  y = needPage(doc, y, 60);
  y = section(doc, y, '8-Week Habit Building Plan');

  plan.habitPlan.forEach((week) => {
    y = needPage(doc, y, 22);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    tc(doc, RED);
    doc.text(`Week ${week.week}: ${clean(week.focus)}`, 22, y + 3);
    y += 6;
    week.habits.forEach(h => {
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      tc(doc, BODY);
      fc(doc, LABEL);
      doc.circle(24, y + 0.2, 0.6, 'F');
      doc.text(clean(h), 28, y + 1);
      y += 5;
    });
    y += 3;
  });

  /* ═══ RECOMMENDED RESOURCES FROM GEARUPTOFIT ═══ */
  doc.addPage();
  whiteBg(doc);
  y = 20;
  y = section(doc, y, 'Recommended Resources from GearUpToFit');

  // Logo + intro
  if (logoData) {
    doc.addImage(logoData, 'PNG', pw / 2 - 12, y, 24, 24);
    y += 28;
  }

  rRect(doc, 15, y, pw - 30, 14, 2, SOFT_RED, [240, 210, 210] as RGB);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  tc(doc, BODY);
  doc.text('Explore these hand-picked resources from GearUpToFit.com to support your transformation journey.', 22, y + 5);
  doc.text('Click any link below to access expert articles, guides, and programs.', 22, y + 10);
  y += 18;

  gearLinks.forEach((link) => {
    y = needPage(doc, y, 20);
    rRect(doc, 15, y, pw - 30, 16, 2, CARD, RULE);
    fc(doc, RED);
    doc.circle(22, y + 5, 1.5, 'F');

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    tc(doc, DARK);
    doc.text(clean(link.label), 27, y + 5);

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    tc(doc, LABEL);
    doc.text(clean(link.desc), 27, y + 10);

    doc.setFontSize(7.5);
    tc(doc, BLUE);
    doc.textWithLink(link.url, 27, y + 14, { url: link.url });
    y += 20;
  });

  /* ═══ PROGRESS TRACKER ═══ */
  y += 6;
  y = needPage(doc, y, 70);
  y = section(doc, y, 'Weekly Progress Tracker');

  rRect(doc, 15, y, pw - 30, 52, 3, CARD, RULE);
  const weeks = ['Week 1-2', 'Week 3-4', 'Week 5-6', 'Week 7-8'];
  const trackCols = ['WEIGHT', 'WAIST', 'ENERGY', 'NOTES'];

  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  tc(doc, LABEL);
  const tColW = (pw - 70) / 4;
  doc.text('PERIOD', 22, y + 7);
  trackCols.forEach((c, i) => {
    doc.text(c, 55 + i * tColW, y + 7);
  });
  hLine(doc, 20, y + 9, pw - 20, RULE);

  weeks.forEach((w, i) => {
    const rowY = y + 16 + i * 10;
    if (i > 0) hLine(doc, 20, rowY - 3, pw - 20, [235, 235, 240] as RGB, 0.15);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    tc(doc, DARK);
    doc.text(w, 22, rowY);
    trackCols.forEach((_, ci) => {
      dc(doc, [210, 210, 215] as RGB);
      doc.setLineWidth(0.15);
      doc.line(55 + ci * tColW, rowY + 1, 55 + ci * tColW + tColW - 8, rowY + 1);
    });
  });

  y += 60;

  /* ═══ DAILY LOG TEMPLATE (printable) ═══ */
  doc.addPage();
  whiteBg(doc);
  y = 20;
  y = section(doc, y, 'Daily Log Template — Print or Duplicate');

  rRect(doc, 15, y, pw - 30, 14, 2, SOFT_AMBER, [230, 220, 190] as RGB);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  tc(doc, BODY);
  doc.text('Photocopy this page or recreate it in your notes app. One log per day. Review weekly.', 22, y + 6);
  doc.text(`Daily targets: ${plan.calorieTarget} kcal  |  ${plan.proteinGrams}g P  |  ${plan.carbGrams}g C  |  ${plan.fatGrams}g F  |  ${plan.waterLiters}L water  |  ${inputs.stepCount.toLocaleString()} steps  |  7-9h sleep`, 22, y + 11);
  y += 20;

  // Date / weight / sleep header
  rRect(doc, 15, y, pw - 30, 14, 2, CARD, RULE);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  tc(doc, LABEL);
  ['DATE', 'WEIGHT (AM)', 'SLEEP (h)', 'ENERGY 1-10', 'HUNGER 1-10', 'STEPS'].forEach((lab, i) => {
    const cx = 18 + i * ((pw - 36) / 6);
    doc.text(lab, cx, y + 5);
    dc(doc, [210, 210, 215] as RGB);
    doc.setLineWidth(0.2);
    doc.line(cx, y + 11, cx + (pw - 36) / 6 - 4, y + 11);
  });
  y += 18;

  // Macro tracker
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  tc(doc, RED);
  doc.text('FOOD INTAKE', 18, y);
  y += 3;
  rRect(doc, 15, y, pw - 30, 56, 2, WHITE, RULE);
  const fcols = ['MEAL', 'FOOD', 'KCAL', 'P', 'C', 'F'];
  const fcolX = [18, 50, 120, 140, 155, 170];
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  tc(doc, LABEL);
  fcols.forEach((c, i) => doc.text(c, fcolX[i], y + 5));
  hLine(doc, 16, y + 7, pw - 16, RULE, 0.2);
  ['Breakfast', 'Lunch', 'Snack', 'Dinner', 'Other'].forEach((m, i) => {
    const ry = y + 12 + i * 8;
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    tc(doc, DARK);
    doc.text(m, fcolX[0], ry);
    dc(doc, [220, 220, 225] as RGB);
    doc.setLineWidth(0.15);
    for (let c = 1; c < fcols.length; c++) {
      doc.line(fcolX[c], ry + 1, fcolX[c] + (c === 1 ? 65 : 12), ry + 1);
    }
  });
  // total row
  hLine(doc, 16, y + 50, pw - 16, RULE, 0.3);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  tc(doc, RED);
  doc.text('DAILY TOTAL', fcolX[0], y + 54);
  for (let c = 2; c < fcols.length; c++) {
    dc(doc, RED);
    doc.setLineWidth(0.3);
    doc.line(fcolX[c], y + 55, fcolX[c] + 12, y + 55);
  }
  y += 60;

  // Training log
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  tc(doc, RED);
  doc.text('TRAINING LOG', 18, y);
  y += 3;
  rRect(doc, 15, y, pw - 30, 50, 2, WHITE, RULE);
  const tcols = ['EXERCISE', 'SET 1 (kg x reps)', 'SET 2', 'SET 3', 'SET 4', 'RPE'];
  const tcolX = [18, 65, 100, 130, 155, 175];
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  tc(doc, LABEL);
  tcols.forEach((c, i) => doc.text(c, tcolX[i], y + 5));
  hLine(doc, 16, y + 7, pw - 16, RULE, 0.2);
  for (let r = 0; r < 6; r++) {
    const ry = y + 12 + r * 6.5;
    dc(doc, [225, 225, 230] as RGB);
    doc.setLineWidth(0.12);
    doc.line(18, ry + 1, pw - 18, ry + 1);
  }
  y += 56;

  // Notes
  y = needPage(doc, y, 30);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  tc(doc, RED);
  doc.text('NOTES (mood, soreness, wins, adjustments)', 18, y);
  y += 3;
  rRect(doc, 15, y, pw - 30, 24, 2, CARD, RULE);
  for (let i = 0; i < 3; i++) {
    hLine(doc, 22, y + 8 + i * 7, pw - 22, [225, 225, 230] as RGB, 0.15);
  }
  y += 30;

  // Notes
  y = needPage(doc, y, 55);
  y = section(doc, y, 'Personal Notes');
  rRect(doc, 15, y, pw - 30, 48, 3, CARD, RULE);
  for (let i = 0; i < 5; i++) {
    hLine(doc, 22, y + 9 + i * 8, pw - 22, [230, 230, 235] as RGB, 0.15);
  }

  y += 58;
  y = needPage(doc, y, 60);
  y = section(doc, y, 'Scientific References');

  const references = [
    'Mifflin MD et al. A new predictive equation for resting energy expenditure. Am J Clin Nutr. 1990;51(2):241-7.',
    'Katch VL, McArdle WD. Introduction to Nutrition, Exercise, and Health. 4th ed. 1996.',
    'Morton RW et al. A systematic review of protein supplements and resistance training. Br J Sports Med. 2018;52(6):376-384.',
    'Helms ER et al. Evidence-based recommendations for natural bodybuilding. J Int Soc Sports Nutr. 2014;11:20.',
    'Levine JA. Measurement of energy expenditure. Public Health Nutr. 2005;8(7A):1123-32.',
    'Schoenfeld BJ. The mechanisms of muscle hypertrophy. J Strength Cond Res. 2010;24(10):2857-72.',
    'Walker M. Why We Sleep: Unlocking the Power of Sleep and Dreams. Scribner, 2017.',
    'Barakat C et al. Body recomposition: Can trained individuals build muscle and lose fat at the same time? Strength Cond J. 2020;42(5):7-21.',
  ];

  rRect(doc, 15, y, pw - 30, references.length * 6 + 8, 3, CARD, RULE);
  y += 6;
  references.forEach((ref, i) => {
    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    tc(doc, BODY);
    doc.text(`[${i + 1}] ${clean(ref)}`, 22, y + 3);
    y += 6;
  });

  /* ═══ FINAL BRANDING ═══ */
  y += 10;
  y = needPage(doc, y, 45);

  rRect(doc, 25, y, pw - 50, 38, 4, CARD, RULE);

  if (logoData) {
    doc.addImage(logoData, 'PNG', pw / 2 - 8, y + 3, 16, 16);
  }

  const bTextY = logoData ? y + 22 : y + 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  tc(doc, RED);
  doc.text('GEAR UP TO FIT', pw / 2, bTextY, { align: 'center' });
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  tc(doc, BODY);
  doc.text('Your evidence-based fitness companion', pw / 2, bTextY + 5, { align: 'center' });
  tc(doc, BLUE);
  doc.setFont('helvetica', 'bold');
  const siteUrl = 'https://gearuptofit.com';
  const siteW = doc.getTextWidth(siteUrl);
  doc.textWithLink(siteUrl, pw / 2 - siteW / 2, bTextY + 11, { url: siteUrl });

  /* ═══ Page numbering ═══ */
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    footer(doc, i, total);
  }

  doc.save(`GearUpToFit-${clean(plan.goalLabel).replace(/\s+/g, '-')}-Plan-${inputs.weightKg}kg.pdf`);
}
