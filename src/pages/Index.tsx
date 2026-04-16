import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Flame, Target, Dumbbell, Heart, Brain, ArrowRight, CheckCircle, ExternalLink, Zap, TrendingUp, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import JsonLd from '@/components/JsonLd';
import { trackCTAClick, trackInternalLinkClick } from '@/lib/tracking';
import heroImg from '@/assets/hero-gym.jpg';
import nutritionImg from '@/assets/nutrition-hero.jpg';
import cardioImg from '@/assets/cardio-hero.jpg';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const features = [
  { icon: Flame, label: 'Calorie Target', desc: 'Precise TDEE via Mifflin-St Jeor', gradient: 'from-red-500/20 to-orange-500/10' },
  { icon: Target, label: 'Macro Split', desc: 'Goal-specific protein, carbs & fat', gradient: 'from-orange-500/20 to-amber-500/10' },
  { icon: Dumbbell, label: '8-Week Plan', desc: 'Periodized training for your gear', gradient: 'from-amber-500/20 to-yellow-500/10' },
  { icon: Heart, label: 'Cardio & Recovery', desc: 'Personalized cardio + sleep protocols', gradient: 'from-rose-500/20 to-pink-500/10' },
  { icon: Brain, label: 'Habit System', desc: 'Week-by-week behavior stacking', gradient: 'from-purple-500/20 to-indigo-500/10' },
];

const stats = [
  { value: '2 min', label: 'To Build Your Plan' },
  { value: '100%', label: 'Free Forever' },
  { value: '8 wk', label: 'Periodized Program' },
  { value: '5+', label: 'Plan Components' },
];

const planIncludes = [
  { text: 'Personalized daily calorie target based on your body composition', icon: Flame },
  { text: 'Optimal protein intake calculated from lean body mass', icon: Target },
  { text: 'Custom training split for your equipment and schedule', icon: Dumbbell },
  { text: 'Progressive 8-week periodization with deload phases', icon: TrendingUp },
  { text: 'Cardio plan tailored to your goals and running interest', icon: Zap },
  { text: 'Recovery protocols with sleep, hydration, and mobility', icon: Heart },
  { text: 'Week-by-week habit stacking for lasting behavior change', icon: Brain },
  { text: 'Curated article recommendations from GearUpToFit.com', icon: ExternalLink },
];

