import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dumbbell, ChevronDown } from 'lucide-react';
import type { TrainingWeek } from '@/lib/calculations';

const TrainingPlan = ({ trainingPlan }: { trainingPlan: TrainingWeek[] }) => {
  const [expandedWeek, setExpandedWeek] = useState<number>(0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="stat-card !p-0 overflow-hidden mb-4"
    >
      <div className="p-5 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Dumbbell className="h-4 w-4 text-primary" />
          </div>
          <h2 className="text-sm font-bold uppercase tracking-wider">8-Week Training Plan</h2>
        </div>
      </div>

      <div className="divide-y divide-border/30">
        {trainingPlan.map((week, i) => (
          <div key={i}>
            <button
              className="w-full flex items-center justify-between p-4 hover:bg-secondary/20 transition-colors text-left group"
              onClick={() => setExpandedWeek(expandedWeek === i ? -1 : i)}
            >
              <div className="flex items-center gap-3">
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                  week.deload ? 'bg-amber-500/10 text-amber-400' : 'bg-primary/10 text-primary'
                }`}>
                  {i + 1}
                </div>
                <div>
                  <span className="text-sm font-bold">{week.weekRange}</span>
                  <span className="text-xs text-muted-foreground ml-2">— {week.phase}</span>
                  {week.deload && <span className="ml-2 text-[10px] px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 font-semibold">DELOAD</span>}
                </div>
              </div>
              <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${expandedWeek === i ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {expandedWeek === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 space-y-3">
                    {week.days.map((day) => (
                      <div key={day.day} className="rounded-xl bg-secondary/20 border border-border/30 p-4">
                        <p className="text-sm font-bold text-primary mb-3">{day.day} — {day.focus}</p>
                        <div className="space-y-2">
                          {day.exercises.map((ex, j) => (
                            <div key={j} className="flex justify-between items-center text-xs group/ex">
                              <span className="text-muted-foreground group-hover/ex:text-foreground transition-colors">{ex.name}</span>
                              <span className="shrink-0 ml-2 font-mono text-primary/80 bg-primary/5 px-2 py-0.5 rounded">{ex.sets}×{ex.reps}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default TrainingPlan;
