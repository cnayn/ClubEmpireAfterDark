/**
 * Tests for the events domain (Phase 2B): catalog neutrality, unlock pacing,
 * requirement gates, readiness advisory, and that the modifier vector moves the
 * resolved night in the intended direction.
 */

import {
  effectiveBookingFee,
  eventReadiness,
  eventRequirement,
  EVENTS,
  getEvent,
  isUnlocked,
  unlockedEvents,
} from '@/domain/events';
import { defaultDayConfig, STARTING_ROSTER } from '@/domain/staff';
import type { ClubState, DayConfig, EventId } from '@/domain/types';
import { resolveNight } from '@/sim/night';

function club(overrides: Partial<ClubState> = {}): ClubState {
  const staff = STARTING_ROSTER.map((m) => ({ ...m }));
  return {
    name: 'T',
    day: 1,
    cash: 5000,
    reputation: 60,
    baseCapacity: 100,
    ownedUpgradeIds: [],
    staff,
    lastConfig: defaultDayConfig(staff),
    ...overrides,
  };
}

const cfg = (c: ClubState, eventId: EventId): DayConfig => ({
  ...defaultDayConfig(c.staff),
  eventId,
  coverLevel: 'med',
  drinkLevel: 'med',
});

describe('catalog', () => {
  it('Quiet Night is the all-neutral identity vector', () => {
    const q = EVENTS.regular;
    expect([q.drawMod, q.spendMod, q.repAmplify]).toEqual([1, 1, 1]);
    expect([q.riskMod, q.repMod, q.cost, q.bookingFee]).toEqual([0, 0, 0, 0]);
  });
});

describe('unlock pacing (reputation tier OR milestone only)', () => {
  it('Night 1 shows only Quiet Night', () => {
    expect(unlockedEvents(club({ day: 1, reputation: 20 })).map((e) => e.id)).toEqual(['regular']);
  });
  it('Private Party unlocks after Night 1; Student Night after Night 3', () => {
    expect(isUnlocked(club({ day: 2, reputation: 20 }), 'private-party')).toBe(true);
    expect(isUnlocked(club({ day: 3, reputation: 20 }), 'student-night')).toBe(false);
    expect(isUnlocked(club({ day: 4, reputation: 20 }), 'student-night')).toBe(true);
  });
  it('Grand Opening & Industry unlock at Rising Name (rep 40)', () => {
    const below = club({ day: 9, reputation: 39 });
    const at = club({ day: 9, reputation: 40 });
    expect(isUnlocked(below, 'grand-opening')).toBe(false);
    expect(isUnlocked(below, 'industry-night')).toBe(false);
    expect(isUnlocked(at, 'grand-opening')).toBe(true);
    expect(isUnlocked(at, 'industry-night')).toBe(true);
  });
  it('the early loop (Quiet + Private + Student) is reachable without Rising Name', () => {
    const ids = unlockedEvents(club({ day: 4, reputation: 25 })).map((e) => e.id);
    expect(ids).toEqual(['regular', 'private-party', 'student-night']);
  });
});

describe('requirement (reserve-aware affordability; the only hard block)', () => {
  it('free events are always met', () => {
    expect(eventRequirement(club({ cash: 0 }), 'regular').met).toBe(true);
    expect(eventRequirement(club({ cash: 0 }), 'private-party').met).toBe(true);
  });
  it('a paid event blocks when cash cannot cover fee + a minimum next night', () => {
    expect(eventRequirement(club({ cash: 500 }), 'grand-opening').met).toBe(false); // 600 + reserve
    expect(eventRequirement(club({ cash: 5000 }), 'grand-opening').met).toBe(true);
  });
});

describe('readiness (advisory only — never blocks)', () => {
  it('warns (weak) when understaffed for a high-draw event', () => {
    const c = club({ reputation: 90 });
    const oneBartender = [c.staff.find((m) => m.role === 'bartender')!.id];
    const r = eventReadiness(c, { ...cfg(c, 'student-night'), staffOnDuty: oneBartender });
    expect(r.level).toBe('weak');
    expect(r.messages.length).toBeGreaterThan(0);
  });
  it('does not flag weak when the crew comfortably covers the night', () => {
    const c = club({ reputation: 30 });
    const r = eventReadiness(c, cfg(c, 'regular'));
    expect(r.level).not.toBe('weak');
  });
});

describe('effectiveBookingFee (Private Party is conditional, not guaranteed)', () => {
  const pp = EVENTS['private-party'];
  const clean = { serviceRatio: 1, incidents: 0, noShows: 0, theft: 0 };

  it('pays the full fee for a clean, well-run night', () => {
    expect(effectiveBookingFee(pp, clean)).toBe(pp.bookingFee);
  });

  it('is zero for events without a booking fee (Quiet et al. unaffected)', () => {
    expect(effectiveBookingFee(EVENTS.regular, clean)).toBe(0);
    expect(effectiveBookingFee(EVENTS['student-night'], { ...clean, incidents: 3 })).toBe(0);
  });

  it('docks the fee for incidents, no-shows, theft, and weak service', () => {
    expect(effectiveBookingFee(pp, { ...clean, incidents: 1 })).toBeLessThan(pp.bookingFee);
    expect(effectiveBookingFee(pp, { ...clean, noShows: 1 })).toBeLessThan(pp.bookingFee);
    expect(effectiveBookingFee(pp, { ...clean, theft: 40 })).toBeLessThan(pp.bookingFee);
    expect(effectiveBookingFee(pp, { ...clean, serviceRatio: 0.5 })).toBeLessThan(pp.bookingFee);
  });

  it('can go negative (refund + damages) on a badly executed night', () => {
    expect(effectiveBookingFee(pp, { serviceRatio: 0.4, incidents: 2, noShows: 1, theft: 50 })).toBeLessThan(0);
  });
});

describe('resolver applies the modifier vector directionally', () => {
  const c = club({ reputation: 60 });
  const run = (id: EventId, seed = 7) => resolveNight(c, cfg(c, id), seed).result;

  it('Student Night draws a bigger crowd than Quiet', () => {
    expect(run('student-night').guests).toBeGreaterThan(run('regular').guests);
  });
  it('Private Party pays a (conditional) booking fee and pulls a smaller crowd', () => {
    const p = run('private-party');
    expect(p.bookingFee).toBeGreaterThan(0); // a clean night keeps the fee
    expect(p.bookingFee).toBeLessThanOrEqual(EVENTS['private-party'].bookingFee);
    expect(p.guests).toBeLessThan(run('regular').guests);
  });
  it('Grand Opening charges a big upfront cost and packs the room', () => {
    const g = run('grand-opening');
    expect(g.eventCost).toBe(850);
    expect(g.guests).toBeGreaterThan(run('regular').guests);
  });
  it('Industry Night curates a smaller crowd and carries a cost', () => {
    const i = run('industry-night');
    expect(i.guests).toBeLessThan(run('regular').guests);
    expect(i.eventCost).toBe(250);
  });
  it('carries the eventId into the result and is deterministic per seed', () => {
    expect(run('student-night').eventId).toBe('student-night');
    expect(resolveNight(c, cfg(c, 'grand-opening'), 5).result).toEqual(
      resolveNight(c, cfg(c, 'grand-opening'), 5).result
    );
  });
});
