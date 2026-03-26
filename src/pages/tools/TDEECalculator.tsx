import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calculator, ArrowRight } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import JsonLd from '@/components/JsonLd';
import AnimatedNumber from '@/components/AnimatedNumber';

const activityLevels = [
  { value: '1.2', label: 'Sedentary (desk job, little exercise)' },
  { value: '1.375', label: 'Lightly Active (1-3 days/week)' },
  { value: '1.55', label: 'Moderately Active (3-5 days/week)' },
  { value: '1.725', label: 'Very Active (6-7 days/week)' },
  { value: '1.9', label: 'Extremely Active (athlete/physical job)' },
];

const TDEECalculator = () => {
  const [sex, setSex] = useState('male');
  const [age, setAge] = useState(30);
  const [height, setHeight] = useState(175);
  const [weight, setWeight] = useState(80);
  const [activity, setActivity] = useState('1.55');
  const [result, setResult] = useState<{ bmr: number; tdee: number } | null>(null);
  const [useMetric, setUseMetric] = useState(true);

  const calculate = () => {
    const h = useMetric ? height : height * 2.54;
    const w = useMetric ? weight : weight * 0.453592;
    const bmr = sex === 'male' ? 10 * w + 6.25 * h - 5 * age + 5 : 10 * w + 6.25 * h - 5 * age - 161;
    const tdee = Math.round(bmr * parseFloat(activity));
    setResult({ bmr: Math.round(bmr), tdee });
  };

  const goalData = result ? [
    { name: 'Fat Loss', value: Math.round(result.tdee * 0.8), fill: '#ef4444' },
    { name: 'Maintain', value: result.tdee, fill: '#6b7280' },
    { name: 'Lean Bulk', value: Math.round(result.tdee * 1.1), fill: '#3b82f6' },
    { name: 'Bulk', value: Math.round(result.tdee * 1.2), fill: '#8b5cf6' },
  ] : [];

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'TDEE Calculator — GearUpToFit',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead title="TDEE Calculator — Total Daily Energy Expenditure | GearUpToFit" description="Calculate your Total Daily Energy Expenditure (TDEE) using the Mifflin-St Jeor equation. Free, science-backed calorie calculator for fat loss, maintenance, and muscle gain." path="/tools/tdee-calculator" />
      <JsonLd data={schema} />
      <Header />
      <main className="flex-1 py-8 md:py-16">
        <div className="container max-w-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex h-12 w-12 rounded-xl gradient-red items-center justify-center mb-4 shadow-lg shadow-primary/20">
              <Calculator className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">TDEE CALCULATOR</h1>
            <p className="text-muted-foreground text-sm max-w-lg mx-auto">Your Total Daily Energy Expenditure (TDEE) is the number of calories your body burns in a day. Knowing this is the foundation of any effective nutrition plan.</p>
          </div>

          <div className="stat-card space-y-5">
            <div className="flex gap-2 mb-2">
              <Button size="sm" variant={useMetric ? 'default' : 'outline'} onClick={() => setUseMetric(true)} className={useMetric ? 'gradient-red border-0' : 'border-border/50'}>Metric</Button>
              <Button size="sm" variant={!useMetric ? 'default' : 'outline'} onClick={() => setUseMetric(false)} className={!useMetric ? 'gradient-red border-0' : 'border-border/50'}>Imperial</Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">Age</Label>
                <Input type="number" value={age} onChange={e => setAge(+e.target.value)} className="mt-1.5 h-12 text-lg font-semibold bg-secondary/30 border-border/50" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">Sex</Label>
                <RadioGroup value={sex} onValueChange={setSex} className="flex gap-2 mt-1.5">
                  {['male', 'female'].map(s => (
                    <label key={s} className={`flex-1 flex items-center justify-center h-12 rounded-lg border cursor-pointer transition-all text-sm font-medium ${sex === s ? 'border-primary bg-primary/10 text-primary' : 'border-border/50 bg-secondary/30 hover:border-primary/30'}`}>
                      <RadioGroupItem value={s} className="sr-only" />{s === 'male' ? '♂ Male' : '♀ Female'}
                    </label>
                  ))}
                </RadioGroup>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">Height ({useMetric ? 'cm' : 'inches'})</Label>
                <Input type="number" value={height} onChange={e => setHeight(+e.target.value)} className="mt-1.5 h-12 text-lg font-semibold bg-secondary/30 border-border/50" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">Weight ({useMetric ? 'kg' : 'lbs'})</Label>
                <Input type="number" value={weight} onChange={e => setWeight(+e.target.value)} className="mt-1.5 h-12 text-lg font-semibold bg-secondary/30 border-border/50" />
              </div>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">Activity Level</Label>
              <Select value={activity} onValueChange={setActivity}>
                <SelectTrigger className="mt-1.5 h-12 bg-secondary/30 border-border/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {activityLevels.map(l => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={calculate} className="w-full h-12 gradient-red border-0 font-bold text-lg shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.01] transition-all">
              Calculate TDEE
            </Button>
          </div>

          {result && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mt-6 space-y-4">
              <div className="stat-card text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">Your TDEE</p>
                <AnimatedNumber value={result.tdee} className="text-5xl md:text-6xl font-bold text-primary font-['Oswald']" suffix=" kcal" />
                <div className="mt-4 pt-4 border-t border-border/50 grid grid-cols-2 gap-4 text-xs">
                  <div><span className="text-muted-foreground">BMR</span><p className="font-bold text-lg">{result.bmr}</p></div>
                  <div><span className="text-muted-foreground">Activity Multiplier</span><p className="font-bold text-lg">×{activity}</p></div>
                </div>
              </div>

              <div className="stat-card">
                <h3 className="text-sm font-bold uppercase tracking-wider mb-4 font-['Oswald']">Calorie Targets by Goal</h3>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={goalData} barSize={36}>
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(220, 10%, 55%)' }} />
                      <YAxis hide />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]} label={{ position: 'top', fontSize: 12, fill: 'hsl(0, 0%, 90%)', fontWeight: 700 }}>
                        {goalData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="stat-card">
                <p className="text-xs text-muted-foreground leading-relaxed">This calculation uses the <strong className="text-foreground">Mifflin-St Jeor equation</strong>, considered the gold standard for TDEE estimation by the Academy of Nutrition and Dietetics.</p>
              </div>

              <Link to="/app/body-recomp" className="block">
                <div className="stat-card flex items-center gap-4 cursor-pointer group border-primary/20 bg-primary/5">
                  <div className="flex-1">
                    <p className="text-sm font-bold group-hover:text-primary transition-colors">Want a full 8-week plan?</p>
                    <p className="text-xs text-muted-foreground">Get a personalized training + nutrition plan based on your TDEE</p>
                  </div>
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

export default TDEECalculator;
