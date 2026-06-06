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
import { crowdMix, topCrowd } from '@/domain/crowd';
import { djPushBonus } from '@/domain/dj';
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

/**
 * Owner Attention — a limited per-night command budget. Boss actions cost Focus,
 * so the owner can act repeatedly through the night but never infinitely (no
 * spam). Combined with combineInterventions' clamp, repeated calls give bounded,
 * diminishing returns. Presentation/loop only — no resolver/save change.
 */
export const NIGHT_FOCUS = 5;
export function focusCost(_id: BossActionId): number {
  return 1; // v1: every command costs one Focus
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
  /** Short nightclub-style "boss call" shown the instant the action is taken. */
  call: string;
  note: string; // boss-interpretation line (shown live / in the debrief)
}

/** The instant "boss call" line for an action (short, physical, no corporate). */
export const BOSS_CALL: Record<BossActionId, string> = {
  'push-dj': 'You pushed the booth.',
  'check-bar': 'You checked the bar.',
  'send-bouncer': 'You sent eyes to the door.',
  'work-room': 'You worked the room.',
};

const JOHN = 'bnc-john';
const CARAMEL = 'bnc-kareem';

/** Deterministic outcome of one boss action given the night's preview + crew. */
export function resolveBossAction(id: BossActionId, preview: NightResult, club: ClubState): BossActionOutcome {
  const onDuty = new Set(club.lastConfig.staffOnDuty);
  const johnOn = onDuty.has(JOHN);
  const caramelOn = onDuty.has(CARAMEL);
  const fill = preview.capacity > 0 ? preview.guests / preview.capacity : 0;

  switch (id) {
    case 'push-dj': {
      // Pushing the booth ONLY lifts the room — it never costs money (revenueMod 1)
      // so it can't "backfire." Strongest when the floor is cooling or music heads
      // are in, and a real booked act (Local/Hype) has more to give when pushed.
      const djBonus = djPushBonus(club.lastConfig.dj);
      const top = topCrowd(crowdMix(club, club.lastConfig), 3);
      const cooling = preview.regularLoyalty < 52 || top.includes('musicheads');
      const coolBonus = cooling ? 6 : 0;
      return {
        intervention: { vibeBonus: 18 + djBonus + coolBonus, revenueMod: 1 },
        bubble: { id: 'boss-dj', label: djBonus > 0 ? 'DJ lifted it' : 'Booth ↑', tone: 'good', zone: 'floor' },
        mood: { label: cooling ? 'DJ pulled the floor back' : djBonus > 0 ? 'Music heads noticed' : 'Energy lifting', tone: 'good' },
        call: BOSS_CALL['push-dj'],
        note: cooling
          ? 'Pushed the booth — the floor was slipping and the DJ pulled it back.'
          : djBonus > 0
            ? 'Pushed the booth — the DJ lifted the room and the music heads noticed.'
            : 'Pushed the booth — the room found another gear.',
      };
    }
    case 'check-bar': {
      // Three-state diagnosis. Only an OVERLOADED bar (strained service) gets a
      // real, bounded stabilization; "starting to crack" and "holding" are
      // diagnosis-only (no-op) so reading a healthy bar is never free value.
      // Three-state diagnosis — and every state does SOMETHING: the worse the bar,
      // the bigger the bounded stabilization when you step in.
      const ratio = preview.serviceRatio;
      if (ratio < 0.85) {
        return {
          intervention: { vibeBonus: 3, revenueMod: 1.1 },
          bubble: { id: 'boss-bar', label: 'Bar caught up', tone: 'good', zone: 'bar' },
          mood: { label: 'Bar was overloaded — you stepped in', tone: 'warn' },
          call: BOSS_CALL['check-bar'],
          note: 'Bar was overloaded — you caught the backlog before it became a complaint.',
        };
      }
      if (ratio < 1) {
        return {
          intervention: { vibeBonus: 2, revenueMod: 1.05 },
          bubble: { id: 'boss-bar', label: 'Bar held', tone: 'good', zone: 'bar' },
          mood: { label: 'Bar was starting to crack — you steadied it', tone: 'info' },
          call: BOSS_CALL['check-bar'],
          note: 'Bar was starting to crack — you got the pours moving before the line snapped.',
        };
      }
      return {
        intervention: { vibeBonus: 1, revenueMod: 1.02 },
        bubble: { id: 'boss-bar', label: 'Bar ✓', tone: 'good', zone: 'bar' },
        mood: { label: 'Bar holding — you kept it sharp', tone: 'good' },
        call: BOSS_CALL['check-bar'],
        note: "Bar's holding — a word from the boss kept the pours sharp.",
      };
    }
    case 'send-bouncer': {
      // Door risk = incidents or a packed-enough room. Effectiveness scales with
      // who's actually on the door: Caramel de-escalates best, John is effective
      // but harder, a sharp bouncer holds it, a green one barely. No risk = no-op.
      const risk = preview.incidents > 0 || fill >= 0.7;
      const bouncers = club.staff.filter((m) => m.role === 'bouncer' && onDuty.has(m.id));
      const avgSkill = bouncers.length ? bouncers.reduce((s, m) => s + m.skill, 0) / bouncers.length : 0;
      // A calm door still benefits from a visible presence (never a pure no-op);
      // under real risk the effect scales with who's working the door.
      let vibeBonus = 3;
      let note = 'Put eyes on the door — kept it sharp before anything could start.';
      let label = 'Door sharp';
      let tone: MoodTone = 'good';
      if (risk) {
        if (caramelOn) {
          vibeBonus = 12; note = 'Caramel cooled the line before it reached the floor.'; label = 'Caramel · cool'; tone = 'info';
        } else if (johnOn) {
          vibeBonus = 8; note = 'John moved fast on the door. It held — maybe too hard.'; label = 'John · fast'; tone = 'warn';
        } else if (avgSkill >= 55) {
          vibeBonus = 8; note = 'Your bouncer read it early and held the door clean.'; label = 'Held'; tone = 'info';
        } else if (bouncers.length > 0) {
          vibeBonus = 4; note = 'A green bouncer held the door — barely.'; label = 'Barely held'; tone = 'warn';
        } else {
          vibeBonus = 3; note = 'Nobody on the door, so you stepped in yourself. Hire someone.'; label = 'You held it'; tone = 'warn';
        }
      }
      return {
        intervention: { vibeBonus, revenueMod: 1 },
        bubble: { id: 'boss-door', label, tone: risk ? 'warn' : 'info', zone: 'door' },
        mood: { label, tone },
        call: BOSS_CALL['send-bouncer'],
        note,
      };
    }
    case 'work-room':
    default: {
      // Owner presence — protects culture, never prints money. Lands harder when a
      // culture crowd (regulars/locals) is in or the room is unstable (cooling /
      // low name). Bounded; combineInterventions caps the total swing.
      const top = topCrowd(crowdMix(club, club.lastConfig), 2);
      const cultureCrowd = top.includes('regulars') || top.includes('locals');
      const unstable = club.reputation < 35 || preview.regularLoyalty < 52;
      const vibeBonus = 6 + (cultureCrowd ? 4 : 0) + (unstable ? 3 : 0);
      const note = cultureCrowd
        ? 'You worked the room — the regulars clocked that the boss was present.'
        : unstable
          ? 'You showed face before the room turned — steadied it without touching the till.'
          : 'You worked the room — being seen helped more than the numbers show.';
      return {
        intervention: { vibeBonus, revenueMod: 1 },
        bubble: { id: 'boss-room', label: 'Boss in room', tone: 'info', zone: 'floor' },
        mood: { label: 'Boss working the room', tone: 'good' },
        call: BOSS_CALL['work-room'],
        note,
      };
    }
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

/**
 * Per-call diminishing factor for the Nth use of the SAME action this night.
 * The first call lands full; the second, third, fourth+ have visibly smaller
 * pull. Combined with combineInterventions' clamp, this makes spamming the same
 * command bad strategy without forbidding repeat use. Pure / deterministic.
 */
const REPEAT_DIMINISH = [1, 0.5, 0.25, 0.1];
export function diminishFactor(callIndex: number): number {
  if (callIndex < 0) return 1;
  return REPEAT_DIMINISH[Math.min(callIndex, REPEAT_DIMINISH.length - 1)];
}
function applyDiminish(i: Intervention, f: number): Intervention {
  return { vibeBonus: i.vibeBonus * f, revenueMod: 1 + (i.revenueMod - 1) * f };
}

/**
 * Build the combined intervention for a SEQUENCE of chosen action ids. Repeats
 * of the same id are allowed (Focus-limited at the call site) — the Nth repeat
 * of an action is diminished, so the player can press a struggling zone without
 * it ever stacking into a free win. Different-id calls don't diminish each
 * other; only same-id repeats do.
 */
export function bossIntervention(ids: BossActionId[], preview: NightResult, club: ClubState): Intervention {
  const counts: Partial<Record<BossActionId, number>> = {};
  const list: Intervention[] = [];
  for (const id of ids) {
    const idx = counts[id] ?? 0;
    counts[id] = idx + 1;
    const base = resolveBossAction(id, preview, club).intervention;
    list.push(applyDiminish(base, diminishFactor(idx)));
  }
  return combineInterventions(list);
}
