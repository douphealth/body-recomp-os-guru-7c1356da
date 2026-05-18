import { ShieldCheck, Lock, Clock } from 'lucide-react';

interface GuaranteeBadgeProps {
  className?: string;
  align?: 'center' | 'left';
}

const ITEMS = [
  { Icon: ShieldCheck, label: 'Free forever' },
  { Icon: Lock, label: 'No credit card' },
  { Icon: Clock, label: '2-minute setup' },
];

const GuaranteeBadge = ({ className = '', align = 'center' }: GuaranteeBadgeProps) => (
  <ul
    className={`flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] text-muted-foreground ${
      align === 'center' ? 'justify-center' : 'justify-start'
    } ${className}`}
    aria-label="Plan guarantees"
  >
    {ITEMS.map(({ Icon, label }) => (
      <li key={label} className="inline-flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
        <span className="font-medium">{label}</span>
      </li>
    ))}
  </ul>
);

export default GuaranteeBadge;
