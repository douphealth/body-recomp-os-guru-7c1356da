// Programmatic SEO page generator — creates 50+ unique plan pages from variable combos

export interface SEOPageConfig {
  slug: string;
  title: string;
  metaTitle: string;
  metaDesc: string;
  heroSubtitle: string;
  intro: string;
  quickAnswer: string;
  highlights: string[];
  faqs: { q: string; a: string }[];
  relatedLinks: { url: string; title: string; desc: string }[];
  relatedPlans: { slug: string; title: string }[];
  relatedTools: { url: string; title: string; desc: string }[];
}

type Goal = 'fat-loss' | 'lean-muscle' | 'recomp';
type Experience = 'beginner' | 'intermediate' | 'advanced';
type Equipment = 'gym' | 'home' | 'bodyweight';
type Diet = 'standard' | 'keto' | 'high-protein' | 'vegetarian';

const goalLabels: Record<Goal, string> = { 'fat-loss': 'Fat Loss', 'lean-muscle': 'Lean Muscle', recomp: 'Body Recomposition' };
const expLabels: Record<Experience, string> = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' };
const equipLabels: Record<Equipment, string> = { gym: 'Gym', home: 'Home', bodyweight: 'Bodyweight' };
const dietLabels: Record<Diet, string> = { standard: 'Standard', keto: 'Keto', 'high-protein': 'High Protein', vegetarian: 'Vegetarian' };

const goalDeficits: Record<Goal, string> = { 'fat-loss': '20% calorie deficit', 'lean-muscle': '10% calorie surplus', recomp: 'maintenance calories with cycling' };
const goalProtein: Record<Goal, string> = { 'fat-loss': '2.0–2.2g/kg', 'lean-muscle': '1.8–2.0g/kg', recomp: '2.0g/kg' };
const goalFreq: Record<Goal, string> = { 'fat-loss': '3–4 days/week', 'lean-muscle': '4–5 days/week', recomp: '4 days/week' };

const expSets: Record<Experience, string> = { beginner: '3 sets per exercise', intermediate: '3–4 sets with progressive overload', advanced: '4–5 sets with periodized intensity' };
const equipDesc: Record<Equipment, string> = { gym: 'barbells, dumbbells, cables, and machines', home: 'dumbbells, resistance bands, and a bench', bodyweight: 'no equipment — just your body' };

function buildQuickAnswer(goal: Goal, exp: Experience, equip: Equipment, diet: Diet): string {
  const calorieRange = goal === 'fat-loss' ? '1,500–2,100' : goal === 'lean-muscle' ? '2,400–3,200' : '2,000–2,600';
  return `A ${expLabels[exp].toLowerCase()} lifter targeting ${goalLabels[goal].toLowerCase()} with ${equipLabels[equip].toLowerCase()} equipment and a ${dietLabels[diet].toLowerCase()} diet should target ${calorieRange} calories per day (based on a ${goalDeficits[goal]} from TDEE), eat ${goalProtein[goal]} of protein per kg of lean body mass, and train ${goalFreq[goal]} with ${expSets[exp]}. This 8-week plan uses the Mifflin-St Jeor equation for precise calorie calculation and phases through foundation, build, peak, and deload periods.`;
}

function buildHighlights(goal: Goal, exp: Experience, equip: Equipment, diet: Diet): string[] {
  const items: string[] = [];
  items.push(`Calorie target: ${goalDeficits[goal]} calculated via Mifflin-St Jeor`);
  items.push(`Protein target: ${goalProtein[goal]} lean body mass for optimal results`);
  items.push(`${expLabels[exp]}-level ${equipLabels[equip].toLowerCase()} workouts — ${equip === 'bodyweight' ? 'zero equipment needed' : `using ${equipDesc[equip]}`}`);
  items.push(`Training frequency: ${goalFreq[goal]} with ${expSets[exp]}`);
  items.push('Progressive 8-week periodization: foundation → build → peak → deload');
  if (goal === 'fat-loss') items.push('Strategic cardio plan with daily step count targets');
  if (goal === 'lean-muscle') items.push('Minimal cardio to maximize recovery and muscle growth');
  if (diet === 'keto') items.push('Keto-optimized macro split: 70% fat, 25% protein, 5% carbs');
  if (diet === 'high-protein') items.push('High-protein macro split with 35%+ calories from protein');
  if (diet === 'vegetarian') items.push('Plant-based protein sources and vegetarian meal guidance');
  items.push('Recovery checklist: sleep, hydration, stretching, deload scheduling');
  items.push('Week-by-week habit formation system for lasting results');
  return items;
}

