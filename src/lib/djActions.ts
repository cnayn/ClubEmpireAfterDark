/**
 * DJ Booth multi-action pilot — proving one station can offer meaningful CHOICES,
 * not four free boosts. Tapping the DJ booth opens these four, each with a
 * different purpose, effect, and tradeoff.
 *
 * PURE + DETERMINISTIC and presentation-first: each action contributes a bounded
 * {vibeBonus, revenueMod} to the existing intervention surface (src/sim/night.ts),
 * plus display-only deltas (live floor energy / morale / happiness) so the floor
 * reacts. No RNG, no resolver change, no save schema, no music-genre system, no
 * relationship/hidden-trait system. Same inputs ⇒ same outcome.
 */

import { combineInterventions } from '@/lib/bossActions';
import { crowdMix, topCrowd } from '@/domain/crowd';
import type { BeatTone } from '@/lib/timeline';
import type { ClubState, NightResult } from '@/domain/types';
import type { Intervention } from '@/sim/night';

export type DjActionId = 'drop-bass' | 'refresh-set' | 'dedicate-song' | 'read-room';

export interface DjActionDef {
  id: DjActionId;
  label: string;
  hint: string;
}

/** The DJ booth menu (display order). */
export const DJ_ACTIONS: DjActionDef[] = [
  { id: 'drop-bass', label: 'Drop Bass', hint: 'Big energy now — runs the booth hot.' },
  { id: 'refresh-set', label: 'Refresh Set', hint: 'Change direction for the crowd.' },
  { id: 'dedicate-song', label: 'Dedicate Song', hint: 'A moment for the regulars.' },
  { id: 'read-room', label: 'Read the Room', hint: 'See what the crowd wants first.' },
];

/** Reading the room is free; the three committing moves cost one Owner Attention. */
export function djFocusCost(id: DjActionId): number {
  return id === 'read-room' ? 0 : 1;
}

const REPEAT = [1, 0.5, 0.25, 0.1];
const factor = (callIndex: number) => REPEAT[Math.min(Math.max(0, callIndex), REPEAT.length - 1)];

export interface DjOutcome {
  intervention: Intervention;
  call: string; // instant boss-call line
  note: string; // the read shown live / in the stream
  tone: BeatTone; // floor bubble + stream tone
  energy: number; // live floor-energy to ADD (presentation only)
  morale: number; // live crew-morale delta (negative = strain) (presentation only)
  happy: number; // live guest-happiness delta (presentation only)
  read?: string; // Read the Room's reveal line
  suggested?: DjActionId; // Read the Room's suggestion
}

/**
 * Resolve one DJ action. `energy` is the live floor energy (0..1) so adaptive
 * moves can read the floor; `callIndex` is how many times THIS action was already
 * used tonight (0-based) so repeats diminish.
 */
