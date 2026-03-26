import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AnimatedNumber from '@/components/AnimatedNumber';
import { calculatePlan, type UserInputs, type PlanResults } from '@/lib/calculations';

interface ComparePlansProps {
  currentGoal: string;
  inputs: UserInputs;
}

const goalOptions = [
  { key: 'fat-loss' as const, label: 'Fat Loss', emoji: '🔥', desc: 'Aggressive calorie deficit with high protein to preserve muscle' },
  { key: 'lean-muscle' as const, label: 'Lean Muscle', emoji: '💪', desc: 'Calorie surplus optimized for muscle growth with minimal fat gain' },
  { key: 'recomp' as const, label: 'Recomp', emoji: '⚡', desc: 'Maintenance calories with cycling to lose fat and build muscle' },
];

const ComparePlans = ({ currentGoal, inputs }: ComparePlansProps) => {
  const navigate = useNavigate();
  const alternatives = goalOptions.filter(g => g.key !== currentGoal);

  const handleSwitch = (goal: typeof goalOptions[number]['key']) => {
    const newInputs = { ...inputs, goal };
    sessionStorage.setItem('recomp-inputs', JSON.stringify(newInputs));
    navigate('/app/body-recomp/results');
    window.location.reload();
  };

  return (
    <div className="mt-8">
      <h3 className="text-sm font-bold uppercase tracking-wider font-['Oswald'] mb-1">What If You Changed Your Goal?</h3>
      <p className="text-xs text-muted-foreground mb-4">See how your plan would look with a different objective.</p>
      <div className="grid sm:grid-cols-2 gap-3">
        {alternatives.map(alt => {
          const altPlan = calculatePlan({ ...inputs, goal: alt.key });
          return (
            <div key={alt.key} className="stat-card group cursor-pointer hover:border-primary/30 transition-all" onClick={() => handleSwitch(alt.key)}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{alt.emoji}</span>
                <h4 className="text-sm font-bold font-['Oswald'] tracking-wider">{alt.label.toUpperCase()}</h4>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center mb-3">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Calories</p>
                  <p className="text-lg font-bold font-['Oswald'] text-primary">{altPlan.calorieTarget}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Protein</p>
                  <p className="text-lg font-bold font-['Oswald']">{altPlan.proteinGrams}g</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Training</p>
                  <p className="text-lg font-bold font-['Oswald']">{inputs.workoutFrequency}d/wk</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-3">{alt.desc}</p>
              <Button variant="outline" size="sm" className="w-full gap-2 border-border/50 group-hover:border-primary/40 group-hover:text-primary transition-all">
                See This Plan <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ComparePlans;
