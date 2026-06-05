/**
 * Tutorial / Mentor v1 — pure, deterministic state-reads. No persistence.
 */

import { defaultDayConfig, STARTING_ROSTER } from '@/domain/staff';
import type { ClubState, DayConfig, NightResult } from '@/domain/types';
import { checklistDone, firstNightChecklist, firstNightReady, isFirstNight, MENTOR_LABEL, mentorNote, nightMentorLine, prepMentorLine, resultMentorLine } from './mentor';

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

  it('night line nudges a boss action until one is used', () => {
    expect(nightMentorLine(0)).not.toBeNull();
    expect(nightMentorLine(0)!.toLowerCase()).toContain('make a call');
    expect(nightMentorLine(2)).toBeNull();
  });

  it('result line teaches reading the damage by outcome', () => {
    expect(resultMentorLine(result({ incidents: 1 })).toLowerCase()).toContain('damage');
    expect(resultMentorLine(result({ incidents: 0, net: -50 })).toLowerCase()).toContain('red night');
    expect(resultMentorLine(result({ incidents: 0, net: 50, serviceRatio: 0.6 })).toLowerCase()).toContain('bar line');
    expect(resultMentorLine(result()).toLowerCase()).toContain('debrief');
  });

  it('first-night gate applies only on day 1 and lists the three guided steps in order', () => {
    expect(isFirstNight(club({ day: 1 }))).toBe(true);
    expect(isFirstNight(club({ day: 2 }))).toBe(false);
    const items = firstNightChecklist();
    expect(items.map((i) => i.id)).toEqual(['crew', 'bar', 'rules']); // wizard order
    for (const it of items) {
      expect(it.label.length).toBeGreaterThan(0);
      expect(it.hint.length).toBeGreaterThan(0);
    }
  });

  describe('first-night checklist requires real interaction (no fake/default ticks)', () => {
    it('a fresh game starts with every step incomplete and not ready', () => {
      const fresh = new Set<string>();
      expect(checklistDone(fresh)).toEqual({ crew: false, bar: false, rules: false });
      expect(firstNightReady(fresh)).toBe(false);
    });

    it('default values / a valid schedule alone do NOT complete any step', () => {
      // checklist truth is derived only from `touched`, never from config defaults.
      expect(checklistDone(new Set()).crew).toBe(false);
      expect(checklistDone(new Set()).bar).toBe(false);
      expect(checklistDone(new Set()).rules).toBe(false);
    });

    it('interacting with a section completes only that step', () => {
      expect(checklistDone(new Set(['bar'])).bar).toBe(true);
      expect(checklistDone(new Set(['bar'])).rules).toBe(false);
      expect(checklistDone(new Set(['rules'])).rules).toBe(true);
      expect(checklistDone(new Set(['crew'])).crew).toBe(true);
    });

    it('is ready to open only when all three steps are genuinely done', () => {
      expect(firstNightReady(new Set(['crew', 'bar']))).toBe(false);
      expect(firstNightReady(new Set(['crew', 'bar', 'rules']))).toBe(true);
    });
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
