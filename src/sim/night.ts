/**
 * The heart of the game: resolving one night.
 *
 * PURE — no React, no I/O, no Math.random. Given the current club state, the
 * player's day config, and a seed, it returns a NightResult plus the next
 * persisted ClubState. Fully unit-testable. See docs/economy.md for the model.
 *
 * Phase 2A: staffing comes from the named roster (config.staffOnDuty) instead of
 * abstract bartender/security levers. RNG ORDER (R3, determinism): staff no-shows
 * are resolved first but consume RNG only for unreliable staff; theft is resolved
 * last and consumes RNG only for dishonest bartenders. So Regular Night + the
 * honest/reliable starting roster produces a stream identical to the pre-Phase-2
 * resolver, keeping the early-game balance bit-exact.
 */

import * as B from '@/domain/balance';
import { effectiveBookingFee, eventResultNotes, getEvent } from '@/domain/events';
import { crowdEffects, crowdMix } from '@/domain/crowd';
import { regularBaseEffects, updateRegularBase } from '@/domain/regulars';
import { djCost, djEffects } from '@/domain/dj';
import { drinkPrepEffects, stockCost } from '@/domain/drinks';
import { policyEffects } from '@/domain/policies';
import { venueEffects, venueStats } from '@/domain/furniture';
import { aggregateOnDuty, resolveTheft, wagesForOnDuty } from '@/domain/staff';
import type { ClubState, DayConfig, NightResult, ResultNote } from '@/domain/types';
import { aggregateEffects } from '@/domain/upgrades';
import { createRng } from './rng';

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export interface NightOutcome {
  result: NightResult;
  nextClub: ClubState;
}

/**
 * Optional, isolated mid-night intervention modifier (one live-night beat). It is
 * a DETERMINISTIC modifier vector applied to already-computed quantities — it adds
 * NO rng calls, so the RNG stream and every chance() outcome are unchanged. The
 * default is a no-op, so `resolveNight` with no intervention is byte-identical to
 * before (existing tests/balance untouched). See src/lib/intervention.ts.
 */
export interface Intervention {
  vibeBonus: number; // + to vibe → satisfaction → reputation
  revenueMod: number; // × bar revenue (crowd pushed to the bar)
}
export const NO_INTERVENTION: Intervention = { vibeBonus: 0, revenueMod: 1 };