function buildFAQs(goal: Goal, exp: Experience, equip: Equipment, diet: Diet): { q: string; a: string }[] {
  const faqs: { q: string; a: string }[] = [];

  faqs.push({
    q: `How many calories should I eat for ${goalLabels[goal].toLowerCase()} as a ${expLabels[exp].toLowerCase()}?`,
    a: `For ${goalLabels[goal].toLowerCase()}, target a ${goalDeficits[goal]} from your TDEE (Total Daily Energy Expenditure). We calculate TDEE using the Mifflin-St Jeor equation, which research shows is the most accurate predictor for healthy adults. Your exact target depends on your age, sex, height, weight, and activity level — use our free calculator for a personalized number.`,
  });

  faqs.push({
    q: `How much protein do I need for ${goalLabels[goal].toLowerCase()}?`,
    a: `For ${goalLabels[goal].toLowerCase()}, aim for ${goalProtein[goal]} of protein per kg of lean body mass daily. ${goal === 'fat-loss' ? 'Higher protein intake during a deficit helps preserve muscle mass and keeps you satiated.' : goal === 'lean-muscle' ? 'Sufficient protein supports muscle protein synthesis for growth.' : 'Adequate protein supports both muscle preservation during deficit days and growth during surplus days.'}`,
  });

  if (equip === 'bodyweight') {
    faqs.push({
      q: 'Can I build muscle with bodyweight exercises only?',
      a: 'Yes — bodyweight exercises like push-ups, squats, lunges, and planks create enough stimulus for muscle growth, especially for beginners and intermediates. The key is progressive overload through increased reps, slower tempos, harder variations, and reduced rest periods.',
    });
  }

  if (diet === 'keto') {
    faqs.push({
      q: `Is keto good for ${goalLabels[goal].toLowerCase()}?`,
      a: `Keto can work for ${goalLabels[goal].toLowerCase()} by reducing appetite and stabilizing blood sugar. However, performance may dip during the adaptation phase (2–4 weeks). Ensure adequate protein intake and electrolyte supplementation. Fat loss ultimately comes from a calorie deficit, regardless of diet style.`,
    });
  }

  if (diet === 'vegetarian') {
    faqs.push({
      q: `Can I get enough protein on a vegetarian diet for ${goalLabels[goal].toLowerCase()}?`,
      a: `Absolutely. Combine legumes, tofu, tempeh, Greek yogurt, eggs, and protein powder to hit your ${goalProtein[goal]} target. Focus on leucine-rich sources like soy and dairy for optimal muscle protein synthesis. Pair complementary proteins (rice + beans) for complete amino acid profiles.`,
    });
  }

  faqs.push({
    q: 'How is my calorie target calculated?',
    a: 'We use the Mifflin-St Jeor equation (1990), which calculates your Basal Metabolic Rate from age, sex, height, and weight, then multiplies by an activity factor based on workout frequency and daily step count. This gives your TDEE, from which we apply a goal-specific adjustment.',
  });

  faqs.push({
    q: `How fast will I see results with this ${expLabels[exp].toLowerCase()} plan?`,
    a: `${exp === 'beginner' ? 'Beginners often see the fastest results — expect visible changes in 3–4 weeks' : exp === 'intermediate' ? 'Intermediates can expect noticeable progress within 4–6 weeks' : 'Advanced lifters should track incremental progress over 6–8 weeks'}. ${goal === 'fat-loss' ? 'Aim to lose 0.5–1% of body weight per week.' : goal === 'lean-muscle' ? 'Target 0.25–0.5% body weight gain per week.' : 'Track measurements and photos — the scale may not move much during recomp.'} Take progress photos and measurements for the most accurate assessment.`,
  });

  faqs.push({
    q: 'What happens after the 8-week plan?',
    a: 'After completing the 8-week cycle, reassess your body composition and goals. You can run another cycle with adjusted targets, switch goals (e.g., from fat loss to muscle gain), or use our calculator to generate a fresh plan based on your new stats.',
  });

  return faqs;
}

