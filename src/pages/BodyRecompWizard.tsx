import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, ArrowRight, Dumbbell } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { trackCTAClick } from '@/lib/tracking';
import type { UserInputs } from '@/lib/calculations';

const defaultInputs: UserInputs = {
  age: 30,
  sex: 'male',
  heightCm: 175,
  weightKg: 80,
  bodyFatPercent: 20,
  goal: 'fat-loss',
  workoutFrequency: 4,
  stepCount: 7000,
  dietStyle: 'standard',
  equipmentAccess: 'gym',
  runningInterest: false,
};

const BodyRecompWizard = () => {
  const [step, setStep] = useState(1);
  const [inputs, setInputs] = useState<UserInputs>(defaultInputs);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const totalSteps = 3;

  const update = (field: keyof UserInputs, value: unknown) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy[field];
      return copy;
    });
  };

  const validateStep = (s: number): boolean => {
    const errs: Record<string, string> = {};
    if (s === 1) {
      if (!inputs.age || inputs.age < 14 || inputs.age > 100) errs.age = 'Age must be 14–100';
      if (!inputs.heightCm || inputs.heightCm < 100 || inputs.heightCm > 250) errs.heightCm = 'Height must be 100–250 cm';
      if (!inputs.weightKg || inputs.weightKg < 30 || inputs.weightKg > 300) errs.weightKg = 'Weight must be 30–300 kg';
      if (inputs.bodyFatPercent < 3 || inputs.bodyFatPercent > 60) errs.bodyFatPercent = 'Body fat must be 3–60%';
    }
    if (s === 2) {
      if (inputs.workoutFrequency < 2 || inputs.workoutFrequency > 7) errs.workoutFrequency = 'Frequency must be 2–7';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const next = () => {
    if (validateStep(step)) setStep((s) => Math.min(s + 1, totalSteps + 1));
  };
  const prev = () => setStep((s) => Math.max(s - 1, 1));

  const handleGenerate = () => {
    if (!validateStep(step)) return;
    trackCTAClick('generate_plan', 'wizard');
    // Store inputs in sessionStorage for results page
    sessionStorage.setItem('recomp-inputs', JSON.stringify(inputs));
    navigate('/app/body-recomp/results');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title="Body Recomp OS — Build Your Plan | GearUpToFit"
        description="Answer a few questions about your body, goals, and preferences to get a personalized 8-week fitness plan with calories, macros, workouts, and recovery."
        path="/app/body-recomp"
      />
      <Header />

      <main className="flex-1 py-8 md:py-12">
        <div className="container max-w-2xl">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex justify-between text-xs text-muted-foreground mb-2">
              <span>Step {step} of {totalSteps}</span>
              <span>{Math.round((step / totalSteps) * 100)}%</span>
            </div>
            <Progress value={(step / totalSteps) * 100} className="h-2" />
          </div>

          <Card className="bg-card border-border card-glow">
            <CardContent className="p-6 md:p-8">
              {/* Step 1: Body Stats */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded-full gradient-red flex items-center justify-center">
                      <span className="text-sm font-bold text-primary-foreground">1</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">YOUR BODY STATS</h2>
                      <p className="text-sm text-muted-foreground">Tell us about your body composition</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="age">Age</Label>
                      <Input id="age" type="number" value={inputs.age} onChange={(e) => update('age', Number(e.target.value))} className="mt-1" />
                      {errors.age && <p className="text-xs text-destructive mt-1">{errors.age}</p>}
                    </div>
                    <div>
                      <Label>Sex</Label>
                      <RadioGroup value={inputs.sex} onValueChange={(v) => update('sex', v)} className="flex gap-4 mt-2">
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="male" id="male" />
                          <Label htmlFor="male" className="cursor-pointer">Male</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="female" id="female" />
                          <Label htmlFor="female" className="cursor-pointer">Female</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="height">Height (cm)</Label>
                      <Input id="height" type="number" value={inputs.heightCm} onChange={(e) => update('heightCm', Number(e.target.value))} className="mt-1" />
                      {errors.heightCm && <p className="text-xs text-destructive mt-1">{errors.heightCm}</p>}
                    </div>
                    <div>
                      <Label htmlFor="weight">Weight (kg)</Label>
                      <Input id="weight" type="number" value={inputs.weightKg} onChange={(e) => update('weightKg', Number(e.target.value))} className="mt-1" />
                      {errors.weightKg && <p className="text-xs text-destructive mt-1">{errors.weightKg}</p>}
                    </div>
                  </div>

                  <div>
                    <Label>Body Fat Estimate: {inputs.bodyFatPercent}%</Label>
                    <Slider value={[inputs.bodyFatPercent]} onValueChange={([v]) => update('bodyFatPercent', v)} min={3} max={50} step={1} className="mt-3" />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Very Lean (3%)</span>
                      <span>Average (20%)</span>
                      <span>Higher (50%)</span>
                    </div>
                    {errors.bodyFatPercent && <p className="text-xs text-destructive mt-1">{errors.bodyFatPercent}</p>}
                  </div>
                </div>
              )}

              {/* Step 2: Goals & Activity */}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded-full gradient-red flex items-center justify-center">
                      <span className="text-sm font-bold text-primary-foreground">2</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">GOALS & ACTIVITY</h2>
                      <p className="text-sm text-muted-foreground">What are you working toward?</p>
                    </div>
                  </div>

                  <div>
                    <Label>Primary Goal</Label>
                    <RadioGroup value={inputs.goal} onValueChange={(v) => update('goal', v)} className="mt-2 space-y-2">
                      {[
                        { value: 'fat-loss', label: '🔥 Fat Loss', desc: 'Lose body fat while preserving muscle' },
                        { value: 'lean-muscle', label: '💪 Lean Muscle', desc: 'Build muscle with minimal fat gain' },
                        { value: 'recomp', label: '⚡ Body Recomposition', desc: 'Lose fat and build muscle simultaneously' },
                      ].map((g) => (
                        <label key={g.value} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${inputs.goal === g.value ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}>
                          <RadioGroupItem value={g.value} className="mt-0.5" />
                          <div>
                            <p className="text-sm font-semibold">{g.label}</p>
                            <p className="text-xs text-muted-foreground">{g.desc}</p>
                          </div>
                        </label>
                      ))}
                    </RadioGroup>
                  </div>

                  <div>
                    <Label>Workout Frequency: {inputs.workoutFrequency} days/week</Label>
                    <Slider value={[inputs.workoutFrequency]} onValueChange={([v]) => update('workoutFrequency', v)} min={2} max={7} step={1} className="mt-3" />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>2 days</span>
                      <span>7 days</span>
                    </div>
                  </div>

                  <div>
                    <Label>Daily Step Count</Label>
                    <Select value={String(inputs.stepCount)} onValueChange={(v) => update('stepCount', Number(v))}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3000">Under 5,000 (Sedentary)</SelectItem>
                        <SelectItem value="5000">~5,000 (Light)</SelectItem>
                        <SelectItem value="7000">~7,000 (Moderate)</SelectItem>
                        <SelectItem value="10000">~10,000 (Active)</SelectItem>
                        <SelectItem value="12000">12,000+ (Very Active)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Step 3: Preferences */}
              {step === 3 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded-full gradient-red flex items-center justify-center">
                      <span className="text-sm font-bold text-primary-foreground">3</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">PREFERENCES</h2>
                      <p className="text-sm text-muted-foreground">Customize your plan to your lifestyle</p>
                    </div>
                  </div>

                  <div>
                    <Label>Diet Style</Label>
                    <Select value={inputs.dietStyle} onValueChange={(v) => update('dietStyle', v)}>
                      <SelectTrigger className="mt-1">
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
                    <Label>Equipment Access</Label>
                    <RadioGroup value={inputs.equipmentAccess} onValueChange={(v) => update('equipmentAccess', v)} className="mt-2 space-y-2">
                      {[
                        { value: 'gym', label: '🏋️ Full Gym', desc: 'Barbells, dumbbells, machines, cables' },
                        { value: 'home', label: '🏠 Home Gym', desc: 'Basic equipment — dumbbells, bands, bench' },
                        { value: 'minimal', label: '🤸 Minimal / Bodyweight', desc: 'No equipment — bodyweight exercises only' },
                      ].map((e) => (
                        <label key={e.value} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${inputs.equipmentAccess === e.value ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}>
                          <RadioGroupItem value={e.value} className="mt-0.5" />
                          <div>
                            <p className="text-sm font-semibold">{e.label}</p>
                            <p className="text-xs text-muted-foreground">{e.desc}</p>
                          </div>
                        </label>
                      ))}
                    </RadioGroup>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                    <div>
                      <Label className="text-sm font-semibold">🏃 Interested in Running?</Label>
                      <p className="text-xs text-muted-foreground mt-0.5">We'll include a running plan and shoe recommendations</p>
                    </div>
                    <Switch checked={inputs.runningInterest} onCheckedChange={(v) => update('runningInterest', v)} />
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between mt-8 pt-6 border-t border-border">
                {step > 1 ? (
                  <Button variant="outline" onClick={prev} className="gap-2">
                    <ArrowLeft className="h-4 w-4" /> Back
                  </Button>
                ) : <div />}
                {step < totalSteps ? (
                  <Button onClick={next} className="gradient-red border-0 gap-2 font-semibold">
                    Next <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button onClick={handleGenerate} className="gradient-red border-0 gap-2 font-bold px-8">
                    <Dumbbell className="h-4 w-4" /> Generate My Plan
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BodyRecompWizard;
