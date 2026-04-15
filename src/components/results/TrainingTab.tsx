import { FlaskConical } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import WeeklyCalendarView from '@/components/results/WeeklyCalendarView';
import type { PlanResults } from '@/lib/calculations';

interface Props {
  plan: PlanResults;
}

const TrainingTab = ({ plan }: Props) => (
  <div className="space-y-4">
    {/* RPE Guide */}
    <div className="rounded-xl bg-green-500/5 border border-green-500/20 p-4">
      <div className="flex items-center gap-2 mb-2">
        <FlaskConical className="h-4 w-4 text-green-400" />
        <span className="text-xs font-bold text-green-400 uppercase tracking-wider">RPE Guide (Rate of Perceived Exertion)</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px]">
        {[
          { rpe: '6-7', desc: 'Could do 3-4 more reps' },
          { rpe: '7-8', desc: 'Could do 2-3 more reps' },
          { rpe: '8-9', desc: 'Could do 1-2 more reps' },
          { rpe: '10', desc: 'Absolute failure' },
        ].map(r => (
          <div key={r.rpe} className="bg-secondary/30 rounded-lg p-2 text-center">
            <span className="font-bold text-primary text-xs">RPE {r.rpe}</span>
            <p className="text-muted-foreground mt-0.5">{r.desc}</p>
          </div>
        ))}
      </div>
    </div>

    {plan.trainingPlan.length > 0 && (
      <WeeklyCalendarView trainingDays={plan.trainingPlan[0].days} />
    )}
    <Accordion type="single" collapsible defaultValue="week-0" className="space-y-2">
      {plan.trainingPlan.map((week, wi) => (
        <AccordionItem key={wi} value={`week-${wi}`} className="stat-card !p-0 overflow-hidden border-border">
          <AccordionTrigger className="px-4 py-3 hover:no-underline [&[data-state=open]>svg]:rotate-180">
            <div className="flex items-center gap-3">
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold ${week.deload ? 'bg-yellow-500/10 text-yellow-400' : 'bg-primary/10 text-primary'}`}>
                {wi + 1}
              </div>
              <div className="text-left">
                <span className="text-sm font-bold">{week.weekRange}</span>
                <span className="text-xs text-muted-foreground ml-2">— {week.phase}</span>
                {week.deload && <span className="ml-2 text-[10px] px-2 py-0.5 rounded-md bg-yellow-500/10 text-yellow-400 font-semibold">DELOAD</span>}
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            {week.intensityGuideline && (
              <div className="mb-3 px-3 py-2 rounded-lg bg-primary/5 border border-primary/10 text-xs text-muted-foreground">
                <span className="font-semibold text-primary">Intensity: </span>{week.intensityGuideline}
                {week.volumeChange && <><br /><span className="font-semibold text-primary">Volume: </span>{week.volumeChange}</>}
              </div>
            )}
            <div className="space-y-3">
              {week.days.map((day) => (
                <div key={day.day} className="rounded-xl bg-secondary/20 border border-border/30 p-4">
                  <p className="text-sm font-bold text-primary mb-3">{day.day} — {day.focus}</p>
                  <div className="space-y-2">
                    {day.exercises.map((ex, j) => (
                      <div key={j} className="flex justify-between items-start text-xs gap-2">
                        <div className="flex-1">
                          <span className="text-muted-foreground">{ex.name}</span>
                          {ex.notes && <span className="text-[10px] text-muted-foreground/60 italic ml-1">({ex.notes})</span>}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-mono text-primary/80 bg-primary/5 px-2 py-0.5 rounded">{ex.sets}×{ex.reps}</span>
                          {ex.rpe && <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 font-semibold">RPE {ex.rpe}</span>}
                          {ex.rest && <span className="text-[10px] text-muted-foreground">{ex.rest}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  </div>
);

export default TrainingTab;
