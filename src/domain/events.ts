/**
 * Events (Phase 2B). Pure domain — no React, no I/O, no RNG.
 *
 * An event is a modifier VECTOR that re-weights the Phase 2A night (see
 * docs/phase2-scope.md). Quiet Night (`regular`) is the all-neutral identity, so
 * Quiet-Night-only play reproduces the Phase 2A baseline exactly.
 *
 * Three independent gates (all derived from ClubState — no persisted state):
 *  - Unlock:      reputation tier OR tutorial milestone only. Controls visibility.
 *  - Requirement: hard block — can the event fee be paid while keeping a minimum
 *                 next night in reserve. The only hard block.
 *  - Readiness:   advisory only, never blocks. Warns from current roster/cash.
 */

import * as B from '@/domain/balance';
import { crewPotential, minViableNightCost } from '@/domain/staff';
import type { ClubState, DayConfig, EventDef, EventId, ResultNote } from '@/domain/types';
import { aggregateEffects } from '@/domain/upgrades';

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

// --- Catalog (modifier vectors; baselines tuned against the harness) ---------

export const EVENTS: Record<EventId, EventDef> = {
  regular: {
    id: 'regular',
    name: 'Quiet Night',
    description: 'A normal night. No promises, no pressure.',
    cost: 0,
    bookingFee: 0,
    drawMod: 1,
    spendMod: 1,
    riskMod: 0,
    repMod: 0,
    repAmplify: 1,
  },
  // Private Party = an OUTSIDE GROUP'S BOOKING REQUEST you accept (someone wants
  // the room): a guaranteed fee for a calm, capped night, kept only if you deliver.
  // (A player-invented "Theme Party" — owner-hosted themed nights — is FUTURE; do
  // not build it here. See docs/design/event-bible.md.) Copy only; math unchanged.
  'private-party': {
    id: 'private-party',
    name: 'Private Party (Booking)',
    description: 'Someone wants to book the room tonight — a guaranteed fee for a calm, capped night, kept only if you deliver. Less public hype, more service pressure.',
    cost: 0,
    bookingFee: 400,
    drawMod: 0.6,
    spendMod: 0.7,
    riskMod: -0.05,
    repMod: 0,
    repAmplify: 0.5,
  },
  'student-night': {
    id: 'student-night',
    name: 'Student Night',
    description: 'Cheap entry, a packed floor, and very thin tabs.',
    cost: 80,
    bookingFee: 0,
    drawMod: 1.35,
    spendMod: 0.65,
    riskMod: 0.08,
    repMod: 0,
    repAmplify: 1,
  },
  'grand-opening': {
    id: 'grand-opening',
    name: 'Grand Opening / Re-Launch',
    description: 'Spend big to make tonight a statement — triumph or public flop.',
    cost: 850, // raised from 600: a real bet, not a repeatable cash printer
    bookingFee: 0,
    drawMod: 1.5,
    spendMod: 1.1,
    riskMod: 0.1, // raised from 0.06: a big crowd on a thin door bites harder
    repMod: 0,
    repAmplify: 1.8, // symmetric: amplifies wins AND losses
  },
  'industry-night': {
    id: 'industry-night',
    name: 'Industry Night',
    description: "Host the scene's insiders — a reputation investment, not a cash night. You pay to grow your name, if you deliver.",
    cost: 250,
    bookingFee: 0,
    drawMod: 0.7,
    spendMod: 1.2,
    riskMod: 0,
    repMod: 2,
    repAmplify: 1.6,
  },
};

export function getEvent(id: EventId): EventDef {
  return EVENTS[id];
}

/**
 * A booking fee (Private Party) is no longer guaranteed — the private client
 * pays in full only for a well-run night. Poor service refunds proportionally;
 * incidents, no-shows, and theft draw complaints. Bad execution can push the
 * effective fee negative (a refund + damages). Returns 0 for events with no fee
 * (so Quiet Night and the rest are completely unaffected). Pure, no RNG.
 */
