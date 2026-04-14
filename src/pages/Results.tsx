import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { ExternalLink, Dumbbell, Heart, ArrowRight, Calendar, Activity as ActivityIcon, FlaskConical, Droplets, Leaf, Clock, BookOpen, Utensils } from 'lucide-react';
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
      { '@type': 'Question', name: 'How is my calorie target calculated?', acceptedAnswer: { '@type': 'Answer', text: `We average two validated equations: the Mifflin-St Jeor (1990) and Katch-McArdle formulas to calculate your BMR of ${plan.bmr} kcal, then multiply by an activity factor based on your workout frequency and daily step count to get your TDEE of ${plan.tdee} kcal.` } },
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
            <p className="text-xs text-muted-foreground mt-1">
              {plan.deficitOrSurplus < 0 ? `${Math.abs(plan.deficitOrSurplus)} kcal deficit` : plan.deficitOrSurplus > 0 ? `${plan.deficitOrSurplus} kcal surplus` : 'Calorie cycling around maintenance'}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { label: 'Protein', value: plan.proteinGrams, unit: 'g', color: 'text-red-400', sub: `${plan.proteinPerKgLBM}g/kg` },
              { label: 'Carbs', value: plan.carbGrams, unit: 'g', color: 'text-blue-400' },
              { label: 'Fat', value: plan.fatGrams, unit: 'g', color: 'text-yellow-400' },
            ].map(m => (
              <div key={m.label} className="stat-card !p-3">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{m.label}</p>
                <AnimatedNumber value={m.value} suffix={m.unit} className={`text-2xl font-bold font-['Oswald'] ${m.color}`} />
                {m.sub && <p className="text-[9px] text-muted-foreground">{m.sub}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional targets */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: Droplets, label: 'Water', value: `${plan.waterLiters}L`, sub: 'daily target' },
          { icon: Leaf, label: 'Fiber', value: `${plan.fiberGrams}g`, sub: 'daily target' },
          { icon: Dumbbell, label: 'Training', value: `${inputs.workoutFrequency}x`, sub: 'per week' },
          { icon: ActivityIcon, label: 'Steps', value: inputs.stepCount.toLocaleString(), sub: 'daily goal' },
        ].map(t => (
          <motion.div key={t.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="stat-card !p-3 flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <t.icon className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs font-bold">{t.value}</p>
              <p className="text-[10px] text-muted-foreground">{t.sub}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <MacroDonutChart plan={plan} />
        <TDEEBarChart plan={plan} />
      </div>

      {/* Meal Timing */}
      <div className="stat-card">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Utensils className="h-4 w-4 text-primary" />
          </div>
          <h3 className="text-sm font-bold uppercase tracking-wider font-['Oswald']">Recommended Meal Timing</h3>
        </div>
        <div className="space-y-2">
          {plan.mealTiming.map((meal, i) => (
            <div key={i} className="rounded-xl bg-secondary/20 border border-border/30 p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-bold text-primary">{meal.meal}</span>
                <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> {meal.timing}</span>
              </div>
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span>{meal.calories} kcal</span>
                <span className="text-red-400">P: {meal.protein}g</span>
                <span className="text-blue-400">C: {meal.carbs}g</span>
                <span className="text-yellow-400">F: {meal.fat}g</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1 italic">{meal.notes}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Details */}
      <div className="stat-card">
        <h3 className="text-sm font-bold uppercase tracking-wider mb-3 font-['Oswald']">Calculation Details</h3>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground"><GlossaryTooltip term="BMR">BMR</GlossaryTooltip> (Mifflin + Katch avg)</span><span className="font-medium">{plan.bmr} kcal</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground"><GlossaryTooltip term="TDEE">TDEE</GlossaryTooltip> (maintenance)</span><span className="font-medium">{plan.tdee} kcal</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Thermic Effect of Food</span><span className="font-medium">~{plan.tef} kcal</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground"><GlossaryTooltip term="NEAT">NEAT</GlossaryTooltip> estimate</span><span className="font-medium">~{plan.neat} kcal</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground"><GlossaryTooltip term="Lean Body Mass">Lean Body Mass</GlossaryTooltip></span><span className="font-medium">{plan.leanBodyMass} kg</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Protein per kg LBM</span><span className="font-medium text-primary">{plan.proteinPerKgLBM}g/kg</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Formulas</span><span className="font-medium text-primary"><GlossaryTooltip term="Mifflin-St Jeor">Mifflin-St Jeor</GlossaryTooltip> + Katch-McArdle</span></div>
          {plan.weeklyCalorieRange && (
            <div className="flex justify-between"><span className="text-muted-foreground"><GlossaryTooltip term="Recomp">Recomp</GlossaryTooltip> cycling range</span><span className="font-medium text-primary">{plan.weeklyCalorieRange.low}–{plan.weeklyCalorieRange.high}</span></div>
          )}
        </div>
      </div>
    </div>
  );

  const TrainingTab = () => (
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
              {/* Phase info */}
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
          <div className="flex justify-between"><span className="text-muted-foreground">Sessions/week</span><span className="font-medium text-primary">{plan.cardioPlan.sessionsPerWeek}x</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Duration</span><span className="font-medium">{plan.cardioPlan.duration}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Intensity</span><span className="font-medium">{plan.cardioPlan.intensity}</span></div>
          {plan.cardioPlan.runningPlan && (
            <div className="mt-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
              <p className="text-xs font-semibold text-primary mb-1">Running Program</p>
              <p className="text-xs text-muted-foreground">{plan.cardioPlan.runningPlan}</p>
            </div>
          )}
        </div>
      </div>

      {/* Heart Rate Zones */}
      {plan.cardioPlan.heartRateZones && (
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Heart className="h-4 w-4 text-primary" />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-wider font-['Oswald']">Heart Rate Zones</h3>
            <span className="text-[10px] text-muted-foreground ml-auto">Karvonen Formula</span>
          </div>
          <div className="space-y-2">
            {plan.cardioPlan.heartRateZones.map((z, i) => (
              <div key={i} className="flex items-center justify-between text-xs rounded-lg bg-secondary/20 border border-border/30 px-3 py-2">
                <span className="font-semibold text-foreground">{z.zone}</span>
                <span className="font-mono text-primary">{z.bpm}</span>
                <span className="text-muted-foreground text-[10px] max-w-[120px] text-right">{z.purpose}</span>
              </div>
            ))}
          </div>
        </div>
      )}

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

  const ScienceTab = () => (
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

      {/* Contextual links */}
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
              {inputs.age}yo {inputs.sex} • {inputs.weightKg}kg • {inputs.bodyFatPercent}% BF • {plan.leanBodyMass}kg LBM • {inputs.equipmentAccess} • {inputs.dietStyle} • Generated {today}
            </p>
          </div>
          <div className="flex gap-2 no-print" data-no-print>
            <PrintButton plan={plan} inputs={inputs} />
            <ShareDialog goalLabel={plan.goalLabel} plan={plan} inputs={inputs} />
          </div>
        </div>
      </div>

      {isMobile ? (
        <Accordion type="single" collapsible defaultValue="numbers" className="space-y-2">
          <AccordionItem value="numbers" className="stat-card !p-0 overflow-hidden border-border">
            <AccordionTrigger className="px-4 py-3 hover:no-underline font-['Oswald'] text-sm tracking-wider">YOUR NUMBERS</AccordionTrigger>
            <AccordionContent className="px-4 pb-4"><NumbersTab /></AccordionContent>
          </AccordionItem>
          <AccordionItem value="training" className="stat-card !p-0 overflow-hidden border-border">
            <AccordionTrigger className="px-4 py-3 hover:no-underline font-['Oswald'] text-sm tracking-wider">TRAINING PLAN</AccordionTrigger>
            <AccordionContent className="px-4 pb-4"><TrainingTab /></AccordionContent>
          </AccordionItem>
          <AccordionItem value="recovery" className="stat-card !p-0 overflow-hidden border-border">
            <AccordionTrigger className="px-4 py-3 hover:no-underline font-['Oswald'] text-sm tracking-wider">CARDIO & RECOVERY</AccordionTrigger>
            <AccordionContent className="px-4 pb-4"><RecoveryTab /></AccordionContent>
          </AccordionItem>
          <AccordionItem value="science" className="stat-card !p-0 overflow-hidden border-border">
            <AccordionTrigger className="px-4 py-3 hover:no-underline font-['Oswald'] text-sm tracking-wider">SCIENCE & NEXT STEPS</AccordionTrigger>
            <AccordionContent className="px-4 pb-4"><ScienceTab /></AccordionContent>
          </AccordionItem>
        </Accordion>
      ) : (
        <Tabs defaultValue="numbers" className="w-full">
          <TabsList className="w-full bg-secondary/30 border border-border/50 h-11 p-1">
            <TabsTrigger value="numbers" className="flex-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-['Oswald'] text-xs tracking-wider">NUMBERS</TabsTrigger>
            <TabsTrigger value="training" className="flex-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-['Oswald'] text-xs tracking-wider">TRAINING</TabsTrigger>
            <TabsTrigger value="recovery" className="flex-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-['Oswald'] text-xs tracking-wider">RECOVERY</TabsTrigger>
            <TabsTrigger value="science" className="flex-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-['Oswald'] text-xs tracking-wider">SCIENCE</TabsTrigger>
          </TabsList>
          <TabsContent value="numbers" className="mt-4"><NumbersTab /></TabsContent>
          <TabsContent value="training" className="mt-4"><TrainingTab /></TabsContent>
          <TabsContent value="recovery" className="mt-4"><RecoveryTab /></TabsContent>
          <TabsContent value="science" className="mt-4"><ScienceTab /></TabsContent>
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
