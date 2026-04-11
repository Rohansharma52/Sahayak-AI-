import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import type { AppLang } from "@/pages/Index";
import { useTranslation } from "@/hooks/useTranslation";

interface CropCalendarPageProps { lang: AppLang; }

// Current month (0 = Jan)
const NOW = new Date().getMonth();

const MONTH_LABELS = [
  { en:"Jan", hi:"जन" }, { en:"Feb", hi:"फर" }, { en:"Mar", hi:"मार" },
  { en:"Apr", hi:"अप्र" }, { en:"May", hi:"मई" }, { en:"Jun", hi:"जून" },
  { en:"Jul", hi:"जुल" }, { en:"Aug", hi:"अग" }, { en:"Sep", hi:"सित" },
  { en:"Oct", hi:"अक्त" }, { en:"Nov", hi:"नव" }, { en:"Dec", hi:"दिस" },
];

interface Crop {
  emoji: string;
  name: string;
  nameHi: string;
  sow: number[];      // months to sow
  harvest: number[];  // months to harvest
  water: 1 | 2 | 3;  // 1=low 2=medium 3=high
  tip: string;
  tipHi: string;
  color: string;      // tailwind bg color for card accent
}

const CROPS: Crop[] = [
  {
    emoji: "🌾", name: "Wheat", nameHi: "गेहूं",
    sow: [10, 11], harvest: [3, 4],
    water: 2,
    tip: "Sow in October–November. Harvest in March–April.",
    tipHi: "अक्टूबर–नवंबर में बोएं। मार्च–अप्रैल में काटें।",
    color: "#fef9c3",
  },
  {
    emoji: "🌾", name: "Rice", nameHi: "धान",
    sow: [5, 6], harvest: [9, 10],
    water: 3,
    tip: "Sow in June. Needs lots of water. Harvest in October.",
    tipHi: "जून में बोएं। खूब पानी चाहिए। अक्टूबर में काटें।",
    color: "#dcfce7",
  },
  {
    emoji: "🌽", name: "Maize", nameHi: "मक्का",
    sow: [5, 6], harvest: [8, 9],
    water: 2,
    tip: "Sow in May–June. Harvest in August–September.",
    tipHi: "मई–जून में बोएं। अगस्त–सितंबर में काटें।",
    color: "#fef3c7",
  },
  {
    emoji: "🎋", name: "Sugarcane", nameHi: "गन्ना",
    sow: [1, 2], harvest: [11, 0],
    water: 3,
    tip: "Plant in February. Takes 10–12 months to grow.",
    tipHi: "फरवरी में लगाएं। 10–12 महीने में तैयार होता है।",
    color: "#d1fae5",
  },
  {
    emoji: "🌿", name: "Cotton", nameHi: "कपास",
    sow: [4, 5], harvest: [9, 10, 11],
    water: 2,
    tip: "Sow in April–May. Pick cotton in October–November.",
    tipHi: "अप्रैल–मई में बोएं। अक्टूबर–नवंबर में चुनें।",
    color: "#f0fdf4",
  },
  {
    emoji: "🌻", name: "Mustard", nameHi: "सरसों",
    sow: [9, 10], harvest: [1, 2],
    water: 1,
    tip: "Sow in October. Needs less water. Harvest in February.",
    tipHi: "अक्टूबर में बोएं। कम पानी चाहिए। फरवरी में काटें।",
    color: "#fefce8",
  },
  {
    emoji: "🫘", name: "Soybean", nameHi: "सोयाबीन",
    sow: [5, 6], harvest: [9, 10],
    water: 2,
    tip: "Sow in June with first rain. Harvest in October.",
    tipHi: "पहली बारिश में जून में बोएं। अक्टूबर में काटें।",
    color: "#ecfdf5",
  },
  {
    emoji: "🧅", name: "Onion", nameHi: "प्याज",
    sow: [10, 11], harvest: [2, 3, 4],
    water: 2,
    tip: "Sow in October–November. Harvest in March–April.",
    tipHi: "अक्टूबर–नवंबर में बोएं। मार्च–अप्रैल में निकालें।",
    color: "#fdf4ff",
  },
  {
    emoji: "🍅", name: "Tomato", nameHi: "टमाटर",
    sow: [5, 6, 10, 11], harvest: [8, 9, 1, 2],
    water: 3,
    tip: "Can grow twice a year. Needs regular watering.",
    tipHi: "साल में दो बार उगाएं। नियमित पानी दें।",
    color: "#fff1f2",
  },
  {
    emoji: "🫘", name: "Chickpea", nameHi: "चना",
    sow: [10, 11], harvest: [2, 3],
    water: 1,
    tip: "Sow in October–November. Very less water needed.",
    tipHi: "अक्टूबर–नवंबर में बोएं। बहुत कम पानी चाहिए।",
    color: "#fffbeb",
  },
];

