import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mic, Globe, Brain, FileText, ArrowRight, CheckCircle, Volume2, Leaf, Shield, Users, Sparkles } from "lucide-react";
import heroFarmer from "@/assets/hero-farmer.jpg";
import leafDecoration from "@/assets/leaf-decoration.png";
import fieldLandscape from "@/assets/field-landscape.jpg";
import logo from "@/assets/logo.png";

const content = {
  hi: {
    headline: "अपनी भाषा में",
    headlineHighlight: "सरकारी योजना",
    headlineSuffix: "जानिए",
    subtext: "बोलकर पूछिए और तुरंत पता करें कि आप eligible हैं या नहीं। कोई form भरने की ज़रूरत नहीं।",
    cta: "🎤 बोलकर शुरू करें",
    badges: ["⚡ सिर्फ 30 सेकंड में", "🔒 कोई signup नहीं", "🗣️ हिंदी में उपलब्ध"],
    features: [
      { icon: Mic, title: "बोलकर पूछिए", desc: "टाइप करने की ज़रूरत नहीं, बस बोलिए", color: "primary" },
      { icon: Globe, title: "अपनी भाषा में", desc: "हिंदी में बात करें, अपनी भाषा में समझें", color: "accent" },
      { icon: Brain, title: "समझिए क्यों eligible हैं", desc: "AI आसान भाषा में जवाब देता है", color: "warm" },
      { icon: FileText, title: "Apply कैसे करें", desc: "पूरी प्रक्रिया स्टेप बाय स्टेप", color: "primary" },
    ],
    featuresTitle: "Sahayak AI क्या करता है?",
    howTitle: "कैसे काम करता है?",
    howSubtitle: "बस 3 आसान कदम",
    steps: [
      { num: "1", title: "सवाल पूछिए", desc: "माइक बटन दबाकर अपना सवाल बोलिए", icon: Mic },
      { num: "2", title: "जवाब दीजिए", desc: "2-3 आसान प्रश्नों का हाँ/ना में जवाब दें", icon: Users },
      { num: "3", title: "Result पाइए", desc: "तुरंत अपनी eligibility और योजना जानिए", icon: Sparkles },
    ],
    demoTitle: "ऐसा दिखेगा आपका result",
    demoSubtitle: "असली result का preview देखें",
    schemeName: "PM-KISAN",
    schemeBenefit: "₹6,000/वर्ष",
    schemeReason: "आप eligible हैं क्योंकि आप छोटे किसान हैं",
    eligible: "✅ आप eligible हैं!",
    impactTitle: "किसानों का भरोसा",
    impactCount: "1,248+",
    impactDesc: "किसानों ने आज तक अपनी eligibility check की",
    impactSub: "और यह संख्या हर दिन बढ़ रही है",
    finalCta: "अभी अपनी eligibility check करें",
    finalCtaDesc: "कोई signup नहीं, कोई form नहीं — बस बोलिए",
    finalCtaBtn: "बोलकर शुरू करें",
    trustItems: ["100% मुफ़्त", "डाटा सुरक्षित", "सरकार द्वारा मान्य योजनाएं"],
  },
  en: {
    headline: "Know",
    headlineHighlight: "Government Schemes",
    headlineSuffix: "in Your Language",
    subtext: "Ask by speaking and instantly find out if you're eligible. No forms to fill.",
    cta: "🎤 Start by Speaking",
    badges: ["⚡ Just 30 seconds", "🔒 No signup needed", "🗣️ Available in Hindi"],
    features: [
      { icon: Mic, title: "Ask by speaking", desc: "No typing required, just speak", color: "primary" },
      { icon: Globe, title: "In your language", desc: "Talk in Hindi, understand in your language", color: "accent" },
      { icon: Brain, title: "Know why you're eligible", desc: "AI answers in simple language", color: "warm" },
      { icon: FileText, title: "Know how to apply", desc: "Step by step complete process", color: "primary" },
    ],
    featuresTitle: "What does Sahayak AI do?",
    howTitle: "How does it work?",
    howSubtitle: "Just 3 simple steps",
    steps: [
      { num: "1", title: "Ask a question", desc: "Press the mic button and speak your question", icon: Mic },
      { num: "2", title: "Answer questions", desc: "Simple yes or no answers to 2-3 questions", icon: Users },
      { num: "3", title: "Get your result", desc: "Instantly know your eligibility and scheme details", icon: Sparkles },
    ],
    demoTitle: "Your result will look like this",
    demoSubtitle: "Preview of an actual result",
    schemeName: "PM-KISAN",
    schemeBenefit: "₹6,000/year",
    schemeReason: "You are eligible because you are a small farmer",
    eligible: "✅ You are eligible!",
    impactTitle: "Trusted by Farmers",
    impactCount: "1,248+",
    impactDesc: "farmers checked their eligibility so far",
    impactSub: "and this number is growing every day",
    finalCta: "Check your eligibility now",
    finalCtaDesc: "No signup, no forms — just speak",
    finalCtaBtn: "Start by Speaking",
    trustItems: ["100% Free", "Data Secure", "Government Verified Schemes"],
  },
  ta: {
    headline: "உங்கள் மொழியில்",
    headlineHighlight: "அரசு திட்டங்களை",
    headlineSuffix: "அறியுங்கள்",
    subtext: "பேசி கேளுங்கள், உடனடியாக உங்கள் தகுதியை அறியுங்கள்.",
    cta: "🎤 பேசி தொடங்குங்கள்",
    badges: ["⚡ 30 வினாடியில்", "🔒 பதிவு தேவையில்லை", "🗣️ தமிழில் கிடைக்கும்"],
    features: [
      { icon: Mic, title: "பேசி கேளுங்கள்", desc: "டைப் செய்ய தேவையில்லை", color: "primary" },
      { icon: Globe, title: "உங்கள் மொழியில்", desc: "தமிழில் பேசுங்கள்", color: "accent" },
      { icon: Brain, title: "ஏன் தகுதி என்று புரிந்துகொள்ளுங்கள்", desc: "AI எளிய மொழியில் பதிலளிக்கும்", color: "warm" },
      { icon: FileText, title: "விண்ணப்பிப்பது எப்படி", desc: "படிப்படியான செயல்முறை", color: "primary" },
    ],
    featuresTitle: "Sahayak AI என்ன செய்கிறது?",
    howTitle: "இது எப்படி வேலை செய்கிறது?",
    howSubtitle: "3 எளிய படிகள்",
    steps: [
      { num: "1", title: "கேள்வி கேளுங்கள்", desc: "மைக் பொத்தானை அழுத்தி பேசுங்கள்", icon: Mic },
      { num: "2", title: "பதில் சொல்லுங்கள்", desc: "2-3 எளிய கேள்விகளுக்கு பதிலளியுங்கள்", icon: Users },
      { num: "3", title: "முடிவு பெறுங்கள்", desc: "உடனடியாக தகுதியை அறியுங்கள்", icon: Sparkles },
    ],
    demoTitle: "உங்கள் முடிவு இப்படி இருக்கும்",
    demoSubtitle: "உண்மையான முடிவின் முன்னோட்டம்",
    schemeName: "PM-KISAN",
    schemeBenefit: "₹6,000/ஆண்டு",
    schemeReason: "நீங்கள் சிறு விவசாயி என்பதால் தகுதி பெறுகிறீர்கள்",
    eligible: "✅ நீங்கள் தகுதி பெறுகிறீர்கள்!",
    impactTitle: "விவசாயிகளின் நம்பிக்கை",
    impactCount: "1,248+",
    impactDesc: "விவசாயிகள் தங்கள் தகுதியை சரிபார்த்துள்ளனர்",
    impactSub: "இந்த எண் ஒவ்வொரு நாளும் அதிகரிக்கிறது",
    finalCta: "இப்போது உங்கள் தகுதியை சரிபார்க்கவும்",
    finalCtaDesc: "பதிவு இல்லை, படிவம் இல்லை — பேசுங்கள்",
    finalCtaBtn: "பேசி தொடங்குங்கள்",
    trustItems: ["100% இலவசம்", "தரவு பாதுகாப்பு", "அரசு அங்கீகரிக்கப்பட்ட திட்டங்கள்"],
  },
};

