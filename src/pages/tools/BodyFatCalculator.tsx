import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Scale, ArrowRight } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import JsonLd from '@/components/JsonLd';
import AnimatedNumber from '@/components/AnimatedNumber';

const categories = [
  { label: 'Essential Fat', male: [2, 5], female: [10, 13], color: '#ef4444' },
  { label: 'Athletic', male: [6, 13], female: [14, 20], color: '#f97316' },
  { label: 'Fitness', male: [14, 17], female: [21, 24], color: '#22c55e' },
  { label: 'Average', male: [18, 24], female: [25, 31], color: '#3b82f6' },
  { label: 'Obese', male: [25, 50], female: [32, 50], color: '#6b7280' },
];

const BodyFatCalculator = () => {
  const [sex, setSex] = useState('male');
  const [height, setHeight] = useState(175);
  const [weight, setWeight] = useState(80);
  const [waist, setWaist] = useState(85);
  const [neck, setNeck] = useState(38);
  const [hip, setHip] = useState(95);
  const [useMetric, setUseMetric] = useState(true);
  const [result, setResult] = useState<any>(null);

  const calculate = () => {
    const h = useMetric ? height : height * 2.54;
    const w = useMetric ? waist : waist * 2.54;
    const n = useMetric ? neck : neck * 2.54;
    const hp = useMetric ? hip : hip * 2.54;
    const wt = useMetric ? weight : weight * 0.453592;

    let bf: number;
    if (sex === 'male') {
      bf = 495 / (1.0324 - 0.19077 * Math.log10(w - n) + 0.15456 * Math.log10(h)) - 450;
    } else {
      bf = 495 / (1.29579 - 0.35004 * Math.log10(w + hp - n) + 0.22100 * Math.log10(h)) - 450;
    }
    bf = Math.round(bf * 10) / 10;
    bf = Math.max(3, Math.min(50, bf));

    const fatMass = Math.round(wt * bf / 100 * 10) / 10;
    const leanMass = Math.round((wt - fatMass) * 10) / 10;
    const cat = categories.find(c => {
      const range = sex === 'male' ? c.male : c.female;
      return bf >= range[0] && bf <= range[1];
    }) || categories[4];

    setResult({ bf, fatMass, leanMass, category: cat, totalWeight: Math.round(wt * 10) / 10 });
  };

  const schema = { '@context': 'https://schema.org', '@type': 'WebApplication', name: 'Body Fat Calculator — GearUpToFit', applicationCategory: 'HealthApplication', operatingSystem: 'Web', offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' } };

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead title="Body Fat Calculator — U.S. Navy Method | GearUpToFit" description="Estimate your body fat percentage using the U.S. Navy method. Get your lean mass, fat mass, and body composition category." path="/tools/body-fat-calculator" />
      <JsonLd data={schema} />
      <Header />
      <main className="flex-1 py-8 md:py-16">
        <div className="container max-w-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex h-12 w-12 rounded-xl gradient-red items-center justify-center mb-4 shadow-lg shadow-primary/20">
              <Scale className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">BODY FAT CALCULATOR</h1>
            <p className="text-muted-foreground text-sm max-w-lg mx-auto">Estimate your body fat percentage using the U.S. Navy method — a validated formula using simple body measurements.</p>
          </div>

          <div className="stat-card space-y-5">
            <div className="flex gap-2 mb-2">
              <Button size="sm" variant={useMetric ? 'default' : 'outline'} onClick={() => setUseMetric(true)} className={useMetric ? 'gradient-red border-0' : 'border-border/50'}>Metric (cm/kg)</Button>
              <Button size="sm" variant={!useMetric ? 'default' : 'outline'} onClick={() => setUseMetric(false)} className={!useMetric ? 'gradient-red border-0' : 'border-border/50'}>Imperial (in/lbs)</Button>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">Sex</Label>
              <RadioGroup value={sex} onValueChange={setSex} className="flex gap-2 mt-1.5">
                {['male', 'female'].map(s => (
                  <label key={s} className={`flex-1 flex items-center justify-center h-12 rounded-lg border cursor-pointer transition-all text-sm font-medium ${sex === s ? 'border-primary bg-primary/10 text-primary' : 'border-border/50 bg-secondary/30'}`}>
                    <RadioGroupItem value={s} className="sr-only" />{s === 'male' ? '♂ Male' : '♀ Female'}
                  </label>
                ))}
              </RadioGroup>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div><Label className="text-xs text-muted-foreground uppercase tracking-wider">Height ({useMetric ? 'cm' : 'in'})</Label><Input type="number" value={height} onChange={e => setHeight(+e.target.value)} className="mt-1.5 h-12 text-lg font-semibold bg-secondary/30 border-border/50" /></div>
              <div><Label className="text-xs text-muted-foreground uppercase tracking-wider">Weight ({useMetric ? 'kg' : 'lbs'})</Label><Input type="number" value={weight} onChange={e => setWeight(+e.target.value)} className="mt-1.5 h-12 text-lg font-semibold bg-secondary/30 border-border/50" /></div>
            </div>

            <div className={`grid ${sex === 'female' ? 'grid-cols-3' : 'grid-cols-2'} gap-4`}>
              <div><Label className="text-xs text-muted-foreground uppercase tracking-wider">Waist ({useMetric ? 'cm' : 'in'})</Label><Input type="number" value={waist} onChange={e => setWaist(+e.target.value)} className="mt-1.5 h-12 text-lg font-semibold bg-secondary/30 border-border/50" /></div>
              <div><Label className="text-xs text-muted-foreground uppercase tracking-wider">Neck ({useMetric ? 'cm' : 'in'})</Label><Input type="number" value={neck} onChange={e => setNeck(+e.target.value)} className="mt-1.5 h-12 text-lg font-semibold bg-secondary/30 border-border/50" /></div>
              {sex === 'female' && <div><Label className="text-xs text-muted-foreground uppercase tracking-wider">Hip ({useMetric ? 'cm' : 'in'})</Label><Input type="number" value={hip} onChange={e => setHip(+e.target.value)} className="mt-1.5 h-12 text-lg font-semibold bg-secondary/30 border-border/50" /></div>}
            </div>

            <Button onClick={calculate} className="w-full h-12 gradient-red border-0 font-bold text-lg shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.01] transition-all">Estimate Body Fat</Button>
          </div>

          {result && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mt-6 space-y-4">
              <div className="stat-card text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">Estimated Body Fat</p>
                <AnimatedNumber value={result.bf} className="text-5xl md:text-6xl font-bold text-primary font-['Oswald']" suffix="%" />
                <Badge className="mt-2" style={{ backgroundColor: result.category.color + '20', color: result.category.color, borderColor: result.category.color + '40' }}>
                  {result.category.label}
                </Badge>
              </div>

              <div className="stat-card">
                <h3 className="text-sm font-bold uppercase tracking-wider mb-3 font-['Oswald']">Body Fat Spectrum</h3>
                <Progress value={Math.min(result.bf / 40 * 100, 100)} className="h-3 mb-3" />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  {categories.map(c => <span key={c.label} style={{ color: c.color }}>{c.label}</span>)}
                </div>
              </div>

              <div className="stat-card">
                <h3 className="text-sm font-bold uppercase tracking-wider mb-3 font-['Oswald']">Body Composition</h3>
                <div className="h-[120px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[{ name: 'Lean Mass', value: result.leanMass, fill: '#22c55e' }, { name: 'Fat Mass', value: result.fatMass, fill: '#ef4444' }]} barSize={40} layout="vertical">
                      <XAxis type="number" hide />
                      <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(220, 10%, 55%)' }} width={80} />
                      <Bar dataKey="value" radius={[0, 6, 6, 0]} label={{ position: 'right', fontSize: 12, fill: 'hsl(0, 0%, 90%)', fontWeight: 700, formatter: (v: number) => `${v} kg` }}>
                        {[0, 1].map(i => <Cell key={i} fill={i === 0 ? '#22c55e' : '#ef4444'} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <Link to="/app/body-recomp" className="block">
                <div className="stat-card flex items-center gap-4 cursor-pointer group border-primary/20 bg-primary/5">
                  <div className="flex-1"><p className="text-sm font-bold group-hover:text-primary transition-colors">Get a plan designed for your body composition</p><p className="text-xs text-muted-foreground">Build My Plan →</p></div>
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

export default BodyFatCalculator;
