import { useState, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, Volume2, VolumeX, RotateCcw, FileText, CreditCard, Shield, Leaf } from "lucide-react";
import leafDecoration from "@/assets/leaf-decoration.png";
import type { SchemeResult } from "@/context/ChatContext";
import { useChat } from "@/context/ChatContext";

const DOC_ICONS: Record<number, typeof CreditCard> = { 0: CreditCard, 1: FileText, 2: CreditCard, 3: Shield };

const STATIC = {
  hi: { howToApply: "Apply कैसे करें", docsTitle: "ज़रूरी दस्तावेज़", listen: "🔊 सुनो", playing: "🔊 बज रहा है…", retry: "दुबारा check करें", schemeLabel: "Scheme" },
  en: { howToApply: "How to Apply", docsTitle: "Required Documents", listen: "🔊 Listen", playing: "🔊 Playing…", retry: "Check again", schemeLabel: "Scheme" },
  ta: { howToApply: "விண்ணப்பிப்பது எப்படி", docsTitle: "தேவையான ஆவணங்கள்", listen: "🔊 கேளுங்கள்", playing: "🔊 ஒலிக்கிறது…", retry: "மீண்டும் சரிபார்", schemeLabel: "Scheme" },
};

const ResultPage = () => {
  const location = useLocation();
  const data = location.state as SchemeResult | null;
  const { resetChat } = useChat();
  const lang = data?.lang || "hi";
  const s = STATIC[lang];

  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const schemeName = data?.schemeName || "PM-KISAN";
  const benefit = data?.benefit || "₹6,000";
  const reason = data?.reason || "";
  const steps: string[] = data?.steps || [];
  const docs: string[] = data?.docs || [];
  const audioUrl = data?.audioUrl;

  const eligTitle = lang === "hi" ? "आप eligible हैं!" : lang === "ta" ? "நீங்கள் தகுதி பெறுகிறீர்கள்!" : "You are eligible!";
  const eligSubtitle = lang === "hi" ? "बधाई हो! आप नीचे दी गई योजना के लिए पात्र हैं।" : lang === "ta" ? "வாழ்த்துக்கள்!" : "Congratulations! You qualify for the scheme below.";

  const handlePlay = () => {
    if (!audioUrl) return;
    if (playing) { audioRef.current?.pause(); setPlaying(false); return; }
    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    audio.play();
    setPlaying(true);
    audio.onended = () => setPlaying(false);
  };

  const fadeUp = { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 } };

  return (
    <div className="pt-14 min-h-screen bg-gradient-earth relative overflow-hidden">
      <img src={leafDecoration} alt="" className="absolute top-24 -right-16 w-48 opacity-10 rotate-12 pointer-events-none select-none" loading="lazy" width={800} height={800} />
      <div className="absolute top-0 left-0 right-0 h-72 bg-gradient-to-b from-primary/5 to-transparent -z-10" />
      <div className="absolute inset-0 -z-10" style={{ backgroundImage: "radial-gradient(circle, hsl(142 52% 36% / 0.03) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />

      <div className="container max-w-lg py-8 space-y-6 relative z-10">
        {/* Eligibility Banner */}
        <motion.div {...fadeUp} transition={{ duration: 0.5 }} className="relative rounded-3xl p-8 text-center space-y-3 overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-gradient-hero" />
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, delay: 0.2 }} className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto">
            <CheckCircle size={36} className="text-primary-foreground" />
          </motion.div>
          <h1 className="text-2xl font-extrabold text-primary-foreground">{eligTitle}</h1>
          <p className="text-primary-foreground/80 text-sm">{eligSubtitle}</p>
        </motion.div>

        {/* Scheme Card */}
        <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.15 }} className="bg-card rounded-3xl p-7 shadow-elevated border border-border space-y-5">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-2"><Leaf size={18} className="text-primary" /><span className="text-xs font-semibold text-primary uppercase tracking-wider">{s.schemeLabel}</span></div>
              <h2 className="text-xl font-extrabold text-foreground">{schemeName}</h2>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-gradient-primary">{benefit}</p>
            </div>
          </div>
          <div className="h-px bg-border" />
          <p className="text-sm text-muted-foreground leading-relaxed">{reason}</p>
          <button onClick={handlePlay} disabled={!audioUrl}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-colors border disabled:opacity-40 ${playing ? "bg-primary/10 text-primary border-primary/20" : "bg-accent/10 text-accent border-accent/10 hover:bg-accent/20"}`}>
            {playing
              ? <><VolumeX size={18} />{s.playing}</>
              : <><Volume2 size={18} />{s.listen}</>}
          </button>
        </motion.div>

        {/* How to Apply */}
        {steps.length > 0 && (
          <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.3 }} className="bg-card rounded-3xl p-7 shadow-card border border-border space-y-5">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center"><FileText size={20} className="text-primary" /></div>
              <h3 className="font-bold text-foreground text-lg">{s.howToApply}</h3>
            </div>
            <ol className="space-y-4">
              {steps.map((step, i) => (
                <li key={i} className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-gradient-hero text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0 shadow-soft">{i + 1}</div>
                  <span className="text-sm text-foreground font-medium flex-1">{step}</span>
                </li>
              ))}
            </ol>
          </motion.div>
        )}

        {/* Documents */}
        {docs.length > 0 && (
          <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.45 }} className="bg-card rounded-3xl p-7 shadow-card border border-border space-y-4">
            <h3 className="font-bold text-foreground text-lg">{s.docsTitle}</h3>
            <div className="grid grid-cols-2 gap-3">
              {docs.map((doc, i) => {
                const Icon = DOC_ICONS[i % 4] || CreditCard;
                return (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-secondary border border-border">
                    <Icon size={16} className="text-primary shrink-0" />
                    <span className="text-xs font-medium text-foreground">{doc}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Retry */}
        <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.6 }} className="text-center pt-4 pb-8">
          <Link to="/chat" onClick={resetChat}>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="px-10 py-5 rounded-2xl bg-gradient-hero text-primary-foreground font-bold text-lg shadow-elevated flex items-center gap-3 mx-auto">
              <RotateCcw size={20} /> {s.retry}
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default ResultPage;
