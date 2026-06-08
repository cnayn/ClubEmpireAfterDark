/**
 * Floor Voices — pure selection of the existing guest/crew voice bank from live
 * state. Deterministic; no sim/RNG/save.
 */

import { crewVoice, djBoothVoice, guestVoice, guestVoiceState, workRoomVoice } from './floorVoices';

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

describe('crewVoice — named cast sound like themselves, with a busy variant', () => {
  it('Rosa sounds like Rosa, and differs calm vs slammed', () => {
    const calm = crewVoice('bar-rosa', 'bartender', false);
    const busy = crewVoice('bar-rosa', 'bartender', true);
    expect(calm).not.toBe(busy);
    expect(`${calm} ${busy}`.toLowerCase()).toMatch(/sit|tickets/);
  });
  it('John does not sound like Caramel', () => {
    expect(crewVoice('bnc-john', 'bouncer', false)).not.toBe(crewVoice('bnc-kareem', 'bouncer', false));
  });
  it('an unknown id falls back to a short role-generic line', () => {
    expect(crewVoice('bar-nobody', 'bartender', false)).toBeTruthy();
    expect(crewVoice('bnc-nobody', 'bouncer', true)).toBeTruthy();
  });
});

describe('djBoothVoice / workRoomVoice — written DJ + owner-presence lines', () => {
  it('DJ booth voice shifts with floor energy', () => {
    expect(djBoothVoice(0.2)).not.toBe(djBoothVoice(0.5));
    expect(djBoothVoice(0.9)).not.toBe(djBoothVoice(0.5));
  });
  it('work-room acknowledgement prefers Caramel, then Rosa, else a regular', () => {
    expect(workRoomVoice(['bnc-kareem']).toLowerCase()).toContain('room');
    expect(workRoomVoice(['bar-rosa']).toLowerCase()).toContain('bar');
    expect(workRoomVoice(['bar-milo']).toLowerCase()).toContain('owner');
  });
});
