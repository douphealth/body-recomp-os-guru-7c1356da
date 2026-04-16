import { Navigate } from 'react-router-dom';
import { legacyPageMap } from '@/lib/seo-pages';

interface Props {
  legacyKey: string;
}

/**
 * Redirects legacy /app/body-recomp/* SEO URLs to canonical /plans/:slug.
 * Uses replace so back-button doesn't loop. Search engines treat client
 * redirects as soft-301 when paired with the canonical tag on the target page.
 */
const LegacyRedirect = ({ legacyKey }: Props) => {
  const target = legacyPageMap[legacyKey] || legacyKey;
  return <Navigate to={`/workout-plans/${target}`} replace />;
};

export default LegacyRedirect;
