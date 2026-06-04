/**
 * Tests for the live-night intervention prototype (one moment per night, bar
 * pressure prioritised over crowd cooling). Triggers fire selectively, the
 * choices move the night deterministically within a bounded range, and same
 * seed + prep + choice is reproducible.
 */

import { defaultDayConfig, STARTING_ROSTER } from '@/domain/staff';
import type { ClubState, DayConfig, NightResult } from '@/domain/types';
import { resolveNight } from '@/sim/night';
import {
  BAR_CHOICES,
  getChoice,
  INTERVENTION_CHOICES,
  isBarPressureNight,
  isCoolingNight,
  nightMoment,
} from './intervention';

function result(over: Partial<NightResult> = {}): NightResult {
  return {
    day: 4, guests: 40, capacity: 60, revenue: 600, costs: 300, net: 300,
    coverRevenue: 200, barRevenue: 400, vipBonus: 0, wages: 340, theft: 0, fines: 0,
    incidents: 0, noShows: 0, eventId: 'regular', eventCost: 0, bookingFee: 0,
    reputationBefore: 50, reputationAfter: 50, reputationDelta: 0,
    vipSatisfaction: 60, regularLoyalty: 65, serviceRatio: 1, notes: [], ...over,
  };
}

describe('triggers fire selectively', () => {
  it('cooling: low loyalty or thin floor; not on a healthy night', () => {
    expect(isCoolingNight(result({ regularLoyalty: 65, guests: 40, capacity: 60 }))).toBe(false);
    expect(isCoolingNight(result({ regularLoyalty: 45 }))).toBe(true);
    expect(isCoolingNight(result({ guests: 18, capacity: 60 }))).toBe(true);
  });
  it('bar pressure: busy floor the bar cannot serve; not when it keeps up or is thin', () => {
    expect(isBarPressureNight(result({ serviceRatio: 0.6, guests: 45, capacity: 60 }))).toBe(true);
    expect(isBarPressureNight(result({ serviceRatio: 1, guests: 45, capacity: 60 }))).toBe(false);
    expect(isBarPressureNight(result({ serviceRatio: 0.6, guests: 12, capacity: 60 }))).toBe(false);
  });
});

describe('nightMoment — one per night, bar pressure prioritised', () => {
  it('null on a healthy night', () => {
    expect(nightMoment(result({ regularLoyalty: 65, serviceRatio: 1, guests: 40, capacity: 60 }))).toBeNull();
  });
  it('cooling when only cooling', () => {
    expect(nightMoment(result({ regularLoyalty: 45, serviceRatio: 1 }))?.kind).toBe('cooling');
  });
  it('bar at the Bar Pressure beat when the bar is slammed', () => {
    const m = nightMoment(result({ serviceRatio: 0.6, guests: 45, capacity: 60 }));
    expect(m?.kind).toBe('bar');
    expect(m?.beatIndex).toBe(1);
  });
  it('prefers bar when both signals fire', () => {
    expect(nightMoment(result({ regularLoyalty: 45, serviceRatio: 0.6, guests: 45, capacity: 60 }))?.kind).toBe(
      'bar'
    );
  });
});

describe('choice catalogs', () => {
  it('cooling choices: push-dj lifts energy at a bar cost; promo lifts the bar; ride is no-op', () => {
    expect(INTERVENTION_CHOICES.map((c) => c.id)).toEqual(['push-dj', 'crowd-promo', 'crowd-ride']);
    expect(getChoice('push-dj').intervention.vibeBonus).toBeGreaterThan(0);
    expect(getChoice('push-dj').intervention.revenueMod).toBeLessThan(1);
    expect(getChoice('crowd-promo').intervention.revenueMod).toBeGreaterThan(1);
    expect(getChoice('crowd-ride').intervention).toEqual({ vibeBonus: 0, revenueMod: 1 });
  });
  it('bar choices: pull-bouncer eases the bar (rep cost); happy-hour trades margin; ride is no-op', () => {
    expect(BAR_CHOICES.map((c) => c.id)).toEqual(['pull-bouncer', 'happy-hour', 'bar-ride']);
    expect(getChoice('pull-bouncer').intervention.revenueMod).toBeGreaterThan(1);
    expect(getChoice('pull-bouncer').intervention.vibeBonus).toBeLessThan(0);
    expect(getChoice('happy-hour').intervention.revenueMod).toBeLessThan(1);
    expect(getChoice('happy-hour').intervention.vibeBonus).toBeGreaterThan(0);
    expect(getChoice('bar-ride').intervention).toEqual({ vibeBonus: 0, revenueMod: 1 });
  });
});

