/**
 * Floor Voices — pure selection of the existing guest/crew voice bank from live
 * state. Deterministic; no sim/RNG/save. Pass 2 covers Block 2 cards, two-bubble
 * selection, three crew states, DJ send voice, and work-room acknowledgements.
 */

import {
  crewVoice,
  crewVoiceState,
  djBoothVoice,
  djSendVoice,
  guestCard,
  guestVoice,
  guestVoices,
  guestVoiceState,
  guestVoiceStates,
  workRoomAck,
} from './floorVoices';

const P = (over: Partial<{ crowd: number; bar: number; door: number; energy: number }> = {}) => ({
  crowd: 0.5, bar: 0.2, door: 0.2, energy: 0.6, ...over,
});

describe('guestVoiceState — a real problem speaks first, quiet stays quiet', () => {
  it('door tension outranks everything', () => {
    expect(guestVoiceState(P({ door: 0.8, bar: 0.9, crowd: 0.9 }))).toBe('door-tense');
  });
  it('bar slow next', () => {
    expect(guestVoiceState(P({ bar: 0.8, crowd: 0.9 }))).toBe('bar-slow');
  });
  it('peak when packed and nothing strained', () => {
    expect(guestVoiceState(P({ crowd: 0.9, bar: 0.2, door: 0.2 }))).toBe('peak');
  });
  it('floor hot on high energy', () => {
    expect(guestVoiceState(P({ energy: 0.8, crowd: 0.5 }))).toBe('floor-hot');
  });
  it('cooling when energy + crowd are low', () => {
    expect(guestVoiceState(P({ energy: 0.2, crowd: 0.3 }))).toBe('cooling');
  });
  it('a calm, middling room says nothing', () => {
    expect(guestVoiceState(P({ crowd: 0.5, bar: 0.3, door: 0.3, energy: 0.5 }))).toBeNull();
  });
  it('guestVoiceStates lists every true state, priority-ordered', () => {
    expect(guestVoiceStates(P({ door: 0.8, bar: 0.8, crowd: 0.9, energy: 0.8 })))
      .toEqual(['door-tense', 'bar-slow', 'peak', 'floor-hot']);
  });
});

describe('guestVoice — picks the segment voice for the state, deterministic', () => {
  it('returns null when nothing notable', () => {
    expect(guestVoice('locals', P({ crowd: 0.5, energy: 0.5 }), 0)).toBeNull();
  });
  it('a slammed bar makes a Local complain about the bar, at the bar', () => {
    const v = guestVoice('locals', P({ bar: 0.8 }), 0);
    expect(v?.zone).toBe('bar');
    expect(v?.line.toLowerCase()).toContain('rosa');
  });
  it('voice differs by segment in the same state', () => {
    const local = guestVoice('locals', P({ door: 0.8 }), 0)?.line;
    const student = guestVoice('students', P({ door: 0.8 }), 0)?.line;
    expect(local).not.toBe(student);
  });
  it('pick rotates between the two catalog lines, deterministically', () => {
    const a = guestVoice('students', P({ energy: 0.8 }), 0)?.line;
    const b = guestVoice('students', P({ energy: 0.8 }), 1)?.line;
    expect(a).not.toBe(b);
    expect(guestVoice('students', P({ energy: 0.8 }), 2)?.line).toBe(a); // wraps %2
  });
});

describe('guestVoices — up to two concurrent voices, always different zones', () => {
  it('a calm room returns nothing', () => {
    expect(guestVoices(['locals', 'students'], P({ crowd: 0.5, energy: 0.5, bar: 0.3, door: 0.3 }), 0)).toEqual([]);
  });
  it('one notable state → exactly one bubble', () => {
    const v = guestVoices(['locals', 'students'], P({ bar: 0.8 }), 0);
    expect(v).toHaveLength(1);
    expect(v[0].zone).toBe('bar');
  });
  it('door + bar both strained → two bubbles in two zones, two segments', () => {
    const v = guestVoices(['locals', 'students'], P({ door: 0.8, bar: 0.8 }), 0);
    expect(v).toHaveLength(2);
    expect(v.map((x) => x.zone).sort()).toEqual(['bar', 'door']);
    // the second voice comes from the next segment, so the room isn't one crowd
    expect(v[0].line.toLowerCase()).toContain('line'); // locals door-tense, pick 0
    expect(v[1].line).toBe('Did you order yet? I’ll Venmo you!'); // students bar-slow, pick 0
  });
  it('never stacks two bubbles in the same zone (peak + floor-hot share floor)', () => {
    expect(guestVoices(['locals', 'students'], P({ crowd: 0.9, energy: 0.8 }), 0)).toHaveLength(1);
  });
  it('the speaking segment rotates across buckets, so repeats vary', () => {
    const a = guestVoices(['locals', 'students'], P({ door: 0.8 }), 0)[0].line;
    const b = guestVoices(['locals', 'students'], P({ door: 0.8 }), 1)[0].line;
    expect(a).not.toBe(b);
  });
});

