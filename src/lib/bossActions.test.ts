/**
 * Night Boss Actions v1 — deterministic, bounded, identity-when-unused, and
 * applied through the existing single-Intervention surface (no resolver change).
 */

import { defaultDayConfig, STARTING_ROSTER } from '@/domain/staff';
import type { ClubState, DayConfig, StaffMember } from '@/domain/types';
import { resolveNight } from '@/sim/night';
import {
  bossIntervention,
  combineInterventions,
  diminishFactor,
  focusCost,
  NIGHT_FOCUS,
  resolveBossAction,
} from './bossActions';

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

describe('Owner Attention (Boss Focus)', () => {
  it('gives a bounded per-night command budget', () => {
    expect(NIGHT_FOCUS).toBeGreaterThan(0);
    expect(NIGHT_FOCUS).toBeLessThanOrEqual(10); // not infinite
  });

  it('every action costs at least one Focus (no free spam)', () => {
    for (const a of ['push-dj', 'check-bar', 'send-bouncer', 'work-room'] as const) {
      expect(focusCost(a)).toBeGreaterThanOrEqual(1);
    }
  });

  it('repeated calls stay bounded by the intervention clamp (diminishing returns)', () => {
    const fivePushes = Array.from({ length: 5 }, () => ({ vibeBonus: 24, revenueMod: 1 }));
    const r = combineInterventions(fivePushes);
    expect(r.vibeBonus).toBeLessThanOrEqual(30); // stacking can't run away
  });
});

describe('diminishing returns on repeated SAME-id calls', () => {
  it('diminishFactor falls off across repeats', () => {
    expect(diminishFactor(0)).toBe(1);
    expect(diminishFactor(1)).toBeLessThan(diminishFactor(0));
    expect(diminishFactor(2)).toBeLessThan(diminishFactor(1));
    expect(diminishFactor(99)).toBeLessThan(diminishFactor(2));
    for (let i = 0; i < 10; i++) {
      expect(diminishFactor(i)).toBeGreaterThanOrEqual(0);
      expect(diminishFactor(i)).toBeLessThanOrEqual(1);
    }
  });

  it('bossIntervention applies smaller pull on each repeat of the same action', () => {
    const c = club({ reputation: 35 });
    const config = cfg({ coverLevel: 'high', drinkLevel: 'high' });
    const pv = preview(c, config, 9);
    const one = bossIntervention(['push-dj'], pv, c);
    const four = bossIntervention(['push-dj', 'push-dj', 'push-dj', 'push-dj'], pv, c);
    // Four repeats cannot be four times stronger — the diminish + clamp bound it.
    expect(four.vibeBonus).toBeLessThan(one.vibeBonus * 2.5);
  });

  it('different-id calls do NOT diminish each other (a second push-dj diminishes; check-bar does not)', () => {
    const c = club();
    const config = cfg();
    const pv = preview(c, config, 9);
    const justOnePush = bossIntervention(['push-dj'], pv, c);
    const pushThenCheck = bossIntervention(['push-dj', 'check-bar'], pv, c);
    const pushThenPush = bossIntervention(['push-dj', 'push-dj'], pv, c);
    // Adding a DIFFERENT-id action adds its full first-call effect on top.
    expect(pushThenCheck.vibeBonus).toBeGreaterThan(justOnePush.vibeBonus);
    // A SECOND push-dj is diminished, so the 2nd-call lift is smaller than the 1st.
    const firstLift = justOnePush.vibeBonus;
    const secondLift = pushThenPush.vibeBonus - firstLift;
    expect(secondLift).toBeLessThan(firstLift);
  });

  it('empty sequence is still the identity', () => {
    const c = club();
    const config = cfg();
    const pv = preview(c, config, 9);
    expect(bossIntervention([], pv, c)).toEqual({ vibeBonus: 0, revenueMod: 1 });
  });
});

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

describe('Check the Bar — always does something, biggest when strained', () => {
  const strainedClub = club({ reputation: 100, baseCapacity: 200 });
  const strainedCfg = cfg({ staffOnDuty: [BARTENDERS[0]], coverLevel: 'low', drinkLevel: 'low' }); // 1 bartender, packed
  it('boosts revenue most when the bar is strained', () => {
    const pv = preview(strainedClub, strainedCfg, 3);
    expect(pv.serviceRatio).toBeLessThan(0.85);
    expect(resolveBossAction('check-bar', pv, strainedClub).intervention.revenueMod).toBeGreaterThanOrEqual(1.1);
  });
  it('still gives a small, bounded lift when the bar is holding (never a dead no-op)', () => {
    const c = club({ baseCapacity: 60, reputation: 40 }); // small house, full crew → bar keeps up
    const config = cfg({ coverLevel: 'high', drinkLevel: 'high' }); // thinner crowd
    const pv = preview(c, config, 3);
    expect(pv.serviceRatio).toBeGreaterThanOrEqual(0.85);
    const iv = resolveBossAction('check-bar', pv, c).intervention;
    expect(iv.revenueMod).toBeGreaterThan(1);
    expect(iv.revenueMod).toBeLessThanOrEqual(1.05); // smaller than the strained boost
  });
});

