import { Link } from 'react-router-dom';
import logoImg from '@/assets/logo.png';
import { trackInternalLinkClick } from '@/lib/tracking';
// cache bust

const Footer = () => {
  return (
    <footer className="relative border-t border-border bg-card/30 py-16 overflow-hidden">
      <div className="absolute inset-0 hero-gradient opacity-30" />
      <div className="container relative">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2.5 mb-5">
              <img src={logoImg} alt="GearUpToFit Logo" className="h-9 w-9 rounded-lg" />
              <span className="font-['Oswald'] text-lg font-bold tracking-wider">
                GEAR UP <span className="text-primary">TO FIT</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Science-backed fitness planning tools designed to help you reach your body composition goals — for free.
            </p>
          </div>

          <div>
            <h4 className="font-['Oswald'] text-xs font-semibold mb-5 text-foreground tracking-widest">BODY RECOMP OS</h4>
            <ul className="space-y-3">
              {[
                { to: '/', label: 'Home' },
                { to: '/build-my-plan', label: 'Build My Plan' },
                { to: '/workout-plans', label: 'Browse Plans' },
                { to: '/methodology', label: 'Methodology' },
              ].map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-['Oswald'] text-xs font-semibold mb-5 text-foreground tracking-widest">FREE TOOLS</h4>
            <ul className="space-y-3">
              {[
                { to: '/free-fitness-calculators/tdee-calculator', label: 'TDEE Calculator' },
                { to: '/free-fitness-calculators/macro-calculator', label: 'Macro Calculator' },
                { to: '/free-fitness-calculators/protein-calculator', label: 'Protein Calculator' },
                { to: '/free-fitness-calculators/one-rep-max-calculator', label: '1RM Calculator' },
                { to: '/free-fitness-calculators/body-fat-calculator', label: 'Body Fat Calculator' },
              ].map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-['Oswald'] text-xs font-semibold mb-5 text-foreground tracking-widest">GEARUPTOFIT</h4>
            <ul className="space-y-3">
              {[
                { href: 'https://gearuptofit.com/', label: 'Training Plans & Workouts' },
                { href: 'https://gearuptofit.com/about-us/', label: 'About Us' },
                { href: 'https://gearuptofit.com/running/how-to-choose-the-right-running-shoes/', label: 'Running Shoe Guide' },
                { href: 'https://gearuptofit.com/review/running-shoes/', label: 'Running Shoe Reviews' },
              ].map(link => (
                <li key={link.href}>
                  <a href={link.href} target="_blank" rel="noopener noreferrer" onClick={() => trackInternalLinkClick(link.href, 'footer')} className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-border/50 text-center">
          <p className="text-xs text-muted-foreground/70">
            © {new Date().getFullYear()} GearUpToFit. Built with science. Consult a healthcare professional before starting any new exercise or nutrition program.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
