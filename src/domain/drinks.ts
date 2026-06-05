/**
 * Drink Prep v1 — the bar stock + quality the owner sets before the night. Tiny,
 * bounded, and NEUTRAL at Standard + House (and when absent), so a default night
 * is unchanged. No inventory sim, no spoilage, no brands, no suppliers. Effects
 * reuse existing night quantities (bar revenue, vibe) + a single upfront cost.
 */

import type { DrinkPrep, DrinkQuality, Level, StockLevel } from './types';

export const DEFAULT_DRINK_PREP: DrinkPrep = { stock: 'standard', quality: 'house' };

/** Upfront stock cost (like an event fee). Only HEAVY over-ordering costs money,
 *  scaled to capacity; Lean/Standard are free so a lean recovery night is always
 *  openable (no soft-lock). Bounded and simple. */
const HEAVY_STOCK_PER_CAPACITY = 2.5;
export function stockCost(prep: DrinkPrep | undefined, capacity: number): number {
  const p = prep ?? DEFAULT_DRINK_PREP;
  return p.stock === 'heavy' ? Math.round(capacity * HEAVY_STOCK_PER_CAPACITY) : 0;
}

export interface DrinkPrepEffects {
  barRevenueMod: number; // × bar revenue (margin / throughput)
  vibeAdd: number; // + vibe (→ satisfaction → reputation)
}

/**
 * Runtime effects. Lean risks running dry on a packed night; Heavy keeps the bar
 * stocked through a rush. Cheap trades a little room respect for margin; Premium
 * trades margin for respect. Neutral at Standard + House (and absent).
 * `fill` = guests / capacity for the night.
 */
export function drinkPrepEffects(prep: DrinkPrep | undefined, fill: number): DrinkPrepEffects {
  const p = prep ?? DEFAULT_DRINK_PREP;
  let barRevenueMod = 1;
  let vibeAdd = 0;

  if (p.stock === 'lean' && fill >= 0.7) barRevenueMod *= 0.85; // stock ran thin in the rush
  else if (p.stock === 'heavy' && fill >= 0.7) barRevenueMod *= 1.05; // stayed stocked

  if (p.quality === 'cheap') {
    barRevenueMod *= 1.05;
    vibeAdd -= 3;
  } else if (p.quality === 'premium') {
    barRevenueMod *= 0.95;
    vibeAdd += 4;
  }

  return { barRevenueMod, vibeAdd };
}

/**
 * What you POUR is the stock quality you bought — you can't serve premium from
 * cheap bottles. The only thing the menu PRICE changes here is whether the room
 * feels cheated or rewarded: charging premium prices on cheap stock stings, while
 * premium stock at a low price quietly wins trust. Bounded; neutral for default
 * House quality (and for matched price tiers), so a default night is unchanged.
 */
export function drinkMismatch(quality: DrinkQuality, menuPrice: Level): number {
  if (quality === 'cheap' && menuPrice === 'high') return -4; // charged premium for cheap pours
  if (quality === 'premium' && menuPrice === 'low') return 3; // a genuine steal
  return 0;
}

// --- UI metadata (Day Prep) ---------------------------------------------------

export const STOCK_OPTIONS: { value: StockLevel; label: string }[] = [
  { value: 'lean', label: 'Lean' },
  { value: 'standard', label: 'Standard' },
  { value: 'heavy', label: 'Heavy' },
];
export const QUALITY_OPTIONS: { value: DrinkQuality; label: string }[] = [
  { value: 'cheap', label: 'Cheap' },
  { value: 'house', label: 'House' },
  { value: 'premium', label: 'Premium' },
];

export const STOCK_BLURB: Record<StockLevel, string> = {
  lean: 'Order light — free, but risk running dry on a packed night.',
  standard: 'A balanced order — no extra upfront.',
  heavy: 'Over-order — costs upfront, keeps the bar stocked when it’s slammed.',
};
export const QUALITY_BLURB: Record<DrinkQuality, string> = {
  cheap: 'Better margin — but the room may feel the cheap pour.',
  house: 'Solid, no-fuss pours.',
  premium: 'Tighter margin — guests respect the quality.',
};
