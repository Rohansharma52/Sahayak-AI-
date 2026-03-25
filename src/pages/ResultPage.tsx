import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, Volume2, RotateCcw, FileText, CreditCard } from "lucide-react";

const content = {
  hi: {
    title: "✅ आप eligible हैं!",
    schemeName: "PM-KISAN सम्मान निधि",
    benefit: "₹6,000/वर्ष",
    reason: "आप eligible हैं क्योंकि आप छोटे किसान हैं और आपके पास 2 हेक्टेयर से कम ज़मीन है।",
    howToApply: "Apply कैसे करें",
    steps: [
      "नज़दीकी CSC केंद्र पर जाएं",
      "आधार कार्ड और ज़मीन के कागज़ात ले जाएं",
      "CSC ऑपरेटर से PM-KISAN में registration करवाएं",
    ],
    docsTitle: "ज़रूरी दस्तावेज़",
    docs: ["आधार कार्ड", "ज़मीन के कागज़ात (खसरा/खतौनी)", "बैंक पासबुक", "मोबाइल नंबर"],
    listen: "🔊 सुनो",
    retry: "दुबारा check करें",
  },
  en: {
    title: "✅ You are eligible!",
    schemeName: "PM-KISAN Samman Nidhi",
    benefit: "₹6,000/year",
    reason: "You are eligible because you are a small farmer with less than 2 hectares of land.",
    howToApply: "How to Apply",
    steps: [
      "Visit the nearest CSC center",
      "Carry Aadhaar card and land documents",
      "Ask the CSC operator to register you for PM-KISAN",
    ],
    docsTitle: "Required Documents",
    docs: ["Aadhaar Card", "Land documents (Khasra/Khatauni)", "Bank Passbook", "Mobile Number"],
    listen: "🔊 Listen",
    retry: "Check again",
  },
};

const ResultPage = () => {
  const location = useLocation();
  const lang = (location.state as any)?.lang || "hi";
  const t = content[lang as "hi" | "en"];

  const fadeUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  };

  return (
    <div className="pt-16 min-h-screen bg-background">
      <div className="container max-w-lg py-8 space-y-6">
        {/* Eligibility Banner */}
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.5 }}
          className="bg-primary-light rounded-3xl p-6 text-center space-y-2 border border-primary/10"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          >
            <CheckCircle size={48} className="text-primary mx-auto" />
          </motion.div>
          <h1 className="text-2xl font-bold text-foreground">{t.title}</h1>
        </motion.div>

        {/* Scheme Card */}
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="bg-card rounded-3xl p-6 shadow-elevated border border-border space-y-4"
        >
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-lg font-bold text-foreground">{t.schemeName}</h2>
              <p className="text-2xl font-extrabold text-primary mt-1">{t.benefit}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center">
              <CreditCard size={20} className="text-primary" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{t.reason}</p>
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent/10 text-accent font-medium text-sm hover:bg-accent/20 transition-colors">
            <Volume2 size={18} /> {t.listen}
          </button>
        </motion.div>

        {/* How to Apply */}
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-card rounded-3xl p-6 shadow-soft border border-border space-y-4"
        >
          <div className="flex items-center gap-2">
            <FileText size={20} className="text-primary" />
            <h3 className="font-bold text-foreground">{t.howToApply}</h3>
          </div>
          <ol className="space-y-3">
            {t.steps.map((step, i) => (
              <li key={i} className="flex gap-3 items-start">
                <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">
                  {i + 1}
                </span>
                <span className="text-sm text-foreground pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
        </motion.div>

        {/* Documents */}
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="bg-card rounded-3xl p-6 shadow-soft border border-border space-y-3"
        >
          <h3 className="font-bold text-foreground">{t.docsTitle}</h3>
          <ul className="space-y-2">
            {t.docs.map((doc, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                <CheckCircle size={16} className="text-primary shrink-0" />
                {doc}
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Retry CTA */}
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center pt-4"
        >
          <Link to="/app">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="px-8 py-4 rounded-2xl bg-gradient-hero text-primary-foreground font-semibold text-lg shadow-elevated flex items-center gap-2 mx-auto"
            >
              <RotateCcw size={20} /> {t.retry}
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default ResultPage;
