import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import logoImg from '@/assets/logo.png';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';

const loadingMessages = [
  'Calculating your BMR & TDEE...',
  'Optimizing macro ratios...',
  'Building your 8-week training split...',
  'Generating cardio programming...',
  'Personalizing recovery protocols...',
  'Finalizing your plan...',
];

const motivationalQuotes = [
  'The body achieves what the mind believes.',
  'Discipline is choosing between what you want now and what you want most.',
  "You don't have to be extreme, just consistent.",
  "The only bad workout is the one that didn't happen.",
];

const PlanLoadingScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [progress, setProgress] = useState(0);
  const [msgIndex, setMsgIndex] = useState(0);
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) { clearInterval(interval); return 100; }
        return Math.min(p + 1.5, 100);
      });
    }, 30);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((i) => (i + 1) % loadingMessages.length);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((i) => (i + 1) % motivationalQuotes.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress >= 100) {
      const timeout = setTimeout(onComplete, 400);
      return () => clearTimeout(timeout);
    }
  }, [progress, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background flex items-center justify-center"
    >
      <div className="w-full max-w-md px-6 text-center space-y-8">
        {/* Logo */}
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="inline-flex items-center gap-3"
        >
          <img src={logoImg} alt="GearUpToFit Logo" className="h-12 w-12 rounded-xl shadow-lg shadow-primary/30" />
          <span className="font-['Oswald'] text-xl font-bold tracking-wider">
            GEAR UP <span className="text-primary">TO FIT</span>
          </span>
        </motion.div>

        {/* Message */}
        <div className="space-y-2">
          <h2 className="text-lg font-bold font-['Oswald'] tracking-wide">BUILDING YOUR PLAN</h2>
          <motion.p
            key={msgIndex}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-muted-foreground h-5"
          >
            {loadingMessages[msgIndex]}
          </motion.p>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground">{Math.round(progress)}%</p>
        </div>

        {/* Motivational quote */}
        <motion.p
          key={quoteIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="text-xs italic text-muted-foreground h-5"
        >
          "{motivationalQuotes[quoteIndex]}"
        </motion.p>

        {/* Skeleton preview */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
          </div>
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-16 rounded-xl" />
        </div>
      </div>
    </motion.div>
  );
};

export default PlanLoadingScreen;
