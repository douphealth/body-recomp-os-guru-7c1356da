import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Target, ArrowRight } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import JsonLd from '@/components/JsonLd';
import AnimatedNumber from '@/components/AnimatedNumber';

const COLORS = { protein: '#ef4444', carbs: '#3b82f6', fat: '#eab308' };

const MacroCalculator = () => {
  const [sex, setSex] = useState('male');
  const [age, setAge] = useState(30);
  const [height, setHeight] = useState(175);
  const [weight, setWeight] = useState(80);
  const [bf, setBf] = useState(20);
  const [activity, setActivity] = useState('1.55');
  const [goal, setGoal] = useState('fat-loss');
  const [diet, setDiet] = useState('standard');
  const [meals, setMeals] = useState(4);
  const [result, setResult] = useState<any>(null);

  const calculate = () => {
    const bmr = sex === 'male' ? 10 * weight + 6.25 * height - 5 * age + 5 : 10 * weight + 6.25 * height - 5 * age - 161;
    const tdee = Math.round(bmr * parseFloat(activity));
    const multiplier = goal === 'fat-loss' ? 0.8 : goal === 'lean-muscle' ? 1.1 : 1.0;
    const cal = Math.round(tdee * multiplier);
    const lbm = weight * (1 - bf / 100);
    const protMult = goal === 'fat-loss' ? 2.2 : 2.0;
    const protG = Math.round(lbm * (diet === 'high-protein' ? Math.min(protMult + 0.2, 2.4) : protMult));
    const protCal = protG * 4;
    let fatPct = diet === 'keto' ? 70 : 30;
    const protPct = Math.round((protCal / cal) * 100);
    let carbPct = Math.max(100 - protPct - fatPct, 5);
    fatPct = 100 - protPct - carbPct;
    const fatG = Math.round((cal * fatPct / 100) / 9);
    const carbG = Math.round((cal * carbPct / 100) / 4);
    setResult({ cal, protG, carbG, fatG, protPct, carbPct, fatPct, tdee, meals });
  };

  const schema = { '@context': 'https://schema.org', '@type': 'WebApplication', name: 'Macro Calculator — GearUpToFit', applicationCategory: 'HealthApplication', operatingSystem: 'Web', offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' } };

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead title="Macro Calculator — Protein, Carbs & Fat | GearUpToFit" description="Calculate your optimal macronutrient split for fat loss, muscle gain, or recomposition. Free science-backed macro calculator with per-meal breakdown." path="/tools/macro-calculator" />
      <JsonLd data={schema} />
      <Header />
      <main className="flex-1 py-8 md:py-16">
        <div className="container max-w-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex h-12 w-12 rounded-xl gradient-red items-center justify-center mb-4 shadow-lg shadow-primary/20">
              <Target className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">MACRO CALCULATOR</h1>
            <p className="text-muted-foreground text-sm max-w-lg mx-auto">Get your optimal protein, carb, and fat targets based on your body composition, goals, and diet preference.</p>
          </div>

          <div className="stat-card space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">Age</Label>
                <Input type="number" value={age} onChange={e => setAge(+e.target.value)} className="mt-1.5 h-12 text-lg font-semibold bg-secondary/30 border-border/50" />
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
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div><Label className="text-xs text-muted-foreground uppercase tracking-wider">Height (cm)</Label><Input type="number" value={height} onChange={e => setHeight(+e.target.value)} className="mt-1.5 h-12 text-lg font-semibold bg-secondary/30 border-border/50" /></div>
              <div><Label className="text-xs text-muted-foreground uppercase tracking-wider">Weight (kg)</Label><Input type="number" value={weight} onChange={e => setWeight(+e.target.value)} className="mt-1.5 h-12 text-lg font-semibold bg-secondary/30 border-border/50" /></div>
              <div><Label className="text-xs text-muted-foreground uppercase tracking-wider">Body Fat %</Label><Input type="number" value={bf} onChange={e => setBf(+e.target.value)} className="mt-1.5 h-12 text-lg font-semibold bg-secondary/30 border-border/50" /></div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">Activity Level</Label>
              <Select value={activity} onValueChange={setActivity}>
                <SelectTrigger className="mt-1.5 h-12 bg-secondary/30 border-border/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1.2">Sedentary</SelectItem>
                  <SelectItem value="1.375">Lightly Active</SelectItem>
                  <SelectItem value="1.55">Moderately Active</SelectItem>
                  <SelectItem value="1.725">Very Active</SelectItem>
                  <SelectItem value="1.9">Extremely Active</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">Goal</Label>
                <Select value={goal} onValueChange={setGoal}>
                  <SelectTrigger className="mt-1.5 h-12 bg-secondary/30 border-border/50"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fat-loss">Fat Loss</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="lean-muscle">Lean Muscle</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">Diet Style</Label>
                <Select value={diet} onValueChange={setDiet}>
                  <SelectTrigger className="mt-1.5 h-12 bg-secondary/30 border-border/50"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="high-protein">High Protein</SelectItem>
                    <SelectItem value="keto">Keto</SelectItem>
                    <SelectItem value="vegetarian">Vegetarian</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">Meals per Day</Label>
              <Input type="number" value={meals} onChange={e => setMeals(+e.target.value)} min={2} max={6} className="mt-1.5 h-12 text-lg font-semibold bg-secondary/30 border-border/50" />
            </div>
            <Button onClick={calculate} className="w-full h-12 gradient-red border-0 font-bold text-lg shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.01] transition-all">Calculate Macros</Button>
          </div>

          {result && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mt-6 space-y-4">
              <div className="stat-card text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">Daily Target</p>
                <AnimatedNumber value={result.cal} className="text-5xl font-bold text-primary font-['Oswald']" suffix=" kcal" />
              </div>

              <div className="stat-card">
                <div className="flex items-center gap-6">
                  <div className="relative w-[130px] h-[130px] flex-shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart><Pie data={[{ v: result.protPct }, { v: result.carbPct }, { v: result.fatPct }]} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={3} dataKey="v" strokeWidth={0}>
                        <Cell fill={COLORS.protein} /><Cell fill={COLORS.carbs} /><Cell fill={COLORS.fat} />
                      </Pie></PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1 space-y-3">
                    {[{ l: 'Protein', g: result.protG, c: COLORS.protein }, { l: 'Carbs', g: result.carbG, c: COLORS.carbs }, { l: 'Fat', g: result.fatG, c: COLORS.fat }].map(m => (
                      <div key={m.l} className="flex justify-between text-sm"><span style={{ color: m.c }} className="font-medium">{m.l}</span><span className="font-bold">{m.g}g</span></div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="stat-card">
                <h3 className="text-sm font-bold uppercase tracking-wider mb-3 font-['Oswald']">Per Meal ({result.meals} meals/day)</h3>
                <div className="grid grid-cols-3 gap-3 text-center">
                  {[{ l: 'Protein', v: Math.round(result.protG / result.meals), c: 'text-red-400' }, { l: 'Carbs', v: Math.round(result.carbG / result.meals), c: 'text-blue-400' }, { l: 'Fat', v: Math.round(result.fatG / result.meals), c: 'text-yellow-400' }].map(m => (
                    <div key={m.l} className="p-3 rounded-lg bg-secondary/30 border border-border/30">
                      <p className="text-[10px] text-muted-foreground uppercase">{m.l}</p>
                      <p className={`text-xl font-bold font-['Oswald'] ${m.c}`}>{m.v}g</p>
                    </div>
                  ))}
                </div>
              </div>

              <Link to="/app/body-recomp" className="block">
                <div className="stat-card flex items-center gap-4 cursor-pointer group border-primary/20 bg-primary/5">
                  <div className="flex-1">
                    <p className="text-sm font-bold group-hover:text-primary transition-colors">Get a full training plan to match these macros</p>
                    <p className="text-xs text-muted-foreground">Build My Plan →</p>
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

export default MacroCalculator;