describe('cooling choices move the night deterministically, within bounds', () => {
  const staff = STARTING_ROSTER.map((m) => ({ ...m }));
  const club: ClubState = {
    name: 'T', day: 4, cash: 2000, reputation: 35, baseCapacity: 60,
    ownedUpgradeIds: [], staff, lastConfig: defaultDayConfig(staff),
  };
  const config: DayConfig = { ...defaultDayConfig(staff), coverLevel: 'high', drinkLevel: 'high' };
  const SEED = 12345;
  const run = (id: Parameters<typeof getChoice>[0]) => resolveNight(club, config, SEED, getChoice(id).intervention).result;

  it('the setup cools (and is not bar-pressured)', () => {
    const base = resolveNight(club, config, SEED).result;
    expect(nightMoment(base)?.kind).toBe('cooling');
  });
  it('push-dj ≥ ride on reputation; promo > ride on bar revenue; bounded; reproducible; ride ≡ identity', () => {
    const ride = run('crowd-ride');
    expect(run('push-dj').reputationDelta).toBeGreaterThanOrEqual(ride.reputationDelta);
    expect(run('crowd-promo').barRevenue).toBeGreaterThan(ride.barRevenue);
    for (const r of [run('push-dj'), run('crowd-promo')]) {
      expect(Math.abs(r.net - ride.net)).toBeLessThan(Math.max(150, Math.abs(ride.net) * 0.3));
    }
    expect(run('push-dj')).toEqual(run('push-dj'));
    expect(ride).toEqual(resolveNight(club, config, SEED).result);
  });
});

describe('bar-pressure choices move the night deterministically, within bounds', () => {
  const staff = STARTING_ROSTER.map((m) => ({ ...m }));
  const club: ClubState = {
    name: 'T', day: 4, cash: 3000, reputation: 100, baseCapacity: 200,
    ownedUpgradeIds: [], staff, lastConfig: defaultDayConfig(staff),
  };
  const config: DayConfig = {
    ...defaultDayConfig(staff),
    staffOnDuty: ['bar-rosa'], // one bartender for a full room
    coverLevel: 'low',
    drinkLevel: 'low',
  };
  const SEED = 999;
  const run = (id: Parameters<typeof getChoice>[0]) => resolveNight(club, config, SEED, getChoice(id).intervention).result;

  it('the setup pressures the bar (so the beat fires)', () => {
    expect(nightMoment(resolveNight(club, config, SEED).result)?.kind).toBe('bar');
  });
  it('pull-bouncer lifts bar revenue (rep cost); happy-hour lowers it; bounded; reproducible; ride ≡ identity', () => {
    const ride = run('bar-ride');
    expect(run('pull-bouncer').barRevenue).toBeGreaterThan(ride.barRevenue);
    expect(run('pull-bouncer').reputationDelta).toBeLessThanOrEqual(ride.reputationDelta);
    expect(run('happy-hour').barRevenue).toBeLessThan(ride.barRevenue);
    for (const r of [run('pull-bouncer'), run('happy-hour')]) {
      expect(Math.abs(r.net - ride.net)).toBeLessThan(Math.max(300, Math.abs(ride.net) * 0.35));
    }
    expect(run('pull-bouncer')).toEqual(run('pull-bouncer'));
    expect(ride).toEqual(resolveNight(club, config, SEED).result);
  });
});
