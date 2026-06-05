/**
 * Regulars Persistence v1 — aggregate crowd-loyalty that slowly builds from
 * repeated nights and player choices. NOT individual guests, NOT NPCs, NOT a
 * social network, NOT a memory engine: six bounded scores (0–100) that drift
 * based on who came tonight and how the night went. Pure + deterministic.
 */

import type { CrowdSegmentId, CrowdShare } from '@/domain/crowd';
import { CROWD_SEGMENTS } from '@/domain/crowd';
import type { RegularBase } from '@/domain/types';

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

const SEGMENT_IDS: CrowdSegmentId[] = ['locals', 'students', 'musicheads', 'vipcurious', 'rough', 'regulars'];

export const DEFAULT_REGULAR_BASE: RegularBase = {
  locals: 0, students: 0, musicheads: 0, vipcurious: 0, rough: 0, regulars: 0,
};

export function getRegularBase(base: RegularBase | undefined): RegularBase {
  return base ?? DEFAULT_REGULAR_BASE;
}

/** Signals from the resolved night that shape who comes back. */
export interface NightSignals {
  reputationDelta: number;
  serviceRatio: number;
  incidents: number;
  fines: number;
  noShows: number;
}

const GROWTH = 7; // a dominant, well-served segment grows up to ~this per night
const DECAY = 1.5; // segments not in the room tonight slowly fade

/**
 * Drift the regular base after a night. Present segments grow, absent ones decay,
 * and quality signals nudge each one. Bounded 0–100; one night never defines the
 * club (changes are gentle). Deterministic for the same inputs.
 */
export function updateRegularBase(prev: RegularBase | undefined, mix: CrowdShare[], s: NightSignals): RegularBase {
  const base = getRegularBase(prev);
  const weightOf = (id: CrowdSegmentId) => mix.find((m) => m.id === id)?.weight ?? 0;
  const goodNight = s.reputationDelta >= 0 && s.serviceRatio >= 0.85 && s.incidents === 0;
  const next = { ...base };

  for (const id of SEGMENT_IDS) {
    const presence = weightOf(id);
    let delta = presence * GROWTH - DECAY;

    if (id === 'locals' || id === 'regulars') {
      delta += goodNight ? 2 : s.incidents > 0 || s.reputationDelta < 0 ? -3 : 0;
    } else if (id === 'musicheads') {
      delta += s.reputationDelta > 0 ? 2 : 0;
    } else if (id === 'vipcurious') {
      delta += s.serviceRatio >= 1 ? 1 : s.serviceRatio < 0.7 ? -2 : 0;
    } else if (id === 'rough') {
      delta += s.incidents > 0 ? 1.5 : 0; // the wrong crowd is also a reputation
    } else if (id === 'students') {
      delta += s.serviceRatio < 0.7 ? -1 : 0; // bar couldn't serve them
    }

    next[id] = clamp(Math.round((base[id] + delta) * 10) / 10, 0, 100);
  }
  return next;
}

export interface RegularBaseEffects {
  drawMod: number;
  incidentMod: number;
  vibeAdd: number;
}

/** Bounded effect of an established base on future nights. Empty base ⇒ neutral. */
export function regularBaseEffects(base: RegularBase | undefined): RegularBaseEffects {
  const b = getRegularBase(base);
  const draw = (b.locals + b.regulars) * 0.0003 + b.students * 0.0004 + b.rough * 0.0003;
  const incident = b.rough * 0.001 + b.students * 0.0005 - (b.locals + b.regulars) * 0.0004;
  const vibe = b.musicheads * 0.02 + b.vipcurious * 0.01 + b.regulars * 0.01;
  return {
    drawMod: clamp(1 + draw, 0.95, 1.08),
    incidentMod: clamp(1 + incident, 0.85, 1.2),
    vibeAdd: clamp(vibe, 0, 5),
  };
}

export interface RegularRank {
  id: CrowdSegmentId;
  name: string;
  score: number;
}

/** Top segments by loyalty score (score > 0), strongest first. */
export function topRegulars(base: RegularBase | undefined, n = 3): RegularRank[] {
  const b = getRegularBase(base);
  return SEGMENT_IDS.map((id) => ({ id, name: CROWD_SEGMENTS[id].name, score: Math.round(b[id]) }))
    .filter((r) => r.score > 0)
    .sort((a, b2) => b2.score - a.score)
    .slice(0, n);
}

/** Plain nightlife copy for a segment that's becoming loyal. */
export const REGULAR_COPY: Record<CrowdSegmentId, string> = {
  locals: 'Locals are starting to claim the room.',
  students: 'Students know this place is cheap and loud.',
  musicheads: 'Music heads are paying attention.',
  vipcurious: 'A sharper crowd is starting to circle.',
  rough: 'A rougher crowd is learning the door.',
  regulars: 'Regulars are coming back. That is not luck.',
};
