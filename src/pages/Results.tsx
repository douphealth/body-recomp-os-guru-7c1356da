import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Flame, Target, Dumbbell, Heart, Brain, Calendar, ArrowRight, ExternalLink, ChevronDown, ChevronUp, Footprints } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import JsonLd from '@/components/JsonLd';
import { calculatePlan, getContextualLinks, type UserInputs, type PlanResults } from '@/lib/calculations';
import { trackResultView, trackInternalLinkClick } from '@/lib/tracking';

const Results = () => {
  const [plan, setPlan] = useState<PlanResults | null>(null);
  const [inputs, setInputs] = useState<UserInputs | null>(null);
  const [expandedWeek, setExpandedWeek] = useState<number>(0);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = sessionStorage.getItem('recomp-inputs');
    if (!stored) {
      navigate('/app/body-recomp');
      return;
    }
    const parsed = JSON.parse(stored) as UserInputs;
    setInputs(parsed);
    const result = calculatePlan(parsed);
    setPlan(result);
    trackResultView(parsed.goal);
  }, [navigate]);

  if (!plan || !inputs) return null;

  const contextLinks = getContextualLinks(inputs);

  const todayArticles = [
    { url: 'https://gearuptofit.com/', title: 'Explore GearUpToFit', desc: 'Training plans, workouts, and weight-loss guides' },
  ];
  if (inputs.runningInterest) {
    todayArticles.push({ url: 'https://gearuptofit.com/running/how-to-choose-the-right-running-shoes/', title: 'Choose Your Running Shoes', desc: 'Find the perfect shoes for your running plan' });
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      { '@type': 'Question', name: `How many calories should I eat for ${plan.goalLabel.toLowerCase()}?`, acceptedAnswer: { '@type': 'Answer', text: `Based on your profile, your target is ${plan.calorieTarget} calories per day with ${plan.proteinGrams}g of protein.` } },
      { '@type': 'Question', name: 'How is my calorie target calculated?', acceptedAnswer: { '@type': 'Answer', text: 'We use the Mifflin-St Jeor equation to calculate your Basal Metabolic Rate (BMR), then multiply by an activity factor based on your workout frequency and daily step count.' } },
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
          {/* Quick Answer */}
          <Card className="bg-primary/5 border-primary/30 mb-8 card-glow">
            <CardContent className="p-6">
              <h1 className="text-2xl md:text-3xl font-bold mb-3">
                YOUR <span className="text-primary">{plan.goalLabel.toUpperCase()}</span> PLAN
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed">{plan.quickSummary}</p>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {/* Calories */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Flame className="h-5 w-5 text-primary" /> CALORIE TARGET
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-primary">{plan.calorieTarget}</div>
                <p className="text-xs text-muted-foreground">calories per day</p>
                <div className="mt-3 text-xs space-y-1 text-muted-foreground">
                  <p>TDEE: {plan.tdee} cal/day</p>
                  <p>Lean Body Mass: {plan.leanBodyMass} kg</p>
                  {plan.weeklyCalorieRange && (
                    <p>Recomp cycling: {plan.weeklyCalorieRange.low}–{plan.weeklyCalorieRange.high} cal</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Macros */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" /> MACRO SPLIT
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <MacroBar label="Protein" grams={plan.proteinGrams} percent={plan.proteinPercent} color="bg-red-500" />
                  <MacroBar label="Carbs" grams={plan.carbGrams} percent={plan.carbPercent} color="bg-orange-500" />
                  <MacroBar label="Fat" grams={plan.fatGrams} percent={plan.fatPercent} color="bg-yellow-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Training */}
          <Card className="bg-card border-border mb-4">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Dumbbell className="h-5 w-5 text-primary" /> 8-WEEK TRAINING PLAN
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {plan.trainingPlan.map((week, i) => (
                <div key={i} className="border border-border rounded-lg overflow-hidden">
                  <button
                    className="w-full flex items-center justify-between p-4 hover:bg-secondary/30 transition-colors text-left"
                    onClick={() => setExpandedWeek(expandedWeek === i ? -1 : i)}
                  >
                    <div>
                      <span className="text-sm font-bold">{week.weekRange}</span>
                      <span className="text-xs text-muted-foreground ml-2">— {week.phase}</span>
                      {week.deload && <span className="ml-2 text-xs text-primary font-semibold">DELOAD</span>}
                    </div>
                    {expandedWeek === i ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                  {expandedWeek === i && (
                    <div className="p-4 pt-0 space-y-4">
                      {week.days.map((day) => (
                        <div key={day.day} className="bg-secondary/20 rounded-lg p-3">
                          <p className="text-sm font-bold text-primary mb-2">{day.day} — {day.focus}</p>
                          <div className="space-y-1">
                            {day.exercises.map((ex, j) => (
                              <div key={j} className="flex justify-between text-xs text-muted-foreground">
                                <span>{ex.name}</span>
                                <span className="shrink-0 ml-2">{ex.sets}×{ex.reps}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Cardio */}
          <Card className="bg-card border-border mb-4">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Footprints className="h-5 w-5 text-primary" /> CARDIO PLAN
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="bg-secondary/30 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Type</p>
                  <p className="text-sm font-semibold">{plan.cardioPlan.type}</p>
                </div>
                <div className="bg-secondary/30 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Sessions/Week</p>
                  <p className="text-sm font-semibold">{plan.cardioPlan.sessionsPerWeek}</p>
                </div>
                <div className="bg-secondary/30 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Duration</p>
                  <p className="text-sm font-semibold">{plan.cardioPlan.duration}</p>
                </div>
                <div className="bg-secondary/30 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Intensity</p>
                  <p className="text-sm font-semibold">{plan.cardioPlan.intensity}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{plan.cardioPlan.notes}</p>
              {plan.cardioPlan.runningPlan && (
                <div className="mt-3 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                  <p className="text-xs font-semibold text-primary mb-1">🏃 Running Progression</p>
                  <p className="text-xs text-muted-foreground">{plan.cardioPlan.runningPlan}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            {/* Recovery */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Heart className="h-5 w-5 text-primary" /> RECOVERY
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {plan.recoveryChecklist.map((item, i) => (
                    <li key={i} className="text-xs text-muted-foreground">{item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Today / This Week / Next Read */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" /> TODAY & THIS WEEK
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-primary mb-2">📋 TODAY</p>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    <li>• Eat {plan.calorieTarget} cal with {plan.proteinGrams}g protein</li>
                    <li>• Complete Day 1 workout</li>
                    <li>• Hit your step count target</li>
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold text-primary mb-2">📅 THIS WEEK</p>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    <li>• {plan.habitPlan[0].habits[0]}</li>
                    <li>• {plan.habitPlan[0].habits[1]}</li>
                    <li>• {plan.habitPlan[0].habits[2]}</li>
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold text-primary mb-2">📖 NEXT BEST READS</p>
                  {todayArticles.map((a) => (
                    <a
                      key={a.url}
                      href={a.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackInternalLinkClick(a.url, 'today_panel')}
                      className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors py-1"
                    >
                      <ExternalLink className="h-3 w-3 shrink-0" />
                      {a.title}
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Habit Plan */}
          <Card className="bg-card border-border mb-4">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" /> 8-WEEK HABIT PLAN
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {plan.habitPlan.map((week) => (
                  <div key={week.week} className="bg-secondary/20 rounded-lg p-3">
                    <p className="text-xs font-bold text-primary mb-1">Week {week.week}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">{week.focus}</p>
                    <ul className="space-y-1">
                      {week.habits.map((h, i) => (
                        <li key={i} className="text-[11px] text-muted-foreground">• {h}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top 3 Next Reads */}
          <Card className="bg-card border-border mb-8">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ArrowRight className="h-5 w-5 text-primary" /> TOP READS FOR YOU
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {contextLinks.map((link) => (
                  <a
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackInternalLinkClick(link.url, 'top_reads')}
                    className="block p-3 bg-secondary/20 rounded-lg hover:bg-secondary/40 transition-colors"
                  >
                    <p className="text-sm font-semibold text-primary flex items-center gap-2">
                      {link.title} <ExternalLink className="h-3 w-3" />
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{link.description}</p>
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <div className="text-center">
            <Link to="/app/body-recomp">
              <Button variant="outline" className="mr-3">Adjust My Plan</Button>
            </Link>
            <a href="https://gearuptofit.com/" target="_blank" rel="noopener noreferrer" onClick={() => trackInternalLinkClick('https://gearuptofit.com/', 'results_cta')}>
              <Button className="gradient-red border-0 font-semibold">
                Explore GearUpToFit <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

const MacroBar = ({ label, grams, percent, color }: { label: string; grams: number; percent: number; color: string }) => (
  <div>
    <div className="flex justify-between text-xs mb-1">
      <span className="font-semibold">{label}</span>
      <span className="text-muted-foreground">{grams}g ({percent}%)</span>
    </div>
    <div className="h-2 bg-secondary rounded-full overflow-hidden">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${percent}%` }} />
    </div>
  </div>
);

export default Results;