export function resolveNight(
  club: ClubState,
  config: DayConfig,
  seed: number,
  intervention: Intervention = NO_INTERVENTION
): NightOutcome {
  const rng = createRng(seed);
  const fx = aggregateEffects(club.ownedUpgradeIds);

  // --- Staff: who showed, and what the crew is worth (no-show draws first) ---
  const crew = aggregateOnDuty(club.staff, config.staffOnDuty, rng);

  // Club Policies v1: a bounded modifier vector applied to already-computed
  // quantities below. Neutral (×1 / +0) for default/standard policies, so the
  // baseline night is unchanged. No new RNG draws.
  const pe = policyEffects(config.policies);
  // Venue / Furniture v1: gentle bounded draw + vibe from equipped furniture.
  // Empty venue ⇒ neutral (×1 / +0), so a bare club is unchanged.
  const ve = venueEffects(venueStats(club.venue));
  // Crowd Identity v1: a Locals-anchored crowd mix nudges draw/incident/vibe a
  // little, bounded. Derived from this night's setup (no persisted state).
  const cm = crowdMix(club, config);
  const ce = crowdEffects(cm);
  // Regulars Persistence v1: the loyalty already built nudges the night gently.
  // Empty/absent base ⇒ neutral (×1 / +0), so a club with no regulars is unchanged.
  const re = regularBaseEffects(club.regularBase);
  // DJ Booking v1: the booked act lifts draw / vibe / bar a little. House (and
  // absent) ⇒ neutral (×1 / +0 / fee 0), so a default night is byte-identical.
  const dj = djEffects(config.dj);

  // Tonight's event is a deterministic modifier vector (no new RNG draws).
  // Quiet Night (`regular`) is all-neutral, so its path is identical to Phase 2A.
  const event = getEvent(config.eventId);

  const capacity = club.baseCapacity + fx.capacity;
  const repFactor = B.REP_FLOOR + (1 - B.REP_FLOOR) * (club.reputation / 100);

  // --- Attendance (demand curve) ---
  const coverV = B.LEVEL_VALUE[config.coverLevel];
  const drinkV = B.LEVEL_VALUE[config.drinkLevel];
  const priceLevel = (coverV + drinkV) / 2;
  const priceMod = lerp(1.15, 0.55, priceLevel);
  const musicFit = clamp(B.MUSIC_FIT[config.music] + fx.musicFitBonus, 0.5, 1.3);
  const smokingDraw = config.smoking === 'relaxed' ? B.SMOKING_RELAXED_DRAW : 0;
  const noise = rng.range(0.9, 1.1);

  const expected = capacity * repFactor * priceMod * musicFit * (1 + smokingDraw) * event.drawMod * noise * pe.drawMod * ve.drawMod * ce.drawMod * re.drawMod * dj.drawMod;
  const guests = clamp(Math.round(expected), 0, capacity);

  // --- Service capacity (bartenders gate bar revenue) ---
  const serviceCapacity = crew.service + fx.serviceBartenders * B.SERVICE_PER_BARTENDER;
  const serviceRatio = guests > 0 ? clamp(serviceCapacity / guests, 0, 1) : 1;
  // Service headroom (fix #12): surplus coverage beyond the 1.0 cap rewards
  // more/better crew with a small bounded bonus (shorter waits). 0 when at-or-
  // under capacity, so understaffed and empty nights are unaffected.
  const serviceHeadroom = guests > 0 ? clamp(serviceCapacity / guests - 1, 0, 1) : 0;
  const headroomRevenueMod = 1 + serviceHeadroom * B.SERVICE_HEADROOM_REVENUE;

  // Drink Prep v1: stock + quality. Neutral at Standard + House (and absent), so
  // the baseline night is unchanged. `fill` decides lean/heavy stock pressure.
  const fillForStock = capacity > 0 ? guests / capacity : 0;
  const dp = drinkPrepEffects(config.drinkPrep, fillForStock);
  const stock = stockCost(config.drinkPrep, capacity); // upfront, like an event fee

  // Bartender QUALITY lifts (or dents) bar revenue beyond raw throughput — a
  // sharper crew gets more value per guest even when service isn't the cap.
  // Centered on BASELINE_SKILL, so the starting roster (skill 50) is exactly
  // neutral (×1.0); bounded by BARTENDER_QUALITY_MIN/MAX.
  const showedBar = crew.showedBartenders;
  const avgBarSkill = showedBar.length
    ? showedBar.reduce((sum, m) => sum + m.skill, 0) / showedBar.length
    : B.BASELINE_SKILL;
  const barQualityMod = clamp(
    1 + (avgBarSkill / B.BASELINE_SKILL - 1) * B.BARTENDER_QUALITY_WEIGHT,
    B.BARTENDER_QUALITY_MIN,
    B.BARTENDER_QUALITY_MAX
  );

  // --- Revenue ---
  const coverPrice = B.COVER_PRICE[config.coverLevel];
  const drinkMult = B.DRINK_MULT[config.drinkLevel];
  // high drink prices slightly suppress drinks ordered
  const avgDrinks = B.AVG_DRINKS_PER_GUEST * lerp(1.1, 0.85, drinkV);

  const coverRevenue = Math.round(guests * coverPrice);
  const barRevenue = Math.round(
    guests * B.DRINK_BASE * drinkMult * avgDrinks * serviceRatio * barQualityMod * headroomRevenueMod * pe.barRevenueMod * dp.barRevenueMod * dj.barRevenueMod * event.spendMod * intervention.revenueMod
  );

  // --- Incidents & risk (security mod derives from on-duty bouncers) ---
  const crowdPressure = capacity > 0 ? guests / capacity : 0;
  const securityMod = B.bouncerSecurityMod(crew.bouncerUnits) * (fx.securityDiscount ? 0.8 : 1);
  const riskFromSmoking = config.smoking === 'relaxed' ? B.RELAXED_SMOKING_RISK : 0;
  const incidentChance = clamp((crowdPressure * 0.5 * securityMod + riskFromSmoking + event.riskMod + dj.riskAdd) * pe.incidentMod * ce.incidentMod * re.incidentMod, 0, 0.9);

  let incidents = 0;
  if (rng.chance(incidentChance)) {
    incidents = rng.int(1, 1 + Math.round(crowdPressure * 2));
  }
  const incidentFines = incidents * B.INCIDENT_FINE;
  const complianceFines =
    config.smoking === 'relaxed' && rng.chance(B.COMPLIANCE_FINE_CHANCE * crew.complianceMult)
      ? B.COMPLIANCE_FINE
      : 0;
  const fines = incidentFines + complianceFines;

  // --- VIP ---
  const vipEligible = config.vipFocus && club.reputation >= B.VIP_MIN_REPUTATION;
  const vipSatisfaction = config.vipFocus
    ? clamp(50 + club.reputation * 0.4 - crowdPressure * 20, 0, 100)
    : clamp(40 - (club.reputation >= B.VIP_MIN_REPUTATION ? 15 : 0), 0, 100);
  const vipBonus = vipEligible
    ? Math.round(guests * B.VIP_SPEND_PER_GUEST * (vipSatisfaction / 100) * (fx.vipBonus ? 1.6 : 1))
    : 0;

  // --- Theft (dishonest bartenders skim; draws last, only for thieves) ---
  const theftOutcome = resolveTheft(crew.showedBartenders, barRevenue, rng);
  const theft = theftOutcome.theft;

  // A booking fee (Private Party) is conditional on execution — see events.ts.
  // Zero for events without a fee, so Quiet Night et al. are unaffected.
  const bookingFee = effectiveBookingFee(event, { serviceRatio, incidents, noShows: crew.noShows, theft });

  const revenue = coverRevenue + barRevenue + vipBonus + bookingFee;

  // --- Costs ---
  const wages = wagesForOnDuty(club.staff, config.staffOnDuty);
  const djFee = djCost(config.dj); // upfront, like an event fee / stock order
  const costs = wages + fines + theft + event.cost + stock + djFee;
  const net = revenue - costs;

  // --- Satisfaction → reputation ---
  const vibe = clamp(50 + (musicFit - 1) * 100 + fx.vibeBonus + intervention.vibeBonus + pe.vibeAdd + dp.vibeAdd + ve.vibeAdd + ce.vibeAdd + re.vibeAdd + dj.vibeAdd + serviceHeadroom * B.SERVICE_HEADROOM_VIBE, 0, 100);
  const regularLoyalty = clamp(70 - priceLevel * 30 - incidents * 8 + (musicFit - 1) * 100, 0, 100);
  const serviceQuality = serviceRatio * 100;
  const vipComponent = config.vipFocus ? vipSatisfaction : B.VIP_NEUTRAL;

  const w = B.SAT_WEIGHTS;
  const satisfaction =
    w.vibe * vibe + w.loyalty * regularLoyalty + w.service * serviceQuality + w.vip * vipComponent;

  // Spotlight events amplify the WHOLE swing (wins and losses), plus a flat nudge.
  // Quiet Night has repAmplify 1 / repMod 0, so this collapses to the 2A formula.
  const baseRepSwing =
    (satisfaction - B.REP_ANCHOR) * B.REP_GAIN_K -
    incidents * B.INCIDENT_REP_HIT -
    (complianceFines > 0 ? B.COMPLIANCE_REP_HIT : 0);
  const repDelta = Math.round(baseRepSwing * event.repAmplify + event.repMod);
  const reputationBefore = club.reputation;
  const reputationAfter = clamp(reputationBefore + repDelta, 0, 100);

  const eventNotes = eventResultNotes(config.eventId, {
    serviceRatio,
    incidents,
    repDelta: reputationAfter - reputationBefore,
    bookingFeePaid: bookingFee,
    bookingFeeMax: event.bookingFee,
  });

  const notes = buildNotes({
    guests,
    capacity,
    crowdPressure,
    serviceRatio,
    incidents,
    complianceFines,
    vipEligible,
    vipFocus: config.vipFocus,
    priceLevel,
    net,
    repDelta: reputationAfter - reputationBefore,
    // Event line first, then staff-driven reveals (no-shows, theft).
    staffNotes: [...eventNotes, ...crew.notes, ...theftOutcome.notes],
  });

  const result: NightResult = {
    day: club.day,
    guests,
    capacity,
    revenue,
    costs,
    net,
    coverRevenue,
    barRevenue,
    vipBonus,
    wages,
    theft,
    fines,
    incidents,
    noShows: crew.noShows,
    eventId: config.eventId,
    eventCost: event.cost,
    bookingFee,
    reputationBefore,
    reputationAfter,
    reputationDelta: reputationAfter - reputationBefore,
    vipSatisfaction: Math.round(vipSatisfaction),
    regularLoyalty: Math.round(regularLoyalty),
    serviceRatio,
    notes,
  };

  const nextClub: ClubState = {
    ...club,
    day: club.day + 1,
    cash: club.cash + net,
    reputation: reputationAfter,
    lastConfig: config,
    // Regulars Persistence v1: who came back, drifted gently from tonight.
    regularBase: updateRegularBase(club.regularBase, cm, {
      reputationDelta: reputationAfter - reputationBefore,
      serviceRatio,
      incidents,
      fines,
      noShows: crew.noShows,
    }),
  };

  return { result, nextClub };
}

