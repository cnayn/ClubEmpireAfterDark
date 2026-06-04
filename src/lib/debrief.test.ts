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
