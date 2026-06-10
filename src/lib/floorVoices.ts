/**
 * Floor Voices — Storyline Pass 2 (presentation only).
 *
 * Surfaces the ALREADY-WRITTEN guest + crew voice bank (docs/design/
 * floor-content.md Blocks 1–3, plus dialogue palettes from character-bible.md /
 * character-roster.md) on the live night, picked from current state. PURE +
 * DETERMINISTIC: no sim, no RNG, no per-guest memory, no save schema, no
 * resolver/economy change. Same (segment, state, pick) ⇒ same line.
 *
 * Content is copied verbatim from the docs (CURRENT-BUILD-eligible cells only —
 * no FUTURE-tagged cast/roles). Tone discipline already enforced in the doc:
 * one short line, Neon Noir, no real names/brands, Rough Crowd is attitude not
 * action, no system promises. Honesty rule: every selector keys off LIVE state,
 * so a line never praises a cold floor or calls a slammed bar "good".
 */

import type { CrowdSegmentId } from '@/domain/crowd';
import type { BubbleTone, BubbleZone } from '@/lib/dashboard';

/** The five night-states the guest voice bank is keyed on (floor-content §Block 1). */
export type GuestVoiceState = 'bar-slow' | 'floor-hot' | 'door-tense' | 'peak' | 'cooling';

interface LivePressureRead {
  crowd: number;
  bar: number;
  door: number;
  energy: number;
}

/**
 * Every guest-voice state that is TRUE right now, priority-ordered: a real
 * problem (door/bar) speaks first, then the highs (peak/hot), then cooling.
 * Empty when nothing is notable — a quiet room stays quiet.
 */
export function guestVoiceStates(p: LivePressureRead): GuestVoiceState[] {
  const states: GuestVoiceState[] = [];
  if (p.door >= 0.66) states.push('door-tense');
  if (p.bar >= 0.66) states.push('bar-slow');
  if (p.crowd >= 0.85) states.push('peak');
  if (p.energy >= 0.66) states.push('floor-hot');
  if (p.energy < 0.4 && p.crowd < 0.45) states.push('cooling');
  return states;
}

/** The single loudest state (or null when nothing is notable). */
export function guestVoiceState(p: LivePressureRead): GuestVoiceState | null {
  return guestVoiceStates(p)[0] ?? null;
}

/** Guest speech bubbles — segment × night-state, two lines each (floor-content §Block 1, verbatim). */
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
    'door-tense': ['We’ve been out here forty minutes!', 'Is it cap inside? Like fire-code cap?'],
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
    'door-tense': ['Are we on the list? We should be on the list.', 'My friend knows the owner.'],
    peak: ['Whose table is that? Can we move there?', 'Snap this. Vertical.'],
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
 * The overheard guest line for one segment + the current loudest state. `pick`
 * selects one of the two catalog lines deterministically (the caller rotates it
 * slowly so the room re-speaks occasionally, not every frame). Null when nothing
 * is notable enough to say.
 */
export function guestVoice(segment: CrowdSegmentId, p: LivePressureRead, pick: number): GuestVoice | null {
  const state = guestVoiceState(p);
  if (!state) return null;
  const lines = GUEST_LINES[segment]?.[state];
  if (!lines) return null;
  return { line: lines[Math.abs(pick) % 2], zone: STATE_ZONE[state], tone: STATE_TONE[state] };
}

/**
 * Up to TWO concurrent overheard lines, always in DIFFERENT zones (e.g. one bar
 * + one door) — a second bubble only exists when a second distinct-zone state is
 * actually true right now. The speaking segment rotates with `pick` across the
 * top segments so repeat plays use the breadth of the Block 1 matrix; the line
 * pick inside a cell rotates too. A calm room returns nothing.
 */
export function guestVoices(segments: CrowdSegmentId[], p: LivePressureRead, pick: number): GuestVoice[] {
  if (segments.length === 0) return [];
  const states = guestVoiceStates(p);
  const out: GuestVoice[] = [];
  const usedZones = new Set<BubbleZone>();
  let speaker = Math.abs(pick);
  for (const state of states) {
    const zone = STATE_ZONE[state];
    if (usedZones.has(zone)) continue;
    const lines = GUEST_LINES[segments[speaker % segments.length]]?.[state];
    if (!lines) continue;
    out.push({ line: lines[Math.abs(pick) % 2], zone, tone: STATE_TONE[state] });
    usedZones.add(zone);
    speaker += 1;
    if (out.length >= 2) break;
  }
  return out;
}

// --- Guest info cards (floor-content §Block 2 — per segment, verbatim) --------

export interface GuestCard {
  /** Stable per segment. */
  type: string;
  want: string;
  tell: string;
  /** Tracks the live night-state (the Block 2 mood line for that state). */
  mood: string;
  /** Which state the mood matched (null = calm-room fallback). */
  state: GuestVoiceState | null;
}

interface GuestCardBank {
  type: string;
  want: string;
  tell: string;
  mood: Record<GuestVoiceState, string>;
}

