/**
 * Tests for the named-staff domain (Phase 2A). Covers the identity-point
 * aggregation, theft/no-show variance, costs, and scheduling/firing rules.
 */

import * as B from '@/domain/balance';
import { createRng } from '@/sim/rng';
import type { StaffMember } from './types';
import {
  aggregateOnDuty,
  canFireStaff,
  CANDIDATE_POOL,
  defaultDayConfig,
  hireCost,
  isValidSchedule,
  minViableNightCost,
  resolveTheft,
  STARTING_ROSTER,
  wagesForOnDuty,
} from './staff';

const ids = (r: StaffMember[]) => r.map((m) => m.id);
const find = (id: string) => CANDIDATE_POOL.find((m) => m.id === id)!;

describe('staff aggregation — identity point', () => {
  it('two skill-50 bartenders == two baseline service units', () => {
    const agg = aggregateOnDuty(STARTING_ROSTER, ids(STARTING_ROSTER), createRng(1));
    expect(agg.service).toBe(2 * B.SERVICE_PER_BARTENDER);
  });

  it('one skill-50 bouncer == old security level 1 (mod 1.0)', () => {
    const agg = aggregateOnDuty(STARTING_ROSTER, ids(STARTING_ROSTER), createRng(1));
    expect(agg.bouncerUnits).toBeCloseTo(1, 5);
    expect(B.bouncerSecurityMod(agg.bouncerUnits)).toBeCloseTo(1.0, 5);
  });

  it('bouncer units reproduce the old security tiers at 1/2/3', () => {
    expect(B.bouncerSecurityMod(1)).toBeCloseTo(1.0, 5);
    expect(B.bouncerSecurityMod(2)).toBeCloseTo(0.6, 5);
    expect(B.bouncerSecurityMod(3)).toBeCloseTo(0.35, 5);
    expect(B.bouncerSecurityMod(0)).toBeGreaterThan(1.0); // no door = riskier
  });

  it('the starting roster consumes NO rng (baseline stream is identical)', () => {
    const r1 = createRng(99);
    aggregateOnDuty(STARTING_ROSTER, ids(STARTING_ROSTER), r1);
    const r2 = createRng(99);
    expect(r1.next()).toBe(r2.next());
  });

  it('the starting roster has no no-shows and no theft', () => {
    const agg = aggregateOnDuty(STARTING_ROSTER, ids(STARTING_ROSTER), createRng(7));
    expect(agg.noShows).toBe(0);
    const theft = resolveTheft(agg.showedBartenders, 1000, createRng(7));
    expect(theft.theft).toBe(0);
  });
});

describe('costs & defaults', () => {
  it('starting wages reproduce the old fixed cost (~$340)', () => {
    expect(wagesForOnDuty(STARTING_ROSTER, ids(STARTING_ROSTER))).toBe(340);
  });

  it('minViableNightCost is the cheapest bartender salary', () => {
    expect(minViableNightCost(STARTING_ROSTER)).toBe(B.STARTING_BARTENDER_SALARY);
  });

  it('hireCost is salary times the multiplier', () => {
    const c = find('bar-vince');
    expect(hireCost(c)).toBe(Math.round(c.salary * B.HIRE_COST_MULT));
  });

  it('default day config puts everyone on duty on a Regular Night', () => {
    const cfg = defaultDayConfig(STARTING_ROSTER);
    expect(cfg.staffOnDuty).toEqual(ids(STARTING_ROSTER));
    expect(cfg.eventId).toBe('regular');
  });
});

describe('scheduling & firing rules', () => {
  it('rejects schedules with no bartender, duplicates, or unknown ids', () => {
    expect(isValidSchedule(STARTING_ROSTER, ['bnc-dimitri'])).toBe(false); // no bartender
    expect(isValidSchedule(STARTING_ROSTER, ['bar-rosa', 'bar-rosa'])).toBe(false); // dup
    expect(isValidSchedule(STARTING_ROSTER, ['ghost'])).toBe(false); // unknown
    expect(isValidSchedule(STARTING_ROSTER, ['bar-rosa', 'bnc-dimitri'])).toBe(true);
  });

  it('cannot fire the last bartender but can fire a bouncer', () => {
    const oneBartender: StaffMember[] = STARTING_ROSTER.filter((m) => m.id !== 'bar-milo');
    expect(canFireStaff(oneBartender, 'bar-rosa')).toBe(false); // last bartender
    expect(canFireStaff(STARTING_ROSTER, 'bar-rosa')).toBe(true); // two bartenders
    expect(canFireStaff(STARTING_ROSTER, 'bnc-dimitri')).toBe(true);
    expect(canFireStaff(STARTING_ROSTER, 'ghost')).toBe(false);
  });
});

describe('theft & no-show variance (the hiring gamble)', () => {
  it('a dishonest bartender sometimes skims, an honest one never does', () => {
    const thief = find('bar-vince'); // honesty 45 + sticky-fingers
    const honest = STARTING_ROSTER[0]; // honesty 100
    let thiefHits = 0;
    let honestHits = 0;
    for (let seed = 0; seed < 200; seed++) {
      if (resolveTheft([thief], 1000, createRng(seed)).theft > 0) thiefHits++;
      if (resolveTheft([honest], 1000, createRng(seed)).theft > 0) honestHits++;
    }
    expect(thiefHits).toBeGreaterThan(0);
    expect(honestHits).toBe(0);
  });

  it('an unreliable hire sometimes no-shows; reliable crew never does', () => {
    const flaky = find('bnc-pavel'); // reliability 70 + flaky
    let flakyNoShows = 0;
    let reliableNoShows = 0;
    for (let seed = 0; seed < 200; seed++) {
      flakyNoShows += aggregateOnDuty([flaky], ['bnc-pavel'], createRng(seed)).noShows;
      reliableNoShows += aggregateOnDuty(STARTING_ROSTER, ids(STARTING_ROSTER), createRng(seed)).noShows;
    }
    expect(flakyNoShows).toBeGreaterThan(0);
    expect(reliableNoShows).toBe(0);
  });
});
