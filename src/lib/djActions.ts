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

export type DjActionId = 'read-room' | 'drop-bass' | 'change-mix' | 'hype-room';

export interface DjActionDef {
  id: DjActionId;
  label: string;
  hint: string;
}

/** The DJ booth menu (display order): inspect first, then the three calls. */
export const DJ_ACTIONS: DjActionDef[] = [
  { id: 'read-room', label: 'Read the Room', hint: 'Free — see what the crowd wants.' },
  { id: 'drop-bass', label: 'Drop Bass', hint: 'Big spike now — runs the booth hot.' },
  { id: 'change-mix', label: 'Change Mix', hint: 'Switch it up if they’re not feeling it.' },
  { id: 'hype-room', label: 'Hype the Room', hint: 'Slower, safer lift.' },
];

/** Reading the room is free (inspection); the three committing calls cost Focus. */
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
    case 'change-mix': {
      // ADAPT: strong only when the floor is actually flat; openly pointless when
      // it's already alive. Low morale cost, slower than Drop Bass.
      if (energy >= 0.6) {
        return {
          intervention: { vibeBonus: 1, revenueMod: 1 },
          call: 'You changed the mix.',
          note: 'The set already works — the floor’s with it.',
          tone: 'info',
          energy: 0.02,
          morale: 0,
          happy: 0,
        };
      }
      const vibe = (10 + (musicHeads ? 4 : 0)) * f;
      return {
        intervention: { vibeBonus: vibe, revenueMod: 1 },
        call: 'You changed the mix.',
        note: 'Switched direction — the floor started to come back.',
        tone: 'good',
        energy: 0.16 * f,
        morale: 0,
        happy: 0.03 * f,
      };
    }
    case 'hype-room': {
      // BUILD: a slower, SAFER lift than Drop Bass — no morale strain, best when
      // the floor is warming but not fully alive. Modest, never a spike.
      const vibe = (8 + (regulars ? 3 : 0)) * f;
      return {
        intervention: { vibeBonus: vibe, revenueMod: 1 },
        call: 'You hyped the room.',
        note: energy >= 0.66 ? 'Room’s already up — you kept it rolling.' : 'Built the room up — the floor’s climbing.',
        tone: 'good',
        energy: 0.12 * f,
        morale: 0.02,
        happy: 0.04 * f,
      };
    }
    case 'read-room':
    default: {
      // INSPECT (free): no boost — returns what the crowd wants + a suggestion.
      let read: string;
      let suggested: DjActionId;
      if (energy <= 0.35) {
        read = 'Floor is cold — they need a jolt.';
        suggested = 'drop-bass';
      } else if (musicHeads) {
        read = 'Music heads want it harder.';
        suggested = 'drop-bass';
      } else if (energy < 0.5) {
        read = 'Crowd’s drifting — switch it up.';
        suggested = 'change-mix';
      } else if (energy < 0.7) {
        read = 'Floor’s warming — build on it.';
        suggested = 'hype-room';
      } else {
        read = 'Floor’s alive — leave it rolling.';
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
