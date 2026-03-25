import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import BodyRecompWizard from "./pages/BodyRecompWizard.tsx";
import Results from "./pages/Results.tsx";
import SEOTemplatePage from "./pages/SEOTemplatePage.tsx";

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
          <Route path="/app/body-recomp/fat-loss-beginner-home-workouts" element={<SEOTemplatePage pageKey="fat-loss-beginner-home-workouts" />} />
          <Route path="/app/body-recomp/runner-cut-plan" element={<SEOTemplatePage pageKey="runner-cut-plan" />} />
          <Route path="/app/body-recomp/lean-muscle-high-protein" element={<SEOTemplatePage pageKey="lean-muscle-high-protein" />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
