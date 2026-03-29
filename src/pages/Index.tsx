import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import {
  Mic, Camera, FileText, TrendingUp, Leaf, BookOpen,
  Home, BarChart2, Users, HelpCircle, LogOut, Volume2,
  MessageSquare, Droplets, CloudRain, Sun, ArrowUpRight,
  ChevronRight, Zap, Shield, CreditCard, Sparkles, Cloud,
  X, Calendar, Clock, Download, Play, Pause, Thermometer,
  Waves, Wind,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import MarketPage from "./MarketPage";
import SchemePage from "./SchemePage";
import WeatherPage from "./WeatherPage";
import AdvisoryPage from "./AdvisoryPage";
import ChatPage from "./ChatPage";
import WeatherCard from "@/components/WeatherCard";
import { LOCATIONS, getWeather, type WeatherData } from "@/services/weatherService";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export type AppLang = "hi" | "en" | "ta" | "mr" | "te" | "kn" | "bn" | "pa";
type TabId = "home" | "chat" | "mandi" | "rog" | "yojana" | "weather" | "advisory";

// ── Sidebar items ─────────────────────────────────────────────────────────────
const SIDEBAR = [
  { id: "home",     icon: Home,       label: "Home" },
  { id: "weather",  icon: Cloud,      label: "Weather" },
  { id: "mandi",    icon: BarChart2,  label: "Markets" },
  { id: "advisory", icon: BookOpen,   label: "Advisory" },
  { id: "rog",      icon: Camera,     label: "Scan" },
  { id: "yojana",   icon: FileText,   label: "Schemes" },
  { id: "chat",     icon: Users,      label: "Chatbot" },
  { id: "help",     icon: HelpCircle, label: "Help" },
];

// ── Scheme cards ──────────────────────────────────────────────────────────────
const SCHEMES = [
  { icon: "💰", emoji: Zap,     name: "PM Kisan",          desc: "₹6,000/year",          color: "#1f6b2a", bg: "#eaf7ea" },
  { icon: "🛡️", emoji: Shield,  name: "Crop Insurance",    desc: "PMFBY Protection",     color: "#1d4ed8", bg: "#eff6ff" },
  { icon: "💳", emoji: CreditCard, name: "Kisan Credit",   desc: "Low interest loans",   color: "#7c3aed", bg: "#f5f3ff" },
  { icon: "☀️", emoji: Sparkles, name: "Solar Pump",       desc: "PM KUSUM Scheme",      color: "#d97706", bg: "#fffbeb" },
];

// ── i18n ──────────────────────────────────────────────────────────────────────
const UI_EN = {
  greeting:"Namaste, Ramesh Ji", greetSub:"Your crops are looking healthy today. AI has analyzed weather, soil moisture and market trends.", aiPill:"AI THINKING", askBtn:"Ask Anything", reportBtn:"View Full Report", adviceTitle:"Today's Advice", adviceText:"Your soil is getting dry. Start irrigation tonight at 10 PM for 45 minutes.", listenBtn:"Listen", replyBtn:"Reply", weatherTitle:"Weather", marketTitle:"Market Prices", irrigationTitle: "Smart Irrigation Advisor", diseaseTitle:"Check Your Crops Instantly", diseaseSub:"AI can detect over 45 crop diseases and pests.", scanBtn:"Scan Now", schemesTitle:"Government Schemes", viewAll:"View All", soilMoisture: "Soil Moisture", soilDry: "Dry", soilOptimal: "Optimal", soilWet: "Wet", viewDetails: "View Details", getReport: "Get Full Report", cotton: "Cotton", wheat: "Wheat", mustard: "Mustard", services: "Our Services", kisanSahayak: "Kisan Sahayak", chatbotVoice: "Chatbot • Q&A • Voice",
  reportTitle: "Irrigation Intelligence Report", last3Days: "Last 3 Days Summary", next3Days: "Next 3 Days Forecast", irrigationRec: "Irrigation Recommendation", time: "Time", duration: "Duration", cropAdvice: "Crop-specific Advice", downloadPDF: "Download Report (PDF)", loading: "Fetching real-time data...", humidity: "Humidity", rainProb: "Rain Probability", windSpeed: "Wind Speed", min: "Min", max: "Max", tonight: "Tonight", minutes: "minutes", skipIrrigation: "Skip irrigation today", startIrrigation: "Start irrigation tonight", moistureStable: "Soil moisture is stable"
};

// ── Main Component ────────────────────────────────────────────────────────────
interface LandingPageProps { lang: AppLang; activeNav?: string; onNavChange?: (id: string) => void; }

const LandingPage = ({ lang, activeNav, onNavChange }: LandingPageProps) => {
  const { t } = useTranslation(lang);
  const [activeTab, setActiveTab] = useState<TabId>("home");
  const { authenticated, logout, profile } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);
  const [isPlayingAdvice, setIsPlayingAdvice] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      setIsLoadingWeather(true);
      const data = await getWeather(LOCATIONS[0].lat, LOCATIONS[0].lon, LOCATIONS[0].name);
      setWeatherData(data);
      setIsLoadingWeather(false);
    };
    fetchWeather();
  }, []);

  useEffect(() => {
    if (activeNav) {
      setActiveTab(activeNav as TabId);
    }
  }, [activeNav]);

  const goChat = (initialMessage?: string) => {
    if (!authenticated) {
      navigate("/login");
      return;
    }
    // We can pass the initial message via state or a global context
    navigate("/chat", { state: { initialMessage } });
  };

  const switchTab = (id: string) => { setActiveTab(id as TabId); onNavChange?.(id); };

  const isDarkMode = theme === "dark";
  const greetingText = `${t("Namaste")}, ${profile.name}`;

  // Smart Irrigation Logic (Data Driven)
  const temp = weatherData?.temperature ?? 31.5;
  const humidity = weatherData?.humidity ?? 62;
  const rainProb = weatherData?.rainProbability ?? 15;
  
  // Calculate last 48h rain from hourly data
  let last48hRain = 0;
  if (weatherData?.hourly?.precipitation) {
    // past_days=2 means first 48 hours are historical
    last48hRain = weatherData.hourly.precipitation.slice(0, 48).reduce((acc, r) => acc + r, 0);
  }

  let soilStatus: "Dry" | "Optimal" | "Wet" = "Optimal";
  let soilColor = "text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-400";
  let soilAdvice = UI_EN.moistureStable;
  let moistureLevel = 65;
  let recTime = "--:--";
  let recDuration = 0;

  if (last48hRain < 1 && temp > 30) {
    soilStatus = "Dry";
    soilColor = "text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400";
    soilAdvice = UI_EN.startIrrigation;
    moistureLevel = 28;
    recTime = "10:00 PM";
    recDuration = 40;
  } else if (last48hRain > 5 || humidity > 75) {
    soilStatus = "Wet";
    soilColor = "text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400";
    soilAdvice = UI_EN.skipIrrigation;
    moistureLevel = 88;
    recTime = "--:--";
    recDuration = 0;
  }

  const handleListenAdvice = () => {
    if (isPlayingAdvice) {
      window.speechSynthesis.cancel();
      setIsPlayingAdvice(false);
      return;
    }

    const textToRead = `${t(UI_EN.adviceTitle)}. ${t(soilAdvice === UI_EN.moistureStable ? "Soil moisture is stable. No immediate irrigation needed." : soilAdvice)}`;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    
    // Attempt to find a suitable voice (Hindi or English)
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.lang.includes(lang === 'hi' ? 'hi' : 'en')) || voices[0];
    if (preferredVoice) utterance.voice = preferredVoice;
    
    utterance.onend = () => setIsPlayingAdvice(false);
    utterance.onerror = () => setIsPlayingAdvice(false);
    
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsPlayingAdvice(true);
  };

  const handleDownloadReport = () => {
    try {
      const doc = new jsPDF();
      const timestamp = new Date().toLocaleString();
      
      // Header
      doc.setFontSize(22);
      doc.setTextColor(31, 107, 42); // Green
      doc.text("Sahayak AI - Irrigation Report", 14, 20);
      
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generated on: ${timestamp}`, 14, 28);
      doc.text(`Farmer: ${profile.name} | Location: ${weatherData?.city ?? LOCATIONS[0].name}`, 14, 33);
      
      // Current Status Table
      autoTable(doc, {
        startY: 40,
        head: [['Metric', 'Value']],
        body: [
          ['Soil Status', t(soilStatus)],
          ['Estimated Moisture', `${moistureLevel}%`],
          ['Current Temperature', `${temp}°C`],
          ['Humidity', `${humidity}%`],
          ['Rain Probability', `${rainProb}%`],
          ['Recent Rain (48h)', `${last48hRain.toFixed(1)} mm`],
        ],
        theme: 'striped',
        headStyles: { fillStyle: 'F', fillColor: [31, 107, 42] }
      });

      // Recommendation
      const finalY = (doc as any).lastAutoTable.finalY || 80;
      doc.setFontSize(16);
      doc.setTextColor(0);
      doc.text("AI Recommendation", 14, finalY + 15);
      
      doc.setFontSize(12);
      doc.text(`Advice: ${t(soilAdvice)}`, 14, finalY + 25);
      doc.text(`Scheduled Time: ${recTime}`, 14, finalY + 32);
      doc.text(`Duration: ${recDuration} ${t(UI_EN.minutes)}`, 14, finalY + 39);

      // Save PDF
      doc.save(`Irrigation_Report_${profile.name.replace(/\s+/g, '_')}.pdf`);
      toast.success(t("Report downloaded successfully!"));
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF");
    }
  };

  const Sidebar = () => (
    <aside className="fixed left-0 top-16 bottom-0 w-16 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex flex-col items-center py-4 gap-1.5 z-40 shadow-md"
      style={{ boxShadow: isDarkMode ? "1px 0 8px rgba(0,0,0,0.4)" : "1px 0 8px rgba(0,0,0,0.04)" }}>
      {SIDEBAR.map(item => {
        const isActive = activeTab === item.id;
        return (
          <button key={item.id} onClick={() => switchTab(item.id)}
            title={t(item.label)}
            className={`relative w-10 h-10 rounded-2xl flex items-center justify-center transition-all group ${isActive ? (isDarkMode ? 'bg-green-900/30' : 'bg-green-50') : ''}`}
          >
            <item.icon size={18} style={{ color: isActive ? (isDarkMode ? "#4ade80" : "#1f6b2a") : "#9ca3af" }} />
            {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full" style={{ background: isDarkMode ? "#4ade80" : "#1f6b2a" }} />}
            <span className="absolute left-14 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
              {t(item.label)}
            </span>
          </button>
        );
      })}
      <div className="flex-1" />
      <button onClick={async () => { await logout(); navigate("/"); }} title={t("Logout")}
        className="w-10 h-10 rounded-2xl flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/20 transition-all group relative">
        <LogOut size={18} className="text-gray-400 group-hover:text-red-500 transition-colors" />
      </button>
    </aside>
  );

  if (activeTab === "mandi")    return <div className="pt-16 pl-16 min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300"><Sidebar /><MarketPage lang={lang} /></div>;
  if (activeTab === "yojana")   return <div className="pt-16 pl-16 min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300"><Sidebar /><SchemePage lang={lang} /></div>;
  if (activeTab === "weather")  return <div className="pt-16 pl-16 min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300"><Sidebar /><WeatherPage lang={lang} /></div>;
  if (activeTab === "advisory") return <div className="pt-16 pl-16 min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300"><Sidebar /><AdvisoryPage lang={lang} /></div>;
  if (activeTab === "chat") return <div className="pt-16 pl-16 min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300"><Sidebar /><div className="flex-1 h-[calc(100vh-64px)]"><ChatPage lang={lang} /></div></div>;
  if (activeTab === "rog") return <div className="pt-16 pl-16 min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300"><Sidebar /><div className="flex-1 h-[calc(100vh-64px)]"><ChatPage lang={lang} /></div></div>;

  return (
    <div className="pt-16 pl-16 min-h-screen transition-colors duration-300" style={{ background: isDarkMode ? "#0a0c0a" : "#f7faf7" }}>
      <Sidebar />
      <div className="max-w-6xl mx-auto px-5 md:px-8 py-7 space-y-6">

        {/* HERO */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
          className="rounded-3xl overflow-hidden relative shadow-xl shadow-green-900/10"
          style={{ background:"linear-gradient(135deg,#1f6b2a 0%,#2e8b57 50%,#3aaa6a 100%)", minHeight:220 }}>
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-10 pointer-events-none"
            style={{ background:"white", transform:"translate(30%,-30%)" }} />
          <div className="absolute bottom-0 left-1/3 w-48 h-48 rounded-full opacity-10 pointer-events-none"
            style={{ background:"white", transform:"translateY(40%)" }} />
          <div className="relative z-10 grid md:grid-cols-2 gap-6 p-7 md:p-9">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full"
                style={{ background:"rgba(255,255,255,0.2)", color:"white" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse" />{t(UI_EN.aiPill)}
              </span>
              <div>
                <h1 className="text-3xl md:text-4xl font-black text-white leading-tight">{greetingText}</h1>
                <p className="text-green-100 mt-2 text-sm leading-relaxed max-w-sm">{t(UI_EN.greetSub)}</p>
              </div>
              <div className="flex flex-wrap gap-3 pt-1">
                <motion.button whileHover={{ scale:1.04 }} whileTap={{ scale:0.96 }} onClick={() => goChat()}
                  className="flex items-center gap-2.5 px-6 py-3 rounded-2xl font-black text-sm shadow-lg transition-all"
                  style={{ background:"white", color:"#1f6b2a" }}>
                  <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background:"#eaf7ea" }}>
                    <Mic size={15} style={{ color:"#1f6b2a" }} />
                  </div>{t(UI_EN.askBtn)}
                </motion.button>
                <motion.button whileHover={{ scale:1.04 }} whileTap={{ scale:0.96 }} onClick={() => setReportModalOpen(true)}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all"
                  style={{ background:"rgba(255,255,255,0.15)", color:"white", border:"1px solid rgba(255,255,255,0.3)" }}>
                  <FileText size={15} />{t(UI_EN.reportBtn)}
                </motion.button>
              </div>
            </div>
            <div className="rounded-2xl p-5 space-y-3" style={{ background:"rgba(255,255,255,0.15)", border:"1px solid rgba(255,255,255,0.2)" }}>
              <div className="flex items-center justify-between">
                <h3 className="font-black text-white text-sm">{t(UI_EN.adviceTitle)}</h3>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background:"rgba(255,255,255,0.2)", color:"white" }}>AI</span>
              </div>
              <div className="rounded-xl p-4 border-l-4 border-green-300" style={{ background:"rgba(255,255,255,0.1)" }}>
                <p className="text-green-50 text-sm leading-relaxed">"{t(UI_EN.adviceText)}"</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={handleListenAdvice}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all hover:bg-white/30 active:scale-95"
                  style={{ background:"rgba(255,255,255,0.2)", color:"white" }}>
                  {isPlayingAdvice ? <Pause size={13} /> : <Play size={13} />}
                  {isPlayingAdvice ? t("Stop") : t(UI_EN.listenBtn)}
                </button>
                <button onClick={() => goChat("Should I irrigate today?")} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all hover:bg-white/20 active:scale-95"
                  style={{ background:"rgba(255,255,255,0.1)", color:"white", border:"1px solid rgba(255,255,255,0.2)" }}>
                  <MessageSquare size={13} />{t(UI_EN.replyBtn)}
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 3 CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* LIVE Weather Card */}
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
            className="rounded-3xl overflow-hidden shadow-lg shadow-black/5" style={{ minHeight: 180 }}>
            <WeatherCard lang={lang} defaultLocation={LOCATIONS[0]} compact />
          </motion.div>

          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.15 }}
            className="bg-white dark:bg-gray-900 rounded-3xl p-5 border border-gray-100 dark:border-gray-800 transition-colors shadow-lg shadow-black/5"
            style={{ boxShadow:"0 2px 20px rgba(0,0,0,0.05)" }}>
            <div className="flex items-center justify-between mb-4">
              <p className="font-black text-gray-800 dark:text-white text-sm">{t(UI_EN.marketTitle)}</p>
              <button onClick={() => switchTab("mandi")} className="text-xs font-bold flex items-center gap-0.5 text-green-600 dark:text-green-400">
                {t("View")}<ChevronRight size={13} />
              </button>
            </div>
            <div className="space-y-3">
              {[
                { name: t("Cotton"),  price:"₹7,240", change:"+1.2%", up:true },
                { name: t("Wheat"),   price:"₹2,150", change:"+0.8%", up:true },
                { name: t("Mustard"), price:"₹5,450", change:"-0.5%", up:false },
              ].map((item,i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-800 last:border-0">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{item.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-gray-900 dark:text-white">{item.price}</span>
                    <span className={`text-xs font-bold flex items-center gap-0.5 px-2 py-0.5 rounded-full ${item.up?"bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400":"bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"}`}>
                      <ArrowUpRight size={10} className={item.up?"":"rotate-90"} />{item.change}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}
            className="bg-white dark:bg-gray-900 rounded-3xl p-5 border border-gray-100 dark:border-gray-800 flex flex-col justify-between transition-colors shadow-lg shadow-black/5 relative overflow-hidden group"
            style={{ boxShadow:"0 2px 20px rgba(0,0,0,0.05)" }}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/5 to-green-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            
            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <p className="font-black text-gray-900 dark:text-white text-sm leading-tight">{t(UI_EN.irrigationTitle)}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${soilColor}`}>
                      {t(soilStatus)}
                    </span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 text-blue-600 dark:text-blue-400">
                  <Droplets size={20} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="p-2 rounded-2xl bg-gray-50/50 dark:bg-gray-800/50 border border-gray-100/50 dark:border-gray-700/50 text-center">
                  <Sun size={14} className="mx-auto mb-1 text-amber-500" />
                  <p className="text-[10px] font-bold text-gray-900 dark:text-white">{temp}°C</p>
                </div>
                <div className="p-2 rounded-2xl bg-gray-50/50 dark:bg-gray-800/50 border border-gray-100/50 dark:border-gray-700/50 text-center">
                  <Droplets size={14} className="mx-auto mb-1 text-blue-500" />
                  <p className="text-[10px] font-bold text-gray-900 dark:text-white">{humidity}%</p>
                </div>
                <div className="p-2 rounded-2xl bg-gray-50/50 dark:bg-gray-800/50 border border-gray-100/50 dark:border-gray-700/50 text-center">
                  <CloudRain size={14} className="mx-auto mb-1 text-cyan-500" />
                  <p className="text-[10px] font-bold text-gray-900 dark:text-white">{rainProb}%</p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 p-3 rounded-2xl border border-blue-100/50 dark:border-blue-800/50">
                <div className="flex items-center gap-2 mb-1.5">
                  <Sparkles size={14} className="text-blue-600 dark:text-blue-400" />
                  <p className="text-[11px] font-black text-blue-900 dark:text-blue-100 uppercase tracking-wide">AI Advice</p>
                </div>
                <p className="text-xs font-bold text-gray-700 dark:text-gray-300 leading-relaxed italic">
                  "{t(soilAdvice)}"
                </p>
              </div>

              <div>
                <div className="flex justify-between text-[10px] mb-1.5 px-1">
                  <span className="text-gray-500 dark:text-gray-400 font-black uppercase tracking-widest">{t(UI_EN.soilMoisture)}</span>
                  <span className="font-black text-blue-600 dark:text-blue-400">{moistureLevel}%</span>
                </div>
                <div className="w-full rounded-full h-2.5 overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                  <motion.div initial={{ width:0 }} animate={{ width:`${moistureLevel}%` }}
                    transition={{ duration:1.5, ease:"easeOut", delay:0.5 }}
                    className="h-full rounded-full relative"
                    style={{ background: soilStatus === "Dry" ? "linear-gradient(90deg,#ef4444,#f87171)" : 
                                       soilStatus === "Wet" ? "linear-gradient(90deg,#3b82f6,#06b6d4)" : 
                                       "linear-gradient(90deg,#22c55e,#4ade80)" }}>
                    <div className="absolute inset-0 bg-white/20 animate-pulse" />
                  </motion.div>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setReportModalOpen(true)}
              className="w-full mt-4 py-2.5 rounded-2xl text-xs font-black transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-200 dark:hover:border-gray-600 active:scale-95 shadow-sm"
            >
              {t(UI_EN.getReport)}
            </button>
          </motion.div>
        </div>

        {/* Irrigation Intelligence Modal */}
        <AnimatePresence>
          {reportModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-gray-100 dark:border-gray-800 transition-colors"
              >
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                      <FileText size={20} />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-gray-900 dark:text-white leading-tight">{t(UI_EN.reportTitle)}</h2>
                      <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">{new Date().toLocaleDateString(lang, { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                  </div>
                  <button onClick={() => setReportModalOpen(false)} className="p-2 rounded-xl bg-white dark:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 shadow-sm border border-gray-100 dark:border-gray-700 transition-all">
                    <X size={20} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                  {/* Status Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className={`p-6 rounded-3xl border ${soilStatus === 'Dry' ? 'bg-red-50 border-red-100 dark:bg-red-900/10 dark:border-red-900/30' : soilStatus === 'Wet' ? 'bg-blue-50 border-blue-100 dark:bg-blue-900/10 dark:border-blue-900/30' : 'bg-green-50 border-green-100 dark:bg-green-900/10 dark:border-green-900/30'}`}>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{t(UI_EN.soilMoisture)}</p>
                      <div className="flex items-end justify-between mb-4">
                        <h3 className={`text-4xl font-black ${soilStatus === 'Dry' ? 'text-red-600' : soilStatus === 'Wet' ? 'text-blue-600' : 'text-green-600'}`}>{moistureLevel}%</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest ${soilColor}`}>{t(soilStatus)}</span>
                      </div>
                      <div className="w-full h-3 bg-white dark:bg-gray-800 rounded-full overflow-hidden border border-gray-100 dark:border-gray-700">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${moistureLevel}%` }} className={`h-full ${soilStatus === 'Dry' ? 'bg-red-500' : soilStatus === 'Wet' ? 'bg-blue-500' : 'bg-green-500'}`} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: UI_EN.humidity, val: `${humidity}%`, icon: Droplets, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" },
                        { label: UI_EN.rainProb, val: `${rainProb}%`, icon: CloudRain, color: "text-cyan-500", bg: "bg-cyan-50 dark:bg-cyan-900/20" },
                        { label: "Temperature", val: `${temp}°C`, icon: Thermometer, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20" },
                        { label: UI_EN.windSpeed, val: `${weatherData?.windspeed ?? 12} km/h`, icon: Wind, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-900/20" },
                      ].map((item, i) => (
                        <div key={i} className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                          <item.icon size={16} className={`${item.color} mb-2`} />
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t(item.label)}</p>
                          <p className="text-sm font-black text-gray-900 dark:text-white">{item.val}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommendation */}
                  <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-600 to-emerald-700 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-4">
                        <Sparkles size={18} className="text-blue-200" />
                        <h3 className="text-lg font-black uppercase tracking-wider">{t(UI_EN.irrigationRec)}</h3>
                      </div>
                      <p className="text-xl font-bold mb-6">"{t(soilAdvice)}"</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                          <div className="flex items-center gap-2 mb-1">
                            <Clock size={14} className="text-blue-200" />
                            <p className="text-[10px] font-bold uppercase tracking-widest text-blue-100">{t(UI_EN.time)}</p>
                          </div>
                          <p className="text-lg font-black">{recTime}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                          <div className="flex items-center gap-2 mb-1">
                            <Waves size={14} className="text-blue-200" />
                            <p className="text-[10px] font-bold uppercase tracking-widest text-blue-100">{t(UI_EN.duration)}</p>
                          </div>
                          <p className="text-lg font-black">{recDuration} {t(UI_EN.minutes)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Forecast Summary */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                        <Calendar size={16} className="text-blue-600" />
                        {t(UI_EN.next3Days)}
                      </h3>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {weatherData?.daily?.time.slice(3, 6).map((time, i) => {
                        // weatherData.daily.time[2] is today, so 3,4,5 are tomorrow and next 2 days
                        const date = new Date(time);
                        const dayName = i === 0 ? "Tomorrow" : date.toLocaleDateString(lang, { weekday: 'short' });
                        const maxTemp = weatherData.daily.temperature_2m_max[i + 3];
                        const code = weatherData.daily.weathercode[i + 3];
                        const prob = weatherData.daily.precipitation_probability_max[i + 3];
                        
                        return (
                          <div key={i} className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-center">
                            <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">{t(dayName)}</p>
                            <div className="text-2xl mb-1">
                              {code === 0 ? "☀️" : code <= 3 ? "⛅" : "🌧️"}
                            </div>
                            <p className="text-sm font-black text-gray-900 dark:text-white">{Math.round(maxTemp)}°</p>
                            <p className="text-[10px] font-bold text-blue-600">{prob}%</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Crop Specific Advice */}
                  <div className="p-6 rounded-3xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                    <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Leaf size={16} className="text-green-600" />
                      {t(UI_EN.cropAdvice)} ({t(profile.mainCrop)})
                    </h3>
                    <ul className="space-y-3">
                      {[
                        "Maintain consistent moisture during the flowering stage.",
                        "Monitor for pest infestation after the expected rain on Tuesday.",
                        "Apply Nitrogen-based fertilizer if irrigation is started tonight."
                      ].map((tip, i) => (
                        <li key={i} className="flex gap-3 text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0 mt-1.5" />
                          {t(tip)}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex gap-3">
                  <button 
                    onClick={() => setReportModalOpen(false)}
                    className="flex-1 py-4 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-black text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-all active:scale-95"
                  >
                    {t("Close")}
                  </button>
                  <button 
                    onClick={handleDownloadReport}
                    className="flex-1 py-4 rounded-2xl bg-blue-600 text-white font-black text-sm hover:bg-blue-700 shadow-xl shadow-blue-100 dark:shadow-blue-900/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Download size={18} />
                    {t(UI_EN.downloadPDF)}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* DISEASE BANNER */}
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.25 }}
          className="rounded-3xl overflow-hidden relative shadow-xl shadow-green-900/10"
          style={{ background:"linear-gradient(135deg,#0f2d13 0%,#1a4a1f 50%,#1f6b2a 100%)", minHeight:160 }}>
          <div className="absolute inset-0 opacity-5"
            style={{ backgroundImage:"radial-gradient(circle,white 1px,transparent 1px)", backgroundSize:"28px 28px" }} />
          <div className="absolute right-8 top-1/2 -translate-y-1/2 text-8xl opacity-20 select-none pointer-events-none">🌿</div>
          <div className="absolute right-24 top-1/2 -translate-y-1/2 text-6xl opacity-15 select-none pointer-events-none rotate-12">🍃</div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 px-8 py-8">
            <div className="text-center md:text-left">
              <span className="inline-block text-xs font-bold px-3 py-1 rounded-full mb-3"
                style={{ background:"rgba(255,255,255,0.15)", color:"#86efac" }}>{t("AI Powered Detection")}</span>
              <h2 className="text-2xl md:text-3xl font-black text-white">{t(UI_EN.diseaseTitle)}</h2>
              <p className="mt-1.5 text-sm" style={{ color:"#86efac" }}>{t(UI_EN.diseaseSub)}</p>
            </div>
            <motion.button whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }} onClick={goChat}
              className="shrink-0 flex items-center gap-2.5 px-8 py-4 rounded-2xl font-black text-base shadow-2xl transition-all"
              style={{ background:"white", color:"#1f6b2a" }}>
              <Camera size={20} />{t(UI_EN.scanBtn)}
            </motion.button>
          </div>
        </motion.div>

        {/* MAIN SERVICES */}
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.28 }}>
          <h2 className="text-xl font-black text-gray-900 dark:text-white mb-4">{t("Our Services")}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                id: "chat",
                emoji: "🤖",
                label: "Kisan Sahayak",
                sub: "Chatbot • Q&A • Voice",
                grad: "from-green-500 to-emerald-600",
                glow: "rgba(34,197,94,0.25)",
                bg: isDarkMode ? "#0f2d13" : "#eaf7ea",
                icon: "💬",
              },
              {
                id: "mandi",
                emoji: "💹",
                label: "Market Prices",
                sub: "Live crop prices • Compare",
                grad: "from-blue-500 to-cyan-600",
                glow: "rgba(59,130,246,0.25)",
                bg: isDarkMode ? "#0c2b3d" : "#eff6ff",
                icon: "📊",
              },
              {
                id: "yojana",
                emoji: "📋",
                label: "Govt Schemes",
                sub: "PM Kisan • Subsidy • Loan",
                grad: "from-orange-500 to-amber-500",
                glow: "rgba(249,115,22,0.25)",
                bg: isDarkMode ? "#2d1a0a" : "#fffbeb",
                icon: "🏛️",
              },
              {
                id: "rog",
                emoji: "🍃",
                label: "Crop Disease",
                sub: "AI disease detection",
                grad: "from-emerald-500 to-teal-600",
                glow: "rgba(16,185,129,0.25)",
                bg: isDarkMode ? "#0a2d21" : "#ecfdf5",
                icon: "🔬",
              },
            ].map((tab, i) => (
              <motion.button
                key={tab.id}
                onClick={() => switchTab(tab.id)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.08, type: "spring", stiffness: 120 }}
                whileHover={{
                  y: -8,
                  scale: 1.03,
                  boxShadow: `0 20px 40px -8px ${tab.glow}`,
                  transition: { duration: 0.2 },
                }}
                whileTap={{ scale: 0.97 }}
                className="relative overflow-hidden rounded-3xl p-5 text-left cursor-pointer border border-gray-100 dark:border-gray-800 group transition-all"
                style={{ background: isDarkMode ? "#111827" : "white", boxShadow: "0 2px 16px rgba(0,0,0,0.05)" }}
              >
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${tab.grad} rounded-t-3xl`} />
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br ${tab.grad} opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-3xl`}
                />
                <div className="relative z-10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                      style={{ background: tab.bg }}>
                      {tab.emoji}
                    </div>
                    <motion.div
                      className={`w-7 h-7 rounded-full bg-gradient-to-br ${tab.grad} flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all`}
                      whileHover={{ rotate: 45 }}>
                      <ChevronRight size={14} className="text-white" />
                    </motion.div>
                  </div>
                  <div>
                    <p className="font-black text-gray-900 dark:text-white text-sm leading-tight">{t(tab.label)}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{t(tab.sub)}</p>
                  </div>
                  <div className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-gradient-to-r ${tab.grad} text-white`}>
                    {tab.icon} {t("Open")}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* SCHEMES CARDS */}
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black text-gray-900 dark:text-white">{t(UI_EN.schemesTitle)}</h2>
            <button onClick={() => switchTab("yojana")} className="flex items-center gap-1 text-sm font-bold text-green-600 dark:text-green-400">
              {t(UI_EN.viewAll)}<ChevronRight size={15} />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {SCHEMES.map((s,i) => (
              <motion.div key={i}
                initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.35+i*0.07 }}
                whileHover={{ y:-5, boxShadow:"0 20px 40px -8px rgba(0,0,0,0.12)" }}
                onClick={() => switchTab("yojana")}
                className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 cursor-pointer transition-all group shadow-lg shadow-black/5"
                style={{ boxShadow:"0 2px 12px rgba(0,0,0,0.04)" }}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-3 transition-transform group-hover:scale-110"
                  style={{ background: isDarkMode ? s.bg + "20" : s.bg }}>{s.icon}</div>
                <p className="font-black text-gray-900 dark:text-white text-sm leading-tight">{t(s.name)}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t(s.desc)}</p>
                <div className="flex items-center gap-1 mt-3 text-xs font-bold" style={{ color:s.color }}>
                  {t("Learn more")}<ChevronRight size={11} />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="py-4 border-t border-gray-100 dark:border-gray-800 text-center">
          <p className="text-xs text-gray-400 dark:text-gray-500">© {new Date().getFullYear()} Sahayak AI — Made with ❤️ for Indian Farmers</p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
