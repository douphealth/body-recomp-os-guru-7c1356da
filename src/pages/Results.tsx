import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { ExternalLink, Dumbbell, Heart, ArrowRight, Calendar, Activity as ActivityIcon } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import JsonLd from '@/components/JsonLd';
import AnimatedNumber from '@/components/AnimatedNumber';
import PlanLoadingScreen from '@/components/PlanLoadingScreen';
import ShareDialog from '@/components/results/ShareDialog';
import PrintButton from '@/components/results/PrintButton';
import ComparePlans from '@/components/results/ComparePlans';
import GlossaryTooltip from '@/components/results/GlossaryTooltip';
import MacroDonutChart from '@/components/results/MacroDonutChart';
import TDEEBarChart from '@/components/results/TDEEBarChart';
import WeeklyCalendarView from '@/components/results/WeeklyCalendarView';
import { useIsMobile } from '@/hooks/use-mobile';
import { calculatePlan, getContextualLinks, type UserInputs, type PlanResults } from '@/lib/calculations';
import { trackResultView, trackInternalLinkClick } from '@/lib/tracking';

const Results = () => {
  const [plan, setPlan] = useState<PlanResults | null>(null);
  const [inputs, setInputs] = useState<UserInputs | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkedHabits, setCheckedHabits] = useState<Set<number>>(new Set());
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    const stored = sessionStorage.getItem('recomp-inputs');
    if (!stored) { navigate('/app/body-recomp'); return; }
    const parsed = JSON.parse(stored) as UserInputs;
    setInputs(parsed);
    setPlan(calculatePlan(parsed));
    trackResultView(parsed.goal);
  }, [navigate]);

  const handleLoadingComplete = useCallback(() => {
    setLoading(false);
  }, []);

  const toggleHabit = (i: number) => {
    setCheckedHabits(prev => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
      return next;
    });
  };

  if (!plan || !inputs) return null;

  const contextLinks = getContextualLinks(inputs);
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      { '@type': 'Question', name: `How many calories should I eat for ${plan.goalLabel.toLowerCase()}?`, acceptedAnswer: { '@type': 'Answer', text: `Based on your profile, your target is ${plan.calorieTarget} calories per day with ${plan.proteinGrams}g of protein.` } },
      { '@type': 'Question', name: 'How is my calorie target calculated?', acceptedAnswer: { '@type': 'Answer', text: 'We use the Mifflin-St Jeor equation to calculate your BMR, then multiply by an activity factor based on your workout frequency and daily step count.' } },
    ],
  };

  // Results content sections
  const NumbersTab = () => (
    <div className="space-y-4">
      {/* Big calorie hero */}
      <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent p-6 md:p-8 card-glow">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">Daily Calorie Target</p>
            <div className="flex items-baseline gap-2">
              <AnimatedNumber value={plan.calorieTarget} className="text-5xl md:text-6xl font-bold text-primary font-['Oswald'] tracking-tight" />
              <span className="text-lg text-muted-foreground font-['Oswald']">kcal</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2 max-w-lg">{plan.quickSummary}</p>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { label: 'Protein', value: plan.proteinGrams, unit: 'g', color: 'text-red-400' },
              { label: 'Carbs', value: plan.carbGrams, unit: 'g', color: 'text-blue-400' },
              { label: 'Fat', value: plan.fatGrams, unit: 'g', color: 'text-yellow-400' },
            ].map(m => (
              <div key={m.label} className="stat-card !p-3">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{m.label}</p>
                <AnimatedNumber value={m.value} suffix={m.unit} className={`text-2xl font-bold font-['Oswald'] ${m.color}`} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <MacroDonutChart plan={plan} />
        <TDEEBarChart plan={plan} />
      </div>

      {/* Details */}
      <div className="stat-card">
        <h3 className="text-sm font-bold uppercase tracking-wider mb-3 font-['Oswald']">Calculation Details</h3>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">Basal Metabolic Rate (<GlossaryTooltip term="BMR">BMR</GlossaryTooltip>)</span><span className="font-medium">{Math.round(plan.tdee / 1.4)} kcal</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground"><GlossaryTooltip term="TDEE">TDEE</GlossaryTooltip> (maintenance)</span><span className="font-medium">{plan.tdee} kcal</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground"><GlossaryTooltip term="Lean Body Mass">Lean Body Mass</GlossaryTooltip></span><span className="font-medium">{plan.leanBodyMass} kg</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Formula</span><span className="font-medium text-primary"><GlossaryTooltip term="Mifflin-St Jeor">Mifflin-St Jeor</GlossaryTooltip></span></div>
          {plan.weeklyCalorieRange && (
            <div className="flex justify-between"><span className="text-muted-foreground"><GlossaryTooltip term="Recomp">Recomp</GlossaryTooltip> cycling range</span><span className="font-medium text-primary">{plan.weeklyCalorieRange.low}–{plan.weeklyCalorieRange.high}</span></div>
          )}
        </div>
      </div>
    </div>
  );

  const TrainingTab = () => (
    <div className="space-y-4">
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
              <div className="space-y-3">
                {week.days.map((day) => (
                  <div key={day.day} className="rounded-xl bg-secondary/20 border border-border/30 p-4">
                    <p className="text-sm font-bold text-primary mb-3">{day.day} — {day.focus}</p>
                    <div className="space-y-2">
                      {day.exercises.map((ex, j) => (
                        <div key={j} className="flex justify-between items-center text-xs">
                          <span className="text-muted-foreground">{ex.name}</span>
                          <span className="shrink-0 ml-2 font-mono text-primary/80 bg-primary/5 px-2 py-0.5 rounded">{ex.sets}×{ex.reps}</span>
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

  const RecoveryTab = () => (
    <div className="space-y-4">
      {/* Cardio */}
      <div className="stat-card">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <ActivityIcon className="h-4 w-4 text-primary" />
          </div>
          <h3 className="text-sm font-bold uppercase tracking-wider font-['Oswald']">Cardio Plan</h3>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Type</span><span className="font-medium">{plan.cardioPlan.type}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Sessions/week</span><span className="font-medium text-primary">{plan.cardioPlan.sessionsPerWeek}×</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Duration</span><span className="font-medium">{plan.cardioPlan.duration}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Intensity</span><span className="font-medium">{plan.cardioPlan.intensity}</span></div>
          {plan.cardioPlan.runningPlan && (
            <div className="mt-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
              <p className="text-xs font-semibold text-primary mb-1">🏃 Running Program</p>
              <p className="text-xs text-muted-foreground">{plan.cardioPlan.runningPlan}</p>
            </div>
          )}
        </div>
      </div>

      {/* Recovery checklist */}
      <div className="stat-card">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Heart className="h-4 w-4 text-primary" />
          </div>
          <h3 className="text-sm font-bold uppercase tracking-wider font-['Oswald']">Recovery Checklist</h3>
        </div>
        <div className="space-y-3">
          {plan.recoveryChecklist.map((item, i) => (
            <label key={i} className="flex items-start gap-3 cursor-pointer group">
              <Checkbox
                checked={checkedHabits.has(i)}
                onCheckedChange={() => toggleHabit(i)}
                className="mt-0.5 border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <span className={`text-sm transition-all ${checkedHabits.has(i) ? 'text-muted-foreground line-through' : 'text-foreground group-hover:text-primary'}`}>
                {item}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const NextStepsTab = () => (
    <div className="space-y-3">
      <h3 className="text-sm font-bold uppercase tracking-wider font-['Oswald'] mb-4">Recommended Reading</h3>
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

      {/* CTA */}
      <div className="mt-8 text-center space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/app/body-recomp">
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

  const resultContent = (
    <>
      {/* Personalized banner */}
      <div className="relative overflow-hidden rounded-xl border-l-4 border-l-primary bg-card p-4 md:p-5 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold font-['Oswald'] tracking-wider">
              YOUR 8-WEEK <span className="text-primary">{plan.goalLabel.toUpperCase()}</span> PLAN
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              {inputs.age}yo {inputs.sex} • {inputs.weightKg}kg • {inputs.bodyFatPercent}% BF • {inputs.equipmentAccess} • {inputs.dietStyle} • Generated {today}
            </p>
          </div>
          <div className="flex gap-2 no-print" data-no-print>
            <PrintButton plan={plan} inputs={inputs} />
            <ShareDialog goalLabel={plan.goalLabel} />
          </div>
        </div>
      </div>

      {isMobile ? (
        /* Mobile: Accordion layout */
        <Accordion type="single" collapsible defaultValue="numbers" className="space-y-2">
          <AccordionItem value="numbers" className="stat-card !p-0 overflow-hidden border-border">
            <AccordionTrigger className="px-4 py-3 hover:no-underline font-['Oswald'] text-sm tracking-wider">📊 YOUR NUMBERS</AccordionTrigger>
            <AccordionContent className="px-4 pb-4"><NumbersTab /></AccordionContent>
          </AccordionItem>
          <AccordionItem value="training" className="stat-card !p-0 overflow-hidden border-border">
            <AccordionTrigger className="px-4 py-3 hover:no-underline font-['Oswald'] text-sm tracking-wider">🏋️ TRAINING PLAN</AccordionTrigger>
            <AccordionContent className="px-4 pb-4"><TrainingTab /></AccordionContent>
          </AccordionItem>
          <AccordionItem value="recovery" className="stat-card !p-0 overflow-hidden border-border">
            <AccordionTrigger className="px-4 py-3 hover:no-underline font-['Oswald'] text-sm tracking-wider">💚 CARDIO & RECOVERY</AccordionTrigger>
            <AccordionContent className="px-4 pb-4"><RecoveryTab /></AccordionContent>
          </AccordionItem>
          <AccordionItem value="next" className="stat-card !p-0 overflow-hidden border-border">
            <AccordionTrigger className="px-4 py-3 hover:no-underline font-['Oswald'] text-sm tracking-wider">🚀 NEXT STEPS</AccordionTrigger>
            <AccordionContent className="px-4 pb-4"><NextStepsTab /></AccordionContent>
          </AccordionItem>
        </Accordion>
      ) : (
        /* Desktop: Tabbed layout */
        <Tabs defaultValue="numbers" className="w-full">
          <TabsList className="w-full bg-secondary/30 border border-border/50 h-11 p-1">
            <TabsTrigger value="numbers" className="flex-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-['Oswald'] text-xs tracking-wider">📊 YOUR NUMBERS</TabsTrigger>
            <TabsTrigger value="training" className="flex-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-['Oswald'] text-xs tracking-wider">🏋️ TRAINING</TabsTrigger>
            <TabsTrigger value="recovery" className="flex-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-['Oswald'] text-xs tracking-wider">💚 RECOVERY</TabsTrigger>
            <TabsTrigger value="next" className="flex-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-['Oswald'] text-xs tracking-wider">🚀 NEXT STEPS</TabsTrigger>
          </TabsList>
          <TabsContent value="numbers" className="mt-4"><NumbersTab /></TabsContent>
          <TabsContent value="training" className="mt-4"><TrainingTab /></TabsContent>
          <TabsContent value="recovery" className="mt-4"><RecoveryTab /></TabsContent>
          <TabsContent value="next" className="mt-4"><NextStepsTab /></TabsContent>
        </Tabs>
      )}
    </>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title={`Your ${plan.goalLabel} Plan — ${plan.calorieTarget} cal/day | GearUpToFit Body Recomp OS`}
        description={plan.quickSummary.slice(0, 155)}
        path="/app/body-recomp/results"
      />
      <JsonLd data={faqSchema} />
      <Header />

      <main className="flex-1 py-8 md:py-12">
        <div className="container max-w-4xl">
          {loading ? (
            <PlanLoadingScreen onComplete={handleLoadingComplete} />
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {resultContent}
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Results;
