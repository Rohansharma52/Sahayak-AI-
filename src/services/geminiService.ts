const LANG_NAME: Record<string, string> = {
  hi: "Hindi",
  en: "English",
  ta: "Tamil",
  mr: "Marathi",
  te: "Telugu",
  kn: "Kannada",
  bn: "Bengali",
  pa: "Punjabi",
};

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "google/gemini-2.0-flash-lite-001";

type Message = { role: string; content: string };

async function callModel(messages: Message[], maxTokens = 400): Promise<string> {
  const key = import.meta.env.VITE_OPENROUTER_API_KEY;
  if (!key) throw new Error("VITE_OPENROUTER_API_KEY not set");

  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${key}`,
    },
    body: JSON.stringify({ model: MODEL, messages, max_tokens: maxTokens }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenRouter error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  return data?.choices?.[0]?.message?.content?.trim() ?? "";
}

/**
 * Answer a farmer's question using full conversation history.
 * Covers all crop, farming, weather, pest, soil, market, and scheme topics.
 */
export async function askGemini(
  history: Message[],
  language: string
): Promise<string> {
  const langName = LANG_NAME[language] ?? "Hindi";

  const systemPrompt = `You are Sahayak AI, a knowledgeable and friendly assistant for Indian farmers. You help with ALL farming-related topics.

You can answer questions about:
- Crops: sowing time, harvesting, irrigation, fertilizers, seeds, crop rotation
- Pest & disease control: identification, treatment, prevention
- Soil health: soil types, pH, nutrients, composting
- Weather & seasons: best time to sow, rain patterns, frost protection
- Market prices: mandi rates, where to sell, price trends
- Government schemes: PM Kisan, Fasal Bima, KCC, subsidies, loans, insurance
- Farm equipment: tractors, tools, drip irrigation
- Organic farming, modern techniques, crop yield improvement
- Any other farming or agriculture related topic

Rules:
- Always reply in simple, easy ${langName} only — as if talking to a village farmer
- Keep replies concise: 3-6 lines max, plain text, no markdown, no bullet symbols
- Be warm, helpful, and encouraging
- If the question is completely unrelated to farming/agriculture, politely say you only help with farming topics
- Never ask for personal info unless the farmer volunteers it`;

  const messages: Message[] = [
    { role: "system", content: systemPrompt },
    ...history,
  ];

  try {
    const text = await callModel(messages, 500);
    if (!text) throw new Error("Empty response");
    return text;
  } catch (err: any) {
    console.error("Gemini error:", err?.message || err);
    const fallbacks: Record<string, string> = {
      hi: "माफ़ करें, कुछ गड़बड़ हो गई। कृपया दोबारा कोशिश करें।",
      en: "Sorry, something went wrong. Please try again.",
      ta: "மன்னிக்கவும், ஏதோ தவறு நடந்தது. மீண்டும் முயற்சிக்கவும்.",
      mr: "माफ करा, काहीतरी चूक झाली. कृपया पुन्हा प्रयत्न करा.",
      te: "క్షమించండి, ఏదో తప్పు జరిగింది. దయచేసి మళ్ళీ ప్రయత్నించండి.",
      kn: "ಕ್ಷಮಿಸಿ, ಏನೋ ತಪ್ಪಾಯಿತು. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
      bn: "দুঃখিত, কিছু একটা ভুল হয়েছে। আবার চেষ্টা করুন।",
      pa: "ਮਾਫ਼ ਕਰਨਾ, ਕੁਝ ਗਲਤ ਹੋ ਗਿਆ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।",
    };
    return fallbacks[language] ?? fallbacks.hi;
  }
}

export interface SchemeData {
  eligible: boolean;
  schemeName: string;
  benefit: string;
  reason: string;
  steps: string[];
  docs: string[];
}

/**
 * After conversation, extract structured scheme data if Gemini has enough info.
 * Returns null if more info is still needed.
 */
export async function extractSchemeData(
  history: Message[],
  language: "hi" | "en"
): Promise<SchemeData | null> {
  const extractPrompt = `Based on the conversation below, determine if there is enough information to recommend a specific Indian government scheme to the farmer.

If YES, respond with ONLY this exact JSON (no markdown, no extra text):
{"eligible":true,"schemeName":"scheme name","benefit":"benefit amount","reason":"why eligible in ${LANG_NAME[language]}","steps":["step1","step2","step3"],"docs":["doc1","doc2","doc3"]}

If NOT enough info yet, respond with ONLY:
{"eligible":false,"schemeName":"","benefit":"","reason":"","steps":[],"docs":[]}

Conversation:
${history.map((m) => `${m.role}: ${m.content}`).join("\n")}`;

  try {
    const raw = await callModel([{ role: "user", content: extractPrompt }], 500);
    // Extract JSON from response
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    const parsed: SchemeData = JSON.parse(jsonMatch[0]);
    // Only return if we have a real scheme name
    if (!parsed.schemeName || parsed.schemeName.trim() === "") return null;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Simplify a response text for a farmer audience.
 */
export async function simplifyResponse(
  text: string,
  language: "hi" | "en"
): Promise<string> {
  const langName = LANG_NAME[language];
  const prompt = `Simplify the following text in very simple ${langName} for a farmer. Do not change meaning. Keep it short, clear, and easy to understand. Return ONLY the simplified text, nothing else.\n\nText: ${text}`;
  try {
    return (await callModel([{ role: "user", content: prompt }])) || text;
  } catch {
    return text;
  }
}
