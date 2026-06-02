/**
 * Central balancing constants for the simulation.
 * ALL economy tuning lives here — the sim reads from this, UI never hardcodes
 * game math. See docs/economy.md for the model and rationale.
 */

import type { DayConfig, Level, MusicStyle, SecurityLevel } from './types';

export const START_CASH = 600;
export const START_REPUTATION = 20;
export const START_CAPACITY = 60;

/**
 * Attendance never drops to zero just because reputation is low — a small club
 * still pulls a curiosity crowd. repFactor = REP_FLOOR + (1-REP_FLOOR)*(rep/100),
 * so a fresh club fills enough to be viable while reputation still drives
 * absolute numbers (and matters more as capacity grows).
 */
export const REP_FLOOR = 0.3;

/** Maps a Level to a 0..1 intensity used by the demand curve. */
export const LEVEL_VALUE: Record<Level, number> = {
  low: 0,
  med: 0.5,
  high: 1,
};

/** Cover charge ($) by level. */
export const COVER_PRICE: Record<Level, number> = {
  low: 5,
  med: 10,
  high: 20,
};

/** Drink price multiplier by level (applied to DRINK_BASE). */
export const DRINK_MULT: Record<Level, number> = {
  low: 0.8,
  med: 1.0,
  high: 1.4,
};

export const DRINK_BASE = 8; // $ per drink at mult 1.0
export const AVG_DRINKS_PER_GUEST = 2.0;

/** Service: each bartender can fully serve this many guests per night. */
export const SERVICE_PER_BARTENDER = 90;
export const WAGE_PER_BARTENDER = 120;
export const MAX_BARTENDERS = 6;

export const SECURITY_COST: Record<SecurityLevel, number> = {
  1: 100,
  2: 220,
  3: 380,
};

/** Lower = fewer/softer incidents. */
export const SECURITY_MOD: Record<SecurityLevel, number> = {
  1: 1.0,
  2: 0.6,
  3: 0.35,
};

/** How well each music style fits the generic incoming crowd (vibe baseline). */
export const MUSIC_FIT: Record<MusicStyle, number> = {
  house: 1.05,
  hiphop: 1.02,
  pop: 1.1,
  techno: 0.95,
};

export const MUSIC_LABEL: Record<MusicStyle, string> = {
  house: 'House',
  hiphop: 'Hip-Hop',
  pop: 'Pop',
  techno: 'Techno',
};

// --- Risk / compliance (satirical risk surface, not real-world instruction) ---
export const RELAXED_SMOKING_RISK = 0.08; // added incident chance
export const COMPLIANCE_FINE_CHANCE = 0.1; // chance of an "inspector" fine
export const COMPLIANCE_FINE = 300;
export const INCIDENT_FINE = 80; // per incident
/** Upside of a relaxed smoking policy: part of the crowd prefers it. The dial
 *  is a genuine gamble — more guests now vs. fine + reputation risk. */
export const SMOKING_RELAXED_DRAW = 0.1; // attendance multiplier bonus

// --- Reputation drift ---
// repDelta = round((S - REP_ANCHOR) * REP_GAIN_K - incidents*hit - compliance*hit)
// where S is a 0-100 satisfaction index blending the components below.
export const REP_ANCHOR = 55; // a night must beat this to gain reputation
export const REP_GAIN_K = 0.2; // how fast reputation moves per satisfaction point
export const INCIDENT_REP_HIT = 2; // reputation lost per incident
export const COMPLIANCE_REP_HIT = 4; // reputation lost when fined by an inspector
export const SAT_WEIGHTS = {
  vibe: 0.35,
  loyalty: 0.3,
  service: 0.15,
  vip: 0.2,
} as const;
/** Neutral VIP satisfaction used when the player isn't courting VIPs. */
export const VIP_NEUTRAL = 60;

// --- VIP ---
export const VIP_MIN_REPUTATION = 40;
export const VIP_SPEND_PER_GUEST = 6;

// --- Reputation tiers (label only) ---
export const REPUTATION_TIERS: { min: number; label: string }[] = [
  { min: 80, label: 'Best in the City' },
  { min: 60, label: 'City Favorite' },
  { min: 40, label: 'Rising Name' },
  { min: 20, label: 'Local Spot' },
  { min: 0, label: "Nobody's Club" },
];

export function reputationTier(reputation: number): string {
  return REPUTATION_TIERS.find((t) => reputation >= t.min)?.label ?? "Nobody's Club";
}

/** The guaranteed costs of opening tonight (wages + security), independent of
 *  how the night goes. Used to pay staff and to gate against bankruptcy. */
export function nightFixedCosts(config: Pick<DayConfig, 'bartenders' | 'securityLevel'>): number {
  return config.bartenders * WAGE_PER_BARTENDER + SECURITY_COST[config.securityLevel];
}

/** The cheapest possible night (1 bartender, light security). The shop reserves
 *  at least this much so a purchase can never soft-lock the player out of
 *  opening — a minimum night is always affordable and always profitable. */
export const MIN_NIGHT_COST = nightFixedCosts({ bartenders: 1, securityLevel: 1 });

/** Default day config used for a brand-new club. */
export const DEFAULT_DAY_CONFIG: DayConfig = {
  music: 'house',
  coverLevel: 'low',
  drinkLevel: 'med',
  bartenders: 2,
  securityLevel: 1,
  vipFocus: false,
  smoking: 'strict',
};
