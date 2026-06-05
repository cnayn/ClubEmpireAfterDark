/**
 * Tutorial / Mentor v1 — pure, deterministic state-reads. No persistence.
 */

import { defaultDayConfig, STARTING_ROSTER } from '@/domain/staff';
import type { ClubState, DayConfig, NightResult } from '@/domain/types';
import { MENTOR_LABEL, mentorNote, prepMentorLine } from './mentor';

function club(over: Partial<ClubState> = {}): ClubState {
  const staff = STARTING_ROSTER.map((m) => ({ ...m }));
  return {
    name: 'T', day: 1, cash: 600, reputation: 20, baseCapacity: 60,
    ownedUpgradeIds: [], staff, lastConfig: defaultDayConfig(staff), ...over,
  };
}
const cfg = (over: Partial<DayConfig> = {}): DayConfig => ({ ...defaultDayConfig(STARTING_ROSTER), ...over });
function result(over: Partial<NightResult> = {}): NightResult {
  return {
    day: 2, guests: 40, capacity: 60, revenue: 600, costs: 300, net: 300,
    coverRevenue: 200, barRevenue: 400, vipBonus: 0, wages: 340, theft: 0, fines: 0,
    incidents: 0, noShows: 0, eventId: 'regular', eventCost: 0, bookingFee: 0,
    reputationBefore: 20, reputationAfter: 22, reputationDelta: 2,
    vipSatisfaction: 60, regularLoyalty: 60, serviceRatio: 1, notes: [], ...over,
  };
}

describe('mentorNote', () => {
  it('a brand-new club gets the opening lesson (labelled, with a Day Prep nudge)', () => {
    const m = mentorNote(club(), null);
    expect(m).not.toBeNull();
    expect(m!.label).toBe(MENTOR_LABEL);
    expect(m!.line.toLowerCase()).toContain('do not open blind');
    expect(m!.route).toBe('/day-prep');
  });

  it('negative cash overrides with a recovery lesson', () => {
    expect(mentorNote(club({ cash: -100, day: 5 }), null)!.line.toLowerCase()).toContain('red');
  });

  it('reacts to an incident, then to a strained bar', () => {
    expect(mentorNote(club({ day: 3 }), result({ incidents: 2 }))!.line.toLowerCase()).toContain('incident');
    expect(mentorNote(club({ day: 3 }), result({ incidents: 0, serviceRatio: 0.6 }))!.line.toLowerCase()).toContain('bar fell behind');
  });

  it('graduates: a settled, established club gets no card', () => {
    const settled = club({
      day: 12, cash: 4000, reputation: 55,
      venue: { owned: ['neon-sign'], equipped: { entrance: ['neon-sign'] } },
      lastConfig: cfg({ policies: { smoking: 'allowed', idCheck: 'strict', security: 'hardline', barService: 'premium' } }),
    });
    expect(mentorNote(settled, result(), ['push-dj'])).toBeNull();
  });

  it('is deterministic for the same state', () => {
    const c = club({ day: 3 });
    expect(mentorNote(c, result())).toEqual(mentorNote(c, result()));
  });
});

describe('prepMentorLine', () => {
  it('warns when no bartender / no bouncer is scheduled', () => {
    const bouncerOnly = club().staff.filter((m) => m.role === 'bouncer').map((m) => m.id);
    expect(prepMentorLine(club(), cfg({ staffOnDuty: bouncerOnly }))!.toLowerCase()).toContain('bar hands');
    const bartenderOnly = club().staff.filter((m) => m.role === 'bartender').map((m) => m.id);
    expect(prepMentorLine(club(), cfg({ staffOnDuty: bartenderOnly }))!.toLowerCase()).toContain('door');
  });

  it('warns about lean stock', () => {
    const all = STARTING_ROSTER.map((m) => m.id);
    expect(prepMentorLine(club(), cfg({ staffOnDuty: all, drinkPrep: { stock: 'lean', quality: 'house' } }))!.toLowerCase()).toContain('lean stock');
  });

  it('is quiet on a sensibly prepared night', () => {
    const all = STARTING_ROSTER.map((m) => m.id);
    expect(prepMentorLine(club(), cfg({ staffOnDuty: all }))).toBeNull();
  });

  it('works on an old config missing optional policy/drink/venue fields', () => {
    const legacy: DayConfig = { ...cfg() };
    delete (legacy as { policies?: unknown }).policies;
    delete (legacy as { drinkPrep?: unknown }).drinkPrep;
    const legacyClub = club();
    delete (legacyClub as { venue?: unknown }).venue;
    expect(() => prepMentorLine(legacyClub, legacy)).not.toThrow();
    expect(() => mentorNote(legacyClub, null)).not.toThrow();
  });
});
