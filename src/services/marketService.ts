// Market Service — tries live data.gov.in API, falls back to MSP reference data
// STRICT: never shows fake/invented prices. Only real API data or official MSP.

import { MSP_DATA, type MspCrop } from "@/data/mspData";

const API_KEY     = "579b464db66ec23bdd0000018bf158c7f99e48d37374f69df315b016";
const RESOURCE_ID = "9ef84268-d588-465a-a308-a864a43d0070";
const CACHE_KEY   = "market_cache_v3";
const CACHE_TTL   = 5 * 60 * 1000; // 5 minutes

export type DataSource = "live" | "msp";

export interface LiveRecord {
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety: string;
  arrival_date: string;
  min_price: number;
  max_price: number;
  modal_price: number;
}

export interface CachePayload {
  records: LiveRecord[];
  fetchedAt: string;
  fetchedAtMs: number;
}

export interface MarketResult {
  source: DataSource;
  records: LiveRecord[];       // populated when source === "live"
  fetchedAt: string | null;
  fromCache: boolean;
  error: string | null;
}

// ── LocalStorage helpers ──────────────────────────────────────────────────────
export function saveToCache(records: LiveRecord[]): void {
  const payload: CachePayload = {
    records,
    fetchedAt: new Date().toLocaleString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit", second: "2-digit",
    }),
    fetchedAtMs: Date.now(),
  };
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(payload)); } catch {}
}

export function loadFromCache(): CachePayload | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as CachePayload) : null;
  } catch { return null; }
}

export function isCacheFresh(cache: CachePayload): boolean {
  return Date.now() - cache.fetchedAtMs < CACHE_TTL;
}

function parseNum(v?: string | number): number {
  if (typeof v === "number") return v;
  const n = parseFloat(String(v ?? "0").replace(/,/g, ""));
  return isNaN(n) ? 0 : n;
}

// ── Live API fetch (via Vite proxy to avoid CORS) ─────────────────────────────
async function fetchLiveAPI(limit = 1000): Promise<LiveRecord[] | null> {
  try {
    const url = `/datagov-api/resource/${RESOURCE_ID}?api-key=${API_KEY}&format=json&limit=${limit}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(12000) });
    if (!res.ok) return null;
    const json = await res.json();
    const raw: any[] = json?.records ?? json?.data ?? [];
    if (!raw.length) return null;

    const records: LiveRecord[] = raw
      .map((r) => ({
        state:        String(r.state        ?? r.State        ?? "").trim(),
        district:     String(r.district     ?? r.District     ?? "").trim(),
        market:       String(r.market       ?? r.Market       ?? "").trim(),
        commodity:    String(r.commodity    ?? r.Commodity    ?? "").trim(),
        variety:      String(r.variety      ?? r.Variety      ?? "").trim(),
        arrival_date: String(r.arrival_date ?? r.Arrival_Date ?? "").trim(),
        min_price:    parseNum(r.min_price   ?? r.Min_Price),
        max_price:    parseNum(r.max_price   ?? r.Max_Price),
        modal_price:  parseNum(r.modal_price ?? r.Modal_Price),
      }))
      .filter((r) => r.commodity && r.modal_price > 0);

    return records.length > 0 ? records : null;
  } catch {
    return null;
  }
}

// ── Main fetch function ───────────────────────────────────────────────────────
export async function fetchMarketData(forceRefresh = false): Promise<MarketResult> {
  // 1. Check fresh cache first (skip if force refresh)
  if (!forceRefresh) {
    const cache = loadFromCache();
    if (cache && isCacheFresh(cache)) {
      return {
        source: "live",
        records: cache.records,
        fetchedAt: cache.fetchedAt,
        fromCache: true,
        error: null,
      };
    }
  }

  // 2. Try live API
  const live = await fetchLiveAPI(1000);
  if (live && live.length > 0) {
    saveToCache(live);
    const cache = loadFromCache()!;
    return {
      source: "live",
      records: live,
      fetchedAt: cache.fetchedAt,
      fromCache: false,
      error: null,
    };
  }

  // 3. API failed — try stale cache (real data, just old)
  const staleCache = loadFromCache();
  if (staleCache && staleCache.records.length > 0) {
    return {
      source: "live",
      records: staleCache.records,
      fetchedAt: staleCache.fetchedAt,
      fromCache: true,
      error: "stale", // signals UI to show "last available data" warning
    };
  }

  // 4. No real data at all — return MSP fallback (clearly labeled)
  return {
    source: "msp",
    records: [],
    fetchedAt: null,
    fromCache: false,
    error: null,
  };
}

// ── Helper: match live records to MSP crop ────────────────────────────────────
export function getModalPriceForCrop(
  crop: MspCrop,
  records: LiveRecord[]
): number | null {
  const keyword = crop.crop.split(" ")[0].toLowerCase();
  const matches = records.filter(
    (r) =>
      r.commodity.toLowerCase() === crop.crop.toLowerCase() ||
      r.commodity.toLowerCase().includes(keyword)
  );
  if (!matches.length) return null;
  // Return average modal price across all matching mandis
  const avg = matches.reduce((s, r) => s + r.modal_price, 0) / matches.length;
  return Math.round(avg);
}

// ── Unique sorted values from records ────────────────────────────────────────
export function getUniqueValues(
  records: LiveRecord[],
  field: keyof LiveRecord
): string[] {
  return [...new Set(records.map((r) => String(r[field])).filter(Boolean))].sort();
}
