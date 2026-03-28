import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RefreshCw, Search, TrendingUp, Trophy,
  AlertTriangle, CheckCircle, Clock, X, Info,
  BarChart2, Leaf, ChevronDown, ArrowUpRight
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from "recharts";
import {
  fetchMarketData, getModalPriceForCrop, getUniqueValues,
  type LiveRecord, type DataSource,
} from "@/services/marketService";
import { MSP_DATA, MSP_UPDATED, MSP_SOURCE } from "@/data/mspData";
import {
  calculateProfit, rankCrops, getBestCrop,
  type ProfitResult,
} from "@/utils/profitCalculator";
import type { AppLang } from "./Index";
import { useTranslation } from "@/hooks/useTranslation";

// ── i18n ──────────────────────────────────────────────────────────────────────
const UI_EN = {
  title: "📊 Market Prices & Profit Analysis",
  subtitle: "Compare live mandi prices with official MSP",
  liveTag: "🟢 Live Data",
  mspTag: "📋 MSP Reference Data",
  staleTag: "⚠️ Last Available Data",
  lastUpdated: "Last updated:",
  refresh: "Refresh",
  search: "Search crop...",
  allStates: "All States",
  allDistricts: "All Districts",
  allMarkets: "All Markets",
  bestCrop: "🏆 Most Profitable Crop Today",
  profitAnalysis: "Profit Analysis",
  liveTable: "Live Mandi Prices",
  mspTable: "MSP Reference Table",
  comparison: "Mandi vs MSP Comparison",
  crop: "Crop", state: "State", market: "Market", district: "District",
  minPrice: "Min", maxPrice: "Max", modalPrice: "Modal Price",
  msp: "MSP", profit: "Profit/Qtl", profitAcre: "Profit/Acre",
  score: "Score", arrivalDate: "Arrival Date", variety: "Variety",
  perQtl: "₹/qtl", perAcre: "₹/acre",
  aboveMsp: "Above MSP", belowMsp: "Below MSP",
  noData: "No Data Available",
  noDataDesc: "Please check internet or API.",
  staleWarn: "Live data unavailable. Showing last available data.",
  mspNote: "Live mandi data unavailable. Showing official MSP 2024-25 below.",
  mspSource: "Source: CCEA, Government of India",
  records: "records",
  excellent: "Excellent", good: "Good", average: "Average", low: "Low",
  tabLive: "Live Prices", tabMsp: "MSP Table", tabProfit: "Profit Analysis", tabCompare: "Compare",
  nextRefresh: "Next refresh:",
  fetching: "Loading data...",
};

// ── Small helpers ─────────────────────────────────────────────────────────────
const fmt = (n: number) => n.toLocaleString("en-IN");
const fmtSign = (n: number) => (n >= 0 ? `+₹${fmt(n)}` : `-₹${fmt(Math.abs(n))}`);

const ScoreBar = ({ score }: { score: number }) => (
  <div className="flex items-center gap-2">
    <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${score}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={`h-full rounded-full ${score >= 75 ? "bg-green-500" : score >= 50 ? "bg-amber-400" : score >= 25 ? "bg-orange-400" : "bg-red-400"}`}
      />
    </div>
    <span className={`text-xs font-bold w-8 text-right ${score >= 75 ? "text-green-600" : score >= 50 ? "text-amber-500" : "text-red-500"}`}>
      {score}
    </span>
  </div>
);

