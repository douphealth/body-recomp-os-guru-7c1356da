export interface UserInputs {
  age: number;
  sex: 'male' | 'female';
  heightCm: number;
  weightKg: number;
  bodyFatPercent: number;
  goal: 'fat-loss' | 'lean-muscle' | 'recomp';
  workoutFrequency: number; // 3-6 days
  stepCount: number;
  dietStyle: 'standard' | 'keto' | 'high-protein' | 'vegetarian';
  equipmentAccess: 'gym' | 'home' | 'minimal';
  runningInterest: boolean;
}

export interface PlanResults {
  tdee: number;
  bmr: number;
  calorieTarget: number;
  proteinGrams: number;
  carbGrams: number;
  fatGrams: number;
  fiberGrams: number;
  waterLiters: number;
  proteinPercent: number;
  carbPercent: number;
  fatPercent: number;
  leanBodyMass: number;
  trainingPlan: TrainingWeek[];
  cardioPlan: CardioBlock;
  recoveryChecklist: string[];
  habitPlan: HabitWeek[];
  quickSummary: string;
  goalLabel: string;
  weeklyCalorieRange?: { low: number; high: number };
  scienceNotes: ScienceNote[];
  mealTiming: MealTimingBlock[];
  proteinPerKgLBM: number;
  deficitOrSurplus: number;
  neat: number;
  tef: number;
}

export interface ScienceNote {
  title: string;
  explanation: string;
  citation: string;
}

export interface MealTimingBlock {
  meal: string;
  timing: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  notes: string;
}

export interface TrainingDay {
  day: string;
  focus: string;
  exercises: { name: string; sets: number; reps: string; rpe?: string; rest?: string; notes?: string }[];
}

export interface TrainingWeek {
  weekRange: string;
  phase: string;
  days: TrainingDay[];
  deload?: boolean;
  volumeChange?: string;
  intensityGuideline?: string;
}

export interface CardioBlock {
  type: string;
  sessionsPerWeek: number;
  duration: string;
  intensity: string;
  notes: string;
  runningPlan?: string;
  heartRateZones?: { zone: string; bpm: string; purpose: string }[];
}

export interface HabitWeek {
  week: number;
  habits: string[];
  focus: string;
}

/* ─── BMR Calculation ─── 
   Mifflin-St Jeor (1990) — validated as the most accurate predictive equation 
   for resting metabolic rate in healthy adults.
   Reference: Mifflin et al., Am J Clin Nutr, 1990;51(2):241-7
*/
function calculateBMR_MifflinStJeor(sex: string, weightKg: number, heightCm: number, age: number): number {
  if (sex === 'male') {
    return 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  }
  return 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
}

/* Katch-McArdle (more accurate when body fat % is known)
   BMR = 370 + 21.6 × LBM(kg)
   Reference: Katch & McArdle, Exercise Physiology, 1996
*/
function calculateBMR_KatchMcArdle(leanBodyMass: number): number {
  return 370 + 21.6 * leanBodyMass;
}

/* We average both for best accuracy when BF% is available */
function calculateBMR(sex: string, weightKg: number, heightCm: number, age: number, lbm: number): number {
  const mifflin = calculateBMR_MifflinStJeor(sex, weightKg, heightCm, age);
  const katch = calculateBMR_KatchMcArdle(lbm);
  // Average of both validated equations for improved accuracy
  return Math.round((mifflin + katch) / 2);
}

/* ─── Activity Multiplier ───
   Based on Cunningham (1991) activity factor classifications
   with step-count NEAT adjustments per Levine et al. (2005)
*/
function getActivityMultiplier(workoutFrequency: number, stepCount: number): number {
  // Base multiplier from NEAT (Non-Exercise Activity Thermogenesis)
  let neatFactor = 1.2; // Sedentary baseline
  if (stepCount >= 12000) neatFactor = 1.35;
  else if (stepCount >= 10000) neatFactor = 1.30;
  else if (stepCount >= 7000) neatFactor = 1.25;
  else if (stepCount >= 5000) neatFactor = 1.22;

  // Exercise Activity Thermogenesis (EAT)
  let eatFactor = 0;
  if (workoutFrequency >= 6) eatFactor = 0.40;
  else if (workoutFrequency >= 5) eatFactor = 0.33;
  else if (workoutFrequency >= 4) eatFactor = 0.25;
  else if (workoutFrequency >= 3) eatFactor = 0.18;
  else eatFactor = 0.10;

  return neatFactor + eatFactor;
}

