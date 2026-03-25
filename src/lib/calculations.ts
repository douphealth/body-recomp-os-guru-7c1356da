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
  calorieTarget: number;
  proteinGrams: number;
  carbGrams: number;
  fatGrams: number;
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
}

export interface TrainingDay {
  day: string;
  focus: string;
  exercises: { name: string; sets: number; reps: string; notes?: string }[];
}

export interface TrainingWeek {
  weekRange: string;
  phase: string;
  days: TrainingDay[];
  deload?: boolean;
}

export interface CardioBlock {
  type: string;
  sessionsPerWeek: number;
  duration: string;
  intensity: string;
  notes: string;
  runningPlan?: string;
}

export interface HabitWeek {
  week: number;
  habits: string[];
  focus: string;
}

function calculateBMR(sex: string, weightKg: number, heightCm: number, age: number): number {
  if (sex === 'male') {
    return 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  }
  return 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
}

function getActivityMultiplier(workoutFrequency: number, stepCount: number): number {
  let base = 1.2;
  if (stepCount >= 10000) base = 1.3;
  else if (stepCount >= 7000) base = 1.25;

  if (workoutFrequency >= 6) return base + 0.45;
  if (workoutFrequency >= 5) return base + 0.35;
  if (workoutFrequency >= 4) return base + 0.25;
  return base + 0.15;
}

function getGoalLabel(goal: string): string {
  switch (goal) {
    case 'fat-loss': return 'Fat Loss';
    case 'lean-muscle': return 'Lean Muscle Gain';
    case 'recomp': return 'Body Recomposition';
    default: return '';
  }
}

function generateTrainingPlan(inputs: UserInputs): TrainingWeek[] {
  const { workoutFrequency, equipmentAccess, goal } = inputs;
  const isGym = equipmentAccess === 'gym';
  const isHome = equipmentAccess === 'home';

  const gymExercises = {
    push: [
      { name: 'Barbell Bench Press', sets: 4, reps: '8-10' },
      { name: 'Overhead Press', sets: 3, reps: '8-12' },
      { name: 'Incline Dumbbell Press', sets: 3, reps: '10-12' },
      { name: 'Cable Lateral Raises', sets: 3, reps: '12-15' },
      { name: 'Tricep Pushdowns', sets: 3, reps: '12-15' },
    ],
    pull: [
      { name: 'Barbell Rows', sets: 4, reps: '8-10' },
      { name: 'Pull-ups / Lat Pulldowns', sets: 3, reps: '8-12' },
      { name: 'Seated Cable Rows', sets: 3, reps: '10-12' },
      { name: 'Face Pulls', sets: 3, reps: '15-20' },
      { name: 'Barbell Curls', sets: 3, reps: '10-12' },
    ],
    legs: [
      { name: 'Barbell Squats', sets: 4, reps: '6-8' },
      { name: 'Romanian Deadlifts', sets: 3, reps: '8-10' },
      { name: 'Leg Press', sets: 3, reps: '10-12' },
      { name: 'Walking Lunges', sets: 3, reps: '12 each' },
      { name: 'Calf Raises', sets: 4, reps: '12-15' },
    ],
    upper: [
      { name: 'Dumbbell Bench Press', sets: 4, reps: '8-10' },
      { name: 'Dumbbell Rows', sets: 4, reps: '8-10' },
      { name: 'Overhead Press', sets: 3, reps: '10-12' },
      { name: 'Lat Pulldowns', sets: 3, reps: '10-12' },
      { name: 'Lateral Raises', sets: 3, reps: '12-15' },
    ],
    lower: [
      { name: 'Deadlifts', sets: 4, reps: '5-6' },
      { name: 'Front Squats', sets: 3, reps: '8-10' },
      { name: 'Hip Thrusts', sets: 3, reps: '10-12' },
      { name: 'Leg Curls', sets: 3, reps: '12-15' },
      { name: 'Calf Raises', sets: 4, reps: '12-15' },
    ],
    core: [
      { name: 'Hanging Leg Raises', sets: 3, reps: '12-15' },
      { name: 'Cable Woodchops', sets: 3, reps: '12 each' },
      { name: 'Ab Wheel Rollouts', sets: 3, reps: '10-12' },
    ],
  };

  const homeExercises = {
    push: [
      { name: 'Push-ups (varied grips)', sets: 4, reps: '15-20' },
      { name: 'Pike Push-ups', sets: 3, reps: '10-12' },
      { name: 'Diamond Push-ups', sets: 3, reps: '12-15' },
      { name: 'Dips (chair)', sets: 3, reps: '10-15' },
    ],
    pull: [
      { name: 'Doorframe Rows / Resistance Band Rows', sets: 4, reps: '12-15' },
      { name: 'Resistance Band Pull-aparts', sets: 3, reps: '15-20' },
      { name: 'Superman Holds', sets: 3, reps: '15-20' },
      { name: 'Bicep Curls (bands/water jugs)', sets: 3, reps: '12-15' },
    ],
    legs: [
      { name: 'Bodyweight Squats', sets: 4, reps: '20-25' },
      { name: 'Bulgarian Split Squats', sets: 3, reps: '12 each' },
      { name: 'Glute Bridges', sets: 3, reps: '15-20' },
      { name: 'Step-ups', sets: 3, reps: '12 each' },
      { name: 'Calf Raises', sets: 4, reps: '20-25' },
    ],
    upper: [
      { name: 'Push-ups', sets: 4, reps: '15-20' },
      { name: 'Resistance Band Rows', sets: 4, reps: '12-15' },
      { name: 'Pike Push-ups', sets: 3, reps: '10-12' },
      { name: 'Band Pull-aparts', sets: 3, reps: '15-20' },
    ],
    lower: [
      { name: 'Jump Squats', sets: 4, reps: '12-15' },
      { name: 'Single-leg Deadlifts', sets: 3, reps: '10 each' },
      { name: 'Wall Sits', sets: 3, reps: '45-60s' },
      { name: 'Lateral Lunges', sets: 3, reps: '12 each' },
    ],
    core: [
      { name: 'Planks', sets: 3, reps: '45-60s' },
      { name: 'Bicycle Crunches', sets: 3, reps: '20 each' },
      { name: 'Mountain Climbers', sets: 3, reps: '30s' },
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
      { day: 'Day 6', focus: 'Core + Conditioning', exercises: [...ex.core, { name: 'HIIT Circuit', sets: 3, reps: '10 min' }] },
    ];
  }

  const intensityModifier = goal === 'fat-loss' ? 'higher reps, shorter rest' : goal === 'lean-muscle' ? 'progressive overload focus' : 'moderate intensity, volume cycling';

  return [
    { weekRange: 'Weeks 1-2', phase: `Foundation (${intensityModifier})`, days: splitDays },
    { weekRange: 'Weeks 3-4', phase: `Build Phase (increase weight 5-10%)`, days: splitDays },
    { weekRange: 'Weeks 5-6', phase: `Peak Phase (intensity peak)`, days: splitDays },
    { weekRange: 'Weeks 7-8', phase: `Deload & Test (reduce volume 40%)`, days: splitDays, deload: true },
  ];
}