export interface BookingContext {
  serviceRatio: number;
  incidents: number;
  noShows: number;
  theft: number;
}
export function effectiveBookingFee(event: EventDef, ctx: BookingContext): number {
  if (event.bookingFee <= 0) return 0;
  let quality = 1;
  quality -= (1 - clamp(ctx.serviceRatio, 0, 1)) * 1.0; // slow service = partial refund
  quality -= ctx.incidents * 0.3; // each incident is a complaint
  quality -= ctx.noShows * 0.25; // under-delivered staffing
  if (ctx.theft > 0) quality -= 0.25; // skimming the private tab gets noticed
  quality = clamp(quality, -0.5, 1);
  return Math.round(event.bookingFee * quality);
}

// --- Unlock (reputation tier OR tutorial milestone only) ---------------------

const UNLOCK: Record<EventId, (club: ClubState) => boolean> = {
  regular: () => true, // always; the baseline
  'private-party': (c) => c.day >= 2, // milestone: after Night 1
  'student-night': (c) => c.day >= 4, // milestone: after Night 3 (early loop)
  'grand-opening': (c) => c.reputation >= B.VIP_MIN_REPUTATION, // Rising Name (40)
  'industry-night': (c) => c.reputation >= B.VIP_MIN_REPUTATION, // Rising Name (40)
};

/** Event ids currently visible to the player, in catalog order. */
export function unlockedEvents(club: ClubState): EventDef[] {
  return (Object.keys(EVENTS) as EventId[]).filter((id) => UNLOCK[id](club)).map((id) => EVENTS[id]);
}

export function isUnlocked(club: ClubState, id: EventId): boolean {
  return UNLOCK[id](club);
}

// --- Requirement (the only hard block: reserve-aware affordability) ----------

export interface RequirementStatus {
  met: boolean;
  reason?: string;
}

/** A paid event must leave at least one minimum next night in reserve. Free
 *  events (Quiet, Private Party) never block — preserving Phase 2A behavior. */
export function eventRequirement(club: ClubState, id: EventId): RequirementStatus {
  const event = getEvent(id);
  if (event.cost === 0) return { met: true };
  const need = event.cost + minViableNightCost(club.staff);
  return club.cash >= need
    ? { met: true }
    : { met: false, reason: `Need $${need.toLocaleString('en-US')} on hand to risk this.` };
}

// --- Readiness (advisory only — warns, never blocks) -------------------------

export type ReadinessLevel = 'weak' | 'ready' | 'strong';

export interface ReadinessAdvisory {
  level: ReadinessLevel;
  messages: ResultNote[];
}

/** Deterministic projected crowd for the advisory (mirrors the night.ts demand
 *  curve, minus noise). Advisory-only; the resolver remains the source of truth. */
function projectedGuests(club: ClubState, config: DayConfig): number {
  const fx = aggregateEffects(club.ownedUpgradeIds);
  const capacity = club.baseCapacity + fx.capacity;
  const repFactor = B.REP_FLOOR + (1 - B.REP_FLOOR) * (club.reputation / 100);
  const priceLevel = (B.LEVEL_VALUE[config.coverLevel] + B.LEVEL_VALUE[config.drinkLevel]) / 2;
  const priceMod = lerp(1.15, 0.55, priceLevel);
  const musicFit = clamp(B.MUSIC_FIT[config.music] + fx.musicFitBonus, 0.5, 1.3);
  const smokingDraw = config.smoking === 'relaxed' ? B.SMOKING_RELAXED_DRAW : 0;
  const event = getEvent(config.eventId);
  const expected = capacity * repFactor * priceMod * musicFit * (1 + smokingDraw) * event.drawMod;
  return clamp(Math.round(expected), 0, capacity);
}

/**
 * Plain-language read on whether the current roster/cash suit tonight's event.
 * NEVER blocks (high-stakes events unlock by reputation even when unready — the
 * warning must be clear, but the player may still gamble).
 */