function getGoalLabel(goal: string): string {
  switch (goal) {
    case 'fat-loss': return 'Fat Loss';
    case 'lean-muscle': return 'Lean Muscle Gain';
    case 'recomp': return 'Body Recomposition';
    default: return '';
  }
}

/* ─── Heart Rate Zones (Karvonen Formula) ───
   Reference: Karvonen et al., Ann Med Exp Biol Fenn, 1957
*/
function calculateHeartRateZones(age: number): { zone: string; bpm: string; purpose: string }[] {
  const maxHR = 220 - age; // Fox formula (simplified)
  const restHR = 65; // Estimated average resting HR
  const zone = (low: number, high: number) => {
    const l = Math.round(restHR + (maxHR - restHR) * low);
    const h = Math.round(restHR + (maxHR - restHR) * high);
    return `${l}-${h} bpm`;
  };
  return [
    { zone: 'Zone 1 (Recovery)', bpm: zone(0.50, 0.60), purpose: 'Active recovery, warm-up' },
    { zone: 'Zone 2 (Aerobic)', bpm: zone(0.60, 0.70), purpose: 'Fat oxidation, endurance base' },
    { zone: 'Zone 3 (Tempo)', bpm: zone(0.70, 0.80), purpose: 'Aerobic capacity improvement' },
    { zone: 'Zone 4 (Threshold)', bpm: zone(0.80, 0.90), purpose: 'Lactate threshold training' },
    { zone: 'Zone 5 (Max)', bpm: zone(0.90, 1.00), purpose: 'VO2max, sprint intervals' },
  ];
}

