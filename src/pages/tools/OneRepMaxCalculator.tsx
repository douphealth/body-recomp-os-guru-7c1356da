import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dumbbell, ArrowRight } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import JsonLd from '@/components/JsonLd';
import AnimatedNumber from '@/components/AnimatedNumber';

const percentages = [
  { pct: 100, reps: '1 (max)' },
  { pct: 95, reps: '2' },
  { pct: 90, reps: '4' },
  { pct: 85, reps: '6' },
  { pct: 80, reps: '8' },
  { pct: 75, reps: '10' },
  { pct: 70, reps: '12' },
  { pct: 65, reps: '15' },
];

const OneRepMaxCalculator = () => {
  const [weight, setWeight] = useState(100);
  const [reps, setReps] = useState(5);
  const [exercise, setExercise] = useState('Bench Press');
  const [result, setResult] = useState<number | null>(null);

  const calculate = () => {
    const oneRM = Math.round(weight * (1 + reps / 30));
    setResult(oneRM);
  };

  const schema = { '@context': 'https://schema.org', '@type': 'WebApplication', name: 'One-Rep Max Calculator — GearUpToFit', applicationCategory: 'HealthApplication', operatingSystem: 'Web', offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' } };

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead title="One-Rep Max (1RM) Calculator — Estimate Your Max Lift | GearUpToFit" description="Calculate your estimated one-rep max using the Epley formula. Get training load percentages for any rep range." path="/free-fitness-calculators/one-rep-max-calculator" />
      <JsonLd data={schema} />
      <Header />
      <main className="flex-1 py-8 md:py-16">
        <div className="container max-w-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex h-12 w-12 rounded-xl gradient-red items-center justify-center mb-4 shadow-lg shadow-primary/20">
              <Dumbbell className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">1RM CALCULATOR</h1>
            <p className="text-muted-foreground text-sm max-w-lg mx-auto">Estimate your one-rep max and get training percentages for progressive overload programming.</p>
          </div>

          <div className="stat-card space-y-5">
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">Exercise</Label>
              <Input value={exercise} onChange={e => setExercise(e.target.value)} className="mt-1.5 h-12 text-lg font-semibold bg-secondary/30 border-border/50" placeholder="e.g., Bench Press" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label className="text-xs text-muted-foreground uppercase tracking-wider">Weight Lifted (kg)</Label><Input type="number" value={weight} onChange={e => setWeight(+e.target.value)} className="mt-1.5 h-12 text-lg font-semibold bg-secondary/30 border-border/50" /></div>
              <div><Label className="text-xs text-muted-foreground uppercase tracking-wider">Reps Completed</Label><Input type="number" value={reps} onChange={e => setReps(+e.target.value)} min={1} max={30} className="mt-1.5 h-12 text-lg font-semibold bg-secondary/30 border-border/50" /></div>
            </div>
            <Button onClick={calculate} className="w-full h-12 gradient-red border-0 font-bold text-lg shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.01] transition-all">Calculate 1RM</Button>
          </div>

          {result && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mt-6 space-y-4">
              <div className="stat-card text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">{exercise} — Estimated 1RM</p>
                <AnimatedNumber value={result} className="text-5xl md:text-6xl font-bold text-primary font-['Oswald']" suffix=" kg" />
              </div>

              <div className="stat-card">
                <h3 className="text-sm font-bold uppercase tracking-wider mb-4 font-['Oswald']">Training Load Table</h3>
                <Table>
                  <TableHeader><TableRow className="border-border/30"><TableHead className="text-xs">% of 1RM</TableHead><TableHead className="text-xs">Weight (kg)</TableHead><TableHead className="text-xs text-right">Target Reps</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {percentages.map(p => (
                      <TableRow key={p.pct} className={`border-border/20 ${p.pct === 100 ? 'bg-primary/5' : ''}`}>
                        <TableCell className="text-sm font-medium">{p.pct}%</TableCell>
                        <TableCell className="text-sm font-bold text-primary">{Math.round(result * p.pct / 100)} kg</TableCell>
                        <TableCell className="text-sm text-right text-muted-foreground">{p.reps}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="stat-card">
                <p className="text-xs text-muted-foreground leading-relaxed">This uses the <strong className="text-foreground">Epley formula</strong>: 1RM = weight × (1 + reps/30). Most accurate for 1–10 rep ranges. For best results, use a weight you can lift with good form.</p>
              </div>

              <Link to="/build-my-plan" className="block">
                <div className="stat-card flex items-center gap-4 cursor-pointer group border-primary/20 bg-primary/5">
                  <div className="flex-1"><p className="text-sm font-bold group-hover:text-primary transition-colors">Get an 8-week program with progressive overload</p><p className="text-xs text-muted-foreground">Build My Plan →</p></div>
                  <ArrowRight className="h-5 w-5 text-primary" />
                </div>
              </Link>
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OneRepMaxCalculator;
