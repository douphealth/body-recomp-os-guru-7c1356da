import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, CheckCircle2, Loader2, Sparkles, Lock, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getUTM } from '@/lib/utm';
import { hasSubscribed } from './EmailGate';

const STORAGE_KEY = 'gutf_brc_subscribed_v1';

interface Props {
  goalLabel?: string;
  calorieTarget?: number;
  proteinGrams?: number;
  workoutFrequency?: number;
  source?: 'inline_results' | 'plan_gate' | 'pdf_unlock' | 'footer';
}

const InlineEmailCapture = ({
  goalLabel,
  calorieTarget,
  proteinGrams,
  workoutFrequency,
  source = 'inline_results',
}: Props) => {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [alreadySubscribed, setAlreadySubscribed] = useState(false);

  useEffect(() => {
    if (hasSubscribed()) setAlreadySubscribed(true);
  }, []);

  const resetSubscription = () => {
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    setAlreadySubscribed(false);
    setDone(false);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email');
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
          consent: true,
          utm: getUTM(),
        },
      });
      if (error || (data as any)?.error) throw new Error((data as any)?.error || error?.message || 'Failed');
      try { localStorage.setItem(STORAGE_KEY, email); } catch {}
      try {
        (window as any).dataLayer?.push({ event: 'lead_capture', source, goal: goalLabel });
      } catch {}
      setDone(true);
      toast.success('Check your inbox — your plan is on its way!');
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="relative overflow-hidden rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-card to-card p-5 md:p-6 mb-6 card-glow"
      data-no-print
    >
      <div className="absolute -top-20 -right-20 w-72 h-72 bg-primary/15 rounded-full blur-3xl pointer-events-none" />

      {alreadySubscribed && !done ? (
        <div className="relative flex items-center gap-4 py-2">
          <div className="w-12 h-12 rounded-full bg-primary/15 border-2 border-primary flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold font-['Oswald'] uppercase">You're already subscribed</h3>
            <p className="text-sm text-muted-foreground">Your 21-day coaching series is queued. Want to use a different email? <button type="button" onClick={resetSubscription} className="underline text-primary hover:opacity-80">Subscribe again</button>.</p>
          </div>
        </div>
      ) : !done ? (
        <div className="relative grid md:grid-cols-[1fr_auto] gap-5 items-center">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-primary bg-primary/10 border border-primary/30 rounded-full px-2.5 py-1">
                <Gift className="w-3 h-3" /> Free · Limited
              </span>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">No spam, unsubscribe anytime</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold font-['Oswald'] uppercase tracking-wide leading-tight mb-1.5">
              Email me my full <span className="text-primary">{(goalLabel || 'recomp').toLowerCase()}</span> playbook
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Premium PDF + 21-day coaching series from Alex (head coach, 18 yrs). Calories, macros, training, recovery — everything.
            </p>
          </div>

          <form onSubmit={submit} className="w-full md:w-[340px] space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="text"
                placeholder="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value.slice(0, 60))}
                maxLength={60}
                autoComplete="given-name"
                className="h-11 text-sm"
              />
              <div className="relative">
                <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  type="email"
                  required
                  placeholder="you@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value.slice(0, 255))}
                  maxLength={255}
                  autoComplete="email"
                  className="h-11 pl-8 text-sm"
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-gradient-to-r from-primary to-primary/80 hover:opacity-90 font-bold uppercase tracking-[0.12em] shadow-lg shadow-primary/40"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending…</>
              ) : (
                <><Sparkles className="w-4 h-4 mr-2" /> Send My Plan</>
              )}
            </Button>
            <p className="text-[10px] text-muted-foreground/80 text-center leading-snug flex items-center justify-center gap-1">
              <Lock className="w-2.5 h-2.5" /> By continuing you accept our{' '}
              <a href="https://gearuptofit.com/privacy-policy/" target="_blank" rel="noopener" className="underline hover:text-primary">privacy policy</a>.
            </p>
          </form>
        </div>
      ) : (
        <div className="relative flex items-center gap-4 py-2">
          <div className="w-12 h-12 rounded-full bg-primary/15 border-2 border-primary flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-bold font-['Oswald'] uppercase">You're in. Check your inbox!</h3>
            <p className="text-sm text-muted-foreground">Your Day-0 welcome email and plan are landing now. Whitelist <strong>info@gearuptofit.com</strong> so future emails skip spam.</p>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default InlineEmailCapture;
