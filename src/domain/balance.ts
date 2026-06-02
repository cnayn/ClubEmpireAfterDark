/**
 * Central balancing constants for the simulation.
 * ALL economy tuning lives here — the sim reads from this, UI never hardcodes
 * game math. See docs/economy.md for the model and rationale.
 */

import type { Level, MusicStyle, SecurityLevel } from './types';

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

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

/** Service: a baseline-skill bartender fully serves this many guests per night. */
export const SERVICE_PER_BARTENDER = 90;

/** Reference incident multipliers by old security tier; reused by the bouncer
 *  mapping so 1/2/3 effective bouncer units reproduce the old levels. */
export const SECURITY_MOD: Record<SecurityLevel, number> = {
  1: 1.0,
  2: 0.6,
  3: 0.35,
};

// --- Phase 2A: named staff scaling -------------------------------------------
/** A staff member at this skill equals exactly "one unit" of the old abstraction
 *  (one bartender = 90 service; one bouncer = security level 1). */
export const BASELINE_SKILL = 50;

/** Starting-crew salaries, calibrated so the default roster reproduces the old
 *  fixed cost (2 bartenders + 1 bouncer ≈ $340). See docs/phase2-scope.md §D. */
export const STARTING_BARTENDER_SALARY = 120;
export const STARTING_BOUNCER_SALARY = 100;

/** Theft — dishonest bartenders skim a slice of bar revenue (shrinkage). */
export const THEFT_CHANCE_FACTOR = 0.6; // chance = (1 - honesty/100) * factor
export const STICKY_FINGERS_CHANCE_BONUS = 0.2; // extra chance for the hidden trait
export const THEFT_SKIM = 0.15; // fraction of a thief's revenue share taken

/** No-shows — unreliable staff sometimes don't turn up (paid anyway). */
export const NOSHOW_CHANCE_FACTOR = 0.5; // chance = (1 - reliability/100) * factor
export const STEADY_RELIABILITY_BONUS = 10;
export const FLAKY_RELIABILITY_PENALTY = 15;

/** Bouncer effectiveness. Honesty scales a bouncer's effective units; the
 *  Intimidating trait adds a little; no door staff is worse than level 1. */
export const BOUNCER_HONESTY_FLOOR = 0.6; // honesty 0 → 0.6×, honesty 100 → 1.0×
export const INTIMIDATING_UNIT_BONUS = 0.15;
export const NO_BOUNCER_SECURITY_MOD = 1.2; // riskier than the old forced level 1
export const BY_THE_BOOK_COMPLIANCE_MULT = 0.5; // trait halves compliance fine chance

/** Upfront fee to hire from the candidate pool (salary is paid per on-duty night). */
export const HIRE_COST_MULT = 2; // hire fee = round(salary * mult)

/** Map effective bouncer units → incident multiplier, reproducing the old tiers
 *  at integer units (1→1.0, 2→0.6, 3→0.35) and interpolating for skill. */
export function bouncerSecurityMod(units: number): number {
  if (units <= 0) return NO_BOUNCER_SECURITY_MOD;
  if (units <= 1) return lerp(NO_BOUNCER_SECURITY_MOD, SECURITY_MOD[1], units);
  if (units <= 2) return lerp(SECURITY_MOD[1], SECURITY_MOD[2], units - 1);
  if (units <= 3) return lerp(SECURITY_MOD[2], SECURITY_MOD[3], units - 2);
  return SECURITY_MOD[3];
}

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

// Wages, fixed-cost gating, and the default day config now derive from the
// staff roster — see src/domain/staff.ts (wagesForOnDuty, minViableNightCost,
// defaultDayConfig).
