/**
 * Room Mood v1 — Guest Happiness + Staff Morale. Pure, bounded, presentation-only.
 */

import { defaultDayConfig, STARTING_ROSTER } from '@/domain/staff';
import type { ClubState, NightResult } from '@/domain/types';
import type { NightPressures } from '@/lib/nightPressure';
import { bossLifts, guestHappiness, staffMorale } from './roomMood';

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
const P = (over: Partial<NightPressures> = {}): NightPressures => ({
  crowd: 0.5, bar: 0.2, door: 0.2, bathroom: 0.2, energy: 0.6, ...over,
});

describe('guestHappiness', () => {
  it('stays within 0..1', () => {
    expect(guestHappiness(result(), club(), P({ energy: 1, bar: 0, door: 0, bathroom: 0 }))).toBeLessThanOrEqual(1);
    expect(guestHappiness(result({ incidents: 3 }), club(), P({ energy: 0, bar: 1, door: 1, bathroom: 1 }))).toBeGreaterThanOrEqual(0);
  });

  it('a strained, troubled room is less happy than a calm energetic one', () => {
    const good = guestHappiness(result(), club(), P({ energy: 0.85, bar: 0.1, door: 0.1, bathroom: 0.1 }));
    const bad = guestHappiness(result({ incidents: 2 }), club(), P({ energy: 0.3, bar: 0.9, door: 0.8, bathroom: 0.8 }));
    expect(good).toBeGreaterThan(bad);
  });

  it('a boss-command lift visibly raises happiness', () => {
    const base = guestHappiness(result(), club(), P());
    expect(guestHappiness(result(), club(), P(), 0.15)).toBeGreaterThan(base);
  });
});

describe('staffMorale', () => {
  it('stays within 0..1', () => {
    expect(staffMorale(result(), club(), P({ energy: 1, bar: 0 }))).toBeLessThanOrEqual(1);
    expect(staffMorale(result({ incidents: 3, serviceRatio: 0.3 }), club(), P({ bar: 1, door: 1 }))).toBeGreaterThanOrEqual(0);
  });

  it('an overworked, broken-service night crushes morale vs a smooth one', () => {
    const smooth = staffMorale(result({ serviceRatio: 1 }), club(), P({ bar: 0.1, door: 0.1 }));
    const buried = staffMorale(result({ serviceRatio: 0.4, incidents: 2 }), club(), P({ bar: 0.95, door: 0.7 }));
    expect(smooth).toBeGreaterThan(buried);
  });

  it('a boss-support lift visibly raises morale', () => {
    const base = staffMorale(result(), club(), P());
    expect(staffMorale(result(), club(), P(), 0.15)).toBeGreaterThan(base);
  });
});

describe('bossLifts — diminishing per repeat, clamped 0..1', () => {
  it('empty actions = no lift on either meter', () => {
    expect(bossLifts([])).toEqual({ happy: 0, morale: 0 });
  });

  it('work-room lifts happy most, send-bouncer lifts morale most', () => {
    expect(bossLifts(['work-room']).happy).toBeGreaterThan(bossLifts(['push-dj']).happy);
    expect(bossLifts(['send-bouncer']).morale).toBeGreaterThan(bossLifts(['push-dj']).morale);
  });

  it('repeats give diminishing lift (never linear)', () => {
    const one = bossLifts(['work-room']).happy;
    const two = bossLifts(['work-room', 'work-room']).happy;
    const three = bossLifts(['work-room', 'work-room', 'work-room']).happy;
    expect(two).toBeGreaterThan(one); // a second call still lifts
    expect(two).toBeLessThan(one * 2); // but not by another full call
    expect(three - two).toBeLessThan(two - one); // and the third lifts less than the second
  });

  it('stays clamped to 0..1 even under heavy spam', () => {
    const spam: import('./bossActions').BossActionId[] = Array.from({ length: 20 }, () => 'push-dj');
    const r = bossLifts(spam);
    expect(r.happy).toBeGreaterThanOrEqual(0);
    expect(r.happy).toBeLessThanOrEqual(1);
    expect(r.morale).toBeGreaterThanOrEqual(0);
    expect(r.morale).toBeLessThanOrEqual(1);
  });
});
