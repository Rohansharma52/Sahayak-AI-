import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mic, Globe, Brain, FileText, ArrowRight, CheckCircle, Volume2 } from "lucide-react";
import heroFarmer from "@/assets/hero-farmer.jpg";
import logo from "@/assets/logo.png";

const content = {
  hi: {
    headline: "अपनी भाषा में सरकारी योजना जानिए",
    subtext: "बोलकर पूछिए और तुरंत पता करें कि आप eligible हैं या नहीं",
    cta: "🎤 बोलकर शुरू करें",
    badges: ["सिर्फ 30 सेकंड में", "कोई signup नहीं", "हिंदी में उपलब्ध"],
    features: [
      { icon: Mic, title: "बोलकर पूछिए", desc: "टाइप करने की ज़रूरत नहीं" },
      { icon: Globe, title: "अपनी भाषा में", desc: "हिंदी में बात करें" },
      { icon: Brain, title: "समझिए क्यों eligible हैं", desc: "आसान भाषा में जवाब" },
      { icon: FileText, title: "Apply कैसे करें जानिए", desc: "पूरी प्रक्रिया स्टेप बाय स्टेप" },
    ],
    howTitle: "कैसे काम करता है?",
    steps: [
      { num: "1", title: "सवाल पूछिए", desc: "माइक बटन दबाकर अपना सवाल बोलिए" },
      { num: "2", title: "2-3 प्रश्नों का जवाब दीजिए", desc: "हाँ या ना में जवाब दें" },
      { num: "3", title: "तुरंत result पाइए", desc: "अपनी eligibility जानिए" },
    ],
    demoTitle: "ऐसा दिखेगा आपका result",
    schemeName: "PM-KISAN",
    schemeBenefit: "₹6,000/वर्ष",
    schemeReason: "आप eligible हैं क्योंकि आप छोटे किसान हैं",
    eligible: "✅ आप eligible हैं!",
    impactTitle: "आज तक",
    impactCount: "1,248+",
    impactDesc: "किसानों ने अपनी eligibility check की",
    finalCta: "अभी try करें",
    finalCtaBtn: "बोलकर शुरू करें",
  },
  en: {
    headline: "Know Government Schemes in Your Language",
    subtext: "Ask by speaking and instantly find out if you're eligible",
    cta: "🎤 Start by Speaking",
    badges: ["Just 30 seconds", "No signup needed", "Available in Hindi"],
    features: [
      { icon: Mic, title: "Ask by speaking", desc: "No typing required" },
      { icon: Globe, title: "In your language", desc: "Talk in Hindi" },
      { icon: Brain, title: "Understand why you're eligible", desc: "Answers in simple language" },
      { icon: FileText, title: "Know how to apply", desc: "Step by step process" },
    ],
    howTitle: "How does it work?",
    steps: [
      { num: "1", title: "Ask a question", desc: "Press the mic button and speak" },
      { num: "2", title: "Answer 2-3 questions", desc: "Simple yes or no answers" },
      { num: "3", title: "Get instant result", desc: "Know your eligibility" },
    ],
    demoTitle: "Your result will look like this",
    schemeName: "PM-KISAN",
    schemeBenefit: "₹6,000/year",
    schemeReason: "You are eligible because you are a small farmer",
    eligible: "✅ You are eligible!",
    impactTitle: "So far",
    impactCount: "1,248+",
    impactDesc: "farmers checked their eligibility",
    finalCta: "Try it now",
    finalCtaBtn: "Start by Speaking",
  },
};

interface LandingPageProps {
  lang: "hi" | "en";
}

