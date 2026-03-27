import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, Volume2, VolumeX, RotateCcw, FileText, CreditCard, Shield, Leaf, ArrowRight } from "lucide-react";
import leafDecoration from "@/assets/leaf-decoration.png";

const content = {
  hi: {
    title: "आप eligible हैं!",
    subtitle: "बधाई हो! आप नीचे दी गई योजना के लिए पात्र हैं।",
    schemeName: "PM-KISAN सम्मान निधि",
    benefit: "₹6,000/वर्ष",
    benefitPeriod: "3 किस्तों में",
    reason: "आप eligible हैं क्योंकि आप छोटे किसान हैं और आपके पास 2 हेक्टेयर से कम ज़मीन है।",
    howToApply: "Apply कैसे करें",
    steps: [
      "नज़दीकी CSC केंद्र पर जाएं",
      "आधार कार्ड और ज़मीन के कागज़ात ले जाएं",
      "CSC ऑपरेटर से PM-KISAN में registration करवाएं",
    ],
    docsTitle: "ज़रूरी दस्तावेज़",
    docs: [
      { name: "आधार कार्ड", icon: CreditCard },
      { name: "ज़मीन के कागज़ात", icon: FileText },
      { name: "बैंक पासबुक", icon: CreditCard },
      { name: "मोबाइल नंबर", icon: Shield },
    ],
    listen: "🔊 सुनो",
    playing: "🔊 बज रहा है…",
    retry: "दुबारा check करें",
  },
  en: {
    title: "You are eligible!",
    subtitle: "Congratulations! You qualify for the scheme below.",
    schemeName: "PM-KISAN Samman Nidhi",
    benefit: "₹6,000/year",
    benefitPeriod: "in 3 installments",
    reason: "You are eligible because you are a small farmer with less than 2 hectares of land.",
    howToApply: "How to Apply",
    steps: [
      "Visit the nearest CSC center",
      "Carry Aadhaar card and land documents",
      "Ask the CSC operator to register you for PM-KISAN",
    ],
    docsTitle: "Required Documents",
    docs: [
      { name: "Aadhaar Card", icon: CreditCard },
      { name: "Land documents", icon: FileText },
      { name: "Bank Passbook", icon: CreditCard },
      { name: "Mobile Number", icon: Shield },
    ],
    listen: "🔊 Listen",
    playing: "🔊 Playing…",
    retry: "Check again",
  },
  ta: {
    title: "நீங்கள் தகுதி பெறுகிறீர்கள்!",
    subtitle: "வாழ்த்துக்கள்! கீழே உள்ள திட்டத்திற்கு நீங்கள் தகுதி பெறுகிறீர்கள்.",
    schemeName: "PM-KISAN சம்மான் நிதி",
    benefit: "₹6,000/ஆண்டு",
    benefitPeriod: "3 தவணைகளில்",
    reason: "நீங்கள் 2 ஹெக்டேருக்கும் குறைவான நிலம் உள்ள சிறு விவசாயி என்பதால் தகுதி பெறுகிறீர்கள்.",
    howToApply: "விண்ணப்பிப்பது எப்படி",
    steps: [
      "அருகிலுள்ள CSC மையத்திற்கு செல்லுங்கள்",
      "ஆதார் அட்டை மற்றும் நில ஆவணங்களை எடுத்துச் செல்லுங்கள்",
      "CSC ஆபரேட்டரிடம் PM-KISAN-ல் பதிவு செய்யுங்கள்",
    ],
    docsTitle: "தேவையான ஆவணங்கள்",
    docs: [
      { name: "ஆதார் அட்டை", icon: CreditCard },
      { name: "நில ஆவணங்கள்", icon: FileText },
      { name: "வங்கி பாஸ்புக்", icon: CreditCard },
      { name: "மொபைல் எண்", icon: Shield },
    ],
    listen: "🔊 கேளுங்கள்",
    playing: "🔊 ஒலிக்கிறது…",
    retry: "மீண்டும் சரிபார்",
  },
};

