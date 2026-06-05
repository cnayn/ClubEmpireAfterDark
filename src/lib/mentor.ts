/**
 * Tutorial / Mentor v1 — an original "club owner" voice that teaches the real
 * loop by reading the CURRENT state. Pure + deterministic; no persistence, no
 * dialogue engine, no story campaign, no relationship/meter system. It returns
 * one short, useful lesson at a time (priority-ordered) plus an optional nudge to
 * the relevant tab. The card hides once the owner has clearly learned the loop.
 */

import { DEFAULT_POLICIES } from '@/domain/policies';
import { getVenue } from '@/domain/furniture';
import type { BossActionId } from '@/lib/bossActions';
import type { ClubState, DayConfig, NightResult } from '@/domain/types';

export const MENTOR_LABEL = 'The Old Owner';

export interface MentorNote {
  label: string;
  line: string;
  actionLabel?: string;
  route?: '/day-prep' | '/staff' | '/venue' | '/goals' | '/results';
}

const note = (line: string, actionLabel?: string, route?: MentorNote['route']): MentorNote => ({
  label: MENTOR_LABEL,
  line,
  actionLabel,
  route,
});

function onDutyCount(club: ClubState, role: 'bartender' | 'bouncer'): number {
  const onDuty = new Set(club.lastConfig.staffOnDuty);
  return club.staff.filter((m) => m.role === role && onDuty.has(m.id)).length;
}

function policiesUntouched(config: DayConfig): boolean {
  const p = config.policies ?? DEFAULT_POLICIES;
  return (
    p.smoking === DEFAULT_POLICIES.smoking &&
    p.idCheck === DEFAULT_POLICIES.idCheck &&
    p.security === DEFAULT_POLICIES.security &&
    p.barService === DEFAULT_POLICIES.barService
  );
}

/**
 * The single most relevant mentor lesson for the dashboard, or null once the
 * owner has the loop down. Deterministic for a given state.
 */
export function mentorNote(
  club: ClubState,
  lastResult: NightResult | null,
  bossActions: BossActionId[] = []
): MentorNote | null {
  const hasPlayed = club.day > 1;
  const early = club.day <= 6;

  // 1. Survival first — overrides everything.
  if (club.cash < 0) {
    return note(
      'You are in the red. Run a lean Quiet Night and earn your way back — the club only dies if you stop opening.',
      'Open Day Prep',
      '/day-prep'
    );
  }

  // 2. Before the very first night — the core lesson.
  if (!hasPlayed) {
    return note(
      'First rule: a club dies at the bar before it dies on the books. Do not open blind — check who is working, what you stocked, and who is coming.',
      'Set up tonight',
      '/day-prep'
    );
  }

  // 3. React to what just happened.
  if (lastResult && lastResult.incidents > 0) {
    return note(
      'An incident tonight — that is a story you do not want. More door, or a tighter policy.',
      'Check the crew',
      '/staff'
    );
  }
  if (lastResult && lastResult.serviceRatio < 0.85) {
    return note(
      'The bar fell behind tonight. More bar hands, or fewer bodies through the door.',
      'Check the crew',
      '/staff'
    );
  }

  // 4. Early-game setup nudges (fade after the first week).
  if (early) {
    if (onDutyCount(club, 'bartender') === 0) {
      return note('You can open with no bar hands, but do not act surprised when the room gets thirsty.', 'Schedule crew', '/day-prep');
    }
    if (onDutyCount(club, 'bouncer') === 0) {
      return note('No door, no control. Even a cheap club needs someone watching the line.', 'Schedule crew', '/day-prep');
    }
    if (club.lastConfig.drinkPrep?.stock === 'lean') {
      return note('Lean stock saves cash. It also makes a packed room dangerous.', 'Open Day Prep', '/day-prep');
    }
    if (policiesUntouched(club.lastConfig)) {
      return note('Set the house rules before you open. A door policy is a choice — make it on purpose.', 'Open Day Prep', '/day-prep');
    }
    if (getVenue(club.venue).owned.length === 0) {
      return note('The room still looks temporary. People feel that before they admit it — dress the place.', 'Open the Venue', '/venue');
    }
    if (bossActions.length === 0) {
      return note('You are the owner. During the night, make a call — push the booth, work the room, send a bouncer.', 'Check Goals', '/goals');
    }
  }

  // 5. Graduated — only a light nudge, then the card stays hidden.
  if (early) {
    return note('You know the loop now: prepare, open, control the room, read the debrief. Pick a goal and chase it.', 'Check Goals', '/goals');
  }
  return null;
}

/**
 * A short mentor line for the night screen teaching boss actions, shown until the
 * owner makes their first call of the night. `actionsTaken` = boss actions used.
 */
export function nightMentorLine(actionsTaken: number): string | null {
  if (actionsTaken > 0) return null;
  return 'You are the owner — do not just watch. Push the booth, check the bar, send a bouncer. Make a call.';
}

/**
 * A short mentor line for the results / debrief screen teaching the owner to read
 * the damage, not just the money. Reads what actually happened tonight.
 */
export function resultMentorLine(result: NightResult): string {
  if (result.incidents > 0) {
    return 'The books tell you money. This tells you damage — and tonight there was some. Read it.';
  }
  if (result.net < 0) {
    return 'Red night. The debrief shows what cost you — fix the cause, not your mood.';
  }
  if (result.serviceRatio < 0.85) {
    return 'See the bar line? That is money you did not make. More hands or fewer bodies next time.';
  }
  return 'Read this every night. The books are the money; the debrief is what actually happened.';
}

/**
 * A focused, pre-open warning for the Day Prep screen (or null). Reads the prep
 * the player is currently assembling.
 */
export function prepMentorLine(club: ClubState, config: DayConfig): string | null {
  const onDuty = new Set(config.staffOnDuty);
  const bartenders = club.staff.filter((m) => m.role === 'bartender' && onDuty.has(m.id)).length;
  const bouncers = club.staff.filter((m) => m.role === 'bouncer' && onDuty.has(m.id)).length;
  const pol = config.policies ?? DEFAULT_POLICIES;
  const relaxedDoor = pol.idCheck === 'relaxed' || pol.security === 'friendly';

  if (bartenders === 0) return 'No bar hands scheduled — the room will get thirsty fast.';
  if (bouncers === 0) return 'No one on the door. Cheap or not, someone should watch the line.';
  if (config.drinkPrep?.stock === 'lean') return 'Lean stock saves cash, but a packed room can run you dry.';
  if (relaxedDoor) return 'Relaxed doors bring bodies. Bodies bring problems — keep an eye on the night.';
  return null;
}