export function resolveDjAction(
  id: DjActionId,
  preview: NightResult,
  club: ClubState,
  energy: number,
  callIndex = 0
): DjOutcome {
  const f = factor(callIndex);
  const top = topCrowd(crowdMix(club, club.lastConfig), 3);
  const musicHeads = top.includes('musicheads');
  const regulars = top.includes('regulars') || top.includes('locals');
  const fill = preview.capacity > 0 ? preview.guests / preview.capacity : 0;

  switch (id) {
    case 'drop-bass': {
      // Strong, short, RISKY: big energy now, but it strains the booth (morale)
      // and lands softer each repeat — not a spammable boost.
      const vibe = (16 + (musicHeads ? 6 : 0)) * f;
      return {
        intervention: { vibeBonus: vibe, revenueMod: 1 },
        call: 'You dropped the bass.',
        note: callIndex >= 2 ? 'Dropped the bass again — the booth’s running hot, it landed softer.' : 'Dropped the bass — the floor jumped.',
        tone: 'good',
        energy: 0.3 * f,
        morale: -0.06,
        happy: 0.04 * f,
      };
    }
    case 'refresh-set': {
      // ADAPT: strong only when the floor is actually flat; openly pointless when
      // it's already alive. Low morale cost, slower than Drop Bass.
      if (energy >= 0.6) {
        return {
          intervention: { vibeBonus: 1, revenueMod: 1 },
          call: 'You refreshed the set.',
          note: 'Set already works — the floor’s with it.',
          tone: 'info',
          energy: 0.02,
          morale: 0,
          happy: 0,
        };
      }
      const vibe = (10 + (musicHeads ? 4 : 0)) * f;
      return {
        intervention: { vibeBonus: vibe, revenueMod: 1 },
        call: 'You refreshed the set.',
        note: 'Changed direction — the floor started to come back.',
        tone: 'good',
        energy: 0.16 * f,
        morale: 0,
        happy: 0.03 * f,
      };
    }
    case 'dedicate-song': {
      // CROWD MOMENT: lifts happiness (more with regulars in), weak in an empty
      // or wrong-crowd room. Not a raw energy spike.
      if (fill < 0.2) {
        return {
          intervention: { vibeBonus: 1, revenueMod: 1 },
          call: 'You dedicated a song.',
          note: 'Barely anyone here to dedicate it to.',
          tone: 'info',
          energy: 0.02,
          morale: 0,
          happy: 0.02,
        };
      }
      const vibe = (6 + (regulars ? 6 : 0)) * f;
      return {
        intervention: { vibeBonus: vibe, revenueMod: 1 },
        call: 'You dedicated a song.',
        note: regulars ? 'Dedicated a song — the regulars lit up.' : 'Dedicated a song — a warm moment on the floor.',
        tone: 'good',
        energy: 0.05 * f,
        morale: 0.03,
        happy: (0.1 + (regulars ? 0.06 : 0)) * f,
      };
    }
    case 'read-room':
    default: {
      // INSPECT: no real boost — returns what the crowd wants + a suggestion.
      let read: string;
      let suggested: DjActionId;
      if (energy <= 0.35) {
        read = 'Floor is cold — they need a jolt.';
        suggested = 'drop-bass';
      } else if (musicHeads) {
        read = 'Music heads want it harder.';
        suggested = 'drop-bass';
      } else if (energy < 0.6) {
        read = 'Crowd’s drifting — change it up.';
        suggested = 'refresh-set';
      } else if (regulars) {
        read = 'Regulars are in — give them a moment.';
        suggested = 'dedicate-song';
      } else {
        read = 'Current set is fine — leave it.';
        suggested = 'read-room';
      }
      return {
        intervention: { vibeBonus: 0, revenueMod: 1 },
        call: 'You read the room.',
        note: read,
        tone: 'info',
        energy: 0,
        morale: 0,
        happy: 0,
        read,
        suggested,
      };
    }
  }
}

/** Combined bounded intervention for the DJ actions taken tonight (diminishing
 *  per repeated id), folded into the night's books at commit. */
export function djIntervention(ids: DjActionId[], preview: NightResult, club: ClubState, energy: number): Intervention {
  const counts: Partial<Record<DjActionId, number>> = {};
  const list: Intervention[] = [];
  for (const id of ids) {
    const idx = counts[id] ?? 0;
    counts[id] = idx + 1;
    list.push(resolveDjAction(id, preview, club, energy, idx).intervention);
  }
  return combineInterventions(list);
}

/** Live, display-only sum of the DJ actions' floor effects (energy/morale/happy)
 *  with diminishing repeats — so the floor visibly reflects the calls made. */
export function djLiveEffect(
  ids: DjActionId[],
  preview: NightResult,
  club: ClubState,
  energy: number
): { energy: number; morale: number; happy: number } {
  const counts: Partial<Record<DjActionId, number>> = {};
  let e = 0;
  let m = 0;
  let h = 0;
  for (const id of ids) {
    const idx = counts[id] ?? 0;
    counts[id] = idx + 1;
    const o = resolveDjAction(id, preview, club, energy, idx);
    e += o.energy;
    m += o.morale;
    h += o.happy;
  }
  return { energy: e, morale: m, happy: h };
}
