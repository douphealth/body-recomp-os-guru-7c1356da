import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import JsonLd from '@/components/JsonLd';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { allSEOPageSlugs, seoPages } from '@/lib/seo-pages';

const goals = ['all', 'fat-loss', 'lean-muscle', 'recomp'] as const;
const experiences = ['all', 'beginner', 'intermediate', 'advanced'] as const;
const equipments = ['all', 'gym', 'home', 'bodyweight'] as const;

const PlansHub = () => {
  const [goalFilter, setGoalFilter] = useState('all');
  const [expFilter, setExpFilter] = useState('all');
  const [equipFilter, setEquipFilter] = useState('all');

  const filtered = allSEOPageSlugs.filter(slug => {
    if (goalFilter !== 'all' && !slug.startsWith(goalFilter)) return false;
    if (expFilter !== 'all' && !slug.includes(expFilter)) return false;
    if (equipFilter !== 'all' && !slug.includes(equipFilter)) return false;
    return true;
  });

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://app.gearuptofit.com/' },
      { '@type': 'ListItem', position: 2, name: 'Plans', item: 'https://app.gearuptofit.com/plans' },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title="Browse All Fitness Plans — Free 8-Week Programs | GearUpToFit"
        description="Browse 100+ free 8-week fitness plans for fat loss, lean muscle, and body recomposition. Filter by experience level, equipment, and diet style."
        path="/plans"
      />
      <JsonLd data={breadcrumbSchema} />
      <Header />

      <main className="flex-1 py-8 md:py-16">
        <div className="container max-w-5xl">
          <nav className="text-xs text-muted-foreground mb-6 flex items-center gap-1">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <span>/</span>
            <span className="text-foreground">Plans</span>
          </nav>

          <h1 className="text-3xl md:text-4xl font-bold mb-3">BROWSE ALL <span className="text-primary">PLANS</span></h1>
          <p className="text-muted-foreground mb-8">Filter {allSEOPageSlugs.length}+ free 8-week fitness plans by goal, experience, and equipment.</p>

          {/* Filters */}
          <div className="flex flex-wrap gap-6 mb-8 p-4 rounded-xl bg-card border border-border">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Goal</p>
              <div className="flex flex-wrap gap-1.5">
                {goals.map(g => (
                  <button key={g} onClick={() => setGoalFilter(g)} className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${goalFilter === g ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}>
                    {g === 'all' ? 'All' : g.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Experience</p>
              <div className="flex flex-wrap gap-1.5">
                {experiences.map(e => (
                  <button key={e} onClick={() => setExpFilter(e)} className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${expFilter === e ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}>
                    {e === 'all' ? 'All' : e.charAt(0).toUpperCase() + e.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Equipment</p>
              <div className="flex flex-wrap gap-1.5">
                {equipments.map(eq => (
                  <button key={eq} onClick={() => setEquipFilter(eq)} className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${equipFilter === eq ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}>
                    {eq === 'all' ? 'All' : eq.charAt(0).toUpperCase() + eq.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground mb-4">{filtered.length} plans found</p>

          {/* Plan grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.slice(0, 60).map(slug => {
              const page = seoPages.get(slug)!;
              return (
                <Link key={slug} to={`/plans/${slug}`} className="block group">
                  <div className="stat-card h-full">
                    <h3 className="text-sm font-bold mb-1 group-hover:text-primary transition-colors">{page.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-3">{page.heroSubtitle}</p>
                    <p className="text-[10px] text-primary font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                      View Plan <ArrowRight className="h-3 w-3" />
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>

          {filtered.length > 60 && (
            <p className="text-center text-xs text-muted-foreground mt-6">Showing 60 of {filtered.length} plans. Use filters to narrow down.</p>
          )}

          {/* CTA */}
          <div className="text-center mt-12">
            <p className="text-sm text-muted-foreground mb-4">Want a plan tailored to your exact stats?</p>
            <Link to="/app/body-recomp">
              <Button size="lg" className="gradient-red border-0 font-bold gap-2">
                Build My Personalized Plan <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PlansHub;
