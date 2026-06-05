/**
 * Manager's Debrief tests — pure boss-level read of a finished night, plus the
 * static John/Caramel crew-flavor lines. No relationship system: flavor is chosen
 * by on-duty ids + result fields only, deterministically.
 */

import type { ClubState, NightResult, StaffMember } from '@/domain/types';
import { buildDebrief } from './debrief';

function result(over: Partial<NightResult> = {}): NightResult {
  return {
    day: 4, guests: 40, capacity: 60, revenue: 800, costs: 500, net: 300,
    coverRevenue: 200, barRevenue: 560, vipBonus: 0, wages: 340, theft: 0, fines: 0,
    incidents: 0, noShows: 0, eventId: 'regular', eventCost: 0, bookingFee: 0,
    reputationBefore: 50, reputationAfter: 50, reputationDelta: 0,
    vipSatisfaction: 60, regularLoyalty: 60, serviceRatio: 1, notes: [], ...over,
  };
}

const bouncer = (id: string): StaffMember => ({
  id, name: id, role: 'bouncer', salary: 100, skill: 50,
  honesty: 100, reliability: 100, visibleTrait: 'none', hiddenTrait: 'none', description: '',
});

function club(onDuty: string[], staff: StaffMember[]): ClubState {
  return {
    name: 'T', day: 4, cash: 1000, reputation: 50, baseCapacity: 60,
    ownedUpgradeIds: [], staff,
    lastConfig: {
      music: 'house', coverLevel: 'low', drinkLevel: 'med',
      staffOnDuty: onDuty, eventId: 'regular', vipFocus: false, smoking: 'strict',
    },
  };
}

const keys = (r: NightResult, c?: ClubState) => buildDebrief(r, c).map((l) => l.key);

describe('buildDebrief — boss-level categories', () => {
  it('always covers money, crowd, bar, door, reputation', () => {
    const k = keys(result());
    for (const cat of ['money', 'crowd', 'bar', 'door', 'rep']) expect(k).toContain(cat);
  });

  it('money line reflects the net result', () => {
    const loss = buildDebrief(result({ net: -200 })).find((l) => l.key === 'money')!;
    expect(loss.tone).toBe('bad');
    const win = buildDebrief(result({ net: 300 })).find((l) => l.key === 'money')!;
    expect(win.tone).toBe('good');
    const skim = buildDebrief(result({ net: 300, theft: 40 })).find((l) => l.key === 'money')!;
    expect(skim.tone).toBe('warn'); // money came in but the till came up short
  });

  it('bar line reflects service ratio', () => {
    expect(buildDebrief(result({ serviceRatio: 1 })).find((l) => l.key === 'bar')!.tone).toBe('good');
    expect(buildDebrief(result({ serviceRatio: 0.5 })).find((l) => l.key === 'bar')!.tone).toBe('bad');
  });

  it('door line reflects incidents and bouncer coverage', () => {
    expect(buildDebrief(result({ incidents: 3 })).find((l) => l.key === 'door')!.tone).toBe('bad');
    // zero incidents but no bouncer on duty → a "got away with it" warning
    const noDoor = club([], []); // nobody on duty
    expect(buildDebrief(result({ incidents: 0 }), noDoor).find((l) => l.key === 'door')!.tone).toBe('warn');
  });

  it('reputation line reflects the delta', () => {
    expect(buildDebrief(result({ reputationDelta: 4 })).find((l) => l.key === 'rep')!.tone).toBe('good');
    expect(buildDebrief(result({ reputationDelta: -4 })).find((l) => l.key === 'rep')!.tone).toBe('bad');
  });

  it('is deterministic for the same input', () => {
    expect(buildDebrief(result(), club(['bnc-john'], [bouncer('bnc-john')]))).toEqual(
      buildDebrief(result(), club(['bnc-john'], [bouncer('bnc-john')]))
    );
  });
});

