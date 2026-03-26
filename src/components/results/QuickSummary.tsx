import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import type { PlanResults } from '@/lib/calculations';

const QuickSummary = ({ plan }: { plan: PlanResults }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 md:p-8 mb-8 card-glow"
  >
    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
    <div className="relative">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-5 w-5 text-primary" />
        <span className="text-xs font-semibold text-primary uppercase tracking-widest">Your Personalized Plan</span>
      </div>
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
        YOUR <span className="text-primary text-glow">{plan.goalLabel.toUpperCase()}</span> PLAN
      </h1>
      <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">{plan.quickSummary}</p>
    </div>
  </motion.div>
);

export default QuickSummary;
