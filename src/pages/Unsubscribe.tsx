import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle2, Loader2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const Unsubscribe = () => {
  const [params] = useSearchParams();
  const [email, setEmail] = useState(params.get('email') || '');
  const [reason, setReason] = useState<string>('too_many_emails');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('email-unsubscribe', {
        body: { email: email.trim().toLowerCase(), reason },
      });
      if (error) throw error;
      setDone(true);
    } catch (err) {
      console.error(err);
      toast.error('Could not unsubscribe — please email info@gearuptofit.com');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-16 bg-background">
      <div className="w-full max-w-md rounded-2xl border border-primary/15 bg-card/90 p-8 shadow-2xl">
        {done ? (
          <div className="text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-primary/15 border-2 border-primary flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold uppercase font-['Oswald'] mb-2">You're unsubscribed</h1>
            <p className="text-sm text-muted-foreground">
              {email} will no longer receive marketing emails from GearUpToFit.
              <br />Sorry to see you go — you can re-subscribe anytime by re-running your plan.
            </p>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold uppercase font-['Oswald'] mb-2">Unsubscribe</h1>
            <p className="text-sm text-muted-foreground mb-5">
              Confirm your email to stop receiving the body recomp coaching series. Transactional
              emails (your plan PDF) will keep working.
            </p>
            <form onSubmit={submit} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value.slice(0, 255))}
                  className="h-11 pl-9"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Why are you leaving? (optional)
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full h-11 rounded-md border border-border bg-background px-3 text-sm"
                >
                  <option value="too_many_emails">Too many emails</option>
                  <option value="not_relevant">Not relevant to me</option>
                  <option value="never_signed_up">I never signed up</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-primary to-primary/80 font-bold uppercase tracking-[0.12em]"
              >
                {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Unsubscribing…</> : 'Confirm Unsubscribe'}
              </Button>
            </form>
          </>
        )}
      </div>
    </main>
  );
};

export default Unsubscribe;
