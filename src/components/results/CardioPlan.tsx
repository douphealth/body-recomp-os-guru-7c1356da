import { motion } from 'framer-motion';
import { Footprints } from 'lucide-react';
import type { CardioBlock } from '@/lib/calculations';

const CardioPlan = ({ cardioPlan }: { cardioPlan: CardioBlock }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.35 }}
    className="stat-card mb-4"
  >
    <div className="flex items-center gap-2 mb-4">
      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
        <Footprints className="h-4 w-4 text-primary" />
      </div>
      <h2 className="text-sm font-bold uppercase tracking-wider">Cardio Plan</h2>
    </div>

    <div className="grid grid-cols-2 gap-3 mb-4">
      {[
        { label: 'Type', value: cardioPlan.type },
        { label: 'Sessions/Week', value: String(cardioPlan.sessionsPerWeek) },
        { label: 'Duration', value: cardioPlan.duration },
        { label: 'Intensity', value: cardioPlan.intensity },
      ].map(item => (
        <div key={item.label} className="rounded-xl bg-secondary/20 border border-border/30 p-3">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{item.label}</p>
          <p className="text-sm font-semibold">{item.value}</p>
        </div>
      ))}
    </div>
    <p className="text-xs text-muted-foreground">{cardioPlan.notes}</p>
    {cardioPlan.runningPlan && (
      <div className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/15">
        <p className="text-xs font-semibold text-primary mb-1.5 flex items-center gap-1.5">🏃 Running Progression</p>
        <p className="text-xs text-muted-foreground leading-relaxed">{cardioPlan.runningPlan}</p>
      </div>
    )}
  </motion.div>
);

export default CardioPlan;
