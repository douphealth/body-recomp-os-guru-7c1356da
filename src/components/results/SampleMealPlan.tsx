import { motion } from 'framer-motion';
import { Utensils } from 'lucide-react';
import type { PlanResults, UserInputs } from '@/lib/calculations';
import { getSampleMeals } from '@/lib/meal-plans';

const SampleMealPlan = ({ plan, inputs }: { plan: PlanResults; inputs: UserInputs }) => {
  const meals = getSampleMeals(inputs);

  const totalFromMeals = meals.reduce((acc, meal) => {
    const mealTotals = meal.items.reduce((a, item) => ({
      calories: a.calories + item.calories,
      protein: a.protein + item.protein,
      carbs: a.carbs + item.carbs,
      fat: a.fat + item.fat,
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
    return {
      calories: acc.calories + mealTotals.calories,
      protein: acc.protein + mealTotals.protein,
      carbs: acc.carbs + mealTotals.carbs,
      fat: acc.fat + mealTotals.fat,
    };
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

  const dietLabel = inputs.dietStyle === 'keto' ? 'Ketogenic' : inputs.dietStyle === 'high-protein' ? 'High-Protein' : inputs.dietStyle === 'vegetarian' ? 'Vegetarian' : 'Standard Balanced';

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="stat-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Utensils className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider font-['Oswald']">Sample Day — {dietLabel} Meal Plan</h3>
            <p className="text-[10px] text-muted-foreground">Adjust portions to hit your exact targets</p>
          </div>
        </div>
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-4 gap-2 mb-4 text-center">
        {[
          { label: 'Calories', value: `~${totalFromMeals.calories}`, target: `${plan.calorieTarget}`, color: 'text-foreground' },
          { label: 'Protein', value: `${totalFromMeals.protein}g`, target: `${plan.proteinGrams}g`, color: 'text-red-400' },
          { label: 'Carbs', value: `${totalFromMeals.carbs}g`, target: `${plan.carbGrams}g`, color: 'text-blue-400' },
          { label: 'Fat', value: `${totalFromMeals.fat}g`, target: `${plan.fatGrams}g`, color: 'text-yellow-400' },
        ].map(s => (
          <div key={s.label} className="rounded-lg bg-secondary/30 border border-border/30 p-2">
            <p className="text-[9px] text-muted-foreground uppercase">{s.label}</p>
            <p className={`text-xs font-bold ${s.color}`}>{s.value}</p>
            <p className="text-[9px] text-muted-foreground">target: {s.target}</p>
          </div>
        ))}
      </div>

      {/* Meals */}
      <div className="space-y-3">
        {meals.map((meal, i) => {
          const mealTotal = meal.items.reduce((a, item) => ({
            calories: a.calories + item.calories,
            protein: a.protein + item.protein,
            carbs: a.carbs + item.carbs,
            fat: a.fat + item.fat,
          }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

          return (
            <div key={i} className="rounded-xl bg-secondary/20 border border-border/30 p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-primary flex items-center gap-1.5">
                  <span>{meal.emoji}</span> {meal.meal}
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">{mealTotal.calories} kcal</span>
              </div>
              <div className="space-y-1.5">
                {meal.items.map((item, j) => (
                  <div key={j} className="flex items-center justify-between text-xs">
                    <div className="flex-1">
                      <span className="text-foreground/90">{item.name}</span>
                      <span className="text-muted-foreground/60 ml-1.5 text-[10px]">({item.portion})</span>
                    </div>
                    <div className="flex gap-3 text-[10px] font-mono shrink-0 ml-2">
                      <span className="text-red-400/80">P:{item.protein}</span>
                      <span className="text-blue-400/80">C:{item.carbs}</span>
                      <span className="text-yellow-400/80">F:{item.fat}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-2 pt-1.5 border-t border-border/20 flex gap-3 text-[10px] text-muted-foreground font-mono">
                <span className="text-red-400">P: {mealTotal.protein}g</span>
                <span className="text-blue-400">C: {mealTotal.carbs}g</span>
                <span className="text-yellow-400">F: {mealTotal.fat}g</span>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[10px] text-muted-foreground mt-3 italic">
        * This is a sample day. Swap foods with similar macros to suit your preferences. Portions are approximate — use a food scale for accuracy.
      </p>
    </motion.div>
  );
};

export default SampleMealPlan;
