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

/* ─── Phase Scheme (true periodization per goal) ───
   Linear periodization for fat-loss preserves strength via maintained intensity
   while reducing fatigue. For lean-muscle, classic accumulation→intensification.
   Recomp uses DUP-style undulation. Deload reduces volume ~50% per Bell et al. (2020).
   Refs: Helms et al. (2014), Schoenfeld (2010), Rhea et al. (2003), Bell et al. (2020).
*/
interface PhaseScheme {
  label: string;
  intensityGuideline: string;
  volumeChange: string;
  compoundSets: number;
  compoundReps: string;
  compoundRpe: string;
  compoundRest: string;
  accessorySets: number;
  accessoryReps: string;
  accessoryRpe: string;
  accessoryRest: string;
  loadProgression: string;
  finisher?: { name: string; sets: number; reps: string; rpe: string; rest: string; notes: string };
  deload?: boolean;
}

function getPhaseScheme(goal: UserInputs['goal'], phaseIdx: number): PhaseScheme {
  // phaseIdx: 0..3 (Weeks 1-2, 3-4, 5-6, 7-8)
  if (goal === 'fat-loss') {
    const phases: PhaseScheme[] = [
      {
        label: 'Foundation — Movement Quality & Capacity',
        intensityGuideline: 'RPE 6-7 across the board. Leave 3 reps in reserve.',
        volumeChange: 'Hard sets per muscle group / week: 10-12 (within MEV-MAV range)',
        compoundSets: 3, compoundReps: '8-10', compoundRpe: '6-7', compoundRest: '2:00',
        accessorySets: 3, accessoryReps: '10-12', accessoryRpe: '7-8', accessoryRest: '60-90s',
        loadProgression: 'Establish baseline weights. Log every set.',
        finisher: { name: 'Metabolic Finisher (KB swings or bike intervals)', sets: 3, reps: '40s on / 20s off', rpe: '8', rest: '60s', notes: '8-10 min total. Optional but recommended for fat loss.' },
      },
      {
        label: 'Strength Preservation — Hold the Bar',
        intensityGuideline: 'RPE 7-8 on compounds. Maintain or add 2.5-5kg vs P1.',
        volumeChange: 'Hard sets per muscle group / week: 10-12 (volume held — intensity up)',
        compoundSets: 4, compoundReps: '5-7', compoundRpe: '7-8', compoundRest: '2:30-3:00',
        accessorySets: 3, accessoryReps: '8-12', accessoryRpe: '8', accessoryRest: '75s',
        loadProgression: 'Add load before adding reps. Strength = muscle insurance in a deficit.',
        finisher: { name: 'Density Finisher (paired DB carries + push-ups)', sets: 3, reps: '45s circuit', rpe: '8', rest: '90s', notes: 'Heart-rate up; preserves work capacity.' },
      },
      {
        label: 'Density Phase — Same Work, Less Rest',
        intensityGuideline: 'RPE 8 on accessories. Compress rest periods 25-30%.',
        volumeChange: 'Hard sets / muscle / week: 12. Density up, total volume steady.',
        compoundSets: 4, compoundReps: '5-7', compoundRpe: '7-8', compoundRest: '2:00',
        accessorySets: 3, accessoryReps: '10-15', accessoryRpe: '8-9', accessoryRest: '45-60s',
        loadProgression: 'Hold loads from P2. Win the workout in less time.',
        finisher: { name: 'EMOM Conditioning (10 cal row + 5 burpees / min)', sets: 8, reps: 'every 60s', rpe: '8-9', rest: 'remainder of minute', notes: '8-min EMOM. Great metabolic stimulus.' },
      },
      {
        label: 'Deload & Re-Test — Rebound Week',
        intensityGuideline: 'RPE 5-6. Half the sets, same weights. Re-test top set in W8.',
        volumeChange: 'Hard sets reduced ~50% (Bell et al. 2020). Recovery is the work.',
        compoundSets: 2, compoundReps: '5', compoundRpe: '5-6', compoundRest: '2:00',
        accessorySets: 2, accessoryReps: '10', accessoryRpe: '6-7', accessoryRest: '60s',
        loadProgression: 'W7 deload. W8: optional 1-rep top-set test on key lifts.',
        deload: true,
      },
    ];
    return phases[phaseIdx];
  }
  if (goal === 'lean-muscle') {
    const phases: PhaseScheme[] = [
      {
        label: 'Accumulation — Volume Base',
        intensityGuideline: 'RPE 6-7. Build technical proficiency. 3 RIR.',
        volumeChange: 'Hard sets / muscle / week: 12-14 (MEV → MAV).',
        compoundSets: 3, compoundReps: '8-10', compoundRpe: '6-7', compoundRest: '2:00',
        accessorySets: 3, accessoryReps: '10-12', accessoryRpe: '7-8', accessoryRest: '90s',
        loadProgression: 'Add 1 rep / week before adding load.',
      },
      {
        label: 'Hypertrophy Build — Add Volume',
        intensityGuideline: 'RPE 7-8. 2 RIR.',
        volumeChange: '+1 set on compounds. Hard sets / muscle / week: 14-18.',
        compoundSets: 4, compoundReps: '8-10', compoundRpe: '7-8', compoundRest: '2:00',
        accessorySets: 4, accessoryReps: '10-12', accessoryRpe: '8', accessoryRest: '90s',
        loadProgression: 'Double progression: hit top reps × all sets → +2.5-5kg.',
      },
      {
        label: 'Intensification — Heavier, Closer to Failure',
        intensityGuideline: 'RPE 8-9. 0-1 RIR on last sets. Add cluster set on top compound.',
        volumeChange: 'Hard sets / muscle / week: 14-16. Intensity peaks.',
        compoundSets: 4, compoundReps: '5-8', compoundRpe: '8-9', compoundRest: '2:30-3:00',
        accessorySets: 4, accessoryReps: '8-12', accessoryRpe: '8-9', accessoryRest: '90s',
        loadProgression: 'Push load. Last set: AMRAP @ RPE 9.',
      },
      {
        label: 'Deload & Test — Realize Gains',
        intensityGuideline: 'RPE 5-6. Half volume. W8: test 5RM or 1RM on 1-2 main lifts.',
        volumeChange: 'Hard sets ~50% reduction. Movement quality focus.',
        compoundSets: 2, compoundReps: '5', compoundRpe: '5-6', compoundRest: '2:00',
        accessorySets: 2, accessoryReps: '10', accessoryRpe: '6', accessoryRest: '60s',
        loadProgression: 'Recover, then test PRs in week 8.',
        deload: true,
      },
    ];
    return phases[phaseIdx];
  }
  // recomp — DUP undulation
  const phases: PhaseScheme[] = [
    {
      label: 'Foundation — Mixed Stimulus',
      intensityGuideline: 'RPE 7. Alternate strength/hypertrophy session-to-session.',
      volumeChange: 'Hard sets / muscle / week: 10-14.',
      compoundSets: 4, compoundReps: '6-8', compoundRpe: '7', compoundRest: '2:30',
      accessorySets: 3, accessoryReps: '10-12', accessoryRpe: '7-8', accessoryRest: '75s',
      loadProgression: 'Track both top set and total tonnage.',
    },
    {
      label: 'Build — Undulating Loading',
      intensityGuideline: 'RPE 7-8. Heavy day + volume day per body part.',
      volumeChange: '+1 set top compound. Hard sets: 12-16.',
      compoundSets: 4, compoundReps: '5-8', compoundRpe: '7-8', compoundRest: '2:30',
      accessorySets: 4, accessoryReps: '10-15', accessoryRpe: '8', accessoryRest: '75s',
      loadProgression: 'Heavy day: +2.5kg. Volume day: +1 rep.',
    },
    {
      label: 'Peak — Density + Intensity',
      intensityGuideline: 'RPE 8. Mini-circuits on accessories. 1 metabolic finisher.',
      volumeChange: 'Hard sets: 14-16. Compress accessory rest.',
      compoundSets: 4, compoundReps: '5-8', compoundRpe: '8', compoundRest: '2:00',
      accessorySets: 3, accessoryReps: '12-15', accessoryRpe: '8-9', accessoryRest: '60s',
      loadProgression: 'Hold loads, raise density.',
      finisher: { name: 'Conditioning Finisher (sled push or bike sprints)', sets: 4, reps: '30s on / 90s off', rpe: '9', rest: '90s', notes: 'Optional. Skip if recovery is poor.' },
    },
    {
      label: 'Deload — Reset & Reassess',
      intensityGuideline: 'RPE 5-6. Re-measure body comp at end of W8.',
      volumeChange: '~50% volume reduction. Movement focus.',
      compoundSets: 2, compoundReps: '6', compoundRpe: '5-6', compoundRest: '2:00',
      accessorySets: 2, accessoryReps: '10', accessoryRpe: '6', accessoryRest: '60s',
      loadProgression: 'Reassess and plan next 8-week block.',
      deload: true,
    },
  ];
  return phases[phaseIdx];
}

