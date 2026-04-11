import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, Settings2, CheckCircle } from "lucide-react";
import type { AppLang } from "@/pages/Index";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "@/hooks/useTranslation";
import { LOCATIONS } from "@/services/weatherService";
import { fetchForecast, predictIrrigation, generateDailyTasks, type FarmSetup, type WeatherForecast, type DailyTask, type IrrigationAdvice } from "@/utils/farmPredictor";
import StateDistrictPicker from "@/components/StateDistrictPicker";
import { ALL_STATES, INDIA_STATES } from "@/data/indiaData";
import { Search } from "lucide-react";

type SoilType = "loamy" | "black" | "clay" | "sandy";
interface Props { lang: AppLang; }
interface FormState { crop: string; soilType: SoilType; sowDate: string; landAcres: number; location: string; state: string; district: string; }

const CROPS = [
  { en:"Wheat",hi:"\u0917\u0947\u0939\u0942\u0902",emoji:"" },{ en:"Rice",hi:"\u0927\u093E\u0928",emoji:"" },
  { en:"Maize",hi:"\u092E\u0915\u094D\u0915\u093E",emoji:"" },{ en:"Sugarcane",hi:"\u0917\u0928\u094D\u0928\u093E",emoji:"" },
  { en:"Cotton",hi:"\u0915\u092A\u093E\u0938",emoji:"" },{ en:"Mustard",hi:"\u0938\u0930\u0938\u094B\u0902",emoji:"" },
  { en:"Soybean",hi:"\u0938\u094B\u092F\u093E\u092C\u0940\u0928",emoji:"" },{ en:"Chickpea",hi:"\u091A\u0928\u093E",emoji:"" },
  { en:"Tomato",hi:"\u091F\u092E\u093E\u091F\u0930",emoji:"" },{ en:"Onion",hi:"\u092A\u094D\u092F\u093E\u091C",emoji:"" },
];
const SOILS: { en: SoilType; hi: string; emoji: string }[] = [
  { en:"loamy",hi:"\u0926\u094B\u092E\u091F \u092E\u093F\u091F\u094D\u091F\u0940",emoji:"" },{ en:"black",hi:"\u0915\u093E\u0932\u0940 \u092E\u093F\u091F\u094D\u091F\u0940",emoji:"" },
  { en:"clay",hi:"\u091A\u093F\u0915\u0928\u0940 \u092E\u093F\u091F\u094D\u091F\u0940",emoji:"" },{ en:"sandy",hi:"\u092C\u0932\u0941\u0908 \u092E\u093F\u091F\u094D\u091F\u0940",emoji:"" },
];
const URGENCY = {
  urgent:   { bg:"#fef2f2",border:"#fca5a5",icon:"",color:"#dc2626" },
  important:{ bg:"#fffbeb",border:"#fde68a",icon:"",color:"#d97706" },
  normal:   { bg:"#f0fdf4",border:"#bbf7d0",icon:"",color:"#16a34a" },
};
const TC: Record<string,string> = { irrigation:"#3b82f6",fertilizer:"#16a34a",spray:"#8b5cf6",harvest:"#f59e0b",sow:"#10b981",weather:"#ef4444",general:"#6b7280" };
const SK = "smart_farm_setup";
const IK = "last_irrigated_days";