const WATER_EMOJI = ["", "💧", "💧💧", "💧💧💧"];
const WATER_LABEL = ["", "कम पानी", "मध्यम पानी", "ज़्यादा पानी"];
const WATER_LABEL_EN = ["", "Low water", "Medium water", "High water"];

function MonthDot({ month, crop, isHindi }: { month: number; crop: Crop; isHindi: boolean }) {
  const isSow = crop.sow.includes(month);
  const isHarvest = crop.harvest.includes(month);
  const isNow = month === NOW;

  let bg = "#e5e7eb"; // gray - idle
  let label = "";
  let emoji = "";

  if (isSow) { bg = "#16a34a"; label = isHindi ? "बोएं" : "Sow"; emoji = "🌱"; }
  else if (isHarvest) { bg = "#f59e0b"; label = isHindi ? "काटें" : "Harvest"; emoji = "🌾"; }

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center text-base font-black transition-all"
        style={{
          background: bg,
          boxShadow: isNow ? "0 0 0 3px #3b82f6, 0 0 0 5px #bfdbfe" : "none",
          transform: (isSow || isHarvest) ? "scale(1.1)" : "scale(1)",
        }}
      >
        {isSow || isHarvest ? emoji : ""}
      </div>
      <span className="text-[9px] font-bold text-gray-400">
        {isHindi ? MONTH_LABELS[month].hi : MONTH_LABELS[month].en}
      </span>
      {(isSow || isHarvest) && (
        <span className="text-[8px] font-black" style={{ color: isSow ? "#16a34a" : "#f59e0b" }}>
          {label}
        </span>
      )}
    </div>
  );
}

