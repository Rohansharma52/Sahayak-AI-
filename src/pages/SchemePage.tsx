import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown, Search, Volume2, VolumeX, ExternalLink,
  Loader2, RefreshCw, CheckCircle, X, ChevronRight, User,
} from "lucide-react";
import type { AppLang } from "./Index";
import { useTranslation } from "@/hooks/useTranslation";

// ── OpenRouter call ───────────────────────────────────────────────────────────
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "google/gemini-2.0-flash-001";

async function callAI(prompt: string, lang: string): Promise<string> {
  const key = import.meta.env.VITE_OPENROUTER_API_KEY;
  if (!key) throw new Error("VITE_OPENROUTER_API_KEY not set");
  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 3500,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  const data = await res.json();
  return data?.choices?.[0]?.message?.content?.trim() ?? "";
}

// ── Types ─────────────────────────────────────────────────────────────────────
interface SchemeCard {
  id: string;
  name: string;
  type: "free" | "loan" | "subsidy" | "insurance" | "pension" | "training" | "other";
  level: "central" | "state" | "private";
  benefit: string;
  amount: string;
  eligibility: string;
  description: string;
  steps: string[];
  documents: string[];
  link: string;
  helpline: string;
}

interface FarmerProfile {
  state: string;
  landSize: string;
  category: string;
  farmerType: string;
  age: string;
  gender: string;
  crop: string;
}

// ── i18n ──────────────────────────────────────────────────────────────────────
const LANG_NAME: Record<string, string> = {
  hi: "Hindi", en: "English", ta: "Tamil", mr: "Marathi",
  te: "Telugu", kn: "Kannada", bn: "Bengali", pa: "Punjabi",
};

const UI_EN = {
  title: "📋 Government & Private Schemes",
  subtitle: "Fill your details and find schemes you are eligible for",
  profileTitle: "Fill Your Details",
  findBtn: "🔍 Find Schemes For Me",
  loading: "AI is finding schemes...",
  howToApply: "How to Apply",
  steps: "Steps", docs: "Required Documents", link: "Official Website",
  helpline: "Helpline", listen: "Listen", stop: "Stop",
  type: "Type", level: "Level", benefit: "Benefit", amount: "Amount",
  eligibility: "Eligibility", noResult: "No schemes found. Please try again.",
  retry: "Search Again", filterAll: "All",
  labels: {
    state: "State", landSize: "Land Size", category: "Category",
    farmerType: "Farmer Type", age: "Age", gender: "Gender", crop: "Main Crop",
  },
};

// ── Dropdown options (bilingual) ─────────────────────────────────────────────
const STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat",
  "Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh",
  "Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab",
  "Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh",
  "Uttarakhand","West Bengal","Delhi","Jammu & Kashmir","Ladakh",
];

// Translated option sets — key = English value (used in profile), display = translated
const LAND_SIZES_T: Record<string, string[]> = {
  hi: ["1 एकड़ से कम","1–2 एकड़","2–5 एकड़","5–10 एकड़","10 एकड़ से अधिक"],
  en: ["< 1 acre","1–2 acres","2–5 acres","5–10 acres","> 10 acres"],
  ta: ["1 ஏக்கருக்கு குறைவு","1–2 ஏக்கர்","2–5 ஏக்கர்","5–10 ஏக்கர்","10 ஏக்கருக்கு மேல்"],
  mr: ["1 एकरपेक्षा कमी","1–2 एकर","2–5 एकर","5–10 एकर","10 एकरपेक्षा जास्त"],
  te: ["1 ఎకరా కంటే తక్కువ","1–2 ఎకరాలు","2–5 ఎకరాలు","5–10 ఎకరాలు","10 ఎకరాలకు పైగా"],
  kn: ["1 ಎಕರೆಗಿಂತ ಕಡಿಮೆ","1–2 ಎಕರೆ","2–5 ಎಕರೆ","5–10 ಎಕರೆ","10 ಎಕರೆಗಿಂತ ಹೆಚ್ಚು"],
  bn: ["১ একরের কম","১–২ একর","২–৫ একর","৫–১০ একর","১০ একরের বেশি"],
  pa: ["1 ਏਕੜ ਤੋਂ ਘੱਟ","1–2 ਏਕੜ","2–5 ਏਕੜ","5–10 ਏਕੜ","10 ਏਕੜ ਤੋਂ ਵੱਧ"],
};
const LAND_SIZES_EN = ["< 1 acre","1–2 acres","2–5 acres","5–10 acres","> 10 acres"];

