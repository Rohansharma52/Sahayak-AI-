import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, ArrowRight, Loader2 } from "lucide-react";
import { sendOTP, verifyOTP, signIn } from "@/services/cognitoService";
import { useAuth } from "@/context/AuthContext";
import logo from "@/assets/logo.png";

const UI = {
  hi: {
    title: "किसान पंजीकरण",
    subtitle: "अपनी जानकारी भरें और लॉगिन करें",
    phonePlaceholder: "9876543210",
    sendOtp: "OTP भेजें",
    otpTitle: "OTP दर्ज करें",
    otpSubtitle: "आपके नंबर पर 6 अंकों का कोड भेजा गया है",
    otpPlaceholder: "OTP दर्ज करें",
    verify: "Verify और लॉगिन करें",
    change: "नंबर बदलें",
    sending: "भेज रहे हैं...",
    verifying: "Verify हो रहा है...",
    trust: "आपका डेटा सुरक्षित है",
    fullName: "पूरा नाम",
    state: "राज्य",
    district: "जिला",
    village: "गांव",
    landSize: "जमीन (एकड़)",
  },
  en: {
    title: "Farmer Registration",
    subtitle: "Fill details and login with OTP",
    phonePlaceholder: "9876543210",
    sendOtp: "Send OTP",
    otpTitle: "Enter OTP",
    otpSubtitle: "A 6-digit code has been sent to your number",
    otpPlaceholder: "Enter OTP",
    verify: "Verify & Login",
    change: "Change number",
    sending: "Sending...",
    verifying: "Verifying...",
    trust: "Your data is secure",
    fullName: "Full Name",
    state: "State",
    district: "District",
    village: "Village",
    landSize: "Land Size (Acres)",
  },
};

import type { AppLang } from "@/pages/Index";

interface LoginPageProps {
  lang: AppLang;
}

