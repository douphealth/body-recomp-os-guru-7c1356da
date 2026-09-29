import { supabase } from '@/integrations/supabase/client';

export interface BillingConfig {
  configured: boolean;
  productName?: string;
  description?: string;
  priceLabel?: string | null;
  mode?: 'payment' | 'subscription';
  interval?: string | null;
  intervalCount?: number | null;
}

export interface BillingStatus {
  active: boolean;
  tier: 'free' | 'pro';
  status: string;
  mode: 'payment' | 'subscription' | null;
  expiresAt: string | null;
  canManageBilling: boolean;
}

export interface PremiumRoadmapWeek {
  week: number;
  phase: string;
  focus: string;
  deload: boolean;
  intensity: string;
  volume: string;
  habits: string[];
  checkpoints: string[];
  nutritionFocus: string;
  reviewPrompt: string;
}

export interface PremiumRoadmap {
  goalLabel: string;
  summary: { calorieTarget: number; proteinGrams: number; workoutFrequency: number; stepCount: number };
  weeks: PremiumRoadmapWeek[];
  guardrails: string[];
  generatedAt: string;
}

async function invoke<T>(name: string, body?: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke(name, { body: body || {} });
  if (error) throw new Error(error.message || `Unable to call ${name}`);
  if (data?.error) throw new Error(String(data.error));
  return data as T;
}

export const getBillingConfig = () => invoke<BillingConfig>('billing-config');
export const getBillingStatus = (token: string, sessionId?: string | null) =>
  invoke<BillingStatus>('billing-status', { token, ...(sessionId ? { sessionId } : {}) });
export const startCheckout = (token: string) =>
  invoke<{ url?: string; alreadyActive?: boolean; active?: boolean }>('create-checkout', { token });
export const openBillingPortal = (token: string) =>
  invoke<{ url: string }>('create-billing-portal', { token });
export const getPremiumRoadmap = (token: string) =>
  invoke<PremiumRoadmap>('premium-roadmap', { token });
