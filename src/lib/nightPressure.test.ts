/**
 * Living Floor Loop v1 — pure live pressure reads. Presentation only; the books
 * still come from the deterministic resolver.
 */

import { defaultDayConfig, STARTING_ROSTER } from '@/domain/staff';
import type { ClubState, DayConfig, NightResult } from '@/domain/types';
import { encounterTrigger, liveEmotes, livePressures, livingStreamTicks, pressureHeadline } from './nightPressure';

const ALL = STARTING_ROSTER.map((m) => m.id);
const BARTENDERS = STARTING_ROSTER.filter((m) => m.role === 'bartender').map((m) => m.id);

function club(over: Partial<ClubState> = {}): ClubState {
  const staff = STARTING_ROSTER.map((m) => ({ ...m }));
  return {
    name: 'T', day: 4, cash: 1500, reputation: 50, baseCapacity: 60,
    ownedUpgradeIds: [], staff, lastConfig: defaultDayConfig(staff), ...over,
  };
}
function result(over: Partial<NightResult> = {}): NightResult {
  return {
    day: 4, guests: 40, capacity: 60, revenue: 800, costs: 500, net: 300,
    coverRevenue: 200, barRevenue: 560, vipBonus: 0, wages: 340, theft: 0, fines: 0,
    incidents: 0, noShows: 0, eventId: 'regular', eventCost: 0, bookingFee: 0,
    reputationBefore: 50, reputationAfter: 52, reputationDelta: 2,
    vipSatisfaction: 60, regularLoyalty: 60, serviceRatio: 1, notes: [], ...over,
  };
}

describe('livePressures', () => {
  it('all meters stay within 0..1 across the night', () => {
    const c = club();
    for (let p = 0; p <= 1.0001; p += 0.1) {
      const pr = livePressures(result(), c, p);
      for (const v of [pr.crowd, pr.bar, pr.door, pr.bathroom, pr.energy]) {
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(1);
      }
    }
  });

  it('the crowd meter fills as the night runs', () => {
    const c = club();
    expect(livePressures(result(), c, 0.1).crowd).toBeLessThan(livePressures(result(), c, 0.75).crowd);
  });

  it('a strained bar reads higher bar pressure at the peak', () => {
    const c = club();
    const healthy = livePressures(result({ serviceRatio: 1 }), c, 0.75).bar;
    const strained = livePressures(result({ serviceRatio: 0.4 }), c, 0.75).bar;
    expect(strained).toBeGreaterThan(healthy);
  });

  it('an incident raises door pressure', () => {
    const c = club();
    expect(livePressures(result({ incidents: 2 }), c, 0.6).door).toBeGreaterThan(
      livePressures(result({ incidents: 0 }), c, 0.6).door
    );
  });
});

describe('pressureHeadline', () => {
  it('surfaces the dominant strain with its zone', () => {
    expect(pressureHeadline({ crowd: 0.9, bar: 0.2, door: 0.9, bathroom: 0.2, energy: 0.6 }).zone).toBe('door');
    expect(pressureHeadline({ crowd: 0.9, bar: 0.9, door: 0.2, bathroom: 0.2, energy: 0.6 }).zone).toBe('bar');
    expect(pressureHeadline({ crowd: 0.1, bar: 0.1, door: 0.1, bathroom: 0.1, energy: 0.6 }).label.toLowerCase()).toContain('quiet');
  });
});

describe('encounterTrigger', () => {
  it('fires earlier for the bar than the door', () => {
    expect(encounterTrigger('bar')).toBeLessThan(encounterTrigger('door'));
  });
});

describe('liveEmotes — emotes surface only once a zone is under pressure', () => {
  it('a calm room (no pressure) shows fewer emotes than a busy one', () => {
    const c = club();
    const r = result({ guests: 50, capacity: 60, serviceRatio: 0.5, incidents: 1 });
    const calm = liveEmotes(r, c, { crowd: 0.1, bar: 0.1, door: 0.1, bathroom: 0.1, energy: 0.6 });
    const busy = liveEmotes(r, c, { crowd: 0.9, bar: 0.9, door: 0.9, bathroom: 0.9, energy: 0.4 });
    expect(busy.length).toBeGreaterThanOrEqual(calm.length);
  });
});

describe('livingStreamTicks — the floor narrates itself as the clock runs', () => {
  it('reveals more ticks as the night progresses, and is ordered + deterministic', () => {
    const c = club();
    const r = result();
    const early = livingStreamTicks(r, c, 0.1);
    const late = livingStreamTicks(r, c, 0.95);
    expect(late.length).toBeGreaterThanOrEqual(early.length);
    expect(late).toEqual(livingStreamTicks(r, c, 0.95)); // deterministic
    const ats = late.map((t) => t.at);
    expect([...ats].sort((a, b) => a - b)).toEqual(ats); // ordered
    expect(late.some((t) => t.id === 'doors')).toBe(true);
    expect(late.some((t) => t.id === 'lastcall')).toBe(true);
  });

  it('a strained bar produces a bar-pressure tick', () => {
    const c = club();
    const ticks = livingStreamTicks(result({ serviceRatio: 0.5 }), c, 1);
    expect(ticks.some((t) => t.zone === 'bar' && t.tone === 'warn')).toBe(true);
  });
});
