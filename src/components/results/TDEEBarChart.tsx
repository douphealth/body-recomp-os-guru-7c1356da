import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import type { PlanResults } from '@/lib/calculations';

const TDEEBarChart = ({ plan }: { plan: PlanResults }) => {
  const data = [
    { name: 'TDEE', value: plan.tdee, fill: 'hsl(220, 15%, 35%)' },
    { name: 'Target', value: plan.calorieTarget, fill: 'hsl(0, 85%, 55%)' },
  ];

  return (
    <div className="stat-card">
      <h3 className="text-sm font-bold uppercase tracking-wider mb-4 font-['Oswald']">TDEE vs Target</h3>
      <div className="h-[160px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barSize={40}>
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(220, 10%, 55%)' }} />
            <YAxis hide domain={[0, 'auto']} />
            <Bar dataKey="value" radius={[6, 6, 0, 0]} label={{ position: 'top', fontSize: 12, fill: 'hsl(0, 0%, 90%)', fontWeight: 700 }}>
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TDEEBarChart;
