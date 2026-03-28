import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell, Settings, ChevronDown, CheckCircle, Info, AlertTriangle, TrendingUp, X, Moon, Sun, Shield, User, Bell as BellIcon, Globe, LogOut, Eye, Lock, Smartphone } from "lucide-react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@/assets/logo.png";
import { useAuth } from "@/context/AuthContext";
import type { AppLang } from "@/pages/Index";
import { useTranslation } from "@/hooks/useTranslation";

const LANG_OPTIONS: { code: AppLang; label: string }[] = [
  { code: "hi", label: "हिंदी" }, { code: "en", label: "English" },
  { code: "ta", label: "தமிழ்" }, { code: "mr", label: "मराठी" },
  { code: "te", label: "తెలుగు" }, { code: "kn", label: "ಕನ್ನಡ" },
  { code: "bn", label: "বাংলা" }, { code: "pa", label: "ਪੰਜਾਬੀ" },
];

const NOTIFICATIONS = [
  {
    id: 1,
    title: "Mandi Price Alert",
    desc: "Wheat prices in Meerut Mandi increased by ₹50/qtl today.",
    time: "2 mins ago",
    type: "market",
    icon: TrendingUp,
    color: "text-green-600",
    bg: "bg-green-50"
  },
  {
    id: 2,
    title: "Weather Warning",
    desc: "Heavy rain expected tomorrow. Avoid spraying pesticides today.",
    time: "1 hour ago",
    type: "weather",
    icon: AlertTriangle,
    color: "text-amber-600",
    bg: "bg-amber-50"
  },
  {
    id: 3,
    title: "New Scheme Available",
    desc: "PM-KUSUM Solar Pump subsidy applications are now open.",
    time: "5 hours ago",
    type: "scheme",
    icon: Info,
    color: "text-blue-600",
    bg: "bg-blue-50"
  },
  {
    id: 4,
    title: "Disease Scan Success",
    desc: "Your cotton crop scan shows healthy growth. No pests detected.",
    time: "Yesterday",
    type: "scan",
    icon: CheckCircle,
    color: "text-emerald-600",
    bg: "bg-emerald-50"
  }
];

