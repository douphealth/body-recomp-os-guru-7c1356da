import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import JsonLd from '@/components/JsonLd';
import QuickSummary from '@/components/results/QuickSummary';
import CalorieMacroCards from '@/components/results/CalorieMacroCards';
import TrainingPlan from '@/components/results/TrainingPlan';
import CardioPlan from '@/components/results/CardioPlan';
import RecoveryHabits from '@/components/results/RecoveryHabits';
import TopReads from '@/components/results/TopReads';
import { calculatePlan, getContextualLinks, type UserInputs, type PlanResults } from '@/lib/calculations';
import { trackResultView, trackInternalLinkClick } from '@/lib/tracking';

const Results = () => {
  const [plan, setPlan] = useState<PlanResults | null>(null);
  const [inputs, setInputs] = useState<UserInputs | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = sessionStorage.getItem('recomp-inputs');
    if (!stored) { navigate('/app/body-recomp'); return; }
    const parsed = JSON.parse(stored) as UserInputs;
    setInputs(parsed);
    setPlan(calculatePlan(parsed));
    trackResultView(parsed.goal);
  }, [navigate]);

  if (!plan || !inputs) return null;

  const contextLinks = getContextualLinks(inputs);

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      { '@type': 'Question', name: `How many calories should I eat for ${plan.goalLabel.toLowerCase()}?`, acceptedAnswer: { '@type': 'Answer', text: `Based on your profile, your target is ${plan.calorieTarget} calories per day with ${plan.proteinGrams}g of protein.` } },
      { '@type': 'Question', name: 'How is my calorie target calculated?', acceptedAnswer: { '@type': 'Answer', text: 'We use the Mifflin-St Jeor equation to calculate your BMR, then multiply by an activity factor based on your workout frequency and daily step count.' } },
    ],
  };

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
          <QuickSummary plan={plan} />
          <CalorieMacroCards plan={plan} />
          <TrainingPlan trainingPlan={plan.trainingPlan} />
          <CardioPlan cardioPlan={plan.cardioPlan} />
          <RecoveryHabits plan={plan} inputs={inputs} />
          <TopReads links={contextLinks} />

          {/* CTA */}
          <div className="text-center space-y-3">
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
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Results;
