import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Upload, X, Leaf, Loader2, RefreshCw, Volume2, VolumeX } from "lucide-react";
import type { AppLang } from "@/pages/Index";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "sonner";

interface DiagnosisResult {
  disease: string; confidence: string;
  severity: "low"|"medium"|"high"|"healthy";
  symptoms: string[]; treatment: string[];
  medicines: string[]; prevention: string[]; crop: string;
}
interface CropDiseasePageProps { lang: AppLang; }

const VALID_SEV = ["healthy","low","medium","high"];

function parseResult(raw: string): DiagnosisResult {
  // Step 1: strip markdown fences
  let s = raw.trim()
    .replace(/^```json\s*/im, "")
    .replace(/^```\s*/im, "")
    .replace(/\s*```\s*$/im, "")
    .trim();

  // Step 2: try direct parse
  let parsed: any;
  try { parsed = JSON.parse(s); }
  catch {
    // Step 3: find first { and last }
    const a = s.indexOf("{"), b = s.lastIndexOf("}");
    if (a === -1 || b <= a) {
      console.error("No JSON braces found in:", s);
      throw new Error("No JSON in response. Please try again.");
    }
    let frag = s.slice(a, b + 1);
    // Step 4: fix truncated arrays/objects
    const ob = (frag.match(/\[/g)||[]).length - (frag.match(/\]/g)||[]).length;
    const oc = (frag.match(/\{/g)||[]).length - (frag.match(/\}/g)||[]).length;
    for (let i=0;i<ob;i++) frag += "]";
    for (let i=0;i<oc;i++) frag += "}";
    try { parsed = JSON.parse(frag); }
    catch (e) {
      console.error("JSON parse failed:", e, "fragment:", frag.slice(0,200));
      throw new Error("Could not parse AI response. Please try again.");
    }
  }

  return {
    disease:    String(parsed.disease    || "Unknown"),
    confidence: String(parsed.confidence || "N/A"),
    severity:   VALID_SEV.includes(parsed.severity) ? parsed.severity : "medium",
    crop:       String(parsed.crop       || "Unknown"),
    symptoms:   Array.isArray(parsed.symptoms)   ? parsed.symptoms.map(String)   : [],
    treatment:  Array.isArray(parsed.treatment)  ? parsed.treatment.map(String)  : [],
    medicines:  Array.isArray(parsed.medicines)  ? parsed.medicines.map(String)  : [],
    prevention: Array.isArray(parsed.prevention) ? parsed.prevention.map(String) : [],
  };
}

async function analyzeCropImage(base64Image: string, lang: AppLang): Promise<DiagnosisResult> {
  const langNames: Record<AppLang,string> = { hi:"Hindi",en:"English",ta:"Tamil",mr:"Marathi",te:"Telugu",kn:"Kannada",bn:"Bengali",pa:"Punjabi" };
  const L = langNames[lang];
  const prompt = `You are an expert agricultural plant pathologist AI. Analyze the plant/crop image.
Respond with ONLY a JSON object. No markdown. No explanation. Start your response with { and end with }
Use ${L} language for all text values.
Required format:
{"disease":"disease name in ${L}","confidence":"85%","severity":"healthy or low or medium or high","crop":"crop name in ${L}","symptoms":["symptom 1","symptom 2","symptom 3"],"treatment":["step 1","step 2","step 3"],"medicines":["medicine name and dose","medicine name and dose"],"prevention":["tip 1","tip 2"]}
Rules: severity must be one of: healthy, low, medium, high. If healthy plant set severity to healthy and medicines to []. Start response with { character.`;

  // Use proxy (safe in production, direct in dev)
  const IS_PROD = import.meta.env.PROD;
  const DEV_KEY = import.meta.env.VITE_GEMINI_API_KEY as string;
  const models = ["gemini-2.0-flash-lite","gemini-2.0-flash","gemini-2.5-flash"];

  for (const model of models) {
    let res: Response;
    try {
      if (IS_PROD) {
        res = await fetch("/api/gemini", {
          method:"POST", headers:{"Content-Type":"application/json"},
          body: JSON.stringify({ model, contents:[{parts:[{text:prompt},{inline_data:{mime_type:"image/jpeg",data:base64Image}}]}], generationConfig:{maxOutputTokens:1024,temperature:0.1} }),
        });
      } else {
        if (!DEV_KEY||DEV_KEY.includes("XXXX")) throw new Error("Set VITE_GEMINI_API_KEY in .env");
        res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${DEV_KEY}`,{
          method:"POST", headers:{"Content-Type":"application/json"},
          body: JSON.stringify({ contents:[{parts:[{text:prompt},{inline_data:{mime_type:"image/jpeg",data:base64Image}}]}], generationConfig:{maxOutputTokens:1024,temperature:0.1} }),
        });
      }
    } catch (e: any) { throw new Error("Network error: "+e.message); }
    if (res.status===429){console.warn(`${model} quota exceeded`);continue;}
    if (!res.ok){const e=await res.text();console.warn(`${model} failed ${res.status}:`,e);continue;}
    const data = await res.json();
    const raw: string = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()??"";
    console.log(`[${model}] raw:`, raw.slice(0,200));
    if (!raw) continue;
    return parseResult(raw);
  }
  throw new Error("API quota exceeded. Please wait 1 minute and try again.");
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve,reject) => {
    const img = new Image(), url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const MAX=800; let {width,height}=img;
      if(width>MAX||height>MAX){ if(width>height){height=Math.round(height*MAX/width);width=MAX;}else{width=Math.round(width*MAX/height);height=MAX;} }
      canvas.width=width; canvas.height=height;
      canvas.getContext("2d")!.drawImage(img,0,0,width,height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg",0.75).split(",")[1]);
    };
    img.onerror=reject; img.src=url;
  });
}

