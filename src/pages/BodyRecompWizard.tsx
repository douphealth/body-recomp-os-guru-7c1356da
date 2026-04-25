import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, ArrowRight, Dumbbell, User, Target, Settings2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import InlineBodyFatEstimator from '@/components/wizard/InlineBodyFatEstimator';
import { trackCTAClick } from '@/lib/tracking';
import type { UserInputs } from '@/lib/calculations';

const defaultInputs: UserInputs = {
  age: 30, sex: 'male', heightCm: 175, weightKg: 80, bodyFatPercent: 20,
  goal: 'fat-loss', workoutFrequency: 4, stepCount: 7000,
  dietStyle: 'standard', equipmentAccess: 'gym', runningInterest: false,
};

const stepMeta = [
  { icon: User, title: 'YOUR BODY STATS', desc: 'Tell us about your body composition', color: 'from-red-500/20 to-orange-500/10' },
  { icon: Target, title: 'GOALS & ACTIVITY', desc: 'What are you working toward?', color: 'from-orange-500/20 to-amber-500/10' },
  { icon: Settings2, title: 'PREFERENCES', desc: 'Customize your plan to your lifestyle', color: 'from-amber-500/20 to-yellow-500/10' },
];

const bodyFatLabels = [
  { range: [3, 9], label: 'Very Lean', desc: 'Visible abs, striations' },
  { range: [10, 14], label: 'Lean', desc: 'Some ab definition' },
  { range: [15, 19], label: 'Athletic', desc: 'Fit but soft midsection' },
  { range: [20, 24], label: 'Average', desc: 'Some belly fat' },
  { range: [25, 34], label: 'Above Average', desc: 'Noticeable fat stores' },
  { range: [35, 50], label: 'Higher', desc: 'Significant fat stores' },
];

