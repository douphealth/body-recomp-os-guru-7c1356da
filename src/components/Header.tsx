import { Link, useLocation } from 'react-router-dom';
import { Activity, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Body Recomp OS', path: '/app/body-recomp' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Activity className="h-7 w-7 text-primary" />
          <span className="font-['Oswald'] text-xl font-bold tracking-wider">
            GEAR UP <span className="text-primary">TO FIT</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === item.path ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              {item.label}
            </Link>
          ))}
          <a
            href="https://gearuptofit.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            GearUpToFit.com ↗
          </a>
          <Link to="/app/body-recomp">
            <Button size="sm" className="gradient-red border-0 font-semibold">
              Build My Plan
            </Button>
          </Link>
        </nav>

        {/* Mobile menu toggle */}
        <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile nav */}
      {menuOpen && (
        <div className="md:hidden border-t border-border bg-background p-4 space-y-3">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="block text-sm font-medium py-2 hover:text-primary"
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <a
            href="https://gearuptofit.com"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm font-medium py-2 text-muted-foreground hover:text-primary"
          >
            GearUpToFit.com ↗
          </a>
          <Link to="/app/body-recomp" onClick={() => setMenuOpen(false)}>
            <Button className="w-full gradient-red border-0 font-semibold mt-2">
              Build My Plan
            </Button>
          </Link>
        </div>
      )}
    </header>
  );
};

export default Header;
