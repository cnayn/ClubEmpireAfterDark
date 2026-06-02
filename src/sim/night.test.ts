/**
 * Tests for the pure night simulation. These prove the core invariant of the
 * design: decisions move outcomes in legible, intended directions.
 */

import * as B from '@/domain/balance';
import type { ClubState, DayConfig } from '@/domain/types';
import { UPGRADES } from '@/domain/upgrades';
import { resolveNight } from './night';

function makeClub(overrides: Partial<ClubState> = {}): ClubState {
  return {
    name: 'Test Club',
    day: 1,
    cash: 2000,
    reputation: 50,
    baseCapacity: 100,
    ownedUpgradeIds: [],
    lastConfig: { ...B.DEFAULT_DAY_CONFIG },
    ...overrides,
  };
}

const baseConfig: DayConfig = {
  music: 'house',
  coverLevel: 'med',
  drinkLevel: 'med',
  bartenders: 3,
  securityLevel: 2,
  vipFocus: false,
  smoking: 'strict',
};

describe('resolveNight', () => {
  it('is deterministic for the same seed', () => {
    const club = makeClub();
    const a = resolveNight(club, baseConfig, 12345);
    const b = resolveNight(club, baseConfig, 12345);
    expect(a.result).toEqual(b.result);
  });

  it('never exceeds capacity', () => {
    const club = makeClub({ reputation: 100, baseCapacity: 80 });
    const cfg: DayConfig = { ...baseConfig, coverLevel: 'low', drinkLevel: 'low' };
    for (let seed = 0; seed < 50; seed++) {
      const { result } = resolveNight(club, cfg, seed);
      expect(result.guests).toBeLessThanOrEqual(80);
      expect(result.guests).toBeGreaterThanOrEqual(0);
    }
  });

  it('higher prices reduce attendance', () => {
    const club = makeClub();
    const cheap = resolveNight(club, { ...baseConfig, coverLevel: 'low', drinkLevel: 'low' }, 7).result;
    const pricey = resolveNight(club, { ...baseConfig, coverLevel: 'high', drinkLevel: 'high' }, 7).result;
    expect(pricey.guests).toBeLessThan(cheap.guests);
  });

  it('understaffing the bar caps service ratio below 1', () => {
    const club = makeClub({ reputation: 100, baseCapacity: 200 });
    const cfg: DayConfig = { ...baseConfig, bartenders: 1, coverLevel: 'low', drinkLevel: 'low' };
    const { result } = resolveNight(club, cfg, 3);
    expect(result.serviceRatio).toBeLessThan(1);
  });

  it('higher reputation draws more guests', () => {
    const low = resolveNight(makeClub({ reputation: 20 }), baseConfig, 9).result;
    const high = resolveNight(makeClub({ reputation: 90 }), baseConfig, 9).result;
    expect(high.guests).toBeGreaterThan(low.guests);
  });

  it('relaxed smoking policy raises incident/compliance risk over many nights', () => {
    const club = makeClub({ reputation: 80 });
    let strictFines = 0;
    let relaxedFines = 0;
    for (let seed = 0; seed < 200; seed++) {
      strictFines += resolveNight(club, { ...baseConfig, smoking: 'strict' }, seed).result.fines;
      relaxedFines += resolveNight(club, { ...baseConfig, smoking: 'relaxed' }, seed).result.fines;
    }
    expect(relaxedFines).toBeGreaterThan(strictFines);
  });

  it('advances the day and applies net to cash', () => {
    const club = makeClub({ cash: 1000 });
    const { result, nextClub } = resolveNight(club, baseConfig, 42);
    expect(nextClub.day).toBe(club.day + 1);
    expect(nextClub.cash).toBe(club.cash + result.net);
    expect(nextClub.reputation).toBe(result.reputationAfter);
  });

  it('VIP focus only pays out once reputation clears the threshold', () => {
    const lowRep = resolveNight(makeClub({ reputation: 20 }), { ...baseConfig, vipFocus: true }, 5).result;
    const highRep = resolveNight(makeClub({ reputation: 80 }), { ...baseConfig, vipFocus: true }, 5).result;
    expect(lowRep.vipBonus).toBe(0);
    expect(highRep.vipBonus).toBeGreaterThan(0);
  });

  it('relaxed smoking draws a larger crowd than strict (the risk has a reward)', () => {
    const club = makeClub({ reputation: 60 });
    const strict = resolveNight(club, { ...baseConfig, smoking: 'strict' }, 11).result;
    const relaxed = resolveNight(club, { ...baseConfig, smoking: 'relaxed' }, 11).result;
    expect(relaxed.guests).toBeGreaterThan(strict.guests);
  });
});