const GUEST_CARDS: Record<CrowdSegmentId, GuestCardBank> = {
  locals: {
    type: 'Neighborhood crew. Walked here. Two streets over.',
    want: 'A reason this is still our place.',
    tell: 'Greets a bartender by name without checking the name tag.',
    mood: {
      'bar-slow': 'Patient — until the third bartender misses them.',
      'floor-hot': 'Quietly proud of the room.',
      'door-tense': 'Indignant. They live here.',
      peak: 'Hasn’t felt like this in years.',
      cooling: 'Already weighing the next place over.',
    },
  },
  students: {
    type: 'Group of six. Three universities. One credit card between them.',
    want: 'A story they can post about.',
    tell: 'Phones up the second something happens. Or doesn’t.',
    mood: {
      'bar-slow': 'Negotiating who Venmo’d whom.',
      'floor-hot': 'Peak Friday energy. Maximum noise.',
      'door-tense': 'Convinced the bouncer is wrong about cap.',
      peak: 'Filming everything.',
      cooling: 'Already typing the next location into the chat.',
    },
  },
  musicheads: {
    type: 'Sound first. Vibe second. Drink third, if at all.',
    want: 'A booth that reads the room.',
    tell: 'Stands closer to the speakers than to the bar.',
    mood: {
      'bar-slow': 'Doesn’t notice. Hasn’t ordered yet.',
      'floor-hot': 'Locked in. Eyes shut, head down.',
      'door-tense': 'Checking set times. Will wait if the booth holds.',
      peak: 'Won’t speak until the bridge ends.',
      cooling: 'Polling the basement up the road.',
    },
  },
  vipcurious: {
    type: 'Aspirational. Watches the room more than the dance floor.',
    want: 'To be seen at the right place at the right time.',
    tell: 'Asks about the back room before ordering.',
    mood: {
      'bar-slow': 'Looking for someone to flag down.',
      'floor-hot': 'Posing for a photo nobody is taking.',
      'door-tense': 'Convinced the velvet rope is a misunderstanding.',
      peak: 'Already wants the better table.',
      cooling: 'Recalibrating which ‘in’ place they should be at.',
    },
  },
  rough: {
    type: 'Edge-leaning crew. Knows other rooms in the city. Came for a reason.',
    want: 'To be left alone unless they want a conversation.',
    tell: 'Eye-tracks the door more than the floor.',
    mood: {
      'bar-slow': 'Patience thinning.',
      'floor-hot': 'Energy mixed with watching.',
      'door-tense': 'Reading the bouncer.',
      peak: 'Comfortable in the noise.',
      cooling: 'Reading the room for somewhere else.',
    },
  },
  regulars: {
    type: 'Here long enough to notice when the bartender is new.',
    want: 'The club to still be the club next month.',
    tell: 'Knows where Caramel stands when he’s worried.',
    mood: {
      'bar-slow': 'Disappointed. Won’t complain.',
      'floor-hot': 'Proud, like they helped build it.',
      'door-tense': 'Walks past the line and waits to be recognised.',
      peak: 'Says ‘tonight is the one’ more than once.',
      cooling: 'Worried for the room, not for themselves.',
    },
  },
};

/** Minimal safe fallback for a calm room — Block 2 has no "nothing notable"
 *  mood line per segment yet (CONTENT GAP, flagged for the content session). */
const CALM_MOOD = 'Settled in. Nothing pulling at them yet.';

/**
 * The Block 2 info card for a segment, with the Mood line matched to the live
 * night-state. When the card was opened from a specific zone (bar queue / door
 * line), that zone's own strain wins the mood pick — tapping a slammed bar's
 * queue reads bar-slow even if the door is the louder global problem. Pure.
 */
export function guestCard(segment: CrowdSegmentId, p: LivePressureRead, zone?: BubbleZone): GuestCard {
  const c = GUEST_CARDS[segment];
  let state = guestVoiceState(p);
  if (zone === 'door' && p.door >= 0.66) state = 'door-tense';
  else if (zone === 'bar' && p.bar >= 0.66) state = 'bar-slow';
  return { type: c.type, want: c.want, tell: c.tell, mood: state ? c.mood[state] : CALM_MOOD, state };
}

// --- Crew voices (floor-content §Block 3 + character-bible / roster dialogue) --

/**
 * Three readable crew states, derived LIVE from existing signals — no fatigue
 * mechanics, no accumulating stats, no performance effects:
 *  - fresh:   early night, station calm
 *  - working: mid pressure or simply deep enough into the night
 *  - worn:    late night AND the station has been running hot
 */
export type CrewVoiceState = 'fresh' | 'working' | 'worn';

export function crewVoiceState(progress: number, stationPressure: number): CrewVoiceState {
  if (progress >= 0.55 && stationPressure >= 0.6) return 'worn';
  if (stationPressure >= 0.45 || progress >= 0.35) return 'working';
  return 'fresh';
}

/** A worn line is optional — characters without one fall back to their own
 *  working line (their voice, never an invented "tired" line). */
type CrewLine = { fresh: string; working: string; worn?: string };

