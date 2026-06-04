/**
 * Tests for the live-night intervention prototype: the cooling trigger fires
 * selectively, the three choices move the night deterministically within a
 * bounded range, and same seed + prep + choice is reproducible.
 */

import { defaultDayConfig, STARTING_ROSTER } from '@/domain/staff';
import type { ClubState, DayConfig, NightResult } from '@/domain/types';
import { resolveNight } from '@/sim/night';
import { getChoice, INTERVENTION_CHOICES, isCoolingNight } from './intervention';

function result(over: Partial<NightResult> = {}): NightResult {
  return {
    day: 4, guests: 40, capacity: 60, revenue: 600, costs: 300, net: 300,
    coverRevenue: 200, barRevenue: 400, vipBonus: 0, wages: 340, theft: 0, fines: 0,
    incidents: 0, noShows: 0, eventId: 'regular', eventCost: 0, bookingFee: 0,
    reputationBefore: 50, reputationAfter: 50, reputationDelta: 0,
    vipSatisfaction: 60, regularLoyalty: 65, serviceRatio: 1, notes: [], ...over,
  };
}

describe('isCoolingNight (fires selectively)', () => {
  it('does NOT fire on a healthy, well-attended night', () => {
    expect(isCoolingNight(result({ regularLoyalty: 65, guests: 40, capacity: 60 }))).toBe(false);
  });
  it('fires when loyalty is low (room not held)', () => {
    expect(isCoolingNight(result({ regularLoyalty: 45, guests: 40, capacity: 60 }))).toBe(true);
  });
  it('fires when the floor is thin', () => {
    expect(isCoolingNight(result({ regularLoyalty: 65, guests: 18, capacity: 60 }))).toBe(true);
  });
});

describe('intervention choices', () => {
  it('exposes exactly three choices incl. a no-op "ride it out"', () => {
    expect(INTERVENTION_CHOICES.map((c) => c.id)).toEqual(['push-dj', 'bar-promo', 'ride']);
    expect(getChoice('ride').intervention).toEqual({ vibeBonus: 0, revenueMod: 1 });
  });
  it('push-dj lifts energy at a small bar cost; bar-promo lifts the bar', () => {
    const dj = getChoice('push-dj').intervention;
    const bar = getChoice('bar-promo').intervention;
    expect(dj.vibeBonus).toBeGreaterThan(0);
    expect(dj.revenueMod).toBeLessThan(1);
    expect(bar.revenueMod).toBeGreaterThan(1);
  });
});

describe('choices move the night deterministically, within a bounded range', () => {
  // A cooling setup: high prices thin the crowd and drop loyalty.
  const staff = STARTING_ROSTER.map((m) => ({ ...m }));
  const club: ClubState = {
    name: 'T', day: 4, cash: 2000, reputation: 35, baseCapacity: 60,
    ownedUpgradeIds: [], staff, lastConfig: defaultDayConfig(staff),
  };
  const config: DayConfig = { ...defaultDayConfig(staff), coverLevel: 'high', drinkLevel: 'high' };
  const SEED = 12345;
  const run = (id: Parameters<typeof getChoice>[0]) =>
    resolveNight(club, config, SEED, getChoice(id).intervention).result;

  it('the chosen setup actually cools (so the beat would fire)', () => {
    expect(isCoolingNight(resolveNight(club, config, SEED).result)).toBe(true);
  });

  it('push-dj > ride on reputation; bar-promo > ride on bar revenue', () => {
    const ride = run('ride');
    expect(run('push-dj').reputationDelta).toBeGreaterThanOrEqual(ride.reputationDelta);
    expect(run('bar-promo').barRevenue).toBeGreaterThan(ride.barRevenue);
  });

  it('outcomes differ by choice but stay bounded (no runaway)', () => {
    const ride = run('ride');
    const dj = run('push-dj');
    const bar = run('bar-promo');
    // bounded: net swing from any choice is a modest fraction, not a different game
    for (const r of [dj, bar]) {
      expect(Math.abs(r.net - ride.net)).toBeLessThan(Math.max(150, Math.abs(ride.net) * 0.3));
    }
  });

  it('same seed + prep + choice is reproducible', () => {
    expect(run('push-dj')).toEqual(run('push-dj'));
    expect(resolveNight(club, config, SEED, getChoice('bar-promo').intervention).result).toEqual(
      resolveNight(club, config, SEED, getChoice('bar-promo').intervention).result
    );
  });

  it('ride-it-out equals no intervention (identity)', () => {
    expect(run('ride')).toEqual(resolveNight(club, config, SEED).result);
  });
});