export function eventReadiness(club: ClubState, config: DayConfig): ReadinessAdvisory {
  const event = getEvent(config.eventId);
  const messages: ResultNote[] = [];
  let weak = false;

  const guests = projectedGuests(club, config);
  const { service, bouncerUnits } = crewPotential(club.staff, config.staffOnDuty);
  const capacity = club.baseCapacity + aggregateEffects(club.ownedUpgradeIds).capacity;
  const pressure = capacity > 0 ? guests / capacity : 0;

  // Always tell the player roughly what to expect, plus each niche event's nature.
  messages.push({ tone: 'info', text: `Expect roughly ${guests} guests tonight.` });
  if (config.eventId === 'private-party') {
    messages.push({ tone: 'info', text: "A group wants to book the room — you accept the booking. Guaranteed fee, but a sloppy night refunds it. Best when your own crowd would be thin." });
  } else if (config.eventId === 'industry-night') {
    messages.push({ tone: 'info', text: "You'll likely spend more than you earn — this buys reputation, not cash." });
  }

  if (guests > service * 1.05) {
    weak = true;
    messages.push({ tone: 'warn', text: `The bar may not keep up with ~${guests} guests — add a bartender.` });
  }
  if (pressure > 0.7 && bouncerUnits < 1) {
    weak = true;
    messages.push({ tone: 'warn', text: 'A big crowd with a thin door invites trouble — add a bouncer.' });
  }
  if (event.cost > 0 && club.cash < event.cost + 2 * minViableNightCost(club.staff)) {
    messages.push({ tone: 'warn', text: 'Thin cash buffer for a paid event — a bad night will sting.' });
    if (event.cost >= 400) weak = true;
  }
  if (config.eventId === 'student-night' && B.LEVEL_VALUE[config.coverLevel] >= 1) {
    weak = true;
    messages.push({ tone: 'warn', text: 'High cover will scare off the student crowd.' });
  }

  if (weak) return { level: 'weak', messages };

  const comfortable =
    guests <= service * 0.9 &&
    (bouncerUnits >= 1 || pressure < 0.5) &&
    (event.cost === 0 || club.cash >= event.cost + 3 * minViableNightCost(club.staff));
  if (comfortable) {
    messages.push({ tone: 'good', text: 'Your crew looks ready for this one.' });
    return { level: 'strong', messages };
  }
  messages.push({ tone: 'info', text: 'You can run this, but the margins are tight.' });
  return { level: 'ready', messages };
}

// --- Result flavor (WMT lines tied to the actual outcome) --------------------

export interface EventOutcome {
  serviceRatio: number;
  incidents: number;
  repDelta: number;
  bookingFeePaid?: number; // effective fee kept (Private Party)
  bookingFeeMax?: number; // the fee on offer
}

/** One in-world result line per event, chosen by what actually happened. */
export function eventResultNotes(id: EventId, o: EventOutcome): ResultNote[] {
  switch (id) {
    case 'private-party': {
      const paid = o.bookingFeePaid ?? 0;
      const max = o.bookingFeeMax ?? 0;
      if (paid <= 0) {
        return [{ tone: 'bad', text: 'The private night fell apart — you refunded the booking and then some.' }];
      }
      if (paid < max * 0.9) {
        return [{ tone: 'warn', text: "The group that booked the room wasn't fully satisfied — part of the fee came back." }];
      }
      return [{ tone: 'info', text: 'The booking went smoothly — the private group covered a calm, contained night.' }];
    }
    case 'student-night':
      return o.serviceRatio < 0.85
        ? [{ tone: 'bad', text: 'The student crowd swamped the bar — tabs went unpoured.' }]
        : [{ tone: 'info', text: 'Cheap entry, packed floor, paper-thin tabs.' }];
    case 'grand-opening':
      return o.repDelta >= 0
        ? [{ tone: 'good', text: "The re-launch landed — the city's talking about you." }]
        : [{ tone: 'bad', text: 'A very public stumble — the spotlight stung.' }];
    case 'industry-night':
      return o.repDelta >= 0
        ? [{ tone: 'good', text: 'The industry crowd noticed the polish — reputation rose more than cash tonight.' }]
        : [{ tone: 'warn', text: 'The industry crowd judged you and left unimpressed.' }];
    default:
      return [];
  }
}