describe('Send a Bouncer — always sharpens the door, scales under pressure', () => {
  it('lifts the room more under risk than on a calm door (but a calm door still benefits)', () => {
    const busy = club({ reputation: 100, baseCapacity: 200 });
    const busyCfg = cfg({ coverLevel: 'low', drinkLevel: 'low' }); // packed → fill high
    const busyPv = preview(busy, busyCfg, 2);
    const risk = resolveBossAction('send-bouncer', busyPv, busy).intervention.vibeBonus;

    const calm = club({ reputation: 10 });
    const calmCfg = cfg({ coverLevel: 'high', drinkLevel: 'high' }); // thin crowd
    const calmPv = preview(calm, calmCfg, 2);
    const calmVibe = resolveBossAction('send-bouncer', calmPv, calm).intervention.vibeBonus;

    expect(calmVibe).toBeGreaterThan(0); // never a dead no-op
    expect(risk).toBeGreaterThan(calmVibe); // but risk matters more
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

describe('Boss Actions v2 — stronger, clearer feedback', () => {
  const bouncer = (id: string, skill: number): StaffMember => ({
    id, name: id, role: 'bouncer', salary: 100, skill,
    honesty: 100, reliability: 100, visibleTrait: 'none', hiddenTrait: 'none', description: '',
  });

  it('check-bar gives a stronger bounded boost when the bar is overloaded', () => {
    const strainedClub = club({ reputation: 100, baseCapacity: 200 });
    const strainedCfg = cfg({ staffOnDuty: [BARTENDERS[0]], coverLevel: 'low', drinkLevel: 'low' });
    const pv = preview(strainedClub, strainedCfg, 3);
    expect(pv.serviceRatio).toBeLessThan(0.85);
    const out = resolveBossAction('check-bar', pv, strainedClub);
    expect(out.intervention.revenueMod).toBeGreaterThanOrEqual(1.1);
    expect(out.intervention.vibeBonus).toBeGreaterThan(0);
    expect(out.note.toLowerCase()).toContain('overloaded');
  });

  it('work-room lands harder with a culture crowd or an unstable room, never prints money', () => {
    const calm = club({ reputation: 70 });
    const calmCfg = cfg();
    const calmPv = preview(calm, calmCfg, 5);
    const baseline = resolveBossAction('work-room', calmPv, calm);
    expect(baseline.intervention.revenueMod).toBe(1); // never money

    const unstable = club({ reputation: 20 }); // low name → unstable
    const out = resolveBossAction('work-room', preview(unstable, cfg(), 5), unstable);
    expect(out.intervention.vibeBonus).toBeGreaterThan(baseline.intervention.vibeBonus);
    expect(out.intervention.revenueMod).toBe(1);
  });

  it('send-bouncer: Caramel de-escalates more effectively than John on a risky night', () => {
    const busyCfg = cfg({ coverLevel: 'low', drinkLevel: 'low' });
    const withJohn = club({ reputation: 100, baseCapacity: 200, staff: [...STARTING_ROSTER.map((m) => ({ ...m })), bouncer('bnc-john', 50)] });
    withJohn.lastConfig = { ...busyCfg, staffOnDuty: withJohn.staff.map((m) => m.id) };
    const john = resolveBossAction('send-bouncer', preview(withJohn, withJohn.lastConfig, 2), withJohn);

    const withCaramel = club({ reputation: 100, baseCapacity: 200, staff: [...STARTING_ROSTER.map((m) => ({ ...m })), bouncer('bnc-kareem', 50)] });
    withCaramel.lastConfig = { ...busyCfg, staffOnDuty: withCaramel.staff.map((m) => m.id) };
    const caramel = resolveBossAction('send-bouncer', preview(withCaramel, withCaramel.lastConfig, 2), withCaramel);

    expect(caramel.intervention.vibeBonus).toBeGreaterThan(john.intervention.vibeBonus);
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