const BodyRecompWizard = () => {
  const [step, setStep] = useState(1);
  const [inputs, setInputs] = useState<UserInputs>(() => {
    try {
      const stored = sessionStorage.getItem('recomp-inputs');
      return stored ? JSON.parse(stored) : defaultInputs;
    } catch { return defaultInputs; }
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [direction, setDirection] = useState(1);
  const navigate = useNavigate();
  const totalSteps = 3;

  const update = (field: keyof UserInputs, value: unknown) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => { const c = { ...prev }; delete c[field]; return c; });
  };

  const validateStep = (s: number): boolean => {
    const errs: Record<string, string> = {};
    if (s === 1) {
      if (!inputs.age || inputs.age < 14 || inputs.age > 100) errs.age = 'Age must be 14–100';
      if (!inputs.heightCm || inputs.heightCm < 100 || inputs.heightCm > 250) errs.heightCm = 'Height: 100–250 cm';
      if (!inputs.weightKg || inputs.weightKg < 30 || inputs.weightKg > 300) errs.weightKg = 'Weight: 30–300 kg';
      if (inputs.bodyFatPercent < 3 || inputs.bodyFatPercent > 60) errs.bodyFatPercent = 'Body fat: 3–60%';
    }
    if (s === 2) {
      if (inputs.workoutFrequency < 2 || inputs.workoutFrequency > 7) errs.workoutFrequency = 'Frequency: 2–7';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const next = () => { if (validateStep(step)) { setDirection(1); setStep((s) => Math.min(s + 1, totalSteps + 1)); } };
  const prev = () => { setDirection(-1); setStep((s) => Math.max(s - 1, 1)); };

  const handleGenerate = () => {
    if (!validateStep(step)) return;
    trackCTAClick('generate_plan', 'wizard');
    sessionStorage.setItem('recomp-inputs', JSON.stringify(inputs));
    navigate('/build-my-plan/results');
  };

  const currentBfLabel = bodyFatLabels.find(b => inputs.bodyFatPercent >= b.range[0] && inputs.bodyFatPercent <= b.range[1]);
  const meta = stepMeta[step - 1];

  const slideVariants = {
    enter: (d: number) => ({ x: d > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -60 : 60, opacity: 0 }),
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title="Body Recomp OS — Build Your Plan | GearUpToFit"
        description="Answer a few questions about your body, goals, and preferences to get a personalized 8-week fitness plan."
        path="/build-my-plan"
      />
      <Header />

      <main className="flex-1 py-8 md:py-16">
        <div className="container max-w-2xl">
          {/* Step indicators */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {stepMeta.map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className={`h-9 w-9 rounded-xl flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    i + 1 <= step ? 'gradient-red text-primary-foreground shadow-lg shadow-primary/20' : 'bg-secondary text-muted-foreground'
                  }`}>
                    {i + 1}
                  </div>
                  <span className={`hidden sm:block text-xs font-medium transition-colors ${i + 1 === step ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {s.title.split(' ')[0]}
                  </span>
                  {i < 2 && <div className={`hidden sm:block w-12 md:w-20 h-px mx-2 ${i + 1 < step ? 'bg-primary/50' : 'bg-border'}`} />}
                </div>
              ))}
            </div>
            <Progress value={(step / totalSteps) * 100} className="h-1.5" />
          </div>

          {/* Card */}
          <div className="stat-card !p-0 overflow-hidden">
            {/* Step header */}
            {meta && (
              <div className={`bg-gradient-to-r ${meta.color} p-6 border-b border-border/50`}>
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-xl gradient-red flex items-center justify-center shadow-lg shadow-primary/20">
                    <meta.icon className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{meta.title}</h2>
                    <p className="text-sm text-muted-foreground">{meta.desc}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="p-6 md:p-8 min-h-[380px]">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={step}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  {/* Step 1 */}
                  {step === 1 && (
                    <div className="space-y-5">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="age" className="text-xs text-muted-foreground uppercase tracking-wider">Age</Label>
                          <Input id="age" type="number" value={inputs.age} onChange={(e) => update('age', Number(e.target.value))} className="mt-1.5 h-12 text-lg font-semibold bg-secondary/30 border-border/50 focus:border-primary/50" />
                          {errors.age && <p className="text-xs text-destructive mt-1">{errors.age}</p>}
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground uppercase tracking-wider">Sex</Label>
                          <RadioGroup value={inputs.sex} onValueChange={(v) => update('sex', v)} className="flex gap-2 mt-1.5">
                            {['male', 'female'].map(s => (
                              <label key={s} className={`flex-1 flex items-center justify-center gap-2 h-12 rounded-lg border cursor-pointer transition-all duration-200 text-sm font-medium ${
                                inputs.sex === s ? 'border-primary bg-primary/10 text-primary' : 'border-border/50 bg-secondary/30 hover:border-primary/30'
                              }`}>
                                <RadioGroupItem value={s} className="sr-only" />
                                {s === 'male' ? '♂ Male' : '♀ Female'}
                              </label>
                            ))}
                          </RadioGroup>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="height" className="text-xs text-muted-foreground uppercase tracking-wider">Height (cm)</Label>
                          <Input id="height" type="number" value={inputs.heightCm} onChange={(e) => update('heightCm', Number(e.target.value))} className="mt-1.5 h-12 text-lg font-semibold bg-secondary/30 border-border/50 focus:border-primary/50" />
                          {errors.heightCm && <p className="text-xs text-destructive mt-1">{errors.heightCm}</p>}
                        </div>
                        <div>
                          <Label htmlFor="weight" className="text-xs text-muted-foreground uppercase tracking-wider">Weight (kg)</Label>
                          <Input id="weight" type="number" value={inputs.weightKg} onChange={(e) => update('weightKg', Number(e.target.value))} className="mt-1.5 h-12 text-lg font-semibold bg-secondary/30 border-border/50 focus:border-primary/50" />
                          {errors.weightKg && <p className="text-xs text-destructive mt-1">{errors.weightKg}</p>}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-xs text-muted-foreground uppercase tracking-wider">Body Fat Estimate</Label>
                          <div className="text-right">
                            <span className="text-2xl font-bold text-primary font-['Oswald']">{inputs.bodyFatPercent}%</span>
                            {currentBfLabel && (
                              <p className="text-[10px] text-muted-foreground">{currentBfLabel.label} — {currentBfLabel.desc}</p>
                            )}
                          </div>
                        </div>
                        <Slider value={[inputs.bodyFatPercent]} onValueChange={([v]) => update('bodyFatPercent', v)} min={3} max={50} step={1} className="mt-3" />
                        <div className="flex justify-between mt-2">
                          {bodyFatLabels.slice(0, 4).map(b => (
                            <button key={b.label} type="button" onClick={() => update('bodyFatPercent', b.range[0])} className="text-[10px] text-muted-foreground hover:text-primary transition-colors px-1">
                              {b.label}
                            </button>
                          ))}
                        </div>
                        <InlineBodyFatEstimator
                          sex={inputs.sex as 'male' | 'female'}
                          heightCm={inputs.heightCm}
                          onApply={(bf) => update('bodyFatPercent', bf)}
                        />
                        {errors.bodyFatPercent && <p className="text-xs text-destructive mt-1">{errors.bodyFatPercent}</p>}
                      </div>
                    </div>
                  )}

                  {/* Step 2 */}
                  {step === 2 && (
                    <div className="space-y-5">
                      <div>
                        <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-3 block">Primary Goal</Label>
                        <RadioGroup value={inputs.goal} onValueChange={(v) => update('goal', v)} className="space-y-2">
                          {[
                            { value: 'fat-loss', label: '🔥 Fat Loss', desc: 'Lose body fat while preserving muscle', detail: '~20% deficit' },
                            { value: 'lean-muscle', label: '💪 Lean Muscle', desc: 'Build muscle with minimal fat gain', detail: '~10% surplus' },
                            { value: 'recomp', label: '⚡ Recomposition', desc: 'Lose fat and build muscle simultaneously', detail: 'Calorie cycling' },
                          ].map((g) => (
                            <label key={g.value} className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                              inputs.goal === g.value ? 'border-primary bg-primary/5 shadow-lg shadow-primary/5' : 'border-border/50 bg-secondary/20 hover:border-primary/30'
                            }`}>
                              <RadioGroupItem value={g.value} className="sr-only" />
                              <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-lg ${
                                inputs.goal === g.value ? 'bg-primary/20' : 'bg-secondary'
                              }`}>
                                {g.label.split(' ')[0]}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-semibold">{g.label.split(' ').slice(1).join(' ')}</p>
                                <p className="text-xs text-muted-foreground">{g.desc}</p>
                              </div>
                              <span className={`text-[10px] font-medium px-2 py-1 rounded-md ${
                                inputs.goal === g.value ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground'
                              }`}>{g.detail}</span>
                            </label>
                          ))}
                        </RadioGroup>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-xs text-muted-foreground uppercase tracking-wider">Workout Frequency</Label>
                          <span className="text-2xl font-bold text-primary font-['Oswald']">{inputs.workoutFrequency}<span className="text-sm text-muted-foreground font-normal ml-1">days/wk</span></span>
                        </div>
                        <Slider value={[inputs.workoutFrequency]} onValueChange={([v]) => update('workoutFrequency', v)} min={2} max={7} step={1} className="mt-3" />
                        <div className="flex justify-between text-[10px] text-muted-foreground mt-2">
                          <span>2 days</span>
                          <span>{inputs.workoutFrequency <= 3 ? 'Full Body' : inputs.workoutFrequency <= 4 ? 'Upper/Lower' : 'PPL'} Split</span>
                          <span>7 days</span>
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs text-muted-foreground uppercase tracking-wider">Daily Step Count</Label>
                        <Select value={String(inputs.stepCount)} onValueChange={(v) => update('stepCount', Number(v))}>
                          <SelectTrigger className="mt-1.5 h-12 bg-secondary/30 border-border/50">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="3000">Under 5,000 (Sedentary)</SelectItem>
                            <SelectItem value="5000">~5,000 (Light Activity)</SelectItem>
                            <SelectItem value="7000">~7,000 (Moderate)</SelectItem>
                            <SelectItem value="10000">~10,000 (Active)</SelectItem>
                            <SelectItem value="12000">12,000+ (Very Active)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {/* Step 3 */}
                  {step === 3 && (
                    <div className="space-y-5">
                      <div>
                        <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">Diet Style</Label>
                        <Select value={inputs.dietStyle} onValueChange={(v) => update('dietStyle', v)}>
                          <SelectTrigger className="h-12 bg-secondary/30 border-border/50">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="standard">Standard (Balanced)</SelectItem>
                            <SelectItem value="high-protein">High Protein</SelectItem>
                            <SelectItem value="keto">Keto (Low Carb)</SelectItem>
                            <SelectItem value="vegetarian">Vegetarian</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-3 block">Equipment Access</Label>
                        <RadioGroup value={inputs.equipmentAccess} onValueChange={(v) => update('equipmentAccess', v)} className="space-y-2">
                          {[
                            { value: 'gym', label: '🏋️ Full Gym', desc: 'Barbells, dumbbells, machines, cables' },
                            { value: 'home', label: '🏠 Home Gym', desc: 'Basic equipment — dumbbells, bands, bench' },
                            { value: 'minimal', label: '🤸 Minimal', desc: 'Bodyweight exercises only' },
                          ].map((e) => (
                            <label key={e.value} className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                              inputs.equipmentAccess === e.value ? 'border-primary bg-primary/5 shadow-lg shadow-primary/5' : 'border-border/50 bg-secondary/20 hover:border-primary/30'
                            }`}>
                              <RadioGroupItem value={e.value} className="sr-only" />
                              <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-lg ${
                                inputs.equipmentAccess === e.value ? 'bg-primary/20' : 'bg-secondary'
                              }`}>
                                {e.label.split(' ')[0]}
                              </div>
                              <div>
                                <p className="text-sm font-semibold">{e.label.split(' ').slice(1).join(' ')}</p>
                                <p className="text-xs text-muted-foreground">{e.desc}</p>
                              </div>
                            </label>
                          ))}
                        </RadioGroup>
                      </div>

                      <div className="flex items-center justify-between p-5 rounded-xl border border-border/50 bg-secondary/20 hover:border-primary/30 transition-colors">
                        <div>
                          <Label className="text-sm font-semibold flex items-center gap-2">🏃 Running Interest</Label>
                          <p className="text-xs text-muted-foreground mt-1">Include a running plan + shoe recs</p>
                        </div>
                        <Switch checked={inputs.runningInterest} onCheckedChange={(v) => update('runningInterest', v)} />
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation */}
            <div className="flex justify-between p-6 border-t border-border/50 bg-card/50">
              {step > 1 ? (
                <Button variant="outline" onClick={prev} className="gap-2 border-border/50 hover:bg-secondary/50">
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
              ) : <div />}
              {step < totalSteps ? (
                <Button onClick={next} className="gradient-red border-0 gap-2 font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all hover:scale-[1.02]">
                  Next <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleGenerate} className="gradient-red border-0 gap-2 font-bold px-8 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all hover:scale-[1.02]" style={{ animation: 'pulse-glow 3s ease-in-out infinite' }}>
                  <Dumbbell className="h-4 w-4" /> Generate My Plan
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BodyRecompWizard;
