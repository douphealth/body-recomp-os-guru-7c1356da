import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Progress } from '@/components/ui/progress';
import AnimatedNumber from '@/components/AnimatedNumber';
import type { PlanResults } from '@/lib/calculations';

const COLORS = {
  protein: '#ef4444',
  carbs: '#3b82f6',
  fat: '#eab308',
};

const MacroDonutChart = ({ plan }: { plan: PlanResults }) => {
  const data = [
    { name: 'Protein', value: plan.proteinPercent, grams: plan.proteinGrams, color: COLORS.protein },
    { name: 'Carbs', value: plan.carbPercent, grams: plan.carbGrams, color: COLORS.carbs },
    { name: 'Fat', value: plan.fatPercent, grams: plan.fatGrams, color: COLORS.fat },
  ];

  return (
    <div className="stat-card">
      <h3 className="text-sm font-bold uppercase tracking-wider mb-4 font-['Oswald']">Macro Breakdown</h3>
      <div className="flex items-center gap-6">
        <div className="relative w-[140px] h-[140px] flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={65}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <AnimatedNumber value={plan.calorieTarget} className="text-lg font-bold font-['Oswald'] text-foreground" />
            <span className="text-[10px] text-muted-foreground">kcal</span>
          </div>
        </div>

        <div className="flex-1 space-y-3">
          {data.map((macro) => (
            <div key={macro.name}>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium" style={{ color: macro.color }}>{macro.name}</span>
                <span className="text-muted-foreground">{macro.grams}g • {macro.value}%</span>
              </div>
              <div className="h-2 rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{ width: `${macro.value}%`, backgroundColor: macro.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MacroDonutChart;
