import { Link } from 'react-router-dom';
import { Calculator, Target, Beef, Dumbbell, Scale, ArrowRight } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import JsonLd from '@/components/JsonLd';

const tools = [
  { path: '/free-fitness-calculators/tdee-calculator', name: 'TDEE Calculator', desc: 'Calculate your Total Daily Energy Expenditure using the Mifflin-St Jeor equation.', icon: Calculator },
  { path: '/free-fitness-calculators/macro-calculator', name: 'Macro Calculator', desc: 'Get your optimal protein, carb, and fat split for any goal and diet style.', icon: Target },
  { path: '/free-fitness-calculators/protein-calculator', name: 'Protein Calculator', desc: 'Find your ideal daily protein intake with evidence-based methods.', icon: Beef },
  { path: '/free-fitness-calculators/one-rep-max-calculator', name: '1RM Calculator', desc: 'Estimate your one-rep max and get training load percentages.', icon: Dumbbell },
  { path: '/free-fitness-calculators/body-fat-calculator', name: 'Body Fat Estimator', desc: 'Estimate body fat percentage using the U.S. Navy method.', icon: Scale },
];

const ToolsHub = () => {
  const schema = { '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'Free Fitness Calculators — GearUpToFit', description: 'Science-backed fitness calculators for TDEE, macros, protein, 1RM, and body fat.' };

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead title="Free Fitness Calculators — TDEE, Macros, Protein, 1RM & More | GearUpToFit" description="Science-backed fitness calculators to plan your journey. Calculate TDEE, macros, protein needs, one-rep max, and body fat — all free." path="/free-fitness-calculators" />
      <JsonLd data={schema} />
      <Header />
      <main className="flex-1 py-8 md:py-16">
        <div className="container max-w-3xl">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-5xl font-bold mb-3">FREE FITNESS CALCULATORS</h1>
            <p className="text-muted-foreground text-sm max-w-lg mx-auto">Science-backed tools to plan your fitness journey. All powered by the GearUpToFit Body Recomp engine.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {tools.map((tool) => (
              <Link key={tool.path} to={tool.path} className="block group">
                <div className="stat-card h-full flex items-start gap-4">
                  <div className="h-11 w-11 rounded-xl gradient-red flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-shadow">
                    <tool.icon className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold font-['Oswald'] tracking-wider group-hover:text-primary transition-colors">{tool.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{tool.desc}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link to="/build-my-plan">
              <div className="inline-flex items-center gap-3 stat-card border-primary/20 bg-primary/5 cursor-pointer group px-8">
                <div>
                  <p className="text-sm font-bold group-hover:text-primary transition-colors">Want the complete package?</p>
                  <p className="text-xs text-muted-foreground">Build a personalized 8-week plan with all calculations combined →</p>
                </div>
                <ArrowRight className="h-5 w-5 text-primary" />
              </div>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ToolsHub;
