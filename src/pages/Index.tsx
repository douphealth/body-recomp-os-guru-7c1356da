import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Flame, Target, Dumbbell, Heart, Brain, ArrowRight, CheckCircle, ExternalLink } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import JsonLd from '@/components/JsonLd';
import { trackCTAClick, trackInternalLinkClick } from '@/lib/tracking';

const features = [
  { icon: Flame, label: 'Calorie Target', desc: 'Precise TDEE calculation using the Mifflin-St Jeor equation' },
  { icon: Target, label: 'Macro Split', desc: 'Goal-specific protein, carb, and fat distribution' },
  { icon: Dumbbell, label: '8-Week Plan', desc: 'Phased training program matched to your equipment and schedule' },
  { icon: Heart, label: 'Cardio Plan', desc: 'Personalized cardio based on your step count and running interest' },
  { icon: Brain, label: 'Recovery & Habits', desc: 'Science-backed recovery protocols and habit formation system' },
];

const planIncludes = [
  'Personalized daily calorie target based on your body composition',
  'Optimal protein intake calculated from lean body mass',
  'Custom training split for your equipment and schedule',
  'Progressive 8-week periodization (foundation → build → peak → deload)',
  'Cardio plan tailored to your goals and running interest',
  'Recovery checklist with sleep, hydration, and mobility guidance',
  'Week-by-week habit stacking for lasting behavior change',
  'Curated article recommendations from GearUpToFit.com',
];

const Index = () => {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'GearUpToFit Body Recomp OS',
    description: 'Free body recomposition planner — get personalized calories, macros, workouts, recovery, and habit plans in one place.',
    url: 'https://app.gearuptofit.com',
    applicationCategory: 'HealthApplication',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    author: { '@type': 'Organization', name: 'GearUpToFit', url: 'https://gearuptofit.com' },
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title="Body Recomp OS — Free 8-Week Fitness Planner | GearUpToFit"
        description="Get your personalized calorie targets, macro split, 8-week training plan, cardio guidance, and recovery checklist — all in one free tool from GearUpToFit."
        path="/"
      />
      <JsonLd data={jsonLd} />
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative py-16 md:py-28 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
          <div className="container relative text-center">
            <div className="inline-block mb-4 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10">
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Free • No Credit Card Required</span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.1] mb-6 text-glow">
              BUILD YOUR<br />
              <span className="text-primary">8-WEEK FITNESS PLAN</span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground mb-8 font-light leading-relaxed">
              Get your calories, macros, workouts, cardio, recovery, and habit plan — personalized to your body, goals, and equipment in under 3 minutes.
            </p>
            <Link to="/app/body-recomp" onClick={() => trackCTAClick('hero_cta', 'homepage')}>
              <Button size="lg" className="gradient-red border-0 text-lg px-10 py-6 font-bold tracking-wide shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow">
                Build My Plan <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <p className="mt-4 text-xs text-muted-foreground">Takes about 2 minutes • Formula-based • 100% free</p>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 border-t border-border">
          <div className="container">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
              EVERYTHING IN <span className="text-primary">ONE PLAN</span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {features.map((f) => (
                <Card key={f.label} className="bg-card border-border hover:border-primary/40 transition-colors card-glow">
                  <CardContent className="p-5 text-center">
                    <f.icon className="h-8 w-8 text-primary mx-auto mb-3" />
                    <h3 className="text-sm font-bold mb-1">{f.label}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* What's Included */}
        <section className="py-16 bg-card/30">
          <div className="container max-w-3xl">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
              WHAT YOUR <span className="text-primary">PLAN INCLUDES</span>
            </h2>
            <div className="space-y-3">
              {planIncludes.map((item) => (
                <div key={item} className="flex items-start gap-3 p-3 rounded-lg bg-background/50">
                  <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <p className="text-sm text-foreground/90">{item}</p>
                </div>
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link to="/app/body-recomp" onClick={() => trackCTAClick('included_cta', 'homepage')}>
                <Button size="lg" className="gradient-red border-0 font-bold px-8">
                  Get My Free Plan <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Trust / E-E-A-T */}
        <section className="py-16 border-t border-border">
          <div className="container max-w-2xl text-center">
            <h2 className="text-2xl font-bold mb-4">
              BACKED BY <span className="text-primary">GEARUPTOFIT</span>
            </h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Body Recomp OS is built by the team behind GearUpToFit.com — a trusted resource for training plans, workout routines, and sustainable weight-loss strategies.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="https://gearuptofit.com/about-us/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackInternalLinkClick('https://gearuptofit.com/about-us/', 'trust_section')}
              >
                <Button variant="outline" className="gap-2">
                  About GearUpToFit <ExternalLink className="h-4 w-4" />
                </Button>
              </a>
              <a
                href="https://gearuptofit.com/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackInternalLinkClick('https://gearuptofit.com/', 'trust_section')}
              >
                <Button variant="outline" className="gap-2">
                  Explore Our Content <ExternalLink className="h-4 w-4" />
                </Button>
              </a>
            </div>
          </div>
        </section>

        {/* SEO Template Pages */}
        <section className="py-16 bg-card/30">
          <div className="container">
            <h2 className="text-2xl font-bold text-center mb-8">
              POPULAR <span className="text-primary">PLANS</span>
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { path: '/app/body-recomp/fat-loss-beginner-home-workouts', title: 'Fat Loss — Beginner Home Workouts', desc: 'Lose fat at home with no gym needed. Perfect for beginners.' },
                { path: '/app/body-recomp/runner-cut-plan', title: 'Runner Cut Plan', desc: 'Combine running with calorie control for a lean, athletic physique.' },
                { path: '/app/body-recomp/lean-muscle-high-protein', title: 'Lean Muscle — High Protein', desc: 'Build lean muscle with an optimized high-protein nutrition plan.' },
              ].map((p) => (
                <Link key={p.path} to={p.path}>
                  <Card className="bg-card border-border hover:border-primary/40 transition-all h-full">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-bold mb-2 text-primary">{p.title}</h3>
                      <p className="text-sm text-muted-foreground">{p.desc}</p>
                      <p className="text-xs text-primary mt-3 font-semibold flex items-center gap-1">
                        View Plan <ArrowRight className="h-3 w-3" />
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