interface BaseExercise { name: string; type: 'compound' | 'accessory'; notes?: string }

function generateTrainingPlan(inputs: UserInputs): TrainingWeek[] {
  const { workoutFrequency, equipmentAccess, goal } = inputs;
  const isGym = equipmentAccess === 'gym';

  const gymPool: Record<string, BaseExercise[]> = {
    push: [
      { name: 'Barbell Bench Press', type: 'compound', notes: 'Flat bench, full ROM. Pause briefly on chest.' },
      { name: 'Overhead Press', type: 'compound', notes: 'Standing or seated. Brace core.' },
      { name: 'Incline Dumbbell Press', type: 'accessory' },
      { name: 'Cable Lateral Raises', type: 'accessory' },
      { name: 'Tricep Rope Pushdowns', type: 'accessory' },
    ],
    pull: [
      { name: 'Barbell Row (Pendlay or Bent-Over)', type: 'compound', notes: 'Hinge at hips. Pull to lower chest.' },
      { name: 'Pull-ups / Lat Pulldowns', type: 'compound', notes: 'Full hang at bottom.' },
      { name: 'Seated Cable Rows', type: 'accessory' },
      { name: 'Face Pulls', type: 'accessory', notes: 'External rotation at top — shoulder health.' },
      { name: 'Incline DB Curls', type: 'accessory' },
    ],
    legs: [
      { name: 'Barbell Back Squat', type: 'compound', notes: 'At or below parallel. Brace before descent.' },
      { name: 'Romanian Deadlift', type: 'compound', notes: 'Hinge at hips, soft knees. Feel hamstrings stretch.' },
      { name: 'Leg Press', type: 'accessory' },
      { name: 'Walking Lunges', type: 'accessory' },
      { name: 'Standing Calf Raises', type: 'accessory', notes: 'Pause 1s at full stretch.' },
    ],
    upper: [
      { name: 'Dumbbell Bench Press', type: 'compound' },
      { name: 'Chest-Supported Row', type: 'compound' },
      { name: 'Seated DB Shoulder Press', type: 'accessory' },
      { name: 'Lat Pulldowns', type: 'accessory' },
      { name: 'Lateral Raises', type: 'accessory' },
    ],
    lower: [
      { name: 'Conventional Deadlift', type: 'compound', notes: 'Brace, hinge, drive floor away.' },
      { name: 'Front Squat or Hack Squat', type: 'compound' },
      { name: 'Hip Thrust', type: 'accessory', notes: 'Pause + squeeze at top.' },
      { name: 'Lying Leg Curl', type: 'accessory' },
      { name: 'Seated Calf Raise', type: 'accessory' },
    ],
    core: [
      { name: 'Hanging Leg Raises', type: 'accessory' },
      { name: 'Cable Woodchops', type: 'accessory' },
      { name: 'Ab Wheel Rollouts', type: 'accessory' },
    ],
  };

  const homePool: Record<string, BaseExercise[]> = {
    push: [
      { name: 'Push-ups (varied grips)', type: 'compound', notes: 'Tempo 2-1-1. Elevate feet for progression.' },
      { name: 'Pike Push-ups', type: 'compound' },
      { name: 'Diamond Push-ups', type: 'accessory' },
      { name: 'Chair / Bench Dips', type: 'accessory' },
    ],
    pull: [
      { name: 'Doorframe Rows / Band Rows', type: 'compound', notes: 'Squeeze shoulder blades.' },
      { name: 'Resistance Band Pull-aparts', type: 'accessory' },
      { name: 'Superman Holds', type: 'accessory' },
      { name: 'Bicep Curls (bands)', type: 'accessory' },
    ],
    legs: [
      { name: 'Bodyweight Squat (tempo or weighted)', type: 'compound', notes: '3-1-1 tempo. Add backpack load.' },
      { name: 'Bulgarian Split Squats', type: 'compound' },
      { name: 'Glute Bridges (single-leg)', type: 'accessory' },
      { name: 'Step-ups', type: 'accessory' },
      { name: 'Calf Raises', type: 'accessory' },
    ],
    upper: [
      { name: 'Push-ups', type: 'compound' },
      { name: 'Resistance Band Rows', type: 'compound' },
      { name: 'Pike Push-ups', type: 'accessory' },
      { name: 'Band Pull-aparts', type: 'accessory' },
    ],
    lower: [
      { name: 'Jump Squats (or weighted squats)', type: 'compound' },
      { name: 'Single-Leg Deadlift', type: 'compound' },
      { name: 'Wall Sit', type: 'accessory' },
      { name: 'Lateral Lunges', type: 'accessory' },
    ],
    core: [
      { name: 'Plank', type: 'accessory' },
      { name: 'Bicycle Crunches', type: 'accessory' },
      { name: 'Mountain Climbers', type: 'accessory' },
    ],
  };

  const pool = isGym ? gymPool : homePool;

  const buildSplit = (): { day: string; focus: string; exercises: BaseExercise[] }[] => {
    if (workoutFrequency <= 3) {
      return [
        { day: 'Day 1', focus: 'Full Body A (Push focus)', exercises: [...pool.push.slice(0, 3), ...pool.legs.slice(0, 2)] },
        { day: 'Day 2', focus: 'Full Body B (Pull focus)', exercises: [...pool.pull.slice(0, 3), ...pool.legs.slice(2, 4)] },
        { day: 'Day 3', focus: 'Full Body C (Legs focus)', exercises: [...pool.legs, pool.core[0]] },
      ];
    }
    if (workoutFrequency === 4) {
      return [
        { day: 'Day 1', focus: 'Upper Body', exercises: pool.upper },
        { day: 'Day 2', focus: 'Lower Body', exercises: pool.legs },
        { day: 'Day 3', focus: 'Push + Core', exercises: [...pool.push.slice(0, 3), pool.core[0]] },
        { day: 'Day 4', focus: 'Pull + Posterior', exercises: [...pool.pull.slice(0, 3), ...pool.lower.slice(0, 2)] },
      ];
    }
    if (workoutFrequency === 5) {
      return [
        { day: 'Day 1', focus: 'Push', exercises: pool.push },
        { day: 'Day 2', focus: 'Pull', exercises: pool.pull },
        { day: 'Day 3', focus: 'Legs', exercises: pool.legs },
        { day: 'Day 4', focus: 'Upper Body', exercises: pool.upper },
        { day: 'Day 5', focus: 'Lower + Core', exercises: [...pool.lower.slice(0, 3), ...pool.core] },
      ];
    }
    return [
      { day: 'Day 1', focus: 'Push', exercises: pool.push },
      { day: 'Day 2', focus: 'Pull', exercises: pool.pull },
      { day: 'Day 3', focus: 'Legs', exercises: pool.legs },
      { day: 'Day 4', focus: 'Upper Body', exercises: pool.upper },
      { day: 'Day 5', focus: 'Lower Body', exercises: pool.lower },
      { day: 'Day 6', focus: 'Core + Conditioning', exercises: pool.core },
    ];
  };

  const baseSplit = buildSplit();
  const phaseRanges = ['Weeks 1-2', 'Weeks 3-4', 'Weeks 5-6', 'Weeks 7-8'];

  return phaseRanges.map((weekRange, phaseIdx) => {
    const scheme = getPhaseScheme(goal, phaseIdx);
    const days: TrainingDay[] = baseSplit.map(d => {
      const exercises = d.exercises.map(e => {
        const isCompound = e.type === 'compound';
        return {
          name: e.name,
          sets: isCompound ? scheme.compoundSets : scheme.accessorySets,
          reps: isCompound ? scheme.compoundReps : scheme.accessoryReps,
          rpe: isCompound ? scheme.compoundRpe : scheme.accessoryRpe,
          rest: isCompound ? scheme.compoundRest : scheme.accessoryRest,
          notes: e.notes,
        };
      });
      // Append finisher to last training day of week if scheme has one and not deload
      if (scheme.finisher && d === baseSplit[baseSplit.length - 1]) {
        exercises.push(scheme.finisher);
      }
      return { day: d.day, focus: d.focus, exercises };
    });
    return {
      weekRange,
      phase: scheme.label,
      days,
      deload: scheme.deload,
      volumeChange: `${scheme.volumeChange}  •  ${scheme.loadProgression}`,
      intensityGuideline: scheme.intensityGuideline,
    };
  });
}

