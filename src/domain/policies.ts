/**
 * Club Policies v1 — four simple pre-night rules that nudge an ALREADY-computed
 * night using existing variables only. Pure, bounded, and NEUTRAL at the middle
 * option of each policy, so a default config reproduces the pre-policies night
 * exactly (identity-preserving). No new RNG, no save-schema requirement (the
 * field is optional; absence = neutral).
 */

import type {
  BarServiceStyle,
  IdPolicy,
  PoliciesConfig,
  SecurityPosture,
  SmokingPolicy,
  SmokingRule,
} from './types';

export const DEFAULT_POLICIES: PoliciesConfig = {
  smoking: 'restricted', // maps to legacy 'strict' — neutral
  idCheck: 'standard',
  security: 'balanced',
  barService: 'standard',
};

/** The owner's smoking rule maps onto the existing binary smoking lever so the
 *  resolver's established smoking math (draw + fine/incident risk) is reused. */
export function legacySmoking(rule: SmokingRule): SmokingPolicy {
  return rule === 'allowed' ? 'relaxed' : 'strict';
}

/** Bounded modifier vector applied to existing night quantities. All multipliers
 *  1 / adds 0 when every policy is on its neutral middle option. */
export interface PolicyEffects {
  drawMod: number; // × attendance
  incidentMod: number; // × incident chance
  barRevenueMod: number; // × bar revenue
  vibeAdd: number; // + vibe points (→ satisfaction → reputation)
}

export function policyEffects(policies?: PoliciesConfig): PolicyEffects {
  const p = policies ?? DEFAULT_POLICIES;
  let drawMod = 1;
  let incidentMod = 1;
  let barRevenueMod = 1;
  let vibeAdd = 0;

  // Smoking — the draw + main risk ride on the legacy smoking lever (see
  // legacySmoking); here we only add the small vibe / safety nuance that
  // distinguishes Allowed / Restricted / Banned.
  if (p.smoking === 'allowed') vibeAdd += 2;
  else if (p.smoking === 'banned') {
    vibeAdd -= 3;
    incidentMod *= 0.95;
  }

  // ID strictness — looser door pulls more guests but more trouble.
  if (p.idCheck === 'relaxed') {
    drawMod *= 1.08;
    incidentMod *= 1.25;
  } else if (p.idCheck === 'strict') {
    drawMod *= 0.92;
    incidentMod *= 0.7;
  }

  // Security posture — friendlier room vs. tighter control.
  if (p.security === 'friendly') {
    incidentMod *= 1.2;
    vibeAdd += 4;
  } else if (p.security === 'hardline') {
    incidentMod *= 0.7;
    vibeAdd -= 5;
  }

  // Bar service style — throughput vs. care.
  if (p.barService === 'fast') {
    barRevenueMod *= 1.1;
    vibeAdd -= 4;
  } else if (p.barService === 'premium') {
    barRevenueMod *= 0.9;
    vibeAdd += 5;
  }

  return { drawMod, incidentMod, barRevenueMod, vibeAdd };
}

// --- UI metadata (Day Prep) ---------------------------------------------------

export const POLICY_OPTIONS = {
  smoking: [
    { value: 'allowed' as SmokingRule, label: 'Allowed' },
    { value: 'restricted' as SmokingRule, label: 'Restricted' },
    { value: 'banned' as SmokingRule, label: 'Banned' },
  ],
  idCheck: [
    { value: 'relaxed' as IdPolicy, label: 'Relaxed' },
    { value: 'standard' as IdPolicy, label: 'Standard' },
    { value: 'strict' as IdPolicy, label: 'Strict' },
  ],
  security: [
    { value: 'friendly' as SecurityPosture, label: 'Friendly' },
    { value: 'balanced' as SecurityPosture, label: 'Balanced' },
    { value: 'hardline' as SecurityPosture, label: 'Hardline' },
  ],
  barService: [
    { value: 'fast' as BarServiceStyle, label: 'Fast Pour' },
    { value: 'standard' as BarServiceStyle, label: 'Standard' },
    { value: 'premium' as BarServiceStyle, label: 'Premium Care' },
  ],
};

export const POLICY_LABEL: Record<keyof PoliciesConfig, string> = {
  smoking: 'Smoking',
  idCheck: 'ID Strictness',
  security: 'Security Posture',
  barService: 'Bar Service',
};

export const POLICY_BLURB: { [K in keyof PoliciesConfig]: Record<PoliciesConfig[K], string> } = {
  smoking: {
    allowed: 'Lifts the vibe; higher inspection / fine risk.',
    restricted: 'Balanced — the safe middle.',
    banned: 'Cleaner room; a little less crowd energy.',
  },
  idCheck: {
    relaxed: 'More guests in — but more incidents and fines.',
    standard: 'Balanced — the safe middle.',
    strict: 'Fewer guests; a cleaner, calmer door.',
  },
  security: {
    friendly: 'Warmer guest mood; weaker incident prevention.',
    balanced: 'Balanced — the safe middle.',
    hardline: 'Fewer incidents; the room can feel tense.',
  },
  barService: {
    fast: 'More bar revenue; service feels rough.',
    standard: 'Balanced — the safe middle.',
    premium: 'Better mood / reputation; the bar runs slower.',
  },
};
