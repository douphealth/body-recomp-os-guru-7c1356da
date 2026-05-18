// Client helper for persisting and hydrating body recomp plans via edge functions.
import { supabase } from '@/integrations/supabase/client';
import type { UserInputs, PlanResults } from '@/lib/calculations';

const TOKEN_KEY = 'gutf_plan_share_token_v1';
const SS_INPUTS = 'recomp-inputs';

export const getStoredShareToken = (): string | null => {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
};

export const setStoredShareToken = (t: string) => {
  try { localStorage.setItem(TOKEN_KEY, t); } catch {}
};

export const clearStoredShareToken = () => {
  try { localStorage.removeItem(TOKEN_KEY); } catch {}
};

export const cacheInputs = (inputs: UserInputs) => {
  try { sessionStorage.setItem(SS_INPUTS, JSON.stringify(inputs)); } catch {}
};

export const readCachedInputs = (): UserInputs | null => {
  try {
    const raw = sessionStorage.getItem(SS_INPUTS);
    return raw ? (JSON.parse(raw) as UserInputs) : null;
  } catch { return null; }
};

export interface SavePlanArgs {
  inputs: UserInputs;
  outputs: PlanResults;
  email?: string;
  firstName?: string;
  utm?: Record<string, unknown>;
  shareToken?: string;
}

export const savePlan = async (args: SavePlanArgs): Promise<string | null> => {
  try {
    const existing = args.shareToken || getStoredShareToken() || undefined;
    const { data, error } = await supabase.functions.invoke('save-plan', {
      body: {
        shareToken: existing,
        email: args.email,
        firstName: args.firstName,
        goalLabel: args.outputs.goalLabel,
        inputs: args.inputs,
        outputs: args.outputs,
        utm: args.utm,
      },
    });
    if (error || (data as any)?.error) {
      console.warn('savePlan failed', error || (data as any)?.error);
      return null;
    }
    const token = (data as any)?.shareToken as string | undefined;
    if (token) setStoredShareToken(token);
    return token || null;
  } catch (e) {
    console.warn('savePlan exception', e);
    return null;
  }
};

export interface FetchedPlan {
  shareToken: string;
  email: string | null;
  firstName: string | null;
  goalLabel: string | null;
  inputs: UserInputs;
  outputs: PlanResults;
  pdfUrl: string | null;
  createdAt: string;
}

export const fetchPlanByToken = async (
  token: string,
  source?: string,
): Promise<FetchedPlan | null> => {
  try {
    const { data, error } = await supabase.functions.invoke('get-plan', {
      body: { token, source },
    });
    if (error || (data as any)?.error || !(data as any)?.plan) return null;
    const p = (data as any).plan;
    return {
      shareToken: p.share_token,
      email: p.email,
      firstName: p.first_name,
      goalLabel: p.goal_label,
      inputs: p.inputs as UserInputs,
      outputs: p.outputs as PlanResults,
      pdfUrl: p.pdf_url,
      createdAt: p.created_at,
    };
  } catch (e) {
    console.warn('fetchPlanByToken exception', e);
    return null;
  }
};
