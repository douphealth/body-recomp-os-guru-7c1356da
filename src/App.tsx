import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
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
          {/* Legacy SEO template redirects */}
          <Route path="/app/body-recomp/fat-loss-beginner-home-workouts" element={<ProgrammaticSEOPage pageKey="fat-loss-beginner-home-workouts" />} />
          <Route path="/app/body-recomp/runner-cut-plan" element={<ProgrammaticSEOPage pageKey="runner-cut-plan" />} />
          <Route path="/app/body-recomp/lean-muscle-high-protein" element={<ProgrammaticSEOPage pageKey="lean-muscle-high-protein" />} />
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
