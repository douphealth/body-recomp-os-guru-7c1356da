/**
 * Centralized SEO-optimized route definitions.
 * Use these constants everywhere instead of hardcoded paths so URLs stay
 * consistent and search-engine-friendly.
 *
 * URL design principles applied:
 *  - Keyword-rich, descriptive slugs (e.g. "free-fitness-calculators")
 *  - Hyphen-separated lowercase
 *  - Short and memorable
 *  - Hierarchical structure that mirrors information architecture
 */

export const ROUTES = {
  home: '/',
  wizard: '/build-my-plan',
  results: '/build-my-plan/results',
  plansHub: '/workout-plans',
  planDetail: (slug: string) => `/workout-plans/${slug}`,
  toolsHub: '/free-fitness-calculators',
  tdee: '/free-fitness-calculators/tdee-calculator',
  macro: '/free-fitness-calculators/macro-calculator',
  protein: '/free-fitness-calculators/protein-calculator',
  oneRepMax: '/free-fitness-calculators/one-rep-max-calculator',
  bodyFat: '/free-fitness-calculators/body-fat-calculator',
  methodology: '/methodology',
} as const;

/**
 * Legacy → canonical path map.
 * Any old URL listed here is permanently redirected (client-side replace) to
 * its modern, SEO-optimized counterpart. This preserves existing inbound
 * links and search rankings while we transition to the new IA.
 */
export const LEGACY_PATH_REDIRECTS: Record<string, string> = {
  '/app/body-recomp': ROUTES.wizard,
  '/app/body-recomp/results': ROUTES.results,
  '/tools': ROUTES.toolsHub,
  '/tools/tdee-calculator': ROUTES.tdee,
  '/tools/macro-calculator': ROUTES.macro,
  '/tools/protein-calculator': ROUTES.protein,
  '/tools/one-rep-max-calculator': ROUTES.oneRepMax,
  '/tools/body-fat-calculator': ROUTES.bodyFat,
  '/plans': ROUTES.plansHub,
};
