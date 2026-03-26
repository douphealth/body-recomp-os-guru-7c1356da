import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Beef, ArrowRight } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import JsonLd from '@/components/JsonLd';
import AnimatedNumber from '@/components/AnimatedNumber';

const proteinFoods = [
  { food: 'Chicken Breast', serving: '150g', protein: 46 },
  { food: 'Greek Yogurt', serving: '200g', protein: 20 },
  { food: 'Eggs (3 large)', serving: '150g', protein: 18 },
  { food: 'Salmon Fillet', serving: '150g', protein: 34 },
  { food: 'Lean Ground Beef', serving: '150g', protein: 38 },
  { food: 'Cottage Cheese', serving: '200g', protein: 24 },
  { food: 'Whey Protein Shake', serving: '1 scoop', protein: 25 },
  { food: 'Lentils (cooked)', serving: '200g', protein: 18 },
  { food: 'Tofu (firm)', serving: '150g', protein: 15 },
  { food: 'Tuna (canned)', serving: '130g', protein: 33 },
];

const ProteinCalculator = () => {
  const [weight, setWeight] = useState(80);
  const [bf, setBf] = useState(20);
  const [goal, setGoal] = useState('muscle-gain');
  const [activity, setActivity] = useState('moderate');
  const [result, setResult] = useState<any>(null);

  const calculate = () => {
    const lbm = weight * (1 - bf / 100);
    const mult = goal === 'fat-loss' ? { bw: 1.8, lbm: 2.2, pct: 30 } : goal === 'muscle-gain' ? { bw: 2.0, lbm: 2.2, pct: 30 } : { bw: 1.6, lbm: 1.8, pct: 25 };
    if (activity === 'high') { mult.bw += 0.2; mult.lbm += 0.2; }
    const methods = [
      { name: 'g/kg BW', value: Math.round(weight * mult.bw) },
      { name: 'g/kg LBM', value: Math.round(lbm * mult.lbm) },
      { name: '% Calories', value: Math.round((weight * 30 * mult.pct / 100) / 4) },
    ];
    const low = Math.min(...methods.map(m => m.value));
    const high = Math.max(...methods.map(m => m.value));
    setResult({ low, high, methods, lbm: Math.round(lbm * 10) / 10 });
  };

  const schema = { '@context': 'https://schema.org', '@type': 'WebApplication', name: 'Protein Calculator — GearUpToFit', applicationCategory: 'HealthApplication', operatingSystem: 'Web', offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' } };

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead title="Protein Intake Calculator — How Much Protein Do You Need? | GearUpToFit" description="Calculate your optimal daily protein intake based on body weight, lean mass, and fitness goals. Compare methods and find high-protein foods." path="/tools/protein-calculator" />
      <JsonLd data={schema} />
      <Header />
      <main className="flex-1 py-8 md:py-16">
        <div className="container max-w-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex h-12 w-12 rounded-xl gradient-red items-center justify-center mb-4 shadow-lg shadow-primary/20">
              <Beef className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">PROTEIN CALCULATOR</h1>
            <p className="text-muted-foreground text-sm max-w-lg mx-auto">Find your optimal daily protein intake using multiple evidence-based methods. Protein is the most critical macronutrient for body composition.</p>
          </div>

          <div className="stat-card space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div><Label className="text-xs text-muted-foreground uppercase tracking-wider">Weight (kg)</Label><Input type="number" value={weight} onChange={e => setWeight(+e.target.value)} className="mt-1.5 h-12 text-lg font-semibold bg-secondary/30 border-border/50" /></div>
              <div><Label className="text-xs text-muted-foreground uppercase tracking-wider">Body Fat % (est.)</Label><Input type="number" value={bf} onChange={e => setBf(+e.target.value)} className="mt-1.5 h-12 text-lg font-semibold bg-secondary/30 border-border/50" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">Goal</Label>
                <Select value={goal} onValueChange={setGoal}><SelectTrigger className="mt-1.5 h-12 bg-secondary/30 border-border/50"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="fat-loss">Fat Loss</SelectItem><SelectItem value="muscle-gain">Muscle Gain</SelectItem><SelectItem value="maintenance">Maintenance</SelectItem></SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">Activity</Label>
                <Select value={activity} onValueChange={setActivity}><SelectTrigger className="mt-1.5 h-12 bg-secondary/30 border-border/50"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="moderate">Moderate</SelectItem><SelectItem value="high">High</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={calculate} className="w-full h-12 gradient-red border-0 font-bold text-lg shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.01] transition-all">Calculate Protein</Button>
          </div>

          {result && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mt-6 space-y-4">
              <div className="stat-card text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">Recommended Range</p>
                <div className="flex items-baseline justify-center gap-2">
                  <AnimatedNumber value={result.low} className="text-4xl font-bold text-primary font-['Oswald']" />
                  <span className="text-muted-foreground">—</span>
                  <AnimatedNumber value={result.high} className="text-4xl font-bold text-primary font-['Oswald']" />
                  <span className="text-lg text-muted-foreground font-['Oswald']">g/day</span>
                </div>
              </div>

              <div className="stat-card">
                <h3 className="text-sm font-bold uppercase tracking-wider mb-4 font-['Oswald']">Method Comparison</h3>
                <div className="h-[160px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={result.methods} barSize={36}>
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(220, 10%, 55%)' }} />
                      <YAxis hide />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]} label={{ position: 'top', fontSize: 12, fill: 'hsl(0, 0%, 90%)', fontWeight: 700 }}>
                        {result.methods.map((_: any, i: number) => <Cell key={i} fill={i === 0 ? '#ef4444' : i === 1 ? '#f97316' : '#eab308'} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="stat-card">
                <h3 className="text-sm font-bold uppercase tracking-wider mb-4 font-['Oswald']">High-Protein Foods</h3>
                <Table>
                  <TableHeader><TableRow className="border-border/30"><TableHead className="text-xs">Food</TableHead><TableHead className="text-xs">Serving</TableHead><TableHead className="text-xs text-right">Protein</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {proteinFoods.map(f => (
                      <TableRow key={f.food} className="border-border/20"><TableCell className="text-sm">{f.food}</TableCell><TableCell className="text-sm text-muted-foreground">{f.serving}</TableCell><TableCell className="text-sm text-right font-bold text-primary">{f.protein}g</TableCell></TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <Link to="/app/body-recomp" className="block">
                <div className="stat-card flex items-center gap-4 cursor-pointer group border-primary/20 bg-primary/5">
                  <div className="flex-1"><p className="text-sm font-bold group-hover:text-primary transition-colors">Build a full nutrition and training plan</p><p className="text-xs text-muted-foreground">Build My Plan →</p></div>
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

export default ProteinCalculator;
