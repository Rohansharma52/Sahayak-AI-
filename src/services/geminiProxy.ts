const IS_PROD = import.meta.env.PROD;
const DEV_KEYS = (import.meta.env.VITE_GEMINI_API_KEY as string ?? "").split(",").map(k => k.trim()).filter(Boolean);
const MODELS = ["gemini-2.0-flash-lite", "gemini-2.0-flash", "gemini-2.5-flash"];

let keyIndex = 0;
function getNextKey(): string {
  const key = DEV_KEYS[keyIndex % DEV_KEYS.length];
  keyIndex++;
  return key;
}

export async function callGemini(
  contents: object[],
  generationConfig: object = { maxOutputTokens: 1024, temperature: 0.3 }
): Promise<string> {
  for (const model of MODELS) {
    let res: Response;

    if (IS_PROD) {
      res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model, contents, generationConfig }),
      });
    } else {
      const key = getNextKey();
      if (!key || key.includes("XXXX")) throw new Error("Set VITE_GEMINI_API_KEY in .env (comma-separate multiple keys)");
      res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents, generationConfig }),
        }
      );
    }

    if (res.status === 429) { console.warn(`${model} quota exceeded`); continue; }
    if (!res.ok) { console.warn(`${model} failed ${res.status}`); continue; }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";
    if (text) return text;
  }

  throw new Error("API quota exceeded. Please try again in a minute.");
}