function generateCardioPlan(inputs: UserInputs): CardioBlock {
  const { goal, stepCount, runningInterest, age } = inputs;
  const baseSteps = stepCount < 7000 ? 'Increase daily steps to 7,000+' : stepCount < 10000 ? 'Aim for 10,000 daily steps' : 'Maintain 10,000+ daily steps';
  const hrZones = calculateHeartRateZones(age);

  if (goal === 'fat-loss') {
    return {
      type: runningInterest ? 'Running + Zone-2 Walking' : 'Zone-2 Steady State + 1 HIIT',
      sessionsPerWeek: runningInterest ? 3 : 4,
      duration: 'Progressive: 20→40 min over 8 weeks',
      intensity: 'Zone 2 (60-70% HRmax, conversational) + 1 weekly HIIT (Zone 4-5)',
      notes: `${baseSteps}. Cardio progression: W1-2 → 20 min × ${runningInterest ? 3 : 4}. W3-4 → 25 min. W5-6 → 30 min + 1 HIIT (4×4 min @ Z4 / 3 min Z2). W7 deload (20 min easy). W8 → re-test 30-min Z2 distance.`,
      runningPlan: runningInterest ? 'Couch-to-5K-style ramp. W1-2: 1 min run / 2 min walk × 8. W3-4: 2 min run / 1 min walk × 8. W5-6: Run 5 min / walk 1 min × 5 + 1 tempo session (4×3 min @ threshold). W7: easy 20 min. W8: continuous 25-30 min @ Z2.' : undefined,
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
