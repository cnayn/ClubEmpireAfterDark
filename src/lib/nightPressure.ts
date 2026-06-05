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
import { floorEmotes, type FloorBubble } from '@/lib/dashboard';
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

/**
 * Live guest emotes — same source as `floorEmotes`, but a per-zone bubble only
 * surfaces once that zone's pressure has actually risen. The room talks itself
 * into life as the night runs, instead of speaking all at once. Presentation
 * only; deterministic for (preview, club, pressures).
 */
export function liveEmotes(preview: NightResult, club: ClubState, pressures: NightPressures): FloorBubble[] {
  const all = floorEmotes(preview, club);
  return all.filter((b) => {
    if (b.zone === 'bar') return pressures.bar >= 0.4 || pressures.crowd >= 0.55;
    if (b.zone === 'door') return pressures.door >= 0.35 || pressures.crowd >= 0.55;
    return pressures.crowd >= 0.4; // floor
  });
}

export type StreamTone = BeatTone;
export interface StreamTick {
  id: string;
  /** 0..1 progress when this tick first surfaces. */
  at: number;
  text: string;
  tone: StreamTone;
  zone: ZoneKey;
}

/**
 * Living-floor event stream — small ambient ticks the room produces as the night
 * runs, derived from the deterministic preview + the live progress. Pure: no RNG,
 * no resolver change, no save schema. The night's economic outcome is still the
 * resolver's; these are presentation ticks so the floor narrates itself.
 */
export function livingStreamTicks(preview: NightResult, club: ClubState, progress: number): StreamTick[] {
  const ticks: StreamTick[] = [];
  const fill = preview.capacity > 0 ? preview.guests / preview.capacity : 0;
  const top = topCrowd(crowdMix(club, club.lastConfig), 3);

  ticks.push({ id: 'doors', at: 0.05, text: 'Doors open. First faces drift in.', tone: 'info', zone: 'door' });
  if (top.includes('students')) {
    ticks.push({ id: 'students', at: 0.2, text: 'Cheap rounds, loud table — the students are settling in.', tone: 'info', zone: 'floor' });
  } else if (top.includes('musicheads')) {
    ticks.push({ id: 'musicheads', at: 0.25, text: 'Heads at the booth. They want to be moved.', tone: 'info', zone: 'floor' });
  } else if (top.includes('vipcurious')) {
    ticks.push({ id: 'vipc', at: 0.25, text: 'A sharper crowd is clocking the entrance.', tone: 'info', zone: 'door' });
  }
  if (preview.serviceRatio < 0.85) {
    ticks.push({ id: 'bar-deep', at: 0.45, text: "Bar's three deep — drinks crawling out.", tone: 'warn', zone: 'bar' });
  }
  if (preview.incidents > 0) {
    ticks.push({ id: 'door-push', at: 0.55, text: 'A push at the door — it nearly tipped.', tone: 'bad', zone: 'door' });
  }
  if (fill >= 0.7) {
    ticks.push({ id: 'packed', at: 0.6, text: 'The room hits the back wall — packed.', tone: 'info', zone: 'floor' });
  } else if (fill < 0.3) {
    ticks.push({ id: 'thin', at: 0.55, text: 'The floor never thickens. A thin one tonight.', tone: 'warn', zone: 'floor' });
  }
  if (preview.theft > 0) {
    ticks.push({ id: 'theft', at: 0.7, text: 'Behind the bar, the till looks thinner than it should.', tone: 'bad', zone: 'bar' });
  }
  if (preview.regularLoyalty >= 60 && fill >= 0.4) {
    ticks.push({ id: 'pocket', at: 0.75, text: 'Music, crowd, bar — in the pocket.', tone: 'good', zone: 'floor' });
  }
  ticks.push({ id: 'lastcall', at: 0.9, text: 'Last call. The floor starts to thin.', tone: 'info', zone: 'floor' });

  return ticks.filter((t) => t.at <= progress).sort((a, b) => a.at - b.at);
}
