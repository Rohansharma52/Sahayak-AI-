import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, RefreshCw, Volume2, ChevronDown, Sparkles, CheckCircle } from "lucide-react";
import type { AppLang } from "./Index";
import { useTranslation } from "@/hooks/useTranslation";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "google/gemini-2.0-flash-001";

async function getAdvisory(profile: AdvisoryProfile, lang: AppLang): Promise<string> {
  const key = import.meta.env.VITE_OPENROUTER_API_KEY;
  if (!key) throw new Error("VITE_OPENROUTER_API_KEY not set");
  const langName = ({ hi:"Hindi", en:"English", ta:"Tamil", mr:"Marathi", te:"Telugu", kn:"Kannada", bn:"Bengali", pa:"Punjabi" } as any)[lang] ?? "Hindi";
  const prompt = `You are an expert Indian agricultural advisor. Give practical farming advisory for:
- State: ${profile.state}
- Crop: ${profile.crop}
- Season: ${profile.season}
- Soil Type: ${profile.soil}
- Issue (if any): ${profile.issue || "General advice"}

Provide exactly 4 clear points in ${langName}. 
Format each point as: "1. [Point text]", "2. [Point text]", etc.
Keep it practical, simple, and farmer-friendly. Max 200 words. No markdown bolding.`;

  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({ model: MODEL, max_tokens: 600, messages: [{ role: "user", content: prompt }] }),
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  const data = await res.json();
  return data?.choices?.[0]?.message?.content?.trim() ?? "";
}

interface AdvisoryProfile { state: string; crop: string; season: string; soil: string; issue: string; }

const STATES = ["Uttar Pradesh","Punjab","Haryana","Madhya Pradesh","Rajasthan","Maharashtra","Gujarat","Bihar","West Bengal","Karnataka","Andhra Pradesh","Telangana","Tamil Nadu","Odisha","Assam"];

const CROPS_T: Record<string, string[]> = {
  hi: ["गेहूं","धान/चावल","मक्का","गन्ना","कपास","सोयाबीन","सरसों","चना","सब्जियां","फल","दालें"],
  en: ["Wheat","Rice/Paddy","Maize","Sugarcane","Cotton","Soybean","Mustard","Gram","Vegetables","Fruits","Pulses"],
  ta: ["கோதுமை","நெல்","மக்காச்சோளம்","கரும்பு","பருத்தி","சோயாபீன்","கடுகு","கொண்டைக்கடலை","காய்கறிகள்","பழங்கள்","பருப்பு"],
  mr: ["गहू","भात","मका","ऊस","कापूस","सोयाबीन","मोहरी","हरभरा","भाजीपाला","फळे","डाळी"],
  te: ["గోధుమ","వరి","మొక్కజొన్న","చెరకు","పత్తి","సోయాబీన్","ఆవాలు","శనగలు","కూరగాయలు","పండ్లు","పప్పు"],
  kn: ["ಗೋಧಿ","ಭತ್ತ","ಮೆಕ್ಕೆಜೋಳ","ಕಬ್ಬು","ಹತ್ತಿ","ಸೋಯಾ","ಸಾಸಿವೆ","ಕಡಲೆ","ತರಕಾರಿ","ಹಣ್ಣು","ಬೇಳೆ"],
  bn: ["গম","ধান","ভুট্টা","আখ","তুলা","সয়াবিন","সরিষা","ছোলা","সবজি","ফল","ডাল"],
  pa: ["ਕਣਕ","ਝੋਨਾ","ਮੱਕੀ","ਗੰਨਾ","ਕਪਾਹ","ਸੋਇਆ","ਸਰ੍ਹੋਂ","ਛੋਲੇ","ਸਬਜ਼ੀਆਂ","ਫਲ","ਦਾਲਾਂ"],
};
const CROPS_EN = ["Wheat","Rice/Paddy","Maize","Sugarcane","Cotton","Soybean","Mustard","Gram","Vegetables","Fruits","Pulses"];

