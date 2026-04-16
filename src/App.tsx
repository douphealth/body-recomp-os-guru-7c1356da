import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/app/body-recomp" element={<BodyRecompWizard />} />
          <Route path="/app/body-recomp/results" element={<Results />} />
          <Route path="/plans" element={<PlansHub />} />
          <Route path="/plans/:pageKey" element={<DynamicPlanPage />} />
          <Route path="/methodology" element={<Methodology />} />
          <Route path="/tools" element={<ToolsHub />} />
          <Route path="/tools/tdee-calculator" element={<TDEECalculator />} />
          <Route path="/tools/macro-calculator" element={<MacroCalculator />} />
          <Route path="/tools/protein-calculator" element={<ProteinCalculator />} />
          <Route path="/tools/one-rep-max-calculator" element={<OneRepMaxCalculator />} />
          <Route path="/tools/body-fat-calculator" element={<BodyFatCalculator />} />
          {/* Legacy SEO template URLs → 301-style redirect to canonical /plans/:slug */}
          <Route path="/app/body-recomp/fat-loss-beginner-home-workouts" element={<LegacyRedirect legacyKey="fat-loss-beginner-home-workouts" />} />
          <Route path="/app/body-recomp/runner-cut-plan" element={<LegacyRedirect legacyKey="runner-cut-plan" />} />
          <Route path="/app/body-recomp/lean-muscle-high-protein" element={<LegacyRedirect legacyKey="lean-muscle-high-protein" />} />
          {/* Generic alias: any /app/body-recomp/<slug> → /plans/<slug> */}
          <Route path="/app/body-recomp/:legacySlug" element={<LegacyAliasRedirect />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

// Dynamic plan page wrapper
import { useParams } from "react-router-dom";
function DynamicPlanPage() {
  const { pageKey } = useParams<{ pageKey: string }>();
  if (!pageKey) return <NotFound />;
  return <ProgrammaticSEOPage pageKey={pageKey} />;
}

export default App;
