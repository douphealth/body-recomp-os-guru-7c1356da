export const SITE_ORIGIN = 'https://gearuptofit.com';
export const APP_BASE_PATH = '/fitness-plan';
export const APP_CANONICAL_URL = `${SITE_ORIGIN}${APP_BASE_PATH}`;

export const toCanonicalUrl = (path = '/') => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${APP_CANONICAL_URL}${normalizedPath}`;
};