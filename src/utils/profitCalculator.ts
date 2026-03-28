import type { MspCrop } from "@/data/mspData";

export interface ProfitResult {
  cropId: string;
  crop: string;
  cropHi: string;
  emoji: string;
  price: number;           // price used (live or MSP)
  msp: number;
  avgCost: number;
  profitPerQtl: number;    // price - avgCost
  profitPerAcre: number;   // profitPerQtl × yieldPerAcre
  profitMarginPct: number; // (profit / price) × 100
  isAboveMsp: boolean;     // price > msp
  score: number;           // 0–100 profitability score
  recommendation: "excellent" | "good" | "average" | "low";
}

export function calculateProfit(
  crop: MspCrop,
  marketPrice?: number
): ProfitResult {
  const price = marketPrice ?? crop.msp;
  const profitPerQtl  = price - crop.avgCost;
  const profitPerAcre = Math.round(profitPerQtl * crop.yieldPerAcre);
  const profitMarginPct = price > 0 ? +((profitPerQtl / price) * 100).toFixed(1) : 0;
  const isAboveMsp = price > crop.msp;

  return {
    cropId: crop.id,
    crop: crop.crop,
    cropHi: crop.cropHi,
    emoji: crop.emoji,
    price,
    msp: crop.msp,
    avgCost: crop.avgCost,
    profitPerQtl,
    profitPerAcre,
    profitMarginPct,
    isAboveMsp,
    score: 0, // filled by rankCrops
    recommendation: "average",
  };
}

export function rankCrops(results: ProfitResult[]): ProfitResult[] {
  const profits = results.map((r) => r.profitPerAcre);
  const min = Math.min(...profits);
  const max = Math.max(...profits);
  const range = max - min || 1;

  return results
    .map((r) => {
      const score = Math.round(((r.profitPerAcre - min) / range) * 100);
      const recommendation: ProfitResult["recommendation"] =
        score >= 75 ? "excellent" :
        score >= 50 ? "good" :
        score >= 25 ? "average" : "low";
      return { ...r, score, recommendation };
    })
    .sort((a, b) => b.profitPerAcre - a.profitPerAcre);
}

export function getBestCrop(results: ProfitResult[]): ProfitResult | null {
  if (!results.length) return null;
  return results.reduce((best, r) => r.profitPerAcre > best.profitPerAcre ? r : best);
}
