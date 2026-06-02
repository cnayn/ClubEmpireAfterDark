/**
 * Tests for the pure night simulation. Proves the core invariant of the design:
 * decisions move outcomes in legible, intended directions — now expressed via a
 * named-staff roster (Phase 2A) rather than abstract bartender/security levers.
 */

import * as B from '@/domain/balance';
import { defaultDayConfig, minViableNightCost, STARTING_ROSTER } from '@/domain/staff';
import type { ClubState, DayConfig, StaffMember } from '@/domain/types';
import { UPGRADES } from '@/domain/upgrades';
import { resolveNight } from './night';

const ALL = STARTING_ROSTER.map((m) => m.id);
const BARTENDERS = STARTING_ROSTER.filter((m) => m.role === 'bartender').map((m) => m.id);

function makeClub(overrides: Partial<ClubState> = {}): ClubState {
  const staff = STARTING_ROSTER.map((m) => ({ ...m }));
  return {
    name: 'Test Club',
    day: 1,
    cash: 2000,
    reputation: 50,
    baseCapacity: 100,
    ownedUpgradeIds: [],
    staff,
    lastConfig: defaultDayConfig(staff),
    ...overrides,
  };
}

const baseConfig: DayConfig = {
  music: 'house',
  coverLevel: 'med',
  drinkLevel: 'med',
  staffOnDuty: ALL,
  eventId: 'regular',
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
    const cfg: DayConfig = { ...baseConfig, staffOnDuty: [BARTENDERS[0]], coverLevel: 'low', drinkLevel: 'low' };
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

  it('relaxed smoking draws a larger crowd than strict (the risk has a reward)', () => {
    const club = makeClub({ reputation: 60 });
    const strict = resolveNight(club, { ...baseConfig, smoking: 'strict' }, 11).result;
    const relaxed = resolveNight(club, { ...baseConfig, smoking: 'relaxed' }, 11).result;
    expect(relaxed.guests).toBeGreaterThan(strict.guests);
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
});

/**
 * Early-game balance guarantees (Phase 2A). Rewritten to the staff roster but
 * asserting the SAME outcomes locked in decision-log #0007 — the identity point.
 */
describe('early-game balance', () => {
  const nightSeed = (c: ClubState) => (c.day * 2654435761 + c.cash) >>> 0;

  const freshClub = (): ClubState => {
    const staff = STARTING_ROSTER.map((m) => ({ ...m }));
    return {
      name: 'Fresh',
      day: 1,
      cash: B.START_CASH,
      reputation: B.START_REPUTATION,
      baseCapacity: B.START_CAPACITY,
      ownedUpgradeIds: [],
      staff,
      lastConfig: defaultDayConfig(staff),
    };
  };

  const standardBouncer = (id: string): StaffMember => ({
    id,
    name: 'Hired Bouncer',
    role: 'bouncer',
    salary: B.STARTING_BOUNCER_SALARY,
    skill: B.BASELINE_SKILL,
    honesty: 100,
    reliability: 100,
    visibleTrait: 'none',
    hiddenTrait: 'none',
    description: 'A dependable second on the door.',
  });

  it('a sensible opening night turns a profit', () => {
    const club = freshClub();
    const { result } = resolveNight(club, defaultDayConfig(club.staff), nightSeed(club));
    expect(result.net).toBeGreaterThan(0);
  });

  it('even the leanest night is profitable at rock-bottom reputation (no dead-end)', () => {
    const club: ClubState = { ...freshClub(), reputation: 1 };
    club.cash = minViableNightCost(club.staff);
    const leanConfig: DayConfig = {
      music: 'pop',
      coverLevel: 'low',
      drinkLevel: 'med',
      staffOnDuty: [BARTENDERS[0]], // one bartender, no bouncers
      eventId: 'regular',
      vipFocus: false,
      smoking: 'strict',
    };
    const { result } = resolveNight(club, leanConfig, nightSeed(club));
    expect(result.net).toBeGreaterThan(0);
  });

  it('balanced play climbs into a higher reputation tier within 10 nights', () => {
    let club = freshClub();
    // Balanced play hires a second bouncer early (the new way to reach "level 2").
    club = { ...club, staff: [...club.staff, standardBouncer('bnc-hired')] };
    for (let n = 1; n <= 10; n++) {
      const cfg: DayConfig = {
        music: 'pop',
        coverLevel: 'med',
        drinkLevel: 'med',
        staffOnDuty: club.staff.map((m) => m.id),
        eventId: 'regular',
        vipFocus: club.reputation >= B.VIP_MIN_REPUTATION,
        smoking: 'strict',
      };
      club = resolveNight(club, cfg, nightSeed(club)).nextClub;
      for (const u of UPGRADES) {
        if (!club.ownedUpgradeIds.includes(u.id) && club.cash - u.cost >= minViableNightCost(club.staff)) {
          club = { ...club, cash: club.cash - u.cost, ownedUpgradeIds: [...club.ownedUpgradeIds, u.id] };
        }
      }
    }
    expect(club.reputation).toBeGreaterThanOrEqual(40);
    expect(B.reputationTier(club.reputation)).not.toBe('Local Spot');
  });

  it('balanced play never goes broke (cash stays positive across 10 nights)', () => {
    let club = freshClub();
    club = { ...club, staff: [...club.staff, standardBouncer('bnc-hired')] };
    for (let n = 1; n <= 10; n++) {
      const cfg: DayConfig = {
        music: 'pop',
        coverLevel: 'med',
        drinkLevel: 'med',
        staffOnDuty: club.staff.map((m) => m.id),
        eventId: 'regular',
        vipFocus: false,
        smoking: 'strict',
      };
      club = resolveNight(club, cfg, nightSeed(club)).nextClub;
      expect(club.cash).toBeGreaterThan(0);
    }
    expect(club.day).toBe(11);
  });

  it('Regular Night + starting roster is identity-neutral (eventId carried through)', () => {
    const club = freshClub();
    const { result } = resolveNight(club, defaultDayConfig(club.staff), 555);
    expect(result.eventId).toBe('regular');
    expect(result.theft).toBe(0);
    expect(result.noShows).toBe(0);
  });
});
