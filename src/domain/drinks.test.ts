/**
 * Drink Prep v1 — bounded, neutral-at-default, deterministic, save-safe.
 */

import { defaultDayConfig, STARTING_ROSTER } from '@/domain/staff';
import type { ClubState, DayConfig, DrinkPrep } from '@/domain/types';
import { resolveNight } from '@/sim/night';
import { DEFAULT_DRINK_PREP, drinkPrepEffects, stockCost } from './drinks';

function club(over: Partial<ClubState> = {}): ClubState {
  const staff = STARTING_ROSTER.map((m) => ({ ...m }));
  return {
    name: 'T', day: 4, cash: 4000, reputation: 100, baseCapacity: 200,
    ownedUpgradeIds: [], staff, lastConfig: defaultDayConfig(staff), ...over,
  };
}
const packed = (): DayConfig => ({ ...defaultDayConfig(STARTING_ROSTER), coverLevel: 'low', drinkLevel: 'low' });
const withPrep = (p: Partial<DrinkPrep>): DayConfig => ({ ...packed(), drinkPrep: { ...DEFAULT_DRINK_PREP, ...p } });

describe('stockCost + drinkPrepEffects', () => {
  it('default / standard / absent is neutral and free', () => {
    expect(stockCost(undefined, 200)).toBe(0);
    expect(stockCost(DEFAULT_DRINK_PREP, 200)).toBe(0);
    expect(stockCost({ stock: 'lean', quality: 'house' }, 200)).toBe(0);
    expect(drinkPrepEffects(undefined, 0.9)).toEqual({ barRevenueMod: 1, vibeAdd: 0 });
    expect(drinkPrepEffects(DEFAULT_DRINK_PREP, 0.9)).toEqual({ barRevenueMod: 1, vibeAdd: 0 });
  });

  it('only heavy stock costs money (capacity-scaled, bounded)', () => {
    const heavy = stockCost({ stock: 'heavy', quality: 'house' }, 200);
    expect(heavy).toBeGreaterThan(0);
    expect(heavy).toBeLessThan(200 * 4); // bounded
  });

  it('lean strains a packed bar; heavy steadies it; quality trades margin for vibe', () => {
    expect(drinkPrepEffects({ stock: 'lean', quality: 'house' }, 0.9).barRevenueMod).toBeLessThan(1);
    expect(drinkPrepEffects({ stock: 'lean', quality: 'house' }, 0.2).barRevenueMod).toBe(1); // calm night unaffected
    expect(drinkPrepEffects({ stock: 'heavy', quality: 'house' }, 0.9).barRevenueMod).toBeGreaterThan(1);
    expect(drinkPrepEffects({ stock: 'standard', quality: 'cheap' }, 0.5).barRevenueMod).toBeGreaterThan(1);
    expect(drinkPrepEffects({ stock: 'standard', quality: 'cheap' }, 0.5).vibeAdd).toBeLessThan(0);
    expect(drinkPrepEffects({ stock: 'standard', quality: 'premium' }, 0.5).barRevenueMod).toBeLessThan(1);
    expect(drinkPrepEffects({ stock: 'standard', quality: 'premium' }, 0.5).vibeAdd).toBeGreaterThan(0);
  });
});

describe('drink prep in resolveNight', () => {
  it('default prep reproduces a no-prep night exactly (identity)', () => {
    const c = club();
    const noPrep: DayConfig = { ...packed() };
    delete (noPrep as { drinkPrep?: unknown }).drinkPrep;
    const std = withPrep({}); // standard + house
    expect(resolveNight(c, std, 4242).result).toEqual(resolveNight(c, noPrep, 4242).result);
  });

  it('lean costs nothing upfront but earns less on a packed night than heavy', () => {
    const c = club();
    const lean = resolveNight(c, withPrep({ stock: 'lean' }), 7).result;
    const heavy = resolveNight(c, withPrep({ stock: 'heavy' }), 7).result;
    expect(lean.barRevenue).toBeLessThan(heavy.barRevenue);
    // heavy paid an upfront stock cost that lean did not
    expect(heavy.costs).toBeGreaterThan(lean.costs);
  });

  it('cheap improves bar revenue but dents reputation vs premium (same seed)', () => {
    const c = club({ reputation: 60, baseCapacity: 80 });
    const cheap = resolveNight(c, withPrep({ quality: 'cheap' }), 11).result;
    const premium = resolveNight(c, withPrep({ quality: 'premium' }), 11).result;
    expect(cheap.barRevenue).toBeGreaterThan(premium.barRevenue);
    expect(premium.reputationAfter).toBeGreaterThanOrEqual(cheap.reputationAfter);
  });

  it('same seed + same prep = same result', () => {
    const c = club();
    const cfg = withPrep({ stock: 'heavy', quality: 'premium' });
    expect(resolveNight(c, cfg, 5).result).toEqual(resolveNight(c, cfg, 5).result);
  });

  it('old configs without drinkPrep still resolve (no soft-lock, lean/standard free)', () => {
    const c = club();
    const legacy: DayConfig = { ...packed() };
    delete (legacy as { drinkPrep?: unknown }).drinkPrep;
    expect(() => resolveNight(c, legacy, 1)).not.toThrow();
    expect(stockCost(legacy.drinkPrep, 200)).toBe(0); // free → always openable
  });
});