describe('Debrief v2 — boss report frame (summary + tomorrow)', () => {
  it('opens with a Boss summary headline and closes with a Tomorrow fix line', () => {
    const lines = buildDebrief(result());
    expect(lines[0].key).toBe('summary');
    expect(lines[0].label).toBe('Boss');
    const last = lines[lines.length - 1];
    expect(last.key).toBe('fix');
    expect(last.label).toBe('Tomorrow');
  });

  it('summary + fix react to the night (loss, incident, strained bar)', () => {
    const loss = buildDebrief(result({ net: -200 }));
    expect(loss.find((l) => l.key === 'summary')!.tone).toBe('bad');

    const incident = buildDebrief(result({ incidents: 2 }));
    expect(incident.find((l) => l.key === 'fix')!.text.toLowerCase()).toContain('door');

    const strained = buildDebrief(result({ serviceRatio: 0.6 }));
    expect(strained.find((l) => l.key === 'fix')!.text.toLowerCase()).toContain('bar');
  });

  it('still always covers money/crowd/bar/door/rep alongside the new frame', () => {
    const k = buildDebrief(result()).map((l) => l.key);
    for (const cat of ['summary', 'money', 'crowd', 'bar', 'door', 'rep', 'fix']) expect(k).toContain(cat);
  });

  it('stays a tight report — context lines are capped (never a wall of text)', () => {
    // A messy night that would otherwise fire many optional lines.
    const c = club(['bnc-john', 'bnc-kareem'], [
      { id: 'bnc-john', name: 'John', role: 'bouncer', salary: 100, skill: 50, honesty: 100, reliability: 100, visibleTrait: 'none', hiddenTrait: 'none', description: '' },
      { id: 'bnc-kareem', name: 'Caramel', role: 'bouncer', salary: 100, skill: 50, honesty: 100, reliability: 100, visibleTrait: 'none', hiddenTrait: 'none', description: '' },
    ]);
    const lines = buildDebrief(result({ incidents: 2, serviceRatio: 0.5, theft: 40, net: -100 }), c, ['push-dj', 'check-bar', 'send-bouncer', 'work-room']);
    expect(lines.length).toBeLessThanOrEqual(11); // 1 summary + 5 core + ≤3 context + 1 fix
    expect(lines.filter((l) => l.label === 'Your call').length).toBeLessThanOrEqual(2);
  });
});

describe('crew flavor (John / Caramel) — presentation only, no relationship system', () => {
  const john = bouncer('bnc-john');
  const caramel = bouncer('bnc-kareem');

  it('adds a crew line when BOTH John and Caramel are on duty', () => {
    const c = club(['bnc-john', 'bnc-kareem'], [john, caramel]);
    const crew = buildDebrief(result(), c).find((l) => l.key === 'crew');
    expect(crew).toBeDefined();
    expect(crew!.text.length).toBeGreaterThan(0);
  });

  it('adds a crew line for John alone only under pressure (incidents/busy)', () => {
    const c = club(['bnc-john'], [john]);
    // tense night (incident) → flavor present
    expect(buildDebrief(result({ incidents: 1 }), c).some((l) => l.key === 'crew')).toBe(true);
    // calm, empty night → no forced John line
    expect(buildDebrief(result({ incidents: 0, guests: 5, capacity: 60 }), c).some((l) => l.key === 'crew')).toBe(false);
  });

  it('adds a calm Caramel line when Caramel is on duty', () => {
    const c = club(['bnc-kareem'], [caramel]);
    const crew = buildDebrief(result(), c).find((l) => l.key === 'crew');
    expect(crew?.tone).toBe('good');
  });

  it('adds no crew line when neither is on duty', () => {
    const c = club(['someone'], [bouncer('someone')]);
    expect(buildDebrief(result(), c).some((l) => l.key === 'crew')).toBe(false);
  });
});

describe('boss-action debrief lines', () => {
  it('mentions boss actions taken, capped at two', () => {
    const lines = buildDebrief(result({ reputationDelta: 3 }), undefined, ['push-dj', 'work-room', 'send-bouncer']);
    const calls = lines.filter((l) => l.label === 'Your call');
    expect(calls.length).toBeGreaterThanOrEqual(1);
    expect(calls.length).toBeLessThanOrEqual(2);
  });
  it('reflects outcome direction (push-dj good when reputation held/grew)', () => {
    const good = buildDebrief(result({ reputationDelta: 4 }), undefined, ['push-dj']).find((l) => l.key === 'ba-dj');
    expect(good?.tone).toBe('good');
    const bad = buildDebrief(result({ reputationDelta: -4 }), undefined, ['push-dj']).find((l) => l.key === 'ba-dj');
    expect(bad?.tone).toBe('warn');
  });
  it('adds nothing when no boss actions were taken', () => {
    expect(buildDebrief(result()).some((l) => l.label === 'Your call')).toBe(false);
  });
});