const ISSUES_T: Record<string, string[]> = {
  hi: ["कोई नहीं","पत्तियां पीली","कीट हमला","कम उपज","जलभराव","सूखा तनाव","फफूंद रोग","पोषण की कमी"],
  en: ["None","Yellow leaves","Pest attack","Low yield","Waterlogging","Drought stress","Fungal disease","Nutrient deficiency"],
  ta: ["இல்லை","மஞ்சள் இலைகள்","பூச்சி தாக்குதல்","குறைந்த விளைச்சல்","நீர் தேக்கம்","வறட்சி","பூஞ்சை நோய்","ஊட்டச்சத்து குறைபாடு"],
  mr: ["काहीही नाही","पिवळी पाने","कीड हल्ला","कमी उत्पन्न","जलसाठा","दुष्काळ","बुरशी रोग","पोषण कमतरता"],
  te: ["ఏమీ లేదు","పసుపు ఆకులు","పురుగు దాడి","తక్కువ దిగుబడి","నీటి నిలకడ","కరువు","శిలీంధ్ర వ్యాధి","పోషక లోపం"],
  kn: ["ಏನೂ ಇಲ್ಲ","ಹಳದಿ ಎಲೆಗಳು","ಕೀಟ ದಾಳಿ","ಕಡಿಮೆ ಇಳುವರಿ","ನೀರು ನಿಲ್ಲುವಿಕೆ","ಬರ","ಶಿಲೀಂಧ್ರ ರೋಗ","ಪೋಷಕ ಕೊರತೆ"],
  bn: ["কিছু নেই","হলুদ পাতা","পোকার আক্রমণ","কম ফলন","জলাবদ্ধতা","খরা","ছত্রাক রোগ","পুষ্টির অভাব"],
  pa: ["ਕੋਈ ਨਹੀਂ","ਪੀਲੇ ਪੱਤੇ","ਕੀੜੇ ਦਾ ਹਮਲਾ","ਘੱਟ ਝਾੜ","ਜਲਭਰਾਅ","ਸੋਕਾ","ਉੱਲੀ ਰੋਗ","ਪੋਸ਼ਣ ਦੀ ਕਮੀ"],
};
const ISSUES_EN = ["None","Yellow leaves","Pest attack","Low yield","Waterlogging","Drought stress","Fungal disease","Nutrient deficiency"];

const UI_EN = {
  title: "🌾 Farming Advisory",
  subtitle: "Simple tips for your crops",
  state: "State", crop: "Crop", issue: "Focus Area",
  getBtn: "Get Advice",
  loading: "Analyzing...",
  advisory: "AI Advice",
  listenBtn: "Listen",
  newBtn: "New Advice",
  noKey: "API Key Missing",
  noKeyDesc: "Please set VITE_OPENROUTER_API_KEY in .env",
};

const Sel = ({ label, value, onChange, options }: { label:string; value:string; onChange:(v:string)=>void; options:string[] }) => (
  <div className="space-y-1">
    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</label>
    <div className="relative">
      <select value={value} onChange={e => onChange(e.target.value)}
        className="w-full appearance-none px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 font-bold outline-none focus:border-green-400 transition-all pr-8">
        <option value="">-- {label} --</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
  </div>
);

interface AdvisoryPageProps { lang: AppLang; }

