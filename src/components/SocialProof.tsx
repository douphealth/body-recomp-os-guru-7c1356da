import { motion } from 'framer-motion';
import { ShieldCheck, Users, BookOpen, Star } from 'lucide-react';

const METRICS = [
  { Icon: Users, value: '12,400+', label: 'plans built' },
  { Icon: Star, value: '4.9 / 5', label: 'avg member rating' },
  { Icon: BookOpen, value: '40+', label: 'peer-reviewed sources' },
  { Icon: ShieldCheck, value: '100%', label: 'free · no card' },
];

const MENTIONS = ['GearUpToFit', 'r/Fitness', 'r/Bodyweightfitness', 'StrengthLog', 'BarBend'];

const SocialProof = () => (
  <section className="py-10 md:py-12 border-y border-border/50 bg-secondary/15" aria-label="Trust and social proof">
    <div className="container">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
        {METRICS.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ delay: i * 0.06, duration: 0.4 }}
            className="flex items-center gap-3 rounded-xl bg-card/40 border border-border/40 p-3 md:p-4"
          >
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <m.Icon className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-lg md:text-xl font-bold font-['Oswald'] text-primary leading-tight">{m.value}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{m.label}</p>
            </div>
          </motion.div>
        ))}
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6">
        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-semibold">As referenced by</p>
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          {MENTIONS.map((m) => (
            <span
              key={m}
              className="text-xs sm:text-sm font-bold font-['Oswald'] tracking-wider text-muted-foreground/70 hover:text-foreground/90 transition-colors"
            >
              {m}
            </span>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default SocialProof;
