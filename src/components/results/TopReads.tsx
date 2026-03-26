import { motion } from 'framer-motion';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { trackInternalLinkClick } from '@/lib/tracking';

interface ContextLink {
  url: string;
  title: string;
  description: string;
}

const TopReads = ({ links }: { links: ContextLink[] }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.55 }}
    className="stat-card mb-8"
  >
    <div className="flex items-center gap-2 mb-4">
      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
        <ArrowRight className="h-4 w-4 text-primary" />
      </div>
      <h2 className="text-sm font-bold uppercase tracking-wider">Top Reads For You</h2>
    </div>
    <div className="space-y-3">
      {links.map((link) => (
        <a
          key={link.url}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackInternalLinkClick(link.url, 'top_reads')}
          className="block p-4 rounded-xl bg-secondary/20 border border-border/30 hover:border-primary/20 hover:bg-secondary/30 transition-all duration-300 group"
        >
          <p className="text-sm font-semibold text-primary flex items-center gap-2 group-hover:gap-3 transition-all">
            {link.title} <ExternalLink className="h-3 w-3" />
          </p>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{link.description}</p>
        </a>
      ))}
    </div>
  </motion.div>
);

export default TopReads;
