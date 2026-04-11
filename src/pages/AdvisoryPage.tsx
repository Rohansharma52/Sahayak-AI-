import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Volume2, VolumeX, RefreshCw, Search } from "lucide-react";
import type { AppLang } from "./Index";
import { useTranslation } from "@/hooks/useTranslation";
import { INDIA_STATES, ALL_STATES } from "@/data/indiaData";

const LANG_NAMES: Record<AppLang,string> = { hi:"Hindi",en:"English",ta:"Tamil",mr:"Marathi",te:"Telugu",kn:"Kannada",bn:"Bengali",pa:"Punjabi" };

async function getAdvice(inputs: FarmerInputs, lang: AppLang): Promise<string[]> {
  const keysRaw = import.meta.env.VITE_GEMINI_API_KEY as string ?? "";
  const keys = keysRaw.split(",").map((k:string)=>k.trim()).filter((k:string)=>k&&!k.includes("XXXX"));
  if (!keys.length) throw new Error("API key not set");
  const L = LANG_NAMES[lang];
  const prompt = `You are an expert Indian agricultural advisor. Give genuine, practical advice to this farmer:
- Crop: ${inputs.crop}
- Problem/Need: ${inputs.issue}
- State: ${inputs.state}, District: ${inputs.district}
- Land size: ${inputs.landAcres} acres
- Soil type: ${inputs.soilType}
- Irrigation: ${inputs.irrigation}
- Season: ${inputs.season}
- Crop age: ${inputs.cropAge} days since sowing

Give exactly 5 specific, actionable tips in very simple ${L} language for an uneducated village farmer.
Return ONLY a JSON array of 5 strings. No markdown. No numbering inside strings.`;

  for (const key of keys) {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${key}`,
      { method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ contents:[{parts:[{text:prompt}]}], generationConfig:{maxOutputTokens:1000,temperature:0.3} }) }
    );
    if (res.status===429) continue;
    if (!res.ok) continue;
    const data = await res.json();
    const raw: string = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()??"";
    const cleaned = raw.replace(/```json\s*/gi,"").replace(/```\s*/g,"").trim();
    const s=cleaned.indexOf("["), e=cleaned.lastIndexOf("]");
    if (s!==-1&&e>s) { try { return JSON.parse(cleaned.slice(s,e+1)) as string[]; } catch {} }
    return raw.split("\n").filter(l=>l.trim()).slice(0,5);
  }
  throw new Error("Quota exceeded. Try again in 1 minute.");
}

interface FarmerInputs { crop:string; issue:string; state:string; district:string; landAcres:string; soilType:string; irrigation:string; season:string; cropAge:string; }
interface AdvisoryPageProps { lang: AppLang; }

const ALL_CROPS = [
  {emoji:"🌾",en:"Wheat",hi:"गेहूं"},{emoji:"🌾",en:"Rice/Paddy",hi:"धान/चावल"},
  {emoji:"🌽",en:"Maize",hi:"मक्का"},{emoji:"🎋",en:"Sugarcane",hi:"गन्ना"},
  {emoji:"🌿",en:"Cotton",hi:"कपास"},{emoji:"🌻",en:"Mustard",hi:"सरसों"},
  {emoji:"🫘",en:"Soybean",hi:"सोयाबीन"},{emoji:"🫘",en:"Chickpea/Gram",hi:"चना"},
  {emoji:"🍅",en:"Tomato",hi:"टमाटर"},{emoji:"🧅",en:"Onion",hi:"प्याज"},
  {emoji:"🥔",en:"Potato",hi:"आलू"},{emoji:"🌶️",en:"Chilli",hi:"मिर्च"},
  {emoji:"🥬",en:"Cabbage",hi:"पत्तागोभी"},{emoji:"🥦",en:"Cauliflower",hi:"फूलगोभी"},
  {emoji:"🍆",en:"Brinjal",hi:"बैंगन"},{emoji:"🥒",en:"Cucumber",hi:"खीरा"},
  {emoji:"🎃",en:"Pumpkin",hi:"कद्दू"},{emoji:"🫑",en:"Capsicum",hi:"शिमला मिर्च"},
  {emoji:"🌱",en:"Spinach",hi:"पालक"},{emoji:"🌿",en:"Coriander",hi:"धनिया"},
  {emoji:"🧄",en:"Garlic",hi:"लहसुन"},{emoji:"🫚",en:"Groundnut",hi:"मूंगफली"},
  {emoji:"🌻",en:"Sunflower",hi:"सूरजमुखी"},{emoji:"🌿",en:"Turmeric",hi:"हल्दी"},
  {emoji:"🌿",en:"Ginger",hi:"अदरक"},{emoji:"🫘",en:"Lentil/Masoor",hi:"मसूर"},
  {emoji:"🫘",en:"Moong Dal",hi:"मूंग दाल"},{emoji:"🫘",en:"Urad Dal",hi:"उड़द दाल"},
  {emoji:"🫘",en:"Arhar/Tur Dal",hi:"अरहर/तुअर दाल"},{emoji:"🌾",en:"Jowar",hi:"ज्वार"},
  {emoji:"🌾",en:"Bajra",hi:"बाजरा"},{emoji:"🌾",en:"Ragi",hi:"रागी"},
  {emoji:"🍌",en:"Banana",hi:"केला"},{emoji:"🥭",en:"Mango",hi:"आम"},
  {emoji:"🍋",en:"Lemon/Citrus",hi:"नींबू"},{emoji:"🍇",en:"Grapes",hi:"अंगूर"},
  {emoji:"🍎",en:"Apple",hi:"सेब"},{emoji:"🍈",en:"Guava",hi:"अमरूद"},
  {emoji:"🌿",en:"Jute",hi:"जूट"},{emoji:"🌿",en:"Tobacco",hi:"तंबाकू"},
  {emoji:"🌿",en:"Tea",hi:"चाय"},{emoji:"🌿",en:"Coffee",hi:"कॉफी"},
  {emoji:"🥥",en:"Coconut",hi:"नारियल"},{emoji:"🌴",en:"Arecanut",hi:"सुपारी"},
  {emoji:"🌿",en:"Rubber",hi:"रबर"},{emoji:"🌿",en:"Cardamom",hi:"इलायची"},
];

const ISSUES = [
  {emoji:"✅",en:"General farming advice",hi:"सामान्य खेती सलाह"},
  {emoji:"🟡",en:"Yellow/pale leaves",hi:"पत्तियां पीली हो रही हैं"},
  {emoji:"🐛",en:"Pest/insect attack",hi:"कीड़े-मकोड़े लग रहे हैं"},
  {emoji:"🍄",en:"Fungal/disease infection",hi:"फफूंद/बीमारी लग गई है"},
  {emoji:"📉",en:"Low yield/production",hi:"उपज कम हो रही है"},
  {emoji:"💧",en:"Waterlogging/excess rain",hi:"जलभराव/ज़्यादा बारिश"},
  {emoji:"🌵",en:"Drought/dry conditions",hi:"सूखा/मिट्टी सूखी है"},
  {emoji:"🌱",en:"Sowing/planting tips",hi:"बुवाई/रोपाई की सलाह"},
  {emoji:"💊",en:"Fertilizer/nutrient advice",hi:"खाद/उर्वरक की सलाह"},
  {emoji:"🧴",en:"Pesticide/spray advice",hi:"कीटनाशक/छिड़काव की सलाह"},
  {emoji:"💰",en:"How to get better price",hi:"अच्छे दाम कैसे मिलें"},
  {emoji:"🌿",en:"Weed control",hi:"खरपतवार नियंत्रण"},
  {emoji:"🌡️",en:"Heat stress/scorching",hi:"गर्मी से फसल झुलस रही है"},
  {emoji:"❄️",en:"Cold/frost damage",hi:"ठंड/पाले से नुकसान"},
  {emoji:"🌾",en:"Harvest timing advice",hi:"कटाई का सही समय"},
  {emoji:"💾",en:"Storage after harvest",hi:"कटाई के बाद भंडारण"},
];

const SOILS = [
  {en:"Loamy",hi:"दोमट मिट्टी",emoji:"🟤"},
  {en:"Black/Cotton soil",hi:"काली मिट्टी",emoji:"⚫"},
  {en:"Clay",hi:"चिकनी मिट्टी",emoji:"🔵"},
  {en:"Sandy",hi:"बलुई मिट्टी",emoji:"🟡"},
  {en:"Red soil",hi:"लाल मिट्टी",emoji:"🔴"},
  {en:"Alluvial",hi:"जलोढ़ मिट्टी",emoji:"🟫"},
];

const IRRIGATIONS = [
  {en:"Canal irrigation",hi:"नहर से सिंचाई",emoji:"🌊"},
  {en:"Borewell/Tubewell",hi:"बोरवेल/ट्यूबवेल",emoji:"⛽"},
  {en:"Drip irrigation",hi:"ड्रिप सिंचाई",emoji:"💧"},
  {en:"Sprinkler",hi:"स्प्रिंकलर",emoji:"🚿"},
  {en:"Rainwater only",hi:"केवल बारिश",emoji:"🌧️"},
  {en:"Pond/lake",hi:"तालाब/झील",emoji:"🏞️"},
];

const SEASONS = [
  {en:"Kharif (Jun-Oct)",hi:"खरीफ (जून-अक्टूबर)"},
  {en:"Rabi (Nov-Apr)",hi:"रबी (नवंबर-अप्रैल)"},
  {en:"Zaid (Mar-Jun)",hi:"जायद (मार्च-जून)"},
  {en:"Year-round",hi:"साल भर"},
];

const CARD_EMOJIS = ["💡","🌿","⚡","🛡️","🎯"];
type Step = "crop"|"issue"|"details"|"result";

export default function AdvisoryPage({ lang }: AdvisoryPageProps) {
  const { t } = useTranslation(lang);
  const hi = ["hi","mr","pa","bn","te","ta","kn"].includes(lang);
  const [step, setStep] = useState<Step>("crop");
  const [inputs, setInputs] = useState<FarmerInputs>({ crop:"",issue:"",state:"",district:"",landAcres:"2",soilType:"Loamy",irrigation:"Borewell/Tubewell",season:"Kharif (Jun-Oct)",cropAge:"30" });
  const [tips, setTips] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [speaking, setSpeaking] = useState(false);
  const [cropSearch, setCropSearch] = useState("");
  const [stateSearch, setStateSearch] = useState("");

  const set = (k: keyof FarmerInputs) => (v: string) => setInputs(p=>({...p,[k]:v}));

  const fetchAdvice = async (finalInputs: FarmerInputs) => {
    setLoading(true); setError(""); setTips([]); setStep("result");
    try { setTips(await getAdvice(finalInputs, lang)); }
    catch(e:any) { setError(e.message||"Something went wrong"); }
    setLoading(false);
  };

  const speak = () => {
    if (speaking) { window.speechSynthesis.cancel(); setSpeaking(false); return; }
    const u = new SpeechSynthesisUtterance(tips.join(". "));
    const m: Record<string,string> = {hi:"hi-IN",en:"en-IN",ta:"ta-IN",mr:"mr-IN",te:"te-IN",kn:"kn-IN",bn:"bn-IN",pa:"pa-IN"};
    u.lang = m[lang]??"hi-IN"; u.rate=0.88;
    u.onend=()=>setSpeaking(false);
    window.speechSynthesis.speak(u); setSpeaking(true);
  };

  const reset = () => { setStep("crop"); setInputs({crop:"",issue:"",state:"",district:"",landAcres:"2",soilType:"Loamy",irrigation:"Borewell/Tubewell",season:"Kharif (Jun-Oct)",cropAge:"30"}); setTips([]); setError(""); window.speechSynthesis.cancel(); setSpeaking(false); setCropSearch(""); setStateSearch(""); };

  const filteredCrops = ALL_CROPS.filter(c => cropSearch ? (c.en.toLowerCase().includes(cropSearch.toLowerCase()) || c.hi.includes(cropSearch)) : true);
  const filteredStates = ALL_STATES.filter(s => stateSearch ? s.toLowerCase().includes(stateSearch.toLowerCase()) : true);
  const districts = inputs.state ? (INDIA_STATES[inputs.state]||[]) : [];

  const Header = ({ title, sub, onBack }: { title:string; sub:string; onBack?:()=>void }) => (
    <div className="rounded-3xl p-5 text-white" style={{background:"linear-gradient(135deg,#1f6b2a,#15803d)"}}>
      {onBack && <button onClick={onBack} className="text-green-200 text-sm mb-2 block">← {hi?"वापस":"Back"}</button>}
      <h1 className="text-xl font-black">{title}</h1>
      <p className="text-green-100 text-sm">{sub}</p>
    </div>
  );

  // STEP 1: Crop
  if (step==="crop") return (
    <div className="min-h-screen p-4" style={{background:"#f4f7f4"}}>
      <div className="max-w-lg mx-auto space-y-4">
        <Header title={`🌾 ${hi?"खेती सलाह":"Farming Advisory"}`} sub={hi?"AI से पाएं अपनी फसल की सलाह":"Get AI advice for your crop"} />
        <div className="bg-white rounded-3xl p-4 shadow-sm">
          <p className="font-black text-gray-800 mb-3">{hi?"👇 अपनी फसल चुनें:":"👇 Select your crop:"}</p>
          <div className="relative mb-3">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
            <input value={cropSearch} onChange={e=>setCropSearch(e.target.value)} placeholder={hi?"फसल खोजें...":"Search crop..."} className="w-full pl-9 pr-4 py-2.5 rounded-2xl border-2 border-gray-200 text-sm font-bold outline-none focus:border-green-400"/>
          </div>
          <div className="grid grid-cols-3 gap-2 max-h-96 overflow-y-auto">
            {filteredCrops.map(c=>(
              <button key={c.en} onClick={()=>{set("crop")(c.en);setStep("issue");}}
                className="flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all active:scale-95 hover:border-green-400 hover:bg-green-50"
                style={{borderColor:"#e5e7eb"}}>
                <span className="text-2xl">{c.emoji}</span>
                <span className="text-[11px] font-black text-gray-800 text-center leading-tight">{t(c.en)}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // STEP 2: Issue
  if (step==="issue") return (
    <div className="min-h-screen p-4" style={{background:"#f4f7f4"}}>
      <div className="max-w-lg mx-auto space-y-4">
        <Header title={`${ALL_CROPS.find(c=>c.en===inputs.crop)?.emoji} ${hi?ALL_CROPS.find(c=>c.en===inputs.crop)?.hi:inputs.crop}`} sub={hi?"क्या समस्या है?":"What is the problem?"} onBack={()=>setStep("crop")} />
        <div className="bg-white rounded-3xl p-4 shadow-sm space-y-2">
          <p className="font-black text-gray-800 mb-2">{hi?"👇 समस्या चुनें:":"👇 Select your issue:"}</p>
          {ISSUES.map(iss=>(
            <button key={iss.en} onClick={()=>{set("issue")(iss.en);setStep("details");}}
              className="w-full flex items-center gap-3 p-3.5 rounded-2xl border-2 text-left transition-all active:scale-[0.98] hover:border-green-400 hover:bg-green-50"
              style={{borderColor:"#e5e7eb"}}>
              <span className="text-2xl">{iss.emoji}</span>
              <span className="font-black text-gray-800 text-sm">{t(iss.en)}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // STEP 3: Details (state, district, land, soil, irrigation, season, crop age)
  if (step==="details") return (
    <div className="min-h-screen p-4" style={{background:"#f4f7f4"}}>
      <div className="max-w-lg mx-auto space-y-4">
        <Header title={hi?"📋 खेत की जानकारी":"📋 Farm Details"} sub={hi?"सटीक सलाह के लिए जानकारी भरें":"Fill details for accurate advice"} onBack={()=>setStep("issue")} />
        <div className="bg-white rounded-3xl p-4 shadow-sm space-y-4">

          {/* State */}
          <div>
            <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2">{hi?"📍 राज्य चुनें":"📍 Select State"}</p>
            <div className="relative mb-2">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
              <input value={stateSearch} onChange={e=>setStateSearch(e.target.value)} placeholder={hi?"राज्य खोजें...":"Search state..."} className="w-full pl-8 pr-4 py-2 rounded-xl border-2 border-gray-200 text-sm font-bold outline-none focus:border-green-400"/>
            </div>
            <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto">
              {filteredStates.map(s=>(
                <button key={s} onClick={()=>{set("state")(s);set("district")("");}}
                  className="p-2.5 rounded-xl border-2 text-xs font-black text-left transition-all"
                  style={{borderColor:inputs.state===s?"#16a34a":"#e5e7eb",background:inputs.state===s?"#f0fdf4":"white",color:inputs.state===s?"#16a34a":"#374151"}}>
                  {t(s)}
                </button>
              ))}
            </div>
          </div>

          {/* District */}
          {inputs.state && (
            <div>
              <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2">{hi?"🏘️ जिला चुनें":"🏘️ Select District"}</p>
              <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto">
                {districts.map(d=>(
                  <button key={d} onClick={()=>set("district")(d)}
                    className="p-2.5 rounded-xl border-2 text-xs font-black text-left transition-all"
                    style={{borderColor:inputs.district===d?"#16a34a":"#e5e7eb",background:inputs.district===d?"#f0fdf4":"white",color:inputs.district===d?"#16a34a":"#374151"}}>
                    {t(d)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Land + Crop Age */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1">{hi?"📐 जमीन (एकड़)":"📐 Land (Acres)"}</p>
              <input type="number" min="0.5" max="500" step="0.5" value={inputs.landAcres} onChange={e=>set("landAcres")(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 text-sm font-bold outline-none focus:border-green-400"/>
            </div>
            <div>
              <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1">{hi?"📅 फसल की उम्र (दिन)":"📅 Crop Age (days)"}</p>
              <input type="number" min="0" max="365" value={inputs.cropAge} onChange={e=>set("cropAge")(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 text-sm font-bold outline-none focus:border-green-400"/>
            </div>
          </div>

          {/* Soil */}
          <div>
            <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2">{hi?"🌍 मिट्टी का प्रकार":"🌍 Soil Type"}</p>
            <div className="grid grid-cols-3 gap-2">
              {SOILS.map(s=>(
                <button key={s.en} onClick={()=>set("soilType")(s.en)}
                  className="flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 text-center transition-all"
                  style={{borderColor:inputs.soilType===s.en?"#16a34a":"#e5e7eb",background:inputs.soilType===s.en?"#f0fdf4":"white"}}>
                  <span className="text-xl">{s.emoji}</span>
                  <span className="text-[10px] font-black text-gray-700 leading-tight">{hi?s.hi:s.en}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Irrigation */}
          <div>
            <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2">{hi?"💧 सिंचाई का तरीका":"💧 Irrigation Method"}</p>
            <div className="grid grid-cols-3 gap-2">
              {IRRIGATIONS.map(ir=>(
                <button key={ir.en} onClick={()=>set("irrigation")(ir.en)}
                  className="flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 text-center transition-all"
                  style={{borderColor:inputs.irrigation===ir.en?"#16a34a":"#e5e7eb",background:inputs.irrigation===ir.en?"#f0fdf4":"white"}}>
                  <span className="text-xl">{ir.emoji}</span>
                  <span className="text-[10px] font-black text-gray-700 leading-tight">{hi?ir.hi:ir.en}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Season */}
          <div>
            <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2">{hi?"🌤️ मौसम/सीजन":"🌤️ Season"}</p>
            <div className="grid grid-cols-2 gap-2">
              {SEASONS.map(s=>(
                <button key={s.en} onClick={()=>set("season")(s.en)}
                  className="p-3 rounded-xl border-2 text-sm font-black transition-all"
                  style={{borderColor:inputs.season===s.en?"#16a34a":"#e5e7eb",background:inputs.season===s.en?"#f0fdf4":"white",color:inputs.season===s.en?"#16a34a":"#374151"}}>
                  {hi?s.hi:s.en}
                </button>
              ))}
            </div>
          </div>

          <button onClick={()=>fetchAdvice(inputs)} disabled={!inputs.state||!inputs.district}
            className="w-full py-4 rounded-2xl text-white font-black text-base shadow-lg disabled:opacity-50 active:scale-95 transition-all"
            style={{background:"linear-gradient(135deg,#16a34a,#15803d)"}}>
            {hi?"🌾 सलाह लें":"🌾 Get Advice"}
          </button>
        </div>
      </div>
    </div>
  );

  // STEP 4: Result
  return (
    <div className="min-h-screen p-4" style={{background:"#f4f7f4"}}>
      <div className="max-w-lg mx-auto space-y-4">
        <div className="rounded-3xl p-5 text-white" style={{background:"linear-gradient(135deg,#1f6b2a,#15803d)"}}>
          <h1 className="text-xl font-black">🌾 {hi?"AI की सलाह":"AI Advisory"}</h1>
          <p className="text-green-100 text-xs mt-1">{ALL_CROPS.find(c=>c.en===inputs.crop)?.emoji} {inputs.crop} • {ISSUES.find(i=>i.en===inputs.issue)?.emoji} {hi?ISSUES.find(i=>i.en===inputs.issue)?.hi:inputs.issue}</p>
          <p className="text-green-100 text-xs">📍 {inputs.district}, {inputs.state} • {inputs.landAcres} {hi?"एकड़":"acres"}</p>
        </div>

        {loading && (
          <div className="bg-white rounded-3xl p-10 flex flex-col items-center gap-4 shadow-sm">
            <Loader2 size={40} className="animate-spin text-green-600"/>
            <p className="font-black text-gray-600 text-center">{hi?"AI आपकी फसल के लिए सलाह तैयार कर रहा है...":"AI is preparing advice for your crop..."}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 rounded-3xl p-5 border-2 border-red-200 text-center space-y-3">
            <p className="text-3xl">😔</p>
            <p className="font-black text-red-700 text-sm">{error}</p>
            <button onClick={()=>fetchAdvice(inputs)} className="px-6 py-3 rounded-2xl text-white font-black text-sm" style={{background:"#dc2626"}}>
              🔄 {hi?"दोबारा कोशिश करें":"Try Again"}
            </button>
          </div>
        )}

        {tips.length>0 && (
          <AnimatePresence>
            <div className="space-y-3">
              <div className="flex justify-end">
                <button onClick={speak} className="flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-black text-white"
                  style={{background:speaking?"#dc2626":"#16a34a"}}>
                  {speaking?<><VolumeX size={15}/>{hi?"रोकें":"Stop"}</>:<><Volume2 size={15}/>{hi?"सुनें":"Listen"}</>}
                </button>
              </div>
              {tips.map((tip,i)=>(
                <motion.div key={i} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:i*0.1}}
                  className="bg-white rounded-3xl p-5 shadow-sm flex gap-4 items-start">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0" style={{background:"#f0fdf4"}}>
                    {CARD_EMOJIS[i]??"✅"}
                  </div>
                  <div>
                    <p className="text-xs font-black text-green-600 uppercase tracking-widest mb-1">{hi?`सुझाव ${i+1}`:`Tip ${i+1}`}</p>
                    <p className="text-sm font-bold text-gray-800 leading-relaxed">{tip.replace(/^\d+\.\s*/,"")}</p>
                  </div>
                </motion.div>
              ))}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button onClick={()=>fetchAdvice(inputs)} className="py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2"
                  style={{background:"#f0fdf4",color:"#16a34a",border:"2px solid #bbf7d0"}}>
                  <RefreshCw size={15}/>{hi?"नई सलाह":"Refresh"}
                </button>
                <button onClick={reset} className="py-3 rounded-2xl font-black text-sm text-white flex items-center justify-center gap-2"
                  style={{background:"linear-gradient(135deg,#1f6b2a,#15803d)"}}>
                  🌾 {hi?"दूसरी फसल":"New Query"}
                </button>
              </div>
            </div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
