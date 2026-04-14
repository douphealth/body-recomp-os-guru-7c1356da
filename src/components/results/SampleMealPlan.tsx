import { motion } from 'framer-motion';
import { Utensils, Apple, Beef, Egg, Salad, Coffee, Cookie, Fish } from 'lucide-react';
import type { PlanResults, UserInputs } from '@/lib/calculations';

interface MealItem {
  name: string;
  portion: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface MealBlock {
  meal: string;
  emoji: string;
  items: MealItem[];
}

function generateMealPlan(plan: PlanResults, inputs: UserInputs): MealBlock[] {
  const { dietStyle } = inputs;
  const { calorieTarget, proteinGrams, carbGrams, fatGrams } = plan;

  // Distribute across 4 meals: 25% / 30% / 25% / 20%
  const dist = [0.25, 0.30, 0.25, 0.20];

  if (dietStyle === 'keto') {
    return [
      {
        meal: 'Breakfast', emoji: '🍳',
        items: [
          { name: 'Scrambled Eggs (3 whole)', portion: '180g', calories: 270, protein: 21, carbs: 2, fat: 20 },
          { name: 'Avocado (½)', portion: '75g', calories: 120, protein: 1, carbs: 6, fat: 11 },
          { name: 'Bacon (2 strips)', portion: '30g', calories: 90, protein: 6, carbs: 0, fat: 7 },
          { name: 'Butter Coffee', portion: '250ml', calories: Math.round(dist[0] * calorieTarget) - 480 > 0 ? Math.round(dist[0] * calorieTarget) - 480 : 50, protein: 0, carbs: 0, fat: Math.round((Math.round(dist[0] * calorieTarget) - 480) / 9) },
        ],
      },
      {
        meal: 'Lunch', emoji: '🥗',
        items: [
          { name: 'Grilled Chicken Thighs', portion: '150g', calories: 260, protein: 32, carbs: 0, fat: 14 },
          { name: 'Mixed Greens w/ Olive Oil', portion: '120g + 15ml', calories: 150, protein: 2, carbs: 4, fat: 14 },
          { name: 'Cheese (Cheddar)', portion: '40g', calories: 160, protein: 10, carbs: 1, fat: 13 },
          { name: 'Macadamia Nuts', portion: '20g', calories: 145, protein: 2, carbs: 2, fat: 15 },
        ],
      },
      {
        meal: 'Dinner', emoji: '🥩',
        items: [
          { name: 'Salmon Fillet', portion: '170g', calories: 340, protein: 38, carbs: 0, fat: 20 },
          { name: 'Roasted Broccoli w/ Butter', portion: '150g', calories: 100, protein: 4, carbs: 7, fat: 7 },
          { name: 'Cauliflower Mash', portion: '120g', calories: 80, protein: 3, carbs: 5, fat: 5 },
        ],
      },
      {
        meal: 'Evening Snack', emoji: '🌙',
        items: [
          { name: 'Greek Yogurt (Full Fat)', portion: '150g', calories: 150, protein: 10, carbs: 6, fat: 10 },
          { name: 'Almond Butter', portion: '15g', calories: 95, protein: 3, carbs: 2, fat: 8 },
        ],
      },
    ];
  }

  if (dietStyle === 'vegetarian') {
    return [
      {
        meal: 'Breakfast', emoji: '🥣',
        items: [
          { name: 'Greek Yogurt (0% fat)', portion: '200g', calories: 120, protein: 20, carbs: 8, fat: 0 },
          { name: 'Overnight Oats', portion: '60g dry', calories: 230, protein: 8, carbs: 40, fat: 4 },
          { name: 'Mixed Berries', portion: '100g', calories: 50, protein: 1, carbs: 12, fat: 0 },
          { name: 'Chia Seeds', portion: '15g', calories: 75, protein: 3, carbs: 5, fat: 5 },
        ],
      },
      {
        meal: 'Lunch', emoji: '🥙',
        items: [
          { name: 'Lentil & Chickpea Bowl', portion: '200g cooked', calories: 280, protein: 18, carbs: 42, fat: 4 },
          { name: 'Quinoa', portion: '100g cooked', calories: 120, protein: 4, carbs: 21, fat: 2 },
          { name: 'Roasted Vegetables', portion: '150g', calories: 80, protein: 3, carbs: 14, fat: 2 },
          { name: 'Tahini Dressing', portion: '15ml', calories: 90, protein: 3, carbs: 3, fat: 8 },
        ],
      },
      {
        meal: 'Dinner', emoji: '🍲',
        items: [
          { name: 'Tofu Stir-fry', portion: '200g tofu', calories: 280, protein: 24, carbs: 8, fat: 16 },
          { name: 'Brown Rice', portion: '120g cooked', calories: 150, protein: 3, carbs: 32, fat: 1 },
          { name: 'Edamame', portion: '80g', calories: 100, protein: 10, carbs: 7, fat: 4 },
        ],
      },
      {
        meal: 'Evening Snack', emoji: '🌙',
        items: [
          { name: 'Cottage Cheese', portion: '150g', calories: 110, protein: 15, carbs: 5, fat: 3 },
          { name: 'Walnuts', portion: '15g', calories: 100, protein: 2, carbs: 1, fat: 10 },
          { name: 'Banana', portion: '1 medium', calories: 105, protein: 1, carbs: 27, fat: 0 },
        ],
      },
    ];
  }

  if (dietStyle === 'high-protein') {
    return [
      {
        meal: 'Breakfast', emoji: '🍳',
        items: [
          { name: 'Egg Whites (6) + 2 Whole Eggs', portion: '280g', calories: 290, protein: 38, carbs: 2, fat: 14 },
          { name: 'Turkey Bacon (3 strips)', portion: '45g', calories: 90, protein: 10, carbs: 1, fat: 5 },
          { name: 'Whole Wheat Toast', portion: '1 slice', calories: 80, protein: 4, carbs: 14, fat: 1 },
        ],
      },
      {
        meal: 'Lunch', emoji: '🍗',
        items: [
          { name: 'Grilled Chicken Breast', portion: '200g', calories: 330, protein: 62, carbs: 0, fat: 8 },
          { name: 'Sweet Potato', portion: '150g', calories: 130, protein: 2, carbs: 30, fat: 0 },
          { name: 'Steamed Broccoli', portion: '150g', calories: 50, protein: 4, carbs: 8, fat: 0 },
          { name: 'Olive Oil Drizzle', portion: '10ml', calories: 90, protein: 0, carbs: 0, fat: 10 },
        ],
      },
      {
        meal: 'Post-Workout', emoji: '💪',
        items: [
          { name: 'Whey Protein Shake', portion: '2 scoops (60g)', calories: 240, protein: 50, carbs: 6, fat: 3 },
          { name: 'Banana', portion: '1 large', calories: 120, protein: 1, carbs: 31, fat: 0 },
          { name: 'Rice Cakes (2)', portion: '18g each', calories: 70, protein: 2, carbs: 15, fat: 0 },
        ],
      },
      {
        meal: 'Dinner', emoji: '🐟',
        items: [
          { name: 'Lean Ground Turkey', portion: '180g', calories: 270, protein: 38, carbs: 0, fat: 12 },
          { name: 'Jasmine Rice', portion: '120g cooked', calories: 160, protein: 3, carbs: 36, fat: 0 },
          { name: 'Mixed Salad', portion: '100g', calories: 25, protein: 2, carbs: 4, fat: 0 },
        ],
      },
    ];
  }

  // Standard diet
  return [
    {
      meal: 'Breakfast', emoji: '☕',
      items: [
        { name: 'Oatmeal', portion: '60g dry', calories: 230, protein: 8, carbs: 40, fat: 4 },
        { name: 'Whey Protein (1 scoop)', portion: '30g', calories: 120, protein: 25, carbs: 3, fat: 1 },
        { name: 'Banana', portion: '1 medium', calories: 105, protein: 1, carbs: 27, fat: 0 },
        { name: 'Peanut Butter', portion: '15g', calories: 95, protein: 4, carbs: 3, fat: 8 },
      ],
    },
    {
      meal: 'Lunch', emoji: '🥗',
      items: [
        { name: 'Grilled Chicken Breast', portion: '150g', calories: 250, protein: 47, carbs: 0, fat: 6 },
        { name: 'Brown Rice', portion: '150g cooked', calories: 190, protein: 4, carbs: 40, fat: 2 },
        { name: 'Mixed Vegetables', portion: '150g', calories: 65, protein: 3, carbs: 12, fat: 1 },
        { name: 'Olive Oil', portion: '10ml', calories: 90, protein: 0, carbs: 0, fat: 10 },
      ],
    },
    {
      meal: 'Snack / Pre-Workout', emoji: '🍎',
      items: [
        { name: 'Greek Yogurt (0%)', portion: '200g', calories: 120, protein: 20, carbs: 8, fat: 0 },
        { name: 'Almonds', portion: '20g', calories: 120, protein: 4, carbs: 3, fat: 10 },
        { name: 'Apple', portion: '1 medium', calories: 95, protein: 0, carbs: 25, fat: 0 },
      ],
    },
    {
      meal: 'Dinner', emoji: '🍽️',
      items: [
        { name: 'Salmon Fillet', portion: '150g', calories: 300, protein: 34, carbs: 0, fat: 18 },
        { name: 'Roasted Potatoes', portion: '150g', calories: 130, protein: 3, carbs: 28, fat: 1 },
        { name: 'Steamed Asparagus', portion: '120g', calories: 25, protein: 3, carbs: 4, fat: 0 },
        { name: 'Lemon-Herb Dressing', portion: '15ml', calories: 45, protein: 0, carbs: 1, fat: 5 },
      ],
    },
  ];
}

const SampleMealPlan = ({ plan, inputs }: { plan: PlanResults; inputs: UserInputs }) => {
  const meals = generateMealPlan(plan, inputs);

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
