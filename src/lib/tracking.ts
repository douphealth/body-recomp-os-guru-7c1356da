type TrackingEvent = {
  event: string;
  properties?: Record<string, string | number | boolean>;
  timestamp: number;
};

const events: TrackingEvent[] = [];

export function trackEvent(event: string, properties?: Record<string, string | number | boolean>) {
  const entry: TrackingEvent = { event, properties, timestamp: Date.now() };
  events.push(entry);
  console.log('[GearUpToFit Analytics]', event, properties || '');
}

export function trackCTAClick(ctaName: string, location: string) {
  trackEvent('cta_click', { cta_name: ctaName, location });
}

export function trackResultView(goalType: string) {
  trackEvent('result_view', { goal_type: goalType });
}

export function trackInternalLinkClick(url: string, context: string) {
  trackEvent('internal_link_click', { url, context });
}

export function getEvents() {
  return [...events];
}