function generateTrainingPlan(inputs: UserInputs): TrainingWeek[] {
  const { workoutFrequency, equipmentAccess, goal } = inputs;
  const isGym = equipmentAccess === 'gym';

  const gymExercises = {
    push: [
      { name: 'Barbell Bench Press', sets: 4, reps: '6-8', rpe: '7-8', rest: '2-3 min', notes: 'Flat bench, full ROM' },
      { name: 'Overhead Press', sets: 3, reps: '8-10', rpe: '7-8', rest: '2 min' },
      { name: 'Incline Dumbbell Press', sets: 3, reps: '10-12', rpe: '7-8', rest: '90s' },
      { name: 'Cable Lateral Raises', sets: 3, reps: '12-15', rpe: '8-9', rest: '60s' },
      { name: 'Tricep Pushdowns', sets: 3, reps: '12-15', rpe: '8-9', rest: '60s' },
    ],
    pull: [
      { name: 'Barbell Rows', sets: 4, reps: '6-8', rpe: '7-8', rest: '2-3 min', notes: 'Pendlay or bent-over' },
      { name: 'Pull-ups / Lat Pulldowns', sets: 3, reps: '8-12', rpe: '7-8', rest: '2 min' },
      { name: 'Seated Cable Rows', sets: 3, reps: '10-12', rpe: '7-8', rest: '90s' },
      { name: 'Face Pulls', sets: 3, reps: '15-20', rpe: '7-8', rest: '60s', notes: 'External rotation at top' },
      { name: 'Barbell Curls', sets: 3, reps: '10-12', rpe: '8-9', rest: '60s' },
    ],
    legs: [
      { name: 'Barbell Back Squats', sets: 4, reps: '5-8', rpe: '7-8', rest: '3 min', notes: 'Below parallel' },
      { name: 'Romanian Deadlifts', sets: 3, reps: '8-10', rpe: '7-8', rest: '2 min', notes: 'Hinge at hips, slight knee bend' },
      { name: 'Leg Press', sets: 3, reps: '10-12', rpe: '8', rest: '90s' },
      { name: 'Walking Lunges', sets: 3, reps: '12 each', rpe: '7-8', rest: '90s' },
      { name: 'Standing Calf Raises', sets: 4, reps: '12-15', rpe: '8-9', rest: '60s', notes: 'Full stretch at bottom' },
    ],
    upper: [
      { name: 'Dumbbell Bench Press', sets: 4, reps: '8-10', rpe: '7-8', rest: '2 min' },
      { name: 'Dumbbell Rows', sets: 4, reps: '8-10', rpe: '7-8', rest: '2 min', notes: 'One arm at a time' },
      { name: 'Overhead Press', sets: 3, reps: '10-12', rpe: '7-8', rest: '90s' },
      { name: 'Lat Pulldowns', sets: 3, reps: '10-12', rpe: '7-8', rest: '90s' },
      { name: 'Lateral Raises', sets: 3, reps: '12-15', rpe: '8-9', rest: '60s' },
    ],
    lower: [
      { name: 'Conventional Deadlifts', sets: 4, reps: '4-6', rpe: '7-8', rest: '3-4 min', notes: 'Brace core, hinge pattern' },
      { name: 'Front Squats', sets: 3, reps: '8-10', rpe: '7-8', rest: '2 min' },
      { name: 'Hip Thrusts', sets: 3, reps: '10-12', rpe: '8', rest: '90s', notes: 'Pause at top, squeeze glutes' },
      { name: 'Leg Curls', sets: 3, reps: '12-15', rpe: '8-9', rest: '60s' },
      { name: 'Calf Raises (Seated)', sets: 4, reps: '15-20', rpe: '8-9', rest: '60s' },
    ],
    core: [
      { name: 'Hanging Leg Raises', sets: 3, reps: '12-15', rpe: '8', rest: '60s' },
      { name: 'Cable Woodchops', sets: 3, reps: '12 each', rpe: '7-8', rest: '60s' },
      { name: 'Ab Wheel Rollouts', sets: 3, reps: '10-12', rpe: '8-9', rest: '60s' },
    ],
  };

  const homeExercises = {
    push: [
      { name: 'Push-ups (varied grips)', sets: 4, reps: '15-20', rpe: '7-8', rest: '60s', notes: 'Tempo: 2s down, 1s up' },
      { name: 'Pike Push-ups', sets: 3, reps: '10-12', rpe: '7-8', rest: '60s' },
      { name: 'Diamond Push-ups', sets: 3, reps: '12-15', rpe: '8-9', rest: '60s' },
      { name: 'Dips (chair)', sets: 3, reps: '10-15', rpe: '7-8', rest: '60s' },
    ],
    pull: [
      { name: 'Doorframe Rows / Band Rows', sets: 4, reps: '12-15', rpe: '7-8', rest: '60s' },
      { name: 'Resistance Band Pull-aparts', sets: 3, reps: '15-20', rpe: '7-8', rest: '45s' },
      { name: 'Superman Holds', sets: 3, reps: '15-20', rpe: '7', rest: '45s' },
      { name: 'Bicep Curls (bands/jugs)', sets: 3, reps: '12-15', rpe: '8-9', rest: '45s' },
    ],
    legs: [
      { name: 'Bodyweight Squats', sets: 4, reps: '20-25', rpe: '7-8', rest: '60s', notes: 'Add tempo for difficulty' },
      { name: 'Bulgarian Split Squats', sets: 3, reps: '12 each', rpe: '8-9', rest: '90s' },
      { name: 'Glute Bridges', sets: 3, reps: '15-20', rpe: '7-8', rest: '60s', notes: 'Single-leg for progression' },
      { name: 'Step-ups', sets: 3, reps: '12 each', rpe: '7-8', rest: '60s' },
      { name: 'Calf Raises', sets: 4, reps: '20-25', rpe: '8-9', rest: '45s' },
    ],
    upper: [
      { name: 'Push-ups', sets: 4, reps: '15-20', rpe: '7-8', rest: '60s' },
      { name: 'Resistance Band Rows', sets: 4, reps: '12-15', rpe: '7-8', rest: '60s' },
      { name: 'Pike Push-ups', sets: 3, reps: '10-12', rpe: '7-8', rest: '60s' },
      { name: 'Band Pull-aparts', sets: 3, reps: '15-20', rpe: '7-8', rest: '45s' },
    ],
    lower: [
      { name: 'Jump Squats', sets: 4, reps: '12-15', rpe: '8', rest: '90s' },
      { name: 'Single-leg Deadlifts', sets: 3, reps: '10 each', rpe: '7-8', rest: '60s' },
      { name: 'Wall Sits', sets: 3, reps: '45-60s', rpe: '8-9', rest: '60s' },
      { name: 'Lateral Lunges', sets: 3, reps: '12 each', rpe: '7-8', rest: '60s' },
    ],
    core: [
      { name: 'Planks', sets: 3, reps: '45-60s', rpe: '7-8', rest: '45s' },
      { name: 'Bicycle Crunches', sets: 3, reps: '20 each', rpe: '8', rest: '45s' },
      { name: 'Mountain Climbers', sets: 3, reps: '30s', rpe: '8-9', rest: '45s' },
    ],
  };

  const ex = isGym ? gymExercises : homeExercises;

  let splitDays: TrainingDay[] = [];
  if (workoutFrequency <= 3) {
    splitDays = [
      { day: 'Day 1', focus: 'Full Body (Push Focus)', exercises: [...ex.push.slice(0, 3), ...ex.legs.slice(0, 2)] },
      { day: 'Day 2', focus: 'Full Body (Pull Focus)', exercises: [...ex.pull.slice(0, 3), ...ex.legs.slice(2, 4)] },
      { day: 'Day 3', focus: 'Full Body (Legs Focus)', exercises: [...ex.legs, ...ex.core] },
    ];
  } else if (workoutFrequency === 4) {
    splitDays = [
      { day: 'Day 1', focus: 'Upper Body', exercises: ex.upper },
      { day: 'Day 2', focus: 'Lower Body', exercises: ex.legs },
      { day: 'Day 3', focus: 'Push + Core', exercises: [...ex.push.slice(0, 3), ...ex.core] },
      { day: 'Day 4', focus: 'Pull + Lower', exercises: [...ex.pull.slice(0, 3), ...ex.lower.slice(0, 2)] },
    ];
  } else if (workoutFrequency === 5) {
    splitDays = [
      { day: 'Day 1', focus: 'Push', exercises: ex.push },
      { day: 'Day 2', focus: 'Pull', exercises: ex.pull },
      { day: 'Day 3', focus: 'Legs', exercises: ex.legs },
      { day: 'Day 4', focus: 'Upper Body', exercises: ex.upper },
      { day: 'Day 5', focus: 'Lower + Core', exercises: [...ex.lower.slice(0, 3), ...ex.core] },
    ];
  } else {
    splitDays = [
      { day: 'Day 1', focus: 'Push', exercises: ex.push },
      { day: 'Day 2', focus: 'Pull', exercises: ex.pull },
      { day: 'Day 3', focus: 'Legs', exercises: ex.legs },
      { day: 'Day 4', focus: 'Upper Body', exercises: ex.upper },
      { day: 'Day 5', focus: 'Lower Body', exercises: ex.lower },
      { day: 'Day 6', focus: 'Core + Conditioning', exercises: [...ex.core, { name: 'HIIT Circuit', sets: 3, reps: '10 min', rpe: '8-9', rest: '2 min' }] },
    ];
  }

  const intensityModifier = goal === 'fat-loss' ? 'higher reps, shorter rest' : goal === 'lean-muscle' ? 'progressive overload focus' : 'moderate intensity, volume cycling';

  return [
    { weekRange: 'Weeks 1-2', phase: `Foundation (${intensityModifier})`, days: splitDays, volumeChange: 'Baseline volume — focus on form and mind-muscle connection', intensityGuideline: 'RPE 6-7 for compounds, RPE 7-8 for isolations' },
    { weekRange: 'Weeks 3-4', phase: `Build Phase (increase weight 5-10%)`, days: splitDays, volumeChange: '+1 set on compound lifts', intensityGuideline: 'RPE 7-8 across the board, track weights' },
    { weekRange: 'Weeks 5-6', phase: `Peak Phase (intensity peak)`, days: splitDays, volumeChange: 'Peak volume — add drop sets on final set of each exercise', intensityGuideline: 'RPE 8-9, push close to failure on last sets' },
    { weekRange: 'Weeks 7-8', phase: `Deload & Test (reduce volume 40%)`, days: splitDays, deload: true, volumeChange: 'Reduce sets by 40%, maintain weight', intensityGuideline: 'RPE 5-6, focus on recovery and movement quality' },
  ];
}

