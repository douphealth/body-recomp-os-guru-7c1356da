import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import JsonLd from '@/components/JsonLd';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { ArrowRight, ExternalLink, CheckCircle } from 'lucide-react';
import { trackCTAClick, trackInternalLinkClick } from '@/lib/tracking';
import { seoPages, legacyPageMap } from '@/lib/seo-pages';
import { toCanonicalUrl } from '@/lib/site-url';

const ProgrammaticSEOPage = ({ pageKey }: { pageKey: string }) => {
  // Check legacy map first
  const resolvedKey = legacyPageMap[pageKey] || pageKey;
  const page = seoPages.get(resolvedKey);
  if (!page) return null;

  const basePath = `/workout-plans/${page.slug}`;

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
      { '@type': 'ListItem', position: 1, name: 'Home', item: toCanonicalUrl('/') },
      { '@type': 'ListItem', position: 2, name: 'Plans', item: toCanonicalUrl('/workout-plans') },
      { '@type': 'ListItem', position: 3, name: page.title, item: toCanonicalUrl(basePath) },
    ],
  };

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: page.metaTitle,
    description: page.metaDesc,
    author: { '@type': 'Organization', name: 'GearUpToFit', url: 'https://gearuptofit.com' },
    publisher: { '@type': 'Organization', name: 'GearUpToFit', url: 'https://gearuptofit.com' },
    mainEntityOfPage: toCanonicalUrl(basePath),
  };

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: `How to follow a ${page.title} program`,
    description: page.quickAnswer,
    step: [
      { '@type': 'HowToStep', position: 1, name: 'Calculate your calorie target', text: 'Use the Mifflin-St Jeor equation to determine your TDEE, then apply goal-specific adjustment.' },
      { '@type': 'HowToStep', position: 2, name: 'Set your macro split', text: 'Distribute calories across protein, carbs, and fats based on your diet style and goal.' },
      { '@type': 'HowToStep', position: 3, name: 'Follow the 8-week training plan', text: 'Progress through foundation, build, peak, and deload phases with your chosen equipment.' },
      { '@type': 'HowToStep', position: 4, name: 'Track and adjust', text: 'Monitor progress weekly and adjust calorie targets as needed.' },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead title={page.metaTitle} description={page.metaDesc} path={basePath} />
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={articleSchema} />
      <JsonLd data={howToSchema} />
      <Header />

      <main className="flex-1 py-8 md:py-16">
        <div className="container max-w-3xl">
          {/* Breadcrumb */}
          <nav className="text-xs text-muted-foreground mb-6 flex items-center gap-1 flex-wrap">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <span>/</span>
            <Link to="/workout-plans" className="hover:text-primary transition-colors">Plans</Link>
            <span>/</span>
            <span className="text-foreground">{page.title}</span>
          </nav>

          <h1 className="text-3xl md:text-4xl font-bold mb-2">{page.title}</h1>
          <p className="text-lg text-muted-foreground mb-6">{page.heroSubtitle}</p>

          {/* Unique programmatic intro (~60 words, no duplicate content) */}
          <p className="text-sm text-foreground/80 leading-relaxed mb-8 border-l-2 border-primary/40 pl-4">
            {page.intro}
          </p>

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

          {/* Related Plans */}
          {page.relatedPlans.length > 0 && (
            <>
              <h2 className="text-xl font-bold mb-4">RELATED <span className="text-primary">PLANS</span></h2>
              <div className="grid sm:grid-cols-2 gap-3 mb-10">
                {page.relatedPlans.map((rp) => (
                  <Link key={rp.slug} to={`/workout-plans/${rp.slug}`} className="block p-4 bg-secondary/20 rounded-lg hover:bg-secondary/40 transition-colors border border-border/50 hover:border-primary/30">
                    <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                      {rp.title} <ArrowRight className="h-3 w-3 text-primary" />
                    </p>
                  </Link>
                ))}
              </div>
            </>
          )}

          {/* Related Links */}
          <h2 className="text-xl font-bold mb-4">RELATED <span className="text-primary">RESOURCES</span></h2>
          <div className="space-y-3 mb-10">
            {page.relatedLinks.map((link) => (
              <a
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackInternalLinkClick(link.url, `seo_${page.slug}`)}
                className="block p-4 bg-secondary/20 rounded-lg hover:bg-secondary/40 transition-colors"
              >
                <p className="text-sm font-semibold text-primary flex items-center gap-2">
                  {link.title} <ExternalLink className="h-3 w-3" />
                </p>
                <p className="text-xs text-muted-foreground mt-1">{link.desc}</p>
              </a>
            ))}
            <Link to="/methodology" className="block p-4 bg-secondary/20 rounded-lg hover:bg-secondary/40 transition-colors">
              <p className="text-sm font-semibold text-primary flex items-center gap-2">
                Our Methodology — How We Calculate Your Plan <ArrowRight className="h-3 w-3" />
              </p>
              <p className="text-xs text-muted-foreground mt-1">Full transparency: see the formulas and academic references behind every number.</p>
            </Link>
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

export default ProgrammaticSEOPage;
