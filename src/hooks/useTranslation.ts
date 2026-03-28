import { useState, useCallback } from "react";
import { translateText } from "@/services/translateService";
import type { AppLang } from "@/pages/Index";

// Pre-defined translations for common UI elements to avoid unnecessary API calls
const PRE_DEFINED_TRANSLATIONS: Record<string, Record<string, string>> = {
  "Home": { hi: "होम", ta: "முகப்பு", mr: "होम", te: "హోమ్", kn: "ಮನೆ", bn: "হোম", pa: "ਹੋਮ" },
  "Weather": { hi: "मौसम", ta: "வானிலை", mr: "हवामान", te: "వాతావరణం", kn: "ಹವಾಮಾನ", bn: "আবহাওয়া", pa: "ਮੌਸਮ" },
  "Markets": { hi: "बाज़ार", ta: "சந்தை", mr: "बाज़ार", te: "మార్కెట్లు", kn: "ಮಾರುಕಟ್ಟೆಗಳು", bn: "বাজার", pa: "ਬਾਜ਼ਾਰ" },
  "Advisory": { hi: "सलाह", ta: "ஆலோசனை", mr: "सल्ला", te: "సలహా", kn: "ಸಲಹೆ", bn: "পরামর্শ", pa: "ਸਲਾਹ" },
  "Dashboard": { hi: "डैशबोर्ड", ta: "டாஷ்போர்டு", mr: "डॅशबोर्ड", te: "డాష్‌బోర్డ్", kn: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್", bn: "ড্যাশবোর্ড", pa: "ਡੈਸ਼ਬੋਰਡ" },
  "Scan": { hi: "स्कैन", ta: "ஸ்கேன்", mr: "स्कॅन", te: "స్కాన్", kn: "ಸ್ಕ್ಯಾನ್", bn: "স্ক্যান", pa: "ਸਕੈਨ" },
  "Schemes": { hi: "योजना", ta: "திட்டங்கள்", mr: "योजना", te: "పథకాలు", kn: "ಯೋಜನೆಗಳು", bn: "প্রকল্প", pa: "ਯੋਜਨਾਵਾਂ" },
  "Chatbot": { hi: "चैटबॉट", ta: "சாட்பாட்", mr: "चॅटबॉट", te: "చాట్‌బాట్", kn: "ಚಾಟ್‌ಬಾಟ್", bn: "চ্যাটবট", pa: "ਚੈਟਬੋਟ" },
  "Help": { hi: "मदद", ta: "உதவி", mr: "मदत", te: "సహాయం", kn: "ಸಹాయ", bn: "সাহায্য", pa: "ਮਦਦ" },
};

// Global cache to persist translations across component renders
const globalTranslationCache: Record<string, Record<string, string>> = {};

export function useTranslation(lang: AppLang) {
  const [, setTick] = useState(0);

  const translateAsync = useCallback(async (text: string) => {
    if (lang === "en" || PRE_DEFINED_TRANSLATIONS[text]?.[lang] || globalTranslationCache[text]?.[lang]) return;

    if (!globalTranslationCache[text]) globalTranslationCache[text] = {};
    globalTranslationCache[text][lang] = text; // placeholder

    try {
      const translated = await translateText(text, lang);
      globalTranslationCache[text][lang] = translated;
      setTick(tick => tick + 1);
    } catch (error) {
      console.error("Translation failed:", text, error);
    }
  }, [lang]);

  const t = useCallback((text: string): string => {
    if (!text || lang === "en") return text;

    if (PRE_DEFINED_TRANSLATIONS[text]?.[lang]) {
      return PRE_DEFINED_TRANSLATIONS[text][lang];
    }

    if (globalTranslationCache[text]?.[lang]) {
      return globalTranslationCache[text][lang];
    }

    translateAsync(text);
    return text;
  }, [lang, translateAsync]);

  return { t };
}