function generateCardioPlan(inputs: UserInputs): CardioBlock {
  const { goal, stepCount, runningInterest } = inputs;
  const baseSteps = stepCount < 7000 ? 'Increase daily steps to 7,000+' : stepCount < 10000 ? 'Aim for 10,000 daily steps' : 'Maintain 10,000+ daily steps';

  if (goal === 'fat-loss') {
    return {
      type: runningInterest ? 'Running + Walking' : 'Low-Impact Steady State',
      sessionsPerWeek: runningInterest ? 3 : 4,
      duration: '25-40 minutes',
      intensity: 'Zone 2 (conversational pace) + 1 HIIT session/week',
      notes: baseSteps,
      runningPlan: runningInterest ? 'Start with Couch-to-5K progression. Week 1-2: Run 1min/Walk 2min × 8. Week 3-4: Run 2min/Walk 1min × 8. Week 5-6: Run 3min/Walk 1min × 6. Week 7-8: Run 20-25 min continuous.' : undefined,
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
    };
  }
  return {
    type: runningInterest ? 'Mixed Running + Walking' : 'Moderate Cardio',
    sessionsPerWeek: 3,
    duration: '20-35 minutes',
    intensity: 'Zone 2 with occasional Zone 3 intervals',
    notes: `${baseSteps}. Alternate higher and lower intensity days.`,
    runningPlan: runningInterest ? 'Alternate easy runs (25 min) with tempo intervals (20 min with 4×2 min pickups). 3x/week.' : undefined,
  };
}

