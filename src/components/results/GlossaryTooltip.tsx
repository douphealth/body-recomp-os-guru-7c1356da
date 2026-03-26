import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const glossary: Record<string, string> = {
  'TDEE': 'Total Daily Energy Expenditure — the total calories you burn in a day including exercise and daily activity.',
  'BMR': 'Basal Metabolic Rate — the calories your body burns at complete rest just to stay alive.',
  'Mifflin-St Jeor': 'A scientifically validated equation for estimating metabolic rate, considered the gold standard since 1990.',
  'Recomp': 'Body recomposition — losing fat and gaining muscle simultaneously by cycling calories around maintenance.',
  'Progressive Overload': 'Gradually increasing weight, reps, or volume over time to continuously challenge muscles and drive growth.',
  'Lean Body Mass': 'Your total body weight minus fat mass — includes muscle, bone, organs, and water.',
  'Calorie Deficit': 'Eating fewer calories than your TDEE, forcing your body to use stored fat for energy.',
  'Calorie Surplus': 'Eating more calories than your TDEE to provide energy for muscle growth.',
  'Macros': 'Macronutrients — protein, carbohydrates, and fat — the three main nutrients that provide calories.',
  'Deload': 'A planned week of reduced training intensity to allow recovery and prevent overtraining.',
};

interface GlossaryTooltipProps {
  term: string;
  children?: React.ReactNode;
}

const GlossaryTooltip = ({ term, children }: GlossaryTooltipProps) => {
  const definition = glossary[term];
  if (!definition) return <>{children || term}</>;

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="border-b border-dotted border-muted-foreground/50 cursor-help hover:border-primary hover:text-primary transition-colors">
            {children || term}
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs text-xs leading-relaxed">
          <p><span className="font-semibold text-primary">{term}:</span> {definition}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export { glossary };
export default GlossaryTooltip;