/** Named ACTIVE crew lines by staff id. Sources: floor-content §Block 3 tap/send
 *  lines, plus dialogue palettes in character-bible.md (Legendary/Ultra-Rare/
 *  Rare) and character-roster.md (Uncommon) — written lines only, verbatim. */
const CREW_LINES: Record<string, CrewLine> = {
  'bnc-john': {
    fresh: 'Door’s mine, boss. Always.',
    working: 'Say the word. I’ll handle it.',
    worn: 'Nobody disrespects the door. Nobody.',
  },
  'bnc-kareem': {
    fresh: 'I got the door. You fix the inside.',
    working: 'Big night is good bro, but we need control.',
    worn: 'Bro, I love the madness too, but we still need to survive tomorrow.',
  },
  'bnc-grace': {
    fresh: 'Door process is clean tonight.',
    working: 'ID. The real one. I’ll wait.',
    worn: 'He said his name was Mark. His ID says Marko. Which one is the lie?',
  },
  'bnc-pavel': {
    fresh: 'I’m here. What needs handling.',
    working: 'I said I’d come. I came.',
  },
  'bnc-dimitri': {
    fresh: 'I’ve worked rooms louder than this.',
    working: 'We’ll be fine. Slow your breathing.',
  },
  'bnc-marcus': {
    fresh: 'Standing where I need to stand.',
    working: 'Step back.',
    worn: 'I said step back.',
  },
  'bar-rosa': {
    fresh: 'Same as last week? Sit. I’ll bring it.',
    working: 'Six tickets in. Two of them annoyed.',
    worn: 'You’re good. I cut you off ten minutes ago. You just didn’t notice.',
  },
  'bar-vince': {
    fresh: 'Boss. Night’s mine. Watch this.',
    working: 'Two of these and one for the lady — she pays cash.',
  },
  'bar-milo': {
    fresh: 'Same to you. Quiet night.',
    working: 'Order’s up.',
    worn: 'I can hold. I can’t catch up.',
  },
  'bar-jin': {
    fresh: 'Whatever you said. Sure.',
    working: 'Two beers. Coming up.',
  },
};

/** Role-generic fallback for unnamed/procedural ids (minimal safe lines). */
const CREW_FALLBACK: Record<'bartender' | 'bouncer', Required<CrewLine>> = {
  bartender: { fresh: 'Order’s up.', working: 'Hands full — give me a second.', worn: 'Long shift. Still pouring.' },
  bouncer: { fresh: 'Holding the door.', working: 'Watching the line.', worn: 'Long night. Still on the door.' },
};

/**
 * What a crew member says when inspected — their own written voice per state if
 * they're named cast, a short role-generic otherwise. Caramel's Block 3 tap line
 * reads ACROSS stations ("Door's holding, bro. Bar's not.") so it only fires
 * when the bar actually is struggling while his door still holds. Pure.
 */
export function crewVoice(
  staffId: string,
  role: 'bartender' | 'bouncer',
  state: CrewVoiceState,
  ctx?: { barStrained?: boolean }
): string {
  if (staffId === 'bnc-kareem' && state !== 'worn' && ctx?.barStrained) {
    return 'Door’s holding, bro. Bar’s not.';
  }
  const v = CREW_LINES[staffId] ?? CREW_FALLBACK[role];
  if (state === 'worn') return v.worn ?? v.working;
  return v[state];
}

// --- DJ booth (floor-content §DJ booth — CURRENT-BUILD generic voice) ---------

/** The (unnamed) DJ booth's voice when TAPPED, by live floor energy. */
export function djBoothVoice(energy: number): string {
  if (energy >= 0.66) return 'Room’s already there, boss.';
  if (energy <= 0.3) return 'Trying. Room’s checked out.';
  return 'Set’s reading.';
}

/** The booth's answer to a DJ call (push the DJ / booth actions), matched to
 *  live floor energy — honest about a checked-out room and a room already up. */
export function djSendVoice(energy: number): string {
  if (energy >= 0.66) return 'Room’s already there, boss.';
  if (energy <= 0.3) return 'Trying. Room’s checked out.';
  return 'Lifting now.';
}

// --- Owner — work-room acknowledgements (floor-content §Owner) -----------------

export interface RoomAck {
  speaker: string;
  line: string;
  zone: BubbleZone;
}

/**
 * Working the room surfaces a short WRITTEN acknowledgement from nearby cast /
 * guests (never from the Owner): Caramel on the door, Rosa on the bar, else a
 * regular. `pick` rotates among whoever is actually on duty, so repeated calls
 * vary instead of repeating one voice. Pure.
 */
export function workRoomAck(onDutyIds: string[], pick = 0): RoomAck {
  const acks: RoomAck[] = [];
  if (onDutyIds.includes('bnc-kareem')) acks.push({ speaker: 'Caramel', line: 'Good. Room sees you.', zone: 'door' });
  if (onDutyIds.includes('bar-rosa')) acks.push({ speaker: 'Rosa', line: 'Tell the bar I said hi.', zone: 'bar' });
  acks.push({ speaker: 'A regular', line: 'Owner on the floor. Good.', zone: 'floor' });
  return acks[Math.abs(pick) % acks.length];
}
