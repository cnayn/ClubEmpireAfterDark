/**
 * Venue / Furniture v1 — catalog validity, stat aggregation, equip rules,
 * bounded + neutral effects, deterministic in the resolver, save-safe.
 */

import { defaultDayConfig, STARTING_ROSTER } from '@/domain/staff';
import type { ClubState, DayConfig, VenueState } from '@/domain/types';
import { resolveNight } from '@/sim/night';
import {
  canEquip,
  FURNITURE,
  VENUE_ZONES,
  venueEffects,
  venueStats,
  ZONE_SLOTS,
} from './furniture';

function club(over: Partial<ClubState> = {}): ClubState {
  const staff = STARTING_ROSTER.map((m) => ({ ...m }));
  return {
    name: 'T', day: 4, cash: 5000, reputation: 80, baseCapacity: 120,
    ownedUpgradeIds: [], staff, lastConfig: defaultDayConfig(staff), ...over,
  };
}
const cfg = (): DayConfig => ({ ...defaultDayConfig(STARTING_ROSTER), coverLevel: 'low', drinkLevel: 'low' });

describe('catalog', () => {
  it('every item targets a real zone with at least one slot (never VIP/locked)', () => {
    for (const item of FURNITURE) {
      expect(VENUE_ZONES).toContain(item.zone);
      expect(ZONE_SLOTS[item.zone]).toBeGreaterThan(0);
    }
  });
});

describe('venueStats + equip rules', () => {
  it('empty venue is neutral (all zero)', () => {
    expect(venueStats(undefined)).toEqual({ style: 0, comfort: 0, sound: 0, hygiene: 0, doorAppeal: 0 });
  });

  it('aggregates equipped items correctly', () => {
    const venue: VenueState = { owned: ['neon-sign', 'velvet-rope'], equipped: { entrance: ['neon-sign', 'velvet-rope'] } };
    const s = venueStats(venue);
    expect(s.doorAppeal).toBe(3 + 4); // neon 3 + velvet 4
    expect(s.style).toBe(2 + 1);
  });

  it('cannot equip into the wrong zone, when unowned, or into a full zone', () => {
    const owned: VenueState = { owned: ['neon-sign'], equipped: {} };
    expect(canEquip(owned, 'neon-sign', 'bar')).toBe(false); // wrong zone
    expect(canEquip(owned, 'neon-sign', 'entrance')).toBe(true); // ok
    expect(canEquip({ owned: [], equipped: {} }, 'neon-sign', 'entrance')).toBe(false); // not owned
    const full: VenueState = { owned: ['neon-sign', 'velvet-rope'], equipped: { entrance: ['neon-sign', 'velvet-rope'] } };
    expect(canEquip(full, 'neon-sign', 'entrance')).toBe(false); // entrance full (2 slots) + already in
  });
});

describe('venueEffects — bounded + neutral', () => {
  it('zero stats is perfectly neutral', () => {
    expect(venueEffects({ style: 0, comfort: 0, sound: 0, hygiene: 0, doorAppeal: 0 })).toEqual({ drawMod: 1, vibeAdd: 0 });
  });
  it('is bounded even with absurd stats', () => {
    const e = venueEffects({ style: 999, comfort: 999, sound: 999, hygiene: 999, doorAppeal: 999 });
    expect(e.drawMod).toBeLessThanOrEqual(1.08);
    expect(e.vibeAdd).toBeLessThanOrEqual(8);
  });
});

describe('venue in resolveNight', () => {
  const equippedVenue: VenueState = {
    owned: ['neon-sign', 'velvet-rope', 'dance-lights', 'leather-couch'],
    equipped: { entrance: ['neon-sign', 'velvet-rope'], dancefloor: ['dance-lights', 'leather-couch'] },
  };

  it('an empty venue resolves identically to no venue at all', () => {
    const a = resolveNight(club(), cfg(), 4242).result;
    const b = resolveNight(club({ venue: { owned: [], equipped: {} } }), cfg(), 4242).result;
    expect(a).toEqual(b);
  });

  it('equipped furniture nudges the night up, bounded (same seed)', () => {
    const bare = resolveNight(club(), cfg(), 7).result;
    const dressed = resolveNight(club({ venue: equippedVenue }), cfg(), 7).result;
    expect(dressed.guests).toBeGreaterThanOrEqual(bare.guests);
    expect(dressed.reputationAfter).toBeGreaterThanOrEqual(bare.reputationAfter);
    expect(dressed.guests).toBeLessThan(bare.guests + bare.capacity * 0.12); // bounded
  });

  it('same seed + same venue = same result', () => {
    const c = club({ venue: equippedVenue });
    expect(resolveNight(c, cfg(), 5).result).toEqual(resolveNight(c, cfg(), 5).result);
  });

  it('old saves without venue still resolve', () => {
    expect(() => resolveNight(club(), cfg(), 1)).not.toThrow();
  });
});
