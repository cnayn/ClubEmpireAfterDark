/**
 * Crowd Identity v1 — who's in the room tonight, DERIVED from existing inputs
 * (event, prices, policies, drink quality, venue, reputation). No persistence, no
 * individual guests, no NPCs, no memory system: it's an aggregate read that adds
 * tags, bubbles, bounded effects, and debrief flavor. Pure + deterministic.
 *
 * The neutral anchor is LOCALS (zero effect deltas), so a plain night barely
 * shifts; only the "spicy" segments (Students / Rough / Music Heads / VIP-curious)
 * push the night, gently and bounded.
 */

import { LEVEL_VALUE } from '@/domain/balance';
import { DEFAULT_DRINK_PREP } from '@/domain/drinks';
import { venueStats } from '@/domain/furniture';
import { DEFAULT_POLICIES } from '@/domain/policies';
import type { ClubState, DayConfig } from '@/domain/types';

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

export type CrowdSegmentId = 'locals' | 'students' | 'musicheads' | 'vipcurious' | 'rough' | 'regulars';

export interface CrowdSegment {
  id: CrowdSegmentId;
  name: string;
  description: string;
  likes: string;
  dislikes: string;
  /** A short on-floor bubble in the crowd's voice. */
  bubble: string;
  /** Bounded per-weight effect deltas (Locals is the neutral anchor at 0/0/0). */
  drawDelta: number; // × attendance contribution
  riskDelta: number; // × incident-chance contribution
  vibeDelta: number; // + vibe contribution
}

export const CROWD_SEGMENTS: Record<CrowdSegmentId, CrowdSegment> = {
  locals: {
    id: 'locals', name: 'Locals',
    description: 'Neighbourhood regulars-in-waiting who treat the club as theirs.',
    likes: 'Fair prices, familiar staff, a stable door.',
    dislikes: 'Feeling replaced by VIPs or sudden culture shifts.',
    bubble: 'Feels like our place tonight.',
    drawDelta: 0, riskDelta: 0, vibeDelta: 0,
  },
  students: {
    id: 'students', name: 'Students',
    description: 'Cheap night out, high energy, thin wallets.',
    likes: 'Cheap drinks, a relaxed door, a loud room.',
    dislikes: 'Strict policies and premium pricing.',
    bubble: 'Cheap drinks, loud room. We’re good.',
    drawDelta: 0.1, riskDelta: 0.15, vibeDelta: 0,
  },
  musicheads: {
    id: 'musicheads', name: 'Music Heads',
    description: 'Here for the sound and the floor, not the bar tab.',
    likes: 'Strong sound, a real dance floor, the DJ pushed.',
    dislikes: 'Weak floor and bad sound.',
    bubble: 'Sound is better than last week.',
    drawDelta: 0, riskDelta: 0, vibeDelta: 4,
  },
  vipcurious: {
    id: 'vipcurious', name: 'VIP-Curious',
    description: 'Spenders sizing the place up — could become the money crowd later.',
    likes: 'Style, a sharp door, premium drinks.',
    dislikes: 'A cheap-looking venue and sloppy service.',
    bubble: 'This place is getting sharper.',
    drawDelta: -0.04, riskDelta: 0, vibeDelta: 2,
  },
  rough: {
    id: 'rough', name: 'Rough Crowd',
    description: 'Big energy, short fuses — they bring heat to the door.',
    likes: 'A relaxed door and a wild room.',
    dislikes: 'Hardline control.',
    bubble: 'Door’s watching us tonight.',
    drawDelta: 0.08, riskDelta: 0.3, vibeDelta: -2,
  },
  regulars: {
    id: 'regulars', name: 'Regulars',
    description: 'People who keep coming back when the club treats them right.',
    likes: 'Consistency, good staff, clean nights, fair treatment.',
    dislikes: 'Culture shifts, unfair VIP treatment, bad service.',
    bubble: 'Same bartender? Good.',
    drawDelta: 0, riskDelta: -0.05, vibeDelta: 1,
  },
};

