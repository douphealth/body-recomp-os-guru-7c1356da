import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, CheckCircle2, Loader2, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getUTM } from '@/lib/utm';

interface EmailGateProps {
  open: boolean;
  onClose: () => void;
  onUnlock: () => void;
  goalLabel?: string;
  calorieTarget?: number;
  proteinGrams?: number;
  workoutFrequency?: number;
  shareToken?: string;
  source?: 'plan_gate' | 'exit_popup' | 'inline_results' | 'pdf_unlock' | 'footer';
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
}

const STORAGE_KEY = 'gutf_brc_subscribed_v1';

export const hasSubscribed = () => {
  try { return !!localStorage.getItem(STORAGE_KEY); } catch { return false; }
};

const EmailGate = ({
  open,
  onClose,
  onUnlock,
  goalLabel,
  calorieTarget,
  proteinGrams,
  workoutFrequency,
  shareToken,
  source = 'plan_gate',
  title = 'Unlock Your 8-Week Body Recomp Plan',
  subtitle = 'Get the full PDF playbook, daily checklists, and a free 21-day coaching series from Alex — straight to your inbox.',
  ctaLabel = 'Email Me My Plan',
}: EmailGateProps) => {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [consent, setConsent] = useState(true);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!open) { setDone(false); setLoading(false); }
  }, [open]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email');
      return;
    }
    if (!consent) {
      toast.error('Please accept to receive your plan');
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('brevo-subscribe', {
        body: {
          email: email.trim().toLowerCase(),
          firstName: firstName.trim() || undefined,
          source,
          goalLabel,
          calorieTarget,
          proteinGrams,
          workoutFrequency,
          shareToken,
          consent: true,
          utm: getUTM(),
        },
      });
      if (error || (data as any)?.error) throw new Error((data as any)?.error || error?.message || 'Failed');
      try { localStorage.setItem(STORAGE_KEY, email); } catch {}
      try {
        (window as any).dataLayer?.push({
          event: 'lead_capture',
          source,
          goal: goalLabel,
        });
      } catch {}
      setDone(true);
      setTimeout(() => { onUnlock(); }, 900);
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/85 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 24, stiffness: 280 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-2xl border border-primary/20 bg-card/95 backdrop-blur-xl p-6 md:p-8 shadow-2xl shadow-primary/20 card-glow"
          >
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition"
            >
              <X className="w-4 h-4" />
            </button>

            {!done ? (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/40">
                    <Sparkles className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Free · 1-click</span>
                </div>

                <h2 className="text-2xl md:text-[28px] font-bold uppercase leading-tight tracking-tight mb-2 font-['Oswald']">
                  {title}
                </h2>
                <p className="text-sm text-muted-foreground mb-5 leading-relaxed">{subtitle}</p>

                <ul className="space-y-2 mb-5 text-xs md:text-sm">
                  {[
                    'Premium PDF playbook (calories, macros, training, recovery)',
                    'Week-by-week checklist + daily habit tracker',
                    '21-day coaching series from Alex (head coach, 18 yrs experience)',
                  ].map((t) => (
                    <li key={t} className="flex items-start gap-2 text-foreground/90">
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>

                <form onSubmit={submit} className="space-y-3">
                  <Input
                    type="text"
                    placeholder="First name (optional)"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value.slice(0, 60))}
                    maxLength={60}
                    autoComplete="given-name"
                    className="h-11"
                  />
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <Input
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value.slice(0, 255))}
                      maxLength={255}
                      autoComplete="email"
                      className="h-11 pl-9"
                    />
                  </div>
                  <label className="flex items-start gap-2 text-[11px] text-muted-foreground leading-snug cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      className="mt-0.5 accent-primary"
                    />
                    <span>
                      Yes, send me my plan and the free 21-day coaching series. I can unsubscribe anytime. By
                      continuing I accept the{' '}
                      <a href="https://gearuptofit.com/privacy-policy/" target="_blank" rel="noopener" className="underline hover:text-primary">privacy policy</a>.
                    </span>
                  </label>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 bg-gradient-to-r from-primary to-primary/80 hover:opacity-90 font-bold uppercase tracking-[0.12em] shadow-lg shadow-primary/40"
                  >
                    {loading ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending…</>
                    ) : (
                      <><Lock className="w-4 h-4 mr-2" /> {ctaLabel}</>
                    )}
                  </Button>

                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full text-[11px] text-muted-foreground/70 hover:text-muted-foreground transition py-1"
                  >
                    No thanks, just show my results
                  </button>
                </form>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6"
              >
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/15 border-2 border-primary flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold uppercase mb-2 font-['Oswald']">Check your inbox!</h3>
                <p className="text-sm text-muted-foreground">
                  Your personalized plan is on its way. Unlocking your results…
                </p>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EmailGate;
