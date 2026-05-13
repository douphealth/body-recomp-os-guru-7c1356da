import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FlaskConical, Flame, ChevronDown, Layers, Target, Clock, Zap, CheckCircle2 } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import WeeklyCalendarView from '@/components/results/WeeklyCalendarView';
import StreakCard from '@/components/results/StreakCard';
import { useDailyStreak } from '@/hooks/useDailyStreak';
import type { PlanResults } from '@/lib/calculations';

interface Props {
  plan: PlanResults;
}

const phasePalette = [
  { ring: 'ring-emerald-500/40', bg: 'bg-emerald-500/10', text: 'text-emerald-400', bar: 'from-emerald-500 to-emerald-400' },
  { ring: 'ring-sky-500/40', bg: 'bg-sky-500/10', text: 'text-sky-400', bar: 'from-sky-500 to-sky-400' },
  { ring: 'ring-primary/50', bg: 'bg-primary/10', text: 'text-primary', bar: 'from-primary to-orange-400' },
  { ring: 'ring-amber-500/40', bg: 'bg-amber-500/10', text: 'text-amber-400', bar: 'from-amber-500 to-amber-400' },
];

const TrainingTab = ({ plan }: Props) => {
  const [activeWeek, setActiveWeek] = useState(0);

  // Group weeks into 4 two-week phases
  const phases = [0, 1, 2, 3].map((i) => {
    const a = plan.trainingPlan[i * 2];
    const b = plan.trainingPlan[i * 2 + 1];
    return {
      label: a?.phase || `Phase ${i + 1}`,
      weekRange: `Wk ${i * 2 + 1}-${i * 2 + 2}`,
      deload: !!a?.deload || !!b?.deload,
      ...phasePalette[i],
    };
  });

  return (
    <div className="space-y-4">
      {/* 8-Week Phase Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-5 md:p-6 card-glow"
      >
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-8 w-8 rounded-xl bg-primary/15 flex items-center justify-center">
              <Layers className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Periodization</p>
              <h3 className="text-base font-bold font-['Oswald'] tracking-wider">8-Week Phase Timeline</h3>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-4 gap-2">
            {phases.map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i }}
                className={`relative rounded-xl border border-border/40 ${p.bg} p-2.5 backdrop-blur`}
              >
                <p className={`text-[9px] font-bold uppercase tracking-wider ${p.text}`}>{p.weekRange}</p>
                <p className="text-[10px] font-semibold text-foreground leading-tight mt-0.5 line-clamp-2">{p.label}</p>
                {p.deload && (
                  <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[8px] font-bold bg-amber-500/15 text-amber-400 uppercase tracking-wider">Deload</span>
                )}
                <div className="mt-2 h-1 rounded-full bg-secondary/40 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 0.6, delay: 0.2 + i * 0.1 }}
                    className={`h-full bg-gradient-to-r ${p.bar} rounded-full`}
                  />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Connecting line */}
          <div className="hidden md:flex items-center gap-2 mt-4 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><Target className="h-3 w-3 text-emerald-400" /> Adapt</span>
            <span className="flex-1 h-px bg-gradient-to-r from-emerald-500/30 via-primary/30 to-amber-500/30" />
            <span className="flex items-center gap-1"><Zap className="h-3 w-3 text-sky-400" /> Build</span>
            <span className="flex-1 h-px bg-gradient-to-r from-primary/30 to-amber-500/30" />
            <span className="flex items-center gap-1"><Flame className="h-3 w-3 text-primary" /> Peak</span>
            <span className="flex-1 h-px bg-amber-500/30" />
            <span className="flex items-center gap-1"><Clock className="h-3 w-3 text-amber-400" /> Recover</span>
          </div>
        </div>
      </motion.div>

      {/* RPE Guide */}
      <div className="rounded-xl bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20 p-4">
        <div className="flex items-center gap-2 mb-3">
          <FlaskConical className="h-4 w-4 text-emerald-400" />
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">RPE Guide — Rate of Perceived Exertion</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px]">
          {[
            { rpe: '6-7', desc: 'Could do 3-4 more reps', color: 'text-emerald-400 bg-emerald-500/10' },
            { rpe: '7-8', desc: 'Could do 2-3 more reps', color: 'text-sky-400 bg-sky-500/10' },
            { rpe: '8-9', desc: 'Could do 1-2 more reps', color: 'text-amber-400 bg-amber-500/10' },
            { rpe: '10', desc: 'Absolute failure', color: 'text-primary bg-primary/10' },
          ].map((r) => (
            <div key={r.rpe} className={`rounded-lg p-2 text-center border border-border/30 ${r.color.split(' ')[1]}`}>
              <span className={`font-bold text-xs ${r.color.split(' ')[0]}`}>RPE {r.rpe}</span>
              <p className="text-muted-foreground mt-0.5 leading-tight">{r.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Week selector chips */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-thin">
        {plan.trainingPlan.map((w, i) => {
          const phaseIdx = Math.floor(i / 2);
          const p = phasePalette[phaseIdx] ?? phasePalette[0];
          const active = activeWeek === i;
          return (
            <button
              key={i}
              onClick={() => setActiveWeek(i)}
              className={`flex-shrink-0 px-3 py-2 rounded-xl border text-[11px] font-bold transition-all ${
                active
                  ? `${p.bg} ${p.text} ring-2 ${p.ring} border-transparent`
                  : 'bg-secondary/20 border-border/40 text-muted-foreground hover:text-foreground hover:border-primary/30'
              }`}
            >
              <div className="font-['Oswald'] tracking-wider">WK {i + 1}</div>
              {w.deload && <div className="text-[8px] uppercase opacity-70">Deload</div>}
            </button>
          );
        })}
      </div>

      {/* Active week preview */}
      {plan.trainingPlan[activeWeek] && (
        <WeeklyCalendarView trainingDays={plan.trainingPlan[activeWeek].days} />
      )}

      {/* Per-week accordion */}
      <Accordion type="single" collapsible value={`week-${activeWeek}`} onValueChange={(v) => v && setActiveWeek(parseInt(v.split('-')[1]))} className="space-y-2">
        {plan.trainingPlan.map((week, wi) => {
          const phaseIdx = Math.floor(wi / 2);
          const p = phasePalette[phaseIdx] ?? phasePalette[0];
          return (
            <AccordionItem key={wi} value={`week-${wi}`} className="stat-card !p-0 overflow-hidden border-border data-[state=open]:border-primary/30">
              <AccordionTrigger className="px-4 py-3.5 hover:no-underline group">
                <div className="flex items-center gap-3 w-full">
                  <div className={`h-9 w-9 rounded-xl ${p.bg} ${p.text} flex items-center justify-center text-sm font-bold font-['Oswald'] flex-shrink-0`}>
                    {wi + 1}
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold font-['Oswald'] tracking-wider">{week.weekRange}</span>
                      {week.deload && <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 font-bold uppercase tracking-wider">Deload</span>}
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate">{week.phase}</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180 flex-shrink-0" />
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                {(week.intensityGuideline || week.volumeChange) && (
                  <div className={`mb-3 px-3 py-2.5 rounded-xl ${p.bg} border border-border/40 text-xs`}>
                    {week.intensityGuideline && (
                      <p className="text-muted-foreground"><span className={`font-bold ${p.text}`}>Intensity:</span> {week.intensityGuideline}</p>
                    )}
                    {week.volumeChange && (
                      <p className="text-muted-foreground mt-0.5"><span className={`font-bold ${p.text}`}>Volume:</span> {week.volumeChange}</p>
                    )}
                  </div>
                )}
                <div className="space-y-3">
                  {week.days.map((day) => (
                    <div key={day.day} className="rounded-xl bg-gradient-to-br from-secondary/30 to-secondary/10 border border-border/40 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className={`h-6 w-6 rounded-md ${p.bg} ${p.text} flex items-center justify-center text-[10px] font-bold`}>
                          {day.day.slice(0, 3).toUpperCase()}
                        </div>
                        <p className="text-sm font-bold text-foreground font-['Oswald'] tracking-wider">{day.focus}</p>
                      </div>
                      <div className="space-y-1.5">
                        {day.exercises.map((ex, j) => (
                          <div key={j} className="flex justify-between items-start gap-3 text-xs px-3 py-2 rounded-lg bg-card/40 border border-border/30 hover:border-primary/20 transition-colors">
                            <div className="flex-1 min-w-0">
                              <p className="text-foreground font-medium leading-snug">{ex.name}</p>
                              {ex.notes && <p className="text-[10px] text-muted-foreground/70 italic mt-0.5">{ex.notes}</p>}
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                              <span className="font-mono text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">{ex.sets}×{ex.reps}</span>
                              {ex.rpe && <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 font-bold border border-red-500/20">RPE {ex.rpe}</span>}
                              {ex.rest && <span className="text-[9px] text-muted-foreground bg-secondary/40 px-1.5 py-0.5 rounded border border-border/30">{ex.rest}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
};

export default TrainingTab;
