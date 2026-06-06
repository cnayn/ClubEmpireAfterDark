/**
 * Phone Inbox v1 — pure, derived, deterministic. No persistence, no RNG, no
 * backend; safe on old saves (optional fields default).
 */

import { defaultDayConfig, STARTING_ROSTER } from '@/domain/staff';
import type { ClubState, DayConfig, NightResult, StaffMember } from '@/domain/types';
import { buildInbox, inboxCount } from './phone';

function club(over: Partial<ClubState> = {}): ClubState {
  const staff = STARTING_ROSTER.map((m) => ({ ...m }));
  return {
    name: 'T', day: 4, cash: 3000, reputation: 50, baseCapacity: 60,
    ownedUpgradeIds: [], staff, lastConfig: defaultDayConfig(staff), ...over,
  };
}
const cfg = (over: Partial<DayConfig> = {}): DayConfig => ({ ...defaultDayConfig(STARTING_ROSTER), ...over });
function result(over: Partial<NightResult> = {}): NightResult {
  return {
    day: 4, guests: 30, capacity: 60, revenue: 600, costs: 300, net: 300,
    coverRevenue: 200, barRevenue: 400, vipBonus: 0, wages: 340, theft: 0, fines: 0,
    incidents: 0, noShows: 0, eventId: 'regular', eventCost: 0, bookingFee: 0,
    reputationBefore: 50, reputationAfter: 50, reputationDelta: 0,
    vipSatisfaction: 60, regularLoyalty: 60, serviceRatio: 1, notes: [], ...over,
  };
}
const bouncer = (id: string): StaffMember => ({
  id, name: id, role: 'bouncer', salary: 100, skill: 50,
  honesty: 100, reliability: 100, visibleTrait: 'none', hiddenTrait: 'none', description: '',
});
describe('buildInbox — derived from state', () => {
  it('a strained bar produces a bar-related message', () => {
    const msgs = buildInbox(club(), result({ serviceRatio: 0.5 }));
    expect(msgs.some((m) => m.id === 'crew-bar' || m.id === 'guest-bar' || m.id === 'warn-bar')).toBe(true);
  });

  it('an incident produces a door-related message', () => {
    const msgs = buildInbox(club(), result({ incidents: 2 }));
    expect(msgs.some((m) => m.category === 'warning' || m.id === 'guest-door' || m.id.startsWith('crew-'))).toBe(true);
    expect(msgs.some((m) => m.id === 'warn-door' || m.id === 'guest-door')).toBe(true);
  });

  it('a styled, clean club produces a positive guest message', () => {
    const c = club({ venue: { owned: ['neon-sign', 'velvet-rope'], equipped: { entrance: ['neon-sign', 'velvet-rope'] } } });
    const msgs = buildInbox(c, result({ incidents: 0, serviceRatio: 1 }));
    // looks-good guest line appears when the room is sharp and the night was clean
    expect(msgs.some((m) => m.id === 'guest-look') || buildInbox(c, null).some((m) => m.id === 'guest-look')).toBe(true);
  });

  it('low cash surfaces a booking/supplier opportunity', () => {
    const msgs = buildInbox(club({ cash: 200 }), result());
    expect(msgs.some((m) => m.category === 'booking' || m.category === 'supplier')).toBe(true);
  });

  it('Caramel on the roster can produce a Caramel crew message after trouble', () => {
    const c = club({ staff: [...STARTING_ROSTER.map((m) => ({ ...m })), bouncer('bnc-kareem')] });
    const msgs = buildInbox(c, result({ incidents: 1 }));
    expect(msgs.some((m) => m.id === 'crew-caramel' && m.sender === 'Caramel')).toBe(true);
  });

  it('is deterministic for the same state', () => {
    const c = club({ day: 6 });
    expect(buildInbox(c, result({ incidents: 1, serviceRatio: 0.6 }))).toEqual(
      buildInbox(c, result({ incidents: 1, serviceRatio: 0.6 }))
    );
  });

  it('a brand-new club (day 1, no night played) has a quiet phone (#9)', () => {
    expect(buildInbox(club({ day: 1 }), null)).toEqual([]);
  });

  it('once the club has run a night, the inbox populates and never exceeds six', () => {
    const played = buildInbox(club({ day: 2 }), result());
    expect(played.length).toBeGreaterThan(0);
    expect(played.length).toBeLessThanOrEqual(6);
  });

  it('works on an old save missing optional config/venue fields', () => {
    const legacy = club();
    delete (legacy as { venue?: unknown }).venue;
    delete (legacy.lastConfig as { policies?: unknown }).policies;
    delete (legacy.lastConfig as { drinkPrep?: unknown }).drinkPrep;
    expect(() => buildInbox(legacy, null)).not.toThrow();
    expect(inboxCount(legacy, null)).toBe(buildInbox(legacy, null).length);
  });

  it('every message carries a sender, title, and body; actions have a route', () => {
    for (const m of buildInbox(club({ cash: 200 }), result({ incidents: 1, serviceRatio: 0.5 }))) {
      expect(m.sender.length).toBeGreaterThan(0);
      expect(m.title.length).toBeGreaterThan(0);
      expect(m.body.length).toBeGreaterThan(0);
      if (m.actionLabel) expect(m.route).toBeTruthy();
    }
  });
});
