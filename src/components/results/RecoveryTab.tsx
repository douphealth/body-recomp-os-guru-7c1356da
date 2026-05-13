import { motion } from 'framer-motion';
import { Activity as ActivityIcon, Heart, Moon, CheckCircle2, Footprints, Timer, Flame, Waves } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import ProgressPhotos from '@/components/results/ProgressPhotos';
import StreakCard from '@/components/results/StreakCard';
import { useDailyStreak } from '@/hooks/useDailyStreak';
import type { PlanResults } from '@/lib/calculations';

interface Props {
  plan: PlanResults;
  checkedHabits: Set<number>;
  toggleHabit: (i: number) => void;
}

const zoneColors = [
  'from-emerald-500/30 to-emerald-500/5 border-emerald-500/30 text-emerald-400',
  'from-sky-500/30 to-sky-500/5 border-sky-500/30 text-sky-400',
  'from-amber-500/30 to-amber-500/5 border-amber-500/30 text-amber-400',
  'from-orange-500/30 to-orange-500/5 border-orange-500/30 text-orange-400',
  'from-red-500/30 to-red-500/5 border-red-500/30 text-red-400',
];

const RecoveryTab = ({ plan, checkedHabits, toggleHabit }: Props) => {
  const completed = checkedHabits.size;
  const total = plan.recoveryChecklist.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const streak = useDailyStreak('recomp.recovery.streak');

  return (
    <div className="space-y-4">
      <StreakCard
        title="Recovery Streak"
        isDoneToday={streak.isDoneToday}
        toggleToday={streak.toggleToday}
        streak={streak.streak}
        totalDone={streak.totalDone}
        last7={streak.last7}
        cta="Mark today's recovery complete"
        doneCta="Recovery logged for today"
        accent="sky"
      />

      {/* Cardio Hero */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent p-5 md:p-6 card-glow"
      >
        <div className="absolute -top-12 -right-12 w-56 h-56 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-9 w-9 rounded-xl bg-primary/15 flex items-center justify-center">
              <ActivityIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Cardio Protocol</p>
              <h3 className="text-base font-bold font-['Oswald'] tracking-wider">{plan.cardioPlan.type}</h3>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-3">
            {[
              { icon: Footprints, label: 'Sessions', value: `${plan.cardioPlan.sessionsPerWeek}×`, sub: 'per week' },
              { icon: Timer, label: 'Duration', value: plan.cardioPlan.duration, sub: 'each' },
              { icon: Flame, label: 'Intensity', value: plan.cardioPlan.intensity, sub: 'effort' },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-border/40 bg-card/40 backdrop-blur p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <s.icon className="h-3 w-3 text-primary" />
                  <p className="text-[9px] uppercase tracking-wider text-muted-foreground">{s.label}</p>
                </div>
                <p className="text-sm font-bold font-['Oswald'] leading-tight">{s.value}</p>
                <p className="text-[9px] text-muted-foreground">{s.sub}</p>
              </div>
            ))}
          </div>

          {plan.cardioPlan.runningPlan && (
            <div className="rounded-xl bg-primary/5 border border-primary/15 p-3">
              <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1">Running Program</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{plan.cardioPlan.runningPlan}</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Heart Rate Zones */}
      {plan.cardioPlan.heartRateZones && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="stat-card"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Heart className="h-4 w-4 text-primary" />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-wider font-['Oswald']">Heart Rate Zones</h3>
            <span className="text-[10px] text-muted-foreground ml-auto">Karvonen</span>
          </div>
          <div className="space-y-2">
            {plan.cardioPlan.heartRateZones.map((z, i) => {
              const palette = zoneColors[i] ?? zoneColors[0];
              const widthPct = 30 + i * 14;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  className={`relative overflow-hidden rounded-xl border bg-gradient-to-r ${palette} p-3`}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${widthPct}%` }}
                    transition={{ duration: 0.8, delay: 0.2 + i * 0.05, ease: 'easeOut' }}
                    className="absolute inset-y-0 left-0 bg-current opacity-[0.06]"
                  />
                  <div className="relative flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-bold font-['Oswald'] tracking-wider">{z.zone}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{z.purpose}</p>
                    </div>
                    <span className="font-mono text-sm font-bold whitespace-nowrap">{z.bpm}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Recovery checklist with progress */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="stat-card"
      >
        <div className="flex items-center gap-2 mb-1">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Moon className="h-4 w-4 text-primary" />
          </div>
          <h3 className="text-sm font-bold uppercase tracking-wider font-['Oswald']">Daily Recovery Anchors</h3>
          <span className="ml-auto text-[10px] font-bold text-primary">{completed}/{total}</span>
        </div>
        <div className="h-1.5 rounded-full bg-secondary/40 overflow-hidden mb-4">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-primary/60"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <div className="space-y-1.5">
          {plan.recoveryChecklist.map((item, i) => {
            const checked = checkedHabits.has(i);
            return (
              <label
                key={i}
                className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition-all ${
                  checked
                    ? 'border-primary/30 bg-primary/5'
                    : 'border-border/30 bg-secondary/10 hover:border-primary/20 hover:bg-secondary/20'
                }`}
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={() => toggleHabit(i)}
                  className="mt-0.5 border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <span className={`text-sm leading-snug transition-all flex-1 ${
                  checked ? 'text-muted-foreground line-through' : 'text-foreground'
                }`}>
                  {item}
                </span>
                {checked && <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />}
              </label>
            );
          })}
        </div>
      </motion.div>

      {/* Sleep & Hydration tip strip */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 gap-3"
      >
        <div className="rounded-xl border border-border/40 bg-gradient-to-br from-indigo-500/10 to-transparent p-4">
          <Moon className="h-4 w-4 text-indigo-400 mb-2" />
          <p className="text-xs font-bold mb-0.5">Sleep is anabolic</p>
          <p className="text-[10px] text-muted-foreground leading-relaxed">7–9h nightly. Same wake time daily compounds recovery.</p>
        </div>
        <div className="rounded-xl border border-border/40 bg-gradient-to-br from-sky-500/10 to-transparent p-4">
          <Waves className="h-4 w-4 text-sky-400 mb-2" />
          <p className="text-xs font-bold mb-0.5">Hydrate first</p>
          <p className="text-[10px] text-muted-foreground leading-relaxed">{plan.waterLiters}L spread across the day. 500ml on waking.</p>
        </div>
      </motion.div>

      <ProgressPhotos />
    </div>
  );
};

export default RecoveryTab;