const LoginPage = ({ lang }: LoginPageProps) => {
  const t = UI[(lang as keyof typeof UI)] ?? UI.hi;
  const navigate = useNavigate();
  const { refreshUser, authenticated, updateProfile } = useAuth();

  // Already logged in — go straight to home
  useEffect(() => {
    if (authenticated) navigate("/", { replace: true });
  }, [authenticated, navigate]);

  const [step, setStep] = useState<"details" | "otp">("details");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    state: "",
    district: "",
    village: "",
    landSize: "",
  });
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendOTP = async () => {
    setError("");
    if (!formData.name || !formData.phone || !formData.state || !formData.district || !formData.village) {
      setError("Please fill all the details");
      return;
    }
    const cleaned = formData.phone.replace(/\s|-/g, "");
    if (!cleaned.match(/^[0-9]{10}$/)) {
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
    if (otp.trim().length < 6) {
      setError("Please enter the 6-digit OTP");
      return;
    }
    setLoading(true);
    try {
      await verifyOTP(formData.phone, otp.trim());
      await signIn(formData.phone);
      
      // Update profile with the details collected
      updateProfile({
        name: formData.name,
        phone: `+91 ${formData.phone}`,
        state: formData.state,
        district: formData.district,
        village: formData.village,
        landSize: formData.landSize,
        joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        isVerified: true
      });

      refreshUser();
      navigate("/", { replace: true });
    } catch (err: any) {
      setError(err.message || "Invalid OTP. Use 726626.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-earth flex items-center justify-center px-4 pt-20 pb-10">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-6 space-y-2">
          <img src={logo} alt="Sahayak AI" className="h-12 w-12" />
          <h1 className="text-xl font-extrabold text-foreground">
            Sahayak <span className="text-gradient-primary">AI</span>
          </h1>
        </div>

        <div className="bg-card rounded-3xl p-6 shadow-elevated border border-border space-y-5">
          {step === "details" ? (
            <>
              <div className="text-center">
                <h2 className="text-2xl font-black text-foreground tracking-tight">{t.title}</h2>
                <p className="text-sm font-bold text-muted-foreground mt-1">{t.subtitle}</p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t.fullName}</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="e.g. Ramesh Kumar"
                      className="w-full px-4 py-3 rounded-2xl border-2 border-border bg-secondary text-sm font-bold outline-none focus:border-primary transition-all shadow-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                    <div className="flex items-center gap-2 px-4 py-3 rounded-2xl border-2 border-border bg-secondary focus-within:border-primary transition-all shadow-sm">
                      <span className="text-sm font-black text-foreground shrink-0">+91</span>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\D/g, "").slice(0, 10)})}
                        placeholder="9876543210"
                        className="flex-1 bg-transparent text-foreground text-sm font-bold outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t.state}</label>
                      <input
                        type="text"
                        value={formData.state}
                        onChange={(e) => setFormData({...formData, state: e.target.value})}
                        placeholder="e.g. Uttar Pradesh"
                        className="w-full px-4 py-3 rounded-2xl border-2 border-border bg-secondary text-sm font-bold outline-none focus:border-primary transition-all shadow-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t.district}</label>
                      <input
                        type="text"
                        value={formData.district}
                        onChange={(e) => setFormData({...formData, district: e.target.value})}
                        placeholder="e.g. Meerut"
                        className="w-full px-4 py-3 rounded-2xl border-2 border-border bg-secondary text-sm font-bold outline-none focus:border-primary transition-all shadow-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t.village}</label>
                      <input
                        type="text"
                        value={formData.village}
                        onChange={(e) => setFormData({...formData, village: e.target.value})}
                        placeholder="e.g. Mohiuddinpur"
                        className="w-full px-4 py-3 rounded-2xl border-2 border-border bg-secondary text-sm font-bold outline-none focus:border-primary transition-all shadow-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t.landSize}</label>
                      <input
                        type="number"
                        value={formData.landSize}
                        onChange={(e) => setFormData({...formData, landSize: e.target.value})}
                        placeholder="e.g. 5"
                        className="w-full px-4 py-3 rounded-2xl border-2 border-border bg-secondary text-sm font-bold outline-none focus:border-primary transition-all shadow-sm"
                      />
                    </div>
                  </div>
                </div>

                {error && <p className="text-[10px] text-destructive font-black text-center uppercase tracking-wider">{error}</p>}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSendOTP}
                  disabled={loading}
                  className="w-full py-4 rounded-2xl bg-gradient-hero text-primary-foreground font-black text-lg shadow-lg flex items-center justify-center gap-2 disabled:opacity-60 transition-all"
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
              <div className="text-center">
                <h2 className="text-lg font-bold text-foreground">{t.otpTitle}</h2>
                <p className="text-xs text-muted-foreground mt-1">{t.otpSubtitle}</p>
                <p className="text-[10px] text-primary font-bold mt-1 uppercase tracking-wider">+91 {formData.phone}</p>
              </div>

              <div className="space-y-4">
                <input
                  type="text"
                  inputMode="numeric"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  onKeyDown={(e) => e.key === "Enter" && handleVerifyOTP()}
                  placeholder={t.otpPlaceholder}
                  className="w-full px-4 py-4 rounded-2xl border-2 border-border bg-secondary text-foreground text-center text-4xl font-black tracking-[0.3em] outline-none focus:border-primary transition-all placeholder:text-sm placeholder:font-bold placeholder:tracking-normal shadow-inner"
                />

                {error && <p className="text-[10px] text-destructive font-bold text-center">{error}</p>}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleVerifyOTP}
                  disabled={loading}
                  className="w-full py-4 rounded-2xl bg-gradient-hero text-primary-foreground font-black text-lg shadow-lg flex items-center justify-center gap-2 disabled:opacity-60 transition-all"
                >
                  {loading
                    ? <><Loader2 size={16} className="animate-spin" /> {t.verifying}</>
                    : <>{t.verify} <ArrowRight size={16} /></>
                  }
                </motion.button>

                <button
                  onClick={() => { setStep("details"); setOtp(""); setError(""); }}
                  className="w-full text-xs text-muted-foreground hover:text-foreground font-bold transition-colors py-1"
                >
                  ← {t.change}
                </button>
              </div>
            </>
          )}

          <div className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground pt-3 border-t border-border">
            <Shield size={10} className="text-primary" />
            {t.trust}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
