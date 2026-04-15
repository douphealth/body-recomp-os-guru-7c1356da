import { Activity as ActivityIcon, Heart } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import ProgressPhotos from '@/components/results/ProgressPhotos';
import type { PlanResults } from '@/lib/calculations';

interface Props {
  plan: PlanResults;
  checkedHabits: Set<number>;
  toggleHabit: (i: number) => void;
}

const RecoveryTab = ({ plan, checkedHabits, toggleHabit }: Props) => (
  <div className="space-y-4">
    {/* Cardio */}
    <div className="stat-card">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <ActivityIcon className="h-4 w-4 text-primary" />
        </div>
        <h3 className="text-sm font-bold uppercase tracking-wider font-['Oswald']">Cardio Plan</h3>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between"><span className="text-muted-foreground">Type</span><span className="font-medium">{plan.cardioPlan.type}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Sessions/week</span><span className="font-medium text-primary">{plan.cardioPlan.sessionsPerWeek}x</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Duration</span><span className="font-medium">{plan.cardioPlan.duration}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Intensity</span><span className="font-medium">{plan.cardioPlan.intensity}</span></div>
        {plan.cardioPlan.runningPlan && (
          <div className="mt-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
            <p className="text-xs font-semibold text-primary mb-1">Running Program</p>
            <p className="text-xs text-muted-foreground">{plan.cardioPlan.runningPlan}</p>
          </div>
        )}
      </div>
    </div>

    {/* Heart Rate Zones */}
    {plan.cardioPlan.heartRateZones && (
      <div className="stat-card">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Heart className="h-4 w-4 text-primary" />
          </div>
          <h3 className="text-sm font-bold uppercase tracking-wider font-['Oswald']">Heart Rate Zones</h3>
          <span className="text-[10px] text-muted-foreground ml-auto">Karvonen Formula</span>
        </div>
        <div className="space-y-2">
          {plan.cardioPlan.heartRateZones.map((z, i) => (
            <div key={i} className="flex items-center justify-between text-xs rounded-lg bg-secondary/20 border border-border/30 px-3 py-2">
              <span className="font-semibold text-foreground">{z.zone}</span>
              <span className="font-mono text-primary">{z.bpm}</span>
              <span className="text-muted-foreground text-[10px] max-w-[120px] text-right">{z.purpose}</span>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Recovery checklist */}
    <div className="stat-card">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Heart className="h-4 w-4 text-primary" />
        </div>
        <h3 className="text-sm font-bold uppercase tracking-wider font-['Oswald']">Recovery Checklist</h3>
      </div>
      <div className="space-y-3">
        {plan.recoveryChecklist.map((item, i) => (
          <label key={i} className="flex items-start gap-3 cursor-pointer group">
            <Checkbox
              checked={checkedHabits.has(i)}
              onCheckedChange={() => toggleHabit(i)}
              className="mt-0.5 border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
            <span className={`text-sm transition-all ${checkedHabits.has(i) ? 'text-muted-foreground line-through' : 'text-foreground group-hover:text-primary'}`}>
              {item}
            </span>
          </label>
        ))}
      </div>
    </div>

    <ProgressPhotos />
  </div>
);

export default RecoveryTab;
