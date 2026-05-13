import { useMemo, useState } from 'react';
import {
  Share2, Link2, Twitter, MessageCircle, Download, Loader2, Mail, Facebook, Linkedin,
  Send, Copy, Check, Sparkles, FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { type PlanResults, type UserInputs } from '@/lib/calculations';

interface ShareDialogProps {
  goalLabel: string;
  plan?: PlanResults;
  inputs?: UserInputs;
}

const RedditIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.6 0 12 0zm6.7 13.6c0 .2.1.4.1.6 0 3-3.5 5.4-7.8 5.4s-7.8-2.4-7.8-5.4c0-.2 0-.4.1-.6-.6-.3-1-.9-1-1.6 0-1 .8-1.8 1.8-1.8.5 0 .9.2 1.3.5 1.3-.9 3-1.4 5-1.5l1-4.5 3.2.7c.2-.5.7-.9 1.3-.9.8 0 1.4.6 1.4 1.4s-.6 1.4-1.4 1.4c-.7 0-1.3-.5-1.4-1.2l-2.8-.6-.9 4c2 .1 3.7.7 5 1.5.3-.3.8-.5 1.3-.5 1 0 1.8.8 1.8 1.8 0 .8-.4 1.4-1 1.7zM8.4 13.4c0-.7.5-1.2 1.2-1.2.7 0 1.2.5 1.2 1.2 0 .7-.5 1.2-1.2 1.2-.7 0-1.2-.5-1.2-1.2zm6.1 3c-.8.8-2.3.9-2.5.9s-1.7-.1-2.5-.9c-.1-.1-.1-.3 0-.4s.3-.1.4 0c.5.5 1.6.7 2.1.7s1.6-.2 2.1-.7c.1-.1.3-.1.4 0 .1.1.1.3 0 .4zm-.3-1.7c-.7 0-1.2-.5-1.2-1.2 0-.7.5-1.2 1.2-1.2.7 0 1.2.5 1.2 1.2 0 .6-.5 1.2-1.2 1.2z" />
  </svg>
);

