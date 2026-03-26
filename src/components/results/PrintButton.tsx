import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PrintButton = () => {
  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-2 border-border/50 hover:border-primary/40"
      onClick={() => window.print()}
    >
      <Printer className="h-4 w-4" /> Print Plan
    </Button>
  );
};

export default PrintButton;
