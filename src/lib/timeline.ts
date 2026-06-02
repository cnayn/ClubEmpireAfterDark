/**
 * Witness-only night timeline (presentation). PURE — no React, no RNG, no I/O,
 * no state mutation, no persistence. It narrates an ALREADY-resolved night by
 * deriving 5–6 read-only "beats" from the existing NightResult plus the club's
 * roster (for staff names). It never touches the resolver, economy, balance,
 * RNG, or save schema. See docs/phase2-scope.md / night-timeline plan.
 *
 * "Presence before control": the player watches; there are no choices here.
 */

import type { ClubState, EventId, NightResult } from '@/domain/types';

export type BeatTone = 'good' | 'bad' | 'warn' | 'info' | 'neutral';

export interface NightBeat {
  time: string; // fixed clock label (presentational scaffolding)
  title: string;
  text: string;
  tone: BeatTone;
}

const DOORS: Record<EventId, string[]> = {
  regular: [
    'The first guests arrive; the door starts to form.',
    'A normal night opens — the early crowd drifts in.',
  ],
  'private-party': [
    'A private list tonight. Quiet out front, the booking locked in.',
    'The room is reserved — a calm, contained start.',
  ],
  'student-night': [
    'Word got out — the queue is already students deep.',
    'Cheap entry pulls a young crowd to the door early.',
  ],
  'grand-opening': [
    "Tonight's a statement. The line's around the block before you open.",
    'Buzz precedes you — a crowd gathers for the re-launch.',
  ],
  'industry-night': [
    'A sharper crowd tonight — the people who matter are watching.',
    "The scene's insiders filter in, quietly taking note.",
  ],
};

const ROOM: Record<EventId, (fill: number) => string> = {
  regular: (f) =>
    f >= 0.95
      ? 'The floor is full and loud — a real crowd tonight.'
      : f < 0.3
        ? "The floor never really fills; it's a slow one."
        : 'A steady, easy crowd works the bar and the floor.',
  'private-party': () => 'The private group settles in; the floor stays calm and contained.',
  'student-night': (f) =>
    f >= 0.8
      ? 'Student Night packs the floor faster than the crew expected.'
      : 'Student Night brings a crowd, even if the floor never fully fills.',
  'grand-opening': (f) =>
    f >= 0.8
      ? 'The room is packed and buzzing — all eyes on the re-launch.'
      : 'The spotlight is on, but the room never quite fills.',
  'industry-night': () => 'The insiders nurse their drinks and read the room — and you.',
};

/**
 * Build the night's beats. Deterministic: same (result, club) → same beats.
 * Copy variation is keyed off result.day (no RNG). Inputs are only read.
 */
export function buildTimeline(result: NightResult, club: ClubState): NightBeat[] {
  // Deterministic per-night variation, never random.
  const pick = (arr: string[]) => arr[result.day % arr.length];

  // Read-only staff naming. If anyone no-showed we don't know who, so fall back
  // to generic role nouns rather than risk naming an absent staffer.
  const onDuty = club.staff.filter((m) => club.lastConfig.staffOnDuty.includes(m.id));
  const firstBartender = onDuty.find((m) => m.role === 'bartender');
  const firstBouncer = onDuty.find((m) => m.role === 'bouncer');
  const barActor = result.noShows > 0 || !firstBartender ? 'The bar' : firstBartender.name;
  const doorActor = result.noShows > 0 || !firstBouncer ? 'Security' : firstBouncer.name;

  const fill = result.capacity > 0 ? result.guests / result.capacity : 0;
  const beats: NightBeat[] = [];

  // 1 — Doors Open (event-flavored).
  beats.push({ time: '23:00', title: 'Doors Open', tone: 'info', text: pick(DOORS[result.eventId]) });

  // 2 — Bar Pressure (from service ratio).
  if (result.serviceRatio < 0.85) {
    beats.push({ time: '23:45', title: 'Bar Pressure', tone: 'bad', text: `${barActor} is drowning — the queue at the bar won't move.` });
  } else if (result.serviceRatio < 1) {
    beats.push({ time: '23:45', title: 'Bar Pressure', tone: 'warn', text: `${barActor} is slammed but holding the line.` });
  } else {
    beats.push({ time: '23:45', title: 'Bar Pressure', tone: 'good', text: `${barActor} keeps the bar under control; drinks keep flowing.` });
  }

  // 3 — The Room (event + fill).
  beats.push({
    time: '00:30',
    title: 'The Room',
    tone: fill < 0.3 ? 'neutral' : 'info',
    text: ROOM[result.eventId](fill),
  });

  // 4 — The Moment (priority pick of the most notable signal).
  beats.push(theMoment(result, doorActor, fill));

  // 5 (optional) — Aftershock: a busy night that also bled cash/crew.
  if (result.incidents > 0 && result.theft > 0) {
    beats.push({ time: '01:40', title: 'Aftershock', tone: 'bad', text: "And the till came up short — money's walking out behind the bar." });
  } else if (result.incidents > 0 && result.noShows > 0) {
    beats.push({ time: '01:40', title: 'Aftershock', tone: 'warn', text: 'And short-handed all night — a no-show left the crew stretched.' });
  }

  // 6 — Last Call (net + reputation direction).
  beats.push(lastCall(result));

  return beats;
}

function theMoment(result: NightResult, doorActor: string, fill: number): NightBeat {
  const t = '01:20';
  if (result.incidents > 0) {
    return {
      time: t,
      title: 'Trouble',
      tone: 'bad',
      text:
        result.incidents === 1
          ? `${doorActor} steps in — a scuffle handled before it becomes a scene.`
          : `${doorActor} is stretched — ${result.incidents} incidents nearly get away tonight.`,
    };
  }
  // incidents === 0 here, so any fine must be a compliance fine.
  if (result.fines > 0) {
    return { time: t, title: 'The Inspector', tone: 'warn', text: 'Someone official walks the floor. The relaxed policy just got expensive.' };
  }
  if (result.theft > 0) {
    return { time: t, title: 'Shortfall', tone: 'bad', text: "The till doesn't add up — money's walking out behind the bar." };
  }
  if (result.noShows > 0) {
    return { time: t, title: 'Short-Handed', tone: 'warn', text: 'A no-show leaves a gap; the rest of the crew covers.' };
  }
  if (result.vipBonus > 0) {
    return { time: t, title: 'The Big Table', tone: 'info', text: 'The VIP corner is spending — bottles keep coming.' };
  }
  if (result.serviceRatio >= 1 && fill >= 0.5) {
    return { time: t, title: 'In the Pocket', tone: 'good', text: 'The room peaks — music, crowd, and bar all in sync.' };
  }
  return { time: t, title: 'Lull', tone: 'neutral', text: 'A quiet stretch; the crew catches its breath.' };
}

function lastCall(result: NightResult): NightBeat {
  const repClause =
    result.reputationDelta >= 2
      ? ' Your name grew around the neighborhood.'
      : result.reputationDelta <= -2
        ? ' Your name took a knock tonight.'
        : '';
  if (result.net > 0) {
    return { time: '02:00', title: 'Last Call', tone: 'good', text: `The floor thins out. The books are waiting — a good night's takings.${repClause}` };
  }
  if (result.net < 0) {
    return { time: '02:00', title: 'Last Call', tone: 'bad', text: `The floor thins out. The books are waiting, and they sting — you ran at a loss.${repClause}` };
  }
  return { time: '02:00', title: 'Last Call', tone: 'neutral', text: `The floor thins out. The books are waiting — about even.${repClause}` };
}
