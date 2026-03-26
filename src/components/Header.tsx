import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import logoImg from '@/assets/logo.png';

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Body Recomp OS', path: '/app/body-recomp' },
    { label: 'Tools', path: '/tools' },
    { label: 'Plans', path: '/plans' },
    { label: 'Methodology', path: '/methodology' },
  ];

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'glass glass-border shadow-lg shadow-background/50' : 'bg-background/80 backdrop-blur border-b border-border'}`}>
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="h-9 w-9 rounded-lg gradient-red flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-shadow">
            <Activity className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-['Oswald'] text-lg font-bold tracking-wider">
            GEAR UP <span className="text-primary">TO FIT</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path))
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
              }`}
            >
              {item.label}
            </Link>
          ))}
          <a
            href="https://gearuptofit.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 text-sm font-medium text-muted-foreground rounded-lg hover:text-foreground hover:bg-secondary/50 transition-all duration-200"
          >
            GearUpToFit.com ↗
          </a>
          <Link to="/app/body-recomp" className="ml-2">
            <Button size="sm" className="gradient-red border-0 font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300 hover:scale-[1.02]">
              Build My Plan
            </Button>
          </Link>
        </nav>

        <button className="md:hidden p-2 rounded-lg hover:bg-secondary/50 transition-colors" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden glass glass-border"
          >
            <div className="p-4 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`block text-sm font-medium py-3 px-4 rounded-lg transition-colors ${
                    location.pathname === item.path ? 'text-primary bg-primary/10' : 'hover:bg-secondary/50'
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <a
                href="https://gearuptofit.com"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm font-medium py-3 px-4 rounded-lg text-muted-foreground hover:bg-secondary/50 transition-colors"
              >
                GearUpToFit.com ↗
              </a>
              <Link to="/app/body-recomp" onClick={() => setMenuOpen(false)}>
                <Button className="w-full gradient-red border-0 font-semibold mt-2 shadow-lg shadow-primary/20">
                  Build My Plan
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
