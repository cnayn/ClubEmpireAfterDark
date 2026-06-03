/**
 * Pure, presentation-only derivations for the Dashboard (Floor View + Next Goal).
 * Reads EXISTING game state only — no new sim/saved fields, no RNG, no mutation,
 * and no resolver/economy involvement. Safe to unit-test in isolation.
 */

import { REPUTATION_TIERS } from '@/domain/balance';
import { getEvent } from '@/domain/events';
import { CANDIDATE_POOL, hireCost, minViableNightCost } from '@/domain/staff';
import type { ClubState, EventId, NightResult } from '@/domain/types';
import { aggregateEffects, UPGRADES } from '@/domain/upgrades';

// --- Floor View ---------------------------------------------------------------

export type Density = 'empty' | 'sparse' | 'busy' | 'packed';
/** Vibe keys map to existing events only; the component maps these to colors. */
export type Vibe = 'neutral' | 'contained' | 'rowdy' | 'spotlight' | 'sharp';

export interface FloorStaff {
  id: string;
  name: string;
  initials: string;
}

export interface FloorView {
  capacity: number;
  density: Density;
  /** how many crowd dots to render (capped for layout) */
  dots: number;
  eventId: EventId;
  eventName: string;
  vibe: Vibe;
  bartenders: FloorStaff[]; // on duty only
  bouncers: FloorStaff[]; // on duty only
  hasPlayedNight: boolean;
  lastGuests: number | null;
}

const VIBE: Record<EventId, Vibe> = {
  regular: 'neutral',
  'private-party': 'contained',
  'student-night': 'rowdy',
  'grand-opening': 'spotlight',
  'industry-night': 'sharp',
};

const DOT_CAP = 36; // render cap; the floor stays readable on a phone

function toFloorStaff(m: { id: string; name: string }): FloorStaff {
  return { id: m.id, name: m.name, initials: m.name.slice(0, 2).toUpperCase() };
}

/**
 * Build the Floor View from existing state. Crowd density comes from the last
 * resolved night when one exists; a brand-new club shows a small "quiet start"
 * ambient crowd (a presentation approximation, NOT a sim/saved value).
 */
export function buildFloorView(club: ClubState, lastResult: NightResult | null): FloorView {
  const capacity = club.baseCapacity + aggregateEffects(club.ownedUpgradeIds).capacity;
  const onDuty = club.staff.filter((m) => club.lastConfig.staffOnDuty.includes(m.id));
  const bartenders = onDuty.filter((m) => m.role === 'bartender').map(toFloorStaff);
  const bouncers = onDuty.filter((m) => m.role === 'bouncer').map(toFloorStaff);

  const eventId = club.lastConfig.eventId;
  const hasPlayedNight = !!lastResult;
  const guests = lastResult ? lastResult.guests : 0;
  const ratio = capacity > 0 ? guests / capacity : 0;

  let density: Density;
  let dots: number;
  if (!hasPlayedNight) {
    density = 'sparse'; // quiet, growable starting room — never looks "broken"
    dots = Math.max(3, Math.round(capacity * 0.1));
  } else {
    density = ratio < 0.05 ? 'empty' : ratio < 0.3 ? 'sparse' : ratio < 0.7 ? 'busy' : 'packed';
    dots = Math.min(guests, DOT_CAP);
  }

  return {
    capacity,
    density,
    dots,
    eventId,
    eventName: getEvent(eventId).name,
    vibe: VIBE[eventId],
    bartenders,
    bouncers,
    hasPlayedNight,
    lastGuests: hasPlayedNight ? guests : null,
  };
}

// --- Next Goal ----------------------------------------------------------------

export type GoalKind = 'recovery' | 'almost' | 'tier' | 'growth';

export interface Goal {
  kind: GoalKind;
  title: string;
  detail?: string;
  /** 0..1 progress for an optional bar */
  progress?: number;
}

interface ReachItem {
  name: string;
  cost: number;
}

/** The single unowned upgrade or unhired candidate the player is closest to
 *  affording but can't quite yet (cash in [50%, 100%) of its cost). */
function nearestAlmostAffordable(club: ClubState, cash: number): ReachItem | null {
  const items: ReachItem[] = [];
  for (const u of UPGRADES) {
    if (!club.ownedUpgradeIds.includes(u.id)) items.push({ name: u.name, cost: u.cost });
  }
  for (const c of CANDIDATE_POOL) {
    if (!club.staff.some((m) => m.id === c.id)) items.push({ name: `Hire ${c.name}`, cost: hireCost(c) });
  }
  const near = items
    .filter((i) => cash < i.cost && cash >= i.cost * 0.5)
    .sort((a, b) => cash / b.cost - cash / a.cost);
  return near[0] ?? null;
}

const TIER_UNLOCK: Record<number, string> = {
  20: 'Establish yourself as a Local Spot.',
  40: 'Unlocks bigger events — Grand Opening and Industry Night.',
  60: 'A City Favorite — bigger crowds and standing.',
  80: 'The best club in the city.',
};

function nextTier(reputation: number): { label: string; min: number; unlock: string } | null {
  const next = REPUTATION_TIERS.filter((t) => t.min > reputation).sort((a, b) => a.min - b.min)[0];
  if (!next) return null;
  return { label: next.label, min: next.min, unlock: TIER_UNLOCK[next.min] ?? 'Stronger opportunities ahead.' };
}

const money = (n: number) => `$${n.toLocaleString('en-US')}`;

/**
 * Pick ONE primary goal. Precedence: a recovery interrupt when the club can
 * barely operate, then an almost-affordable upgrade/hire, then the next
 * reputation tier, then a general growth fallback. (Recovery is checked first
 * rather than third because a near-broke club can't pursue anything else.)
 */
export function nextGoal(club: ClubState): Goal {
  const cash = club.cash;

  // Recovery interrupt — below ~two minimum nights of runway.
  if (cash < minViableNightCost(club.staff) * 2) {
    return {
      kind: 'recovery',
      title: 'Rebuild cash after a rough night',
      detail: `${money(cash)} on hand — run a lean, safe night to recover.`,
    };
  }

  // Almost-affordable upgrade or hire.
  const near = nearestAlmostAffordable(club, cash);
  if (near) {
    return {
      kind: 'almost',
      title: `Almost there: ${near.name}`,
      detail: `${money(near.cost)} — you have ${money(cash)}`,
      progress: cash / near.cost,
    };
  }

  // Next reputation tier.
  const tier = nextTier(club.reputation);
  if (tier) {
    return {
      kind: 'tier',
      title: `${tier.label}: ${club.reputation} / ${tier.min}`,
      detail: tier.unlock,
      progress: club.reputation / tier.min,
    };
  }

  // General growth.
  return {
    kind: 'growth',
    title: 'Grow reputation to unlock stronger opportunities',
    detail: 'Run strong nights to keep your name climbing.',
  };
}
