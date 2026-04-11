import { useState, useCallback, useEffect, useRef } from "react";
import type { AppLang } from "@/pages/Index";
import { T } from "@/lib/translations";

const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const LANG_NAMES: Record<AppLang, string> = {
  hi:"Hindi", en:"English", ta:"Tamil", mr:"Marathi",
  te:"Telugu", kn:"Kannada", bn:"Bengali", pa:"Punjabi",
};

// Global runtime cache — persists across renders
const rtCache: Record<string, Record<string, string>> = {};
// Pending texts per lang
const pending: Record<string, Set<string>> = {};
// Registered update callbacks
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setTimeout> | null = null;

async function flush(lang: AppLang) {
  const texts = Array.from(pending[lang] ?? []);
  delete pending[lang];
  if (!texts.length || !GEMINI_KEY || GEMINI_KEY.includes("XXXX")) return;

  const sep = "~|~";
  const prompt = `Translate each English phrase to ${LANG_NAMES[lang]}. Phrases separated by "${sep}". Return ONLY translated phrases separated by "${sep}" in same order. No extra text.\n\n${texts.join(sep)}`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${GEMINI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 2048, temperature: 0 },
        }),
      }
    );
    if (!res.ok) return;
    const data = await res.json();
    const raw: string = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";
    const parts = raw.split(sep);
    texts.forEach((orig, i) => {
      const tr = parts[i]?.trim();
      if (tr) {
        if (!rtCache[orig]) rtCache[orig] = {};
        rtCache[orig][lang] = tr;
      }
    });
    listeners.forEach(cb => cb());
  } catch (e) {
    console.error("Translation error:", e);
  }
}

function queue(text: string, lang: AppLang) {
  if (!pending[lang]) pending[lang] = new Set();
  if (pending[lang].has(text)) return;
  pending[lang].add(text);
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => flush(lang), 300);
}

export function useTranslation(lang: AppLang) {
  const [tick, setTick] = useState(0);
  const cbRef = useRef<() => void>(() => setTick(n => n + 1));

  useEffect(() => {
    const cb = cbRef.current;
    listeners.add(cb);
    return () => { listeners.delete(cb); };
  }, []);

  // When lang changes, flush any pending for new lang
  useEffect(() => {
    if (pending[lang]?.size) flush(lang);
  }, [lang]);

  const t = useCallback((text: string): string => {
    if (!text || lang === "en") return text;
    if (T[text]?.[lang]) return T[text][lang]!;
    if (rtCache[text]?.[lang]) return rtCache[text][lang];
    queue(text, lang);
    return text;
  }, [lang, tick]); // eslint-disable-line react-hooks/exhaustive-deps

  return { t };
}