const AdvisoryPage = ({ lang }: AdvisoryPageProps) => {
  const { t } = useTranslation(lang);
  const isHi = ["hi","mr","pa"].includes(lang);
  const hasKey = !!import.meta.env.VITE_OPENROUTER_API_KEY;
  const [profile, setProfile] = useState<AdvisoryProfile>({ state:"", crop:"", season:"Kharif (Jun-Oct)", soil:"Loamy", issue:"" });
  const [advice, setAdvice]   = useState("");
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  
  const set = (k: keyof AdvisoryProfile) => (v: string) => setProfile(p => ({ ...p, [k]: v }));
  const ready = profile.state && profile.crop;

  const fetch_ = async () => {
    setLoading(true); setAdvice("");
    try { setAdvice(await getAdvisory(profile, lang)); }
    catch (e: any) { console.error(e); }
    setLoading(false);
  };

  const toggleSpeak = () => {
    if (playing) { window.speechSynthesis.cancel(); setPlaying(false); return; }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(advice);
    const m: Record<string,string> = { hi:"hi-IN", en:"en-IN", ta:"ta-IN", mr:"mr-IN", te:"te-IN", kn:"kn-IN", bn:"bn-IN", pa:"pa-IN" };
    u.lang = m[lang] ?? "hi-IN"; u.rate = 0.9;
    u.onend = () => setPlaying(false);
    window.speechSynthesis.speak(u);
    setPlaying(true);
  };

  if (!hasKey) return (
    <div className="container max-w-2xl py-16 text-center space-y-4">
      <div className="text-5xl">🔑</div>
      <h2 className="text-xl font-black text-gray-800">{t(UI_EN.noKey)}</h2>
      <p className="text-gray-500 text-sm">{t(UI_EN.noKeyDesc)}</p>
    </div>
  );

  return (
    <div className="container max-w-4xl py-6 space-y-6">
      <div className="text-center md:text-left">
        <h1 className="text-2xl font-black text-gray-900">{t(UI_EN.title)}</h1>
        <p className="text-sm text-gray-500 font-medium">{t(UI_EN.subtitle)}</p>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Sel label={t(UI_EN.state)}  value={profile.state}  onChange={set("state")}  options={STATES} />
          <Sel label={t(UI_EN.crop)}   value={(CROPS_T[lang]??CROPS_T.en)[CROPS_EN.indexOf(profile.crop)]??profile.crop}   onChange={(v)=>{const i=(CROPS_T[lang]??CROPS_T.en).indexOf(v);set("crop")(CROPS_EN[i]??v);}}   options={CROPS_T[lang]??CROPS_T.en} />
          <Sel label={t(UI_EN.issue)}  value={(ISSUES_T[lang]??ISSUES_T.en)[ISSUES_EN.indexOf(profile.issue)]??profile.issue} onChange={(v)=>{const i=(ISSUES_T[lang]??ISSUES_T.en).indexOf(v);set("issue")(ISSUES_EN[i]??v);}} options={ISSUES_T[lang]??ISSUES_T.en} />
        </div>
        <button onClick={fetch_} disabled={!ready || loading}
          className="w-full py-4 rounded-2xl text-white font-black text-lg shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 transition-all active:scale-95"
          style={{ background:"linear-gradient(135deg,#1f6b2a,#2e8b57)" }}
        >
          {loading ? <><Loader2 size={20} className="animate-spin" />{t(UI_EN.loading)}</> : t(UI_EN.getBtn)}
        </button>
      </div>

      <AnimatePresence>
        {advice && (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="font-black text-gray-800 flex items-center gap-2">
                <Sparkles size={18} className="text-amber-500" /> {t(UI_EN.advisory)}
              </h3>
              <button onClick={toggleSpeak} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${playing ? "bg-green-600 text-white shadow-md" : "bg-green-50 text-green-700 hover:bg-green-100"}`}>
                <Volume2 size={13} /> {t(UI_EN.listenBtn)}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {advice.split("\n").filter(line => line.trim().match(/^\d\./)).map((point, idx) => (
                <motion.div key={idx} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay: idx * 0.1 }}
                  className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:border-green-200 transition-all flex gap-4 group">
                  <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-700 font-black shrink-0 group-hover:bg-green-600 group-hover:text-white transition-colors">
                    {idx + 1}
                  </div>
                  <p className="text-sm font-bold text-gray-700 leading-relaxed pt-1">
                    {point.replace(/^\d\.\s*/, "")}
                  </p>
                </motion.div>
              ))}
            </div>
            
            <div className="text-center pt-2">
              <button onClick={() => setAdvice("")} className="text-xs font-black text-gray-400 hover:text-green-600 transition-colors flex items-center gap-1.5 mx-auto">
                <RefreshCw size={12} /> {t(UI_EN.newBtn)}
              </button>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdvisoryPage;
