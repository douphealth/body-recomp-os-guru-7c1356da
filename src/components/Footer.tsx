import { Activity } from 'lucide-react';
import { trackInternalLinkClick } from '@/lib/tracking';

const Footer = () => {
  const handleLinkClick = (url: string) => {
    trackInternalLinkClick(url, 'footer');
  };

  return (
    <footer className="relative border-t border-border bg-card/30 py-16 overflow-hidden">
      <div className="absolute inset-0 hero-gradient opacity-30" />
      <div className="container relative">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2.5 mb-5">
              <div className="h-9 w-9 rounded-lg gradient-red flex items-center justify-center">
                <Activity className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-['Oswald'] text-lg font-bold tracking-wider">
                GEAR UP <span className="text-primary">TO FIT</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Science-backed fitness planning tools designed to help you reach your body composition goals — for free.
            </p>
          </div>
          <div>
            <h4 className="font-['Oswald'] text-xs font-semibold mb-5 text-foreground tracking-widest">EXPLORE GEARUPTOFIT</h4>
            <ul className="space-y-3">
              {[
                { href: 'https://gearuptofit.com/', label: 'Training Plans & Workouts' },
                { href: 'https://gearuptofit.com/about-us/', label: 'About Us — Our Mission' },
                { href: 'https://gearuptofit.com/running/how-to-choose-the-right-running-shoes/', label: 'Running Shoe Guide' },
                { href: 'https://gearuptofit.com/review/running-shoes/', label: 'Best Running Shoes Reviews' },
              ].map(link => (
                <li key={link.href}>
                  <a href={link.href} target="_blank" rel="noopener noreferrer" onClick={() => handleLinkClick(link.href)} className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-['Oswald'] text-xs font-semibold mb-5 text-foreground tracking-widest">APP TOOLS</h4>
            <ul className="space-y-3">
              {[
                { href: '/app/body-recomp', label: 'Body Recomp OS' },
                { href: '/app/body-recomp/fat-loss-beginner-home-workouts', label: 'Fat Loss — Home Workouts' },
                { href: '/app/body-recomp/runner-cut-plan', label: 'Runner Cut Plan' },
                { href: '/app/body-recomp/lean-muscle-high-protein', label: 'Lean Muscle — High Protein' },
              ].map(link => (
                <li key={link.href}>
                  <a href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-border/50 text-center">
          <p className="text-xs text-muted-foreground/70">
            © {new Date().getFullYear()} GearUpToFit. This app provides general fitness guidance. Consult a healthcare professional before starting any new exercise or nutrition program.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
