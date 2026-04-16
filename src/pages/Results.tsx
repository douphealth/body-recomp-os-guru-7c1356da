import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
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
import { useIsMobile } from '@/hooks/use-mobile';
import { calculatePlan, getContextualLinks, type UserInputs, type PlanResults } from '@/lib/calculations';
import { trackResultView } from '@/lib/tracking';

const Results = () => {
  const [plan, setPlan] = useState<PlanResults | null>(null);
  const [inputs, setInputs] = useState<UserInputs | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkedHabits, setCheckedHabits] = useState<Set<number>>(new Set());
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    const stored = sessionStorage.getItem('recomp-inputs');
    if (!stored) { navigate('/build-my-plan'); return; }
    try {
      const parsed = JSON.parse(stored) as UserInputs;
      setInputs(parsed);
      setPlan(calculatePlan(parsed));
      trackResultView(parsed.goal);
    } catch {
      navigate('/build-my-plan');
    }
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
            <AccordionContent className="px-4 pb-4"><NumbersTab plan={plan} inputs={inputs} /></AccordionContent>
          </AccordionItem>
          <AccordionItem value="training" className="stat-card !p-0 overflow-hidden border-border">
            <AccordionTrigger className="px-4 py-3 hover:no-underline font-['Oswald'] text-sm tracking-wider">TRAINING PLAN</AccordionTrigger>
            <AccordionContent className="px-4 pb-4"><TrainingTab plan={plan} /></AccordionContent>
          </AccordionItem>
          <AccordionItem value="recovery" className="stat-card !p-0 overflow-hidden border-border">
            <AccordionTrigger className="px-4 py-3 hover:no-underline font-['Oswald'] text-sm tracking-wider">CARDIO & RECOVERY</AccordionTrigger>
            <AccordionContent className="px-4 pb-4"><RecoveryTab plan={plan} checkedHabits={checkedHabits} toggleHabit={toggleHabit} /></AccordionContent>
          </AccordionItem>
          <AccordionItem value="science" className="stat-card !p-0 overflow-hidden border-border">
            <AccordionTrigger className="px-4 py-3 hover:no-underline font-['Oswald'] text-sm tracking-wider">SCIENCE & NEXT STEPS</AccordionTrigger>
            <AccordionContent className="px-4 pb-4"><ScienceTab plan={plan} inputs={inputs} contextLinks={contextLinks} setInputs={setInputs} setPlan={setPlan} /></AccordionContent>
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

      <Footer />
    </div>
  );
};

export default Results;
