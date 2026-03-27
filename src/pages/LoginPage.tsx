import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, ArrowRight, ShieldCheck, Loader2 } from "lucide-react";
import logo from "@/assets/logo.png";

const content = {
  hi: {
    title: "अपना नंबर डालें",
    subtitle: "OTP से verify करें और शुरू करें",
    phonePlaceholder: "मोबाइल नंबर दर्ज करें",
    sendOtp: "OTP भेजें",
    otpSent: "OTP भेजा गया",
    otpPlaceholder: "OTP दर्ज करें",
    verify: "Verify करें",
    helper: "OTP सिर्फ verification के लिए है",
    verifying: "Verify हो रहा है…",
  },
  en: {
    title: "Enter your number",
    subtitle: "Verify with OTP and get started",
    phonePlaceholder: "Enter mobile number",
    sendOtp: "Send OTP",
    otpSent: "OTP Sent",
    otpPlaceholder: "Enter OTP",
    verify: "Verify",
    helper: "OTP is only for verification",
    verifying: "Verifying…",
  },
  ta: {
    title: "உங்கள் எண்ணை உள்ளிடவும்",
    subtitle: "OTP மூலம் சரிபார்க்கவும்",
    phonePlaceholder: "மொபைல் எண்ணை உள்ளிடவும்",
    sendOtp: "OTP அனுப்பு",
    otpSent: "OTP அனுப்பப்பட்டது",
    otpPlaceholder: "OTP உள்ளிடவும்",
    verify: "சரிபார்",
    helper: "OTP சரிபார்ப்புக்கு மட்டுமே",
    verifying: "சரிபார்க்கிறது…",
  },
};

interface LoginPageProps {
  lang: "hi" | "en" | "ta";
}

const LoginPage = ({ lang }: LoginPageProps) => {
  const navigate = useNavigate();
  const t = content[lang];
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [verifying, setVerifying] = useState(false);

  const handleSendOtp = () => {
    if (phone.length >= 10) {
      setOtpSent(true);
    }
  };

  const handleVerify = () => {
    if (otp.length >= 4) {
      setVerifying(true);
      setTimeout(() => {
        navigate("/chat");
      }, 1200);
    }
  };

  return (
    <div className="pt-16 min-h-screen bg-gradient-earth flex items-center justify-center px-4">
      {/* Dot pattern */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage: "radial-gradient(circle, hsl(142 52% 36% / 0.04) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm space-y-8"
      >
        {/* Logo */}
        <div className="text-center space-y-3">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 150 }}
            className="w-16 h-16 rounded-2xl bg-gradient-hero flex items-center justify-center mx-auto shadow-glow"
          >
            <img src={logo} alt="Sahayak AI" className="w-10 h-10" />
          </motion.div>
          <h1 className="text-2xl font-extrabold text-foreground">{t.title}</h1>
          <p className="text-sm text-muted-foreground">{t.subtitle}</p>
        </div>

        {/* Form Card */}
        <div className="bg-card rounded-3xl p-7 shadow-elevated border border-border space-y-5">
          {/* Phone Input */}
          <div className="space-y-2">
            <div className="relative">
              <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="tel"
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                placeholder={t.phonePlaceholder}
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground text-base focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>
          </div>

          {/* Send OTP Button */}
          <AnimatePresence mode="wait">
            {!otpSent ? (
              <motion.button
                key="send"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleSendOtp}
                disabled={phone.length < 10}
                className="w-full py-4 rounded-2xl bg-gradient-hero text-primary-foreground font-bold text-base shadow-card flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                {t.sendOtp} <ArrowRight size={18} />
              </motion.button>
            ) : (
              <motion.div
                key="otp-section"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                {/* OTP Sent badge */}
                <div className="flex items-center gap-2 justify-center text-sm text-primary font-semibold">
                  <ShieldCheck size={16} />
                  {t.otpSent} ✓
                </div>

                {/* OTP Input - individual boxes */}
                <div className="flex gap-3 justify-center">
                  {[0, 1, 2, 3].map((i) => (
                    <input
                      key={i}
                      type="text"
                      maxLength={1}
                      value={otp[i] || ""}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        const newOtp = otp.split("");
                        newOtp[i] = val;
                        setOtp(newOtp.join(""));
                        // Auto-focus next
                        if (val && e.target.nextElementSibling) {
                          (e.target.nextElementSibling as HTMLInputElement).focus();
                        }
                      }}
                      className="w-14 h-14 rounded-2xl bg-secondary border-2 border-border text-center text-xl font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    />
                  ))}
                </div>

                {/* Verify Button */}
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleVerify}
                  disabled={otp.length < 4 || verifying}
                  className="w-full py-4 rounded-2xl bg-gradient-hero text-primary-foreground font-bold text-base shadow-card flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  {verifying ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      {t.verifying}
                    </>
                  ) : (
                    <>
                      {t.verify} <ArrowRight size={18} />
                    </>
                  )}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Helper text */}
          <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1.5">
            <ShieldCheck size={12} className="text-primary" />
            {t.helper}
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