const ResultPage = () => {
  const location = useLocation();
  const lang = (location.state as any)?.lang || "hi";
  const t = content[lang as "hi" | "en" | "ta"];
  const [playing, setPlaying] = useState(false);

  const handlePlay = () => {
    setPlaying(true);
    setTimeout(() => setPlaying(false), 3000);
  };

  const fadeUp = {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
  };

  return (
    <div className="pt-14 min-h-screen bg-gradient-earth relative overflow-hidden">
      <img src={leafDecoration} alt="" className="absolute top-24 -right-16 w-48 opacity-10 rotate-12 pointer-events-none select-none" loading="lazy" width={800} height={800} />
      <div className="absolute top-0 left-0 right-0 h-72 bg-gradient-to-b from-primary/5 to-transparent -z-10" />
      <div className="absolute inset-0 -z-10" style={{ backgroundImage: "radial-gradient(circle, hsl(142 52% 36% / 0.03) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />

      <div className="container max-w-lg py-8 space-y-6 relative z-10">
        {/* Eligibility Banner */}
        <motion.div {...fadeUp} transition={{ duration: 0.5 }} className="relative rounded-3xl p-8 text-center space-y-3 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-hero -z-10" />
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, delay: 0.2 }} className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto">
            <CheckCircle size={36} className="text-primary-foreground" />
          </motion.div>
          <h1 className="text-2xl font-extrabold text-primary-foreground">{t.title}</h1>
          <p className="text-primary-foreground/80 text-sm">{t.subtitle}</p>
        </motion.div>

        {/* Scheme Card */}
        <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.15 }} className="bg-card rounded-3xl p-7 shadow-elevated border border-border space-y-5">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-2"><Leaf size={18} className="text-primary" /><span className="text-xs font-semibold text-primary uppercase tracking-wider">Scheme</span></div>
              <h2 className="text-xl font-extrabold text-foreground">{t.schemeName}</h2>
            </div>
            <div className="text-right">
              <p className="text-3xl font-black text-gradient-primary">{t.benefit}</p>
              <p className="text-xs text-muted-foreground">{t.benefitPeriod}</p>
            </div>
          </div>
          <div className="h-px bg-border" />
          <p className="text-sm text-muted-foreground leading-relaxed">{t.reason}</p>
          <button
            onClick={handlePlay}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-colors border ${
              playing
                ? "bg-primary/10 text-primary border-primary/20"
                : "bg-accent/10 text-accent border-accent/10 hover:bg-accent/20"
            }`}
          >
            {playing ? (
              <>
                <VolumeX size={18} />
                {t.playing}
                <span className="flex gap-0.5 ml-1">
                  {[1, 2, 3].map((b) => (
                    <motion.span key={b} animate={{ scaleY: [0.3, 1, 0.3] }} transition={{ duration: 0.5, repeat: Infinity, delay: b * 0.1 }} className="inline-block w-0.5 h-3 rounded-full bg-primary" />
                  ))}
                </span>
              </>
            ) : (
              <><Volume2 size={18} /> {t.listen}</>
            )}
          </button>
        </motion.div>

        {/* How to Apply */}
        <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.3 }} className="bg-card rounded-3xl p-7 shadow-card border border-border space-y-5">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center"><FileText size={20} className="text-primary" /></div>
            <h3 className="font-bold text-foreground text-lg">{t.howToApply}</h3>
          </div>
          <ol className="space-y-4">
            {t.steps.map((step, i) => (
              <li key={i} className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-gradient-hero text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0 shadow-soft">{i + 1}</div>
                <span className="text-sm text-foreground font-medium flex-1">{step}</span>
              </li>
            ))}
          </ol>
        </motion.div>

        {/* Documents */}
        <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.45 }} className="bg-card rounded-3xl p-7 shadow-card border border-border space-y-4">
          <h3 className="font-bold text-foreground text-lg">{t.docsTitle}</h3>
          <div className="grid grid-cols-2 gap-3">
            {t.docs.map((doc, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-secondary border border-border text-sm text-foreground">
                <doc.icon size={16} className="text-primary shrink-0" />
                <span className="text-xs font-medium">{doc.name}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Retry */}
        <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.6 }} className="text-center pt-4 pb-8">
          <Link to="/chat">
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="px-10 py-5 rounded-2xl bg-gradient-hero text-primary-foreground font-bold text-lg shadow-elevated flex items-center gap-3 mx-auto">
              <RotateCcw size={20} /> {t.retry}
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default ResultPage;