interface LandingPageProps {
  lang: "hi" | "en" | "ta";
}

const LandingPage = ({ lang }: LandingPageProps) => {
  const t = content[lang];

  const fadeUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-50px" },
    transition: { duration: 0.6, ease: "easeOut" as const },
  };

  const stagger = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
  };

  const featureColors: Record<string, { bg: string; icon: string; border: string }> = {
    primary: { bg: "bg-primary-light", icon: "text-primary", border: "border-primary/10" },
    accent: { bg: "bg-accent-light", icon: "text-accent", border: "border-accent/10" },
    warm: { bg: "bg-[hsl(var(--warm-light))]", icon: "text-[hsl(var(--warm))]", border: "border-[hsl(var(--warm))]/10" },
  };

  return (
    <div className="pt-14 overflow-hidden">
      {/* ===== HERO SECTION ===== */}
      <section className="relative min-h-[90vh] flex items-center">
        <div className="absolute inset-0 bg-gradient-earth -z-20" />
        <img src={leafDecoration} alt="" className="absolute -top-10 -right-20 w-64 md:w-96 opacity-20 rotate-12 -z-10 pointer-events-none select-none" loading="lazy" width={800} height={800} />
        <img src={leafDecoration} alt="" className="absolute -bottom-20 -left-16 w-48 md:w-72 opacity-15 -rotate-45 -z-10 pointer-events-none select-none" loading="lazy" width={800} height={800} />
        <div className="absolute top-20 right-1/4 w-64 h-64 rounded-full bg-primary/5 blur-3xl -z-10" />
        <div className="absolute bottom-10 left-1/4 w-48 h-48 rounded-full bg-accent/5 blur-3xl -z-10" />

        <div className="container py-12 md:py-20">
          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
            <motion.div {...fadeUp} className="space-y-8">
              <div className="flex flex-wrap gap-2">
                {t.badges.map((b) => (
                  <span key={b} className="px-4 py-1.5 rounded-full text-xs font-semibold bg-card border border-border shadow-soft text-foreground">{b}</span>
                ))}
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold leading-[1.15] text-foreground">
                {t.headline} <span className="text-gradient-primary">{t.headlineHighlight}</span> {t.headlineSuffix}
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-lg leading-relaxed">{t.subtext}</p>
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <Link to="/login">
                  <motion.button
                    whileHover={{ scale: 1.03, boxShadow: "0 0 30px -5px hsl(142 52% 36% / 0.4)" }}
                    whileTap={{ scale: 0.97 }}
                    className="px-10 py-5 rounded-2xl bg-gradient-hero text-primary-foreground text-lg font-bold shadow-elevated transition-all"
                  >
                    {t.cta}
                  </motion.button>
                </Link>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield size={16} className="text-primary" />
                  {t.trustItems[1]}
                </div>
              </div>
              <div className="flex items-center gap-4 pt-2">
                {t.trustItems.map((item, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CheckCircle size={14} className="text-primary" />
                    {item}
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: 30 }}
              whileInView={{ opacity: 1, scale: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="relative"
            >
              <div className="absolute -inset-4 rounded-[2rem] border-2 border-dashed border-primary/15 -z-10" />
              <div className="rounded-3xl overflow-hidden shadow-elevated relative">
                <img src={heroFarmer} alt="Indian farmer using smartphone" className="w-full h-auto object-cover" width={1280} height={768} />
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/30 to-transparent" />
              </div>
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-6 -left-4 md:left-6 glass-strong rounded-2xl p-4 shadow-elevated border border-border/50 max-w-[240px]"
              >
                <div className="flex items-center gap-2 text-primary font-bold text-sm">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center"><CheckCircle size={18} /></div>
                  {t.eligible}
                </div>
                <p className="text-xs text-muted-foreground mt-1.5">{t.schemeName} • {t.schemeBenefit}</p>
              </motion.div>
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute -top-3 -right-3 md:right-6 md:top-4 glass-strong rounded-xl p-3 shadow-card border border-border/50"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-hero flex items-center justify-center"><Mic size={14} className="text-primary-foreground" /></div>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <motion.div key={i} animate={{ scaleY: [0.4, 1, 0.4] }} transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.1 }} className="w-1 h-4 rounded-full bg-primary" />
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="py-20 md:py-28 relative">
        <div className="absolute inset-0 bg-secondary -z-10" />
        <div className="absolute -top-16 left-0 right-0 h-16 -z-10">
          <svg viewBox="0 0 1440 64" fill="none" className="w-full h-full" preserveAspectRatio="none">
            <path d="M0 64V32C240 0 480 0 720 32C960 64 1200 64 1440 32V64H0Z" fill="hsl(120 20% 96%)" />
          </svg>
        </div>
        <div className="container">
          <motion.div {...fadeUp} className="text-center mb-14">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-light text-primary text-sm font-semibold mb-4"><Leaf size={16} /> Features</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground">{t.featuresTitle}</h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
            {t.features.map((f, i) => {
              const colors = featureColors[f.color] || featureColors.primary;
              return (
                <motion.div key={i} {...stagger} transition={{ duration: 0.5, delay: i * 0.1 }} whileHover={{ y: -6, boxShadow: "0 12px 40px -8px hsl(142 30% 30% / 0.15)" }} className={`bg-card rounded-3xl p-7 shadow-soft border ${colors.border} text-center space-y-4 cursor-default transition-all`}>
                  <div className={`w-16 h-16 rounded-2xl ${colors.bg} flex items-center justify-center mx-auto`}><f.icon size={28} className={colors.icon} /></div>
                  <h3 className="font-bold text-foreground text-base">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="py-20 md:py-28 relative">
        <div className="container">
          <motion.div {...fadeUp} className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-light text-accent text-sm font-semibold mb-4"><Sparkles size={16} /> {t.howSubtitle}</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground">{t.howTitle}</h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8 md:gap-12 relative">
            <div className="hidden md:block absolute top-14 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 z-0" />
            {t.steps.map((s, i) => (
              <motion.div key={i} {...stagger} transition={{ duration: 0.5, delay: i * 0.15 }} className="relative flex flex-col items-center text-center space-y-5 z-10">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-gradient-hero flex items-center justify-center shadow-glow"><s.icon size={32} className="text-primary-foreground" /></div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-card shadow-card flex items-center justify-center border-2 border-primary text-primary font-bold text-sm">{s.num}</div>
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-lg mb-1">{s.title}</h3>
                  <p className="text-sm text-muted-foreground max-w-[220px] mx-auto">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== DEMO PREVIEW ===== */}
      <section className="py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 -z-20">
          <img src={fieldLandscape} alt="" className="w-full h-full object-cover" loading="lazy" width={1920} height={600} />
          <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/85 to-background/95" />
        </div>
        <div className="container max-w-2xl relative z-10">
          <motion.div {...fadeUp} className="text-center mb-10">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-light text-primary text-sm font-semibold mb-4">Preview</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground">{t.demoTitle}</h2>
            <p className="text-muted-foreground mt-2">{t.demoSubtitle}</p>
          </motion.div>
          <motion.div {...fadeUp} transition={{ duration: 0.6, delay: 0.1 }} className="glass-strong rounded-3xl p-8 md:p-10 shadow-elevated border border-border/50 space-y-5">
            <motion.div initial={{ scale: 0.8 }} whileInView={{ scale: 1 }} viewport={{ once: true }} className="text-center">
              <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 text-primary text-lg font-bold"><CheckCircle size={22} />{t.eligible}</span>
            </motion.div>
            <div className="bg-primary-light/60 rounded-2xl p-6 space-y-3 border border-primary/10">
              <div className="flex justify-between items-center">
                <span className="font-extrabold text-foreground text-xl">{t.schemeName}</span>
                <span className="px-4 py-1.5 rounded-full bg-primary text-primary-foreground font-bold text-sm">{t.schemeBenefit}</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{t.schemeReason}</p>
            </div>
            <button className="flex items-center gap-2 mx-auto px-6 py-3 rounded-xl bg-accent/10 text-accent font-semibold text-sm hover:bg-accent/20 transition-colors border border-accent/10">
              <Volume2 size={18} /> 🔊 {lang === "hi" ? "सुनो" : lang === "ta" ? "கேளுங்கள்" : "Listen"}
            </button>
          </motion.div>
        </div>
      </section>

      {/* ===== IMPACT COUNTER ===== */}
      <section className="py-20 md:py-28">
        <div className="container">
          <motion.div {...fadeUp} className="relative bg-card rounded-[2rem] p-10 md:p-16 text-center shadow-card border border-border overflow-hidden">
            <img src={leafDecoration} alt="" className="absolute -top-10 -right-10 w-40 opacity-10 rotate-45 pointer-events-none select-none" loading="lazy" width={800} height={800} />
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-4">{t.impactTitle}</p>
            <motion.p initial={{ opacity: 0, scale: 0.5 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ type: "spring", stiffness: 100 }} className="text-6xl md:text-8xl font-black text-gradient-primary mb-4">{t.impactCount}</motion.p>
            <p className="text-xl text-foreground font-medium">{t.impactDesc}</p>
            <p className="text-sm text-muted-foreground mt-2">{t.impactSub}</p>
          </motion.div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="py-16 md:py-24">
        <div className="container">
          <motion.div {...fadeUp} className="relative bg-gradient-hero rounded-[2rem] p-10 md:p-16 text-center text-primary-foreground overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white/20 -translate-y-1/2 translate-x-1/3" />
              <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-white/10 translate-y-1/2 -translate-x-1/3" />
            </div>
            <div className="relative z-10 space-y-6 max-w-xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-extrabold leading-tight">{t.finalCta}</h2>
              <p className="text-primary-foreground/80 text-lg">{t.finalCtaDesc}</p>
              <Link to="/login">
                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} className="mt-4 px-10 py-5 rounded-2xl bg-card text-primary font-bold text-lg shadow-elevated transition-all">🎤 {t.finalCtaBtn}</motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="py-10 border-t border-border bg-secondary/50">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Sahayak AI" className="h-8 w-8" />
            <span className="font-bold text-foreground">Sahayak <span className="text-gradient-primary">AI</span></span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            {t.trustItems.map((item, i) => (
              <span key={i} className="flex items-center gap-1.5"><CheckCircle size={12} className="text-primary" />{item}</span>
            ))}
          </div>
          <span className="text-sm text-muted-foreground">© {new Date().getFullYear()} Sahayak AI</span>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
