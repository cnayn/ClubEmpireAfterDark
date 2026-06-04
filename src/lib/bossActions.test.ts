/**
 * Night Boss Actions v1 — deterministic, bounded, identity-when-unused, and
 * applied through the existing single-Intervention surface (no resolver change).
 */

import { defaultDayConfig, STARTING_ROSTER } from '@/domain/staff';
import type { ClubState, DayConfig, StaffMember } from '@/domain/types';
import { resolveNight } from '@/sim/night';
import { bossIntervention, combineInterventions, resolveBossAction } from './bossActions';

const BARTENDERS = STARTING_ROSTER.filter((m) => m.role === 'bartender').map((m) => m.id);

function club(over: Partial<ClubState> = {}): ClubState {
  const staff = STARTING_ROSTER.map((m) => ({ ...m }));
  return {
    name: 'T', day: 4, cash: 2000, reputation: 60, baseCapacity: 120,
    ownedUpgradeIds: [], staff, lastConfig: defaultDayConfig(staff), ...over,
  };
}
const cfg = (over: Partial<DayConfig> = {}): DayConfig => ({ ...defaultDayConfig(STARTING_ROSTER), ...over });
const preview = (c: ClubState, config: DayConfig, seed: number) => resolveNight(c, config, seed).result;

describe('combineInterventions', () => {
  it('empty set is the identity (no-op) modifier', () => {
    expect(combineInterventions([])).toEqual({ vibeBonus: 0, revenueMod: 1 });
  });

  it('cannot be spammed past the bounds', () => {
    const manyPush = Array.from({ length: 10 }, () => ({ vibeBonus: 18, revenueMod: 0.99 }));
    const r = combineInterventions(manyPush);
    expect(r.vibeBonus).toBeLessThanOrEqual(30);
    expect(r.revenueMod).toBeGreaterThanOrEqual(0.9);
    const manyBoost = Array.from({ length: 10 }, () => ({ vibeBonus: 0, revenueMod: 1.06 }));
    expect(combineInterventions(manyBoost).revenueMod).toBeLessThanOrEqual(1.2);
  });
});

describe('taking no actions preserves existing behavior', () => {
  it('resolveNight with the empty boss intervention equals a plain night', () => {
    const c = club();
    const config = cfg();
    const plain = resolveNight(c, config, 4242).result;
    const withNone = resolveNight(c, config, 4242, bossIntervention([], preview(c, config, 4242), c)).result;
    expect(withNone).toEqual(plain);
  });
});

describe('Push the DJ — bounded lift, not a trap', () => {
  it('improves reputation on a cooling-ish night with only a small bar cost', () => {
    const c = club({ reputation: 35 });
    const config = cfg({ coverLevel: 'high', drinkLevel: 'high' }); // thinner crowd → cooler room
    const pv = preview(c, config, 9);
    const iv = bossIntervention(['push-dj'], pv, c);
    const base = resolveNight(c, config, 9).result;
    const pushed = resolveNight(c, config, 9, iv).result;
    expect(pushed.reputationAfter).toBeGreaterThanOrEqual(base.reputationAfter);
    expect(Math.abs(pushed.net - base.net)).toBeLessThan(Math.max(120, Math.abs(base.net) * 0.15));
  });
});

describe('Check the Bar — helps only a strained bar', () => {
  const strainedClub = club({ reputation: 100, baseCapacity: 200 });
  const strainedCfg = cfg({ staffOnDuty: [BARTENDERS[0]], coverLevel: 'low', drinkLevel: 'low' }); // 1 bartender, packed
  it('boosts revenue when the bar is strained', () => {
    const pv = preview(strainedClub, strainedCfg, 3);
    expect(pv.serviceRatio).toBeLessThan(0.85);
    expect(resolveBossAction('check-bar', pv, strainedClub).intervention.revenueMod).toBeGreaterThan(1);
  });
  it('is a no-op when the bar is holding', () => {
    const c = club({ baseCapacity: 60, reputation: 40 }); // small house, full crew → bar keeps up
    const config = cfg({ coverLevel: 'high', drinkLevel: 'high' }); // thinner crowd
    const pv = preview(c, config, 3);
    expect(pv.serviceRatio).toBeGreaterThanOrEqual(0.85);
    expect(resolveBossAction('check-bar', pv, c).intervention).toEqual({ vibeBonus: 0, revenueMod: 1 });
  });
});

describe('Send a Bouncer — helps under door pressure', () => {
  it('lifts the room when there is risk, no-op when calm', () => {
    const busy = club({ reputation: 100, baseCapacity: 200 });
    const busyCfg = cfg({ coverLevel: 'low', drinkLevel: 'low' }); // packed → fill high
    const busyPv = preview(busy, busyCfg, 2);
    expect(resolveBossAction('send-bouncer', busyPv, busy).intervention.vibeBonus).toBeGreaterThan(0);

    const calm = club({ reputation: 10 });
    const calmCfg = cfg({ coverLevel: 'high', drinkLevel: 'high' }); // thin crowd
    const calmPv = preview(calm, calmCfg, 2);
    expect(resolveBossAction('send-bouncer', calmPv, calm).intervention.vibeBonus).toBe(0);
  });

  it('flavor reflects John vs Caramel on a risky night', () => {
    const bouncer = (id: string): StaffMember => ({
      id, name: id, role: 'bouncer', salary: 100, skill: 50,
      honesty: 100, reliability: 100, visibleTrait: 'none', hiddenTrait: 'none', description: '',
    });
    const busyCfg = cfg({ coverLevel: 'low', drinkLevel: 'low' });
    const withJohn = club({ reputation: 100, baseCapacity: 200, staff: [...STARTING_ROSTER.map((m) => ({ ...m })), bouncer('bnc-john')] });
    withJohn.lastConfig = { ...busyCfg, staffOnDuty: withJohn.staff.map((m) => m.id) };
    const pvJohn = preview(withJohn, withJohn.lastConfig, 2);
    expect(resolveBossAction('send-bouncer', pvJohn, withJohn).note).toMatch(/John/);

    const withCaramel = club({ reputation: 100, baseCapacity: 200, staff: [...STARTING_ROSTER.map((m) => ({ ...m })), bouncer('bnc-kareem')] });
    withCaramel.lastConfig = { ...busyCfg, staffOnDuty: withCaramel.staff.map((m) => m.id) };
    const pvCar = preview(withCaramel, withCaramel.lastConfig, 2);
    expect(resolveBossAction('send-bouncer', pvCar, withCaramel).note).toMatch(/Caramel/);
  });
});

describe('determinism', () => {
  it('same seed + same actions = same result', () => {
    const c = club({ reputation: 50 });
    const config = cfg();
    const ids = ['push-dj', 'work-room', 'send-bouncer'] as const;
    const pv = preview(c, config, 7);
    const iv = bossIntervention([...ids], pv, c);
    expect(resolveNight(c, config, 7, iv).result).toEqual(resolveNight(c, config, 7, iv).result);
  });
});
