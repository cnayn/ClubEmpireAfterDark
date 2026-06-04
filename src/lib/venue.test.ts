/** Zone pressure derivation — pure reads of a NightResult. */
import type { NightResult } from '@/domain/types';
import { nightZones } from './venue';

function result(over: Partial<NightResult> = {}): NightResult {
  return {
    day: 4, guests: 40, capacity: 60, revenue: 800, costs: 500, net: 300,
    coverRevenue: 200, barRevenue: 560, vipBonus: 0, wages: 340, theft: 0, fines: 0,
    incidents: 0, noShows: 0, eventId: 'regular', eventCost: 0, bookingFee: 0,
    reputationBefore: 50, reputationAfter: 50, reputationDelta: 0,
    vipSatisfaction: 60, regularLoyalty: 60, serviceRatio: 1, notes: [], ...over,
  };
}

describe('nightZones', () => {
  it('flags a strained bar', () => {
    expect(nightZones(result({ serviceRatio: 0.6 })).bar).toBe('warn');
  });
  it('flags a troubled door on incidents', () => {
    expect(nightZones(result({ incidents: 2 })).door).toBe('warn');
  });
  it('flags a cooling floor on low loyalty', () => {
    expect(nightZones(result({ regularLoyalty: 40 })).floor).toBe('warn');
  });
  it('an empty house is calm everywhere', () => {
    const z = nightZones(result({ guests: 0, serviceRatio: 1 }));
    expect(z).toEqual({ door: 'calm', bar: 'calm', floor: 'calm' });
  });
  it('a healthy full house reads busy, not warning', () => {
    const z = nightZones(result({ guests: 58, capacity: 60, serviceRatio: 1, incidents: 0, regularLoyalty: 70 }));
    expect(z.door).toBe('busy');
    expect(z.bar).toBe('busy');
    expect(z.floor).toBe('busy');
  });
});
