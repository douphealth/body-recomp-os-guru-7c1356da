import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import JsonLd from '@/components/JsonLd';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { ArrowRight, ExternalLink, CheckCircle } from 'lucide-react';
import { trackCTAClick, trackInternalLinkClick } from '@/lib/tracking';

interface TemplatePageProps {
  slug: string;
  title: string;
  metaTitle: string;
  metaDesc: string;
  heroSubtitle: string;
  quickAnswer: string;
  highlights: string[];
  faqs: { q: string; a: string }[];
  relatedLinks: { url: string; title: string; desc: string }[];
}

const pages: Record<string, TemplatePageProps> = {
  'fat-loss-beginner-home-workouts': {
    slug: 'fat-loss-beginner-home-workouts',
    title: 'Fat Loss Plan — Beginner Home Workouts',
    metaTitle: 'Fat Loss Beginner Home Workouts — Free 8-Week Plan | GearUpToFit',
    metaDesc: 'Lose body fat at home with zero equipment. This free 8-week plan includes calorie targets, bodyweight workouts, cardio, and habit formation for beginners.',
    heroSubtitle: 'Lose body fat at home with zero equipment needed',
    quickAnswer: 'A typical beginner on a home fat-loss plan should target a 20% calorie deficit from their TDEE (roughly 1,600–2,000 calories for most people), eat 2.0–2.2g of protein per kg of lean body mass, train 3–4 days per week with bodyweight exercises, and aim for 7,000+ daily steps. This plan phases over 8 weeks: foundation → build → peak → deload.',
    highlights: [
      'Calorie target set at a 20% deficit for sustainable fat loss',
      'High-protein macro split to preserve muscle mass',
      'Bodyweight-only exercises — no gym or equipment needed',
      'Progressive 8-week periodization with built-in deload',
      '3-4 workouts per week — perfect for busy beginners',
      'Daily step count targets and walking-based cardio',
      'Recovery checklist: sleep, hydration, stretching',
      'Week-by-week habit formation system',
    ],
    faqs: [
      { q: 'Can I lose fat with bodyweight exercises only?', a: 'Absolutely. Bodyweight exercises like push-ups, squats, lunges, and planks can create enough stimulus to preserve (and even build) muscle while you lose fat through a calorie deficit. The key is progressive overload — increasing reps, slowing tempo, or adding harder variations over time.' },
      { q: 'How much protein do I need for fat loss?', a: 'For fat loss while preserving muscle, aim for 2.0–2.2g of protein per kg of lean body mass. For example, if you weigh 80kg at 25% body fat, your lean mass is 60kg, so target 120–132g of protein daily.' },
      { q: 'How fast will I see results?', a: 'Most people notice visible changes in 3–4 weeks with consistent training and nutrition. Expect to lose 0.5–1% of body weight per week in a moderate deficit. Take progress photos and measurements — the scale alone doesn\'t tell the full story.' },
    ],
    relatedLinks: [
      { url: 'https://gearuptofit.com/', title: 'GearUpToFit — Workouts & Weight Loss', desc: 'Explore our full library of training and weight-loss content.' },
      { url: 'https://gearuptofit.com/about-us/', title: 'About GearUpToFit', desc: 'Learn about our evidence-based approach to fitness.' },
    ],
  },
  'runner-cut-plan': {
    slug: 'runner-cut-plan',
    title: 'Runner Cut Plan',
    metaTitle: 'Runner Cut Plan — Lose Fat While Running | GearUpToFit',
    metaDesc: 'Combine running with strategic calorie control for a lean, athletic physique. Free 8-week plan with progressive run program, calorie targets, and macro split.',
    heroSubtitle: 'Combine running with calorie control for a lean, athletic build',
    quickAnswer: 'A runner on a cut should target a moderate 15–20% calorie deficit, prioritize 2.0g/kg protein to protect muscle, run 3 times per week with a Couch-to-5K progression, and lift 3 days per week. This 8-week plan balances running volume with strength training and recovery to prevent overtraining.',
    highlights: [
      'Progressive running program built into your weekly plan',
      'Moderate calorie deficit to fuel running performance',
      'Running shoe guidance from GearUpToFit experts',
      'Strength training to preserve muscle while cutting',
      'Running-specific recovery: mobility, hydration, sleep',
      'Step count targets complement structured running',
      'Periodized 8-week plan with built-in deload week',
      'Nutrition timing around runs for optimal performance',
    ],
    faqs: [
      { q: 'Can I lose fat while training for running?', a: 'Yes — a moderate calorie deficit (15-20%) with adequate protein will support fat loss while maintaining running performance. Avoid aggressive cuts as they impair recovery and increase injury risk for runners.' },
      { q: 'What running shoes should I use?', a: 'Choosing the right running shoes depends on your foot type, running gait, and the surfaces you run on. Check out our comprehensive guide on choosing running shoes at GearUpToFit.' },
      { q: 'How do I balance running and strength training?', a: 'Separate hard running and heavy lifting days. On lifting days, do strength first if both are in the same session. Allow at least one full rest day per week, and schedule your deload week every 4th week.' },
    ],
    relatedLinks: [
      { url: 'https://gearuptofit.com/running/how-to-choose-the-right-running-shoes/', title: 'How to Choose Running Shoes', desc: 'Find the perfect shoes for your running plan.' },
      { url: 'https://gearuptofit.com/review/running-shoes/', title: 'Best Running Shoes — Reviews', desc: 'Expert reviews and comparisons of top running shoes.' },
      { url: 'https://gearuptofit.com/', title: 'GearUpToFit — Training & Weight Loss', desc: 'Full library of training plans and guides.' },
    ],
  },
  'lean-muscle-high-protein': {
    slug: 'lean-muscle-high-protein',
    title: 'Lean Muscle — High Protein Plan',
    metaTitle: 'Lean Muscle High Protein Plan — Build Muscle Cleanly | GearUpToFit',
    metaDesc: 'Build lean muscle with a high-protein nutrition plan and progressive overload training. Free 8-week plan with calorie surplus, macro targets, and gym program.',
    heroSubtitle: 'Build lean muscle with optimized high-protein nutrition',
    quickAnswer: 'For lean muscle gain, target a 10% calorie surplus above your TDEE (roughly 2,400–3,200 for most lifters), eat 2.0–2.2g protein per kg of lean body mass, follow a push/pull/legs or upper/lower split 4–5 days per week, and focus on progressive overload. This 8-week plan phases through foundation, build, peak, and deload.',
    highlights: [
      'Slight calorie surplus (+10%) for lean gains without excess fat',
      'High-protein macro split — 2.0-2.2g/kg lean body mass',
      'Progressive overload training with periodized phases',
      'Gym-based compound movements for maximum muscle stimulus',
      'Minimal cardio to preserve recovery and growth',
      'Recovery-focused: sleep, hydration, deload scheduling',
      'Week-by-week habit plan for consistent execution',
      'Flexible diet approach — fits standard, high-protein, or keto styles',
    ],
    faqs: [
      { q: 'How many calories over maintenance for lean muscle?', a: 'A 10% surplus (about 200–300 extra calories) is the sweet spot for lean gains. Larger surpluses lead to unnecessary fat gain. Track your weight weekly — you should gain 0.25-0.5% of body weight per week.' },
      { q: 'How much protein do I really need to build muscle?', a: 'Research supports 1.6–2.2g per kg of lean body mass. On a high-protein plan, we target the upper end (2.0-2.2g/kg) which ensures maximum muscle protein synthesis without waste.' },
      { q: 'Should I do cardio while building muscle?', a: 'Minimal cardio (2 sessions of 20-30 minutes at low intensity) supports cardiovascular health without impairing muscle recovery. Keep it easy — Zone 1-2 only. Your step count target handles the rest.' },
    ],
    relatedLinks: [
      { url: 'https://gearuptofit.com/', title: 'GearUpToFit — Training Plans', desc: 'Explore workout routines and training splits.' },
      { url: 'https://gearuptofit.com/about-us/', title: 'About GearUpToFit', desc: 'Our evidence-based approach to fitness guidance.' },
    ],
  },
};

