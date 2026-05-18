import { motion } from 'framer-motion';
import { Award, GraduationCap, Dumbbell } from 'lucide-react';

interface CoachBioProps {
  variant?: 'compact' | 'full';
  className?: string;
}

const CREDENTIALS = [
  { Icon: GraduationCap, label: 'BSc Sports Science' },
  { Icon: Award, label: 'NSCA-CPT Certified' },
  { Icon: Dumbbell, label: '12+ yrs coaching' },
];

const CoachBio = ({ variant = 'compact', className = '' }: CoachBioProps) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-60px' }}
    transition={{ duration: 0.5 }}
    className={`stat-card flex flex-col sm:flex-row gap-5 items-start sm:items-center ${className}`}
    aria-label="About the coach"
  >
    <div
      className="h-20 w-20 rounded-2xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-primary/30 to-primary/5 border border-primary/30 text-2xl font-bold font-['Oswald'] text-primary"
      aria-hidden="true"
    >
      AT
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
        <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Your Coach</p>
        <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">GearUpToFit</p>
      </div>
      <h3 className="text-lg font-bold font-['Oswald'] tracking-wider mb-1">Alex Thorne</h3>
      <p className="text-xs text-muted-foreground leading-relaxed mb-3">
        {variant === 'full'
          ? "Strength coach and former natural physique athlete who has guided 3,000+ everyday people through 8-week recomposition cycles. Every formula in this plan is the same one Alex uses with private clients — no fluff, no fads, just the science that holds up under the bar."
          : "Strength coach behind 3,000+ recomposition plans. Every number here is the same protocol he uses with private clients."}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {CREDENTIALS.map(({ Icon, label }) => (
          <span
            key={label}
            className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-md bg-secondary/40 border border-border/40 text-muted-foreground font-medium"
          >
            <Icon className="h-3 w-3 text-primary" />
            {label}
          </span>
        ))}
      </div>
    </div>
  </motion.div>
);

export default CoachBio;
