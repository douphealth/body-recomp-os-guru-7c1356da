import { motion } from 'framer-motion';
import { Flame, Target } from 'lucide-react';
import type { PlanResults } from '@/lib/calculations';

const AnimatedNumber = ({ value }: { value: number }) => (
  <span className="text-4xl md:text-5xl font-bold text-primary font-['Oswald'] tracking-tight">{value.toLocaleString()}</span>
);

const MacroRing = ({ label, grams, percent, color }: { label: string; grams: number; percent: number; color: string }) => {
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="flex items-center gap-3">
      <div className="relative h-[76px] w-[76px] flex-shrink-0">
        <svg viewBox="0 0 80 80" className="transform -rotate-90 h-full w-full">
          <circle cx="40" cy="40" r={radius} fill="none" stroke="hsl(var(--secondary))" strokeWidth="6" />
          <motion.circle
            cx="40" cy="40" r={radius} fill="none" stroke={color} strokeWidth="6" strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={circumference}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold font-['Oswald']">{percent}%</span>
        </div>
      </div>
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="text-lg font-bold">{grams}g</p>
      </div>
    </div>
  );
};

const CalorieMacroCards = ({ plan }: { plan: PlanResults }) => (
  <div className="grid md:grid-cols-2 gap-4 mb-6">
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="stat-card"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Flame className="h-4 w-4 text-primary" />
        </div>
        <h2 className="text-sm font-bold uppercase tracking-wider">Calorie Target</h2>
      </div>
      <AnimatedNumber value={plan.calorieTarget} />
      <p className="text-xs text-muted-foreground mt-1">calories per day</p>
      <div className="mt-4 pt-4 border-t border-border/50 space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">TDEE (maintenance)</span>
          <span className="font-medium">{plan.tdee} cal</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Lean Body Mass</span>
          <span className="font-medium">{plan.leanBodyMass} kg</span>
        </div>
        {plan.weeklyCalorieRange && (
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Recomp cycling</span>
            <span className="font-medium text-primary">{plan.weeklyCalorieRange.low}–{plan.weeklyCalorieRange.high}</span>
          </div>
        )}
      </div>
    </motion.div>

    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="stat-card"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Target className="h-4 w-4 text-primary" />
        </div>
        <h2 className="text-sm font-bold uppercase tracking-wider">Macro Split</h2>
      </div>
      <div className="space-y-4">
        <MacroRing label="Protein" grams={plan.proteinGrams} percent={plan.proteinPercent} color="hsl(0, 85%, 55%)" />
        <MacroRing label="Carbs" grams={plan.carbGrams} percent={plan.carbPercent} color="hsl(25, 90%, 50%)" />
        <MacroRing label="Fat" grams={plan.fatGrams} percent={plan.fatPercent} color="hsl(45, 90%, 50%)" />
      </div>
    </motion.div>
  </div>
);

export default CalorieMacroCards;