const SettingsModal = ({ isOpen, onClose, lang, t }: { isOpen: boolean, onClose: () => void, lang: AppLang, t: (s: string) => string }) => {
  const { profile, updateProfile } = useAuth();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("general");
  const [notifications, setNotifications] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  // Privacy Toggles
  const [privacySettings, setPrivacySettings] = useState({
    profileVisible: true,
    shareData: false,
    biometric: false,
  });

  const isDarkMode = theme === "dark";

  // Form states
  const [formData, setFormData] = useState(profile);

  useEffect(() => {
    setFormData(profile);
  }, [profile, isOpen]);

  if (!isOpen) return null;

  const handleSaveProfile = () => {
    updateProfile(formData);
    setIsEditing(false);
  };

  const tabs = [
    { id: "general", label: "General", icon: Settings },
    { id: "account", label: "Account", icon: User },
    { id: "privacy", label: "Privacy", icon: Shield },
    { id: "notifications", label: "Alerts", icon: BellIcon },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[550px] border border-gray-100 dark:border-gray-800 transition-colors"
      >
        {/* Sidebar */}
        <div className="w-full md:w-48 bg-gray-50 dark:bg-gray-800/50 p-6 border-r border-gray-100 dark:border-gray-700 flex flex-col gap-2">
          <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6">{t("Settings")}</h2>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setIsEditing(false); }}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-green-600 text-white shadow-lg shadow-green-200 dark:shadow-green-900/20' : 'text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'}`}
            >
              <tab.icon size={18} />
              {t(tab.label)}
            </button>
          ))}
          <div className="flex-1" />
          <button onClick={onClose} className="md:hidden absolute top-4 right-4 p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-8 relative flex flex-col dark:bg-gray-900">
          <button onClick={onClose} className="hidden md:block absolute top-6 right-6 p-2 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-300 transition-all">
            <X size={20} />
          </button>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <AnimatePresence mode="wait">
              {activeTab === "general" && (
                <motion.div key="general" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
                  <div>
                    <h3 className="text-lg font-black text-gray-900 dark:text-white mb-1">{t("General Settings")}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t("Manage your basic app preferences")}</p>
                  </div>

                  <div className="space-y-4 pt-4">
                  <div className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/30">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
                        {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">{t("Appearance")}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{isDarkMode ? t("Dark Mode Active") : t("Light Mode Active")}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setTheme(isDarkMode ? "light" : "dark")} 
                      className={`w-12 h-6 rounded-full transition-all relative ${isDarkMode ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-700'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${isDarkMode ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>

                    <div className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/30">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400"><Globe size={20} /></div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white">{t("App Language")}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{t("Currently using ")} {lang.toUpperCase()}</p>
                        </div>
                      </div>
                      <span className="text-xs font-black text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-3 py-1.5 rounded-lg border border-green-100 dark:border-green-800">{lang.toUpperCase()}</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "account" && (
                <motion.div key="account" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-black text-gray-900 dark:text-white mb-1">{t("Account Details")}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t("Your personal information and profile")}</p>
                    </div>
                    {!isEditing && (
                      <button 
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 rounded-xl bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-black hover:bg-green-100 dark:hover:bg-green-900/50 transition-all"
                      >
                        {t("Edit Profile")}
                      </button>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="grid grid-cols-2 gap-4 pt-2 pb-20">
                      <div className="space-y-1.5 col-span-2">
                        <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">{t("Full Name")}</label>
                        <input 
                          type="text" 
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          className="w-full px-4 py-3 rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:bg-white dark:focus:bg-gray-750 focus:border-green-400 outline-none font-bold text-sm text-gray-900 dark:text-white transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">{t("Phone")}</label>
                        <input 
                          type="text" 
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          className="w-full px-4 py-3 rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:bg-white dark:focus:bg-gray-750 focus:border-green-400 outline-none font-bold text-sm text-gray-900 dark:text-white transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">{t("Land Size (Acres)")}</label>
                        <input 
                          type="number" 
                          value={formData.landSize}
                          onChange={(e) => setFormData({...formData, landSize: e.target.value})}
                          className="w-full px-4 py-3 rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:bg-white dark:focus:bg-gray-750 focus:border-green-400 outline-none font-bold text-sm text-gray-900 dark:text-white transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">{t("State")}</label>
                        <input 
                          type="text" 
                          value={formData.state}
                          onChange={(e) => setFormData({...formData, state: e.target.value})}
                          className="w-full px-4 py-3 rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:bg-white dark:focus:bg-gray-750 focus:border-green-400 outline-none font-bold text-sm text-gray-900 dark:text-white transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">{t("District")}</label>
                        <input 
                          type="text" 
                          value={formData.district}
                          onChange={(e) => setFormData({...formData, district: e.target.value})}
                          className="w-full px-4 py-3 rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:bg-white dark:focus:bg-gray-750 focus:border-green-400 outline-none font-bold text-sm text-gray-900 dark:text-white transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">{t("Village")}</label>
                        <input 
                          type="text" 
                          value={formData.village}
                          onChange={(e) => setFormData({...formData, village: e.target.value})}
                          className="w-full px-4 py-3 rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:bg-white dark:focus:bg-gray-750 focus:border-green-400 outline-none font-bold text-sm text-gray-900 dark:text-white transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">{t("Main Crop")}</label>
                        <input 
                          type="text" 
                          value={formData.mainCrop}
                          onChange={(e) => setFormData({...formData, mainCrop: e.target.value})}
                          className="w-full px-4 py-3 rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:bg-white dark:focus:bg-gray-750 focus:border-green-400 outline-none font-bold text-sm text-gray-900 dark:text-white transition-all"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-6 rounded-3xl bg-gradient-to-br from-green-600 to-emerald-700 text-white shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                        <div className="relative z-10 flex items-center gap-4 mb-6">
                          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl font-black border border-white/30">
                            {formData.name.slice(0, 1)}
                          </div>
                          <div>
                            <p className="text-2xl font-black">{formData.name}</p>
                            <p className="text-green-100/80 text-sm">{t("Farmer ID: #44291")}</p>
                          </div>
                        </div>
                        <div className="relative z-10 grid grid-cols-2 gap-4">
                          <div className="bg-white/10 rounded-2xl p-3 border border-white/10">
                            <p className="text-[10px] uppercase font-bold text-green-200">{t("Member Since")}</p>
                            <p className="font-bold">{formData.joinedDate}</p>
                          </div>
                          <div className="bg-white/10 rounded-2xl p-3 border border-white/10">
                            <p className="text-[10px] uppercase font-bold text-green-200">{t("Status")}</p>
                            <p className="font-bold">{formData.isVerified ? t("Verified") : t("Pending")}</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/30">
                          <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">{t("Land")}</p>
                          <p className="font-bold text-gray-800 dark:text-gray-200">{formData.landSize} {t("Acres")}</p>
                        </div>
                        <div className="p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/30">
                          <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">{t("Main Crop")}</p>
                          <p className="font-bold text-gray-800 dark:text-gray-200">{t(formData.mainCrop)}</p>
                        </div>
                        <div className="p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/30 col-span-2">
                          <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">{t("Location")}</p>
                          <p className="font-bold text-gray-800 dark:text-gray-200">{formData.village}, {formData.district}, {formData.state}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === "privacy" && (
              <motion.div key="privacy" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
                <div>
                  <h3 className="text-lg font-black text-gray-900 dark:text-white mb-1">{t("Privacy & Security")}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t("Manage your data and security settings")}</p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-green-200 dark:hover:border-green-800 transition-all bg-gray-50/20 dark:bg-gray-800/20">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400"><Eye size={20} /></div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white text-sm">{t("Profile Visibility")}</p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400">{t("Allow other farmers to see your profile")}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setPrivacySettings(prev => ({ ...prev, profileVisible: !prev.profileVisible }))}
                      className={`w-10 h-5 rounded-full transition-all relative ${privacySettings.profileVisible ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-700'}`}
                    >
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${privacySettings.profileVisible ? 'left-5' : 'left-0.5'}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-green-200 dark:hover:border-green-800 transition-all bg-gray-50/20 dark:bg-gray-800/20">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 dark:text-purple-400"><Lock size={20} /></div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white text-sm">{t("Share Usage Data")}</p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400">{t("Help us improve Sahayak AI by sharing data")}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setPrivacySettings(prev => ({ ...prev, shareData: !prev.shareData }))}
                      className={`w-10 h-5 rounded-full transition-all relative ${privacySettings.shareData ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-700'}`}
                    >
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${privacySettings.shareData ? 'left-5' : 'left-0.5'}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-green-200 dark:hover:border-green-800 transition-all bg-gray-50/20 dark:bg-gray-800/20">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400"><Smartphone size={20} /></div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white text-sm">{t("Biometric Lock")}</p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400">{t("Use fingerprint or face ID to open app")}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setPrivacySettings(prev => ({ ...prev, biometric: !prev.biometric }))}
                      className={`w-10 h-5 rounded-full transition-all relative ${privacySettings.biometric ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-700'}`}
                    >
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${privacySettings.biometric ? 'left-5' : 'left-0.5'}`} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "notifications" && (
                <motion.div key="notifications" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
                  <div>
                    <h3 className="text-lg font-black text-gray-900 dark:text-white mb-1">{t("Alert Preferences")}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t("Choose what updates you want to receive")}</p>
                  </div>
                  <div className="space-y-3">
                    {["Market Price Updates", "Weather Alerts", "Govt Scheme News", "Advisory Tips"].map(item => (
                      <div key={item} className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-green-200 dark:hover:border-green-800 transition-all bg-gray-50/20 dark:bg-gray-800/20">
                        <span className="font-bold text-gray-700 dark:text-gray-300">{t(item)}</span>
                        <button onClick={() => setNotifications(!notifications)} className={`w-10 h-5 rounded-full transition-all relative ${notifications ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-700'}`}>
                          <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${notifications ? 'left-5' : 'left-0.5'}`} />
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex gap-3 mt-auto bg-white dark:bg-gray-900 transition-colors">
            <button 
              onClick={isEditing ? () => setIsEditing(false) : onClose} 
              className="flex-1 py-3.5 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-black text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-all active:scale-95"
            >
              {isEditing ? t("Cancel") : t("Close")}
            </button>
            <button 
              onClick={isEditing ? handleSaveProfile : onClose} 
              className="flex-1 py-3.5 rounded-2xl bg-green-600 text-white font-black text-sm hover:bg-green-700 shadow-lg shadow-green-100 dark:shadow-green-900/20 transition-all active:scale-95"
            >
              {isEditing ? t("Save Profile") : t("Done")}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

interface NavbarProps {
  lang: AppLang;
  onSetLang: (l: AppLang) => void;
}

const Navbar = ({ lang, onSetLang }: NavbarProps) => {
  const { t } = useTranslation(lang);
  const [langOpen, setLangOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  
  const langRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  
  const { user, logout, profile } = useAuth();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";
  const currentLang = LANG_OPTIONS.find(l => l.code === lang);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) setSettingsOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 transition-colors duration-300"
      style={{ boxShadow: "0 1px 12px rgba(0,0,0,0.06)" }}>
      <div className="flex items-center h-16 px-4 md:px-6 gap-4">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 w-56">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#1f6b2a,#2e8b57)" }}>
            <img src={logo} alt="" className="h-6 w-6 object-contain" />
          </div>
          <span className="text-lg font-black text-gray-900 dark:text-white">Sahayak <span style={{ color: "#1f6b2a" }}>AI</span></span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-3 ml-auto">
          {/* Lang pill */}
          <div ref={langRef} className="relative">
            <button onClick={() => setLangOpen(o => !o)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold border-2 transition-all hover:bg-green-50 dark:hover:bg-green-900/20"
              style={{ borderColor: "#1f6b2a", color: isDarkMode ? "#4ade80" : "#1f6b2a", background: isDarkMode ? "#0f2d13" : "#eaf7ea" }}>
              {currentLang?.code.toUpperCase()}
              <ChevronDown size={12} className={`transition-transform ${langOpen ? "rotate-180" : ""}`} />
            </button>
            {langOpen && (
              <div className="absolute right-0 top-full mt-2 w-36 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50">
                {LANG_OPTIONS.map(l => (
                  <button key={l.code} onClick={() => { onSetLang(l.code); setLangOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-green-50 dark:hover:bg-green-900/20
                      ${lang === l.code ? "font-bold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/30" : "text-gray-700 dark:text-gray-300"}`}>
                    {l.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Bell Notifications */}
          <div ref={notifRef} className="relative">
            <button 
              onClick={() => setNotifOpen(o => !o)}
              className={`relative w-9 h-9 rounded-xl flex items-center justify-center transition-all ${notifOpen ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800' : 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700'} border hover:bg-gray-100 dark:hover:bg-gray-700`}>
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-white dark:border-gray-900 animate-pulse" />
            </button>
            {notifOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/50">
                  <h3 className="text-sm font-black text-gray-800 dark:text-white">{t("Notifications")}</h3>
                  <button className="text-[10px] font-bold text-green-700 dark:text-green-400 hover:underline">{t("Mark all read")}</button>
                </div>
                <div className="max-h-[360px] overflow-y-auto">
                  {NOTIFICATIONS.map(n => (
                    <div key={n.id} className="p-4 border-b border-gray-50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer group">
                      <div className="flex gap-3">
                        <div className={`w-10 h-10 rounded-xl ${n.bg} dark:bg-gray-700 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                          <n.icon size={18} className={n.color} />
                        </div>
                        <div className="space-y-1 overflow-hidden">
                          <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">{t(n.title)}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2">{t(n.desc)}</p>
                          <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 pt-1">{t(n.time)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full py-3 text-xs font-black text-gray-500 dark:text-gray-400 hover:text-green-700 dark:hover:text-green-400 transition-colors border-t border-gray-50 dark:border-gray-700">
                  {t("View All Notifications")}
                </button>
              </div>
            )}
          </div>

          {/* Settings Dropdown */}
          <div ref={settingsRef} className="relative">
            <button 
              onClick={() => setSettingsOpen(o => !o)}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${settingsOpen ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800' : 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700'} border hover:bg-gray-100 dark:hover:bg-gray-700`}>
              <Settings size={18} />
            </button>
            {settingsOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50 p-2 space-y-1">
                <button onClick={() => { setSettingsModalOpen(true); setSettingsOpen(false); }} className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-3 group">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400 dark:text-gray-500 group-hover:bg-green-600 group-hover:text-white transition-all"><Settings size={14} /></div>
                  <div>
                    <p className="font-black text-gray-800 dark:text-white">{t("App Settings")}</p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500">{t("Theme, Alerts, Privacy")}</p>
                  </div>
                </button>
                <button className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-3 group">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400 dark:text-gray-500 group-hover:bg-blue-600 group-hover:text-white transition-all"><Info size={14} /></div>
                  <div>
                    <p className="font-black text-gray-800 dark:text-white">{t("About Sahayak")}</p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500">{t("Version 2.0.4")}</p>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* User Profile Menu */}
          <div ref={menuRef} className="relative">
            <button onClick={() => setMenuOpen(o => !o)}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-black shadow-lg transition-transform active:scale-95"
              style={{ background: "linear-gradient(135deg,#1f6b2a,#2e8b57)" }}>
              {profile.name.slice(0, 1)}
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50">
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-br from-green-50 to-white dark:from-green-900/20 dark:to-gray-800">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-xs" style={{ background: "#1f6b2a" }}>
                      {profile.name.slice(0, 1)}
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest">{t("Farmer Profile")}</p>
                      <p className="text-sm font-black text-gray-800 dark:text-white truncate">{profile.name}</p>
                    </div>
                  </div>
                </div>
                <div className="p-2">
                  <button className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400"><TrendingUp size={14} /></div> {t("My Activity")}
                  </button>
                  <button onClick={() => { setSettingsModalOpen(true); setMenuOpen(false); }} className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2.5 border-b border-gray-50 dark:border-gray-700 mb-1">
                    <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 dark:text-purple-400"><Settings size={14} /></div> {t("Account Settings")}
                  </button>
                  <button onClick={async () => { await logout(); setMenuOpen(false); navigate("/"); }}
                    className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-black text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-600 dark:text-red-400"><LogOut size={14} /></div> {t("Logout")}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Settings Modal Component */}
      <AnimatePresence>
        {settingsModalOpen && (
          <SettingsModal 
            isOpen={settingsModalOpen} 
            onClose={() => setSettingsModalOpen(false)} 
            lang={lang} 
            t={t} 
          />
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
