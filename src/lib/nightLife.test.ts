/**
 * Nightclub City layer v1 — live till / hype / music match / troublemakers.
 * Presentation + bounded intervention only; the books still come from the
 * deterministic resolver.
 */

import { defaultDayConfig, STARTING_ROSTER } from '@/domain/staff';
import type { ClubState, NightResult } from '@/domain/types';
import { combineInterventions } from './bossActions';
import {
  cumulativeArrivalFraction,
  guestsInside,
  hypeLevel,
  liveTill,
  musicMatch,
  nightTroublemakers,
  TM_WINDOW,
  troublemakerIntervention,
  troublemakerTicks,
} from './nightLife';

function club(over: Partial<ClubState> = {}): ClubState {
  const staff = STARTING_ROSTER.map((m) => ({ ...m }));
  return {
    name: 'T', day: 4, cash: 1500, reputation: 50, baseCapacity: 60,
    ownedUpgradeIds: [], staff, lastConfig: defaultDayConfig(staff), ...over,
  };
}
function result(over: Partial<NightResult> = {}): NightResult {
  return {
    day: 4, guests: 40, capacity: 60, revenue: 800, costs: 500, net: 300,
    coverRevenue: 200, barRevenue: 560, vipBonus: 0, wages: 340, theft: 0, fines: 0,
    incidents: 0, noShows: 0, eventId: 'regular', eventCost: 0, bookingFee: 0,
    reputationBefore: 50, reputationAfter: 52, reputationDelta: 2,
    vipSatisfaction: 60, regularLoyalty: 60, serviceRatio: 1, notes: [], ...over,
  };
}

describe('cumulativeArrivalFraction — the till curve', () => {
  it('starts empty, ends full, never goes down', () => {
    expect(cumulativeArrivalFraction(0)).toBe(0);
    expect(cumulativeArrivalFraction(1)).toBeCloseTo(1, 5);
    let prev = 0;
    for (let p = 0; p <= 1.0001; p += 0.02) {
      const s = cumulativeArrivalFraction(p);
      expect(s).toBeGreaterThanOrEqual(prev);
      expect(s).toBeLessThanOrEqual(1);
      prev = s;
    }
  });
});

describe('liveTill / guestsInside', () => {
  it('the till fills toward the gross take', () => {
    const r = result({ coverRevenue: 200, barRevenue: 560, vipBonus: 40 });
    expect(liveTill(r, 0)).toBe(0);
    expect(liveTill(r, 1)).toBe(800);
    expect(liveTill(r, 0.5)).toBeGreaterThan(0);
    expect(liveTill(r, 0.5)).toBeLessThan(800);
  });

  it('occupancy peaks mid-night and thins at last call', () => {
    const r = result({ guests: 40 });
    expect(guestsInside(r, 0.75)).toBe(40);
    expect(guestsInside(r, 1)).toBeLessThan(guestsInside(r, 0.75));
    expect(guestsInside(r, 0)).toBeGreaterThanOrEqual(0);
  });
});

describe('hypeLevel', () => {
  it('maps energy to the five state words', () => {
    expect(hypeLevel(0.9).label).toBe('ON FIRE');
    expect(hypeLevel(0.7).label).toBe('HOT');
    expect(hypeLevel(0.5).label).toBe('ALIVE');
    expect(hypeLevel(0.35).label).toBe('WARMING');
    expect(hypeLevel(0.1)).toEqual({ label: 'COLD', tone: 'bad' });
  });
});

describe('musicMatch', () => {
  it('reads the resolver musicFit — pop pleases, techno is a tough sell', () => {
    const c = club();
    expect(musicMatch(c, { ...c.lastConfig, music: 'pop' }).level).toBe('hot');
    expect(musicMatch(c, { ...c.lastConfig, music: 'techno' }).level).toBe('cold');
    expect(musicMatch(c, { ...c.lastConfig, music: 'house' }).label).toContain('House');
  });

  it('the better-sound upgrade can lift a genre a tier', () => {
    const plain = musicMatch(club(), { ...club().lastConfig, music: 'techno' });
    const upgraded = musicMatch(club({ ownedUpgradeIds: ['better-sound'] }), {
      ...club().lastConfig,
      music: 'techno',
    });
    expect(plain.level).toBe('cold');
    expect(upgraded.level).toBe('warm');
  });
});

