/**
 * Nightclub City layer v1 — the live-arcade reads for the real-time night:
 * a till that visibly fills as the room earns, a guests-inside counter, a
 * prominent HYPE read, a music-match read for the booth, and tappable
 * TROUBLEMAKERS (the classic eject-or-regret night interaction).
 *
 * All of it is pure + deterministic, derived from the no-intervention preview:
 * no RNG, no resolver change, no save-schema change, no dialogue. Troublemaker
 * outcomes fold into the existing bounded `Intervention` surface at commit —
 * eject in time and the room keeps its vibe; let one slip and the books feel it
 * (the reckoning ships in the same slice as the reward).
 */

import { aggregateEffects } from '@/domain/upgrades';
import { MUSIC_FIT, MUSIC_LABEL } from '@/domain/balance';
import { crowdMix, topCrowd } from '@/domain/crowd';
import { liveCrowdFraction } from '@/lib/nightClock';
import type { BeatTone } from '@/lib/timeline';
import type { ClubState, DayConfig, NightResult } from '@/domain/types';
import type { Intervention } from '@/sim/night';

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));
const clamp01 = (n: number) => clamp(n, 0, 1);

// --- Live till (tonight's earnings so far) -----------------------------------

/**
 * Normalized cumulative arrival/earn curve: the closed-form integral of
 * liveCrowdFraction, scaled so S(0)=0 and S(1)=1. Monotone — the till only
 * ever counts UP as the night runs. Piecewise to mirror nightClock's curve:
 * doors (0..0.2), rush (0.2..0.7), peak (0.7..0.85), last call (0.85..1).
 */
export function cumulativeArrivalFraction(progress: number): number {
  const p = clamp01(progress);
  // ∫ liveCrowdFraction over each segment (see liveCrowdFraction for the curve).
  const doors = (x: number) => 0.2 * x + x * x; // f = 0.2 + 2x
  const rush = (x: number) => 0.6 * x + 0.4 * x * x; // f = 0.6 + 0.8x (x from 0.2)
  const peak = (x: number) => x; // f = 1
  const lastCall = (x: number) => x - 1.5 * x * x; // f = 1 - 3x (x from 0.85)
  let area: number;
  if (p < 0.2) area = doors(p);
  else if (p < 0.7) area = doors(0.2) + rush(p - 0.2);
  else if (p < 0.85) area = doors(0.2) + rush(0.5) + peak(p - 0.7);
  else area = doors(0.2) + rush(0.5) + peak(0.15) + lastCall(p - 0.85);
  const total = doors(0.2) + rush(0.5) + peak(0.15) + lastCall(0.15);
  return clamp01(area / total);
}

/** Gross take so far tonight (cover + bar + VIP + booking fee — the same sum
 *  the resolver calls revenue), filling along the arrival curve. Presentation
 *  only — the committed books still come from the resolver, and can land a
 *  little higher when the owner's calls earn a revenue bump (the HUD labels
 *  the live read as an estimate). */
export function liveTill(preview: NightResult, progress: number): number {
  const gross = preview.coverRevenue + preview.barRevenue + preview.vipBonus + preview.bookingFee;
  return Math.round(gross * cumulativeArrivalFraction(progress));
}

/** How many guests are in the room right now (occupancy, not cumulative). */
export function guestsInside(preview: NightResult, progress: number): number {
  return Math.max(0, Math.round(preview.guests * liveCrowdFraction(clamp01(progress))));
}

// --- HYPE — the one big floor read -------------------------------------------

export type HypeTone = 'good' | 'ok' | 'warn' | 'bad';

/** The HYPE bar's state word + tone from live floor energy (0..1). Same
 *  thresholds as the floor meter, with an extra top tier for a flying room. */
export function hypeLevel(energy: number): { label: string; tone: HypeTone } {
  const e = clamp01(energy);
  if (e >= 0.8) return { label: 'ON FIRE', tone: 'good' };
  if (e >= 0.66) return { label: 'HOT', tone: 'good' };
  if (e >= 0.45) return { label: 'ALIVE', tone: 'ok' };
  if (e >= 0.3) return { label: 'WARMING', tone: 'warn' };
  return { label: 'COLD', tone: 'bad' };
}

// --- Music match — surfacing the existing musicFit on the floor --------------

export type MusicMatchLevel = 'hot' | 'warm' | 'cold';

/** How tonight's genre fits the crowd — a read on the resolver's musicFit
 *  (MUSIC_FIT + better-sound upgrade), not a new mechanic. */