const CATEGORIES_T: Record<string, string[]> = {
  hi: ["सामान्य","OBC","SC","ST","अल्पसंख्यक","महिला","BPL"],
  en: ["General","OBC","SC","ST","Minority","Women","BPL"],
  ta: ["பொது","OBC","SC","ST","சிறுபான்மை","பெண்","BPL"],
  mr: ["सामान्य","OBC","SC","ST","अल्पसंख्याक","महिला","BPL"],
  te: ["సాధారణ","OBC","SC","ST","మైనారిటీ","మహిళ","BPL"],
  kn: ["ಸಾಮಾನ್ಯ","OBC","SC","ST","ಅಲ್ಪಸಂಖ್ಯಾತ","ಮಹಿಳೆ","BPL"],
  bn: ["সাধারণ","OBC","SC","ST","সংখ্যালঘু","মহিলা","BPL"],
  pa: ["ਆਮ","OBC","SC","ST","ਘੱਟ ਗਿਣਤੀ","ਔਰਤ","BPL"],
};
const CATEGORIES_EN = ["General","OBC","SC","ST","Minority","Women","BPL"];

const FARMER_TYPES_T: Record<string, string[]> = {
  hi: ["फसल किसान","बागवानी","पशुपालन","मत्स्य पालन","जैविक किसान","किरायेदार किसान"],
  en: ["Crop Farmer","Horticulture","Animal Husbandry","Fishery","Organic Farmer","Tenant Farmer"],
  ta: ["பயிர் விவசாயி","தோட்டக்கலை","கால்நடை வளர்ப்பு","மீன்வளம்","இயற்கை விவசாயி","குத்தகை விவசாயி"],
  mr: ["पीक शेतकरी","फलोत्पादन","पशुपालन","मत्स्यपालन","सेंद्रिय शेतकरी","भाडेकरू शेतकरी"],
  te: ["పంట రైతు","ఉద్యానవనం","పశుపోషణ","మత్స్య పరిశ్రమ","సేంద్రీయ రైతు","కౌలు రైతు"],
  kn: ["ಬೆಳೆ ರೈತ","ತೋಟಗಾರಿಕೆ","ಪಶುಸಂಗೋಪನೆ","ಮೀನುಗಾರಿಕೆ","ಸಾವಯವ ರೈತ","ಗೇಣಿ ರೈತ"],
  bn: ["ফসল কৃষক","উদ্যানপালন","পশুপালন","মৎস্য চাষ","জৈব কৃষক","ভাগচাষী"],
  pa: ["ਫਸਲ ਕਿਸਾਨ","ਬਾਗਬਾਨੀ","ਪਸ਼ੂ ਪਾਲਣ","ਮੱਛੀ ਪਾਲਣ","ਜੈਵਿਕ ਕਿਸਾਨ","ਕਿਰਾਏਦਾਰ ਕਿਸਾਨ"],
};
const FARMER_TYPES_EN = ["Crop Farmer","Horticulture","Animal Husbandry","Fishery","Organic Farmer","Tenant Farmer"];

