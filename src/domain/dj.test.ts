/**
 * DJ Booking v1 — pure, bounded, neutral-by-default. Proves House (and absent) is
 * identity-preserving and that Local/Hype shift the night in the intended,
 * bounded directions.
 */

import { defaultDayConfig, STARTING_ROSTER } from '@/domain/staff';
import type { ClubState, DayConfig } from '@/domain/types';
import { resolveNight } from '@/sim/night';
import { DEFAULT_DJ, djCost, djEffects, djPushBonus } from './dj';

const ALL = STARTING_ROSTER.map((m) => m.id);

function makeClub(over: Partial<ClubState> = {}): ClubState {
  const staff = STARTING_ROSTER.map((m) => ({ ...m }));
  return {
    name: 'T', day: 1, cash: 2000, reputation: 50, baseCapacity: 100,
    ownedUpgradeIds: [], staff, lastConfig: defaultDayConfig(staff), ...over,
  };
}
const cfg = (over: Partial<DayConfig> = {}): DayConfig => ({
  music: 'house', coverLevel: 'med', drinkLevel: 'med', staffOnDuty: ALL,
  eventId: 'regular', vipFocus: false, smoking: 'strict', ...over,
});

describe('djEffects / djCost', () => {
  it('House is the neutral default (no fee, no effect)', () => {
    expect(DEFAULT_DJ).toBe('house');
    expect(djCost('house')).toBe(0);
    expect(djCost(undefined)).toBe(0);
    expect(djEffects('house')).toEqual({ drawMod: 1, barRevenueMod: 1, vibeAdd: 0, riskAdd: 0 });
    expect(djEffects(undefined)).toEqual(djEffects('house'));
  });

  it('Local and Hype cost money and lift the night, bounded', () => {
    expect(djCost('local')).toBeGreaterThan(0);
    expect(djCost('hype')).toBeGreaterThan(djCost('local'));
    for (const id of ['local', 'hype'] as const) {
      const e = djEffects(id);
      expect(e.drawMod).toBeGreaterThanOrEqual(1);
      expect(e.drawMod).toBeLessThanOrEqual(1.1); // gentle, never overpowering
      expect(e.vibeAdd).toBeGreaterThan(0);
      expect(e.vibeAdd).toBeLessThanOrEqual(8);
      expect(e.riskAdd).toBeGreaterThanOrEqual(0);
      expect(e.riskAdd).toBeLessThanOrEqual(0.05);
    }
  });

  it('Push-DJ bonus scales with the booking (house has nothing to push)', () => {
    expect(djPushBonus('house')).toBe(0);
    expect(djPushBonus(undefined)).toBe(0);
    expect(djPushBonus('local')).toBeGreaterThan(0);
    expect(djPushBonus('hype')).toBeGreaterThan(djPushBonus('local'));
  });
});

describe('DJ in the resolver', () => {
  it('an absent dj field resolves byte-identically to House (identity preservation)', () => {
    const club = makeClub();
    const absent = resolveNight(club, cfg(), 4242).result;
    const house = resolveNight(club, cfg({ dj: 'house' }), 4242).result;
    expect(absent).toEqual(house);
  });

  it('Hype costs an upfront fee and lifts reputation vs House on the same seed', () => {
    const club = makeClub();
    const house = resolveNight(club, cfg({ dj: 'house' }), 9001).result;
    const hype = resolveNight(club, cfg({ dj: 'hype' }), 9001).result;
    expect(hype.costs).toBeGreaterThan(house.costs); // fee is in the books
    expect(hype.reputationDelta).toBeGreaterThanOrEqual(house.reputationDelta); // vibe lift
  });
});