const Index = () => {
  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'GearUpToFit Body Recomp OS',
    description: 'Free body recomposition planner — get personalized calories, macros, workouts, recovery, and habit plans in one place.',
    url: 'https://app.gearuptofit.com',
    applicationCategory: 'HealthApplication',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    author: { '@type': 'Organization', name: 'GearUpToFit', url: 'https://gearuptofit.com' },
  };

  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'GearUpToFit',
    url: 'https://gearuptofit.com',
    sameAs: ['https://twitter.com/GearUpToFit'],
  };

  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Body Recomp OS',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    description: 'Free 8-week body recomposition planner with personalized calories, macros, training, cardio, recovery, and habit plans.',
    author: { '@type': 'Organization', name: 'GearUpToFit', url: 'https://gearuptofit.com' },
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title="Body Recomp OS — Free 8-Week Fitness Planner | GearUpToFit"
        description="Get your personalized calorie targets, macro split, 8-week training plan, cardio guidance, and recovery checklist — all in one free tool from GearUpToFit."
        path="/"
      />
      <JsonLd data={webAppSchema} />
      <JsonLd data={orgSchema} />
      <JsonLd data={softwareSchema} />
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative min-h-[90vh] md:min-h-[85vh] flex items-center overflow-hidden">
          {/* Background image */}
          <div className="absolute inset-0">
            <img src={heroImg} alt="" className="w-full h-full object-cover" width={1920} height={1080} />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/60" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/40" />
          </div>

          <div className="container relative z-10 py-16 md:py-24">
            <div className="max-w-2xl">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full glass glass-border"
              >
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">Free • No Credit Card • Instant Results</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] mb-6"
              >
                BUILD YOUR<br />
                <span className="text-primary text-glow">8-WEEK FITNESS</span><br />
                <span className="text-primary text-glow">PLAN</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-base sm:text-lg text-muted-foreground mb-8 leading-relaxed max-w-lg"
              >
                Get your calories, macros, workouts, cardio, recovery, and habit plan — personalized to your body, goals, and equipment in under 3 minutes.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <Link to="/build-my-plan" onClick={() => trackCTAClick('hero_cta', 'homepage')}>
                  <Button size="lg" className="gradient-red border-0 text-base sm:text-lg px-8 sm:px-10 py-6 font-bold tracking-wide shadow-lg shadow-primary/25 hover:shadow-primary/50 transition-all duration-300 hover:scale-[1.02] w-full sm:w-auto">
                    Build My Plan <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <a href="#features" className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors py-3">
                  See what's included ↓
                </a>
              </motion.div>
            </div>
          </div>

          {/* Floating stat pills */}
          <div className="hidden lg:block absolute right-[8%] top-1/2 -translate-y-1/2 space-y-4">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1, duration: 0.4 }}
                className="glass glass-border rounded-xl px-5 py-3 text-center min-w-[140px]"
                style={{ animation: `float 4s ease-in-out infinite`, animationDelay: `${i * 0.5}s` }}
              >
                <p className="text-2xl font-bold text-primary font-['Oswald']">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Mobile Stats */}
        <section className="lg:hidden py-8 border-b border-border">
          <div className="container">
            <div className="grid grid-cols-4 gap-3">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-xl font-bold text-primary font-['Oswald']">{stat.value}</p>
                  <p className="text-[9px] text-muted-foreground uppercase tracking-wider mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-20 md:py-28">
          <div className="container">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              className="text-center mb-14"
            >
              <motion.p variants={fadeUp} custom={0} className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">
                Complete System
              </motion.p>
              <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-4xl font-bold">
                EVERYTHING IN <span className="text-primary">ONE PLAN</span>
              </motion.h2>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              className="grid grid-cols-2 md:grid-cols-5 gap-4"
            >
              {features.map((f, i) => (
                <motion.div
                  key={f.label}
                  variants={fadeUp}
                  custom={i}
                  className="stat-card group text-center"
                >
                  <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <f.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-sm font-bold mb-1.5">{f.label}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Visual Showcase */}
        <section className="py-20 md:py-28 relative overflow-hidden">
          <div className="absolute inset-0 hero-gradient opacity-50" />
          <div className="container relative">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              className="grid md:grid-cols-2 gap-8 items-center mb-20"
            >
              <motion.div variants={fadeUp} custom={0}>
                <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">Precision Nutrition</p>
                <h2 className="text-3xl md:text-4xl font-bold mb-5">
                  CALORIES & MACROS <span className="text-primary">TAILORED TO YOU</span>
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Using the Mifflin-St Jeor equation with your exact body composition, we calculate your TDEE and create a precise calorie target with optimal protein, carb, and fat distribution for your specific goal.
                </p>
                <div className="space-y-3">
                  {['TDEE calculated from your exact stats', 'Protein based on lean body mass', 'Diet-style aware (keto, high-protein, vegetarian)'].map(item => (
                    <div key={item} className="flex items-center gap-3">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <p className="text-sm text-foreground/80">{item}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
              <motion.div variants={fadeUp} custom={1} className="relative">
                <div className="rounded-2xl overflow-hidden border border-border shadow-2xl shadow-background/80">
                  <img src={nutritionImg} alt="Precision meal prep for body recomposition" loading="lazy" className="w-full h-64 md:h-80 object-cover" width={1280} height={720} />
                </div>
                <div className="absolute -bottom-4 -left-4 glass glass-border rounded-xl p-4 shadow-xl">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Example Target</p>
                  <p className="text-2xl font-bold text-primary font-['Oswald']">2,340 cal</p>
                  <p className="text-xs text-muted-foreground">185g P • 220g C • 78g F</p>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              className="grid md:grid-cols-2 gap-8 items-center"
            >
              <motion.div variants={fadeUp} custom={0} className="relative order-2 md:order-1">
                <div className="rounded-2xl overflow-hidden border border-border shadow-2xl shadow-background/80">
                  <img src={cardioImg} alt="Running and cardio training" loading="lazy" className="w-full h-64 md:h-80 object-cover" width={1280} height={720} />
                </div>
                <div className="absolute -bottom-4 -right-4 glass glass-border rounded-xl p-4 shadow-xl">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">8-Week Phases</p>
                  <div className="flex gap-1.5">
                    {['Foundation', 'Build', 'Peak', 'Deload'].map((phase, i) => (
                      <span key={phase} className={`text-[9px] px-2 py-1 rounded-md font-medium ${i === 2 ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground'}`}>{phase}</span>
                    ))}
                  </div>
                </div>
              </motion.div>
              <motion.div variants={fadeUp} custom={1} className="order-1 md:order-2">
                <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">Progressive Training</p>
                <h2 className="text-3xl md:text-4xl font-bold mb-5">
                  WORKOUTS THAT <span className="text-primary">EVOLVE WITH YOU</span>
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Your 8-week training plan automatically adapts to your equipment access, workout frequency, and fitness goal — with built-in periodization and deload phases to prevent plateaus.
                </p>
                <div className="space-y-3">
                  {['Adapts to gym, home, or bodyweight', 'Progressive overload built in', 'Smart deload in weeks 7-8'].map(item => (
                    <div key={item} className="flex items-center gap-3">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <p className="text-sm text-foreground/80">{item}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* What's Included */}
        <section className="py-20 md:py-28">
          <div className="container max-w-3xl">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              className="text-center mb-12"
            >
              <motion.p variants={fadeUp} custom={0} className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">
                Full Breakdown
              </motion.p>
              <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-4xl font-bold">
                WHAT YOUR <span className="text-primary">PLAN INCLUDES</span>
              </motion.h2>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              className="space-y-3"
            >
              {planIncludes.map((item, i) => (
                <motion.div
                  key={item.text}
                  variants={fadeUp}
                  custom={i}
                  className="flex items-center gap-4 p-4 rounded-xl bg-card/50 border border-border/50 hover:border-primary/20 hover:bg-card transition-all duration-300 group"
                >
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/15 transition-colors">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-sm text-foreground/90">{item.text}</p>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="mt-12 text-center"
            >
              <Link to="/build-my-plan" onClick={() => trackCTAClick('included_cta', 'homepage')}>
                <Button size="lg" className="gradient-red border-0 font-bold px-10 py-6 text-base shadow-lg shadow-primary/25 hover:shadow-primary/50 transition-all duration-300 hover:scale-[1.02]">
                  Get My Free Plan <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Trust / E-E-A-T */}
        <section className="py-20 md:py-28 relative overflow-hidden">
          <div className="absolute inset-0 hero-gradient opacity-30" />
          <div className="container max-w-2xl text-center relative">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
            >
              <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full glass glass-border">
                <Shield className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Trusted Resource</span>
              </motion.div>
              <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-4xl font-bold mb-5">
                BACKED BY <span className="text-primary">GEARUPTOFIT</span>
              </motion.h2>
              <motion.p variants={fadeUp} custom={2} className="text-muted-foreground mb-8 leading-relaxed">
                Body Recomp OS is built by the team behind GearUpToFit.com — a trusted resource for training plans, workout routines, and sustainable weight-loss strategies.
              </motion.p>
              <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row gap-3 justify-center">
                <a href="https://gearuptofit.com/about-us/" target="_blank" rel="noopener noreferrer" onClick={() => trackInternalLinkClick('https://gearuptofit.com/about-us/', 'trust_section')}>
                  <Button variant="outline" className="gap-2 border-border/60 hover:border-primary/40 hover:bg-primary/5 transition-all duration-300">
                    About GearUpToFit <ExternalLink className="h-4 w-4" />
                  </Button>
                </a>
                <a href="https://gearuptofit.com/" target="_blank" rel="noopener noreferrer" onClick={() => trackInternalLinkClick('https://gearuptofit.com/', 'trust_section')}>
                  <Button variant="outline" className="gap-2 border-border/60 hover:border-primary/40 hover:bg-primary/5 transition-all duration-300">
                    Explore Our Content <ExternalLink className="h-4 w-4" />
                  </Button>
                </a>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Popular Plans */}
        <section className="py-20 md:py-28">
          <div className="container">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              className="text-center mb-12"
            >
              <motion.p variants={fadeUp} custom={0} className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">
                Ready-Made Templates
              </motion.p>
              <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-4xl font-bold">
                POPULAR <span className="text-primary">PLANS</span>
              </motion.h2>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              className="grid md:grid-cols-3 gap-5"
            >
              {[
                { path: '/plans/fat-loss-beginner-home-standard', title: 'Fat Loss — Beginner Home Workouts', desc: 'Lose fat at home with no gym needed. Perfect for beginners starting their fitness journey.', icon: '🏠' },
                { path: '/plans/fat-loss-intermediate-gym-standard', title: 'Runner Cut Plan', desc: 'Combine running with calorie control for a lean, athletic physique. Includes shoe recommendations.', icon: '🏃' },
                { path: '/plans/lean-muscle-intermediate-gym-high-protein', title: 'Lean Muscle — High Protein', desc: 'Build lean muscle with an optimized high-protein nutrition and progressive overload plan.', icon: '💪' },
              ].map((p, i) => (
                <motion.div key={p.path} variants={fadeUp} custom={i}>
                  <Link to={p.path} className="block group">
                    <div className="stat-card h-full">
                      <span className="text-3xl mb-4 block">{p.icon}</span>
                      <h3 className="text-lg font-bold mb-2 text-primary group-hover:text-glow transition-all">{p.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{p.desc}</p>
                      <p className="text-xs text-primary font-semibold flex items-center gap-1.5 group-hover:gap-3 transition-all duration-300">
                        View Plan <ArrowRight className="h-3 w-3" />
                      </p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 md:py-28 relative overflow-hidden">
          <div className="absolute inset-0 gradient-red-subtle" />
          <div className="container relative text-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <motion.h2 variants={fadeUp} custom={0} className="text-3xl md:text-5xl font-bold mb-5">
                READY TO <span className="text-primary text-glow">TRANSFORM?</span>
              </motion.h2>
              <motion.p variants={fadeUp} custom={1} className="text-muted-foreground mb-8 max-w-md mx-auto">
                Your personalized 8-week plan is just 3 steps away. No signup required to start.
              </motion.p>
              <motion.div variants={fadeUp} custom={2}>
                <Link to="/build-my-plan" onClick={() => trackCTAClick('final_cta', 'homepage')}>
                  <Button size="lg" className="gradient-red border-0 text-lg px-12 py-7 font-bold shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all duration-300 hover:scale-[1.03]" style={{ animation: 'pulse-glow 3s ease-in-out infinite' }}>
                    Build My Plan Now <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
