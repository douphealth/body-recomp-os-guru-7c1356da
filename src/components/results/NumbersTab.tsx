import { lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import {
  Droplets, Leaf, Dumbbell, Activity as ActivityIcon, Utensils, Clock,
  Flame, Beef, Wheat, Nut, TrendingDown, TrendingUp, Minus, Calculator,
} from 'lucide-react';
import AnimatedNumber from '@/components/AnimatedNumber';
import GlossaryTooltip from '@/components/results/GlossaryTooltip';
const MacroDonutChart = lazy(() => import('@/components/results/MacroDonutChart'));
const TDEEBarChart = lazy(() => import('@/components/results/TDEEBarChart'));
import SampleMealPlan from '@/components/results/SampleMealPlan';
import type { PlanResults, UserInputs } from '@/lib/calculations';

const ChartFallback = () => (
  <div className="h-48 rounded-2xl bg-secondary/20 border border-border/40 animate-pulse" aria-hidden="true" />
);

interface Props {
  plan: PlanResults;
  inputs: UserInputs;
}

const NumbersTab = ({ plan, inputs }: Props) => {
  const isDeficit = plan.deficitOrSurplus < 0;
  const isSurplus = plan.deficitOrSurplus > 0;
  const DeltaIcon = isDeficit ? TrendingDown : isSurplus ? TrendingUp : Minus;
  const deltaLabel = isDeficit
    ? `${Math.abs(plan.deficitOrSurplus)} kcal deficit`
    : isSurplus
      ? `${plan.deficitOrSurplus} kcal surplus`
      : 'Maintenance cycling';
  const deltaColor = isDeficit
    ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
    : isSurplus
      ? 'text-sky-400 bg-sky-500/10 border-sky-500/20'
      : 'text-amber-400 bg-amber-500/10 border-amber-500/20';

  const macros = [
    { label: 'Protein', value: plan.proteinGrams, percent: plan.proteinPercent, Icon: Beef, color: 'text-red-400', bar: 'from-red-500 to-red-400', bg: 'bg-red-500/5 border-red-500/20', sub: `${plan.proteinPerKgLBM}g/kg LBM` },
    { label: 'Carbs', value: plan.carbGrams, percent: plan.carbPercent, Icon: Wheat, color: 'text-blue-400', bar: 'from-blue-500 to-blue-400', bg: 'bg-blue-500/5 border-blue-500/20', sub: `${Math.round(plan.carbGrams * 4)} kcal` },
    { label: 'Fat', value: plan.fatGrams, percent: plan.fatPercent, Icon: Nut, color: 'text-yellow-400', bar: 'from-yellow-500 to-amber-400', bg: 'bg-yellow-500/5 border-yellow-500/20', sub: `${Math.round(plan.fatGrams * 9)} kcal` },
  ];

  return (
    <div className="space-y-4">
      {/* Premium calorie hero */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent p-6 md:p-8 card-glow"
      >
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-primary/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-primary/15 flex items-center justify-center">
                <Flame className="h-4 w-4 text-primary" />
              </div>
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Daily Calorie Target</p>
            </div>
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${deltaColor}`}>
              <DeltaIcon className="h-3 w-3" /> {deltaLabel}
            </span>
          </div>

          <div className="flex items-baseline gap-2 mb-1">
            <AnimatedNumber value={plan.calorieTarget} className="text-6xl md:text-7xl font-bold text-primary font-['Oswald'] tracking-tight text-glow" />
            <span className="text-xl text-muted-foreground font-['Oswald'] tracking-wider">kcal</span>
          </div>
          <p className="text-xs text-muted-foreground mb-5">
            from a maintenance of <span className="font-semibold text-foreground">{plan.tdee} kcal</span> · {Math.round((plan.calorieTarget / plan.tdee) * 100)}% of TDEE
          </p>

          {/* Macro bars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {macros.map((m) => (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className={`rounded-xl border p-3 ${m.bg}`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <m.Icon className={`h-3.5 w-3.5 ${m.color}`} />
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${m.color}`}>{m.label}</span>
                  </div>
                  <span className={`text-[10px] font-bold ${m.color}`}>{m.percent}%</span>
                </div>
                <div className="flex items-baseline gap-1 mb-2">
                  <AnimatedNumber value={m.value} className={`text-2xl font-bold font-['Oswald'] ${m.color}`} />
                  <span className="text-[10px] text-muted-foreground">g</span>
                </div>
                <div className="h-1 rounded-full bg-secondary/40 overflow-hidden mb-1">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${m.percent}%` }}
                    transition={{ duration: 0.9, delay: 0.3, ease: 'easeOut' }}
                    className={`h-full bg-gradient-to-r ${m.bar} rounded-full`}
                  />
                </div>
                <p className="text-[9px] text-muted-foreground">{m.sub}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* At-a-glance targets */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { Icon: Droplets, label: 'Hydration', value: `${plan.waterLiters}L`, sub: 'water/day', color: 'text-sky-400', ring: 'from-sky-500/20' },
          { Icon: Leaf, label: 'Fiber', value: `${plan.fiberGrams}g`, sub: 'gut + satiety', color: 'text-emerald-400', ring: 'from-emerald-500/20' },
          { Icon: Dumbbell, label: 'Training', value: `${inputs.workoutFrequency}×`, sub: 'sessions/wk', color: 'text-primary', ring: 'from-primary/20' },
          { Icon: ActivityIcon, label: 'Steps', value: inputs.stepCount.toLocaleString(), sub: 'NEAT goal', color: 'text-amber-400', ring: 'from-amber-500/20' },
        ].map((t, i) => (
          <motion.div
            key={t.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i }}
            className="relative overflow-hidden rounded-xl border border-border/50 bg-card p-3.5 hover:border-primary/30 transition-all group"
          >
            <div className={`absolute -top-8 -right-8 w-24 h-24 rounded-full bg-gradient-to-br ${t.ring} to-transparent blur-2xl opacity-0 group-hover:opacity-100 transition-opacity`} />
            <div className="relative">
              <div className="flex items-center gap-1.5 mb-2">
                <t.Icon className={`h-3.5 w-3.5 ${t.color}`} />
                <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">{t.label}</span>
              </div>
              <p className={`text-lg font-bold font-['Oswald'] leading-none ${t.color}`}>{t.value}</p>
              <p className="text-[9px] text-muted-foreground mt-1">{t.sub}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <MacroDonutChart plan={plan} />
        <TDEEBarChart plan={plan} />
      </div>

      {/* Meal Timing */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="stat-card"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Utensils className="h-4 w-4 text-primary" />
          </div>
          <h3 className="text-sm font-bold uppercase tracking-wider font-['Oswald']">Recommended Meal Timing</h3>
        </div>
        <div className="space-y-2">
          {plan.mealTiming.map((meal, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * i }}
              className="rounded-xl bg-gradient-to-r from-secondary/30 to-secondary/10 border border-border/40 p-3.5 hover:border-primary/30 transition-colors"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-bold text-foreground font-['Oswald'] tracking-wider">{meal.meal}</span>
                <span className="text-[10px] text-muted-foreground flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary/40 border border-border/30">
                  <Clock className="h-3 w-3" /> {meal.timing}
                </span>
              </div>
              <div className="flex flex-wrap gap-2 text-[10px] mb-1">
                <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary font-semibold">{meal.calories} kcal</span>
                <span className="px-2 py-0.5 rounded-md bg-red-500/10 text-red-400 font-semibold">P {meal.protein}g</span>
                <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 font-semibold">C {meal.carbs}g</span>
                <span className="px-2 py-0.5 rounded-md bg-yellow-500/10 text-yellow-400 font-semibold">F {meal.fat}g</span>
              </div>
              <p className="text-[10px] text-muted-foreground italic">{meal.notes}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <SampleMealPlan plan={plan} inputs={inputs} />

      {/* Calculation Details */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="stat-card"
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Calculator className="h-4 w-4 text-primary" />
          </div>
          <h3 className="text-sm font-bold uppercase tracking-wider font-['Oswald']">Calculation Details</h3>
        </div>
        <div className="grid sm:grid-cols-2 gap-2 text-xs">
          {[
            { label: <><GlossaryTooltip term="BMR">BMR</GlossaryTooltip> (Mifflin + Katch avg)</>, value: `${plan.bmr} kcal` },
            { label: <><GlossaryTooltip term="TDEE">TDEE</GlossaryTooltip> (maintenance)</>, value: `${plan.tdee} kcal` },
            { label: 'Thermic Effect of Food', value: `~${plan.tef} kcal` },
            { label: <><GlossaryTooltip term="NEAT">NEAT</GlossaryTooltip> estimate</>, value: `~${plan.neat} kcal` },
            { label: <><GlossaryTooltip term="Lean Body Mass">Lean Body Mass</GlossaryTooltip></>, value: `${plan.leanBodyMass} kg` },
            { label: 'Protein per kg LBM', value: `${plan.proteinPerKgLBM} g/kg`, highlight: true },
          ].map((row, i) => (
            <div key={i} className="flex justify-between items-center px-3 py-2 rounded-lg bg-secondary/20 border border-border/30">
              <span className="text-muted-foreground">{row.label}</span>
              <span className={`font-semibold ${row.highlight ? 'text-primary' : ''}`}>{row.value}</span>
            </div>
          ))}
          {plan.weeklyCalorieRange && (
            <div className="sm:col-span-2 flex justify-between items-center px-3 py-2 rounded-lg bg-primary/10 border border-primary/20">
              <span className="text-muted-foreground"><GlossaryTooltip term="Recomp">Recomp</GlossaryTooltip> calorie cycling</span>
              <span className="font-semibold text-primary">{plan.weeklyCalorieRange.low}–{plan.weeklyCalorieRange.high} kcal</span>
            </div>
          )}
        </div>
        <p className="text-[10px] text-muted-foreground mt-3 italic">
          Formulas: <span className="text-primary font-medium"><GlossaryTooltip term="Mifflin-St Jeor">Mifflin-St Jeor</GlossaryTooltip> + Katch-McArdle</span> · validated to ±10% in healthy adults.
        </p>
      </motion.div>
    </div>
  );
};

export default NumbersTab;