// ── Dropdown ──────────────────────────────────────────────────────────────────
const Dropdown = ({ value, onChange, options, placeholder }: {
  value: string; onChange: (v: string) => void;
  options: string[]; placeholder: string;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:border-green-400 transition-all min-w-[140px] justify-between"
      >
        <span className="truncate max-w-[110px]">{value || placeholder}</span>
        <ChevronDown size={13} className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            className="absolute top-full mt-1 left-0 z-50 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden min-w-[180px] max-h-56 overflow-y-auto"
            onMouseLeave={() => setOpen(false)}
          >
            <button
              onClick={() => { onChange(""); setOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-sm hover:bg-green-50 transition-colors ${!value ? "text-green-700 font-bold bg-green-50" : "text-gray-500"}`}
            >
              {placeholder}
            </button>
            {options.map((o) => (
              <button
                key={o}
                onClick={() => { onChange(o); setOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-green-50 transition-colors ${value === o ? "text-green-700 font-bold bg-green-50" : "text-gray-700"}`}
              >
                {o}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
interface MarketPageProps { lang: AppLang; }

const MarketPage = ({ lang }: MarketPageProps) => {
  const { t } = useTranslation(lang);
  const isHindi = ["hi", "mr", "pa"].includes(lang);

  const [source, setSource]       = useState<DataSource>("msp");
  const [records, setRecords]     = useState<LiveRecord[]>([]);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);
  const [isStale, setIsStale]     = useState(false);
  const [loading, setLoading]     = useState(true);
  const [countdown, setCountdown] = useState(300);
  const [activeTab, setActiveTab] = useState<"live"|"msp"|"profit"|"compare">("profit");
  const [search, setSearch]       = useState("");
  const [stateF, setStateF]       = useState("");
  const [districtF, setDistrictF] = useState("");
  const [marketF, setMarketF]     = useState("");

  const load = useCallback(async (force = false) => {
    setLoading(true);
    const result = await fetchMarketData(force);
    setSource(result.source);
    setRecords(result.records);
    setFetchedAt(result.fetchedAt);
    setIsStale(result.error === "stale");
    setCountdown(300);
    setLoading(false);
    if (result.source === "live" && result.records.length > 0) setActiveTab("live");
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { const id = setInterval(() => load(true), 300000); return () => clearInterval(id); }, [load]);
  useEffect(() => { const id = setInterval(() => setCountdown((c) => Math.max(0, c - 1)), 1000); return () => clearInterval(id); }, []);

  const states    = useMemo(() => getUniqueValues(records, "state"), [records]);
  const districts = useMemo(() => getUniqueValues(records.filter((r) => !stateF || r.state === stateF), "district"), [records, stateF]);
  const markets   = useMemo(() => getUniqueValues(records.filter((r) => (!stateF || r.state === stateF) && (!districtF || r.district === districtF)), "market"), [records, stateF, districtF]);

  useEffect(() => { setDistrictF(""); setMarketF(""); }, [stateF]);
  useEffect(() => { setMarketF(""); }, [districtF]);

  const filteredRecords = useMemo(() => {
    const q = search.toLowerCase();
    return records.filter((r) =>
      (!stateF || r.state === stateF) && (!districtF || r.district === districtF) &&
      (!marketF || r.market === marketF) &&
      (!q || r.commodity.toLowerCase().includes(q) || r.market.toLowerCase().includes(q))
    );
  }, [records, stateF, districtF, marketF, search]);

  const profitResults = useMemo(() => {
    const raw = MSP_DATA.map((crop) => {
      const livePrice = source === "live" ? getModalPriceForCrop(crop, records) : null;
      return calculateProfit(crop, livePrice ?? undefined);
    });
    return rankCrops(raw);
  }, [source, records]);

  const bestCrop   = useMemo(() => getBestCrop(profitResults), [profitResults]);
  const compareData = useMemo(() =>
    profitResults.slice(0, 10).map((r) => ({
      name: isHindi ? r.cropHi : r.crop.split(" ")[0],
      price: r.price, msp: r.msp, profit: Math.max(0, r.profitPerQtl),
    })), [profitResults, isHindi]);

  const fmtCountdown = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  const recColor = (r: ProfitResult["recommendation"]) =>
    r === "excellent" ? "text-green-600 bg-green-50 border-green-200" :
    r === "good"      ? "text-blue-600 bg-blue-50 border-blue-200" :
    r === "average"   ? "text-amber-600 bg-amber-50 border-amber-200" :
                        "text-red-600 bg-red-50 border-red-200";

  const tabs = [
    { id: "profit",  label: t(UI_EN.tabProfit),  icon: <TrendingUp size={14} /> },
    { id: "compare", label: t(UI_EN.tabCompare), icon: <BarChart2 size={14} /> },
    { id: "msp",     label: t(UI_EN.tabMsp),     icon: <Leaf size={14} /> },
    ...(source === "live" ? [{ id: "live", label: t(UI_EN.tabLive), icon: <CheckCircle size={14} /> }] : []),
  ] as const;

  return (
    <div className="container max-w-5xl py-5 space-y-4">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-green-700 to-emerald-600 rounded-3xl p-5 text-white shadow-xl">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-black">{t(UI_EN.title)}</h1>
            <p className="text-sm text-white/80 mt-0.5">{t(UI_EN.subtitle)}</p>
            {fetchedAt && (
              <p className="text-xs text-white/60 mt-1 flex items-center gap-1.5">
                <Clock size={11} /> {t(UI_EN.lastUpdated)} {fetchedAt}
                {source === "live" && !isStale && <span className="ml-2">{t(UI_EN.nextRefresh)} {fmtCountdown(countdown)}</span>}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${
              loading ? "bg-blue-50 text-blue-700 border-blue-200" :
              isStale ? "bg-amber-50 text-amber-700 border-amber-200" :
              source === "live" ? "bg-green-50 text-green-700 border-green-200" :
              "bg-gray-50 text-gray-700 border-gray-200"}`}>
              {loading ? <><RefreshCw size={11} className="inline animate-spin mr-1" />{t(UI_EN.fetching)}</> :
               isStale ? t(UI_EN.staleTag) : source === "live" ? t(UI_EN.liveTag) : t(UI_EN.mspTag)}
            </span>
            <button onClick={() => load(true)} disabled={loading}
              className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 disabled:opacity-60 transition-all rounded-xl px-3 py-2 text-sm font-bold">
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> {t(UI_EN.refresh)}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Banners */}
      {isStale && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-sm text-amber-800 font-semibold">
          <AlertTriangle size={15} /> {t(UI_EN.staleWarn)}
        </div>
      )}
      {source === "msp" && !loading && (
        <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-2xl px-4 py-3 text-sm text-blue-800">
          <Info size={15} className="mt-0.5 shrink-0" />
          <div><p className="font-bold">{t(UI_EN.mspNote)}</p><p className="text-xs mt-0.5 opacity-75">{t(UI_EN.mspSource)} • {MSP_UPDATED}</p></div>
        </div>
      )}

      {/* Best Crop Hero */}
      {bestCrop && !loading && (
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-3xl p-5 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <Trophy size={22} className="text-yellow-200" />
            <h2 className="font-black text-base">{t(UI_EN.bestCrop)}</h2>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="text-4xl">{bestCrop.emoji}</div>
            <div className="flex-1">
              <p className="text-2xl font-black">{isHindi ? bestCrop.cropHi : bestCrop.crop}</p>
              <p className="text-white/80 text-sm">₹{fmt(bestCrop.price)}/qtl • {fmtSign(bestCrop.profitPerQtl)}/qtl • {fmtSign(bestCrop.profitPerAcre)}/acre</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-black">{bestCrop.score}/100</p>
              <p className="text-xs text-white/70">{t(UI_EN.score)}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-sm font-bold transition-all whitespace-nowrap
              ${activeTab === tab.id ? "bg-green-600 text-white shadow-md" : "bg-white border border-gray-200 text-gray-600 hover:border-green-300"}`}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>

          {/* PROFIT TAB */}
          {activeTab === "profit" && (
            <div className="space-y-3">
              <div className="relative">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t(UI_EN.search)}
                  className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all bg-white" />
                {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><X size={14} /></button>}
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-green-700 text-white">
                        {[t(UI_EN.crop), t(UI_EN.msp), "Market", t(UI_EN.profit), t(UI_EN.profitAcre), t(UI_EN.score), ""].map((h, i) => (
                          <th key={i} className="px-4 py-3 text-left font-bold text-xs whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {profitResults
                        .filter((r) => !search || r.crop.toLowerCase().includes(search.toLowerCase()) || r.cropHi.includes(search))
                        .map((r, i) => (
                          <tr key={r.cropId} className={`border-b border-gray-50 hover:bg-green-50/40 transition-colors ${i % 2 === 0 ? "bg-white" : "bg-gray-50/30"}`}>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{r.emoji}</span>
                                <div>
                                  <p className="font-bold text-gray-900 text-xs">{isHindi ? r.cropHi : r.crop.split(" ")[0]}</p>
                                  {source === "live" && <p className="text-xs text-gray-400">{r.isAboveMsp ? "↑ " + t(UI_EN.aboveMsp) : "↓ " + t(UI_EN.belowMsp)}</p>}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-gray-600 whitespace-nowrap text-xs">₹{fmt(r.msp)}</td>
                            <td className="px-4 py-3 font-bold whitespace-nowrap">
                              <span className={r.isAboveMsp ? "text-green-700" : "text-gray-800"}>₹{fmt(r.price)}</span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className={r.profitPerQtl >= 0 ? "text-green-600 font-bold" : "text-red-500 font-bold"}>{fmtSign(r.profitPerQtl)}</span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className={r.profitPerAcre >= 0 ? "text-green-600 font-bold" : "text-red-500 font-bold"}>{fmtSign(r.profitPerAcre)}</span>
                            </td>
                            <td className="px-4 py-3 min-w-[100px]"><ScoreBar score={r.score} /></td>
                            <td className="px-4 py-3">
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${recColor(r.recommendation)}`}>
                                {t((UI_EN as any)[r.recommendation])}
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* COMPARE TAB */}
          {activeTab === "compare" && (
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <h3 className="font-black text-gray-800 mb-4 text-sm">💰 {t(UI_EN.comparison)} — Top 10 (₹/qtl)</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={compareData} margin={{ top: 5, right: 10, left: 0, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-35} textAnchor="end" axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} width={44} />
                  <Tooltip formatter={(v: number, name: string) => [`₹${fmt(v)}`, name === "price" ? "Market" : name === "msp" ? "MSP" : "Profit"]} />
                  <Bar dataKey="msp"    fill="#94a3b8" radius={[4,4,0,0]} />
                  <Bar dataKey="price"  fill="#16a34a" radius={[4,4,0,0]} />
                  <Bar dataKey="profit" fill="#f59e0b" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="flex gap-4 justify-center mt-2 text-xs">
                {[["#94a3b8","MSP"],["#16a34a","Market"],["#f59e0b","Profit"]].map(([c,l]) => (
                  <span key={l} className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm inline-block" style={{ background: c }} />{l}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* MSP TABLE TAB */}
          {activeTab === "msp" && (
            <div className="space-y-3">
              <div className="bg-blue-50 border border-blue-200 rounded-2xl px-4 py-3 text-xs text-blue-700 flex items-center gap-2">
                <Info size={13} /> {t(UI_EN.mspSource)} • {MSP_UPDATED} • {MSP_SOURCE}
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-blue-700 text-white">
                        {[t(UI_EN.crop), "Season", t(UI_EN.msp), "Avg Cost", t(UI_EN.profit), "Yield/Acre", "States"].map((h) => (
                          <th key={h} className="px-4 py-3 text-left font-bold text-xs whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {MSP_DATA.map((crop, i) => {
                        const profit = crop.msp - crop.avgCost;
                        return (
                          <tr key={crop.id} className={`border-b border-gray-50 hover:bg-blue-50/30 transition-colors ${i % 2 === 0 ? "bg-white" : "bg-gray-50/30"}`}>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{crop.emoji}</span>
                                <div>
                                  <p className="font-bold text-gray-900 text-xs">{isHindi ? crop.cropHi : crop.crop.split(" ")[0]}</p>
                                  <p className="text-xs text-gray-400 capitalize">{crop.category}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{crop.season}</td>
                            <td className="px-4 py-3 font-black text-blue-700 whitespace-nowrap">₹{fmt(crop.msp)}</td>
                            <td className="px-4 py-3 text-gray-600 whitespace-nowrap text-xs">₹{fmt(crop.avgCost)}</td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className={`font-bold text-xs ${profit >= 0 ? "text-green-600" : "text-red-500"}`}>{fmtSign(profit)}</span>
                            </td>
                            <td className="px-4 py-3 text-gray-600 whitespace-nowrap text-xs">{crop.yieldPerAcre} qtl</td>
                            <td className="px-4 py-3 text-xs text-gray-400 max-w-[160px] truncate">{crop.states.slice(0, 3).join(", ")}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* LIVE TABLE TAB */}
          {activeTab === "live" && source === "live" && (
            <div className="space-y-3">
              <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm space-y-3">
                <div className="relative">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t(UI_EN.search)}
                    className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all" />
                  {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><X size={14} /></button>}
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                  <Dropdown value={stateF}    onChange={setStateF}    options={states}    placeholder={t(UI_EN.allStates)} />
                  <Dropdown value={districtF} onChange={setDistrictF} options={districts} placeholder={t(UI_EN.allDistricts)} />
                  <Dropdown value={marketF}   onChange={setMarketF}   options={markets}   placeholder={t(UI_EN.allMarkets)} />
                  {(stateF || districtF || marketF || search) && (
                    <button onClick={() => { setStateF(""); setDistrictF(""); setMarketF(""); setSearch(""); }}
                      className="flex items-center gap-1 px-3 py-2 rounded-xl border border-red-200 bg-red-50 text-red-600 text-xs font-bold hover:bg-red-100 transition-colors">
                      <X size={12} /> Clear
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-400">{filteredRecords.length.toLocaleString("en-IN")} {t(UI_EN.records)}</p>
              </div>
              {filteredRecords.length > 0 ? (
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-green-700 text-white">
                          {[t(UI_EN.crop), t(UI_EN.variety), t(UI_EN.market), t(UI_EN.state), t(UI_EN.minPrice), t(UI_EN.maxPrice), t(UI_EN.modalPrice), t(UI_EN.arrivalDate)].map((h) => (
                            <th key={h} className="px-4 py-3 text-left font-bold text-xs whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRecords.slice(0, 200).map((r, i) => {
                          const mspCrop = MSP_DATA.find((m) => r.commodity.toLowerCase().includes(m.crop.split(" ")[0].toLowerCase()));
                          const aboveMsp = mspCrop ? r.modal_price > mspCrop.msp : null;
                          return (
                            <tr key={i} className={`border-b border-gray-50 hover:bg-green-50/40 transition-colors ${i % 2 === 0 ? "bg-white" : "bg-gray-50/30"}`}>
                              <td className="px-4 py-3 font-bold text-gray-900 whitespace-nowrap">
                                {r.commodity}
                                {aboveMsp !== null && <span className={`ml-1.5 text-xs ${aboveMsp ? "text-green-500" : "text-red-400"}`}>{aboveMsp ? "↑" : "↓"}</span>}
                              </td>
                              <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">{r.variety || "—"}</td>
                              <td className="px-4 py-3 text-gray-700 whitespace-nowrap text-xs">{r.market}</td>
                              <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">{r.state}</td>
                              <td className="px-4 py-3 text-blue-600 font-semibold whitespace-nowrap text-xs">₹{fmt(r.min_price)}</td>
                              <td className="px-4 py-3 text-orange-600 font-semibold whitespace-nowrap text-xs">₹{fmt(r.max_price)}</td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span className={`font-black text-sm ${aboveMsp === true ? "text-green-700" : aboveMsp === false ? "text-red-600" : "text-gray-900"}`}>
                                  ₹{fmt(r.modal_price)}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-gray-400 whitespace-nowrap text-xs">{r.arrival_date || "—"}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  {filteredRecords.length > 200 && (
                    <div className="px-4 py-3 bg-gray-50 border-t text-xs text-gray-500 text-center">
                      Showing 200 of {filteredRecords.length.toLocaleString("en-IN")} {t(UI_EN.records)}. Use filters to narrow down.
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-16 text-gray-400">
                  <Search size={32} className="mx-auto mb-3 opacity-40" />
                  <p className="font-semibold">{t(UI_EN.noData)}</p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default MarketPage;
