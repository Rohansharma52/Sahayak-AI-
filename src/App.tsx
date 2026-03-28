import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ChatProvider } from "@/context/ChatContext";
import Navbar from "@/components/Navbar";
import LandingPage, { type AppLang } from "./pages/Index";
import LoginPage from "./pages/LoginPage";
import ChatPage from "./pages/ChatPage";
import ResultPage from "./pages/ResultPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { authenticated, loading } = useAuth();
  if (loading) return null;
  return authenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function AppRoutes() {
  const [lang, setLang] = useState<AppLang>("hi");
  const [activeNav, setActiveNav] = useState("home");

  return (
    <>
      <Navbar lang={lang} onSetLang={setLang} />
      <Routes>
        <Route path="/" element={<LandingPage lang={lang} activeNav={activeNav} onNavChange={setActiveNav} />} />
        <Route path="/login" element={<LoginPage lang={lang} />} />
        <Route path="/chat" element={<ProtectedRoute><ChatPage lang={lang} /></ProtectedRoute>} />
        <Route path="/app" element={<ProtectedRoute><ChatPage lang={lang} /></ProtectedRoute>} />
        <Route path="/result" element={<ProtectedRoute><ResultPage /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <TooltipProvider>
        <Sonner />
        <AuthProvider>
          <ChatProvider>
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </ChatProvider>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
