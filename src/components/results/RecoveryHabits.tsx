import { motion } from 'framer-motion';
import { Heart, Brain, Calendar, ExternalLink } from 'lucide-react';
import type { PlanResults, UserInputs } from '@/lib/calculations';
import { trackInternalLinkClick } from '@/lib/tracking';

const RecoveryHabits = ({ plan, inputs }: { plan: PlanResults; inputs: UserInputs }) => {
  const todayArticles = [
    { url: 'https://gearuptofit.com/', title: 'Explore GearUpToFit', desc: 'Training plans, workouts, and guides' },
  ];
  if (inputs.runningInterest) {
    todayArticles.push({ url: 'https://gearuptofit.com/running/how-to-choose-the-right-running-shoes/', title: 'Choose Your Running Shoes', desc: 'Perfect shoes for your plan' });
  }

  return (
    <div className="grid md:grid-cols-2 gap-4 mb-4">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="stat-card">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Heart className="h-4 w-4 text-primary" />
          </div>
          <h2 className="text-sm font-bold uppercase tracking-wider">Recovery</h2>
        </div>
        <ul className="space-y-2.5">
          {plan.recoveryChecklist.map((item, i) => (
            <li key={i} className="text-xs text-muted-foreground leading-relaxed flex items-start gap-2">
              <span className="text-primary mt-0.5">●</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="stat-card">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Calendar className="h-4 w-4 text-primary" />
          </div>
          <h2 className="text-sm font-bold uppercase tracking-wider">Today & This Week</h2>
        </div>
        <div className="space-y-5">
          <div>
            <p className="text-[10px] font-semibold text-primary uppercase tracking-widest mb-2">📋 TODAY</p>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li className="flex items-start gap-2"><span className="text-primary">→</span> Eat {plan.calorieTarget} cal with {plan.proteinGrams}g protein</li>
              <li className="flex items-start gap-2"><span className="text-primary">→</span> Complete Day 1 workout</li>
              <li className="flex items-start gap-2"><span className="text-primary">→</span> Hit your step count target</li>
            </ul>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-primary uppercase tracking-widest mb-2">📅 THIS WEEK</p>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              {plan.habitPlan[0].habits.map((h, i) => (
                <li key={i} className="flex items-start gap-2"><span className="text-primary">→</span> {h}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-primary uppercase tracking-widest mb-2">📖 NEXT READS</p>
            {todayArticles.map((a) => (
              <a key={a.url} href={a.url} target="_blank" rel="noopener noreferrer" onClick={() => trackInternalLinkClick(a.url, 'today_panel')}
                className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors py-1.5">
                <ExternalLink className="h-3 w-3 shrink-0" /> {a.title}
              </a>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Habits */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="stat-card md:col-span-2">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Brain className="h-4 w-4 text-primary" />
          </div>
          <h2 className="text-sm font-bold uppercase tracking-wider">8-Week Habit Plan</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {plan.habitPlan.map((week) => (
            <div key={week.week} className="rounded-xl bg-secondary/20 border border-border/30 p-3 hover:border-primary/20 transition-colors">
              <p className="text-xs font-bold text-primary mb-0.5">Week {week.week}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">{week.focus}</p>
              <ul className="space-y-1">
                {week.habits.map((h, i) => (
                  <li key={i} className="text-[11px] text-muted-foreground leading-relaxed">• {h}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default RecoveryHabits;