export interface CrowdShare {
  id: CrowdSegmentId;
  weight: number; // 0..1, sums to ~1 across the mix
}

/** Raw appetite of each segment for tonight's setup (pre-normalization). */
function rawScores(club: ClubState, config: DayConfig): Record<CrowdSegmentId, number> {
  const cover = LEVEL_VALUE[config.coverLevel];
  const drink = LEVEL_VALUE[config.drinkLevel];
  const pol = config.policies ?? DEFAULT_POLICIES;
  const quality = (config.drinkPrep ?? DEFAULT_DRINK_PREP).quality;
  const v = venueStats(club.venue);
  const rep = club.reputation;
  const ev = config.eventId;
  const relaxedDoor = pol.idCheck === 'relaxed' || pol.security === 'friendly';
  const tightDoor = pol.idCheck === 'strict' || pol.security === 'hardline';

  const s: Record<CrowdSegmentId, number> = {
    locals: 4 + (ev === 'regular' ? 2 : 0) + (cover <= 0.5 ? 1 : 0),
    students: 1 + (1 - cover) * 3 + (1 - drink) * 1.5 + (relaxedDoor ? 1 : 0) + (ev === 'student-night' ? 6 : 0) - (cover >= 1 ? 2 : 0) - (tightDoor ? 1 : 0),
    musicheads: 1 + v.sound * 0.6 + v.style * 0.2 + (ev === 'industry-night' ? 2 : 0) + (ev === 'grand-opening' ? 1 : 0),
    vipcurious: 0.5 + v.style * 0.3 + v.doorAppeal * 0.5 + (quality === 'premium' ? 2 : 0) + (cover >= 1 ? 1 : 0) + (rep >= 40 ? 1 : 0) + (ev === 'grand-opening' || ev === 'industry-night' || ev === 'private-party' ? 1 : 0),
    rough: 0.5 + (relaxedDoor ? 2.5 : 0) + (cover <= 0 ? 1 : 0) + (pol.smoking === 'allowed' ? 0.5 : 0) - (tightDoor ? 2 : 0),
    regulars: rep * 0.04 + (ev === 'regular' ? 1 : 0),
  };
  (Object.keys(s) as CrowdSegmentId[]).forEach((k) => {
    s[k] = Math.max(0, s[k]);
  });
  return s;
}

/** Tonight's crowd mix as normalized shares, sorted strongest-first. Deterministic. */
export function crowdMix(club: ClubState, config: DayConfig): CrowdShare[] {
  const raw = rawScores(club, config);
  const total = (Object.values(raw) as number[]).reduce((a, b) => a + b, 0) || 1;
  return (Object.keys(raw) as CrowdSegmentId[])
    .map((id) => ({ id, weight: raw[id] / total }))
    .filter((s) => s.weight > 0)
    .sort((a, b) => b.weight - a.weight);
}

/** Top N segment ids by weight (for tags / chips). */
export function topCrowd(mix: CrowdShare[], n = 3): CrowdSegmentId[] {
  return mix.slice(0, n).map((s) => s.id);
}

export interface CrowdEffects {
  drawMod: number;
  incidentMod: number;
  vibeAdd: number;
}

/** Bounded, gentle — never overpowers crew/policies/drinks/furniture. A
 *  Locals-dominant (default) mix is ~neutral. */
export function crowdEffects(mix: CrowdShare[]): CrowdEffects {
  let draw = 0;
  let risk = 0;
  let vibe = 0;
  for (const { id, weight } of mix) {
    const seg = CROWD_SEGMENTS[id];
    draw += weight * seg.drawDelta;
    risk += weight * seg.riskDelta;
    vibe += weight * seg.vibeDelta;
  }
  return {
    drawMod: clamp(1 + draw, 0.92, 1.1),
    incidentMod: clamp(1 + risk, 0.85, 1.25),
    vibeAdd: clamp(vibe, -3, 5),
  };
}