function generateCardioPlan(inputs: UserInputs): CardioBlock {
  const { goal, stepCount, runningInterest, age } = inputs;
  const baseSteps = stepCount < 7000 ? 'Increase daily steps to 7,000+' : stepCount < 10000 ? 'Aim for 10,000 daily steps' : 'Maintain 10,000+ daily steps';
  const hrZones = calculateHeartRateZones(age);

  if (goal === 'fat-loss') {
    return {
      type: runningInterest ? 'Running + Walking' : 'Low-Impact Steady State',
      sessionsPerWeek: runningInterest ? 3 : 4,
      duration: '25-40 minutes',
      intensity: 'Zone 2 (conversational pace) + 1 HIIT session/week',
      notes: baseSteps,
      runningPlan: runningInterest ? 'Start with Couch-to-5K progression. Week 1-2: Run 1min/Walk 2min x 8. Week 3-4: Run 2min/Walk 1min x 8. Week 5-6: Run 3min/Walk 1min x 6. Week 7-8: Run 20-25 min continuous.' : undefined,
      heartRateZones: hrZones,
    };
  }
  if (goal === 'lean-muscle') {
    return {
      type: runningInterest ? 'Easy Running' : 'Walking',
      sessionsPerWeek: 2,
      duration: '20-30 minutes',
      intensity: 'Zone 1-2 (very easy, recovery pace)',
      notes: `${baseSteps}. Keep cardio minimal to preserve recovery for muscle building.`,
      runningPlan: runningInterest ? 'Easy 20-30 min jogs at conversational pace, 2x/week. Prioritize recovery.' : undefined,
      heartRateZones: hrZones,
    };
  }
  return {
    type: runningInterest ? 'Mixed Running + Walking' : 'Moderate Cardio',
    sessionsPerWeek: 3,
    duration: '20-35 minutes',
    intensity: 'Zone 2 with occasional Zone 3 intervals',
    notes: `${baseSteps}. Alternate higher and lower intensity days.`,
    runningPlan: runningInterest ? 'Alternate easy runs (25 min) with tempo intervals (20 min with 4x2 min pickups). 3x/week.' : undefined,
    heartRateZones: hrZones,
  };
}

