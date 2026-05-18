import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import EmailGate, { hasSubscribed } from '@/components/EmailGate';
import InlineEmailCapture from '@/components/InlineEmailCapture';
import { captureUTM } from '@/lib/utm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Calculator, Dumbbell, HeartPulse, FlaskConical } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import JsonLd from '@/components/JsonLd';
import PlanLoadingScreen from '@/components/PlanLoadingScreen';
import ShareDialog from '@/components/results/ShareDialog';
import PrintButton from '@/components/results/PrintButton';
import NumbersTab from '@/components/results/NumbersTab';
import TrainingTab from '@/components/results/TrainingTab';
import RecoveryTab from '@/components/results/RecoveryTab';
import ScienceTab from '@/components/results/ScienceTab';
import TodayPanel from '@/components/results/TodayPanel';
import { useIsMobile } from '@/hooks/use-mobile';
import { calculatePlan, getContextualLinks, type UserInputs, type PlanResults } from '@/lib/calculations';
import { trackResultView } from '@/lib/tracking';
import { fetchPlanByToken, readCachedInputs, savePlan, setStoredShareToken, getStoredShareToken } from '@/lib/plan-store';

const Results = () => {
  const [plan, setPlan] = useState<PlanResults | null>(null);
  const [inputs, setInputs] = useState<UserInputs | null>(null);
  const [loading, setLoading] = useState(true);
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [checkedHabits, setCheckedHabits] = useState<Set<number>>(new Set());
  const [emailGateOpen, setEmailGateOpen] = useState(false);
  const navigate = useNavigate();
  const { token: tokenParam } = useParams<{ token?: string }>();
  const isMobile = useIsMobile();

  // Capture UTM on first load + open email gate ~25s after results render (once per visitor)
  useEffect(() => {
    captureUTM();
    if (hasSubscribed() || loading) return;
    const t = setTimeout(() => setEmailGateOpen(true), 25000);
    return () => clearTimeout(t);
  }, [loading]);

  useEffect(() => {
    let cancelled = false;

    const hydrate = async () => {
      // 1. Token in URL → fetch from server.
      if (tokenParam) {
        const fetched = await fetchPlanByToken(tokenParam, 'results_page');
        if (cancelled) return;
        if (fetched) {
          setStoredShareToken(fetched.shareToken);
          setShareToken(fetched.shareToken);
          setInputs(fetched.inputs);
          setPlan(fetched.outputs || calculatePlan(fetched.inputs));
          trackResultView(fetched.inputs.goal);
          return;
        }
        // Token in URL but not found → fall through to cached inputs or wizard.
      }

      // 2. Fall back to sessionStorage cache.
      const cached = readCachedInputs();
      if (cached) {
        setInputs(cached);
        const calc = calculatePlan(cached);
        setPlan(calc);
        trackResultView(cached.goal);
        // Persist + upgrade URL to include the token.
        const t = await savePlan({ inputs: cached, outputs: calc });
        if (!cancelled && t) {
          setShareToken(t);
          navigate(`/build-my-plan/results/${t}`, { replace: true });
        } else if (!cancelled) {
          // Try previously stored token from localStorage as last resort.
          const existing = getStoredShareToken();
          if (existing) setShareToken(existing);
        }
        return;
      }

      // 3. Nothing → wizard.
      navigate('/build-my-plan');
    };

    hydrate();
    return () => { cancelled = true; };
  }, [navigate, tokenParam]);

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

  const resultContent = (
    <>
      {/* Personalized banner */}
      <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent p-5 md:p-6 mb-6 card-glow">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 left-0 h-full w-1 bg-gradient-to-b from-primary via-primary/60 to-transparent" />
        <div className="relative flex items-start justify-between flex-wrap gap-4">
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1.5">8-Week Personalized Plan</p>
            <h1 className="text-2xl md:text-3xl font-bold font-['Oswald'] tracking-wider leading-tight">
              YOUR <span className="text-primary text-glow">{plan.goalLabel.toUpperCase()}</span> SYSTEM
            </h1>
            <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
              {inputs.age}yo {inputs.sex} • {inputs.weightKg}kg • {inputs.bodyFatPercent}% BF • {plan.leanBodyMass}kg LBM • {inputs.equipmentAccess} • {inputs.dietStyle}
              <span className="block mt-0.5 opacity-70">Generated {today}</span>
            </p>
          </div>
          <div className="flex gap-2 no-print" data-no-print>
            <PrintButton plan={plan} inputs={inputs} />
            <ShareDialog goalLabel={plan.goalLabel} plan={plan} inputs={inputs} />
          </div>
        </div>
      </div>

      <InlineEmailCapture
        goalLabel={plan.goalLabel}
        calorieTarget={plan.calorieTarget}
        proteinGrams={plan.proteinGrams}
        workoutFrequency={inputs.workoutFrequency}
      />

      <TodayPanel plan={plan} inputs={inputs} contextLinks={contextLinks} />

      {isMobile ? (
        <Accordion type="single" collapsible defaultValue="numbers" className="space-y-2">
          {[
            { v: 'numbers', label: 'YOUR NUMBERS', Icon: Calculator, content: <NumbersTab plan={plan} inputs={inputs} /> },
            { v: 'training', label: 'TRAINING PLAN', Icon: Dumbbell, content: <TrainingTab plan={plan} /> },
            { v: 'recovery', label: 'CARDIO & RECOVERY', Icon: HeartPulse, content: <RecoveryTab plan={plan} checkedHabits={checkedHabits} toggleHabit={toggleHabit} /> },
            { v: 'science', label: 'SCIENCE & NEXT STEPS', Icon: FlaskConical, content: <ScienceTab plan={plan} inputs={inputs} contextLinks={contextLinks} setInputs={setInputs} setPlan={setPlan} /> },
          ].map(({ v, label, Icon, content }) => (
            <AccordionItem key={v} value={v} className="stat-card !p-0 overflow-hidden border-border data-[state=open]:border-primary/30">
              <AccordionTrigger className="px-4 py-3.5 hover:no-underline font-['Oswald'] text-sm tracking-wider gap-3">
                <span className="flex items-center gap-2.5">
                  <span className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="h-3.5 w-3.5 text-primary" />
                  </span>
                  {label}
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">{content}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <Tabs defaultValue="numbers" className="w-full">
          <TabsList className="w-full bg-secondary/30 border border-border/50 h-12 p-1 rounded-xl backdrop-blur">
            {[
              { v: 'numbers', label: 'NUMBERS', Icon: Calculator },
              { v: 'training', label: 'TRAINING', Icon: Dumbbell },
              { v: 'recovery', label: 'RECOVERY', Icon: HeartPulse },
              { v: 'science', label: 'SCIENCE', Icon: FlaskConical },
            ].map(({ v, label, Icon }) => (
              <TabsTrigger
                key={v}
                value={v}
                className="flex-1 gap-2 rounded-lg data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary/20 data-[state=active]:to-primary/5 data-[state=active]:text-primary data-[state=active]:shadow-md data-[state=active]:shadow-primary/10 font-['Oswald'] text-xs tracking-wider transition-all"
              >
                <Icon className="h-3.5 w-3.5" /> {label}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value="numbers" className="mt-4"><NumbersTab plan={plan} inputs={inputs} /></TabsContent>
          <TabsContent value="training" className="mt-4"><TrainingTab plan={plan} /></TabsContent>
          <TabsContent value="recovery" className="mt-4"><RecoveryTab plan={plan} checkedHabits={checkedHabits} toggleHabit={toggleHabit} /></TabsContent>
          <TabsContent value="science" className="mt-4"><ScienceTab plan={plan} inputs={inputs} contextLinks={contextLinks} setInputs={setInputs} setPlan={setPlan} /></TabsContent>
        </Tabs>
      )}
    </>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title={`Your ${plan.goalLabel} Plan — ${plan.calorieTarget} cal/day | GearUpToFit Body Recomp OS`}
        description={plan.quickSummary.slice(0, 155)}
        path="/build-my-plan/results"
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

      <EmailGate
        open={emailGateOpen}
        onClose={() => setEmailGateOpen(false)}
        onUnlock={() => setEmailGateOpen(false)}
        goalLabel={plan.goalLabel}
        calorieTarget={plan.calorieTarget}
        proteinGrams={plan.proteinGrams}
        workoutFrequency={inputs.workoutFrequency}
        source="plan_gate"
      />

      <Footer />
    </div>
  );
};

export default Results;
