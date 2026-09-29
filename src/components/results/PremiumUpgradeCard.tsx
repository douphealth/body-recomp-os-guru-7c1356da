import { useCallback, useEffect, useMemo, useState } from 'react';
import { BadgeCheck, CalendarCheck2, CheckCircle2, CreditCard, Download, Loader2, LockKeyhole, RefreshCw, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { toast } from 'sonner';
import {
  getBillingConfig,
  getBillingStatus,
  getPremiumRoadmap,
  openBillingPortal,
  startCheckout,
  type BillingConfig,
  type BillingStatus,
  type PremiumRoadmap,
} from '@/lib/billing';
import { getPlanPdf } from '@/lib/plan-store';
import { trackEvent } from '@/lib/tracking';

interface Props { shareToken: string | null; }

const freeStatus: BillingStatus = {
  active: false,
  tier: 'free',
  status: 'inactive',
  mode: null,
  expiresAt: null,
  canManageBilling: false,
};

const PremiumUpgradeCard = ({ shareToken }: Props) => {
  const [config, setConfig] = useState<BillingConfig | null>(null);
  const [status, setStatus] = useState<BillingStatus>(freeStatus);
  const [roadmap, setRoadmap] = useState<PremiumRoadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<'checkout' | 'portal' | 'pdf' | 'refresh' | null>(null);

  const priceText = useMemo(() => {
    if (!config?.priceLabel) return 'Secure Stripe checkout';
    if (config.mode === 'subscription' && config.interval) {
      const count = config.intervalCount && config.intervalCount > 1 ? `${config.intervalCount} ` : '';
      return `${config.priceLabel} / ${count}${config.interval}`;
    }
    return `${config.priceLabel} one-time`;
  }, [config]);

  const loadRoadmap = useCallback(async (token: string) => {
    try { setRoadmap(await getPremiumRoadmap(token)); }
    catch (error) { console.error('premium roadmap failed', error); setRoadmap(null); }
  }, []);

  const refresh = useCallback(async (sessionId?: string | null) => {
    if (!shareToken) return;
    const nextStatus = await getBillingStatus(shareToken, sessionId);
    setStatus(nextStatus);
    if (nextStatus.active) await loadRoadmap(shareToken);
  }, [loadRoadmap, shareToken]);

  useEffect(() => {
    let cancelled = false;
    const boot = async () => {
      if (!shareToken) { setLoading(false); return; }
      setLoading(true);
      const params = new URLSearchParams(window.location.search);
      const checkout = params.get('checkout');
      const sessionId = params.get('session_id');
      try {
        const [nextConfig, nextStatus] = await Promise.all([
          getBillingConfig().catch(() => ({ configured: false } as BillingConfig)),
          getBillingStatus(shareToken, checkout === 'success' ? sessionId : null),
        ]);
        if (cancelled) return;
        setConfig(nextConfig);
        setStatus(nextStatus);
        if (nextStatus.active) await loadRoadmap(shareToken);

        if (checkout === 'success' && nextStatus.active) {
          trackEvent('pro_purchase_verified', { mode: nextStatus.mode || 'unknown' });
          toast.success('Body Recomp OS Pro is active.');
        } else if (checkout === 'success') {
          toast.info('Payment received. Finalizing access now.');
        } else if (checkout === 'cancelled') {
          toast.info('Checkout cancelled. Your free plan is unchanged.');
        }

        if (checkout) window.history.replaceState({}, document.title, window.location.pathname);
      } catch (error) {
        console.error('billing boot failed', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    boot();
    return () => { cancelled = true; };
  }, [loadRoadmap, shareToken]);

  const checkout = async () => {
    if (!shareToken || busy) return;
    setBusy('checkout');
    try {
      trackEvent('pro_checkout_started');
      const result = await startCheckout(shareToken);
      if (result.alreadyActive) {
        await refresh();
        toast.success('Pro is already active on this plan.');
      } else if (result.url) {
        window.location.assign(result.url);
      } else {
        throw new Error('Missing checkout URL');
      }
    } catch (error) {
      console.error('checkout failed', error);
      toast.error('Secure checkout could not start. Please try again.');
    } finally { setBusy(null); }
  };

  const refreshStatus = async () => {
    if (!shareToken || busy) return;
    setBusy('refresh');
    try { await refresh(); toast.success('Payment status refreshed.'); }
    catch (error) { console.error(error); toast.error('Could not refresh payment status.'); }
    finally { setBusy(null); }
  };

  const portal = async () => {
    if (!shareToken || busy) return;
    setBusy('portal');
    try { window.location.assign((await openBillingPortal(shareToken)).url); }
    catch (error) { console.error(error); toast.error('Could not open subscription management.'); }
    finally { setBusy(null); }
  };

  const proPdf = async () => {
    if (!shareToken || busy) return;
    setBusy('pdf');
    try {
      const pdf = await getPlanPdf(shareToken, true, true);
      if (!pdf?.signedUrl) throw new Error('Missing Pro report URL');
      trackEvent('pro_report_downloaded');
      window.open(pdf.signedUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error(error);
      toast.error('Could not generate the Pro report.');
    } finally { setBusy(null); }
  };

  if (loading) {
    return (
      <section className="mt-8 rounded-2xl border border-primary/20 bg-card/70 p-6">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-primary" /> Checking Pro access...
        </div>
      </section>
    );
  }

  if (status.active) {
    return (
      <section className="mt-8 overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-card to-card">
        <div className="p-6 md:p-7 border-b border-border/50">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-[0.18em]">
                <BadgeCheck className="h-4 w-4" /> Pro active
              </div>
              <h2 className="mt-2 text-2xl font-bold font-['Oswald'] tracking-wide">YOUR PRO EXECUTION ROADMAP</h2>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                Follow the plan in deliberate review cycles, keep variables stable long enough to learn from the trend, and adjust one major lever at a time.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className="gap-2" onClick={proPdf} disabled={Boolean(busy)}>
                {busy === 'pdf' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />} Pro report
              </Button>
              {status.canManageBilling && (
                <Button variant="outline" size="sm" className="gap-2" onClick={portal} disabled={Boolean(busy)}>
                  {busy === 'portal' ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />} Manage billing
                </Button>
              )}
            </div>
          </div>
        </div>

        {roadmap ? (
          <div className="p-5 md:p-7">
            <Accordion type="single" collapsible defaultValue="week-1" className="space-y-2">
              {roadmap.weeks.map((week) => (
                <AccordionItem key={week.week} value={`week-${week.week}`} className="rounded-xl border border-border/50 px-4 data-[state=open]:border-primary/30">
                  <AccordionTrigger className="hover:no-underline">
                    <span className="flex min-w-0 items-center gap-3 text-left">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">{week.week}</span>
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold">{week.phase}</span>
                        <span className="block truncate text-xs text-muted-foreground">{week.focus}</span>
                      </span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Execution checkpoints</p>
                        {week.checkpoints.map((item) => (
                          <div key={item} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><span>{item}</span>
                          </div>
                        ))}
                      </div>
                      <div className="space-y-3 rounded-xl border border-border/50 bg-secondary/20 p-4 text-sm">
                        <div><span className="font-semibold">Training:</span> <span className="text-muted-foreground">{week.intensity}</span></div>
                        <div><span className="font-semibold">Volume:</span> <span className="text-muted-foreground">{week.volume}</span></div>
                        <div><span className="font-semibold">Nutrition:</span> <span className="text-muted-foreground">{week.nutritionFocus}</span></div>
                        <div><span className="font-semibold">Review:</span> <span className="text-muted-foreground">{week.reviewPrompt}</span></div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            <div className="mt-5 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-amber-300">Safety guardrails</p>
              <ul className="mt-2 space-y-1.5 text-xs text-muted-foreground">
                {roadmap.guardrails.map((item) => <li key={item}>• {item}</li>)}
              </ul>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <Button variant="outline" className="gap-2" onClick={refreshStatus} disabled={Boolean(busy)}>
              {busy === 'refresh' ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} Refresh Pro roadmap
            </Button>
          </div>
        )}
      </section>
    );
  }

  return (
    <section className="mt-8 overflow-hidden rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/12 via-card to-card shadow-xl shadow-primary/5">
      <div className="grid gap-6 p-6 md:grid-cols-[1.25fr_0.75fr] md:p-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-primary">
            <Sparkles className="h-4 w-4" /> Optional Pro upgrade
          </div>
          <h2 className="mt-2 text-2xl md:text-3xl font-bold font-['Oswald'] tracking-wide">TURN THE FREE PLAN INTO AN 8-WEEK EXECUTION SYSTEM</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Your current plan stays free. Pro adds a server-verified week-by-week roadmap, review checkpoints, a secure premium report, and subscription management when the configured Stripe price is recurring.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {[
              [CalendarCheck2, '8-week execution roadmap', 'Weekly focus, checkpoints, review prompts, and deload context.'],
              [ShieldCheck, 'Server-verified access', 'Paid features unlock only after Stripe confirms entitlement.'],
              [Download, 'Secure Pro report', 'Server-generated report with a signed download URL.'],
              [LockKeyhole, 'No account required', 'Access stays tied to the private plan link you already use.'],
            ].map(([Icon, title, copy]) => {
              const FeatureIcon = Icon as typeof CalendarCheck2;
              return (
                <div key={String(title)} className="rounded-xl border border-border/50 bg-background/30 p-4">
                  <FeatureIcon className="h-4 w-4 text-primary" />
                  <p className="mt-2 text-sm font-semibold">{String(title)}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{String(copy)}</p>
                </div>
              );
            })}
          </div>
        </div>
        <div className="rounded-2xl border border-border/60 bg-background/50 p-5 md:p-6 self-start">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Body Recomp OS Pro</p>
          <p className="mt-2 text-2xl font-bold">{config?.priceLabel || 'Pro'}</p>
          <p className="mt-1 text-xs text-muted-foreground">{priceText}</p>
          <div className="mt-5 space-y-2 text-xs text-muted-foreground">
            <p className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Free plan remains fully usable</p>
            <p className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Stripe-hosted secure checkout</p>
            <p className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Instant server-side verification</p>
          </div>
          <Button className="mt-6 w-full gap-2 gradient-red border-0 font-bold" onClick={checkout} disabled={!shareToken || !config?.configured || Boolean(busy)}>
            {busy === 'checkout' ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
            {busy === 'checkout' ? 'Opening checkout...' : 'Unlock Pro securely'}
          </Button>
          {!shareToken && <p className="mt-3 text-center text-[11px] text-muted-foreground">Saving your plan before secure checkout...</p>}
          {config?.configured === false && <p className="mt-3 text-center text-[11px] text-amber-300">Pro checkout is not configured on the server yet.</p>}
          <p className="mt-3 flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5" /> Payment details are handled by Stripe, not stored by this app.
          </p>
        </div>
      </div>
    </section>
  );
};

export default PremiumUpgradeCard;