function generateRecoveryChecklist(inputs: UserInputs): string[] {
  const waterOz = Math.round(inputs.weightKg * 2.2 * 0.5);
  const checklist = [
    `Sleep 7-9 hours per night -- prioritize consistent sleep/wake times (Walker, 2017)`,
    `Drink ${waterOz}+ oz water daily (${Math.round(waterOz * 29.574 / 1000 * 10) / 10}L) -- adjust for exercise and climate`,
    `Stretch or foam roll for 10 minutes post-workout to improve recovery (Pearcey et al., 2015)`,
    `Take 1-2 full rest days per week -- active recovery walks are encouraged`,
    `Eat whole, minimally processed foods for 80%+ of calories`,
    `Track progress weekly: weight (same time/conditions), measurements, photos`,
    `Practice 5 minutes of mindfulness or deep breathing daily for cortisol management`,
    `Consume 25-35g fiber daily for gut health and satiety`,
  ];

  if (inputs.workoutFrequency >= 5) {
    checklist.push('Deload every 4th week: reduce volume by 40%, maintain weight on bar');
  }
  if (inputs.goal === 'fat-loss') {
    checklist.push('Monitor hunger/energy levels -- if consistently exhausted, increase calories by 100');
  }
  if (inputs.goal === 'lean-muscle') {
    checklist.push('Ensure post-workout protein within 2 hours (Schoenfeld & Aragon, 2018)');
  }

  return checklist;
}

function generateHabitPlan(): HabitWeek[] {
  return [
    { week: 1, focus: 'Foundation', habits: ['Track all meals in a food log', 'Set a consistent wake-up time', 'Prep meals for 3 days ahead'] },
    { week: 2, focus: 'Movement', habits: ['Hit your step count target every day', 'Complete all scheduled workouts', 'Add 5 min morning mobility routine'] },
    { week: 3, focus: 'Nutrition Quality', habits: ['Replace one processed snack with whole food', 'Eat protein at every meal', 'Drink water before every meal'] },
    { week: 4, focus: 'Recovery', habits: ['Implement a wind-down routine before bed', 'Foam roll after every workout', 'Take one full rest day with zero guilt'] },
    { week: 5, focus: 'Consistency', habits: ['Batch cook meals for the week', 'Review and adjust calorie targets', 'Track your training weights to ensure progression'] },
    { week: 6, focus: 'Mindset', habits: ['Journal 3 things you are grateful for daily', 'Celebrate one non-scale victory', 'Set a process goal (not outcome goal) for the week'] },
    { week: 7, focus: 'Optimization', habits: ['Experiment with meal timing around workouts', 'Add one new healthy recipe', 'Test going to bed 30 minutes earlier'] },
    { week: 8, focus: 'Sustainability', habits: ['Create your next 4-week plan', 'Identify your top 3 habits to keep long-term', 'Reassess your body composition and goals'] },
  ];
}

