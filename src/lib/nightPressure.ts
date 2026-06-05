/**
 * Living Floor Loop v1 — pure, live "pressure" reads for the real-time night.
 *
 * The floor itself is the surface: instead of phase text-cards, the room shows
 * meters that rise and fall as the night's clock runs. These are PRESENTATION
 * reads derived from the deterministic preview (final serviceRatio / incidents /
 * loyalty / crowd mix / venue) scaled by the live crowd curve — the night's
 * actual books still come from the resolver. Pure + deterministic, no RNG/I/O.
 */

import { crowdMix, topCrowd } from '@/domain/crowd';
import { DEFAULT_POLICIES } from '@/domain/policies';
import { venueStats } from '@/domain/furniture';
import { liveCrowdFraction } from '@/lib/nightClock';
import type { BeatTone } from '@/lib/timeline';
import type { ZoneKey } from '@/lib/venue';
import type { ClubState, NightResult } from '@/domain/types';

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

export interface NightPressures {
  crowd: number; // how full the room is right now (0..1)
  bar: number; // service strain (high = bad)
  door: number; // queue / trouble strain (high = bad)
  bathroom: number; // toilet strain (high = bad)
  energy: number; // floor energy / DJ heat (HIGH = good)
}

/** Live pressures at this point in the night (progress 0..1). */
export function livePressures(preview: NightResult, club: ClubState, progress: number): NightPressures {
  const live = liveCrowdFraction(progress);
  const fillFinal = preview.capacity > 0 ? preview.guests / preview.capacity : 0;
  const crowd = clamp01(live * fillFinal);

  const top = topCrowd(crowdMix(club, club.lastConfig), 3);
  const rough = top.includes('rough');
  const students = top.includes('students');
  const musicheads = top.includes('musicheads');

  const pol = club.lastConfig.policies ?? DEFAULT_POLICIES;
  const relaxedDoor = pol.idCheck === 'relaxed' || pol.security === 'friendly';

  const v = venueStats(club.venue);
  const hygieneRelief = clamp01(v.hygiene / 6);
  const dj = club.lastConfig.dj ?? 'house';
  const djHeat = dj === 'hype' ? 0.2 : dj === 'local' ? 0.1 : 0;

  const strain = 1 - clamp01(preview.serviceRatio);
  const bar = clamp01(strain * 0.7 + crowd * 0.5);
  const door = clamp01((preview.incidents > 0 ? 0.45 : 0) + crowd * 0.5 + (relaxedDoor ? 0.15 : 0) + (rough ? 0.15 : 0));
  const bathroom = clamp01(crowd * 0.8 + (rough || students ? 0.15 : 0) - hygieneRelief * 0.5);
  const energy = clamp01(0.4 + djHeat + (musicheads ? 0.15 : 0) + (preview.regularLoyalty - 50) / 100);

  return { crowd, bar, door, bathroom, energy };
}

export interface PressureHeadline {
  label: string;
  tone: BeatTone;
  zone: ZoneKey;
}

/** The single dominant live read — a short headline + the zone to highlight. */
export function pressureHeadline(p: NightPressures): PressureHeadline {
  if (p.door >= 0.65) return { label: "Door's getting tense", tone: 'warn', zone: 'door' };
  if (p.bar >= 0.65) return { label: "Bar's slammed", tone: 'bad', zone: 'bar' };
  if (p.bathroom >= 0.7) return { label: 'Bathroom line is backing up', tone: 'warn', zone: 'floor' };
  if (p.crowd >= 0.85) return { label: 'The floor is packed', tone: 'info', zone: 'floor' };
  if (p.energy < 0.4) return { label: 'The room is cooling', tone: 'warn', zone: 'floor' };
  if (p.crowd < 0.2) return { label: 'Quiet so far', tone: 'neutral', zone: 'door' };
  if (p.energy >= 0.75) return { label: 'The floor is flying', tone: 'good', zone: 'floor' };
  return { label: 'The room is finding its rhythm', tone: 'info', zone: 'floor' };
}

/** When (0..1 progress) a zone-anchored encounter should interrupt the flow. */
export function encounterTrigger(zone: ZoneKey): number {
  return zone === 'bar' ? 0.35 : zone === 'floor' ? 0.55 : 0.7;
}
