/**
 * Floor Voices — Storyline Pass 1 (presentation only).
 *
 * Surfaces the ALREADY-WRITTEN guest + crew voice bank (docs/design/floor-content.md
 * Blocks 1 & 3) on the live night, picked from current state. PURE + DETERMINISTIC:
 * no sim, no RNG, no per-guest memory, no save schema, no resolver/economy change.
 * Same (segment, state, pick) ⇒ same line.
 *
 * Content is copied from floor-content.md (CURRENT-BUILD-eligible cells only — no
 * FUTURE-tagged cast/roles). Tone discipline already enforced in the doc: one
 * short line, Neon Noir, no real names/brands, Rough Crowd is attitude not action,
 * no system promises.
 */

import type { CrowdSegmentId } from '@/domain/crowd';
import type { BubbleTone, BubbleZone } from '@/lib/dashboard';

/** The five night-states the guest bubble bank is keyed on (floor-content §Block 1). */
export type GuestVoiceState = 'bar-slow' | 'floor-hot' | 'door-tense' | 'peak' | 'cooling';

interface LivePressureRead {
  crowd: number;
  bar: number;
  door: number;
  energy: number;
}

/**
 * Which guest-voice state the room is in right now — or null when nothing is
 * notable (a quiet room stays quiet, no overheard line). Priority: a real
 * problem (door/bar) speaks first, then the highs (peak/hot), then cooling.
 */
export function guestVoiceState(p: LivePressureRead): GuestVoiceState | null {
  if (p.door >= 0.66) return 'door-tense';
  if (p.bar >= 0.66) return 'bar-slow';
  if (p.crowd >= 0.85) return 'peak';
  if (p.energy >= 0.66) return 'floor-hot';
  if (p.energy < 0.4 && p.crowd < 0.45) return 'cooling';
  return null;
}

/** Guest speech bubbles — segment × night-state, two lines each (floor-content §Block 1). */
const GUEST_LINES: Record<CrowdSegmentId, Record<GuestVoiceState, [string, string]>> = {
  locals: {
    'bar-slow': ['Rosa’s swamped again.', 'Could pour my own if you let me.'],
    'floor-hot': ['Loud tonight. Good loud.', 'Better than the place down the road.'],
    'door-tense': ['Wait — the line’s down the block?', 'Tell Caramel it’s me.'],
    peak: ['Hasn’t felt like this in years.', 'First time I waited for a table here.'],
    cooling: ['Empty for a Saturday.', 'Used to know everyone in this room.'],
  },
  students: {
    'bar-slow': ['Did you order yet? I’ll Venmo you!', 'Eight people in front of us.'],
    'floor-hot': ['BEST NIGHT EVER!', 'Whose phone is the playlist?'],
    'door-tense': ['We’ve been out here forty minutes!', 'Is it cap inside?'],
    peak: ['Photo. Photo. Photo.', 'Everyone’s tagging this.'],
    cooling: ['Are we leaving?', 'Sketchy.'],
  },
  musicheads: {
    'bar-slow': ['I’ll go later. Set’s about to turn.', 'Bring me a water when you can.'],
    'floor-hot': ['Third edit I haven’t recognised.', 'Whoever’s on the decks knows what they’re doing.'],
    'door-tense': ['Worth the wait if the booth holds.', 'Anyone clocked the set time?'],
    peak: ['He just dropped that?', 'I’m not leaving for anything.'],
    cooling: ['Off the beat. Lost the room.', 'Walking. Basement up the road.'],
  },
  vipcurious: {
    'bar-slow': ['Is there a bottle list?', 'Tell me you have a back room.'],
    'floor-hot': ['Is anyone famous here?', 'Better lighting in the booth?'],
    'door-tense': ['Are we on the list?', 'My friend knows the owner.'],
    peak: ['Whose table is that?', 'Snap this. Vertical.'],
    cooling: ['We’re being seen at a nine-PM place.', 'Uber. Now.'],
  },
  rough: {
    'bar-slow': ['Long way to the bar.', 'Don’t see anyone serving us.'],
    'floor-hot': ['Loud enough you can’t hear yourself.', 'Crowd’s pushing.'],
    'door-tense': ['Tell him I’m not leaving.', 'What’s the holdup.'],
    peak: ['Whole town’s in here.', 'Eyes everywhere.'],
    cooling: ['Dead. We’re going.', 'Knew it was this kind of place.'],
  },
  regulars: {
    'bar-slow': ['Vince again. Six tickets deep.', 'Rosa would’ve cleared this in ten.'],
    'floor-hot': ['First time it’s felt like this since the relaunch.', 'Going to remember tonight.'],
    'door-tense': ['Caramel knows me. Ask him.', 'There used to be a side door.'],
    peak: ['Every Saturday for two years. This is the one.', 'Tell Otis I want what he’s drinking.'],
    cooling: ['Where’s everyone.', 'Worries me, this.'],
  },
};