/**
 * Balance guarantees for the early game. These lock in the tuning pass: the
 * first nights must be fun, fair, and free of dead-ends. See docs/economy.md.
 */
describe('early-game balance', () => {
  // Mirror of store.nightSeed so simulated play matches real play.
  const nightSeed = (c: ClubState) => (c.day * 2654435761 + c.cash) >>> 0;

  const freshClub = (): ClubState => ({
    name: 'Fresh',
    day: 1,
    cash: B.START_CASH,
    reputation: B.START_REPUTATION,
    baseCapacity: B.START_CAPACITY,
    ownedUpgradeIds: [],
    lastConfig: { ...B.DEFAULT_DAY_CONFIG },
  });

  it('a sensible opening night turns a profit', () => {
    const club = freshClub();
    const { result } = resolveNight(club, B.DEFAULT_DAY_CONFIG, nightSeed(club));
    expect(result.net).toBeGreaterThan(0);
  });

  it('even the leanest night is profitable at rock-bottom reputation (no economic dead-end)', () => {
    const broke: ClubState = { ...freshClub(), reputation: 1, cash: B.MIN_NIGHT_COST };
    const leanConfig: DayConfig = {
      music: 'pop',
      coverLevel: 'low',
      drinkLevel: 'med',
      bartenders: 1,
      securityLevel: 1,
      vipFocus: false,
      smoking: 'strict',
    };
    const { result } = resolveNight(broke, leanConfig, nightSeed(broke));
    expect(result.net).toBeGreaterThan(0);
  });

  it('balanced play climbs into a higher reputation tier within 10 nights', () => {
    let club = freshClub();
    for (let n = 1; n <= 10; n++) {
      const cfg: DayConfig = {
        music: 'pop',
        coverLevel: 'med',
        drinkLevel: 'med',
        bartenders: 2,
        securityLevel: 2,
        vipFocus: club.reputation >= B.VIP_MIN_REPUTATION,
        smoking: 'strict',
      };
      club = resolveNight(club, cfg, nightSeed(club)).nextClub;
      // greedy upgrades, respecting the shop's safety reserve
      for (const u of UPGRADES) {
        if (!club.ownedUpgradeIds.includes(u.id) && club.cash - u.cost >= B.MIN_NIGHT_COST) {
          club = { ...club, cash: club.cash - u.cost, ownedUpgradeIds: [...club.ownedUpgradeIds, u.id] };
        }
      }
    }
    expect(club.reputation).toBeGreaterThanOrEqual(40);
    expect(B.reputationTier(club.reputation)).not.toBe('Local Spot');
  });

  it('balanced play never goes broke (cash stays above a minimum night)', () => {
    let club = freshClub();
    for (let n = 1; n <= 10; n++) {
      const cfg: DayConfig = {
        music: 'pop',
        coverLevel: 'med',
        drinkLevel: 'med',
        bartenders: 2,
        securityLevel: 2,
        vipFocus: false,
        smoking: 'strict',
      };
      // Only open if affordable (mirrors the bankruptcy guard).
      if (club.cash < B.nightFixedCosts(cfg)) break;
      club = resolveNight(club, cfg, nightSeed(club)).nextClub;
      expect(club.cash).toBeGreaterThan(0);
    }
    expect(club.day).toBe(11); // completed all 10 nights without being blocked
  });
});