interface NoteInput {
  guests: number;
  capacity: number;
  crowdPressure: number;
  serviceRatio: number;
  incidents: number;
  complianceFines: number;
  vipEligible: boolean;
  vipFocus: boolean;
  priceLevel: number;
  net: number;
  repDelta: number;
  staffNotes: ResultNote[];
}

/**
 * Generate a few explanatory notes so the player sees *why*. Ordering matters:
 * the decision-relevant lines (event outcome, theft/no-show reveals, why
 * reputation moved, incidents) come first so they survive the cap; generic
 * crowd/service texture follows.
 */
function buildNotes(i: NoteInput): ResultNote[] {
  const notes: ResultNote[] = [];

  // 1. Event outcome + staff-caused reveals (no-shows, theft) — most important.
  notes.push(...i.staffNotes);

  // 2. Why reputation moved. Incident/compliance drops are explained by their own
  //    lines below; here we cover clean growth and non-obvious slips.
  if (i.repDelta >= 2) {
    notes.push({ tone: 'good', text: 'Regulars left happy — your name grew around the neighborhood.' });
  } else if (i.repDelta <= -2 && i.incidents === 0 && i.complianceFines === 0) {
    notes.push({ tone: 'bad', text: 'The crowd left underwhelmed — your reputation slipped tonight.' });
  }

  // 3. Incidents / compliance (cost + reputation hit).
  if (i.incidents > 0) {
    notes.push({
      tone: 'bad',
      text:
        i.incidents === 1
          ? 'A scuffle at the bar — security handled it, but it cost you.'
          : `${i.incidents} incidents tonight. The crowd got away from security.`,
    });
  }

  if (i.complianceFines > 0) {
    notes.push({ tone: 'warn', text: 'An inspector dropped by. The relaxed policy earned you a fine.' });
  }

  // 4. Crowd + service texture.
  if (i.guests >= i.capacity) {
    notes.push({ tone: 'warn', text: 'Packed to the rafters — you turned people away at the door.' });
  } else if (i.crowdPressure < 0.3) {
    notes.push({ tone: 'bad', text: 'The floor felt empty tonight. Word still needs to spread.' });
  }

  if (i.serviceRatio < 0.85) {
    notes.push({
      tone: 'bad',
      text: 'The bar couldn\'t keep up — drinks (and money) were left on the table.',
    });
  } else if (i.serviceRatio >= 1 && i.guests > 0) {
    notes.push({ tone: 'good', text: 'Bar service was smooth all night.' });
  }

  // 5. VIP / pricing / loss colour.
  if (i.vipFocus && i.vipEligible) {
    notes.push({ tone: 'info', text: 'VIP tables were busy — the big spenders showed up.' });
  } else if (i.vipFocus && !i.vipEligible) {
    notes.push({ tone: 'warn', text: 'You courted VIPs, but the club isn\'t prestigious enough yet.' });
  }

  if (i.priceLevel >= 0.75) {
    notes.push({ tone: 'info', text: 'Premium pricing thinned the crowd but fattened each tab.' });
  }

  if (i.net < 0) {
    notes.push({ tone: 'bad', text: 'You ran at a loss tonight. Rethink staffing or pricing.' });
  }

  return notes.slice(0, 5);
}