function generateScienceNotes(inputs: UserInputs, plan: { bmr: number; tdee: number; calorieTarget: number; proteinGrams: number; leanBodyMass: number; proteinPerKgLBM: number }): ScienceNote[] {
  const notes: ScienceNote[] = [
    {
      title: 'BMR Calculation',
      explanation: `Your Basal Metabolic Rate (${plan.bmr} kcal) was calculated by averaging two validated equations: the Mifflin-St Jeor (1990) and Katch-McArdle formulas. The Mifflin-St Jeor uses your age, sex, height, and weight, while the Katch-McArdle uses lean body mass (${plan.leanBodyMass} kg) for greater precision.`,
      citation: 'Mifflin et al., Am J Clin Nutr, 1990;51(2):241-7 | Katch & McArdle, Exercise Physiology, 1996',
    },
    {
      title: 'TDEE & Activity Factor',
      explanation: `Your TDEE (${plan.tdee} kcal) is derived from your BMR multiplied by an activity factor that accounts for Non-Exercise Activity Thermogenesis (NEAT) from your daily step count, Exercise Activity Thermogenesis (EAT) from your ${inputs.workoutFrequency}x/week training, and the Thermic Effect of Food (~10% of intake).`,
      citation: 'Levine JA, Science, 2005;307(5709):584-6 | Cunningham JJ, Am J Clin Nutr, 1991',
    },
    {
      title: 'Protein Target',
      explanation: `Your protein target of ${plan.proteinGrams}g/day (${plan.proteinPerKgLBM} g/kg lean body mass) falls within the evidence-based range of 1.6-2.4 g/kg LBM for ${inputs.goal === 'fat-loss' ? 'preserving muscle during a deficit' : inputs.goal === 'lean-muscle' ? 'maximizing muscle protein synthesis' : 'supporting simultaneous fat loss and muscle gain'}.`,
      citation: 'Morton et al., Br J Sports Med, 2018;52(6):376-384 | Helms et al., J Int Soc Sports Nutr, 2014;11:20',
    },
  ];

  if (inputs.goal === 'fat-loss') {
    notes.push({
      title: 'Caloric Deficit Strategy',
      explanation: `Your 20% deficit (${plan.tdee - plan.calorieTarget} kcal/day below maintenance) is within the recommended range of 15-25% for sustainable fat loss while minimizing muscle loss. This targets approximately ${Math.round((plan.tdee - plan.calorieTarget) * 7 / 7700 * 10) / 10} kg of fat loss per week.`,
      citation: 'Helms et al., J Int Soc Sports Nutr, 2014;11:20 | Trexler et al., J Int Soc Sports Nutr, 2014;11:7',
    });
  }
  if (inputs.goal === 'lean-muscle') {
    notes.push({
      title: 'Caloric Surplus Strategy',
      explanation: `Your 10% surplus (${plan.calorieTarget - plan.tdee} kcal/day above maintenance) is a conservative "lean bulk" approach. Research shows surpluses beyond 10-15% above TDEE primarily increase fat gain without proportionally increasing muscle growth.`,
      citation: 'Iraki et al., J Int Soc Sports Nutr, 2019;16:38 | Slater et al., Sports Med, 2019;49(S2):129-151',
    });
  }
  if (inputs.goal === 'recomp') {
    notes.push({
      title: 'Body Recomposition Strategy',
      explanation: `Calorie cycling (surplus on training days, deficit on rest days) allows simultaneous fat loss and muscle gain. This is most effective in individuals with higher body fat (>15%), training experience of <2 years, or those returning after a break.`,
      citation: 'Barakat et al., Strength Cond J, 2020;42(5):7-21 | Campbell et al., Int J Sport Nutr Exerc Metab, 2020',
    });
  }

  notes.push({
    title: 'Progressive Overload',
    explanation: `Your 8-week plan uses periodized progressive overload — the #1 driver of muscle growth. The program cycles through foundation (weeks 1-2), build (3-4), peak (5-6), and deload (7-8) phases to maximize adaptation while managing fatigue.`,
    citation: 'Schoenfeld BJ, J Strength Cond Res, 2010;24(10):2857-72 | Rhea et al., Med Sci Sports Exerc, 2003;35(3):456-64',
  });

  return notes;
}

function generateMealTiming(plan: { calorieTarget: number; proteinGrams: number; carbGrams: number; fatGrams: number }, goal: string): MealTimingBlock[] {
  const totalCal = plan.calorieTarget;
  const totalP = plan.proteinGrams;
  const totalC = plan.carbGrams;
  const totalF = plan.fatGrams;

  if (goal === 'lean-muscle') {
    return [
      { meal: 'Breakfast', timing: '7:00-8:00 AM', calories: Math.round(totalCal * 0.25), protein: Math.round(totalP * 0.25), carbs: Math.round(totalC * 0.20), fat: Math.round(totalF * 0.30), notes: 'Higher fat meal to start the day' },
      { meal: 'Pre-Workout', timing: '1-2 hrs before training', calories: Math.round(totalCal * 0.25), protein: Math.round(totalP * 0.25), carbs: Math.round(totalC * 0.35), fat: Math.round(totalF * 0.15), notes: 'Carb-focused for energy' },
      { meal: 'Post-Workout', timing: 'Within 2 hrs after training', calories: Math.round(totalCal * 0.30), protein: Math.round(totalP * 0.30), carbs: Math.round(totalC * 0.35), fat: Math.round(totalF * 0.20), notes: 'Largest meal — prioritize protein + carbs' },
      { meal: 'Evening', timing: '8:00-9:00 PM', calories: Math.round(totalCal * 0.20), protein: Math.round(totalP * 0.20), carbs: Math.round(totalC * 0.10), fat: Math.round(totalF * 0.35), notes: 'Casein protein or cottage cheese ideal' },
    ];
  }

  // Fat loss & recomp
  return [
    { meal: 'Breakfast', timing: '7:00-8:00 AM', calories: Math.round(totalCal * 0.25), protein: Math.round(totalP * 0.25), carbs: Math.round(totalC * 0.20), fat: Math.round(totalF * 0.30), notes: 'High protein to reduce hunger' },
    { meal: 'Lunch', timing: '12:00-1:00 PM', calories: Math.round(totalCal * 0.30), protein: Math.round(totalP * 0.30), carbs: Math.round(totalC * 0.30), fat: Math.round(totalF * 0.30), notes: 'Largest meal for satiety' },
    { meal: 'Pre/Post Workout', timing: 'Around training', calories: Math.round(totalCal * 0.25), protein: Math.round(totalP * 0.25), carbs: Math.round(totalC * 0.40), fat: Math.round(totalF * 0.10), notes: 'Carbs around training for performance' },
    { meal: 'Dinner', timing: '7:00-8:00 PM', calories: Math.round(totalCal * 0.20), protein: Math.round(totalP * 0.20), carbs: Math.round(totalC * 0.10), fat: Math.round(totalF * 0.30), notes: 'Light, protein-focused' },
  ];
}

