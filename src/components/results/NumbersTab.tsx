import { motion } from 'framer-motion';
import { Droplets, Leaf, Dumbbell, Activity as ActivityIcon, Utensils, Clock } from 'lucide-react';
import AnimatedNumber from '@/components/AnimatedNumber';
import GlossaryTooltip from '@/components/results/GlossaryTooltip';
import MacroDonutChart from '@/components/results/MacroDonutChart';
import TDEEBarChart from '@/components/results/TDEEBarChart';
import SampleMealPlan from '@/components/results/SampleMealPlan';
import type { PlanResults, UserInputs } from '@/lib/calculations';

interface Props {
  plan: PlanResults;
  inputs: UserInputs;
}

const NumbersTab = ({ plan, inputs }: Props) => (
  <div className="space-y-4">
    {/* Big calorie hero */}
    <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent p-6 md:p-8 card-glow">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">Daily Calorie Target</p>
          <div className="flex items-baseline gap-2">
            <AnimatedNumber value={plan.calorieTarget} className="text-5xl md:text-6xl font-bold text-primary font-['Oswald'] tracking-tight" />
            <span className="text-lg text-muted-foreground font-['Oswald']">kcal</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {plan.deficitOrSurplus < 0 ? `${Math.abs(plan.deficitOrSurplus)} kcal deficit` : plan.deficitOrSurplus > 0 ? `${plan.deficitOrSurplus} kcal surplus` : 'Calorie cycling around maintenance'}
          </p>
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          {[
            { label: 'Protein', value: plan.proteinGrams, unit: 'g', color: 'text-red-400', sub: `${plan.proteinPerKgLBM}g/kg` },
            { label: 'Carbs', value: plan.carbGrams, unit: 'g', color: 'text-blue-400' },
            { label: 'Fat', value: plan.fatGrams, unit: 'g', color: 'text-yellow-400' },
          ].map(m => (
            <div key={m.label} className="stat-card !p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{m.label}</p>
              <AnimatedNumber value={m.value} suffix={m.unit} className={`text-2xl font-bold font-['Oswald'] ${m.color}`} />
              {m.sub && <p className="text-[9px] text-muted-foreground">{m.sub}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Additional targets */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {[
        { icon: Droplets, label: 'Water', value: `${plan.waterLiters}L`, sub: 'daily target' },
        { icon: Leaf, label: 'Fiber', value: `${plan.fiberGrams}g`, sub: 'daily target' },
        { icon: Dumbbell, label: 'Training', value: `${inputs.workoutFrequency}x`, sub: 'per week' },
        { icon: ActivityIcon, label: 'Steps', value: inputs.stepCount.toLocaleString(), sub: 'daily goal' },
      ].map(t => (
        <motion.div key={t.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="stat-card !p-3 flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <t.icon className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-xs font-bold">{t.value}</p>
            <p className="text-[10px] text-muted-foreground">{t.sub}</p>
          </div>
        </motion.div>
      ))}
    </div>

    <div className="grid md:grid-cols-2 gap-4">
      <MacroDonutChart plan={plan} />
      <TDEEBarChart plan={plan} />
    </div>

    {/* Meal Timing */}
    <div className="stat-card">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Utensils className="h-4 w-4 text-primary" />
        </div>
        <h3 className="text-sm font-bold uppercase tracking-wider font-['Oswald']">Recommended Meal Timing</h3>
      </div>
      <div className="space-y-2">
        {plan.mealTiming.map((meal, i) => (
          <div key={i} className="rounded-xl bg-secondary/20 border border-border/30 p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-bold text-primary">{meal.meal}</span>
              <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> {meal.timing}</span>
            </div>
            <div className="flex gap-4 text-xs text-muted-foreground">
              <span>{meal.calories} kcal</span>
              <span className="text-red-400">P: {meal.protein}g</span>
              <span className="text-blue-400">C: {meal.carbs}g</span>
              <span className="text-yellow-400">F: {meal.fat}g</span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1 italic">{meal.notes}</p>
          </div>
        ))}
      </div>
    </div>

    <SampleMealPlan plan={plan} inputs={inputs} />

    {/* Details */}
    <div className="stat-card">
      <h3 className="text-sm font-bold uppercase tracking-wider mb-3 font-['Oswald']">Calculation Details</h3>
      <div className="space-y-2 text-xs">
        <div className="flex justify-between"><span className="text-muted-foreground"><GlossaryTooltip term="BMR">BMR</GlossaryTooltip> (Mifflin + Katch avg)</span><span className="font-medium">{plan.bmr} kcal</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground"><GlossaryTooltip term="TDEE">TDEE</GlossaryTooltip> (maintenance)</span><span className="font-medium">{plan.tdee} kcal</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Thermic Effect of Food</span><span className="font-medium">~{plan.tef} kcal</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground"><GlossaryTooltip term="NEAT">NEAT</GlossaryTooltip> estimate</span><span className="font-medium">~{plan.neat} kcal</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground"><GlossaryTooltip term="Lean Body Mass">Lean Body Mass</GlossaryTooltip></span><span className="font-medium">{plan.leanBodyMass} kg</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Protein per kg LBM</span><span className="font-medium text-primary">{plan.proteinPerKgLBM}g/kg</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Formulas</span><span className="font-medium text-primary"><GlossaryTooltip term="Mifflin-St Jeor">Mifflin-St Jeor</GlossaryTooltip> + Katch-McArdle</span></div>
        {plan.weeklyCalorieRange && (
          <div className="flex justify-between"><span className="text-muted-foreground"><GlossaryTooltip term="Recomp">Recomp</GlossaryTooltip> cycling range</span><span className="font-medium text-primary">{plan.weeklyCalorieRange.low}–{plan.weeklyCalorieRange.high}</span></div>
        )}
      </div>
    </div>
  </div>
);

export default NumbersTab;
