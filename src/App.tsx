import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navbar from "@/components/Navbar";
import LandingPage from "./pages/Index";
import DemoPage from "./pages/DemoPage";
import ResultPage from "./pages/ResultPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [lang, setLang] = useState<"hi" | "en">("hi");
  const toggleLang = () => setLang((l) => (l === "hi" ? "en" : "hi"));

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Navbar lang={lang} onToggleLang={toggleLang} />
          <Routes>
            <Route path="/" element={<LandingPage lang={lang} />} />
            <Route path="/app" element={<DemoPage lang={lang} />} />
            <Route path="/result" element={<ResultPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