export function calculatePlan(inputs: UserInputs): PlanResults {
  const leanBodyMass = inputs.weightKg * (1 - inputs.bodyFatPercent / 100);
  const bmr = calculateBMR(inputs.sex, inputs.weightKg, inputs.heightCm, inputs.age, leanBodyMass);
  const activityMultiplier = getActivityMultiplier(inputs.workoutFrequency, inputs.stepCount);
  const tdee = Math.round(bmr * activityMultiplier);

  // TEF (Thermic Effect of Food) ~10% of intake
  const tef = Math.round(tdee * 0.10);
  // NEAT estimate
  const neat = Math.round(bmr * (activityMultiplier - 1) * 0.6);

  let calorieTarget: number;
  let weeklyCalorieRange: { low: number; high: number } | undefined;
  let deficitOrSurplus: number;

  switch (inputs.goal) {
    case 'fat-loss':
      calorieTarget = Math.round(tdee * 0.80);
      deficitOrSurplus = calorieTarget - tdee;
      break;
    case 'lean-muscle':
      calorieTarget = Math.round(tdee * 1.10);
      deficitOrSurplus = calorieTarget - tdee;
      break;
    case 'recomp':
      calorieTarget = tdee;
      deficitOrSurplus = 0;
      weeklyCalorieRange = {
        low: Math.round(tdee * 0.85),
        high: Math.round(tdee * 1.10),
      };
      break;
    default:
      calorieTarget = tdee;
      deficitOrSurplus = 0;
  }

  // Protein: evidence-based ranges per Morton et al. (2018)
  let proteinMultiplier: number;
  switch (inputs.goal) {
    case 'fat-loss': proteinMultiplier = 2.2; break; // Higher to preserve LBM in deficit
    case 'lean-muscle': proteinMultiplier = 2.0; break;
    case 'recomp': proteinMultiplier = 2.0; break;
    default: proteinMultiplier = 1.8;
  }
  if (inputs.dietStyle === 'high-protein') proteinMultiplier = Math.min(proteinMultiplier + 0.2, 2.4);

  const proteinGrams = Math.round(leanBodyMass * proteinMultiplier);
  const proteinCals = proteinGrams * 4;

  // Calculate macros ensuring they always sum to 100%
  // Step 1: Fix protein percent from actual grams
  const rawProteinPercent = Math.round(proteinCals / calorieTarget * 100);
  // Cap protein percent at 50% to leave room for fat and carbs
  const proteinPercent = Math.min(rawProteinPercent, 50);

  // Step 2: Distribute remaining calories between fat and carbs based on diet style
  let fatPercent: number;
  let carbPercent: number;
  const remaining = 100 - proteinPercent;

  if (inputs.dietStyle === 'keto') {
    // Keto: maximize fat, minimize carbs
    carbPercent = 5;
    fatPercent = remaining - carbPercent;
  } else if (inputs.dietStyle === 'high-protein') {
    // High-protein: moderate fat, rest to carbs
    fatPercent = Math.min(25, remaining - 10); // ensure at least 10% carbs
    carbPercent = remaining - fatPercent;
  } else {
    // Standard/vegetarian: ~30% fat, rest to carbs
    fatPercent = Math.min(30, remaining - 10); // ensure at least 10% carbs
    carbPercent = remaining - fatPercent;
  }

  // Ensure all percentages are positive and sum to exactly 100
  carbPercent = Math.max(carbPercent, 5);
  fatPercent = Math.max(fatPercent, 10);
  // Re-normalize if needed
  const macroSum = proteinPercent + carbPercent + fatPercent;
  if (macroSum !== 100) {
    carbPercent += 100 - macroSum; // adjust carbs to make it sum to 100
    carbPercent = Math.max(carbPercent, 5);
  }

  const fatGrams = Math.round((calorieTarget * fatPercent / 100) / 9);
  const carbGrams = Math.round((calorieTarget * carbPercent / 100) / 4);

  // Fiber: 14g per 1000 kcal (IOM recommendation)
  const fiberGrams = Math.round(calorieTarget / 1000 * 14);
  // Water: ~35ml per kg bodyweight (EFSA recommendation)
  const waterLiters = Math.round(inputs.weightKg * 0.035 * 10) / 10;

  const goalLabel = getGoalLabel(inputs.goal);
  const proteinPerKgLBM = Math.round(proteinMultiplier * 10) / 10;

  const roundedLBM = Math.round(leanBodyMass * 10) / 10;

  const scienceNotes = generateScienceNotes(inputs, {
    bmr, tdee, calorieTarget, proteinGrams, leanBodyMass: roundedLBM, proteinPerKgLBM,
  });

  const mealTiming = generateMealTiming({ calorieTarget, proteinGrams, carbGrams, fatGrams }, inputs.goal);

  const quickSummary = `Based on your profile (${inputs.age}yo ${inputs.sex}, ${inputs.weightKg}kg, ${inputs.bodyFatPercent}% BF), your ${goalLabel.toLowerCase()} plan targets ${calorieTarget} kcal/day (${inputs.goal === 'fat-loss' ? `${Math.abs(deficitOrSurplus)} kcal deficit` : inputs.goal === 'lean-muscle' ? `${deficitOrSurplus} kcal surplus` : 'calorie cycling'}). You'll consume ${proteinGrams}g protein (${proteinPerKgLBM}g/kg LBM), ${carbGrams}g carbs, and ${fatGrams}g fat. Training ${inputs.workoutFrequency}x/week with a ${inputs.equipmentAccess === 'gym' ? 'gym-based' : inputs.equipmentAccess === 'home' ? 'home-based' : 'minimal-equipment'} ${inputs.workoutFrequency <= 3 ? 'full-body' : inputs.workoutFrequency <= 4 ? 'upper/lower' : 'push/pull/legs'} split across 4 periodized phases.${inputs.runningInterest ? ' Includes progressive running program.' : ''} All targets derived from Mifflin-St Jeor + Katch-McArdle equations.`;

  return {
    tdee,
    bmr,
    calorieTarget,
    proteinGrams,
    carbGrams,
    fatGrams,
    fiberGrams,
    waterLiters,
    proteinPercent,
    carbPercent: Math.max(carbPercent, 5),
    fatPercent,
    leanBodyMass: roundedLBM,
    trainingPlan: generateTrainingPlan(inputs),
    cardioPlan: generateCardioPlan(inputs),
    recoveryChecklist: generateRecoveryChecklist(inputs),
    habitPlan: generateHabitPlan(),
    quickSummary,
    goalLabel,
    weeklyCalorieRange,
    scienceNotes,
    mealTiming,
    proteinPerKgLBM,
    deficitOrSurplus,
    neat,
    tef,
  };
}

export function getContextualLinks(inputs: UserInputs) {
  const links = [
    { url: 'https://gearuptofit.com/', title: 'GearUpToFit — Training Plans, Workouts & Weight Loss Guides', description: 'Explore our full library of training plans, workout routines, and sustainable weight-loss strategies.' },
    { url: 'https://gearuptofit.com/about-us/', title: 'About GearUpToFit — Expert Fitness Guidance You Can Trust', description: 'Learn about our mission to help you achieve your fitness goals with evidence-based guidance.' },
  ];

  if (inputs.runningInterest) {
    links.push({
      url: 'https://gearuptofit.com/running/how-to-choose-the-right-running-shoes/',
      title: 'How to Choose the Right Running Shoes',
      description: 'Your plan includes running — find the perfect shoes to prevent injury and boost performance.',
    });
    links.push({
      url: 'https://gearuptofit.com/review/running-shoes/',
      title: 'Best Running Shoes — Expert Reviews & Comparisons',
      description: 'Compare top-rated running shoes with our in-depth reviews and buyer guides.',
    });
  }

  return links;
}
