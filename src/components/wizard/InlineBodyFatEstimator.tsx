import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, Check, Sparkles, Info, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface Props {
  sex: 'male' | 'female';
  heightCm: number;
  onApply: (bodyFatPercent: number) => void;
}

/**
 * Inline U.S. Navy body fat estimator. Lets users compute their body fat %
 * from a few tape measurements right inside the wizard — no need to leave.
 */
const InlineBodyFatEstimator = ({ sex, heightCm, onApply }: Props) => {
  const [open, setOpen] = useState(false);
  const [waist, setWaist] = useState<number>(sex === 'male' ? 85 : 75);
  const [neck, setNeck] = useState<number>(sex === 'male' ? 38 : 32);
  const [hip, setHip] = useState<number>(95);

  const result = useMemo(() => {
    if (!heightCm || !waist || !neck) return null;
    if (sex === 'female' && !hip) return null;
    if (sex === 'male' && waist - neck <= 0) return null;
    if (sex === 'female' && waist + hip - neck <= 0) return null;

    let bf: number;
    if (sex === 'male') {
      bf = 495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(heightCm)) - 450;
    } else {
      bf = 495 / (1.29579 - 0.35004 * Math.log10(waist + hip - neck) + 0.221 * Math.log10(heightCm)) - 450;
    }
    if (!isFinite(bf)) return null;
    return Math.max(3, Math.min(50, Math.round(bf * 10) / 10));
  }, [sex, heightCm, waist, neck, hip]);

  const category = useMemo(() => {
    if (result == null) return null;
    const ranges = sex === 'male'
      ? [[2, 5, 'Essential', '#ef4444'], [6, 13, 'Athletic', '#f97316'], [14, 17, 'Fitness', '#22c55e'], [18, 24, 'Average', '#3b82f6'], [25, 50, 'Above Avg', '#6b7280']]
      : [[10, 13, 'Essential', '#ef4444'], [14, 20, 'Athletic', '#f97316'], [21, 24, 'Fitness', '#22c55e'], [25, 31, 'Average', '#3b82f6'], [32, 50, 'Above Avg', '#6b7280']];
    return ranges.find(r => result >= (r[0] as number) && result <= (r[1] as number)) || ranges[ranges.length - 1];
  }, [result, sex]);

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="inline-flex items-center gap-1.5 text-[11px] font-medium text-primary hover:text-primary/80 transition-colors"
      >
        <Calculator className="h-3 w-3" />
        {open ? "Hide quick estimator" : "Don't know? Estimate it in 10 seconds →"}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-3 rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="h-3 w-3" /> U.S. Navy Method
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Wrap a soft tape measure around each spot and enter cm.
                  </p>
                </div>
                <button type="button" onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className={`grid ${sex === 'female' ? 'grid-cols-3' : 'grid-cols-2'} gap-2.5`}>
                <div>
                  <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Waist (cm)</Label>
                  <Input
                    type="number"
                    inputMode="decimal"
                    value={waist}
                    onChange={(e) => setWaist(Number(e.target.value))}
                    className="mt-1 h-10 text-sm font-semibold bg-secondary/40 border-border/50"
                  />
                  <p className="text-[9px] text-muted-foreground mt-0.5">at navel</p>
                </div>
                <div>
                  <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Neck (cm)</Label>
                  <Input
                    type="number"
                    inputMode="decimal"
                    value={neck}
                    onChange={(e) => setNeck(Number(e.target.value))}
                    className="mt-1 h-10 text-sm font-semibold bg-secondary/40 border-border/50"
                  />
                  <p className="text-[9px] text-muted-foreground mt-0.5">below larynx</p>
                </div>
                {sex === 'female' && (
                  <div>
                    <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Hip (cm)</Label>
                    <Input
                      type="number"
                      inputMode="decimal"
                      value={hip}
                      onChange={(e) => setHip(Number(e.target.value))}
                      className="mt-1 h-10 text-sm font-semibold bg-secondary/40 border-border/50"
                    />
                    <p className="text-[9px] text-muted-foreground mt-0.5">widest point</p>
                  </div>
                )}
              </div>

              <div className="mt-3 flex items-center gap-2 text-[10px] text-muted-foreground">
                <Info className="h-3 w-3 flex-shrink-0" />
                <span>Height auto-pulled from above ({heightCm} cm). Result updates live.</span>
              </div>

              <div className="mt-3 flex items-center justify-between gap-3 rounded-lg bg-background/60 border border-border/40 p-3">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Estimated Body Fat</p>
                  {result != null ? (
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-primary font-['Oswald']">{result}%</span>
                      {category && (
                        <span
                          className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                          style={{ backgroundColor: `${category[3]}20`, color: category[3] as string }}
                        >
                          {category[2]}
                        </span>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">Enter measurements above</p>
                  )}
                </div>
                <Button
                  type="button"
                  size="sm"
                  disabled={result == null}
                  onClick={() => {
                    if (result != null) {
                      onApply(Math.round(result));
                      setOpen(false);
                    }
                  }}
                  className="gradient-red border-0 h-9 px-3 text-xs font-bold"
                >
                  <Check className="h-3.5 w-3.5 mr-1" /> Use this
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InlineBodyFatEstimator;
