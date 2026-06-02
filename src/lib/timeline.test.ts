/**
 * Tests for the witness-only timeline builder. It is presentation-only: pure,
 * deterministic, derived from an existing NightResult — no RNG, no mutation.
 */

import { defaultDayConfig, STARTING_ROSTER } from '@/domain/staff';
import type { ClubState, EventId, NightResult } from '@/domain/types';
import { buildTimeline } from './timeline';

function club(): ClubState {
  const staff = STARTING_ROSTER.map((m) => ({ ...m }));
  return {
    name: 'T', day: 3, cash: 2000, reputation: 50, baseCapacity: 100,
    ownedUpgradeIds: [], staff, lastConfig: { ...defaultDayConfig(staff) },
  };
}

function result(over: Partial<NightResult> = {}): NightResult {
  return {
    day: 3, guests: 60, capacity: 100, revenue: 800, costs: 400, net: 400,
    coverRevenue: 300, barRevenue: 500, vipBonus: 0, wages: 340, theft: 0, fines: 0,
    incidents: 0, noShows: 0, eventId: 'regular', eventCost: 0, bookingFee: 0,
    reputationBefore: 50, reputationAfter: 50, reputationDelta: 0,
    vipSatisfaction: 60, regularLoyalty: 60, serviceRatio: 1, notes: [],
    ...over,
  };
}

describe('buildTimeline', () => {
  it('is deterministic for the same result + club', () => {
    const c = club();
    expect(buildTimeline(result(), c)).toEqual(buildTimeline(result(), c));
  });

  it('produces 4–6 beats, always opening with Doors Open and ending with Last Call', () => {
    for (const over of [
      {},
      { incidents: 2, theft: 50 },
      { eventId: 'student-night' as EventId, serviceRatio: 0.6 },
      { noShows: 1, incidents: 1 },
    ]) {
      const beats = buildTimeline(result(over), club());
      expect(beats.length).toBeGreaterThanOrEqual(4);
      expect(beats.length).toBeLessThanOrEqual(6);
      expect(beats[0].title).toBe('Doors Open');
      expect(beats[beats.length - 1].title).toBe('Last Call');
    }
  });

  it('opens with an event-specific beat (distinct per event)', () => {
    const first = (e: EventId) => buildTimeline(result({ eventId: e }), club())[0].text;
    const texts = ['regular', 'private-party', 'student-night', 'grand-opening', 'industry-night'].map(
      (e) => first(e as EventId)
    );
    expect(new Set(texts).size).toBe(texts.length); // all five openers differ
  });

  it('maps the bar-pressure beat from serviceRatio', () => {
    const bar = (sr: number) => buildTimeline(result({ serviceRatio: sr }), club())[1];
    expect(bar(0.6).tone).toBe('bad');
    expect(bar(0.92).tone).toBe('warn');
    expect(bar(1).tone).toBe('good');
  });

  it('surfaces incident, theft, and no-show moments when relevant', () => {
    const text = (over: Partial<NightResult>) =>
      buildTimeline(result(over), club()).map((b) => b.text).join(' ');
    expect(text({ incidents: 1 })).toMatch(/scuffle|incidents/i);
    expect(text({ theft: 60 })).toMatch(/till|behind the bar/i);
    expect(text({ noShows: 1 })).toMatch(/no-show|short-handed/i);
    expect(text({ fines: 300 })).toMatch(/inspector|policy/i); // incidents 0 → compliance
  });

  it('reflects reputation gain/loss in Last Call', () => {
    const last = (d: number) => buildTimeline(result({ reputationDelta: d }), club()).at(-1)!.text;
    expect(last(4)).toMatch(/name grew/i);
    expect(last(-4)).toMatch(/took a knock/i);
    expect(last(0)).not.toMatch(/name grew|took a knock/i);
  });

  it('does not mutate its inputs', () => {
    const c = club();
    const r = result({ incidents: 1, theft: 20 });
    const cSnap = JSON.stringify(c);
    const rSnap = JSON.stringify(r);
    buildTimeline(r, c);
    expect(JSON.stringify(c)).toBe(cSnap);
    expect(JSON.stringify(r)).toBe(rSnap);
  });
});
