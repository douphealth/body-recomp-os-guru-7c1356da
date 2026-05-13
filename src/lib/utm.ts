/**
 * Captures UTM + referrer params on first hit and persists them in
 * sessionStorage so they can be attached to any later lead-capture event.
 */

export interface UTM {
  source?: string;
  medium?: string;
  campaign?: string;
  term?: string;
  content?: string;
  referrer?: string;
  landing?: string;
}

const KEY = 'gutf_brc_utm_v1';

export function captureUTM(): UTM {
  if (typeof window === 'undefined') return {};
  try {
    const existing = sessionStorage.getItem(KEY);
    if (existing) return JSON.parse(existing);
    const url = new URL(window.location.href);
    const utm: UTM = {
      source: url.searchParams.get('utm_source') || undefined,
      medium: url.searchParams.get('utm_medium') || undefined,
      campaign: url.searchParams.get('utm_campaign') || undefined,
      term: url.searchParams.get('utm_term') || undefined,
      content: url.searchParams.get('utm_content') || undefined,
      referrer: document.referrer || undefined,
      landing: window.location.pathname,
    };
    sessionStorage.setItem(KEY, JSON.stringify(utm));
    return utm;
  } catch {
    return {};
  }
}

export function getUTM(): UTM {
  if (typeof window === 'undefined') return {};
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : captureUTM();
  } catch {
    return {};
  }
}
