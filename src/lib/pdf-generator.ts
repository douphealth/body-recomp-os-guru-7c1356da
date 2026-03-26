import jsPDF from 'jspdf';
import { type PlanResults, type UserInputs } from '@/lib/calculations';

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

type RGB = [number, number, number];

const tc = (d: jsPDF, c: RGB) => d.setTextColor(c[0], c[1], c[2]);
const fc = (d: jsPDF, c: RGB) => d.setFillColor(c[0], c[1], c[2]);
const dc = (d: jsPDF, c: RGB) => d.setDrawColor(c[0], c[1], c[2]);

/* ─── Sanitize text: strip emojis & non-ASCII glyphs ─── */
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
  d.text('GearUpToFit Body Recomp OS  |  Free Science-Backed Fitness Plans', 15, ph - 10);
  tc(d, BLUE);
  const fLinkX = 15 + d.getTextWidth('GearUpToFit Body Recomp OS  |  Free Science-Backed Fitness Plans') + 4;
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
    const resp = await fetch('https://gearuptofit.com/wp-content/uploads/2023/03/cropped-Grey-Black-Illustration-Gym-Fitness-Logo.png');
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
    { label: 'Workout Guides & Tips', url: 'https://gearuptofit.com/category/workouts/' },
    { label: 'Nutrition & Meal Plans', url: 'https://gearuptofit.com/category/nutrition/' },
    { label: 'Supplement Reviews', url: 'https://gearuptofit.com/category/supplements/' },
    { label: 'Recovery & Wellness', url: 'https://gearuptofit.com/category/recovery/' },
  ];

  /* ═══ PAGE 1: COVER ═══ */
  whiteBg(doc);

  // Top red bar
  fc(doc, RED);
  doc.rect(0, 0, pw, 4, 'F');

  // Logo
  if (logoData) {
    doc.addImage(logoData, 'PNG', pw / 2 - 15, 14, 30, 30);
  }

  // Brand text
  const brandY = logoData ? 50 : 30;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  tc(doc, RED);
  doc.text('GEAR UP TO FIT', pw / 2, brandY, { align: 'center' });
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  tc(doc, LABEL);
  doc.text('BODY RECOMP OS  |  SCIENCE-BACKED FITNESS PLANNING', pw / 2, brandY + 5, { align: 'center' });

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

  // Quick summary
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  tc(doc, BODY);
  const sumLines = doc.splitTextToSize(clean(plan.quickSummary), pw - 60);
  doc.text(sumLines, pw / 2, titleY + 25, { align: 'center' });

  // Profile card
  const pcY = titleY + 40;
  rRect(doc, 20, pcY, pw - 40, 44, 3, CARD, RULE);

  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  tc(doc, RED);
  doc.text('YOUR PROFILE', pw / 2, pcY + 8, { align: 'center' });

  const profileData = [
    ['Age', `${inputs.age} years`],
    ['Sex', inputs.sex.charAt(0).toUpperCase() + inputs.sex.slice(1)],
    ['Weight', `${inputs.weightKg} kg`],
    ['Height', `${inputs.heightCm} cm`],
    ['Body Fat', `${inputs.bodyFatPercent}%`],
    ['Equipment', inputs.equipmentAccess.charAt(0).toUpperCase() + inputs.equipmentAccess.slice(1)],
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

  // Calorie hero
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
  doc.text('kcal / day', pw / 2, calY + 31, { align: 'center' });

  // Macro cards
  const macY = calY + 44;
  const macW = (pw - 50) / 3;
  const macros = [
    { label: 'PROTEIN', value: `${plan.proteinGrams}g`, pct: `${plan.proteinPercent}%`, color: RED },
    { label: 'CARBS', value: `${plan.carbGrams}g`, pct: `${plan.carbPercent}%`, color: BLUE },
    { label: 'FAT', value: `${plan.fatGrams}g`, pct: `${plan.fatPercent}%`, color: AMBER },
  ];

  macros.forEach((m, i) => {
    const x = 20 + i * (macW + 5);
    rRect(doc, x, macY, macW, 28, 3, CARD, RULE);
    // Accent bar at top
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
  });

  // Date & formula
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  tc(doc, LABEL);
  doc.text(`Generated ${today}  |  Formula: Mifflin-St Jeor  |  Diet: ${inputs.dietStyle}`, pw / 2, ph - 22, { align: 'center' });
  doc.text('For informational purposes only. Consult a healthcare professional before beginning any program.', pw / 2, ph - 17, { align: 'center' });

  /* ═══ PAGE 2: NUTRITION DETAIL ═══ */
  doc.addPage();
  whiteBg(doc);
  let y = 20;
  y = section(doc, y, 'Nutrition Breakdown');

  const nutrData = [
    ['Basal Metabolic Rate (BMR)', `${Math.round(plan.tdee / 1.4)} kcal`],
    ['Total Daily Energy Expenditure (TDEE)', `${plan.tdee} kcal`],
    ['Daily Calorie Target', `${plan.calorieTarget} kcal`],
    ['Lean Body Mass', `${plan.leanBodyMass} kg`],
    ['Calculation Formula', 'Mifflin-St Jeor'],
    ['Diet Style', inputs.dietStyle.charAt(0).toUpperCase() + inputs.dietStyle.slice(1)],
  ];
  if (plan.weeklyCalorieRange) {
    nutrData.push(['Recomp Cycling Range', `${plan.weeklyCalorieRange.low} - ${plan.weeklyCalorieRange.high} kcal`]);
  }

  rRect(doc, 15, y, pw - 30, nutrData.length * 9 + 8, 3, CARD, RULE);
  y += 6;
  nutrData.forEach(([lbl, val], i) => {
    if (i > 0) hLine(doc, 22, y + 0.5, pw - 22, [235, 235, 240], 0.15);
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
  y = section(doc, y, 'Daily Macro Targets');
  rRect(doc, 15, y, pw - 30, 48, 3, WHITE, RULE);

  // Header row
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

  // Per-meal
  y = needPage(doc, y, 40);
  y = section(doc, y, 'Per-Meal Breakdown (4 Meals/Day)');
  rRect(doc, 15, y, pw - 30, 30, 3, SOFT_BLUE, [200, 215, 240]);

  const perMeal = [
    { label: 'CALORIES', value: `${Math.round(plan.calorieTarget / 4)}` },
    { label: 'PROTEIN', value: `${Math.round(plan.proteinGrams / 4)}g` },
    { label: 'CARBS', value: `${Math.round(plan.carbGrams / 4)}g` },
    { label: 'FAT', value: `${Math.round(plan.fatGrams / 4)}g` },
  ];
  const mColW = (pw - 40) / 4;
  perMeal.forEach((m, i) => {
    const x = 20 + i * mColW;
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'bold');
    tc(doc, LABEL);
    doc.text(m.label, x + mColW / 2, y + 9, { align: 'center' });
    doc.setFontSize(14);
    tc(doc, DARK);
    doc.text(m.value, x + mColW / 2, y + 21, { align: 'center' });
  });

  /* ═══ PAGE 3+: TRAINING PLAN ═══ */
  doc.addPage();
  whiteBg(doc);
  y = 20;
  y = section(doc, y, '8-Week Training Program');

  plan.trainingPlan.forEach((week) => {
    y = needPage(doc, y, 20);

    const weekLabel = clean(`${week.weekRange} -- ${week.phase}${week.deload ? '  (DELOAD WEEK)' : ''}`);
    if (week.deload) {
      rRect(doc, 15, y, pw - 30, 8, 2, [255, 248, 230], [220, 195, 130]);
      tc(doc, [160, 120, 20]);
    } else {
      rRect(doc, 15, y, pw - 30, 8, 2, RED);
      tc(doc, WHITE);
    }
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(weekLabel, 20, y + 5.5);
    y += 12;

    week.days.forEach(day => {
      y = needPage(doc, y, 10 + day.exercises.length * 6);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      tc(doc, RED);
      doc.text(clean(`${day.day} -- ${day.focus}`), 20, y);
      y += 5;

      day.exercises.forEach(ex => {
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        tc(doc, BODY);
        // Bullet
        fc(doc, LABEL);
        doc.circle(22, y - 0.8, 0.6, 'F');
        doc.text(clean(ex.name), 25, y);
        doc.setFont('helvetica', 'bold');
        tc(doc, DARK);
        doc.text(`${ex.sets} x ${clean(ex.reps)}`, pw - 22, y, { align: 'right' });
        if (ex.notes) {
          doc.setFontSize(7);
          doc.setFont('helvetica', 'italic');
          tc(doc, LABEL);
          doc.text(clean(ex.notes), 28, y + 4);
          y += 4;
        }
        y += 5.5;
      });
      y += 2;
    });
    hLine(doc, 20, y, pw - 20, RULE);
    y += 5;
  });

  /* ═══ CARDIO & RECOVERY ═══ */
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
    rRect(doc, 15, y, pw - 30, 8 + rpLines.length * 4, 2, SOFT_RED, [240, 200, 200]);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    tc(doc, RED);
    doc.text('Running Program', 22, y + 5);
    doc.setFont('helvetica', 'normal');
    tc(doc, BODY);
    doc.text(rpLines, 22, y + 10);
    y += 14 + rpLines.length * 4;
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
    // Checkbox
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

  /* ═══ RECOMMENDED RESOURCES ═══ */
  y += 8;
  y = needPage(doc, y, 60);
  y = section(doc, y, 'Recommended Resources from GearUpToFit');

  rRect(doc, 15, y, pw - 30, gearLinks.length * 14 + 10, 3, WHITE, RULE);
  y += 8;

  gearLinks.forEach((link) => {
    // Red arrow indicator
    fc(doc, RED);
    doc.circle(22, y, 1.2, 'F');

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    tc(doc, DARK);
    doc.text(clean(link.label), 27, y + 1);

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    tc(doc, BLUE);
    doc.textWithLink(link.url, 27, y + 6, { url: link.url });
    y += 14;
  });

  /* ═══ NOTES & TRACKING ═══ */
  y += 6;
  y = needPage(doc, y, 70);
  y = section(doc, y, 'Weekly Progress Tracker');

  // 4-week mini tracker
  rRect(doc, 15, y, pw - 30, 52, 3, CARD, RULE);
  const weeks = ['Week 1-2', 'Week 3-4', 'Week 5-6', 'Week 7-8'];
  const trackCols = ['WEIGHT', 'WAIST', 'ENERGY', 'NOTES'];

  // Header
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
    if (i > 0) hLine(doc, 20, rowY - 3, pw - 20, [235, 235, 240], 0.15);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    tc(doc, DARK);
    doc.text(w, 22, rowY);
    // Empty lines for user to fill
    trackCols.forEach((_, ci) => {
      dc(doc, [210, 210, 215]);
      doc.setLineWidth(0.15);
      doc.line(55 + ci * tColW, rowY + 1, 55 + ci * tColW + tColW - 8, rowY + 1);
    });
  });

  y += 60;

  // Notes section
  y = needPage(doc, y, 55);
  y = section(doc, y, 'Personal Notes');
  rRect(doc, 15, y, pw - 30, 48, 3, CARD, RULE);
  for (let i = 0; i < 5; i++) {
    hLine(doc, 22, y + 9 + i * 8, pw - 22, [230, 230, 235], 0.15);
  }

  /* ═══ FINAL BRANDING ═══ */
  y += 58;
  y = needPage(doc, y, 45);

  // Branded card
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
  doc.text('Your science-backed fitness companion', pw / 2, bTextY + 5, { align: 'center' });
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