const GENDERS_T: Record<string, string[]> = {
  hi: ["पुरुष","महिला","अन्य"],
  en: ["Male","Female","Other"],
  ta: ["ஆண்","பெண்","மற்றவை"],
  mr: ["पुरुष","महिला","इतर"],
  te: ["పురుషుడు","స్త్రీ","ఇతర"],
  kn: ["ಪುರುಷ","ಮಹಿಳೆ","ಇತರ"],
  bn: ["পুরুষ","মহিলা","অন্যান্য"],
  pa: ["ਮਰਦ","ਔਰਤ","ਹੋਰ"],
};
const GENDERS_EN = ["Male","Female","Other"];

const CROPS_T: Record<string, string[]> = {
  hi: ["गेहूं","धान/चावल","मक्का","गन्ना","कपास","सोयाबीन","सरसों","चना","सब्जियां","फल","दालें","मसाले","मिश्रित फसलें"],
  en: ["Wheat","Rice/Paddy","Maize","Sugarcane","Cotton","Soybean","Mustard","Gram/Chickpea","Vegetables","Fruits","Pulses","Spices","Mixed Crops"],
  ta: ["கோதுமை","நெல்/அரிசி","மக்காச்சோளம்","கரும்பு","பருத்தி","சோயாபீன்","கடுகு","கொண்டைக்கடலை","காய்கறிகள்","பழங்கள்","பருப்பு வகைகள்","மசாலா","கலப்பு பயிர்கள்"],
  mr: ["गहू","भात/तांदूळ","मका","ऊस","कापूस","सोयाबीन","मोहरी","हरभरा","भाजीपाला","फळे","डाळी","मसाले","मिश्र पिके"],
  te: ["గోధుమ","వరి/బియ్యం","మొక్కజొన్న","చెరకు","పత్తి","సోయాబీన్","ఆవాలు","శనగలు","కూరగాయలు","పండ్లు","పప్పుధాన్యాలు","మసాలాలు","మిశ్రమ పంటలు"],
  kn: ["ಗೋಧಿ","ಭತ್ತ/ಅಕ್ಕಿ","ಮೆಕ್ಕೆಜೋಳ","ಕಬ್ಬು","ಹತ್ತಿ","ಸೋಯಾಬೀನ್","ಸಾಸಿವೆ","ಕಡಲೆ","ತರಕಾರಿಗಳು","ಹಣ್ಣುಗಳು","ಬೇಳೆಕಾಳುಗಳು","ಮಸಾಲೆ","ಮಿಶ್ರ ಬೆಳೆಗಳು"],
  bn: ["গম","ধান/চাল","ভুট্টা","আখ","তুলা","সয়াবিন","সরিষা","ছোলা","সবজি","ফল","ডাল","মশলা","মিশ্র ফসল"],
  pa: ["ਕਣਕ","ਝੋਨਾ/ਚਾਵਲ","ਮੱਕੀ","ਗੰਨਾ","ਕਪਾਹ","ਸੋਇਆਬੀਨ","ਸਰ੍ਹੋਂ","ਛੋਲੇ","ਸਬਜ਼ੀਆਂ","ਫਲ","ਦਾਲਾਂ","ਮਸਾਲੇ","ਮਿਲੀਆਂ ਫਸਲਾਂ"],
};
const CROPS_EN = ["Wheat","Rice/Paddy","Maize","Sugarcane","Cotton","Soybean","Mustard","Gram/Chickpea","Vegetables","Fruits","Pulses","Spices","Mixed Crops"];

const AGES = ["18–25","26–35","36–45","46–55","56–65","65+"];

const TYPE_COLORS: Record<string, string> = {
  free:      "bg-green-100 text-green-700 border-green-200",
  loan:      "bg-blue-100 text-blue-700 border-blue-200",
  subsidy:   "bg-purple-100 text-purple-700 border-purple-200",
  insurance: "bg-amber-100 text-amber-700 border-amber-200",
  pension:   "bg-pink-100 text-pink-700 border-pink-200",
  training:  "bg-cyan-100 text-cyan-700 border-cyan-200",
  other:     "bg-gray-100 text-gray-700 border-gray-200",
};
const LEVEL_COLORS: Record<string, string> = {
  central: "bg-orange-100 text-orange-700",
  state:   "bg-teal-100 text-teal-700",
  private: "bg-violet-100 text-violet-700",
};