const LandingPage = ({ lang }: LandingPageProps) => {
  const t = content[lang];

  const fadeUp = {
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.5 },
  };

  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="container py-12 md:py-20">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <motion.div {...fadeUp} className="space-y-6">
              <div className="flex flex-wrap gap-2">
                {t.badges.map((b) => (
                  <span key={b} className="px-3 py-1 rounded-full text-xs font-medium bg-primary-light text-primary border border-primary/10">
                    {b}
                  </span>
                ))}
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold leading-tight text-foreground">
                {t.headline}
              </h1>
              <p className="text-lg text-muted-foreground max-w-md">{t.subtext}</p>
              <Link to="/app">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="mt-2 px-8 py-4 rounded-2xl bg-gradient-hero text-primary-foreground text-lg font-semibold shadow-elevated hover:shadow-card transition-all"
                >
                  {t.cta}
                </motion.button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="rounded-3xl overflow-hidden shadow-elevated">
                <img src={heroFarmer} alt="Indian farmer using smartphone" className="w-full h-auto object-cover" width={1280} height={768} />
              </div>
              {/* Floating card */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-4 -left-4 md:left-4 bg-card rounded-2xl p-4 shadow-elevated border border-border max-w-[220px]"
              >
                <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                  <CheckCircle size={18} />
                  {t.eligible}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{t.schemeName} • {t.schemeBenefit}</p>
              </motion.div>
            </motion.div>
          </div>
        </div>
        {/* Background accent */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-primary-light/30 -z-10 rounded-bl-[100px]" />
      </section>

      {/* Features */}
      <section className="py-16 md:py-24 bg-secondary">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {t.features.map((f, i) => (
              <motion.div
                key={i}
                {...fadeUp}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-card rounded-2xl p-6 shadow-soft text-center space-y-3 hover:shadow-card transition-shadow"
              >
                <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center mx-auto">
                  <f.icon size={24} className="text-primary" />
                </div>
                <h3 className="font-semibold text-foreground text-sm md:text-base">{f.title}</h3>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 md:py-24">
        <div className="container">
          <motion.h2 {...fadeUp} className="text-2xl md:text-3xl font-bold text-center text-foreground mb-12">
            {t.howTitle}
          </motion.h2>
          <div className="flex flex-col md:flex-row items-start justify-center gap-6 md:gap-0">
            {t.steps.map((s, i) => (
              <React.Fragment key={i}>
                <motion.div {...fadeUp} transition={{ duration: 0.5, delay: i * 0.15 }} className="flex items-center gap-4 md:flex-col md:text-center md:w-48">
                  <div className="w-14 h-14 rounded-full bg-gradient-hero text-primary-foreground flex items-center justify-center text-xl font-bold shrink-0">
                    {s.num}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{s.title}</h3>
                    <p className="text-sm text-muted-foreground">{s.desc}</p>
                  </div>
                </motion.div>
                {i < t.steps.length - 1 && (
                  <div className="hidden md:flex items-center pt-5">
                    <ArrowRight className="text-primary/30 mx-2" size={24} />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Preview */}
      <section className="py-16 md:py-24 bg-secondary">
        <div className="container max-w-lg">
          <motion.h2 {...fadeUp} className="text-2xl md:text-3xl font-bold text-center text-foreground mb-8">
            {t.demoTitle}
          </motion.h2>
          <motion.div
            {...fadeUp}
            className="bg-card rounded-3xl p-6 md:p-8 shadow-elevated border border-border space-y-4"
          >
            <div className="text-center">
              <span className="text-2xl font-bold text-primary">{t.eligible}</span>
            </div>
            <div className="bg-primary-light rounded-2xl p-5 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-foreground text-lg">{t.schemeName}</span>
                <span className="text-primary font-bold text-lg">{t.schemeBenefit}</span>
              </div>
              <p className="text-sm text-muted-foreground">{t.schemeReason}</p>
            </div>
            <button className="flex items-center gap-2 mx-auto px-5 py-2.5 rounded-xl bg-accent/10 text-accent font-medium text-sm hover:bg-accent/20 transition-colors">
              <Volume2 size={18} /> {lang === "hi" ? "🔊 सुनो" : "🔊 Listen"}
            </button>
          </motion.div>
        </div>
      </section>

      {/* Impact Counter */}
      <section className="py-16 md:py-20">
        <div className="container text-center">
          <motion.div {...fadeUp} className="space-y-2">
            <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">{t.impactTitle}</p>
            <p className="text-5xl md:text-7xl font-extrabold text-gradient-primary">{t.impactCount}</p>
            <p className="text-lg text-muted-foreground">{t.impactDesc}</p>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 md:py-24">
        <div className="container">
          <motion.div
            {...fadeUp}
            className="bg-gradient-hero rounded-3xl p-8 md:p-14 text-center text-primary-foreground space-y-6"
          >
            <h2 className="text-2xl md:text-4xl font-bold">{t.finalCta}</h2>
            <Link to="/app">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="px-8 py-4 rounded-2xl bg-card text-primary font-semibold text-lg shadow-elevated hover:shadow-card transition-all"
              >
                🎤 {t.finalCtaBtn}
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container flex items-center justify-center gap-2">
          <img src={logo} alt="Sahayak AI" className="h-6 w-6" />
          <span className="text-sm text-muted-foreground">
            Sahayak AI © {new Date().getFullYear()}
          </span>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