const SEV_KEYS = {
  healthy: { emoji:"✅", badgeKey:"Crop is Healthy!", from:"#16a34a", to:"#15803d", light:"#f0fdf4", border:"#86efac" },
  low:     { emoji:"⚠️", badgeKey:"Mild Disease",    from:"#ca8a04", to:"#a16207", light:"#fefce8", border:"#fde047" },
  medium:  { emoji:"🟠", badgeKey:"Disease Found",   from:"#ea580c", to:"#c2410c", light:"#fff7ed", border:"#fb923c" },
  high:    { emoji:"🚨", badgeKey:"Severe Disease!",  from:"#dc2626", to:"#991b1b", light:"#fef2f2", border:"#f87171" },
};

const LANG_TTS: Record<AppLang,string> = { hi:"hi-IN",en:"en-IN",ta:"ta-IN",mr:"mr-IN",te:"te-IN",kn:"kn-IN",bn:"bn-IN",pa:"pa-IN" };

const CropDiseasePage = ({ lang }: CropDiseasePageProps) => {
  const { t } = useTranslation(lang);
  const [imageFile, setImageFile] = useState<File|null>(null);
  const [imagePreview, setImagePreview] = useState<string|null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<DiagnosisResult|null>(null);
  const [speaking, setSpeaking] = useState(false);
  const [lastLang, setLastLang] = useState<AppLang>(lang);
  const [lastImageFile, setLastImageFile] = useState<File|null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const camRef  = useRef<HTMLInputElement>(null);

  // Re-analyze when language changes and we have a result
  useEffect(() => {
    if (lastLang !== lang && lastImageFile && !analyzing) {
      setLastLang(lang);
      setAnalyzing(true);
      fileToBase64(lastImageFile).then(b64 => analyzeCropImage(b64, lang))
        .then(r => setResult(r))
        .catch(console.error)
        .finally(() => setAnalyzing(false));
    }
  }, [lang]);

  useEffect(() => {
    if (!result) return;
    setSpeaking(true);
    const text = [
      t("Scan complete."), t("Crop")+": "+result.crop,
      t("Disease")+": "+result.disease, t("Confidence")+": "+result.confidence,
      ...(result.symptoms.length?[t("Symptoms")+": "+result.symptoms.join(". ")]:[] ),
      ...(result.treatment.length?[t("Treatment")+": "+result.treatment.join(". ")]:[] ),
    ].join(" ");
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = LANG_TTS[lang]??"hi-IN"; u.rate=0.88;
    u.onend = () => setSpeaking(false);
    window.speechSynthesis.speak(u);
    return () => { window.speechSynthesis.cancel(); setSpeaking(false); };
  }, [result, lang]);

  const toggleSpeak = () => {
    if (speaking) { window.speechSynthesis.cancel(); setSpeaking(false); return; }
    if (result) {
      setSpeaking(true);
      const text = result.disease+" "+result.crop+" "+result.symptoms.join(" ")+" "+result.treatment.join(" ");
      const u = new SpeechSynthesisUtterance(text);
      u.lang = LANG_TTS[lang]??"hi-IN"; u.rate=0.88;
      u.onend = () => setSpeaking(false);
      window.speechSynthesis.speak(u);
    }
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) { toast.error(t("Please upload an image file")); return; }
    setImageFile(file); setResult(null);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleAnalyze = async () => {
    if (!imageFile) return;
    setAnalyzing(true);
    try {
      const b64 = await fileToBase64(imageFile);
      const r = await analyzeCropImage(b64, lang);
      setResult(r);
      setLastImageFile(imageFile);
      setLastLang(lang);
    }
    catch (err: any) { console.error(err); toast.error(err?.message||t("Analysis failed. Try again.")); }
    finally { setAnalyzing(false); }
  };

  const reset = () => { window.speechSynthesis.cancel(); setSpeaking(false); setImageFile(null); setImagePreview(null); setResult(null); };
  const sev = result ? (SEV_KEYS[result.severity]??SEV_KEYS.medium) : null;

  return (
    <div className="min-h-screen bg-[#f4f7f4] dark:bg-gray-950 p-4 md:p-6">
      <div className="max-w-lg mx-auto space-y-4">

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl" style={{background:"linear-gradient(135deg,#16a34a,#15803d)"}}>🌿</div>
          <div className="flex-1">
            <h1 className="text-xl font-black text-gray-900 dark:text-white">{t("Crop Disease Detection")}</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t("AI crop diagnosis — completely free")}</p>
          </div>
          {speaking && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black text-white" style={{background:"linear-gradient(135deg,#16a34a,#15803d)"}}>
              <span className="w-2 h-2 rounded-full bg-white animate-pulse"/>
              {t("Speaking...")}
            </div>
          )}
        </div>

        {/* Upload */}
        {!imagePreview ? (
          <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}
            onDrop={(e)=>{e.preventDefault();e.dataTransfer.files[0]&&handleFile(e.dataTransfer.files[0]);}}
            onDragOver={(e)=>e.preventDefault()} onClick={()=>fileRef.current?.click()}
            className="rounded-3xl p-8 text-center cursor-pointer" style={{background:"white",border:"2px dashed #86efac"}}>
            <div className="text-6xl mb-3">📷</div>
            <p className="text-lg font-black text-gray-800 mb-1">{t("Upload Crop Photo")}</p>
            <p className="text-sm text-gray-400 mb-6">{t("Leaf, fruit, stem — any photo works")}</p>
            <div className="flex gap-3 justify-center">
              <button onClick={(e)=>{e.stopPropagation();fileRef.current?.click();}}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl text-white text-sm font-black active:scale-95"
                style={{background:"linear-gradient(135deg,#16a34a,#15803d)"}}>
                <Upload size={15}/> {t("Choose from Gallery")}
              </button>
              <button onClick={(e)=>{e.stopPropagation();camRef.current?.click();}}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-black active:scale-95"
                style={{background:"#f0fdf4",color:"#15803d",border:"2px solid #86efac"}}>
                <Camera size={15}/> {t("Camera")}
              </button>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e)=>e.target.files?.[0]&&handleFile(e.target.files[0])}/>
            <input ref={camRef}  type="file" accept="image/*" capture="environment" className="hidden" onChange={(e)=>e.target.files?.[0]&&handleFile(e.target.files[0])}/>
          </motion.div>
        ) : (
          <motion.div initial={{opacity:0,scale:0.97}} animate={{opacity:1,scale:1}} className="rounded-3xl overflow-hidden shadow-md" style={{background:"white"}}>
            <div className="relative">
              <img src={imagePreview} alt="crop" className="w-full max-h-64 object-cover"/>
              <button onClick={reset} className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center"><X size={18}/></button>
            </div>
            <div className="p-4 flex gap-3">
              <button onClick={reset} className="flex-1 py-3 rounded-2xl text-sm font-black flex items-center justify-center gap-2" style={{background:"#f3f4f6",color:"#374151"}}>
                <RefreshCw size={14}/> {t("Change")}
              </button>
              <button onClick={handleAnalyze} disabled={analyzing}
                className="flex-grow py-3 rounded-2xl text-white text-sm font-black flex items-center justify-center gap-2 disabled:opacity-60 active:scale-95 transition-all"
                style={{background:analyzing?"#86efac":"linear-gradient(135deg,#16a34a,#15803d)"}}>
                {analyzing ? <><Loader2 size={15} className="animate-spin"/> {t("AI Analyzing...")}</> : <><Leaf size={15}/> {t("Analyze Now")}</>}
              </button>
            </div>
          </motion.div>
        )}

        {/* Result */}
        <AnimatePresence>
          {result && sev && (
            <motion.div initial={{opacity:0,y:24}} animate={{opacity:1,y:0}} exit={{opacity:0}} className="space-y-3">

              {/* Hero */}
              <div className="rounded-3xl overflow-hidden shadow-lg">
                <div className="p-6 text-white text-center" style={{background:`linear-gradient(135deg,${sev.from},${sev.to})`}}>
                  <div className="text-6xl mb-2">{sev.emoji}</div>
                  <h2 className="text-2xl font-black mb-1">{result.disease}</h2>
                  <p className="text-white/80 text-sm mb-3">{t("Crop")}: {result.crop}</p>
                  <span className="inline-block px-4 py-1.5 rounded-full text-sm font-black" style={{background:"rgba(255,255,255,0.2)",border:"1px solid rgba(255,255,255,0.3)"}}>
                    {t(sev.badgeKey)}
                  </span>
                </div>
                <div className="px-5 py-4" style={{background:sev.light,borderTop:`2px solid ${sev.border}`}}>
                  <div className="flex justify-between mb-2">
                    <span className="text-xs font-black text-gray-500 uppercase tracking-wider">{t("AI Accuracy")}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black" style={{color:sev.from}}>{result.confidence}</span>
                      <button onClick={toggleSpeak} className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black text-white transition-all active:scale-95"
                        style={{background:speaking?sev.from:"#6b7280"}}>
                        {speaking ? <><VolumeX size={12}/> {t("Stop")}</> : <><Volume2 size={12}/> {t("Listen")}</>}
                      </button>
                    </div>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-white/60" style={{border:`1px solid ${sev.border}`}}>
                    <div className="h-full rounded-full" style={{width:result.confidence,background:`linear-gradient(90deg,${sev.from},${sev.to})`}}/>
                  </div>
                </div>
              </div>

              {/* Symptoms */}
              {result.symptoms.length>0 && (
                <div className="rounded-3xl p-5 shadow-sm" style={{background:"white"}}>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl">🔍</span>
                    <div><p className="font-black text-gray-900 text-base">{t("What is visible?")}</p><p className="text-xs text-gray-400">{t("Disease symptoms")}</p></div>
                  </div>
                  <div className="space-y-2">
                    {result.symptoms.map((s,i)=>(
                      <div key={i} className="flex items-center gap-3 rounded-2xl px-4 py-3" style={{background:"#fff7ed",border:"1px solid #fed7aa"}}>
                        <span className="text-lg shrink-0">🍂</span><p className="text-sm font-bold text-gray-700">{s}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Treatment */}
              {result.treatment.length>0 && (
                <div className="rounded-3xl p-5 shadow-sm" style={{background:"white"}}>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl">💊</span>
                    <div><p className="font-black text-gray-900 text-base">{t("What to do now?")}</p><p className="text-xs text-gray-400">{t("Treatment steps")}</p></div>
                  </div>
                  <div className="space-y-2">
                    {result.treatment.map((step,i)=>(
                      <div key={i} className="flex items-center gap-3 rounded-2xl px-4 py-3" style={{background:"#f0fdf4",border:"1px solid #bbf7d0"}}>
                        <span className="w-7 h-7 rounded-full text-white text-xs font-black flex items-center justify-center shrink-0" style={{background:"linear-gradient(135deg,#16a34a,#15803d)"}}>{i+1}</span>
                        <p className="text-sm font-bold text-gray-700">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Medicines */}
              {result.medicines.length>0 && (
                <div className="rounded-3xl p-5 shadow-sm" style={{background:"white"}}>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl">🧪</span>
                    <div><p className="font-black text-gray-900 text-base">{t("Which medicine to use?")}</p><p className="text-xs text-gray-400">{t("Available in Indian market")}</p></div>
                  </div>
                  <div className="space-y-2">
                    {result.medicines.map((med,i)=>(
                      <div key={i} className="flex items-center gap-3 rounded-2xl px-4 py-3" style={{background:"#fdf4ff",border:"1px solid #e9d5ff"}}>
                        <span className="text-xl shrink-0">💉</span><p className="text-sm font-bold text-gray-700">{med}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-3 text-center">⚠️ {t("Consult an agricultural expert before using medicine")}</p>
                </div>
              )}

              {/* Prevention */}
              {result.prevention.length>0 && (
                <div className="rounded-3xl p-5 shadow-sm" style={{background:"white"}}>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl">🛡️</span>
                    <div><p className="font-black text-gray-900 text-base">{t("How to prevent in future?")}</p><p className="text-xs text-gray-400">{t("Prevention tips")}</p></div>
                  </div>
                  <div className="space-y-2">
                    {result.prevention.map((tip,i)=>(
                      <div key={i} className="flex items-center gap-3 rounded-2xl px-4 py-3" style={{background:"#eff6ff",border:"1px solid #bfdbfe"}}>
                        <span className="text-xl shrink-0">✅</span><p className="text-sm font-bold text-gray-700">{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button onClick={reset} className="w-full py-4 rounded-2xl text-white font-black text-sm flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg" style={{background:"linear-gradient(135deg,#16a34a,#15803d)"}}>
                <Camera size={16}/> {t("Scan Another Crop")}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CropDiseasePage;