// ── Build AI prompt ───────────────────────────────────────────────────────────
function buildPrompt(profile: FarmerProfile, lang: string): string {
  const langName = LANG_NAME[lang] ?? "Hindi";
  return `You are an expert on Indian agricultural schemes (government and private). A farmer has provided their profile:
- State: ${profile.state}
- Land Size: ${profile.landSize}
- Category: ${profile.category}
- Farmer Type: ${profile.farmerType}
- Age: ${profile.age}
- Gender: ${profile.gender}
- Main Crop: ${profile.crop}

Find ALL relevant schemes (central government, state government, and private/bank) this farmer is eligible for. Include:
- Free benefit schemes (PM Kisan, etc.)
- Loan schemes (KCC, etc.)
- Subsidy schemes
- Insurance schemes (PMFBY, etc.)
- Pension schemes
- Training schemes
- Any private bank/NBFC schemes

For EACH scheme, respond in this EXACT JSON array format (no markdown, no extra text, just valid JSON):
[
  {
    "id": "unique_id",
    "name": "Scheme Name in English",
    "type": "free|loan|subsidy|insurance|pension|training|other",
    "level": "central|state|private",
    "benefit": "Brief benefit in ${langName}",
    "amount": "Amount/benefit value",
    "eligibility": "Who is eligible in ${langName}",
    "description": "2-3 sentence description in ${langName}",
    "steps": ["Step 1 in ${langName}", "Step 2 in ${langName}", "Step 3 in ${langName}", "Step 4 in ${langName}"],
    "documents": ["Document 1 in ${langName}", "Document 2 in ${langName}"],
    "link": "https://official-website.gov.in",
    "helpline": "1800-XXX-XXXX"
  }
]

Return ONLY the JSON array. No markdown. No code fences. No newlines inside string values. Use only ASCII-safe characters in JSON strings. Ensure all strings are properly escaped.`;
}

// ── Voice using browser TTS (fallback when Polly not configured) ──────────────
function speakText(text: string, lang: string): SpeechSynthesisUtterance | null {
  if (!window.speechSynthesis) return null;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  const langMap: Record<string, string> = {
    hi: "hi-IN", en: "en-IN", ta: "ta-IN", mr: "mr-IN",
    te: "te-IN", kn: "kn-IN", bn: "bn-IN", pa: "pa-IN",
  };
  utter.lang = langMap[lang] ?? "hi-IN";
  utter.rate = 0.85;
  window.speechSynthesis.speak(utter);
  return utter;
}