const STATE_ZONE: Record<GuestVoiceState, BubbleZone> = {
  'bar-slow': 'bar',
  'door-tense': 'door',
  'floor-hot': 'floor',
  peak: 'floor',
  cooling: 'floor',
};
const STATE_TONE: Record<GuestVoiceState, BubbleTone> = {
  'bar-slow': 'warn',
  'door-tense': 'bad',
  'floor-hot': 'good',
  peak: 'info',
  cooling: 'warn',
};

export interface GuestVoice {
  line: string;
  zone: BubbleZone;
  tone: BubbleTone;
}

/**
 * The overheard guest line for the current top segment + state. `pick` selects
 * one of the two catalog lines deterministically (the caller rotates it slowly so
 * the room re-speaks occasionally, not every frame). Returns null when nothing is
 * notable enough to say.
 */
export function guestVoice(segment: CrowdSegmentId, p: LivePressureRead, pick: number): GuestVoice | null {
  const state = guestVoiceState(p);
  if (!state) return null;
  const lines = GUEST_LINES[segment]?.[state];
  if (!lines) return null;
  return { line: lines[Math.abs(pick) % 2], zone: STATE_ZONE[state], tone: STATE_TONE[state] };
}

// --- Crew voices (floor-content §Block 3 — ACTIVE cast only) ------------------

type CrewLine = { tap: string; busy: string };

/** Named ACTIVE crew tap/under-pressure lines, keyed by staff id. */
const CREW_LINES: Record<string, CrewLine> = {
  'bnc-john': { tap: 'Door’s mine, boss. Always.', busy: 'Say the word. I’ll handle it.' },
  'bnc-kareem': { tap: 'Door’s holding, bro. Bar’s not.', busy: 'On it, bro.' },
  'bnc-grace': { tap: 'Door process is clean tonight.', busy: 'ID. The real one. I’ll wait.' },
  'bnc-pavel': { tap: 'I’m here. What needs handling.', busy: 'I said I’d come. I came.' },
  'bnc-dimitri': { tap: 'I’ve worked rooms louder than this.', busy: 'We’ll be fine. Slow your breathing.' },
  'bnc-marcus': { tap: 'Standing where I need to stand.', busy: 'Step back.' },
  'bar-rosa': { tap: 'Same as last week? Sit. I’ll bring it.', busy: 'Six tickets in. Two of them annoyed.' },
  'bar-vince': { tap: 'Boss. Night’s mine. Watch this.', busy: 'Two of these and one for the lady.' },
  'bar-milo': { tap: 'Order’s up.', busy: 'I can hold. I can’t catch up.' },
  'bar-jin': { tap: 'Whatever you said. Sure.', busy: 'Two beers. Coming up.' },
};

const CREW_FALLBACK: Record<'bartender' | 'bouncer', CrewLine> = {
  bartender: { tap: 'Order’s up.', busy: 'Hands full — give me a second.' },
  bouncer: { tap: 'Holding the door.', busy: 'Watching the line.' },
};

/**
 * What a crew member says when inspected — their own voice if they're named cast,
 * a short role-generic otherwise. `underPressure` swaps to their busy line. Pure.
 */
export function crewVoice(staffId: string, role: 'bartender' | 'bouncer', underPressure: boolean): string {
  const v = CREW_LINES[staffId] ?? CREW_FALLBACK[role];
  return underPressure ? v.busy : v.tap;
}

/** The (unnamed) DJ booth's own voice, by live floor energy (floor-content §DJ booth). */
export function djBoothVoice(energy: number): string {
  if (energy >= 0.66) return 'Room’s already there, boss.';
  if (energy <= 0.3) return 'Trying. Room’s checked out.';
  return 'Set’s reading.';
}

/** Working the room surfaces a short acknowledgement from nearby cast/guests —
 *  Caramel on the door, else Rosa on the bar, else a regular (floor-content §Owner). */
export function workRoomVoice(onDutyIds: string[]): string {
  if (onDutyIds.includes('bnc-kareem')) return 'Good. Room sees you.';
  if (onDutyIds.includes('bar-rosa')) return 'Tell the bar I said hi.';
  return 'Owner on the floor. Good.';
}