describe('nightTroublemakers — deterministic schedule', () => {
  it('a quiet thin night breeds none; a busy night breeds at least one', () => {
    const c = club();
    expect(nightTroublemakers(result({ guests: 10, capacity: 60 }), c)).toHaveLength(0);
    expect(nightTroublemakers(result({ guests: 40, capacity: 60 }), c).length).toBeGreaterThanOrEqual(1);
  });

  it('previewed incidents breed more, capped at 3, with valid windows', () => {
    const c = club();
    const tms = nightTroublemakers(result({ incidents: 5 }), c);
    expect(tms.length).toBeLessThanOrEqual(3);
    expect(tms.length).toBeGreaterThanOrEqual(2);
    for (const t of tms) {
      expect(t.at).toBeGreaterThan(0);
      expect(t.until).toBeLessThanOrEqual(1);
      expect(t.until - t.at).toBeCloseTo(TM_WINDOW, 5);
      expect(['door', 'bar', 'floor']).toContain(t.zone);
    }
    // Deterministic: same inputs ⇒ same schedule.
    expect(nightTroublemakers(result({ incidents: 5 }), c)).toEqual(tms);
  });

  it('a strained bar pulls the second troublemaker to the bar', () => {
    const c = club();
    const strained = nightTroublemakers(result({ incidents: 2, serviceRatio: 0.6 }), c);
    const healthy = nightTroublemakers(result({ incidents: 2, serviceRatio: 1 }), c);
    expect(strained[1].zone).toBe('bar');
    expect(healthy[1].zone).toBe('door');
  });
});

describe('troublemakerIntervention — bounded, reckoning included', () => {
  it('ejections help with diminishing returns; slips cost more than ejects earn', () => {
    expect(troublemakerIntervention(0, 0)).toEqual({ vibeBonus: 0, revenueMod: 1 });
    expect(troublemakerIntervention(1, 0).vibeBonus).toBe(5);
    expect(troublemakerIntervention(3, 0).vibeBonus).toBe(10);
    expect(troublemakerIntervention(0, 3).vibeBonus).toBe(-18);
    expect(Math.abs(troublemakerIntervention(0, 1).vibeBonus)).toBeGreaterThan(
      troublemakerIntervention(1, 0).vibeBonus
    );
  });

  it('never moves money and stays inside the combine clamps on its own', () => {
    for (let e = 0; e <= 3; e++) {
      for (let s = 0; s <= 3 - e; s++) {
        const i = troublemakerIntervention(e, s);
        expect(i.revenueMod).toBe(1);
        const combined = combineInterventions([i]);
        expect(combined.vibeBonus).toBeGreaterThanOrEqual(-20);
        expect(combined.vibeBonus).toBeLessThanOrEqual(30);
      }
    }
  });
});

describe('troublemakerTicks', () => {
  it('warns while live, reports the slip after the window, stays quiet when ejected', () => {
    const tms = nightTroublemakers(result({ incidents: 2 }), club());
    expect(tms.length).toBeGreaterThanOrEqual(2);
    const t0 = tms[0];
    expect(troublemakerTicks(tms, [], t0.at - 0.01)).toHaveLength(0);
    const live = troublemakerTicks(tms, [], t0.at + 0.01);
    expect(live).toHaveLength(1);
    expect(live[0].tone).toBe('warn');
    const slipped = troublemakerTicks(tms, [], t0.until + 0.01);
    expect(slipped[0].tone).toBe('bad');
    expect(troublemakerTicks(tms, [t0.id], t0.until + 0.01)).toHaveLength(0);
  });
});
