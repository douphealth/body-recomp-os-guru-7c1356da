import { useState } from 'react';
import { Printer, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { type PlanResults, type UserInputs } from '@/lib/calculations';

interface PrintButtonProps {
  plan: PlanResults;
  inputs: UserInputs;
}

const PrintButton = ({ plan, inputs }: PrintButtonProps) => {
  const [generating, setGenerating] = useState(false);

  const handleDownload = async () => {
    setGenerating(true);
    try {
      const { generatePlanPDF } = await import('@/lib/pdf-generator');
      generatePlanPDF(plan, inputs);
      toast.success('Your plan has been downloaded!');
    } catch (err) {
      console.error('PDF generation failed:', err);
      toast.error('Failed to generate PDF. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-2 border-border/50 hover:border-primary/40"
      onClick={handleDownload}
      disabled={generating}
    >
      {generating ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      {generating ? 'Generating...' : 'Download PDF'}
    </Button>
  );
};

export default PrintButton;
