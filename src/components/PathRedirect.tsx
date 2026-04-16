import { Navigate, useParams } from 'react-router-dom';

interface Props {
  to: string;
}

/**
 * Permanent client-side redirect (uses replace so back button doesn't loop).
 * Search engines treat `<Navigate replace />` paired with the canonical
 * <link rel="canonical"> on the destination as a soft-301.
 */
export const PathRedirect = ({ to }: Props) => <Navigate to={to} replace />;

/** Redirect /plans/:slug → /workout-plans/:slug */
export const PlansSlugRedirect = () => {
  const { slug } = useParams<{ slug: string }>();
  return <Navigate to={`/workout-plans/${slug ?? ''}`} replace />;
};

/** Redirect /tools/:tool → /free-fitness-calculators/:tool */
export const ToolsSlugRedirect = () => {
  const { tool } = useParams<{ tool: string }>();
  return <Navigate to={`/free-fitness-calculators/${tool ?? ''}`} replace />;
};
