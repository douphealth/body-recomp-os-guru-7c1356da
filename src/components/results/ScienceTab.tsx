import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ExternalLink, ArrowRight, FlaskConical, BookOpen, Sparkles, ShieldCheck, Microscope, Quote, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ComparePlans from '@/components/results/ComparePlans';
import { trackInternalLinkClick } from '@/lib/tracking';
import { calculatePlan, type UserInputs, type PlanResults } from '@/lib/calculations';
import { getSourcesFor } from '@/lib/sources';

interface Props {
  plan: PlanResults;
  inputs: UserInputs;
  contextLinks: { url: string; title: string; description: string }[];
  setInputs: (inputs: UserInputs) => void;
  setPlan: (plan: PlanResults) => void;
}

const ScienceTab = ({ plan, inputs, contextLinks, setInputs, setPlan }: Props) => {
  const goalInsight =
    inputs.goal === 'fat-loss'
      ? {
          headline: 'Strategic deficit + protein shield',
          summary: `Your ${Math.abs(plan.deficitOrSurplus)} kcal/day deficit (~${Math.round((Math.abs(plan.deficitOrSurplus) / plan.tdee) * 100)}% of TDEE) sits in the evidence-backed sweet spot for losing fat while protecting lean tissue. Pair that with ${plan.proteinPerKgLBM}g/kg LBM of protein and progressive overload, and your body has every signal it needs to keep muscle while it sheds fat.`,
          pillars: [
            { Icon: ShieldCheck, label: 'Muscle preservation', text: `${plan.proteinGrams}g protein + heavy compounds at RPE 7-9` },
            { Icon: FlaskConical, label: 'Energy deficit', text: `${Math.abs(plan.deficitOrSurplus)} kcal/day · ~${(Math.abs(plan.deficitOrSurplus) * 7 / 7700).toFixed(1)} kg fat/wk` },
            { Icon: Sparkles, label: 'NEAT amplifier', text: `${inputs.stepCount.toLocaleString()} steps add ~${plan.neat} kcal/day` },
          ],
        }
      : inputs.goal === 'lean-muscle'
        ? {
            headline: 'Conservative surplus, maximum signal',
            summary: `Your +${plan.deficitOrSurplus} kcal/day surplus is calibrated to maximize muscle protein synthesis without unnecessary fat gain. Combined with ${plan.proteinPerKgLBM}g/kg LBM protein and a progressive overload program, every calorie above maintenance has a clear anabolic destination.`,
            pillars: [
              { Icon: Sparkles, label: 'Anabolic surplus', text: `+${plan.deficitOrSurplus} kcal/day · 10% above TDEE` },
              { Icon: ShieldCheck, label: 'MPS maximization', text: `${plan.proteinGrams}g protein across 4 doses` },
              { Icon: FlaskConical, label: 'Progressive overload', text: 'Add reps, then load, every microcycle' },
            ],
          }
        : {
            headline: 'Calorie cycling for body recomposition',
            summary: `Body recomposition works by oscillating around maintenance — slight surpluses on training days fuel growth, slight deficits on rest days nudge fat loss. With ${plan.proteinGrams}g daily protein and resistance training, you create the rare conditions for simultaneous muscle gain and fat loss.`,
            pillars: [
              { Icon: FlaskConical, label: 'Calorie cycling', text: `${plan.weeklyCalorieRange?.low}–${plan.weeklyCalorieRange?.high} kcal range` },
              { Icon: ShieldCheck, label: 'Protein floor', text: `${plan.proteinGrams}g daily — non-negotiable` },
              { Icon: Sparkles, label: 'Recovery surplus', text: 'Carbs cycled to training days' },
            ],
          };

  return (
    <div className="space-y-4">
      {/* Why this works hero panel */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent p-5 md:p-6 card-glow"
      >
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-8 w-8 rounded-xl bg-primary/15 flex items-center justify-center">
              <Microscope className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Why This Works</p>
              <h3 className="text-base font-bold font-['Oswald'] tracking-wider">{goalInsight.headline}</h3>
            </div>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed mb-4">{goalInsight.summary}</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {goalInsight.pillars.map((pill, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                className="rounded-xl border border-border/40 bg-card/40 backdrop-blur p-3"
              >
                <div className="flex items-center gap-1.5 mb-1.5">
                  <pill.Icon className="h-3.5 w-3.5 text-primary" />
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wider">{pill.label}</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug">{pill.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Methodology header */}
      <div className="rounded-xl bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20 p-4">
        <div className="flex items-center gap-2 mb-1.5">
          <BookOpen className="h-4 w-4 text-blue-400" />
          <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Evidence-Based Methodology</span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Every number in your plan is derived from peer-reviewed research and validated equations. Tap a card below to see the formula and the citation it's grounded in.
        </p>
      </div>

      {/* Science notes */}
      <div className="space-y-3">
        {plan.scienceNotes.map((note, i) => {
          const sources = getSourcesFor(note.title);
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="stat-card group"
            >
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/15 transition-colors">
                  <FlaskConical className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold font-['Oswald'] tracking-wider mb-1.5">{note.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-3">{note.explanation}</p>
                  <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-secondary/30 border border-border/30 mb-2">
                    <Quote className="h-3 w-3 text-primary/60 flex-shrink-0 mt-0.5" />
                    <p className="text-[10px] text-muted-foreground/90 italic leading-relaxed">{note.citation}</p>
                  </div>
                  {sources.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {sources.map((s) => (
                        <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer"
                          onClick={() => trackInternalLinkClick(s.url, 'science_source')}
                          className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-md bg-primary/10 text-primary hover:bg-primary/15 border border-primary/20 transition-all font-medium">
                          <Link2 className="h-2.5 w-2.5" />
                          <span className="truncate max-w-[180px]">{s.label}</span>
                          <ExternalLink className="h-2.5 w-2.5 opacity-60" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Recommended Reading */}
      <div className="pt-4">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-bold uppercase tracking-wider font-['Oswald']">Recommended Reading</h3>
        </div>
        <div className="space-y-2">
          {contextLinks.map((link, i) => (
            <motion.a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackInternalLinkClick(link.url, 'results_reads')}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="stat-card flex items-center gap-4 cursor-pointer group"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold group-hover:text-primary transition-colors">{link.title}</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{link.description}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all flex-shrink-0" />
            </motion.a>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="mt-8 text-center space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/build-my-plan">
            <Button variant="outline" className="border-border/50 hover:border-primary/40 hover:bg-primary/5 transition-all">
              Adjust My Plan
            </Button>
          </Link>
          <a href="https://gearuptofit.com/" target="_blank" rel="noopener noreferrer" onClick={() => trackInternalLinkClick('https://gearuptofit.com/', 'results_cta')}>
            <Button className="gradient-red border-0 font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all hover:scale-[1.02]">
              Explore GearUpToFit <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </a>
        </div>
      </div>

      <ComparePlans currentGoal={inputs.goal} inputs={inputs} onSwitchGoal={(goal) => {
        const newInputs = { ...inputs, goal };
        sessionStorage.setItem('recomp-inputs', JSON.stringify(newInputs));
        setInputs(newInputs);
        setPlan(calculatePlan(newInputs));
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }} />
    </div>
  );
};

export default ScienceTab;
