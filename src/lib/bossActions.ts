/**
 * Night Boss Actions v1 — a small owner-control layer over the existing
 * deterministic night. Each action contributes to ONE combined `Intervention`
 * (the existing {vibeBonus, revenueMod} surface, src/sim/night.ts), applied once
 * at commit. NOT a live sim: no real-time, no agents, no new RNG, no resolver
 * change. Pure + deterministic — same chosen actions ⇒ same combined modifier.
 *
 * Effects are conditional on the night's PREVIEW (resolved with no intervention),
 * so "Check the Bar" can stabilize only a strained bar, etc. The preview's
 * serviceRatio / incidents are unaffected by the intervention, so these reads are
 * stable between preview and the committed result.
 */

import type { FloorBubble } from '@/lib/dashboard';
import type { ClubState, NightResult } from '@/domain/types';
import type { Intervention } from '@/sim/night';

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

export type BossActionId = 'push-dj' | 'check-bar' | 'send-bouncer' | 'work-room';
export type MoodTone = 'good' | 'warn' | 'info' | 'neutral';

export interface BossActionDef {
  id: BossActionId;
  label: string;
  hint: string;
}

/** The tray (order = display order). */
export const BOSS_ACTIONS: BossActionDef[] = [
  { id: 'push-dj', label: 'Push the DJ', hint: 'Lift the room’s energy.' },
  { id: 'check-bar', label: 'Check the Bar', hint: 'See if drinks are backing up.' },
  { id: 'send-bouncer', label: 'Send a Bouncer', hint: 'Put eyes on the door.' },
  { id: 'work-room', label: 'Work the Room', hint: 'Show face before it turns.' },
];

export interface BossActionOutcome {
  intervention: Intervention;
  bubble: FloorBubble;
  mood: { label: string; tone: MoodTone };
  note: string; // boss-interpretation line (shown live)
}

const JOHN = 'bnc-john';
const CARAMEL = 'bnc-kareem';

/** Deterministic outcome of one boss action given the night's preview + crew. */
export function resolveBossAction(id: BossActionId, preview: NightResult, club: ClubState): BossActionOutcome {
  const onDuty = new Set(club.lastConfig.staffOnDuty);
  const johnOn = onDuty.has(JOHN);
  const caramelOn = onDuty.has(CARAMEL);
  const fill = preview.capacity > 0 ? preview.guests / preview.capacity : 0;

  switch (id) {
    case 'push-dj':
      // Reuses the Push DJ feel: clear vibe lift, tiny bar cost — not a trap.
      return {
        intervention: { vibeBonus: 18, revenueMod: 0.99 },
        bubble: { id: 'boss-dj', label: 'Booth lifting', tone: 'info', zone: 'floor' },
        mood: { label: 'Energy lifting', tone: 'good' },
        note: 'Pushed the booth — the room found another gear.',
      };
    case 'check-bar': {
      const strained = preview.serviceRatio < 0.85;
      return strained
        ? {
            intervention: { vibeBonus: 0, revenueMod: 1.06 },
            bubble: { id: 'boss-bar', label: 'Bar steadied', tone: 'info', zone: 'bar' },
            mood: { label: 'Bar steadied', tone: 'info' },
            note: 'Bar was starting to crack — you stepped in and steadied the pours.',
          }
        : {
            intervention: { vibeBonus: 0, revenueMod: 1 },
            bubble: { id: 'boss-bar', label: 'Bar holding', tone: 'info', zone: 'bar' },
            mood: { label: 'Bar holding', tone: 'good' },
            note: 'Checked the bar — drinks were flowing fine.',
          };
    }
    case 'send-bouncer': {
      const risk = preview.incidents > 0 || fill >= 0.7;
      const note = !risk
        ? 'Put eyes on the door — it was calm out there.'
        : johnOn
          ? 'John moved fast on the door. Maybe too fast.'
          : caramelOn
            ? 'Caramel cooled the line before it reached the floor.'
            : 'Sent a bouncer to the door — it held the line.';
      return {
        intervention: { vibeBonus: risk ? 6 : 0, revenueMod: 1 },
        bubble: { id: 'boss-door', label: risk ? 'Door covered' : 'Door calm', tone: risk ? 'warn' : 'info', zone: 'door' },
        mood: { label: risk ? 'Door covered' : 'Door calm', tone: risk ? 'info' : 'good' },
        note,
      };
    }
    case 'work-room':
    default:
      return {
        intervention: { vibeBonus: 5, revenueMod: 1 },
        bubble: { id: 'boss-room', label: 'Boss on the floor', tone: 'info', zone: 'floor' },
        mood: { label: 'Boss working the room', tone: 'good' },
        note: 'You worked the room — the boss being seen helped more than the numbers show.',
      };
  }
}

/** Compose chosen actions into ONE bounded Intervention. Empty ⇒ identity
 *  (no-op), so a night with no boss actions resolves exactly as before. The
 *  clamps mean actions can't be stacked into a money printer or a mega-swing. */
export function combineInterventions(list: Intervention[]): Intervention {
  let vibeBonus = 0;
  let revenueMod = 1;
  for (const i of list) {
    vibeBonus += i.vibeBonus;
    revenueMod *= i.revenueMod;
  }
  return { vibeBonus: clamp(vibeBonus, -20, 30), revenueMod: clamp(revenueMod, 0.9, 1.2) };
}

/** Build the combined intervention for a set of chosen action ids. */
export function bossIntervention(ids: BossActionId[], preview: NightResult, club: ClubState): Intervention {
  return combineInterventions(ids.map((id) => resolveBossAction(id, preview, club).intervention));
}
