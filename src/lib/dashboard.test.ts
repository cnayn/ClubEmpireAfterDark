/**
 * Tests for the pure Dashboard helpers (Floor View + Next Goal). Presentation
 * derivations only — no sim, no RNG, no state changes.
 */

import { defaultDayConfig, STARTING_ROSTER } from '@/domain/staff';
import type { ClubState, NightResult } from '@/domain/types';
import { buildFloorView, nextGoal } from './dashboard';

function club(over: Partial<ClubState> = {}): ClubState {
  const staff = STARTING_ROSTER.map((m) => ({ ...m }));
  return {
    name: 'T', day: 5, cash: 1500, reputation: 50, baseCapacity: 60,
    ownedUpgradeIds: [], staff, lastConfig: defaultDayConfig(staff), ...over,
  };
}
function result(over: Partial<NightResult> = {}): NightResult {
  return {
    day: 4, guests: 30, capacity: 60, revenue: 600, costs: 300, net: 300,
    coverRevenue: 200, barRevenue: 400, vipBonus: 0, wages: 340, theft: 0, fines: 0,
    incidents: 0, noShows: 0, eventId: 'regular', eventCost: 0, bookingFee: 0,
    reputationBefore: 50, reputationAfter: 50, reputationDelta: 0,
    vipSatisfaction: 60, regularLoyalty: 60, serviceRatio: 1, notes: [], ...over,
  };
}

describe('buildFloorView', () => {
  it('shows a quiet, growable room before any night is played (never empty/broken)', () => {
    const fv = buildFloorView(club(), null);
    expect(fv.hasPlayedNight).toBe(false);
    expect(fv.density).toBe('sparse');
    expect(fv.dots).toBeGreaterThan(0);
    expect(fv.lastGuests).toBeNull();
  });

  it('derives crowd density from the last night when present', () => {
    expect(buildFloorView(club(), result({ guests: 6, capacity: 60 })).density).toBe('sparse');
    expect(buildFloorView(club(), result({ guests: 30, capacity: 60 })).density).toBe('busy');
    expect(buildFloorView(club(), result({ guests: 58, capacity: 60 })).density).toBe('packed');
  });

  it('maps each event to a distinct vibe', () => {
    const vibe = (e: NightResult['eventId']) => {
      const c = club();
      c.lastConfig = { ...c.lastConfig, eventId: e };
      return buildFloorView(c, null).vibe;
    };
    const vibes = ['regular', 'private-party', 'student-night', 'grand-opening', 'industry-night'].map(
      (e) => vibe(e as NightResult['eventId'])
    );
    expect(new Set(vibes).size).toBe(5); // all distinct
  });

  it('shows only on-duty bartenders and bouncers, with initials', () => {
    const fv = buildFloorView(club(), null);
    expect(fv.bartenders.length).toBeGreaterThan(0);
    expect(fv.bouncers.length).toBeGreaterThan(0);
    expect(fv.bartenders[0].initials).toMatch(/^[A-Z]{1,2}$/);
  });

  it('shows empty posts when nobody is scheduled for that role', () => {
    const c = club();
    const bartenderId = c.staff.find((m) => m.role === 'bartender')!.id;
    c.lastConfig = { ...c.lastConfig, staffOnDuty: [bartenderId] }; // no bouncers on duty
    const fv = buildFloorView(c, null);
    expect(fv.bouncers).toHaveLength(0);
    expect(fv.bartenders).toHaveLength(1);
  });
});

describe('nextGoal — one primary goal by precedence', () => {
  it('recovery when cash can barely cover a night', () => {
    expect(nextGoal(club({ cash: 150 })).kind).toBe('recovery');
  });

  it('almost-affordable upgrade/hire when close but not quite', () => {
    // cheapest upgrade is $800; $600 is 75% of it → "almost"
    const g = nextGoal(club({ cash: 600, ownedUpgradeIds: [] }));
    expect(g.kind).toBe('almost');
    expect(g.title).toMatch(/Almost there/);
    expect(g.progress).toBeGreaterThan(0.5);
    expect(g.progress).toBeLessThan(1);
  });

  it('next reputation tier when cash is comfortable and nothing is almost-affordable', () => {
    const g = nextGoal(club({ cash: 5000, reputation: 50 })); // above all costs → not "almost"
    expect(g.kind).toBe('tier');
    expect(g.title).toContain('City Favorite');
    expect(g.title).toContain('/ 60');
  });

  it('general growth at the top tier with nothing left to reach', () => {
    const owned = ['bigger-floor', 'better-sound', 'extra-bar', 'pro-lighting', 'security-office', 'vip-lounge'];
    const g = nextGoal(club({ cash: 9000, reputation: 90, ownedUpgradeIds: owned }));
    expect(g.kind).toBe('growth');
  });
});
