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
  it('every item lists ≥1 compatible zone, all real and with slots (never VIP/locked)', () => {
    for (const item of FURNITURE) {
      expect(item.zones.length).toBeGreaterThan(0);
      for (const z of item.zones) {
        expect(VENUE_ZONES).toContain(z);
        expect(ZONE_SLOTS[z]).toBeGreaterThan(0);
      }
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
    expect(s.doorAppeal).toBe(1 + 2); // neon 1 + velvet 2
    expect(s.style).toBe(2 + 1); // neon 2 + velvet 1
  });

  it('respects multi-zone compatibility, ownership, and full zones', () => {
    // neon-sign is compatible with entrance OR dancefloor
    const owned: VenueState = { owned: ['neon-sign'], equipped: {} };
    expect(canEquip(owned, 'neon-sign', 'bar')).toBe(false); // not a compatible zone
    expect(canEquip(owned, 'neon-sign', 'entrance')).toBe(true);
    expect(canEquip(owned, 'neon-sign', 'dancefloor')).toBe(true); // second compatible zone
    expect(canEquip({ owned: [], equipped: {} }, 'neon-sign', 'entrance')).toBe(false); // not owned
    const full: VenueState = { owned: ['velvet-rope', 'leather-couch', 'neon-sign'], equipped: { entrance: ['velvet-rope', 'leather-couch'] } };
    expect(canEquip(full, 'neon-sign', 'entrance')).toBe(false); // entrance full (2 slots)
    expect(canEquip(full, 'neon-sign', 'dancefloor')).toBe(true); // but its other zone is free
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
    owned: ['neon-sign', 'velvet-rope', 'dance-lights', 'poster-wall'],
    equipped: { entrance: ['neon-sign', 'velvet-rope'], dancefloor: ['dance-lights', 'poster-wall'] },
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
