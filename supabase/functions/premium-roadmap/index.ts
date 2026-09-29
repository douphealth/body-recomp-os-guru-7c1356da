import {
  corsHeaders,
  fetchEntitlement,
  fetchPlan,
  isEntitlementActive,
  json,
  serverEnv,
  validPlanToken,
} from '../_shared/billing.ts';

type TrainingWeek = {
  phase?: string;
  deload?: boolean;
  volumeChange?: string;
  intensityGuideline?: string;
  days?: unknown[];
};

type HabitWeek = {
  week?: number;
  focus?: string;
  habits?: string[];
};

function numberValue(value: unknown, fallback = 0) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function textValue(value: unknown, fallback = '') {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders(req) });
  if (req.method !== 'POST') return json(req, { error: 'Method not allowed' }, 405);

  try {
    const body = await req.json().catch(() => ({}));
    const token = String(body?.token || '');
    if (!validPlanToken(token)) return json(req, { error: 'Invalid plan token' }, 400);

    const { supabaseUrl, serviceRoleKey } = serverEnv();
    const [plan, entitlement] = await Promise.all([
      fetchPlan(supabaseUrl, serviceRoleKey, token),
      fetchEntitlement(supabaseUrl, serviceRoleKey, token),
    ]);
    if (!plan) return json(req, { error: 'Plan not found' }, 404);
    if (!isEntitlementActive(entitlement)) return json(req, { error: 'Pro entitlement required' }, 402);

    const outputs = plan.outputs || {};
    const inputs = plan.inputs || {};
    const trainingPlan = Array.isArray(outputs.trainingPlan) ? outputs.trainingPlan as TrainingWeek[] : [];
    const habitPlan = Array.isArray(outputs.habitPlan) ? outputs.habitPlan as HabitWeek[] : [];
    const calorieTarget = numberValue(outputs.calorieTarget);
    const proteinGrams = numberValue(outputs.proteinGrams);
    const workoutFrequency = numberValue(inputs.workoutFrequency);
    const stepCount = numberValue(inputs.stepCount);
    const goalLabel = textValue(plan.goal_label || outputs.goalLabel, 'Body Recomposition');

    const weeks = Array.from({ length: 8 }, (_, index) => {
      const weekNumber = index + 1;
      const training = trainingPlan[index] || {};
      const habit = habitPlan.find((item) => item.week === weekNumber) || {};
      const isReviewWeek = weekNumber === 2 || weekNumber === 4 || weekNumber === 6 || weekNumber === 8;
      const nutritionFocus = weekNumber <= 2
        ? 'Hold your calorie and protein targets steady long enough to create a reliable baseline.'
        : weekNumber <= 6
          ? 'Keep targets stable unless the 14-day trend and adherence both support an adjustment.'
          : 'Prioritize repeatability and recovery over aggressive last-minute changes.';

      return {
        week: weekNumber,
        phase: textValue(training.phase, `Week ${weekNumber}`),
        focus: textValue(habit.focus, training.deload ? 'Reduce fatigue and consolidate technique.' : 'Execute the plan consistently and log performance.'),
        deload: Boolean(training.deload),
        intensity: textValue(training.intensityGuideline, training.deload ? 'Keep effort comfortably submaximal.' : 'Use controlled reps and stop before form deteriorates.'),
        volume: textValue(training.volumeChange, `${workoutFrequency || 'Planned'} strength sessions this week.`),
        habits: Array.isArray(habit.habits) ? habit.habits.slice(0, 5) : [],
        checkpoints: [
          workoutFrequency ? `Complete ${workoutFrequency} planned training sessions.` : 'Complete the planned training sessions.',
          stepCount ? `Average about ${stepCount.toLocaleString('en-US')} steps per day.` : 'Keep daily movement consistent.',
          proteinGrams ? `Average about ${proteinGrams} g protein per day.` : 'Hit the plan protein target consistently.',
          calorieTarget ? `Use ${calorieTarget.toLocaleString('en-US')} kcal/day as the starting target, then judge the trend rather than single-day scale changes.` : 'Use the plan calorie target consistently.',
        ],
        nutritionFocus,
        reviewPrompt: isReviewWeek
          ? 'Review the previous 14 days: adherence, 7-day weight trend, gym performance, hunger, sleep, and recovery. Change only one major variable at a time.'
          : 'Keep the plan stable this week and collect clean adherence data before making changes.',
      };
    });

    return json(req, {
      goalLabel,
      summary: { calorieTarget, proteinGrams, workoutFrequency, stepCount },
      weeks,
      guardrails: [
        'Do not chase day-to-day scale noise; use multi-day trends.',
        'Do not increase training load when technique or recovery is deteriorating.',
        'Stop training and seek qualified medical advice for chest pain, fainting, severe shortness of breath, or persistent injury symptoms.',
      ],
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('premium-roadmap', error);
    return json(req, { error: 'Unable to build the Pro roadmap' }, 500);
  }
});
