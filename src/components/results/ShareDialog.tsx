import { Share2, Link2, Twitter, MessageCircle, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

const ShareDialog = ({ goalLabel }: { goalLabel: string }) => {
  const url = window.location.href;
  const text = `Just built my 8-week ${goalLabel.toLowerCase()} plan with @GearUpToFit!`;

  const copyLink = () => {
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard!');
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 border-border/50 hover:border-primary/40">
          <Share2 className="h-4 w-4" /> Share Plan
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-['Oswald'] tracking-wider">SHARE YOUR PLAN</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 pt-2">
          <Button variant="outline" className="w-full justify-start gap-3 h-12 border-border/50 hover:border-primary/30" onClick={copyLink}>
            <Link2 className="h-4 w-4 text-primary" /> Copy Link
          </Button>
          <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" className="block">
            <Button variant="outline" className="w-full justify-start gap-3 h-12 border-border/50 hover:border-primary/30">
              <Twitter className="h-4 w-4 text-primary" /> Share to Twitter
            </Button>
          </a>
          <a href={`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`} target="_blank" rel="noopener noreferrer" className="block">
            <Button variant="outline" className="w-full justify-start gap-3 h-12 border-border/50 hover:border-primary/30">
              <MessageCircle className="h-4 w-4 text-primary" /> Share to WhatsApp
            </Button>
          </a>
          <Button variant="outline" className="w-full justify-start gap-3 h-12 border-border/50 hover:border-primary/30 opacity-60" onClick={() => toast.info('PDF export coming soon!')}>
            <FileDown className="h-4 w-4 text-primary" /> Download as PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareDialog;