// ── Select component ──────────────────────────────────────────────────────────
const Select = ({ label, value, onChange, options, placeholder }: {
  label: string; value: string; onChange: (v: string) => void;
  options: string[]; placeholder?: string;
}) => (
  <div className="space-y-1">
    <label className="text-xs font-bold text-gray-600">{label}</label>
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all pr-8"
      >
        <option value="">{placeholder ?? `-- ${label} --`}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────
interface SchemePageProps { lang: AppLang; }

const SchemePage = ({ lang }: SchemePageProps) => {
  const { t } = useTranslation(lang);

  const [profile, setProfile] = useState<FarmerProfile>({
    state: STATES[0], landSize: LAND_SIZES_EN[0], category: CATEGORIES_EN[0], 
    farmerType: FARMER_TYPES_EN[0], age: AGES[0], gender: GENDERS_EN[0], crop: CROPS_EN[0],
  });
  const [schemes, setSchemes]     = useState<SchemeCard[]>([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [searched, setSearched]   = useState(false);
  const [filter, setFilter]       = useState("all");
  const [expanded, setExpanded]   = useState<string | null>(null);
  const [speaking, setSpeaking]   = useState<string | null>(null);
  const [search, setSearch]       = useState("");
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);

  const set = (k: keyof FarmerProfile) => (v: string) =>
    setProfile((p) => ({ ...p, [k]: v }));

  const profileComplete = profile.state && profile.landSize && profile.category && profile.farmerType;

  const findSchemes = async () => {
    if (!profileComplete) return;
    setLoading(true);
    setError("");
    setSchemes([]);
    setSearched(true);
    setExpanded(null);
    try {
      const raw = await callAI(buildPrompt(profile, lang), lang);

      // ── Robust JSON extraction & cleaning ──────────────────────────────────
      // 1. Extract the JSON array from the response
      const match = raw.match(/\[[\s\S]*\]/);
      if (!match) throw new Error("AI ne valid JSON nahi diya. Dobara try karein.");

      let jsonStr = match[0];

      // 2. Remove control characters that break JSON.parse
      jsonStr = jsonStr
        .replace(/[\u0000-\u001F\u007F]/g, (ch) => {
          // Keep allowed whitespace
          if (ch === "\n" || ch === "\r" || ch === "\t") return " ";
          return "";
        })
        // 3. Fix trailing commas before ] or }
        .replace(/,\s*([}\]])/g, "$1")
        // 4. Remove any markdown code fences if present
        .replace(/```json|```/g, "");

      const parsed: SchemeCard[] = JSON.parse(jsonStr);
      setSchemes(parsed.filter((s) => s && s.name));
    } catch (e: any) {
      setError("JSON parse error: " + (e.message ?? "Unknown error") + " — Dobara try karein.");
    }
    setLoading(false);
  };

  const handleVoice = (scheme: SchemeCard) => {
    if (speaking === scheme.id) {
      window.speechSynthesis?.cancel();
      setSpeaking(null);
      return;
    }
    // Build voice text in selected language
    const applyWord = { hi:"आवेदन के लिए", en:"To apply", ta:"விண்ணப்பிக்க", mr:"अर्ज करण्यासाठी", te:"దరఖాస్తు చేయడానికి", kn:"ಅರ್ಜಿ ಸಲ್ಲಿಸಲು", bn:"আবেদন করতে", pa:"ਅਪਲਾਈ ਕਰਨ ਲਈ" }[lang] ?? "To apply";
    const text = `${scheme.name}. ${scheme.description}. ${scheme.benefit}. ${applyWord}: ${scheme.steps.join(". ")}`;
    const utter = speakText(text, lang);
    if (utter) {
      utterRef.current = utter;
      setSpeaking(scheme.id);
      utter.onend = () => setSpeaking(null);
    }
  };

  const typeFilters = ["all", ...Array.from(new Set(schemes.map((s) => s.type)))];

  const filtered = schemes.filter((s) => {
    const matchType = filter === "all" || s.type === filter;
    const q = search.toLowerCase();
    const matchSearch = !q || s.name.toLowerCase().includes(q) || s.benefit.toLowerCase().includes(q);
    return matchType && matchSearch;
  });

  return (
    <div className="container max-w-4xl py-5 space-y-5">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-3xl p-5 text-white shadow-xl">
        <h1 className="text-xl md:text-2xl font-black">{t(UI_EN.title)}</h1>
        <p className="text-sm text-white/80 mt-1">{t(UI_EN.subtitle)}</p>
      </motion.div>

      {/* Profile Form */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
            <User size={16} className="text-orange-600" />
          </div>
          <h2 className="font-black text-gray-800">{t(UI_EN.profileTitle)}</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          <Select label={t(UI_EN.labels.state)}      value={profile.state}      onChange={set("state")}      options={STATES} />
          <Select label={t(UI_EN.labels.landSize)}   value={profile.landSize}   onChange={(v) => { const idx = (LAND_SIZES_T[lang]??LAND_SIZES_T.en).indexOf(v); set("landSize")(LAND_SIZES_EN[idx] ?? v); }} options={(LAND_SIZES_T[lang] ?? LAND_SIZES_T.en).map(opt => t(opt))} />
          <Select label={t(UI_EN.labels.category)}   value={(CATEGORIES_T[lang]??CATEGORIES_T.en)[CATEGORIES_EN.indexOf(profile.category)] ?? profile.category} onChange={(v) => { const idx = (CATEGORIES_T[lang]??CATEGORIES_T.en).indexOf(v); set("category")(CATEGORIES_EN[idx] ?? v); }} options={(CATEGORIES_T[lang] ?? CATEGORIES_T.en).map(opt => t(opt))} />
          <Select label={t(UI_EN.labels.farmerType)} value={(FARMER_TYPES_T[lang]??FARMER_TYPES_T.en)[FARMER_TYPES_EN.indexOf(profile.farmerType)] ?? profile.farmerType} onChange={(v) => { const idx = (FARMER_TYPES_T[lang]??FARMER_TYPES_T.en).indexOf(v); set("farmerType")(FARMER_TYPES_EN[idx] ?? v); }} options={(FARMER_TYPES_T[lang] ?? FARMER_TYPES_T.en).map(opt => t(opt))} />
          <Select label={t(UI_EN.labels.age)}        value={profile.age}        onChange={set("age")}        options={AGES} />
          <Select label={t(UI_EN.labels.gender)}     value={(GENDERS_T[lang]??GENDERS_T.en)[GENDERS_EN.indexOf(profile.gender)] ?? profile.gender} onChange={(v) => { const idx = (GENDERS_T[lang]??GENDERS_T.en).indexOf(v); set("gender")(GENDERS_EN[idx] ?? v); }} options={(GENDERS_T[lang] ?? GENDERS_T.en).map(opt => t(opt))} />
          <Select label={t(UI_EN.labels.crop)}       value={(CROPS_T[lang]??CROPS_T.en)[CROPS_EN.indexOf(profile.crop)] ?? profile.crop} onChange={(v) => { const idx = (CROPS_T[lang]??CROPS_T.en).indexOf(v); set("crop")(CROPS_EN[idx] ?? v); }} options={(CROPS_T[lang] ?? CROPS_T.en).map(opt => t(opt))} />
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={findSchemes}
          disabled={!profileComplete || loading}
          className="mt-4 w-full py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black text-base shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading
            ? <><Loader2 size={18} className="animate-spin" /> {t(UI_EN.loading)}</>
            : t(UI_EN.findBtn)}
        </motion.button>
      </motion.div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-sm text-red-700 flex items-center justify-between">
          <span>⚠️ {error}</span>
          <button onClick={findSchemes} className="flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-800">
            <RefreshCw size={12} /> {t.retry}
          </button>
        </div>
      )}

      {/* Results */}
      {searched && !loading && schemes.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">

          {/* Filter + Search bar */}
          <div className="flex flex-wrap gap-2 items-center">
            <div className="relative flex-1 min-w-[180px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search schemes..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all" />
              {search && <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"><X size={13} /></button>}
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {typeFilters.map((f) => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all capitalize border
                    ${filter === f ? "bg-orange-500 text-white border-orange-500" : "bg-white border-gray-200 text-gray-600 hover:border-orange-300"}`}>
                  {f === "all" ? t.filterAll : f}
                </button>
              ))}
            </div>
          </div>

          <p className="text-xs text-gray-400">{filtered.length} schemes found</p>

          {/* Scheme Cards */}
          <div className="space-y-3">
            {filtered.map((scheme, i) => (
              <motion.div key={scheme.id}
                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">

                {/* Card Header */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border capitalize ${TYPE_COLORS[scheme.type] ?? TYPE_COLORS.other}`}>
                          {scheme.type}
                        </span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full capitalize ${LEVEL_COLORS[scheme.level] ?? ""}`}>
                          {scheme.level}
                        </span>
                      </div>
                      <h3 className="font-black text-gray-900 text-base leading-tight">{scheme.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{scheme.benefit}</p>
                      {scheme.amount && (
                        <p className="text-lg font-black text-orange-600 mt-1">{scheme.amount}</p>
                      )}
                    </div>
                    {/* Voice button */}
                    <button onClick={() => handleVoice(scheme)}
                      className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all
                        ${speaking === scheme.id ? "bg-orange-500 text-white" : "bg-orange-50 text-orange-600 hover:bg-orange-100"}`}>
                      {speaking === scheme.id ? <VolumeX size={16} /> : <Volume2 size={16} />}
                    </button>
                  </div>

                  <p className="text-xs text-gray-500 mt-2 leading-relaxed">{scheme.description}</p>

                  {/* Eligibility */}
                  {scheme.eligibility && (
                    <div className="mt-2 bg-green-50 border border-green-100 rounded-xl px-3 py-2 text-xs text-green-700">
                      <span className="font-bold">✅ {t.eligibility}: </span>{scheme.eligibility}
                    </div>
                  )}

                  {/* Expand button */}
                  <button
                    onClick={() => setExpanded(expanded === scheme.id ? null : scheme.id)}
                    className="mt-3 flex items-center gap-1.5 text-sm font-bold text-orange-600 hover:text-orange-700 transition-colors"
                  >
                    <ChevronRight size={16} className={`transition-transform ${expanded === scheme.id ? "rotate-90" : ""}`} />
                    {t.howToApply}
                  </button>
                </div>

                {/* Expanded: Steps + Docs + Links */}
                <AnimatePresence>
                  {expanded === scheme.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-gray-100 p-4 space-y-4 bg-orange-50/30">

                        {/* Steps */}
                        {scheme.steps?.length > 0 && (
                          <div>
                            <h4 className="text-sm font-black text-gray-800 mb-3">📝 {t.steps}</h4>
                            <div className="space-y-2">
                              {scheme.steps.map((step, si) => (
                                <div key={si} className="flex gap-3 items-start">
                                  <div className="w-6 h-6 rounded-full bg-orange-500 text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                                    {si + 1}
                                  </div>
                                  <p className="text-sm text-gray-700 leading-relaxed">{step}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Documents */}
                        {scheme.documents?.length > 0 && (
                          <div>
                            <h4 className="text-sm font-black text-gray-800 mb-2">📄 {t.docs}</h4>
                            <div className="flex flex-wrap gap-2">
                              {scheme.documents.map((doc, di) => (
                                <span key={di} className="flex items-center gap-1 text-xs bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-700">
                                  <CheckCircle size={11} className="text-green-500" /> {doc}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Links + Helpline */}
                        <div className="flex flex-wrap gap-3">
                          {scheme.link && scheme.link !== "#" && (
                            <a href={scheme.link} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-1.5 text-sm font-bold text-blue-600 bg-blue-50 border border-blue-200 px-4 py-2 rounded-xl hover:bg-blue-100 transition-colors">
                              <ExternalLink size={14} /> {t.link}
                            </a>
                          )}
                          {scheme.helpline && (
                            <a href={`tel:${scheme.helpline.replace(/\D/g, "")}`}
                              className="flex items-center gap-1.5 text-sm font-bold text-green-600 bg-green-50 border border-green-200 px-4 py-2 rounded-xl hover:bg-green-100 transition-colors">
                              📞 {scheme.helpline}
                            </a>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* No results */}
      {searched && !loading && schemes.length === 0 && !error && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📋</p>
          <p className="font-semibold">{t.noResult}</p>
          <button onClick={findSchemes} className="mt-4 px-5 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-bold hover:bg-orange-600 transition-colors">
            {t.retry}
          </button>
        </div>
      )}
    </div>
  );
};

export default SchemePage;
