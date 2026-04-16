import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ExternalLink, ArrowRight, FlaskConical, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ComparePlans from '@/components/results/ComparePlans';
import { trackInternalLinkClick } from '@/lib/tracking';
import { calculatePlan, type UserInputs, type PlanResults } from '@/lib/calculations';

interface Props {
  plan: PlanResults;
  inputs: UserInputs;
  contextLinks: { url: string; title: string; description: string }[];
  setInputs: (inputs: UserInputs) => void;
  setPlan: (plan: PlanResults) => void;
}

const ScienceTab = ({ plan, inputs, contextLinks, setInputs, setPlan }: Props) => (
  <div className="space-y-4">
    <div className="rounded-xl bg-blue-500/5 border border-blue-500/20 p-4 mb-4">
      <div className="flex items-center gap-2 mb-2">
        <BookOpen className="h-4 w-4 text-blue-400" />
        <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Evidence-Based Methodology</span>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">
        Every number in your plan is derived from peer-reviewed research and validated equations. Below are the scientific foundations for each component.
      </p>
    </div>

    {plan.scienceNotes.map((note, i) => (
      <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="stat-card">
        <div className="flex items-center gap-2 mb-2">
          <FlaskConical className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-bold">{note.title}</h3>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed mb-2">{note.explanation}</p>
        <p className="text-[10px] text-muted-foreground/70 italic border-t border-border/30 pt-2">{note.citation}</p>
      </motion.div>
    ))}

    <h3 className="text-sm font-bold uppercase tracking-wider font-['Oswald'] mt-6 mb-4">Recommended Reading</h3>
    {contextLinks.map((link) => (
      <a
        key={link.url}
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackInternalLinkClick(link.url, 'results_reads')}
        className="stat-card flex items-center gap-4 cursor-pointer group"
      >
        <div className="flex-1">
          <p className="text-sm font-semibold group-hover:text-primary transition-colors">{link.title}</p>
          <p className="text-xs text-muted-foreground mt-1">{link.description}</p>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
      </a>
    ))}

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

export default ScienceTab;
