import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RefreshCw, Search, TrendingUp, TrendingDown,
  Clock, WifiOff, CheckCircle, AlertTriangle, ChevronDown, X,
} from "lucide-react";
import type { AppLang } from "./Index";

// ─── API Config ───────────────────────────────────────────────────────────────
const API_KEY     = "579b464db66ec23bdd0000018bf158c7f99e48d37374f69df315b016";
const RESOURCE_ID = "9ef84268-d588-465a-a308-a864a43d0070";
const CACHE_KEY   = "mandi_cache_v2";
const CACHE_TTL   = 5 * 60 * 1000; // 5 minutes

// ─── Types ────────────────────────────────────────────────────────────────────
export interface MandiRecord {
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety: string;
  arrival_date: string;
  min_price: number;
  max_price: number;
  modal_price: number;
}

interface CachePayload {
  records: MandiRecord[];
  fetchedAt: string; // ISO string
  fetchedAtMs: number;
}

// ─── Fetch from API ───────────────────────────────────────────────────────────
async function fetchFromAPI(limit = 1000): Promise<MandiRecord[] | null> {
  try {
    const url =
      `/datagov-api/resource/${RESOURCE_ID}` +
      `?api-key=${API_KEY}&format=json&limit=${limit}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(12000) });
    if (!res.ok) return null;
    const json = await res.json();
    const raw: any[] = json?.records ?? json?.data ?? [];
    if (!raw.length) return null;

    return raw.map((r) => ({
      state:        String(r.state        ?? r.State        ?? "").trim(),
      district:     String(r.district     ?? r.District     ?? "").trim(),
      market:       String(r.market       ?? r.Market       ?? "").trim(),
      commodity:    String(r.commodity    ?? r.Commodity    ?? "").trim(),
      variety:      String(r.variety      ?? r.Variety      ?? "").trim(),
      arrival_date: String(r.arrival_date ?? r.Arrival_Date ?? "").trim(),
      min_price:    parseFloat(String(r.min_price   ?? r.Min_Price   ?? 0).replace(/,/g, "")) || 0,
      max_price:    parseFloat(String(r.max_price   ?? r.Max_Price   ?? 0).replace(/,/g, "")) || 0,
      modal_price:  parseFloat(String(r.modal_price ?? r.Modal_Price ?? 0).replace(/,/g, "")) || 0,
    })).filter((r) => r.commodity && r.modal_price > 0);
  } catch {
    return null;
  }
}

// ─── LocalStorage cache ───────────────────────────────────────────────────────
function saveCache(records: MandiRecord[]) {
  const payload: CachePayload = {
    records,
    fetchedAt: new Date().toLocaleString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit", second: "2-digit",
    }),
    fetchedAtMs: Date.now(),
  };
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(payload)); } catch {}
}

function loadCache(): CachePayload | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CachePayload;
  } catch { return null; }
}

function isCacheFresh(cache: CachePayload): boolean {
  return Date.now() - cache.fetchedAtMs < CACHE_TTL;
}

// ─── Unique sorted values ─────────────────────────────────────────────────────
function uniq(arr: string[]) {
  return [...new Set(arr.filter(Boolean))].sort();
}

// ─── i18n ─────────────────────────────────────────────────────────────────────
const L: Record<AppLang, {
  title: string; live: string; stale: string; noData: string;
  lastUpdated: string; nextRefresh: string; refresh: string;
  search: string; filterState: string; filterDistrict: string;
  filterMarket: string; allStates: string; allDistricts: string;
  allMarkets: string; commodity: string; market: string; state: string;
  minPrice: string; maxPrice: string; modalPrice: string; arrivalDate: string;
  variety: string; noResults: string; records: string; highest: string; lowest: string;
  staleWarn: string; noDataWarn: string; fetching: string;
}> = {
  hi: { title:"🌾 मंडी लाइव डैशबोर्ड", live:"लाइव डेटा ✅", stale:"पिछला उपलब्ध डेटा ⚠️", noData:"डेटा उपलब्ध नहीं ❌", lastUpdated:"अंतिम अपडेट:", nextRefresh:"अगला रिफ्रेश:", refresh:"रिफ्रेश", search:"फसल खोजें...", filterState:"राज्य", filterDistrict:"जिला", filterMarket:"मंडी", allStates:"सभी राज्य", allDistricts:"सभी जिले", allMarkets:"सभी मंडियां", commodity:"फसल", market:"मंडी", state:"राज्य", minPrice:"न्यूनतम", maxPrice:"उच्चतम", modalPrice:"मोडल भाव", arrivalDate:"आगमन तिथि", variety:"किस्म", noResults:"कोई परिणाम नहीं", records:"रिकॉर्ड", highest:"सर्वोच्च", lowest:"न्यूनतम", staleWarn:"लाइव डेटा फिलहाल उपलब्ध नहीं है, पिछला अपडेट दिखाया जा रहा है", noDataWarn:"कोई डेटा उपलब्ध नहीं। कृपया इंटरनेट/API जांचें।", fetching:"डेटा लोड हो रहा है..." },
  en: { title:"🌾 Mandi Live Dashboard", live:"Live Data ✅", stale:"Using Last Available Data ⚠️", noData:"No Data Available ❌", lastUpdated:"Last updated on:", nextRefresh:"Next refresh:", refresh:"Refresh", search:"Search commodity...", filterState:"State", filterDistrict:"District", filterMarket:"Market", allStates:"All States", allDistricts:"All Districts", allMarkets:"All Markets", commodity:"Commodity", market:"Market", state:"State", minPrice:"Min Price", maxPrice:"Max Price", modalPrice:"Modal Price", arrivalDate:"Arrival Date", variety:"Variety", noResults:"No results found", records:"records", highest:"Highest", lowest:"Lowest", staleWarn:"Live data unavailable. Showing last available data.", noDataWarn:"No data available. Please check internet/API.", fetching:"Loading data..." },
  ta: { title:"🌾 மண்டி நேரடி டாஷ்போர்டு", live:"நேரடி தரவு ✅", stale:"கடைசி கிடைத்த தரவு ⚠️", noData:"தரவு இல்லை ❌", lastUpdated:"கடைசியாக புதுப்பிக்கப்பட்டது:", nextRefresh:"அடுத்த புதுப்பிப்பு:", refresh:"புதுப்பி", search:"பயிர் தேடுங்கள்...", filterState:"மாநிலம்", filterDistrict:"மாவட்டம்", filterMarket:"மண்டி", allStates:"அனைத்து மாநிலங்கள்", allDistricts:"அனைத்து மாவட்டங்கள்", allMarkets:"அனைத்து மண்டிகள்", commodity:"பயிர்", market:"மண்டி", state:"மாநிலம்", minPrice:"குறைந்தபட்சம்", maxPrice:"அதிகபட்சம்", modalPrice:"மோடல் விலை", arrivalDate:"வருகை தேதி", variety:"வகை", noResults:"முடிவுகள் இல்லை", records:"பதிவுகள்", highest:"அதிகபட்சம்", lowest:"குறைந்தபட்சம்", staleWarn:"நேரடி தரவு கிடைக்கவில்லை. கடைசி தரவு காட்டப்படுகிறது.", noDataWarn:"தரவு இல்லை. இணையம்/API சரிபார்க்கவும்.", fetching:"தரவு ஏற்றப்படுகிறது..." },
  mr: { title:"🌾 मंडी लाइव्ह डॅशबोर्ड", live:"लाइव्ह डेटा ✅", stale:"शेवटचा उपलब्ध डेटा ⚠️", noData:"डेटा उपलब्ध नाही ❌", lastUpdated:"शेवटचे अपडेट:", nextRefresh:"पुढचे रिफ्रेश:", refresh:"रिफ्रेश", search:"पीक शोधा...", filterState:"राज्य", filterDistrict:"जिल्हा", filterMarket:"मंडी", allStates:"सर्व राज्ये", allDistricts:"सर्व जिल्हे", allMarkets:"सर्व मंड्या", commodity:"पीक", market:"मंडी", state:"राज्य", minPrice:"किमान", maxPrice:"कमाल", modalPrice:"मोडल भाव", arrivalDate:"आगमन तारीख", variety:"जात", noResults:"कोणतेही परिणाम नाही", records:"नोंदी", highest:"सर्वोच्च", lowest:"किमान", staleWarn:"लाइव्ह डेटा उपलब्ध नाही. शेवटचा डेटा दाखवत आहे.", noDataWarn:"डेटा उपलब्ध नाही. इंटरनेट/API तपासा.", fetching:"डेटा लोड होत आहे..." },
  te: { title:"🌾 మండి లైవ్ డాష్‌బోర్డ్", live:"లైవ్ డేటా ✅", stale:"చివరి అందుబాటు డేటా ⚠️", noData:"డేటా అందుబాటులో లేదు ❌", lastUpdated:"చివరిగా నవీకరించబడింది:", nextRefresh:"తదుపరి రిఫ్రెష్:", refresh:"రిఫ్రెష్", search:"పంట వెతకండి...", filterState:"రాష్ట్రం", filterDistrict:"జిల్లా", filterMarket:"మండి", allStates:"అన్ని రాష్ట్రాలు", allDistricts:"అన్ని జిల్లాలు", allMarkets:"అన్ని మండులు", commodity:"పంట", market:"మండి", state:"రాష్ట్రం", minPrice:"కనిష్ట", maxPrice:"గరిష్ట", modalPrice:"మోడల్ ధర", arrivalDate:"రాక తేదీ", variety:"రకం", noResults:"ఫలితాలు లేవు", records:"రికార్డులు", highest:"అత్యధికం", lowest:"అత్యల్పం", staleWarn:"లైవ్ డేటా అందుబాటులో లేదు. చివరి డేటా చూపిస్తోంది.", noDataWarn:"డేటా లేదు. ఇంటర్నెట్/API తనిఖీ చేయండి.", fetching:"డేటా లోడ్ అవుతోంది..." },
  kn: { title:"🌾 ಮಂಡಿ ಲೈವ್ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್", live:"ಲೈವ್ ಡೇಟಾ ✅", stale:"ಕೊನೆಯ ಲಭ್ಯ ಡೇಟಾ ⚠️", noData:"ಡೇಟಾ ಲಭ್ಯವಿಲ್ಲ ❌", lastUpdated:"ಕೊನೆಯ ಅಪ್‌ಡೇಟ್:", nextRefresh:"ಮುಂದಿನ ರಿಫ್ರೆಶ್:", refresh:"ರಿಫ್ರೆಶ್", search:"ಬೆಳೆ ಹುಡುಕಿ...", filterState:"ರಾಜ್ಯ", filterDistrict:"ಜಿಲ್ಲೆ", filterMarket:"ಮಂಡಿ", allStates:"ಎಲ್ಲಾ ರಾಜ್ಯಗಳು", allDistricts:"ಎಲ್ಲಾ ಜಿಲ್ಲೆಗಳು", allMarkets:"ಎಲ್ಲಾ ಮಂಡಿಗಳು", commodity:"ಬೆಳೆ", market:"ಮಂಡಿ", state:"ರಾಜ್ಯ", minPrice:"ಕನಿಷ್ಠ", maxPrice:"ಗರಿಷ್ಠ", modalPrice:"ಮೋಡಲ್ ಬೆಲೆ", arrivalDate:"ಆಗಮನ ದಿನಾಂಕ", variety:"ತಳಿ", noResults:"ಫಲಿತಾಂಶಗಳಿಲ್ಲ", records:"ದಾಖಲೆಗಳು", highest:"ಅತ್ಯಧಿಕ", lowest:"ಕನಿಷ್ಠ", staleWarn:"ಲೈವ್ ಡೇಟಾ ಲಭ್ಯವಿಲ್ಲ. ಕೊನೆಯ ಡೇಟಾ ತೋರಿಸಲಾಗುತ್ತಿದೆ.", noDataWarn:"ಡೇಟಾ ಇಲ್ಲ. ಇಂಟರ್ನೆಟ್/API ಪರಿಶೀಲಿಸಿ.", fetching:"ಡೇಟಾ ಲೋಡ್ ಆಗುತ್ತಿದೆ..." },
  bn: { title:"🌾 মান্ডি লাইভ ড্যাশবোর্ড", live:"লাইভ ডেটা ✅", stale:"শেষ পাওয়া ডেটা ⚠️", noData:"ডেটা নেই ❌", lastUpdated:"শেষ আপডেট:", nextRefresh:"পরবর্তী রিফ্রেশ:", refresh:"রিফ্রেশ", search:"ফসল খুঁজুন...", filterState:"রাজ্য", filterDistrict:"জেলা", filterMarket:"মান্ডি", allStates:"সব রাজ্য", allDistricts:"সব জেলা", allMarkets:"সব মান্ডি", commodity:"ফসল", market:"মান্ডি", state:"রাজ্য", minPrice:"সর্বনিম্ন", maxPrice:"সর্বোচ্চ", modalPrice:"মোডাল দাম", arrivalDate:"আগমন তারিখ", variety:"জাত", noResults:"কোনো ফলাফল নেই", records:"রেকর্ড", highest:"সর্বোচ্চ", lowest:"সর্বনিম্ন", staleWarn:"লাইভ ডেটা পাওয়া যাচ্ছে না। শেষ ডেটা দেখানো হচ্ছে।", noDataWarn:"ডেটা নেই। ইন্টারনেট/API পরীক্ষা করুন।", fetching:"ডেটা লোড হচ্ছে..." },
  pa: { title:"🌾 ਮੰਡੀ ਲਾਈਵ ਡੈਸ਼ਬੋਰਡ", live:"ਲਾਈਵ ਡੇਟਾ ✅", stale:"ਆਖਰੀ ਉਪਲਬਧ ਡੇਟਾ ⚠️", noData:"ਡੇਟਾ ਉਪਲਬਧ ਨਹੀਂ ❌", lastUpdated:"ਆਖਰੀ ਅਪਡੇਟ:", nextRefresh:"ਅਗਲਾ ਰਿਫ੍ਰੈਸ਼:", refresh:"ਰਿਫ੍ਰੈਸ਼", search:"ਫਸਲ ਲੱਭੋ...", filterState:"ਰਾਜ", filterDistrict:"ਜ਼ਿਲ੍ਹਾ", filterMarket:"ਮੰਡੀ", allStates:"ਸਾਰੇ ਰਾਜ", allDistricts:"ਸਾਰੇ ਜ਼ਿਲ੍ਹੇ", allMarkets:"ਸਾਰੀਆਂ ਮੰਡੀਆਂ", commodity:"ਫਸਲ", market:"ਮੰਡੀ", state:"ਰਾਜ", minPrice:"ਘੱਟੋ-ਘੱਟ", maxPrice:"ਵੱਧ ਤੋਂ ਵੱਧ", modalPrice:"ਮੋਡਲ ਭਾਅ", arrivalDate:"ਆਮਦ ਮਿਤੀ", variety:"ਕਿਸਮ", noResults:"ਕੋਈ ਨਤੀਜਾ ਨਹੀਂ", records:"ਰਿਕਾਰਡ", highest:"ਸਭ ਤੋਂ ਵੱਧ", lowest:"ਸਭ ਤੋਂ ਘੱਟ", staleWarn:"ਲਾਈਵ ਡੇਟਾ ਉਪਲਬਧ ਨਹੀਂ। ਆਖਰੀ ਡੇਟਾ ਦਿਖਾਇਆ ਜਾ ਰਿਹਾ ਹੈ।", noDataWarn:"ਕੋਈ ਡੇਟਾ ਨਹੀਂ। ਕਿਰਪਾ ਕਰਕੇ ਇੰਟਰਨੈੱਟ/API ਜਾਂਚੋ।", fetching:"ਡੇਟਾ ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ..." },
};

// ─── Select dropdown ──────────────────────────────────────────────────────────
const Select = ({ value, onChange, options, placeholder }: {
  value: string; onChange: (v: string) => void;
  options: string[]; placeholder: string;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:border-green-400 transition-all min-w-[140px] justify-between">
        <span className="truncate max-w-[120px]">{value || placeholder}</span>
        <ChevronDown size={14} className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            className="absolute top-full mt-1 left-0 z-50 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden min-w-[180px] max-h-60 overflow-y-auto">
            <button onClick={() => { onChange(""); setOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-sm hover:bg-green-50 transition-colors ${!value ? "text-green-700 font-bold bg-green-50" : "text-gray-500"}`}>
              {placeholder}
            </button>
            {options.map(o => (
              <button key={o} onClick={() => { onChange(o); setOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-green-50 transition-colors ${value === o ? "text-green-700 font-bold bg-green-50" : "text-gray-700"}`}>
                {o}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
interface MandiPageProps { lang: AppLang; }
type DataStatus = "fetching" | "live" | "stale" | "empty";

const MandiPage = ({ lang }: MandiPageProps) => {
  const t = L[lang] ?? L.hi;

  const [records, setRecords]     = useState<MandiRecord[]>([]);
  const [status, setStatus]       = useState<DataStatus>("fetching");
  const [fetchedAt, setFetchedAt] = useState<string>("");
  const [fetching, setFetching]   = useState(false);
  const [countdown, setCountdown] = useState(300);

  const [search, setSearch]       = useState("");
  const [stateF, setStateF]       = useState("");
  const [districtF, setDistrictF] = useState("");
  const [marketF, setMarketF]     = useState("");

  // ── Load: cache → API → stale cache → empty ───────────────────────────────
  const loadData = useCallback(async (forceRefresh = false) => {
    setFetching(true);

    if (!forceRefresh) {
      const cache = loadCache();
      if (cache && isCacheFresh(cache)) {
        setRecords(cache.records);
        setFetchedAt(cache.fetchedAt);
        setStatus("live");
        setCountdown(Math.round((CACHE_TTL - (Date.now() - cache.fetchedAtMs)) / 1000));
        setFetching(false);
        return;
      }
    }

    const live = await fetchFromAPI(1000);
    if (live && live.length > 0) {
      saveCache(live);
      const cache = loadCache()!;
      setRecords(live);
      setFetchedAt(cache.fetchedAt);
      setStatus("live");
      setCountdown(300);
    } else {
      const cache = loadCache();
      if (cache && cache.records.length > 0) {
        setRecords(cache.records);
        setFetchedAt(cache.fetchedAt);
        setStatus("stale");
      } else {
        // STRICT: no fake data — show empty
        setRecords([]);
        setStatus("empty");
      }
    }
    setFetching(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => { const id = setInterval(() => loadData(true), 300000); return () => clearInterval(id); }, [loadData]);
  useEffect(() => { const id = setInterval(() => setCountdown(c => Math.max(0, c - 1)), 1000); return () => clearInterval(id); }, []);

  const states    = useMemo(() => uniq(records.map(r => r.state)), [records]);
  const districts = useMemo(() => uniq(records.filter(r => !stateF || r.state === stateF).map(r => r.district)), [records, stateF]);
  const markets   = useMemo(() => uniq(records.filter(r => (!stateF || r.state === stateF) && (!districtF || r.district === districtF)).map(r => r.market)), [records, stateF, districtF]);

  useEffect(() => { setDistrictF(""); setMarketF(""); }, [stateF]);
  useEffect(() => { setMarketF(""); }, [districtF]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return records.filter(r =>
      (!stateF    || r.state    === stateF) &&
      (!districtF || r.district === districtF) &&
      (!marketF   || r.market   === marketF) &&
      (!q || r.commodity.toLowerCase().includes(q) || r.market.toLowerCase().includes(q))
    );
  }, [records, stateF, districtF, marketF, search]);

  const stats = useMemo(() => {
    if (!filtered.length) return null;
    const highest = filtered.reduce((a, b) => b.modal_price > a.modal_price ? b : a);
    const lowest  = filtered.reduce((a, b) => b.modal_price < a.modal_price ? b : a);
    const avg     = Math.round(filtered.reduce((s, r) => s + r.modal_price, 0) / filtered.length);
    return { highest, lowest, avg, total: filtered.length };
  }, [filtered]);

  const fmtCountdown = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const statusCfg = {
    fetching: { bg:"bg-blue-50 border-blue-200",   icon:<RefreshCw size={15} className="animate-spin text-blue-500"/>,  text:"text-blue-700",  msg:t.fetching },
    live:     { bg:"bg-green-50 border-green-200", icon:<CheckCircle size={15} className="text-green-600"/>,            text:"text-green-700", msg:t.live },
    stale:    { bg:"bg-amber-50 border-amber-200", icon:<AlertTriangle size={15} className="text-amber-500"/>,          text:"text-amber-700", msg:t.stale },
    empty:    { bg:"bg-red-50 border-red-200",     icon:<WifiOff size={15} className="text-red-500"/>,                  text:"text-red-700",   msg:t.noData },
  }[status];

  return (
    <div className="container max-w-5xl py-5 space-y-4">

      {/* Header */}
      <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
        className="bg-gradient-to-br from-green-700 to-emerald-600 rounded-3xl p-5 text-white shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-black">{t.title}</h1>
            {fetchedAt && status !== "empty" && (
              <p className="text-sm text-white/80 mt-0.5">
                <span className="font-semibold">{t.lastUpdated}</span> {fetchedAt}
                {status === "live" && <span className="ml-3 text-white/60">{t.nextRefresh} {fmtCountdown(countdown)}</span>}
              </p>
            )}
          </div>
          <button onClick={() => loadData(true)} disabled={fetching}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 disabled:opacity-60 transition-all rounded-xl px-4 py-2.5 text-sm font-bold">
            <RefreshCw size={15} className={fetching ? "animate-spin" : ""} /> {t.refresh}
          </button>
        </div>
      </motion.div>

      {/* Status banner */}
      <div className={`flex items-center gap-3 rounded-2xl px-4 py-3 border text-sm font-semibold ${statusCfg.bg} ${statusCfg.text}`}>
        {statusCfg.icon}
        <span>{statusCfg.msg}</span>
        {status === "stale" && fetchedAt && (
          <span className="ml-auto text-xs font-normal opacity-80 flex items-center gap-1">
            <Clock size={12} /> {fetchedAt}
          </span>
        )}
      </div>

      {/* Stale warning */}
      {status === "stale" && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-sm text-amber-800">
          ⚠️ {t.staleWarn}
        </div>
      )}

      {/* Empty state — no fake data */}
      {status === "empty" && (
        <div className="bg-white border border-gray-100 rounded-3xl shadow-sm text-center py-16 px-6">
          <WifiOff size={40} className="mx-auto mb-4 text-gray-300" />
          <p className="font-bold text-gray-700 text-lg mb-2">{t.noData}</p>
          <p className="text-sm text-gray-500">{t.noDataWarn}</p>
          <button onClick={() => loadData(true)} className="mt-5 inline-flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-green-700 transition-colors">
            <RefreshCw size={15} /> {t.refresh}
          </button>
        </div>
      )}

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label:t.records,   val:stats.total.toLocaleString("en-IN"), sub:"",                          color:"text-gray-800", bg:"bg-white" },
            { label:t.highest,   val:`₹${stats.highest.modal_price.toLocaleString("en-IN")}`, sub:stats.highest.commodity, color:"text-green-700", bg:"bg-green-50" },
            { label:t.lowest,    val:`₹${stats.lowest.modal_price.toLocaleString("en-IN")}`,  sub:stats.lowest.commodity,  color:"text-red-600",   bg:"bg-red-50" },
            { label:"Avg Modal", val:`₹${stats.avg.toLocaleString("en-IN")}`,                 sub:"₹/qtl",                 color:"text-blue-700",  bg:"bg-blue-50" },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.05+i*0.05 }}
              className={`${s.bg} border border-gray-100 rounded-2xl p-4 shadow-sm`}>
              <p className="text-xs text-gray-500 font-medium mb-1">{s.label}</p>
              <p className={`text-xl font-black ${s.color}`}>{s.val}</p>
              {s.sub && <p className="text-xs text-gray-400 mt-0.5 truncate">{s.sub}</p>}
            </motion.div>
          ))}
        </div>
      )}

      {/* Filters */}
      {records.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm space-y-3">
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t.search}
              className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all" />
            {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X size={14} /></button>}
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <Select value={stateF}    onChange={setStateF}    options={states}    placeholder={t.allStates} />
            <Select value={districtF} onChange={setDistrictF} options={districts} placeholder={t.allDistricts} />
            <Select value={marketF}   onChange={setMarketF}   options={markets}   placeholder={t.allMarkets} />
            {(stateF || districtF || marketF || search) && (
              <button onClick={() => { setStateF(""); setDistrictF(""); setMarketF(""); setSearch(""); }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-200 bg-red-50 text-red-600 text-sm font-semibold hover:bg-red-100 transition-colors">
                <X size={13} /> Clear
              </button>
            )}
          </div>
          <p className="text-xs text-gray-400">{filtered.length.toLocaleString("en-IN")} {t.records}</p>
        </div>
      )}

      {/* Table */}
      {filtered.length > 0 && (
        <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.15 }}
          className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-green-700 text-white">
                  {[t.commodity, t.variety, t.market, t.state, t.minPrice, t.maxPrice, t.modalPrice, t.arrivalDate].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-bold text-xs whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 200).map((r, i) => {
                  const isHigh = stats && r.modal_price === stats.highest.modal_price;
                  const isLow  = stats && filtered.length > 1 && r.modal_price === stats.lowest.modal_price;
                  return (
                    <tr key={i} className={`border-b border-gray-50 hover:bg-green-50/40 transition-colors ${i % 2 === 0 ? "bg-white" : "bg-gray-50/30"}`}>
                      <td className="px-4 py-3 font-bold text-gray-900 whitespace-nowrap">{r.commodity}</td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{r.variety || "—"}</td>
                      <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{r.market}</td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{r.state}</td>
                      <td className="px-4 py-3 text-blue-600 font-semibold whitespace-nowrap">₹{r.min_price.toLocaleString("en-IN")}</td>
                      <td className="px-4 py-3 text-orange-600 font-semibold whitespace-nowrap">₹{r.max_price.toLocaleString("en-IN")}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 font-black px-2.5 py-1 rounded-full text-xs
                          ${isHigh ? "bg-green-100 text-green-700" : isLow ? "bg-red-100 text-red-600" : "text-gray-900"}`}>
                          {isHigh && <TrendingUp size={11} />}
                          {isLow  && <TrendingDown size={11} />}
                          ₹{r.modal_price.toLocaleString("en-IN")}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 whitespace-nowrap text-xs">{r.arrival_date || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filtered.length > 200 && (
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-500 text-center">
              Showing 200 of {filtered.length.toLocaleString("en-IN")} {t.records}. Use filters to narrow down.
            </div>
          )}
        </motion.div>
      )}

      {/* No results */}
      {records.length > 0 && filtered.length === 0 && status !== "fetching" && (
        <div className="text-center py-16 text-gray-400">
          <Search size={32} className="mx-auto mb-3 opacity-40" />
          <p className="font-semibold">{t.noResults}</p>
        </div>
      )}
    </div>
  );
};

export default MandiPage;
