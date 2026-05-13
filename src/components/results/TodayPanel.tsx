import { motion } from 'framer-motion';
import { Sun, Calendar, BookOpen, ArrowRight, Sparkles, Dumbbell, Coffee } from 'lucide-react';
import type { PlanResults, UserInputs } from '@/lib/calculations';
import { trackInternalLinkClick } from '@/lib/tracking';

interface Props {
  plan: PlanResults;
  inputs: UserInputs;
  contextLinks: { url: string; title: string; description: string }[];
}

/**
 * "Today / This Week / Next best article" — the user's daily compass.
 * Computes today's session from the plan, current week phase, and
 * surfaces the most relevant article from contextual links.
 */
const TodayPanel = ({ plan, inputs, contextLinks }: Props) => {
  // Day-of-week index (Mon=0..Sun=6)
  const jsDow = new Date().getDay();
  const dowIndex = (jsDow + 6) % 7;
  const week0 = plan.trainingPlan[0];
  const todayDay = week0?.days[dowIndex];

  // Current "week" purely cosmetic: weekly cycle from a baseline (always Wk 1 on first visit)
  const currentWeek = plan.trainingPlan[0];

  // Pick a "next best" article — first contextual link by default
  const nextRead = contextLinks[0];

  const nowLabel = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6"
    >
      {/* TODAY */}
      <div className="relative overflow-hidden rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent p-4 card-glow">
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-primary/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative">
          <div className="flex items-center gap-1.5 mb-2">
            <Sun className="h-3.5 w-3.5 text-primary" />
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Today · {nowLabel}</span>
          </div>
          {todayDay ? (
            <>
              <div className="flex items-center gap-2 mb-1">
                <Dumbbell className="h-4 w-4 text-primary" />
                <p className="text-sm font-bold font-['Oswald'] tracking-wider leading-tight">{todayDay.focus}</p>
              </div>
              <p className="text-[11px] text-muted-foreground">
                {todayDay.exercises.length} exercises · ~{Math.max(35, todayDay.exercises.length * 8)} min
              </p>
              <div className="mt-2 flex flex-wrap gap-1">
                {todayDay.exercises.slice(0, 3).map((ex, i) => (
                  <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 font-medium">
                    {ex.name.split(' ').slice(0, 2).join(' ')}
                  </span>
                ))}
                {todayDay.exercises.length > 3 && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-secondary/40 text-muted-foreground border border-border/30">
                    +{todayDay.exercises.length - 3}
                  </span>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-1">
                <Coffee className="h-4 w-4 text-amber-400" />
                <p className="text-sm font-bold font-['Oswald'] tracking-wider leading-tight">Active Recovery</p>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Walk {inputs.stepCount.toLocaleString()} steps · hydrate {plan.waterLiters}L · sleep 7-9h.
              </p>
            </>
          )}
        </div>
      </div>

      {/* THIS WEEK */}
      <div className="relative overflow-hidden rounded-2xl border border-border/40 bg-gradient-to-br from-sky-500/10 to-transparent p-4">
        <div className="relative">
          <div className="flex items-center gap-1.5 mb-2">
            <Calendar className="h-3.5 w-3.5 text-sky-400" />
            <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest">This Week · Wk 1</span>
          </div>
          <p className="text-sm font-bold font-['Oswald'] tracking-wider leading-tight mb-1">{currentWeek?.phase ?? 'Foundation'}</p>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            {inputs.workoutFrequency} sessions · {plan.cardioPlan.sessionsPerWeek}× cardio · {plan.calorieTarget} kcal/day
          </p>
          {currentWeek?.intensityGuideline && (
            <p className="text-[10px] text-muted-foreground/80 italic mt-1.5 line-clamp-2">{currentWeek.intensityGuideline}</p>
          )}
        </div>
      </div>

      {/* NEXT BEST READ */}
      {nextRead && (
        <a
          href={nextRead.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackInternalLinkClick(nextRead.url, 'today_panel_read')}
          className="relative overflow-hidden rounded-2xl border border-border/40 bg-gradient-to-br from-emerald-500/10 to-transparent p-4 group hover:border-emerald-500/40 transition-all"
        >
          <div className="relative">
            <div className="flex items-center gap-1.5 mb-2">
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Next Best Read</span>
            </div>
            <div className="flex items-start gap-2">
              <BookOpen className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold font-['Oswald'] tracking-wider leading-tight group-hover:text-emerald-400 transition-colors line-clamp-2">{nextRead.title}</p>
                <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed line-clamp-2">{nextRead.description}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
            </div>
          </div>
        </a>
      )}
    </motion.div>
  );
};

export default TodayPanel;