export default function CropCalendarPage({ lang }: CropCalendarPageProps) {
  const { t } = useTranslation(lang);
  const [open, setOpen] = useState<string | null>(null);
  const isHindi = ["hi", "mr", "pa", "bn", "te", "ta", "kn"].includes(lang);

  // Which crops are relevant this month
  const thisMonthCrops = CROPS.filter(c => c.sow.includes(NOW) || c.harvest.includes(NOW));

  return (
    <div className="min-h-screen p-4 md:p-6" style={{ background: "#f4f7f4" }}>
      <div className="max-w-2xl mx-auto space-y-5">

        {/* Header */}
        <div className="rounded-3xl p-5 text-white" style={{ background: "linear-gradient(135deg,#1f6b2a,#15803d)" }}>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-4xl">📅</span>
            <div>
              <h1 className="text-xl font-black">{isHindi ? "फसल कैलेंडर" : "Crop Calendar"}</h1>
              <p className="text-green-100 text-sm">{isHindi ? "कब बोएं, कब काटें — आसान गाइड" : "When to sow, when to harvest"}</p>
            </div>
          </div>
          {/* Legend */}
          <div className="flex gap-4 flex-wrap">
            <div className="flex items-center gap-2 bg-white/20 rounded-full px-3 py-1">
              <span>🌱</span><span className="text-xs font-black">{isHindi ? "बुवाई का समय" : "Sowing time"}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 rounded-full px-3 py-1">
              <span>🌾</span><span className="text-xs font-black">{isHindi ? "कटाई का समय" : "Harvest time"}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 rounded-full px-3 py-1">
              <span className="w-3 h-3 rounded-full bg-blue-400 ring-2 ring-white inline-block"/>
              <span className="text-xs font-black">{isHindi ? "आज का महीना" : "Current month"}</span>
            </div>
          </div>
        </div>

        {/* This month alert */}
        {thisMonthCrops.length > 0 && (
          <div className="rounded-3xl p-4" style={{ background: "#fffbeb", border: "2px solid #fde68a" }}>
            <p className="font-black text-amber-800 mb-2 flex items-center gap-2">
              ⏰ {isHindi ? `इस महीने (${MONTH_LABELS[NOW].hi}) करें:` : `This month (${MONTH_LABELS[NOW].en}):`}
            </p>
            <div className="flex flex-wrap gap-2">
              {thisMonthCrops.map(c => (
                <div key={c.name} className="flex items-center gap-1.5 bg-white rounded-2xl px-3 py-2 shadow-sm">
                  <span className="text-xl">{c.emoji}</span>
                  <div>
                    <p className="text-xs font-black text-gray-800">{isHindi ? c.nameHi : c.name}</p>
                    <p className="text-[10px] font-bold" style={{ color: c.sow.includes(NOW) ? "#16a34a" : "#f59e0b" }}>
                      {c.sow.includes(NOW) ? (isHindi ? "🌱 बोएं" : "🌱 Sow") : (isHindi ? "🌾 काटें" : "🌾 Harvest")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Crop cards */}
        <div className="space-y-3">
          {CROPS.map((crop) => (
            <motion.div key={crop.name} layout
              className="rounded-3xl overflow-hidden shadow-sm"
              style={{ background: "white", border: `2px solid ${open === crop.name ? "#16a34a" : "#f3f4f6"}` }}>

              {/* Card header — tap to expand */}
              <button className="w-full p-4 flex items-center gap-3 text-left"
                onClick={() => setOpen(open === crop.name ? null : crop.name)}>
                <span className="text-4xl">{crop.emoji}</span>
                <div className="flex-1">
                  <p className="font-black text-gray-900 text-base">{isHindi ? crop.nameHi : crop.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{WATER_EMOJI[crop.water]} {isHindi ? WATER_LABEL[crop.water] : WATER_LABEL_EN[crop.water]}</p>
                </div>
                {/* Quick status badge */}
                {crop.sow.includes(NOW) && (
                  <span className="px-3 py-1 rounded-full text-xs font-black text-white" style={{ background: "#16a34a" }}>
                    🌱 {isHindi ? "अभी बोएं!" : "Sow Now!"}
                  </span>
                )}
                {crop.harvest.includes(NOW) && (
                  <span className="px-3 py-1 rounded-full text-xs font-black text-white" style={{ background: "#f59e0b" }}>
                    🌾 {isHindi ? "अभी काटें!" : "Harvest!"}
                  </span>
                )}
                <ChevronDown size={18} className={`text-gray-400 transition-transform shrink-0 ${open === crop.name ? "rotate-180" : ""}`} />
              </button>

              {/* Expanded: full year calendar */}
              <AnimatePresence>
                {open === crop.name && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden">
                    <div className="px-4 pb-5 space-y-4" style={{ borderTop: "1px solid #f3f4f6" }}>

                      {/* 12-month visual */}
                      <div className="pt-4">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
                          {isHindi ? "पूरे साल का कैलेंडर" : "Full Year Calendar"}
                        </p>
                        <div className="grid grid-cols-6 gap-2">
                          {Array.from({ length: 12 }, (_, i) => (
                            <MonthDot key={i} month={i} crop={crop} isHindi={isHindi} />
                          ))}
                        </div>
                      </div>

                      {/* Tip box */}
                      <div className="rounded-2xl p-4" style={{ background: crop.color }}>
                        <p className="text-xs font-black text-gray-500 mb-1">💡 {isHindi ? "किसान सुझाव" : "Farmer Tip"}</p>
                        <p className="text-sm font-bold text-gray-800">{isHindi ? crop.tipHi : crop.tip}</p>
                      </div>

                      {/* Sow & Harvest months summary */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-2xl p-3 text-center" style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                          <p className="text-2xl mb-1">🌱</p>
                          <p className="text-xs font-black text-green-700">{isHindi ? "बुवाई" : "Sowing"}</p>
                          <p className="text-xs font-bold text-gray-600 mt-1">
                            {crop.sow.map(m => isHindi ? MONTH_LABELS[m].hi : MONTH_LABELS[m].en).join(", ")}
                          </p>
                        </div>
                        <div className="rounded-2xl p-3 text-center" style={{ background: "#fffbeb", border: "1px solid #fde68a" }}>
                          <p className="text-2xl mb-1">🌾</p>
                          <p className="text-xs font-black text-amber-700">{isHindi ? "कटाई" : "Harvest"}</p>
                          <p className="text-xs font-bold text-gray-600 mt-1">
                            {crop.harvest.map(m => isHindi ? MONTH_LABELS[m].hi : MONTH_LABELS[m].en).join(", ")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        <p className="text-center text-xs text-gray-400 pb-4">
          {isHindi ? "🔵 नीला घेरा = आज का महीना" : "🔵 Blue ring = current month"}
        </p>
      </div>
    </div>
  );
}
