/**
 * Room Mood v1 — Guest Happiness + Staff Morale, derived display reads for the
 * live night. PURE + DETERMINISTIC and PRESENTATION-ONLY: both are 0..1 reads off
 * the deterministic result + live pressures (+ an optional boss-command lift so
 * the meters visibly respond to the owner's calls). No RNG, no resolver change, no
 * save schema, no per-guest sim.
 */

import { venueStats } from '@/domain/furniture';
import type { BossActionId } from '@/lib/bossActions';
import type { NightPressures } from '@/lib/nightPressure';
import type { ClubState, NightResult } from '@/domain/types';

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

/**
 * How happy the room is right now. Driven mostly by floor energy, dragged down by
 * bar/door/bathroom strain and incidents, lifted a little by a nice venue. `lift`
 * is an optional 0..n boss-command nudge (e.g. Work the Room / Push DJ).
 */
export function guestHappiness(result: NightResult, club: ClubState, p: NightPressures, lift = 0): number {
  const v = venueStats(club.venue);
  const venueLift = clamp01((v.style + v.comfort + v.sound) / 12) * 0.15;
  return clamp01(
    0.55 +
      (p.energy - 0.5) * 0.5 -
      p.bar * 0.25 -
      p.door * 0.2 -
      p.bathroom * 0.2 +
      venueLift -
      (result.incidents > 0 ? 0.12 : 0) +
      lift
  );
}

/**
 * How well the crew is holding together. Lifted by crew quality and a lively room;
 * crushed by an overworked bar, door trouble, and a service that fell behind.
 * `lift` is an optional boss-support nudge (Check Bar / Send Bouncer / Work Room).
 */
export function staffMorale(result: NightResult, club: ClubState, p: NightPressures, lift = 0): number {
  const onDuty = club.staff.filter((m) => club.lastConfig.staffOnDuty.includes(m.id));
  const avgSkill = onDuty.length ? onDuty.reduce((s, m) => s + m.skill, 0) / onDuty.length : 50;
  const skillLift = clamp01((avgSkill - 50) / 100) * 0.2;
  return clamp01(
    0.6 +
      skillLift +
      (p.energy - 0.5) * 0.2 -
      p.bar * 0.3 -
      p.door * 0.15 -
      (result.incidents > 0 ? 0.15 : 0) -
      (result.serviceRatio < 0.85 ? 0.1 : 0) +
      lift
  );
}

/**
 * Boss-command lifts to the two mood meters, derived from the actions taken so
 * far tonight. Same-action repeats diminish per call ([1, 0.5, 0.25, 0.1]) so a
 * second Push DJ feels half as strong as the first, a fifth is barely a touch.
 *
 * - Push DJ lifts happiness (music), barely touches morale.
 * - Check Bar lifts both (the bar feels the support).
 * - Send Bouncer lifts morale most (the crew feels covered).
 * - Work the Room is the biggest happiness lift (owner presence).
 *
 * Pure / deterministic. Independent of the resolver — these are display nudges
 * so the player sees their calls land, not new economy.
 */
export function bossLifts(actions: BossActionId[] = []): { happy: number; morale: number } {
  const REPEAT = [1, 0.5, 0.25, 0.1];
  const factor = (n: number) => REPEAT[Math.min(Math.max(0, n - 1), REPEAT.length - 1)];
  const counts: Partial<Record<BossActionId, number>> = {};
  for (const a of actions) counts[a] = (counts[a] ?? 0) + 1;

  const sum = (id: BossActionId, perCall: number): number => {
    const n = counts[id] ?? 0;
    let total = 0;
    for (let i = 1; i <= n; i++) total += perCall * factor(i);
    return total;
  };

  const happy =
    sum('work-room', 0.05) +
    sum('push-dj', 0.04) +
    sum('check-bar', 0.02) +
    sum('send-bouncer', 0.01);
  const morale =
    sum('send-bouncer', 0.05) +
    sum('check-bar', 0.04) +
    sum('work-room', 0.03) +
    sum('push-dj', 0.01);

  return { happy: clamp01(happy), morale: clamp01(morale) };
}

/**
 * Boss-command RELIEF to the live zone pressures, so the floor visibly reacts
 * after a call: Check Bar cools the bar queue, Send Bouncer cools the door,
 * Push DJ warms the floor (energy up), Work the Room lifts energy a touch. Same
 * diminishing-per-repeat as bossLifts. Returns positive magnitudes the caller
 * SUBTRACTS from strain (bar/door) and ADDS to energy — presentation only, no
 * resolver/economy change; the night's books still come from the resolver.
 */
export function bossRelief(actions: BossActionId[] = []): { bar: number; door: number; bathroom: number; energy: number } {
  const REPEAT = [1, 0.5, 0.25, 0.1];
  const factor = (n: number) => REPEAT[Math.min(Math.max(0, n - 1), REPEAT.length - 1)];
  const counts: Partial<Record<BossActionId, number>> = {};
  for (const a of actions) counts[a] = (counts[a] ?? 0) + 1;
  const sum = (id: BossActionId, perCall: number): number => {
    const n = counts[id] ?? 0;
    let total = 0;
    for (let i = 1; i <= n; i++) total += perCall * factor(i);
    return total;
  };
  return {
    bar: clamp01(sum('check-bar', 0.28)),
    door: clamp01(sum('send-bouncer', 0.28)),
    bathroom: 0,
    energy: clamp01(sum('push-dj', 0.22) + sum('work-room', 0.12)),
  };
}
