import { motion } from 'framer-motion';
import { Flame, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  title: string;
  isDoneToday: boolean;
  toggleToday: () => void;
  streak: number;
  totalDone: number;
  last7: { key: string; done: boolean; isToday: boolean }[];
  cta?: string;
  doneCta?: string;
  accent?: 'primary' | 'sky';
}

const dowShort = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

const StreakCard = ({
  title, isDoneToday, toggleToday, streak, totalDone, last7, cta = 'Mark today complete', doneCta = '✓ Today done — nice work', accent = 'primary',
}: Props) => {
  const accentText = accent === 'sky' ? 'text-sky-400' : 'text-primary';
  const accentBg = accent === 'sky' ? 'bg-sky-500/10 border-sky-500/20' : 'bg-primary/10 border-primary/20';
  const dot = accent === 'sky' ? 'bg-sky-500' : 'bg-primary';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-card to-card/50 p-4"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{title}</p>
          <div className="flex items-baseline gap-2 mt-1">
            <Flame className={`h-5 w-5 ${streak > 0 ? 'text-orange-400' : 'text-muted-foreground/40'}`} />
            <span className={`text-3xl font-bold font-['Oswald'] tracking-tight ${streak > 0 ? accentText : 'text-muted-foreground'}`}>
              {streak}
            </span>
            <span className="text-[11px] text-muted-foreground">day{streak === 1 ? '' : 's'} streak</span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5">{totalDone} total {totalDone === 1 ? 'day' : 'days'} logged</p>
        </div>

        {/* Last 7 dot row */}
        <div className="flex items-end gap-1 pt-1">
          {last7.map((d, i) => (
            <div key={d.key} className="flex flex-col items-center gap-1">
              <div
                title={d.key}
                className={`h-6 w-3.5 rounded-sm border transition-all ${
                  d.done
                    ? `${dot} border-transparent`
                    : d.isToday
                      ? 'border-primary/40 bg-secondary/30'
                      : 'border-border/40 bg-secondary/20'
                }`}
              />
              <span className={`text-[8px] ${d.isToday ? 'text-primary font-bold' : 'text-muted-foreground/60'}`}>
                {dowShort[i]}
              </span>
            </div>
          ))}
        </div>
      </div>

      <Button
        size="sm"
        onClick={toggleToday}
        className={`w-full gap-2 h-9 text-xs font-semibold transition-all ${
          isDoneToday
            ? `${accentBg} border ${accentText} hover:bg-secondary/30`
            : 'gradient-red border-0 shadow-md shadow-primary/20 hover:shadow-primary/40'
        }`}
        variant={isDoneToday ? 'outline' : 'default'}
      >
        {isDoneToday ? <Check className="h-3.5 w-3.5" /> : <Flame className="h-3.5 w-3.5" />}
        {isDoneToday ? doneCta : cta}
      </Button>
    </motion.div>
  );
};

export default StreakCard;
