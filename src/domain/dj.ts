/**
 * DJ Booking v1 — the music act the owner books for the night. Tiny, bounded, and
 * NEUTRAL at House Playlist (and when absent), so a default night is byte-identical
 * to before. NOT a DJ career / staff role / loyalty / relationship system: it's a
 * single pre-night choice with one upfront fee and a bounded modifier vector that
 * reuses existing night quantities (draw, bar revenue, vibe, incident risk).
 */

import type { DjBookingId } from './types';

export const DEFAULT_DJ: DjBookingId = 'house';

/** Upfront fee to book the act (like an event fee / stock order). House is free,
 *  so a lean recovery night is always openable. */
const COST: Record<DjBookingId, number> = { house: 0, local: 90, hype: 220 };
export function djCost(dj: DjBookingId | undefined): number {
  return COST[dj ?? DEFAULT_DJ];
}

/** Extra vibe the "Push the DJ" boss action lands when a real act is on the decks
 *  — a house playlist has nothing to push. Bounded. */
const PUSH_BONUS: Record<DjBookingId, number> = { house: 0, local: 5, hype: 10 };
export function djPushBonus(dj: DjBookingId | undefined): number {
  return PUSH_BONUS[dj ?? DEFAULT_DJ];
}

export interface DjEffects {
  drawMod: number; // × attendance (a name pulls a crowd)
  barRevenueMod: number; // × bar revenue
  vibeAdd: number; // + vibe → satisfaction → reputation
  riskAdd: number; // + incident chance (a hot room runs hotter)
}

/**
 * Bounded runtime effects. House = neutral (identity-preserving). Local = a small
 * balanced lift. Hype = a stronger crowd-energy lift for a higher fee and a touch
 * more risk. Gentle enough never to overpower crew/policies/drinks/furniture.
 */
export function djEffects(dj: DjBookingId | undefined): DjEffects {
  switch (dj ?? DEFAULT_DJ) {
    case 'local':
      return { drawMod: 1.03, barRevenueMod: 1.0, vibeAdd: 3, riskAdd: 0 };
    case 'hype':
      return { drawMod: 1.07, barRevenueMod: 1.02, vibeAdd: 6, riskAdd: 0.03 };
    case 'house':
    default:
      return { drawMod: 1, barRevenueMod: 1, vibeAdd: 0, riskAdd: 0 };
  }
}

// --- UI metadata (Day Prep + Floor) ------------------------------------------

export const DJ_OPTIONS: { value: DjBookingId; label: string }[] = [
  { value: 'house', label: 'House Playlist' },
  { value: 'local', label: 'Local DJ' },
  { value: 'hype', label: 'Hype DJ' },
];

export const DJ_BLURB: Record<DjBookingId, string> = {
  house: 'Free and steady — no act to pay, but the room never really peaks.',
  local: 'A reliable booking — balanced energy for a fair fee.',
  hype: 'A name on the decks — bigger crowd and energy, higher fee and a touch more risk.',
};

/** Short label for the DJ booth on the floor. */
export const DJ_FLOOR_LABEL: Record<DjBookingId, string> = {
  house: 'House playlist',
  local: 'Local DJ',
  hype: 'Hype DJ',
};
