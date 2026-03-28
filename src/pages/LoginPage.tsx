import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, ArrowRight, Loader2 } from "lucide-react";
import { sendOTP, verifyOTP, signIn } from "@/services/cognitoService";
import { useAuth } from "@/context/AuthContext";
import logo from "@/assets/logo.png";

const UI = {
  hi: {
    title: "अपना नंबर दर्ज करें",
    subtitle: "OTP से login करें — कोई password नहीं",
    phonePlaceholder: "9876543210",
    sendOtp: "OTP भेजें",
    otpTitle: "OTP दर्ज करें",
    otpSubtitle: "आपके नंबर पर SMS आया होगा",
    otpPlaceholder: "6 अंकों का OTP",
    verify: "Verify करें",
    change: "नंबर बदलें",
    sending: "भेज रहे हैं...",
    verifying: "Verify हो रहा है...",
    trust: "आपका डेटा सुरक्षित है",
  },
  en: {
    title: "Enter your number",
    subtitle: "Login with OTP — no password needed",
    phonePlaceholder: "9876543210",
    sendOtp: "Send OTP",
    otpTitle: "Enter OTP",
    otpSubtitle: "Check your SMS for the OTP",
    otpPlaceholder: "6-digit OTP",
    verify: "Verify",
    change: "Change number",
    sending: "Sending...",
    verifying: "Verifying...",
    trust: "Your data is secure",
  },
  ta: {
    title: "உங்கள் எண்ணை உள்ளிடுங்கள்",
    subtitle: "OTP மூலம் உள்நுழையுங்கள்",
    phonePlaceholder: "9876543210",
    sendOtp: "OTP அனுப்பு",
    otpTitle: "OTP உள்ளிடுங்கள்",
    otpSubtitle: "SMS-ல் OTP வந்திருக்கும்",
    otpPlaceholder: "6 இலக்க OTP",
    verify: "சரிபார்",
    change: "எண்ணை மாற்று",
    sending: "அனுப்புகிறோம்...",
    verifying: "சரிபார்க்கிறோம்...",
    trust: "உங்கள் தரவு பாதுகாப்பானது",
  },
};

import type { AppLang } from "@/pages/Index";

interface LoginPageProps {
  lang: AppLang;
}

const LoginPage = ({ lang }: LoginPageProps) => {
  const t = UI[(lang as keyof typeof UI)] ?? UI.hi;
  const navigate = useNavigate();
  const { refreshUser, authenticated } = useAuth();

  // Already logged in — go straight to chat
  useEffect(() => {
    if (authenticated) navigate("/chat", { replace: true });
  }, [authenticated]);

  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendOTP = async () => {
    setError("");
    const cleaned = phone.replace(/\s|-/g, "");
    if (!cleaned.match(/^[0-9]{10}$/) && !cleaned.match(/^\+[0-9]{10,13}$/)) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }
    setLoading(true);
    try {
      await sendOTP(cleaned);
      setStep("otp");
    } catch (err: any) {
      setError(err.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    setError("");
    if (otp.trim().length < 4) {
      setError("Please enter the OTP");
      return;
    }
    setLoading(true);
    try {
      // Confirm registration with OTP
      await verifyOTP(phone, otp.trim());
      // Sign in after confirmation
      await signIn(phone);
      refreshUser();
      navigate("/chat");
    } catch (err: any) {
      setError(err.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-earth flex items-center justify-center px-4 pt-14">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8 space-y-3">
          <img src={logo} alt="Sahayak AI" className="h-14 w-14" />
          <h1 className="text-2xl font-extrabold text-foreground">
            Sahayak <span className="text-gradient-primary">AI</span>
          </h1>
        </div>

        <div className="bg-card rounded-3xl p-8 shadow-elevated border border-border space-y-6">
          {step === "phone" ? (
            <>
              <div>
                <h2 className="text-xl font-bold text-foreground">{t.title}</h2>
                <p className="text-sm text-muted-foreground mt-1">{t.subtitle}</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl border border-border bg-secondary focus-within:border-primary transition-colors">
                  <span className="text-sm font-semibold text-foreground shrink-0">+91</span>
                  <div className="w-px h-5 bg-border shrink-0" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    onKeyDown={(e) => e.key === "Enter" && handleSendOTP()}
                    placeholder="9876543210"
                    className="flex-1 bg-transparent text-foreground text-sm outline-none placeholder:text-muted-foreground"
                  />
                </div>

                {error && <p className="text-xs text-destructive px-1">{error}</p>}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSendOTP}
                  disabled={loading}
                  className="w-full py-4 rounded-2xl bg-gradient-hero text-primary-foreground font-bold text-base shadow-elevated flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading
                    ? <><Loader2 size={18} className="animate-spin" /> {t.sending}</>
                    : <>{t.sendOtp} <ArrowRight size={18} /></>
                  }
                </motion.button>
              </div>
            </>
          ) : (
            <>
              <div>
                <h2 className="text-xl font-bold text-foreground">{t.otpTitle}</h2>
                <p className="text-sm text-muted-foreground mt-1">{t.otpSubtitle}</p>
                <p className="text-xs text-primary font-semibold mt-1">+91 {phone}</p>
              </div>

              <div className="space-y-3">
                <input
                  type="number"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.slice(0, 6))}
                  onKeyDown={(e) => e.key === "Enter" && handleVerifyOTP()}
                  placeholder={t.otpPlaceholder}
                  className="w-full px-4 py-3.5 rounded-2xl border border-border bg-secondary text-foreground text-center text-2xl font-bold tracking-widest outline-none focus:border-primary transition-colors placeholder:text-sm placeholder:font-normal placeholder:tracking-normal"
                />

                {error && <p className="text-xs text-destructive px-1">{error}</p>}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleVerifyOTP}
                  disabled={loading}
                  className="w-full py-4 rounded-2xl bg-gradient-hero text-primary-foreground font-bold text-base shadow-elevated flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading
                    ? <><Loader2 size={18} className="animate-spin" /> {t.verifying}</>
                    : <>{t.verify} <ArrowRight size={18} /></>
                  }
                </motion.button>

                <button
                  onClick={() => { setStep("phone"); setOtp(""); setError(""); }}
                  className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
                >
                  ← {t.change}
                </button>
              </div>
            </>
          )}

          <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground pt-2 border-t border-border">
            <Shield size={12} className="text-primary" />
            {t.trust}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
