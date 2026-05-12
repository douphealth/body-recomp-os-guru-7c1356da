import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import JsonLd from '@/components/JsonLd';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, FlaskConical, Calculator, ShieldCheck } from 'lucide-react';

const Methodology = () => {
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Our Methodology — How Body Recomp OS Calculates Your Plan',
    description: 'Learn exactly how we calculate your calorie targets, macro split, and training plan using the Mifflin-St Jeor equation and evidence-based formulas.',
    author: { '@type': 'Organization', name: 'GearUpToFit', url: 'https://gearuptofit.com' },
    publisher: { '@type': 'Organization', name: 'GearUpToFit', url: 'https://gearuptofit.com' },
    mainEntityOfPage: 'https://fitness-plan.gearuptofit.com/methodology',
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      { '@type': 'Question', name: 'What equation does Body Recomp OS use for TDEE?', acceptedAnswer: { '@type': 'Answer', text: 'We use the Mifflin-St Jeor equation (1990), which research shows is the most accurate TDEE predictor for healthy adults within ±10%.' } },
      { '@type': 'Question', name: 'How is the protein target calculated?', acceptedAnswer: { '@type': 'Answer', text: 'Protein targets are based on lean body mass (LBM), calculated as total weight × (1 - body fat %). We then apply a multiplier of 1.6-2.2g per kg of LBM depending on your goal.' } },
      { '@type': 'Question', name: 'Is the Mifflin-St Jeor equation accurate?', acceptedAnswer: { '@type': 'Answer', text: 'Yes — a 2005 systematic review by Frankenfield et al. found the Mifflin-St Jeor equation was the most accurate for estimating BMR in both normal-weight and obese individuals, predicting BMR within 10% for 82% of non-obese subjects.' } },
    ],
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://fitness-plan.gearuptofit.com/' },
      { '@type': 'ListItem', position: 2, name: 'Methodology', item: 'https://fitness-plan.gearuptofit.com/methodology' },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title="Methodology — How We Calculate Your Plan | GearUpToFit"
        description="Learn the science behind Body Recomp OS: Mifflin-St Jeor TDEE, evidence-based protein targets, and periodized training — with academic references."
        path="/methodology"
      />
      <JsonLd data={articleSchema} />
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumbSchema} />
      <Header />

      <main className="flex-1 py-8 md:py-16">
        <div className="container max-w-3xl">
          {/* Breadcrumb */}
          <nav className="text-xs text-muted-foreground mb-6 flex items-center gap-1">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <span>/</span>
            <span className="text-foreground">Methodology</span>
          </nav>

          <h1 className="text-3xl md:text-4xl font-bold mb-3">OUR <span className="text-primary">METHODOLOGY</span></h1>
          <p className="text-lg text-muted-foreground mb-10">How Body Recomp OS calculates your personalized plan — with full transparency and academic references.</p>

          {/* TDEE Section */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl gradient-red flex items-center justify-center">
                <Calculator className="h-5 w-5 text-primary-foreground" />
              </div>
              <h2 className="text-xl font-bold">TDEE <span className="text-primary">CALCULATION</span></h2>
            </div>

            <Card className="bg-primary/5 border-primary/30 mb-6">
              <CardContent className="p-5">
                <p className="text-xs font-bold text-primary uppercase tracking-wider mb-2">Quick Answer</p>
                <p className="text-sm text-foreground/90 leading-relaxed">
                  We use the <strong>Mifflin-St Jeor equation (1990)</strong> to calculate your Basal Metabolic Rate (BMR), then multiply by an activity factor based on your workout frequency and daily step count. This method is the most accurate TDEE predictor for healthy adults, validated within ±10% accuracy.
                </p>
              </CardContent>
            </Card>

            <div className="space-y-4 text-sm text-foreground/80 leading-relaxed">
              <p>The Mifflin-St Jeor equation calculates BMR as:</p>
              <Card className="bg-card border-border">
                <CardContent className="p-5 font-mono text-xs">
                  <p><strong>Males:</strong> BMR = (10 × weight in kg) + (6.25 × height in cm) − (5 × age) + 5</p>
                  <p className="mt-2"><strong>Females:</strong> BMR = (10 × weight in kg) + (6.25 × height in cm) − (5 × age) − 161</p>
                </CardContent>
              </Card>

              <p>We then apply an <strong>activity multiplier</strong> that accounts for both exercise frequency and Non-Exercise Activity Thermogenesis (NEAT) via daily step count:</p>

              <Card className="bg-card border-border">
                <CardContent className="p-5">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 font-semibold text-foreground">Daily Steps</th>
                        <th className="text-left py-2 font-semibold text-foreground">Base Factor</th>
                        <th className="text-left py-2 font-semibold text-foreground">+Exercise Adj.</th>
                      </tr>
                    </thead>
                    <tbody className="text-muted-foreground">
                      <tr className="border-b border-border/50"><td className="py-2">&lt;7,000</td><td>1.20</td><td>+0.15 to +0.45</td></tr>
                      <tr className="border-b border-border/50"><td className="py-2">7,000–9,999</td><td>1.25</td><td>+0.15 to +0.45</td></tr>
                      <tr><td className="py-2">10,000+</td><td>1.30</td><td>+0.15 to +0.45</td></tr>
                    </tbody>
                  </table>
                  <p className="text-[10px] text-muted-foreground mt-3">Exercise adjustment ranges from +0.15 (3 days/wk) to +0.45 (6+ days/wk).</p>
                </CardContent>
              </Card>

              <p><strong>Goal-specific calorie adjustment:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-2 text-muted-foreground">
                <li><strong>Fat Loss:</strong> TDEE × 0.80 (20% deficit) — preserves muscle while creating sustainable fat loss</li>
                <li><strong>Lean Muscle:</strong> TDEE × 1.10 (10% surplus) — minimizes fat gain while supporting muscle growth</li>
                <li><strong>Recomposition:</strong> Maintenance with cycling (85% on rest days, 110% on training days)</li>
              </ul>
            </div>
          </section>

          {/* Protein Section */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl gradient-red flex items-center justify-center">
                <FlaskConical className="h-5 w-5 text-primary-foreground" />
              </div>
              <h2 className="text-xl font-bold">PROTEIN & <span className="text-primary">MACRO SPLIT</span></h2>
            </div>

            <div className="space-y-4 text-sm text-foreground/80 leading-relaxed">
              <p>Protein targets are calculated from <strong>lean body mass (LBM)</strong>, not total body weight. This is more accurate because adipose tissue has minimal protein requirements.</p>
              <p><strong>LBM = Total Weight × (1 − Body Fat %)</strong></p>

              <Card className="bg-card border-border">
                <CardContent className="p-5">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 font-semibold text-foreground">Goal</th>
                        <th className="text-left py-2 font-semibold text-foreground">Protein (g/kg LBM)</th>
                        <th className="text-left py-2 font-semibold text-foreground">Rationale</th>
                      </tr>
                    </thead>
                    <tbody className="text-muted-foreground">
                      <tr className="border-b border-border/50"><td className="py-2">Fat Loss</td><td>2.0–2.2</td><td>Maximize muscle preservation in deficit</td></tr>
                      <tr className="border-b border-border/50"><td className="py-2">Lean Muscle</td><td>1.8–2.0</td><td>Support muscle protein synthesis</td></tr>
                      <tr><td className="py-2">Recomposition</td><td>2.0</td><td>Balance preservation and growth</td></tr>
                    </tbody>
                  </table>
                </CardContent>
              </Card>

              <p>Remaining calories are distributed between carbohydrates and fats based on diet style selection:</p>
              <ul className="list-disc list-inside space-y-1 ml-2 text-muted-foreground">
                <li><strong>Standard:</strong> ~30% fat, remaining carbs</li>
                <li><strong>Keto:</strong> 70% fat, 5% carbs</li>
                <li><strong>High Protein:</strong> 25% fat, remaining carbs (+0.2g/kg protein)</li>
                <li><strong>Vegetarian:</strong> Same macro ratios, plant-based protein sources highlighted</li>
              </ul>
            </div>
          </section>

          {/* Training Section */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl gradient-red flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-primary-foreground" />
              </div>
              <h2 className="text-xl font-bold">TRAINING <span className="text-primary">PERIODIZATION</span></h2>
            </div>

            <div className="space-y-4 text-sm text-foreground/80 leading-relaxed">
              <p>Our 8-week program follows a <strong>linear periodization model</strong> proven effective for both beginners and intermediate trainees:</p>

              <Card className="bg-card border-border">
                <CardContent className="p-5">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 font-semibold text-foreground">Weeks</th>
                        <th className="text-left py-2 font-semibold text-foreground">Phase</th>
                        <th className="text-left py-2 font-semibold text-foreground">Focus</th>
                      </tr>
                    </thead>
                    <tbody className="text-muted-foreground">
                      <tr className="border-b border-border/50"><td className="py-2">1–2</td><td>Foundation</td><td>Learn movements, establish baseline</td></tr>
                      <tr className="border-b border-border/50"><td className="py-2">3–4</td><td>Build</td><td>Increase weight 5–10%</td></tr>
                      <tr className="border-b border-border/50"><td className="py-2">5–6</td><td>Peak</td><td>Intensity peak, max progressive overload</td></tr>
                      <tr><td className="py-2">7–8</td><td>Deload</td><td>Reduce volume 40%, maintain intensity</td></tr>
                    </tbody>
                  </table>
                </CardContent>
              </Card>

              <p>Training split auto-selects based on workout frequency:</p>
              <ul className="list-disc list-inside space-y-1 ml-2 text-muted-foreground">
                <li><strong>2–3 days:</strong> Full-body split</li>
                <li><strong>4 days:</strong> Upper/lower split</li>
                <li><strong>5–6 days:</strong> Push/pull/legs split</li>
              </ul>
            </div>
          </section>

          {/* References */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl gradient-red flex items-center justify-center">
                <ShieldCheck className="h-5 w-5 text-primary-foreground" />
              </div>
              <h2 className="text-xl font-bold">ACADEMIC <span className="text-primary">REFERENCES</span></h2>
            </div>

            <div className="space-y-3">
              {[
                { ref: 'Mifflin MD, St Jeor ST, Hill LA, et al.', title: 'A new predictive equation for resting energy expenditure in healthy individuals.', journal: 'Am J Clin Nutr. 1990;51(2):241-247.', note: 'The foundational equation we use for BMR calculation.' },
                { ref: 'Frankenfield D, Roth-Yousey L, Compher C.', title: 'Comparison of predictive equations for resting metabolic rate in healthy nonobese and obese adults.', journal: 'J Am Diet Assoc. 2005;105(5):775-789.', note: 'Systematic review confirming Mifflin-St Jeor as the most accurate predictor.' },
                { ref: 'Morton RW, Murphy KT, McKellar SR, et al.', title: 'A systematic review, meta-analysis and meta-regression of the effect of protein supplementation on resistance training-induced gains in muscle mass and strength.', journal: 'Br J Sports Med. 2018;52(6):376-384.', note: 'Supports 1.6–2.2g/kg protein range for maximizing muscle gains.' },
                { ref: 'Helms ER, Aragon AA, Fitschen PJ.', title: 'Evidence-based recommendations for natural bodybuilding contest preparation.', journal: 'J Int Soc Sports Nutr. 2014;11:20.', note: 'Supports higher protein during caloric deficit for muscle preservation.' },
                { ref: 'Williams TD, Tolusso DV, Fedewa MV, Esco MR.', title: 'Comparison of periodized and non-periodized resistance training on maximal strength.', journal: 'Sports Med. 2017;47(10):2083-2100.', note: 'Meta-analysis supporting periodized training for superior strength gains.' },
              ].map((r) => (
                <Card key={r.ref} className="bg-card border-border">
                  <CardContent className="p-4">
                    <p className="text-xs text-foreground/90"><strong>{r.ref}</strong> {r.title}</p>
                    <p className="text-xs text-muted-foreground italic mt-1">{r.journal}</p>
                    <p className="text-[10px] text-primary mt-2">↳ {r.note}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* CTA */}
          <Card className="bg-primary/5 border-primary/30">
            <CardContent className="p-6 text-center">
              <h2 className="text-xl font-bold mb-2">SEE IT <span className="text-primary">IN ACTION</span></h2>
              <p className="text-sm text-muted-foreground mb-4">Get a plan built from these formulas, personalized to your exact body and goals.</p>
              <Link to="/build-my-plan">
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

export default Methodology;
