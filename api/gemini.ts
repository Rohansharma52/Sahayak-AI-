import type { VercelRequest, VercelResponse } from "@vercel/node";

// Support multiple API keys via comma-separated GEMINI_API_KEY env var
// e.g. GEMINI_API_KEY=key1,key2,key3
const KEYS = (process.env.GEMINI_API_KEY ?? "").split(",").map(k => k.trim()).filter(Boolean);
let keyIndex = 0;

// Simple per-IP rate limiting
const ipCounts: Record<string, { count: number; reset: number }> = {};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  // Rate limit: 20 req/min per IP
  const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ?? "unknown";
  const now = Date.now();
  if (!ipCounts[ip] || ipCounts[ip].reset < now) ipCounts[ip] = { count: 0, reset: now + 60_000 };
  ipCounts[ip].count++;
  if (ipCounts[ip].count > 20) return res.status(429).json({ error: "Too many requests. Wait 1 minute." });

  if (!KEYS.length) return res.status(500).json({ error: "No API keys configured on server" });

  const { model = "gemini-2.0-flash-lite", contents, generationConfig } = req.body;

  // Try each key in rotation until one works
  for (let attempt = 0; attempt < KEYS.length; attempt++) {
    const key = KEYS[keyIndex % KEYS.length];
    keyIndex++;

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents, generationConfig }),
      }
    );

    if (geminiRes.status === 429) { console.warn(`Key ${attempt + 1} quota exceeded, trying next`); continue; }

    const data = await geminiRes.json();
    if (!geminiRes.ok) return res.status(geminiRes.status).json(data);
    return res.status(200).json(data);
  }

  return res.status(429).json({ error: "All API keys quota exceeded. Try again in 1 minute." });
}
