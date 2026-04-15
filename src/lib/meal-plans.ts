/**
 * Single source of truth for sample meal plan data.
 * Used by both the SampleMealPlan UI component and the PDF generator.
 */
import type { UserInputs } from './calculations';

export interface MealItem {
  name: string;
  portion: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface MealBlock {
  meal: string;
  emoji: string;
  items: MealItem[];
}

export function getSampleMeals(inputs: UserInputs): MealBlock[] {
  const { dietStyle } = inputs;

  if (dietStyle === 'keto') {
    return [
      {
        meal: 'Breakfast', emoji: '🍳',
        items: [
          { name: 'Scrambled Eggs (3 whole)', portion: '180g', calories: 270, protein: 21, carbs: 2, fat: 20 },
          { name: 'Avocado (1/2)', portion: '75g', calories: 120, protein: 1, carbs: 6, fat: 11 },
          { name: 'Bacon (2 strips)', portion: '30g', calories: 90, protein: 6, carbs: 0, fat: 7 },
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