const ShareDialog = ({ goalLabel, plan, inputs }: ShareDialogProps) => {
  const [generating, setGenerating] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);

  const url = typeof window !== 'undefined' ? window.location.href : '';

  const shortText = `My free 8-week ${goalLabel.toLowerCase()} plan from @GearUpToFit 💪`;

  const richSummary = useMemo(() => {
    if (!plan || !inputs) return shortText;
    return [
      `🔥 My 8-Week ${plan.goalLabel} Plan`,
      ``,
      `🎯 Calories: ${plan.calorieTarget} kcal/day`,
      `🥩 Protein: ${plan.proteinGrams}g  •  🍞 Carbs: ${plan.carbGrams}g  •  🥑 Fat: ${plan.fatGrams}g`,
      `🏋️ Training: ${inputs.workoutFrequency}x/week  •  👟 Steps: ${inputs.stepCount.toLocaleString()}/day`,
      `💧 Water: ${plan.waterLiters}L  •  🌿 Fiber: ${plan.fiberGrams}g`,
      ``,
      `Built free in 2 minutes — get yours:`,
      url,
    ].join('\n');
  }, [plan, inputs, url, shortText]);

  const encUrl = encodeURIComponent(url);
  const encShort = encodeURIComponent(shortText);
  const encRich = encodeURIComponent(richSummary);
  const encTitle = encodeURIComponent(`My 8-Week ${goalLabel} Plan`);

  const channels: { name: string; icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; href: string; color: string }[] = [
    { name: 'X / Twitter', icon: Twitter, href: `https://twitter.com/intent/tweet?text=${encShort}&url=${encUrl}`, color: 'text-foreground' },
    { name: 'WhatsApp', icon: MessageCircle, href: `https://wa.me/?text=${encShort}%20${encUrl}`, color: 'text-green-400' },
    { name: 'Telegram', icon: Send, href: `https://t.me/share/url?url=${encUrl}&text=${encShort}`, color: 'text-sky-400' },
    { name: 'Facebook', icon: Facebook, href: `https://www.facebook.com/sharer/sharer.php?u=${encUrl}&quote=${encShort}`, color: 'text-blue-500' },
    { name: 'LinkedIn', icon: Linkedin, href: `https://www.linkedin.com/sharing/share-offsite/?url=${encUrl}`, color: 'text-blue-400' },
    { name: 'Reddit', icon: RedditIcon, href: `https://www.reddit.com/submit?url=${encUrl}&title=${encTitle}`, color: 'text-orange-400' },
    { name: 'Email', icon: Mail, href: `mailto:?subject=${encTitle}&body=${encRich}`, color: 'text-amber-400' },
  ];

  const copy = async (text: string, kind: 'link' | 'summary') => {
    try {
      await navigator.clipboard.writeText(text);
      if (kind === 'link') {
        setCopiedLink(true);
        toast.success('Link copied!');
        setTimeout(() => setCopiedLink(false), 1800);
      } else {
        setCopiedSummary(true);
        toast.success('Summary copied — paste anywhere!');
        setTimeout(() => setCopiedSummary(false), 1800);
      }
    } catch {
      toast.error('Could not copy. Long-press to copy manually.');
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && (navigator as Navigator & { share?: (d: ShareData) => Promise<void> }).share) {
      try {
        await (navigator as Navigator & { share: (d: ShareData) => Promise<void> }).share({
          title: `My 8-Week ${goalLabel} Plan`,
          text: shortText,
          url,
        });
      } catch {
        /* user cancelled — silent */
      }
    } else {
      copy(url, 'link');
    }
  };

  const handlePDF = async () => {
    if (!plan || !inputs) {
      toast.info('PDF export coming soon!');
      return;
    }
    setGenerating(true);
    try {
      const { generatePlanPDF } = await import('@/lib/pdf-generator');
      await generatePlanPDF(plan, inputs);
      toast.success('Your premium PDF has been downloaded!');
    } catch {
      toast.error('Failed to generate PDF.');
    } finally {
      setGenerating(false);
    }
  };

  const hasNativeShare = typeof navigator !== 'undefined' && 'share' in navigator;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="gap-2 gradient-red border-0 font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all hover:scale-[1.02]"
        >
          <Share2 className="h-4 w-4" /> Share Plan
        </Button>
      </DialogTrigger>

      <DialogContent className="bg-card border-border max-w-md p-0 overflow-hidden">
        {/* Header with gradient */}
        <div className="relative bg-gradient-to-br from-primary/20 via-primary/10 to-transparent p-5 border-b border-border/50">
          <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <DialogHeader className="relative space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Share & Save</span>
            </div>
            <DialogTitle className="font-['Oswald'] tracking-wider text-xl">SHARE YOUR PLAN</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Inspire a friend or save it for yourself — every channel, one tap.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Primary actions */}
          <div className="grid grid-cols-2 gap-2">
            {hasNativeShare && (
              <Button
                onClick={handleNativeShare}
                className="col-span-2 gap-2 h-11 gradient-red border-0 font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
              >
                <Share2 className="h-4 w-4" /> Quick Share…
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => copy(url, 'link')}
              className="gap-2 h-11 border-border/50 hover:border-primary/40 hover:bg-primary/5"
            >
              {copiedLink ? <Check className="h-4 w-4 text-green-400" /> : <Link2 className="h-4 w-4 text-primary" />}
              {copiedLink ? 'Copied!' : 'Copy Link'}
            </Button>
            <Button
              variant="outline"
              onClick={() => copy(richSummary, 'summary')}
              className="gap-2 h-11 border-border/50 hover:border-primary/40 hover:bg-primary/5"
            >
              {copiedSummary ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4 text-primary" />}
              {copiedSummary ? 'Copied!' : 'Copy Summary'}
            </Button>
          </div>

          {/* Preview */}
          <div className="rounded-xl border border-border/50 bg-secondary/20 p-3">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-3 w-3 text-muted-foreground" />
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Share preview</span>
            </div>
            <pre className="text-[11px] leading-relaxed text-muted-foreground whitespace-pre-wrap font-sans line-clamp-6">{richSummary}</pre>
          </div>

          {/* Social channels */}
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Share to</p>
            <div className="grid grid-cols-4 gap-2">
              {channels.map((c) => (
                <a
                  key={c.name}
                  href={c.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Share to ${c.name}`}
                  className="group flex flex-col items-center gap-1.5 rounded-xl border border-border/50 bg-secondary/20 p-2.5 hover:border-primary/40 hover:bg-primary/5 hover:-translate-y-0.5 transition-all"
                >
                  <c.icon className={`h-5 w-5 ${c.color} group-hover:scale-110 transition-transform`} />
                  <span className="text-[9px] text-muted-foreground group-hover:text-foreground transition-colors text-center leading-tight">
                    {c.name}
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* Premium PDF */}
          <Button
            onClick={handlePDF}
            disabled={generating}
            className="w-full gap-2 h-12 bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/30 text-foreground hover:from-primary/30 hover:to-primary/20 hover:border-primary/50 transition-all"
          >
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 text-primary animate-spin" />
                <span className="font-semibold">Crafting your PDF…</span>
              </>
            ) : (
              <>
                <Download className="h-4 w-4 text-primary" />
                <span className="font-semibold">Download Premium PDF</span>
                <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary font-bold uppercase tracking-wider">free</span>
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareDialog;
