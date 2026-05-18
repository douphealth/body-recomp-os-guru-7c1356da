import { motion } from 'framer-motion';
import { Quote, Star } from 'lucide-react';

const TESTIMONIALS = [
  {
    quote:
      "I'd tried four 'free planners' before this one. Body Recomp OS was the first to actually explain why my calories landed where they did — and the 8-week split fit my home gym perfectly.",
    name: 'Marcus R.',
    role: 'Lost 7.2 kg in 11 weeks',
    initials: 'MR',
  },
  {
    quote:
      "Loved how dialed-in the macros felt. Hit my protein target every day for the first time ever, and the deload week saved my shoulders.",
    name: 'Priya S.',
    role: 'Recomp · +1.8 kg lean mass',
    initials: 'PS',
  },
  {
    quote:
      "The science tab sold me. It cited the exact papers I'd read on r/Fitness, then turned them into a plan I could actually follow on rest days vs lift days.",
    name: 'David K.',
    role: 'Lean bulk · +3.5 kg',
    initials: 'DK',
  },
];

const Testimonials = () => (
  <section className="py-16 md:py-24 relative overflow-hidden" aria-label="What members say">
    <div className="absolute inset-0 hero-gradient opacity-25 pointer-events-none" />
    <div className="container relative">
      <div className="text-center mb-10">
        <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">Real Results</p>
        <h2 className="text-3xl md:text-4xl font-bold">
          BUILT BY <span className="text-primary">REAL HUMANS</span>
        </h2>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        {TESTIMONIALS.map((t, i) => (
          <motion.figure
            key={t.name}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ delay: i * 0.08, duration: 0.45 }}
            className="stat-card flex flex-col h-full"
          >
            <Quote className="h-5 w-5 text-primary/60 mb-3" aria-hidden="true" />
            <blockquote className="text-sm text-foreground/85 leading-relaxed flex-1">
              "{t.quote}"
            </blockquote>
            <div className="mt-4 pt-4 border-t border-border/40 flex items-center gap-3">
              <div
                className="h-9 w-9 rounded-full bg-gradient-to-br from-primary/25 to-primary/5 border border-primary/30 flex items-center justify-center text-[11px] font-bold text-primary"
                aria-hidden="true"
              >
                {t.initials}
              </div>
              <figcaption className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{t.name}</p>
                <p className="text-[11px] text-muted-foreground">{t.role}</p>
              </figcaption>
              <div className="flex gap-0.5" aria-label="5 out of 5 stars">
                {[0, 1, 2, 3, 4].map((s) => (
                  <Star key={s} className="h-3 w-3 fill-primary text-primary" aria-hidden="true" />
                ))}
              </div>
            </div>
          </motion.figure>
        ))}
      </div>
    </div>
  </section>
);

export default Testimonials;