function buildRelatedLinks(goal: Goal, _exp: Experience, _equip: Equipment): { url: string; title: string; desc: string }[] {
  const links = [
    { url: 'https://gearuptofit.com/', title: 'GearUpToFit — Training & Weight Loss', desc: 'Explore our full library of workout routines and weight-loss strategies.' },
    { url: 'https://gearuptofit.com/about-us/', title: 'About GearUpToFit', desc: 'Learn about our evidence-based approach to fitness.' },
  ];
  if (goal === 'fat-loss') {
    links.push({ url: 'https://gearuptofit.com/running/how-to-choose-the-right-running-shoes/', title: 'How to Choose Running Shoes', desc: 'Add running to your fat loss plan with the right footwear.' });
  }
  links.push({ url: 'https://gearuptofit.com/review/running-shoes/', title: 'Best Running Shoes — Reviews', desc: 'Expert reviews and comparisons of top running shoes.' });
  return links;
}

function generatePage(goal: Goal, exp: Experience, equip: Equipment, diet: Diet): SEOPageConfig {
  const slug = `${goal}-${exp}-${equip}-${diet}`;
  const title = `${goalLabels[goal]} — ${expLabels[exp]} ${equipLabels[equip]} ${dietLabels[diet]} Plan`;
  const metaTitle = `${goalLabels[goal]} ${expLabels[exp]} ${equipLabels[equip]} ${dietLabels[diet]} Plan — Free 8-Week Program | GearUpToFit`;
  const metaDesc = `${expLabels[exp]} ${goalLabels[goal].toLowerCase()} plan with ${equipLabels[equip].toLowerCase()} workouts and ${dietLabels[diet].toLowerCase()} diet. Free 8-week program with calorie targets, macro split, and training schedule.`;

  const relatedPlans: { slug: string; title: string }[] = [];
  const otherEquip: Equipment[] = (['gym', 'home', 'bodyweight'] as Equipment[]).filter(e => e !== equip);
  otherEquip.forEach(e => relatedPlans.push({ slug: `${goal}-${exp}-${e}-${diet}`, title: `${goalLabels[goal]} — ${expLabels[exp]} ${equipLabels[e]} ${dietLabels[diet]}` }));
  const otherDiets: Diet[] = (['standard', 'keto', 'high-protein', 'vegetarian'] as Diet[]).filter(d => d !== diet);
  otherDiets.slice(0, 2).forEach(d => relatedPlans.push({ slug: `${goal}-${exp}-${equip}-${d}`, title: `${goalLabels[goal]} — ${expLabels[exp]} ${equipLabels[equip]} ${dietLabels[d]}` }));

  return {
    slug,
    title,
    metaTitle: metaTitle.slice(0, 60),
    metaDesc: metaDesc.slice(0, 160),
    heroSubtitle: `${expLabels[exp]}-level ${goalLabels[goal].toLowerCase()} with ${equipLabels[equip].toLowerCase()} workouts and ${dietLabels[diet].toLowerCase()} nutrition`,
    quickAnswer: buildQuickAnswer(goal, exp, equip, diet),
    highlights: buildHighlights(goal, exp, equip, diet),
    faqs: buildFAQs(goal, exp, equip, diet),
    relatedLinks: buildRelatedLinks(goal, exp, equip),
    relatedPlans,
  };
}

const goals: Goal[] = ['fat-loss', 'lean-muscle', 'recomp'];
const experiences: Experience[] = ['beginner', 'intermediate', 'advanced'];
const equipments: Equipment[] = ['gym', 'home', 'bodyweight'];
const diets: Diet[] = ['standard', 'keto', 'high-protein', 'vegetarian'];

export const seoPages: Map<string, SEOPageConfig> = new Map();

goals.forEach(g => {
  experiences.forEach(e => {
    equipments.forEach(eq => {
      diets.forEach(d => {
        const page = generatePage(g, e, eq, d);
        seoPages.set(page.slug, page);
      });
    });
  });
});

export const allSEOPageSlugs = Array.from(seoPages.keys());

export const legacyPageMap: Record<string, string> = {
  'fat-loss-beginner-home-workouts': 'fat-loss-beginner-home-standard',
  'runner-cut-plan': 'fat-loss-intermediate-gym-standard',
  'lean-muscle-high-protein': 'lean-muscle-intermediate-gym-high-protein',
};