describe('guestCard — Block 2 info card, Mood tracks the live state', () => {
  it('cooling Locals read the cooling mood line', () => {
    const c = guestCard('locals', P({ energy: 0.2, crowd: 0.3 }));
    expect(c.state).toBe('cooling');
    expect(c.mood).toBe('Already weighing the next place over.');
    expect(c.want).toBe('A reason this is still our place.');
  });
  it('peak Students read the peak mood line', () => {
    const c = guestCard('students', P({ crowd: 0.9 }));
    expect(c.state).toBe('peak');
    expect(c.mood).toBe('Filming everything.');
  });
  it('the tapped zone’s own strain wins the mood pick', () => {
    // Door is the louder global problem, but the bar queue was tapped.
    const c = guestCard('locals', P({ door: 0.8, bar: 0.7 }), 'bar');
    expect(c.state).toBe('bar-slow');
    expect(c.mood).toBe('Patient — until the third bartender misses them.');
  });
  it('a calm room falls back to a quiet mood; the stable fields stay', () => {
    const c = guestCard('rough', P({ crowd: 0.5, energy: 0.5 }));
    expect(c.state).toBeNull();
    expect(c.mood).toBeTruthy();
    expect(c.tell).toBe('Eye-tracks the door more than the floor.');
  });
  it('cards differ by segment (voice differentiation)', () => {
    expect(guestCard('locals', P()).type).not.toBe(guestCard('vipcurious', P()).type);
  });
});

describe('crewVoiceState — fresh · working · worn, derived live', () => {
  it('early + calm station = fresh', () => {
    expect(crewVoiceState(0.2, 0.2)).toBe('fresh');
  });
  it('mid pressure or deep into the night = working', () => {
    expect(crewVoiceState(0.2, 0.5)).toBe('working');
    expect(crewVoiceState(0.5, 0.2)).toBe('working');
  });
  it('worn needs BOTH late night and a hot station', () => {
    expect(crewVoiceState(0.7, 0.8)).toBe('worn');
    expect(crewVoiceState(0.7, 0.2)).toBe('working'); // late but calm ≠ worn
    expect(crewVoiceState(0.2, 0.9)).toBe('working'); // slammed but early ≠ worn
  });
});

describe('crewVoice — named cast sound like themselves across three states', () => {
  it('Rosa fresh ≠ working ≠ worn; worn Rosa sounds tired-Rosa', () => {
    const fresh = crewVoice('bar-rosa', 'bartender', 'fresh');
    const working = crewVoice('bar-rosa', 'bartender', 'working');
    const worn = crewVoice('bar-rosa', 'bartender', 'worn');
    expect(new Set([fresh, working, worn]).size).toBe(3);
    expect(worn.toLowerCase()).toContain('cut you off');
  });
  it('John does not sound like Caramel', () => {
    expect(crewVoice('bnc-john', 'bouncer', 'fresh')).not.toBe(crewVoice('bnc-kareem', 'bouncer', 'fresh'));
  });
  it('worn John is the bible line', () => {
    expect(crewVoice('bnc-john', 'bouncer', 'worn')).toBe('Nobody disrespects the door. Nobody.');
  });
  it('Caramel’s cross-station tap line only fires when the bar actually is struggling', () => {
    expect(crewVoice('bnc-kareem', 'bouncer', 'fresh', { barStrained: true })).toBe('Door’s holding, bro. Bar’s not.');
    expect(crewVoice('bnc-kareem', 'bouncer', 'fresh', { barStrained: false })).not.toContain('Bar’s not');
    // worn = his own door is hot too, so "door's holding" would be a lie
    expect(crewVoice('bnc-kareem', 'bouncer', 'worn', { barStrained: true })).not.toContain('Door’s holding');
  });
  it('a character without a written worn line falls back to their OWN working line', () => {
    expect(crewVoice('bar-vince', 'bartender', 'worn')).toBe(crewVoice('bar-vince', 'bartender', 'working'));
  });
  it('an unknown id falls back to short role-generic lines per state', () => {
    expect(crewVoice('bar-nobody', 'bartender', 'fresh')).toBeTruthy();
    expect(crewVoice('bnc-nobody', 'bouncer', 'worn')).toBeTruthy();
    expect(crewVoice('bnc-nobody', 'bouncer', 'worn')).not.toBe(crewVoice('bnc-nobody', 'bouncer', 'fresh'));
  });
});

describe('DJ booth — written tap + send voices, keyed by live energy', () => {
  it('tap voice shifts with floor energy', () => {
    expect(djBoothVoice(0.2)).not.toBe(djBoothVoice(0.5));
    expect(djBoothVoice(0.9)).not.toBe(djBoothVoice(0.5));
  });
  it('send voice is honest: lifts a mid room, admits a checked-out one, defers to a hot one', () => {
    expect(djSendVoice(0.5)).toBe('Lifting now.');
    expect(djSendVoice(0.2)).toBe('Trying. Room’s checked out.');
    expect(djSendVoice(0.9)).toBe('Room’s already there, boss.');
  });
});

describe('workRoomAck — written acknowledgements from whoever is actually there', () => {
  it('Caramel on the door answers first', () => {
    const a = workRoomAck(['bnc-kareem', 'bar-rosa'], 0);
    expect(a.speaker).toBe('Caramel');
    expect(a.zone).toBe('door');
  });
  it('repeats rotate through the available voices', () => {
    const ids = ['bnc-kareem', 'bar-rosa'];
    const speakers = [0, 1, 2].map((p) => workRoomAck(ids, p).speaker);
    expect(speakers).toEqual(['Caramel', 'Rosa', 'A regular']);
  });
  it('with no named cast on duty, a regular still acknowledges the owner', () => {
    const a = workRoomAck(['bar-milo'], 0);
    expect(a.speaker).toBe('A regular');
    expect(a.line).toBe('Owner on the floor. Good.');
  });
});