export function musicMatch(club: ClubState, config: DayConfig): { label: string; level: MusicMatchLevel } {
  const fit = clamp(MUSIC_FIT[config.music] + aggregateEffects(club.ownedUpgradeIds).musicFitBonus, 0.5, 1.3);
  const level: MusicMatchLevel = fit >= 1.08 ? 'hot' : fit >= 0.98 ? 'warm' : 'cold';
  const word = level === 'hot' ? 'crowd-pleaser' : level === 'warm' ? 'solid fit' : 'tough sell';
  return { label: `♪ ${MUSIC_LABEL[config.music]} — ${word}`, level };
}

// --- Troublemakers — tap to eject, or the room pays --------------------------

export type TroublemakerZone = 'door' | 'bar' | 'floor';

export interface Troublemaker {
  id: string;
  zone: TroublemakerZone;
  /** Progress (0..1) when they start acting up on the floor. */
  at: number;
  /** Progress deadline: tap before this or it boils over (a slip). */
  until: number;
}

/** How long the owner has to tap a troublemaker (progress units; ~22s at 1×). */
export const TM_WINDOW = 0.09;

// Fixed spawn slots: one while the room warms, one in the rush, one at peak.
// Offset from the encounter triggers (0.35 / 0.55 / 0.7) so the two systems
// don't interrupt the player at the same beat.
const TM_SLOTS = [0.3, 0.52, 0.74];

/**
 * Tonight's troublemaker schedule — deterministic from the preview + setup, no
 * RNG. A busy room always breeds at least one; trouble previewed by the resolver
 * (incidents) or invited by the mix (rough crowd) breeds more, capped at 3.
 * A genuinely quiet night stays quiet.
 */
export function nightTroublemakers(preview: NightResult, club: ClubState): Troublemaker[] {
  const fill = preview.capacity > 0 ? preview.guests / preview.capacity : 0;
  const rough = topCrowd(crowdMix(club, club.lastConfig), 3).includes('rough');
  let count = Math.min(2, preview.incidents) + (rough ? 1 : 0);
  if (count === 0 && fill >= 0.45) count = 1;
  count = Math.min(count, TM_SLOTS.length);
  // Slot zones: the first stirs the floor, the second hits whichever station is
  // weaker tonight (a strained bar, otherwise the door), the third tests the door
  // at peak. Deterministic from the preview.
  const zones: TroublemakerZone[] = ['floor', preview.serviceRatio < 0.9 ? 'bar' : 'door', 'door'];
  return Array.from({ length: count }, (_, i) => ({
    id: `tm-${i}`,
    zone: zones[i],
    at: TM_SLOTS[i],
    until: Math.min(1, TM_SLOTS[i] + TM_WINDOW),
  }));
}

/**
 * Fold the night's troublemaker outcomes into ONE bounded Intervention.
 * Ejections save the room's vibe (diminishing — a bouncer parade isn't a win
 * engine); each slip costs more than an ejection earns. Money is untouched
 * (revenueMod 1) — combineInterventions clamps the final stack as usual.
 */
const EJECT_VIBE = [5, 3, 2];
export function troublemakerIntervention(ejected: number, slipped: number): Intervention {
  let vibe = 0;
  for (let i = 0; i < ejected; i++) vibe += EJECT_VIBE[Math.min(i, EJECT_VIBE.length - 1)];
  vibe -= 6 * slipped;
  return { vibeBonus: vibe, revenueMod: 1 };
}

/** Stream lines for live / slipped troublemakers (mechanical narration, same
 *  register as the ambient ticks — no dialogue). Deterministic per state. */
const TM_SPAWN_TEXT: Record<TroublemakerZone, string> = {
  door: 'Trouble brewing at the rope.',
  bar: 'Trouble brewing at the bar.',
  floor: 'Trouble brewing on the floor.',
};

export interface TroublemakerTick {
  id: string;
  text: string;
  tone: BeatTone;
}

export function troublemakerTicks(tms: Troublemaker[], ejectedIds: string[], progress: number): TroublemakerTick[] {
  const out: TroublemakerTick[] = [];
  for (const t of tms) {
    if (ejectedIds.includes(t.id)) continue;
    if (progress >= t.at && progress < t.until) {
      out.push({ id: `tmw-${t.id}`, text: TM_SPAWN_TEXT[t.zone], tone: 'warn' });
    } else if (progress >= t.until) {
      out.push({ id: `tmx-${t.id}`, text: 'It boiled over — a scuffle, and the room felt it.', tone: 'bad' });
    }
  }
  return out;
}
