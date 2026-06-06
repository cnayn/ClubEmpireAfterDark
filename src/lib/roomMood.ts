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