export default function SmartFarmPage({ lang }: Props) {
  const { t } = useTranslation(lang);
  const { profile } = useAuth();
  const hi = ["hi","mr","pa","bn","te","ta","kn"].includes(lang);
  const [setup, setSetup] = useState<FarmSetup|null>(() => { try { return JSON.parse(localStorage.getItem(SK)||"null"); } catch { return null; } });
  const [lastIrr, setLastIrr] = useState(() => parseInt(localStorage.getItem(IK)||"3"));
  const [fc, setFc] = useState<WeatherForecast[]>([]);
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [irr, setIrr] = useState<IrrigationAdvice|null>(null);
  const [loading, setLoading] = useState(false);
  const [showSetup, setShowSetup] = useState(!setup);
  const [form, setForm] = useState<FormState>({
    crop: setup?.crop??"Wheat",
    soilType: (setup?.soilType??"loamy") as SoilType,
    sowDate: setup?.sowDate??new Date(Date.now()-30*86400000).toISOString().split("T")[0],
    landAcres: setup?.landAcres??(parseFloat(profile.landSize)||2),
    location: setup?.location??LOCATIONS[0].name,
    state: setup?.state??"Uttar Pradesh",
    district: setup?.district??"Meerut",
  });
  const [stateSearch, setStateSearch] = useState("");
  const districts = INDIA_STATES[form.state] ?? [];
  const sc = CROPS.find(c=>c.en===form.crop)??CROPS[0];
  const sl = LOCATIONS.find(l=>l.name===form.location)??LOCATIONS[0];

  const load = async (s: FarmSetup) => {
    setLoading(true);
    try { const f=await fetchForecast(s.lat,s.lon); setFc(f); setIrr(predictIrrigation(s,f,lastIrr)); setTasks(generateDailyTasks(s,f,lastIrr)); }
    catch(e){ console.error(e); }
    setLoading(false);
  };
  useEffect(()=>{ if(setup) load(setup); },[setup,lastIrr]);

  const save = () => {
    // Use LOCATIONS for lat/lon if available, else use state capital coords
    const locMatch = LOCATIONS.find(l=>l.name.toLowerCase()===form.district.toLowerCase());
    const lat = locMatch?.lat ?? 28.6;
    const lon = locMatch?.lon ?? 77.2;
    localStorage.setItem(SK,JSON.stringify(s)); setSetup(s); setShowSetup(false);
  };
  const markDone = () => { setLastIrr(0); localStorage.setItem(IK,"0"); };
  const days = setup ? Math.floor((Date.now()-new Date(setup.sowDate).getTime())/86400000) : 0;

  if (showSetup) return (
    <div className="min-h-screen p-4" style={{background:"#f4f7f4"}}>
      <div className="max-w-lg mx-auto space-y-4">
        <div className="rounded-3xl p-5 text-white" style={{background:"linear-gradient(135deg,#1f6b2a,#15803d)"}}>
          <h1 className="text-xl font-black"> {hi?"\u0905\u092A\u0928\u0940 \u0916\u0947\u0924\u0940 \u0915\u0940 \u091C\u093E\u0928\u0915\u093E\u0930\u0940 \u092D\u0930\u0947\u0902":"Setup Your Farm"}</h1>
          <p className="text-green-100 text-sm">{hi?"\u090F\u0915 \u092C\u093E\u0930 \u092D\u0930\u0947\u0902, \u0939\u092E\u0947\u0936\u093E \u0915\u0947 \u0932\u093F\u090F \u0938\u0947\u0935":"Fill once, saved forever"}</p>
        </div>
        <div className="bg-white rounded-3xl p-5 space-y-4 shadow-sm">
          <div>
            <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2">{hi?"\uD83C\uDF31 \u0915\u094C\u0928 \u0938\u0940 \u092B\u0938\u0932?":" Which Crop?"}</p>
            <div className="grid grid-cols-2 gap-2">
              {CROPS.map(c=>(
                <button key={c.en} onClick={()=>setForm(f=>({...f,crop:c.en}))} className="flex items-center gap-2 p-3 rounded-2xl border-2 text-left"
                  style={{borderColor:form.crop===c.en?"#16a34a":"#e5e7eb",background:form.crop===c.en?"#f0fdf4":"white"}}>
                  <span className="text-xl">{c.emoji}</span><span className="text-sm font-black">{hi?c.hi:c.en}</span>
                  {form.crop===c.en&&<CheckCircle size={13} className="ml-auto text-green-600"/>}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2">{hi?"\uD83C\uDF0D \u092E\u093F\u091F\u094D\u091F\u0940 \u0915\u093E \u092A\u094D\u0930\u0915\u093E\u0930?":" Soil Type?"}</p>
            <div className="grid grid-cols-2 gap-2">
              {SOILS.map(s=>(
                <button key={s.en} onClick={()=>setForm(f=>({...f,soilType:s.en}))} className="flex items-center gap-2 p-3 rounded-2xl border-2 text-left"
                  style={{borderColor:form.soilType===s.en?"#16a34a":"#e5e7eb",background:form.soilType===s.en?"#f0fdf4":"white"}}>
                  <span className="text-xl">{s.emoji}</span><span className="text-sm font-black">{hi?s.hi:s.en}</span>
                  {form.soilType===s.en&&<CheckCircle size={13} className="ml-auto text-green-600"/>}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1">{hi?"\uD83D\uDCC5 \u092C\u0941\u0935\u093E\u0908 \u0915\u0940 \u0924\u093E\u0930\u0940\u0916":" Sow Date"}</p>
              <input type="date" value={form.sowDate} onChange={e=>setForm(f=>({...f,sowDate:e.target.value}))} className="w-full px-3 py-2.5 rounded-2xl border-2 border-gray-200 text-sm font-bold outline-none focus:border-green-400"/>
            </div>
            <div>
              <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1">{hi?"\uD83D\uDCCF \u091C\u092E\u0940\u0928 (\u090F\u0915\u0921\u093C)":" Land (Acres)"}</p>
              <input type="number" min="0.5" max="100" step="0.5" value={form.landAcres} onChange={e=>setForm(f=>({...f,landAcres:parseFloat(e.target.value)||1}))} className="w-full px-3 py-2.5 rounded-2xl border-2 border-gray-200 text-sm font-bold outline-none focus:border-green-400"/>
            </div>
          </div>
          <StateDistrictPicker
            lang={lang}
            selectedState={form.state}
            selectedDistrict={form.district}
            onStateChange={s=>setForm(f=>({...f,state:s,district:""}))} 
            onDistrictChange={d=>setForm(f=>({...f,district:d}))}
          />
          <button onClick={save} className="w-full py-4 rounded-2xl text-white font-black text-base shadow-lg" style={{background:"linear-gradient(135deg,#16a34a,#15803d)"}}>
            {hi?"\u2705 \u0938\u0947\u0935 \u0915\u0930\u0947\u0902 \u0914\u0930 \u0936\u0941\u0930\u0942 \u0915\u0930\u0947\u0902":" Save & Start"}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen p-4" style={{background:"#f4f7f4"}}>
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="rounded-3xl p-5 text-white" style={{background:"linear-gradient(135deg,#1f6b2a,#15803d)"}}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-black">{hi?"\uD83C\uDF3E \u0938\u094D\u092E\u093E\u0930\u094D\u091F \u0916\u0947\u0924\u0940":" Smart Farm"}</h1>
              <p className="text-green-100 text-sm">{sc.emoji} {hi?sc.hi:sc.en} - {setup?.landAcres} {hi?"\u090F\u0915\u0921\u093C":"acres"} - {hi?`${days} à¤¦à¤¨ à¤ªà¤°à¤¨ à¤«à¤¸à¤²`:`${days} days old`}</p>
            </div>
            <button onClick={()=>setShowSetup(true)} className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center"><Settings2 size={18} className="text-white"/></button>
          </div>
        </div>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 size={32} className="animate-spin text-green-600"/>
            <p className="font-black text-gray-500">{hi?"\u092E\u094C\u0938\u092E \u0921\u0947\u091F\u093E \u0932\u094B\u0921 \u0939\u094B \u0930\u0939\u093E \u0939\u0948...":"Loading weather data..."}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {irr && (
              <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="rounded-3xl overflow-hidden shadow-lg">
                <div className="p-5" style={{background:irr.urgency==="urgent"?"linear-gradient(135deg,#dc2626,#b91c1c)":irr.urgency==="skip"?"linear-gradient(135deg,#2563eb,#1d4ed8)":"linear-gradient(135deg,#16a34a,#15803d)"}}>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-4xl">{irr.urgency==="urgent"?"":irr.urgency==="skip"?"":""}</span>
                    <div>
                      <p className="text-white font-black text-lg">{irr.shouldIrrigate?(hi?"\u0906\u091C \u0938\u093F\u0902\u091A\u093E\u0908 \u0915\u0930\u0947\u0902!":"Irrigate Today!"):(hi?"\u0906\u091C \u0938\u093F\u0902\u091A\u093E\u0908 \u0928 \u0915\u0930\u0947\u0902":"Skip Irrigation Today")}</p>
                      <p className="text-white/80 text-sm">{hi?irr.reasonHi:irr.reason}</p>
                    </div>
                  </div>
                  {irr.shouldIrrigate && (
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <div className="bg-white/20 rounded-2xl p-3 text-center">
                        <p className="text-white/70 text-xs font-bold">{hi?"\u0938\u0939\u0940 \u0938\u092E\u092F":"Best Time"}</p>
                        <p className="text-white font-black text-sm">{hi?irr.bestTimeHi:irr.bestTime}</p>
                      </div>
                      <div className="bg-white/20 rounded-2xl p-3 text-center">
                        <p className="text-white/70 text-xs font-bold">{hi?"\u092A\u093E\u0928\u0940 \u0915\u0940 \u092E\u093E\u0924\u094D\u0930\u093E":"Water Needed"}</p>
                        <p className="text-white font-black text-sm">{(irr.waterAmountLiters/1000).toFixed(1)}K L</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="bg-white px-5 py-3 flex items-center justify-between">
                  <p className="text-xs text-gray-500 font-bold">{hi?`à¤†à¤–à¤° à¤¸à¤šà¤ˆ: ${lastIrr} à¤¦à¤¨ à¤ªà¤¹à¤²`:`Last irrigated: ${lastIrr} days ago`}</p>
                  <button onClick={markDone} className="px-4 py-2 rounded-xl text-xs font-black text-white" style={{background:"#16a34a"}}>{hi?"\u2705 \u0906\u091C \u0938\u093F\u0902\u091A\u093E\u0908 \u0915\u0940":" Done Today"}</button>
                </div>
              </motion.div>
            )}
            {fc.length>0 && (
              <div className="bg-white rounded-3xl p-5 shadow-sm">
                <p className="font-black text-gray-900 mb-3">{hi?"\uD83C\uDF24\uFE0F 7 \u0926\u093F\u0928 \u0915\u093E \u092E\u094C\u0938\u092E \u092A\u0942\u0930\u094D\u0935\u093E\u0928\u0941\u092E\u093E\u0928":" 7-Day Weather Forecast"}</p>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {fc.map((d,i)=>{
                    const dt=new Date(d.date);
                    return (
                      <div key={d.date} className="shrink-0 flex flex-col items-center gap-1 rounded-2xl p-3 min-w-[64px]"
                        style={{background:i===0?"#f0fdf4":"#f9fafb",border:i===0?"2px solid #16a34a":"1px solid #f3f4f6"}}>
                        <p className="text-[10px] font-black text-gray-500">{i===0?(hi?"à¤†à¤œ":"Today"):dt.toLocaleDateString("en-IN",{weekday:"short"})}</p>
                        <span className="text-2xl">{d.rainProb>70?"":d.rainProb>40?"":d.tempMax>38?"":""}</span>
                        <p className="text-xs font-black text-gray-800">{d.tempMax}</p>
                        <p className="text-[10px] text-gray-400">{d.tempMin}</p>
                        {d.rainMm>0&&<p className="text-[9px] font-black text-blue-600">{d.rainMm}mm</p>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {tasks.length>0 && (
              <div className="space-y-3">
                <p className="font-black text-gray-900 px-1">{hi?" à¤†à¤œ à¤•à¤¯ à¤•à¤°?":" Today Tasks"}</p>
                {tasks.slice(0,4).map((day,i)=>{
                  const st=URGENCY[day.urgency];
                  const dt=new Date(day.date);
                  return (
                    <motion.div key={day.date} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.08}}
                      className="rounded-3xl overflow-hidden shadow-sm" style={{background:st.bg,border:`2px solid ${st.border}`}}>
                      <div className="px-4 py-3 flex items-center gap-2 border-b" style={{borderColor:st.border}}>
                        <span>{st.icon}</span>
                        <p className="font-black text-sm" style={{color:st.color}}>{i===0?(hi?"à¤†à¤œ":"Today"):dt.toLocaleDateString(hi?"hi-IN":"en-IN",{weekday:"long",day:"numeric",month:"short"})}</p>
                        <span className="ml-auto text-xs text-gray-400">{dt.toLocaleDateString("en-IN",{day:"numeric",month:"short"})}</span>
                      </div>
                      <div className="p-4 space-y-3">
                        {day.tasks.map((task,j)=>(
                          <div key={j} className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-2xl flex items-center justify-center text-xl shrink-0" style={{background:(TC[task.type]??"#6b7280")+"20"}}>{task.emoji}</div>
                            <div>
                              <p className="font-black text-gray-900 text-sm">{hi?task.titleHi:task.title}</p>
                              <p className="text-xs text-gray-500 mt-0.5">{hi?task.descHi:task.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              {[
                {emoji:"",label:hi?"\u092B\u0938\u0932 \u0915\u0940 \u0909\u092E\u094D\u0930":"Crop Age",value:`${days} ${hi?"\u0926\u093F\u0928":"days"}`},
                {emoji:"",label:hi?"\u0916\u0947\u0924 \u0915\u093E \u0915\u094D\u0937\u0947\u0924\u094D\u0930":"Farm Area",value:`${setup?.landAcres} ${hi?"\u090F\u0915\u0921\u093C":"acres"}`},
                {emoji:"",label:hi?"\u092E\u093F\u091F\u094D\u091F\u0940":"Soil",value:hi?(SOILS.find(s=>s.en===setup?.soilType)?.hi??""):(setup?.soilType??"")},
                {emoji:"",label:hi?"\u0938\u094D\u0925\u093E\u0928":"Location",value:setup?.location??""},
              ].map((s,i)=>(
                <div key={i} className="bg-white rounded-3xl p-4 shadow-sm">
                  <p className="text-2xl mb-1">{s.emoji}</p>
                  <p className="text-xs text-gray-400 font-bold">{s.label}</p>
                  <p className="font-black text-gray-900 text-sm mt-0.5">{s.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
