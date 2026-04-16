import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useParams, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import BodyRecompWizard from "./pages/BodyRecompWizard.tsx";
import Results from "./pages/Results.tsx";
import ProgrammaticSEOPage from "./pages/ProgrammaticSEOPage.tsx";
import PlansHub from "./pages/PlansHub.tsx";
import Methodology from "./pages/Methodology.tsx";
import ToolsHub from "./pages/tools/ToolsHub.tsx";
import TDEECalculator from "./pages/tools/TDEECalculator.tsx";
import MacroCalculator from "./pages/tools/MacroCalculator.tsx";
import ProteinCalculator from "./pages/tools/ProteinCalculator.tsx";
import OneRepMaxCalculator from "./pages/tools/OneRepMaxCalculator.tsx";
import BodyFatCalculator from "./pages/tools/BodyFatCalculator.tsx";
import LegacyRedirect from "./components/LegacyRedirect.tsx";
import { PathRedirect, PlansSlugRedirect, ToolsSlugRedirect } from "./components/PathRedirect.tsx";
import { ROUTES } from "./lib/routes.ts";
import { seoPages, legacyPageMap } from "@/lib/seo-pages";

const queryClient = new QueryClient();

// Dynamic plan page wrapper
function DynamicPlanPage() {
  const { pageKey } = useParams<{ pageKey: string }>();
  if (!pageKey) return <NotFound />;
  return <ProgrammaticSEOPage pageKey={pageKey} />;
}

// Generic alias for any /app/body-recomp/<slug> URL — redirects to /workout-plans/<slug>
function LegacyAliasRedirect() {
  const { legacySlug } = useParams<{ legacySlug: string }>();
  if (!legacySlug) return <NotFound />;
  const target = legacyPageMap[legacySlug] || legacySlug;
  if (!seoPages.has(target)) return <NotFound />;
  return <Navigate to={`/workout-plans/${target}`} replace />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* === Canonical SEO-optimized routes === */}
          <Route path={ROUTES.home} element={<Index />} />
          <Route path={ROUTES.wizard} element={<BodyRecompWizard />} />
          <Route path={ROUTES.results} element={<Results />} />
          <Route path={ROUTES.plansHub} element={<PlansHub />} />
          <Route path="/workout-plans/:pageKey" element={<DynamicPlanPage />} />
          <Route path={ROUTES.methodology} element={<Methodology />} />
          <Route path={ROUTES.toolsHub} element={<ToolsHub />} />
          <Route path={ROUTES.tdee} element={<TDEECalculator />} />
          <Route path={ROUTES.macro} element={<MacroCalculator />} />
          <Route path={ROUTES.protein} element={<ProteinCalculator />} />
          <Route path={ROUTES.oneRepMax} element={<OneRepMaxCalculator />} />
          <Route path={ROUTES.bodyFat} element={<BodyFatCalculator />} />

          {/* === Legacy → canonical 301-style redirects === */}
          <Route path="/app/body-recomp" element={<PathRedirect to={ROUTES.wizard} />} />
          <Route path="/app/body-recomp/results" element={<PathRedirect to={ROUTES.results} />} />
          <Route path="/tools" element={<PathRedirect to={ROUTES.toolsHub} />} />
          <Route path="/tools/:tool" element={<ToolsSlugRedirect />} />
          <Route path="/plans" element={<PathRedirect to={ROUTES.plansHub} />} />
          <Route path="/plans/:slug" element={<PlansSlugRedirect />} />

          {/* Legacy SEO template URLs → canonical /workout-plans/:slug */}
          <Route path="/app/body-recomp/fat-loss-beginner-home-workouts" element={<LegacyRedirect legacyKey="fat-loss-beginner-home-workouts" />} />
          <Route path="/app/body-recomp/runner-cut-plan" element={<LegacyRedirect legacyKey="runner-cut-plan" />} />
          <Route path="/app/body-recomp/lean-muscle-high-protein" element={<LegacyRedirect legacyKey="lean-muscle-high-protein" />} />
          {/* Generic alias: any /app/body-recomp/<slug> → /workout-plans/<slug> */}
          <Route path="/app/body-recomp/:legacySlug" element={<LegacyAliasRedirect />} />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
