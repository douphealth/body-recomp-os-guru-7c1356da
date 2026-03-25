import { Activity } from 'lucide-react';
import { trackInternalLinkClick } from '@/lib/tracking';

const Footer = () => {
  const handleLinkClick = (url: string) => {
    trackInternalLinkClick(url, 'footer');
  };

  return (
    <footer className="border-t border-border bg-card/50 py-12">
      <div className="container">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Activity className="h-6 w-6 text-primary" />
              <span className="font-['Oswald'] text-lg font-bold tracking-wider">
                GEAR UP <span className="text-primary">TO FIT</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Science-backed fitness planning tools designed to help you reach your body composition goals.
            </p>
          </div>
          <div>
            <h4 className="font-['Oswald'] text-sm font-semibold mb-4 text-foreground">EXPLORE GEARUPTOFIT</h4>
            <ul className="space-y-2">
              <li>
                <a href="https://gearuptofit.com/" target="_blank" rel="noopener noreferrer" onClick={() => handleLinkClick('https://gearuptofit.com/')} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Training Plans & Workouts
                </a>
              </li>
              <li>
                <a href="https://gearuptofit.com/about-us/" target="_blank" rel="noopener noreferrer" onClick={() => handleLinkClick('https://gearuptofit.com/about-us/')} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  About Us — Our Mission
                </a>
              </li>
              <li>
                <a href="https://gearuptofit.com/running/how-to-choose-the-right-running-shoes/" target="_blank" rel="noopener noreferrer" onClick={() => handleLinkClick('https://gearuptofit.com/running/how-to-choose-the-right-running-shoes/')} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Running Shoe Guide
                </a>
              </li>
              <li>
                <a href="https://gearuptofit.com/review/running-shoes/" target="_blank" rel="noopener noreferrer" onClick={() => handleLinkClick('https://gearuptofit.com/review/running-shoes/')} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Best Running Shoes Reviews
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-['Oswald'] text-sm font-semibold mb-4 text-foreground">APP TOOLS</h4>
            <ul className="space-y-2">
              <li>
                <a href="/app/body-recomp" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Body Recomp OS
                </a>
              </li>
              <li>
                <a href="/app/body-recomp/fat-loss-beginner-home-workouts" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Fat Loss — Home Workouts
                </a>
              </li>
              <li>
                <a href="/app/body-recomp/runner-cut-plan" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Runner Cut Plan
                </a>
              </li>
              <li>
                <a href="/app/body-recomp/lean-muscle-high-protein" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Lean Muscle — High Protein
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} GearUpToFit. This app provides general fitness guidance. Consult a healthcare professional before starting any new exercise or nutrition program.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