const SEOTemplatePage = ({ pageKey }: { pageKey: string }) => {
  const page = pages[pageKey];
  if (!page) return null;

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: page.faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://gearuptofit.com/fitness-plan/' },
      { '@type': 'ListItem', position: 2, name: 'Body Recomp OS', item: 'https://gearuptofit.com/fitness-plan/build-my-plan' },
      { '@type': 'ListItem', position: 3, name: page.title, item: `https://gearuptofit.com/fitness-plan/build-my-plan/${page.slug}` },
    ],
  };

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: page.metaTitle,
    description: page.metaDesc,
    author: { '@type': 'Organization', name: 'GearUpToFit', url: 'https://gearuptofit.com' },
    publisher: { '@type': 'Organization', name: 'GearUpToFit', url: 'https://gearuptofit.com' },
    mainEntityOfPage: `https://gearuptofit.com/fitness-plan/build-my-plan/${page.slug}`,
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead title={page.metaTitle} description={page.metaDesc} path={`/workout-plans/${page.slug}`} />
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={articleSchema} />
      <Header />

      <main className="flex-1 py-8 md:py-16">
        <div className="container max-w-3xl">
          {/* Breadcrumb */}
          <nav className="text-xs text-muted-foreground mb-6 flex items-center gap-1 flex-wrap">
            <Link to="/" className="hover:text-primary">Home</Link>
            <span>/</span>
            <Link to="/build-my-plan" className="hover:text-primary">Body Recomp OS</Link>
            <span>/</span>
            <span className="text-foreground">{page.title}</span>
          </nav>

          <h1 className="text-3xl md:text-4xl font-bold mb-2">{page.title}</h1>
          <p className="text-lg text-muted-foreground mb-8">{page.heroSubtitle}</p>

          {/* Quick Answer */}
          <Card className="bg-primary/5 border-primary/30 mb-8">
            <CardContent className="p-5">
              <p className="text-xs font-bold text-primary uppercase tracking-wider mb-2">Quick Answer</p>
              <p className="text-sm text-foreground/90 leading-relaxed">{page.quickAnswer}</p>
            </CardContent>
          </Card>

          {/* CTA */}
          <div className="text-center mb-10">
            <Link to="/build-my-plan" onClick={() => trackCTAClick('template_cta', page.slug)}>
              <Button size="lg" className="gradient-red border-0 font-bold gap-2">
                Build My Personalized Plan <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <p className="text-xs text-muted-foreground mt-2">Free • Takes 2 minutes • No account required</p>
          </div>

          {/* Highlights */}
          <h2 className="text-xl font-bold mb-4">WHAT'S <span className="text-primary">INCLUDED</span></h2>
          <div className="space-y-2 mb-10">
            {page.highlights.map((h) => (
              <div key={h} className="flex items-start gap-3 p-2">
                <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <p className="text-sm text-foreground/80">{h}</p>
              </div>
            ))}
          </div>

          {/* FAQ */}
          <h2 className="text-xl font-bold mb-4">FREQUENTLY ASKED <span className="text-primary">QUESTIONS</span></h2>
          <div className="space-y-4 mb-10">
            {page.faqs.map((f) => (
              <Card key={f.q} className="bg-card border-border">
                <CardContent className="p-5">
                  <h3 className="text-sm font-bold mb-2">{f.q}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Related Links */}
          <h2 className="text-xl font-bold mb-4">RELATED <span className="text-primary">RESOURCES</span></h2>
          <div className="space-y-3 mb-10">
            {page.relatedLinks.map((link) => (
              <a
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackInternalLinkClick(link.url, `seo_template_${page.slug}`)}
                className="block p-4 bg-secondary/20 rounded-lg hover:bg-secondary/40 transition-colors"
              >
                <p className="text-sm font-semibold text-primary flex items-center gap-2">
                  {link.title} <ExternalLink className="h-3 w-3" />
                </p>
                <p className="text-xs text-muted-foreground mt-1">{link.desc}</p>
              </a>
            ))}
          </div>

          {/* Final CTA */}
          <Card className="bg-primary/5 border-primary/30">
            <CardContent className="p-6 text-center">
              <h2 className="text-xl font-bold mb-2">READY TO <span className="text-primary">START?</span></h2>
              <p className="text-sm text-muted-foreground mb-4">Get a plan personalized to your exact body, goals, and equipment.</p>
              <Link to="/build-my-plan" onClick={() => trackCTAClick('template_bottom_cta', page.slug)}>
                <Button className="gradient-red border-0 font-bold gap-2">
                  Build My Plan <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SEOTemplatePage;
export { pages };
