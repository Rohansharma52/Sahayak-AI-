import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navbar from "@/components/Navbar";
import LandingPage from "./pages/Index";
import LoginPage from "./pages/LoginPage";
import ChatPage from "./pages/ChatPage";
import ResultPage from "./pages/ResultPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [lang, setLang] = useState<"hi" | "en" | "ta">("hi");

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Navbar lang={lang} onSetLang={setLang} />
          <Routes>
            <Route path="/" element={<LandingPage lang={lang} />} />
            <Route path="/login" element={<LoginPage lang={lang} />} />
            <Route path="/chat" element={<ChatPage lang={lang} />} />
            <Route path="/app" element={<ChatPage lang={lang} />} />
            <Route path="/result" element={<ResultPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