function generateRecoveryChecklist(inputs: UserInputs): string[] {
  const checklist = [
    '🛏️ Sleep 7-9 hours per night — prioritize consistent sleep/wake times',
    '💧 Drink 0.5oz per lb of bodyweight in water daily (minimum)',
    '🧘 Stretch or foam roll for 10 minutes after every workout',
    '📅 Take 1-2 full rest days per week (active recovery walks are fine)',
    '🍎 Eat whole foods for 80%+ of your calories',
    '📊 Track progress weekly: weight, measurements, photos',
    '🧠 Practice 5 minutes of mindfulness or deep breathing daily',
  ];

  if (inputs.workoutFrequency >= 5) {
    checklist.push('⚡ Deload every 4th week: reduce volume by 40%, keep intensity');
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

export function calculatePlan(inputs: UserInputs): PlanResults {
  const bmr = calculateBMR(inputs.sex, inputs.weightKg, inputs.heightCm, inputs.age);
  const activityMultiplier = getActivityMultiplier(inputs.workoutFrequency, inputs.stepCount);
  const tdee = Math.round(bmr * activityMultiplier);
  const leanBodyMass = inputs.weightKg * (1 - inputs.bodyFatPercent / 100);

  let calorieTarget: number;
  let weeklyCalorieRange: { low: number; high: number } | undefined;

  switch (inputs.goal) {
    case 'fat-loss':
      calorieTarget = Math.round(tdee * 0.80);
      break;
    case 'lean-muscle':
      calorieTarget = Math.round(tdee * 1.10);
      break;
    case 'recomp':
      calorieTarget = tdee;
      weeklyCalorieRange = {
        low: Math.round(tdee * 0.85),
        high: Math.round(tdee * 1.10),
      };
      break;
    default:
      calorieTarget = tdee;
  }

  // Protein: 1.6-2.2 g/kg LBM
  let proteinMultiplier: number;
  switch (inputs.goal) {
    case 'fat-loss': proteinMultiplier = 2.2; break;
    case 'lean-muscle': proteinMultiplier = 2.0; break;
    case 'recomp': proteinMultiplier = 2.0; break;
    default: proteinMultiplier = 1.8;
  }
  if (inputs.dietStyle === 'high-protein') proteinMultiplier = Math.min(proteinMultiplier + 0.2, 2.4);

  const proteinGrams = Math.round(leanBodyMass * proteinMultiplier);
  const proteinCals = proteinGrams * 4;

  let fatPercent: number;
  let carbPercent: number;
  if (inputs.dietStyle === 'keto') {
    fatPercent = 70;
    carbPercent = 5;
  } else if (inputs.dietStyle === 'high-protein') {
    fatPercent = 25;
    carbPercent = 100 - (proteinCals / calorieTarget * 100) - fatPercent;
  } else {
    fatPercent = 30;
    carbPercent = 100 - (proteinCals / calorieTarget * 100) - fatPercent;
  }

  const proteinPercent = Math.round(proteinCals / calorieTarget * 100);
  carbPercent = Math.max(Math.round(100 - proteinPercent - fatPercent), 5);
  fatPercent = Math.round(100 - proteinPercent - carbPercent);

  const fatGrams = Math.round((calorieTarget * fatPercent / 100) / 9);
  const carbGrams = Math.round((calorieTarget * carbPercent / 100) / 4);

  const goalLabel = getGoalLabel(inputs.goal);

  const quickSummary = `Based on your profile, your ${goalLabel.toLowerCase()} plan targets ${calorieTarget} calories/day with ${proteinGrams}g protein. You'll train ${inputs.workoutFrequency} days/week with a ${inputs.equipmentAccess === 'gym' ? 'gym-based' : inputs.equipmentAccess === 'home' ? 'home-based' : 'minimal-equipment'} ${inputs.workoutFrequency <= 3 ? 'full-body' : inputs.workoutFrequency <= 4 ? 'upper/lower' : 'push/pull/legs'} split over 8 weeks, progressing through foundation, build, peak, and deload phases.${inputs.runningInterest ? ' Your plan includes a progressive running program.' : ''} Focus on ${inputs.goal === 'fat-loss' ? 'maintaining muscle while in a caloric deficit' : inputs.goal === 'lean-muscle' ? 'progressive overload with a slight caloric surplus' : 'cycling calories around training days for simultaneous fat loss and muscle gain'}.`;

  return {
    tdee,
    calorieTarget,
    proteinGrams,
    carbGrams,
    fatGrams,
    proteinPercent,
    carbPercent: Math.max(carbPercent, 5),
    fatPercent,
    leanBodyMass: Math.round(leanBodyMass * 10) / 10,
    trainingPlan: generateTrainingPlan(inputs),
    cardioPlan: generateCardioPlan(inputs),
    recoveryChecklist: generateRecoveryChecklist(inputs),
    habitPlan: generateHabitPlan(),
    quickSummary,
    goalLabel,
    weeklyCalorieRange,
  };
}

export function getContextualLinks(inputs: UserInputs) {
  const links = [
    { url: 'https://gearuptofit.com/', title: 'GearUpToFit — Training Plans, Workouts & Weight Loss Guides', description: 'Explore our full library of training plans, workout routines, and sustainable weight-loss strategies.', always: true },
    { url: 'https://gearuptofit.com/about-us/', title: 'About GearUpToFit — Expert Fitness Guidance You Can Trust', description: 'Learn about our mission to help you achieve your fitness goals with evidence-based guidance.', always: true },
  ];

  if (inputs.runningInterest) {
    links.push({
      url: 'https://gearuptofit.com/running/how-to-choose-the-right-running-shoes/',
      title: 'How to Choose the Right Running Shoes',
      description: 'Your plan includes running — find the perfect shoes to prevent injury and boost performance.',
      always: false,
    });
    links.push({
      url: 'https://gearuptofit.com/review/running-shoes/',
      title: 'Best Running Shoes — Expert Reviews & Comparisons',
      description: 'Compare top-rated running shoes with our in-depth reviews and buyer guides.',
      always: false,
    });
  }

  return links;
}
